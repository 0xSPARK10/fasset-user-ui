import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { SessionTypes } from "@walletconnect/types";
import { WalletConnectModal } from "@walletconnect/modal";
import UniversalProvider, { ConnectParams } from "@walletconnect/universal-provider";
import { ethers, JsonRpcSigner } from "ethers";
import { getAccountsFromNamespaces } from "@walletconnect/utils";
import { useConnectedCoin } from "@/store/coin";
import { ETH_NAMESPACE, XRP_NAMESPACE } from "@/config/networks";
import { COINS } from "@/config/coin";
import { INetwork } from "@/types";
import { WALLET } from "@/constants";

export interface IWalletConnectConnector {
    connect: (networks: INetwork[]) => Promise<boolean>;
    disconnect: (redirect?: boolean) => Promise<void>;
    isInitializing: boolean;
    hasCheckedPersistedSession: boolean;
    session: SessionTypes.Struct | undefined;
    fetchUtxoAddresses: (namespace: string, chainId: string, account: string) => Promise<void>;
    universalProvider: UniversalProvider | undefined;
    web3Modal: WalletConnectModal | undefined;
    init: () => void;
    request: ({ chainId, method, params }: { chainId: string, method: string, params: any }) => Promise<any>;
    getSigner: () => Promise<JsonRpcSigner>;
    connectedWallet: string | undefined;
}

