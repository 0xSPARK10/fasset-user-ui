import { useEffect } from "react";
import { WALLET } from "@/constants";
import { useConnectedCoin } from "@/store/coin";
import { ethers, JsonRpcSigner } from "ethers";
import { BRIDGE_COINS, COINS, HYPE, TEST_HYPE } from "@/config/coin";
import { ICoin } from "@/types";

export interface IMetaMaskConnector {
    connect: () => Promise<boolean>;
    disconnect: () => Promise<void>;
    getSigner: (token?: ICoin) => Promise<JsonRpcSigner>;
    request: ({ chainId, method, params }: { chainId: string, method: string, params: any }) => Promise<any>;
}

export default function MetaMaskConnector(): IMetaMaskConnector {
    const { addConnectedCoin, localConnectedCoins, removeConnectedCoin, updateConnectedCoin } = useConnectedCoin();
    const mainToken = COINS.find(coin => !coin.isFAssetCoin && !coin.isStableCoin && coin.enabled && coin.isMainToken);

    useEffect(() => {
        if (localConnectedCoins.length === 0) return;
        const isConnected = localConnectedCoins.filter(coin => coin.connectedWallet === WALLET.META_MASK).length > 0;
        if (!isConnected) return;

        //@ts-ignore
        const ethereum = window.ethereum;
        ethereum.on('accountsChanged', (accounts: string[]) => {
            const connectedCoins = localConnectedCoins.filter(coin => coin.address === ethers.getAddress(accounts[1]));
            connectedCoins.forEach(connectedCoin => {
                updateConnectedCoin(ethers.getAddress(accounts[1]), {
                    ...connectedCoin,
                    address: ethers.getAddress(accounts[0])
                });
            });
        })
    }, [localConnectedCoins]);

    const getAccounts = async() => {
        //@ts-ignore
        const ethereum = window.ethereum;

        await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: `0x${Number(mainToken?.network?.chainId!).toString(16)}`,
                rpcUrls: [mainToken?.network?.rpcUrl],
                chainName: mainToken?.network?.name,
                nativeCurrency: {
                    name: mainToken?.nativeName,
                    symbol: mainToken?.type,
                    decimals: 18
                }
            }]
        });
        if (ethereum.providers && ethereum.providers.length > 1) {
            const provider = ethereum.providers.find((provider: { isMetaMask: boolean; }) => provider.isMetaMask);
            return await provider.request({
                method: "eth_requestAccounts",
            });
        }

        if (ethereum.isMetaMask) {
            return await ethereum.request({
                method: "eth_requestAccounts",
            });
        }

        return [];
    }

    const connect = async() => {
        //@ts-ignore
        const ethereum = window.ethereum;
        if (!ethereum) {
            window.open('https://metamask.io');
            return false;
        }

        try {
            const accounts = await getAccounts();
            if (accounts.length > 0 && mainToken && mainToken.enabled) {
                addConnectedCoin({
                    type: mainToken.type,
                    address: ethers.getAddress(accounts[0]),
                    connectedWallet: WALLET.META_MASK
                });

                return true;
            }
        } catch (error: any) {
            throw error;
        }

        return false;
    }

    const disconnect = async() => {
        localConnectedCoins
            .filter(coin => coin.connectedWallet === WALLET.META_MASK)
            .forEach(coin => removeConnectedCoin(coin.address!));
    }

    const getSigner = async(token?: ICoin) => {
        if (!token) {
            token = mainToken!;
        }
        if (BRIDGE_COINS.includes(token)) {
            token = token?.network?.mainnet ? HYPE : TEST_HYPE;
        }

        //@ts-ignore
        const ethereum = window.ethereum;
        const chainId = await ethereum.request({ method: 'eth_chainId' });

        try {
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${Number(token?.network?.chainId!).toString(16)}` }]
            });
        } catch (error: any) {
            // 4902 = Unrecognized chain
            if (error?.code === 4902) {
                await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: `0x${Number(token?.network?.chainId!).toString(16)}`,
                        rpcUrls: [token?.network?.rpcUrl],
                        chainName: token?.network?.name,
                        nativeCurrency: {
                            name: token?.nativeName,
                            symbol: token?.type,
                            decimals: 18
                        }
                    }]
                });
            }
        }

        //@ts-ignore
        const provider = new ethers.BrowserProvider(window?.ethereum);
        return provider.getSigner();
    }

    const request = async({ chainId, method, params }: { chainId: string, method: string, params: any }) => {
        throw new Error("Unsupported")
    }

    return {
        connect: connect,
        disconnect: disconnect,
        getSigner: getSigner,
        request: request
    }
}
