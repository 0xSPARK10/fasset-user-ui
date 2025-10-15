import { useRef, useState } from "react";
import { Xumm } from "xumm";
import type { ResolvedFlow } from "xumm-oauth2-pkce";
import { WALLET } from "@/constants";
import { useConnectedCoin } from "@/store/coin";
import { FTEST_XRP, FXRP } from "@/config/coin";

export interface IXamanConnector {
    connect: () => Promise<boolean>;
    disconnect: () => Promise<void>;
    init: () => void;
    client: Xumm | undefined;
    getSigner: (address: string) => Promise<undefined>;
    request: ({ chainId, method, params }: { chainId: string, method: string, params: any }) => Promise<any>;
}

export default function XamanConnector(): IXamanConnector {
    const isInitialized = useRef(false);
    const [client, setClient] = useState<Xumm>();
    const { addConnectedCoin, removeConnectedCoin, localConnectedCoins } = useConnectedCoin();

    const connect = async () => {
        try {
            if (!client) {
                throw new ReferenceError('Xaman client is not initialized.');
            }

            localConnectedCoins
                .filter(coin => coin.connectedWallet === WALLET.XAMAN)
                .forEach(coin => removeConnectedCoin(coin.address!));

            const response: ResolvedFlow | Error | undefined = await client.authorize();
            if (!response || response instanceof Error) {
                return false;
            }
            return true;
        } catch (error: any) {
            return false;
        }
    }

    const disconnect = async () => {
        await client?.logout();
        useConnectedCoin.getState().localConnectedCoins
            .filter(coin => coin.connectedWallet === WALLET.XAMAN)
            .forEach(coin => removeConnectedCoin(coin.address!));
    }

    const createClient = async () => {
        try {
            if (!process.env.XAMAN_API_KEY) return;

            const xumm = new Xumm(process.env.XAMAN_API_KEY as string);

            xumm.on('ready', async () => {
                const isConnected = useConnectedCoin.getState().localConnectedCoins.find(coin => coin.connectedWallet === WALLET.XAMAN) !== undefined;
                if (isConnected && !xumm.state.signedIn) {
                    disconnect();
                }
            });
            xumm.on('logout', () => {
                disconnect();
            });
            xumm.on('success', () => {
                xumm.user.account.then(account => {
                    const isConnected = useConnectedCoin.getState().localConnectedCoins.find(coin => coin.connectedWallet === WALLET.XAMAN) !== undefined;
                    if (!isConnected) {
                        history.replaceState(null, "", window.location.pathname + window.location.hash);

                        addConnectedCoin({
                            type: FXRP.enabled ? FXRP.type : FTEST_XRP.type,
                            address: account!,
                            connectedWallet: WALLET.XAMAN
                        });
                    }
                })

            });

            setClient(xumm);
            isInitialized.current = true;
        } catch (error: any) {
            throw error;
        }
    }

    const init = async() => {
        if (isInitialized.current) return;
        createClient();
    }

    const getSigner = async (userAddress: string) => {
        return undefined;
    }

    const request = async({ chainId, method, params }: { chainId: string, method: string, params: any }) => {
         return client?.payload?.createAndSubscribe({
            txjson: params
        }, eventMessage => {
            if ('signed' in eventMessage.data) {
                return eventMessage;
            }
        })
             // @ts-ignore
            .then(({ created, resolved }) => {
                window.open(created.next.always, '_blank');
                return resolved;
        })
            .then(payload => {
                if (!payload.data.signed) {
                    const error = new Error('User rejected the request');
                    (error as any).code = 4005;
                    throw error;
                }

                return {
                    tx_json: {
                        hash: payload.data.txid
                    }
                }
            });
    }

    return {
        connect,
        disconnect,
        init,
        client,
        getSigner,
        request
    }
}