export default function WalletConnectConnector(): IWalletConnectConnector {
    const [session, setSession] = useState<SessionTypes.Struct>();
    const [universalProvider, setUniversalProvider] = useState<UniversalProvider>();
    const isInitializing = useRef(false);
    const [web3Modal, setWeb3Modal] = useState<WalletConnectModal>();
    const [hasCheckedPersistedSession, setHasCheckedPersistedSession] = useState<boolean>(false);

    const { addConnectedCoin, removeConnectedCoin, localConnectedCoins, updateConnectedCoin } = useConnectedCoin();
    const queryClient = useQueryClient();
    const router = useRouter();
    const connectedWallet = session ? session.peer.metadata.name : undefined;

    const connect = async(networks: INetwork[]) => {
        try {
            if (!universalProvider) {
                throw new ReferenceError('WalletConnect Client is not initialized.');
            }

            localConnectedCoins
                .filter(coin => coin.connectedWallet === WALLET.WALLET_CONNECT)
                .forEach(coin => removeConnectedCoin(coin.address!));

            const connectionParams: ConnectParams = { optionalNamespaces: {} };
            networks.forEach(network => {
                let existingNamespaces = connectionParams.optionalNamespaces![network.namespace] || {};
                if ('chains' in existingNamespaces && !existingNamespaces.chains.includes(getFullNamespace(network))) {
                    existingNamespaces.chains.push(getFullNamespace(network));
                } else {
                    existingNamespaces = {
                        methods: network.methods,
                        chains: [getFullNamespace(network)],
                        events: ['accountsChanged', 'bip122_addressesChanged']
                    }
                }

                if (network.addRpcMap) {
                    existingNamespaces.rpcMap = { ...existingNamespaces.rpcMap, [network.chainId]: network.rpcUrl };
                }

                connectionParams.optionalNamespaces![network.namespace] = existingNamespaces;
            });

            const providerSession = await universalProvider.connect(connectionParams);
            if (providerSession) {
                COINS.forEach(coin => {
                    if (coin.enabled) {
                        const fullNamespace = getFullNamespace(coin.network);
                        const accounts = getAccountsFromNamespaces(providerSession.namespaces, [coin.network.namespace]);
                        const account = accounts.find(a => a.indexOf(fullNamespace) > -1);
                        if (account) {
                            const address = account.replace(fullNamespace + ':', '');
                            const exists = useConnectedCoin.getState().localConnectedCoins.find(coin => coin.address === address);
                            if (!exists) {
                                addConnectedCoin({
                                    type: coin.type,
                                    address: coin?.network?.namespace === ETH_NAMESPACE
                                        ? ethers.getAddress(address)
                                        : address,
                                    connectedWallet: WALLET.WALLET_CONNECT
                                });
                            }
                        }
                    }
                });
                setSession(providerSession);
                web3Modal?.closeModal();
                return true;
            }

            web3Modal?.closeModal();
            return false;
        } catch (error) {
            throw error;
        }
    }

    const disconnect = async(redirect: boolean = true) => {
        if (universalProvider?.session) {
            await universalProvider?.disconnect();
        }

        setSession(undefined);
        useConnectedCoin.getState().localConnectedCoins
            .filter(coin => coin.connectedWallet === WALLET.WALLET_CONNECT)
            .forEach(coin => removeConnectedCoin(coin.address!));

        if (useConnectedCoin.getState().localConnectedCoins.length === 0) {
            queryClient.clear();
            queryClient.invalidateQueries();

            if (redirect) {
                await router.push('/');
            }
        }
    }

    const getFullNamespace = (network: INetwork) => `${network.namespace}:${network.chainId}`;

    const createClient = async () => {
        try {
            isInitializing.current = true;

            if (!process.env.WALLETCONNECT_PROJECT_ID) return;

            const provider = await UniversalProvider.init({
                projectId: process.env.WALLETCONNECT_PROJECT_ID,
                metadata: {
                    name: 'FAssets',
                    description: 'FAssets',
                    url: process.env.APP_URL || window.location.origin,
                    icons: ['https://avatars.githubusercontent.com/u/37784886']
                },
            });
            let chains: string[] = [];
            COINS.forEach(c => {
                if (c.enabled) {
                    chains = [...chains, getFullNamespace(c.network)]
                }
            });

            const web3Modal = new WalletConnectModal({
                projectId: process.env.WALLETCONNECT_PROJECT_ID,
                chains: chains,
                themeVariables: {
                    '--wcm-z-index': '100',
                },
                explorerRecommendedWalletIds: ['37a686ab6223cd42e2886ed6e5477fce100a4fb565dcd57ed4f81f7c12e93053'],
            });

            setUniversalProvider(provider);
            setWeb3Modal(web3Modal);
        } catch (error) {
            throw error;
        } finally {
            isInitializing.current = false;
        }
    };

    const subscribeToProviderEvents = async (client: UniversalProvider) => {
        if (typeof client === "undefined") {
            throw new Error("WalletConnect is not initialized");
        }

        client.on('display_uri', async (uri: string) => {
            web3Modal?.openModal({ uri });
        });
        client.on(
            'session_update',
            ({ topic, session }: { topic: string; session: SessionTypes.Struct }) => {
                setSession(session);
            },
        );
        client.on('session_delete', ({ id, topic }: { id: number; topic: string }) => {
            disconnect();
        });
        client.on('session_expire', ({ topic }: { topic: string }) => {
            disconnect();
        });
    };

    const parseDerivationPath = (items: { address: string, path: string }[]) => {
        let account: string|undefined = undefined;
        const receiveAddresses: string[] = [];
        const changeAddresses: string[] = [];

        items.forEach((item, index) => {
            if (index === 0) {
                account = item.address;
            } else {
                const path = item.path.split('/');
                if (path.length > 3 && path[4] === "0") {
                    receiveAddresses.push(item.address);
                } else if (path.length > 3 && path[4] === "1") {
                    changeAddresses.push(item.address);
                }
            }
        });

        return {
            account: account,
            receiveAddresses: receiveAddresses,
            changeAddresses: changeAddresses,
        }
    }

    const onSessionConnected = async (providerSession: SessionTypes.Struct) => {
        if (!universalProvider) {
            throw new ReferenceError("UniversalProvider is not initialized.");
        }

        setSession(providerSession);
        const now = new Date();
        const sessionExpiry = new Date(providerSession.expiry * 1000);
        if (sessionExpiry < now) {
            await disconnect();
            if (useConnectedCoin.getState().localConnectedCoins.length === 0) {
                queryClient.clear();
                queryClient.invalidateQueries();
                router.push('/');
            }
        }
    };

    const checkForPersistedSession = async (provider: UniversalProvider) => {
        if (typeof provider === "undefined") {
            throw new Error("WalletConnect is not initialized");
        }
        if (provider?.session) {
            await onSessionConnected(provider?.session);
        }
    };

    const fetchUtxoAddresses = async(namespace: string, chainId: string, accountAddress: string, reset: boolean = false) => {
        try {
            const response = await universalProvider?.client?.request({
                chainId: `${namespace}:${chainId}`,
                topic: universalProvider?.session?.topic ?? '',
                request: {
                    method: "getAccountAddresses",
                    params: {
                        account: accountAddress,
                    }
                },
            }) as any;

            const { account, receiveAddresses, changeAddresses } = parseDerivationPath(response);
            if (account) {
                const coin = useConnectedCoin.getState().localConnectedCoins.find(coin => coin.address === account);
                if (coin) {
                    updateConnectedCoin(account, {
                        ...coin,
                        accountAddresses: {
                            receiveAddresses: receiveAddresses,
                            changeAddresses: changeAddresses,
                        }
                    });
                }
            }
        } catch (error) {
            if (reset) {
                disconnect();
            }

            throw error;
        }
    }

    const init = async() => {
        if (isInitializing.current) return;
        await createClient();
    }

    const request = async({ chainId, method, params }: { chainId: string, method: string, params: any }) => {
        const [namespace, id] = chainId.split(':');
        return universalProvider?.client?.request({
            chainId: chainId,
            topic: universalProvider?.session?.topic ?? '',
            request: {
                method: method,
                params: namespace === XRP_NAMESPACE
                    ? {
                        tx_json: params
                    }
                    : params
            },
        });
    }

    const getSigner = async() => {
        return new ethers.BrowserProvider(universalProvider!).getSigner();
    }

    useEffect(() => {
        if (universalProvider && web3Modal) {
            subscribeToProviderEvents(universalProvider);
        }
    }, [universalProvider, web3Modal]);

    useEffect(() => {
        const getPersistedSession = async () => {
            if (!universalProvider) return;
            await checkForPersistedSession(universalProvider);
            setHasCheckedPersistedSession(true);
        };

        if (universalProvider && !hasCheckedPersistedSession) {
            getPersistedSession();
        }
    }, [universalProvider, checkForPersistedSession, hasCheckedPersistedSession]);

    useEffect(() => {
        if (!universalProvider) return;

        subscribeToProviderEvents(universalProvider);
        const getPersistedSession = async () => {
            await checkForPersistedSession(universalProvider);
            setHasCheckedPersistedSession(true);
        };

        if (!hasCheckedPersistedSession) {
            getPersistedSession();
        }
    }, [universalProvider]);

    return {
        connect: connect,
        disconnect: disconnect,
        isInitializing: isInitializing.current,
        hasCheckedPersistedSession: hasCheckedPersistedSession,
        session: session,
        fetchUtxoAddresses: fetchUtxoAddresses,
        universalProvider: universalProvider,
        web3Modal: web3Modal,
        init: init,
        request: request,
        getSigner: getSigner,
        connectedWallet: connectedWallet
    }
}
