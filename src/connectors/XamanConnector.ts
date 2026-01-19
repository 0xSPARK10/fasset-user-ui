import { useRef, useState } from "react";
import { Xumm } from "xumm";
import { omit } from "lodash-es";
import type { ResolvedFlow } from "xumm-oauth2-pkce";
import { WALLET } from "@/constants";
import { useConnectedCoin } from "@/store/coin";
import { FTEST_XRP, FXRP } from "@/config/coin";
import { PayloadSubscription } from "xumm-sdk/dist/src/types";
import { ICoin } from "@/types";

type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
};

function createDeferred<T>(): Deferred<T> {
    let resolve!: Deferred<T>['resolve'];
    let reject!: Deferred<T>['reject'];
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}

export interface IXamanConnector {
    connect: () => Promise<boolean>;
    disconnect: () => Promise<void>;
    init: () => void;
    client: Xumm | undefined;
    getSigner: (token?: ICoin) => Promise<undefined>;
    request: ({ chainId, method, params }: { chainId: string, method: string, params: any }) => Promise<any>;
}

export default function XamanConnector(): IXamanConnector {
    const isInitialized = useRef(false);
    const [client, setClient] = useState<Xumm>();
    const clientRef = useRef<Xumm>();
    const xummUuid = useRef<string>();
    const currentTime = useRef<number>();
    const subscription = useRef<PayloadSubscription | undefined>(undefined);
    const pendingSubscriptions = useRef<Map<string, Deferred<{ data: any }>>>(new Map());
    const attachedListeners = useRef(false);
    const removeListenersRef = useRef<() => void>(() => {});
    const { addConnectedCoin, removeConnectedCoin, localConnectedCoins } = useConnectedCoin();

    const connect = async () => {
        try {
            const xumm = clientRef.current;
            if (!xumm) throw new ReferenceError('Xaman client is not initialized.');

            localConnectedCoins
                .filter((coin) => coin.connectedWallet === WALLET.XAMAN)
                .forEach((coin) => removeConnectedCoin(coin.address!));

            const response: ResolvedFlow | Error | undefined = await xumm.authorize();
            return !!(response && !(response instanceof Error));
        } catch {
            return false;
        }
    };

    const disconnect = async () => {
        try {
            await clientRef.current?.logout();
        } finally {
            useConnectedCoin
                .getState()
                .localConnectedCoins.filter((coin) => coin.connectedWallet === WALLET.XAMAN)
                .forEach((coin) => removeConnectedCoin(coin.address!));
            
            if (attachedListeners.current) {
                removeListenersRef.current();
                attachedListeners.current = false;
            }
        }
    };

    const createClient = async () => {
        if (!process.env.XAMAN_API_KEY) return;

        const xumm = new Xumm(process.env.XAMAN_API_KEY as string);
        xumm.on('ready', async () => {
            const isConnected = useConnectedCoin
                .getState()
                .localConnectedCoins.some((coin) => coin.connectedWallet === WALLET.XAMAN);

            if (isConnected && !xumm.state.signedIn) {
                disconnect();
            }
        });

        xumm.on('logout', () => {
            disconnect();
        });

        xumm.on('success', () => {
            xumm.user.account.then((account) => {
                const isConnected = useConnectedCoin
                    .getState()
                    .localConnectedCoins.some((coin) => coin.connectedWallet === WALLET.XAMAN);

                if (!isConnected) {
                    history.replaceState(null, "", window.location.pathname + window.location.hash);
                    addConnectedCoin({
                        type: FXRP.enabled ? FXRP.type : FTEST_XRP.type,
                        address: account!,
                        connectedWallet: WALLET.XAMAN,
                    });
                }
            });
        });

        setClient(xumm);
        clientRef.current = xumm;
        isInitialized.current = true;
    };

    const init = async () => {
        if (isInitialized.current) return;
        await createClient();

        if (!attachedListeners.current) {

            const onFocus = async () => {
                const uuid = xummUuid.current;
                if (uuid) {
                    await resubscribeOnFocus(uuid);
                }
            }

            const onVisibility = () => {
                if (document.visibilityState === 'visible') onFocus();
            }
            
            window.addEventListener("visibilitychange", onVisibility);
            removeListenersRef.current = () => {
                window.removeEventListener("visibilitychange", onVisibility);
            }
            attachedListeners.current = true;
        }
    };

    const resubscribeOnFocus = async (uuid: string) => {
        let deferred = pendingSubscriptions.current.get(uuid);
        if (!deferred) {
            deferred = createDeferred<{ data: any }>();
            pendingSubscriptions.current.set(uuid, deferred);
        }

        const xumm = clientRef.current;
        if (!xumm) return deferred.promise;

        const payload = await xumm.payload?.get(uuid);
        if (payload?.response?.resolved_at) {
            deferred.resolve({
                data: {
                    ...payload.response,
                    signed: payload.meta.signed
                }
            });
            pendingSubscriptions.current.delete(uuid);
        }

        const now = Date.now();
        if (!currentTime.current || now - currentTime.current > 250) {
            subscription.current?.resolve();
            currentTime.current = now;
            subscription.current = await xumm.payload?.subscribe(uuid, (event) => {
                if ('signed' in event.payload.meta && event.payload.response.resolved_at) {
                    event.resolve();
                    deferred.resolve({
                        data: {
                            ...event.payload.response,
                            signed: event.payload.meta.signed
                        }
                    });
                    pendingSubscriptions.current.delete(uuid);
                }
            });
        }

        return deferred.promise;
    };

    const getSigner = async () => {
        return undefined;
    };

    const request = async({ chainId, method, params }: { chainId: string, method: string, params: any }) => {
        const xumm = clientRef.current;
        if (!xumm || !xumm.payload) return;

        const { created } = await xumm.payload.createAndSubscribe(
            {
                txjson: omit(params, ['expirationMinutes']) as any,
                options: { expire: params.expirationMinutes }
            },
            (eventMessage) => {
                if ('signed' in eventMessage.data) {
                    const subscription = pendingSubscriptions.current.get(created.uuid);
                    if (subscription) {
                        subscription.resolve({ data: eventMessage.data });
                        pendingSubscriptions.current.delete(created.uuid);
                    }

                    return eventMessage;
                }
            }
        );

        xummUuid.current = created.uuid;
        currentTime.current = Date.now();
        if (xumm.runtime.xapp) {
            xumm.xapp?.openSignRequest(created);
        } else {
            window.open(created.next.always, '_blank', 'noopener,noreferrer');
        }

        let deferred = pendingSubscriptions.current.get(created.uuid);
        if (!deferred) {
            deferred = createDeferred<{ data: any }>();
            pendingSubscriptions.current.set(created.uuid, deferred);
        }

        const payload = await deferred.promise;
        xummUuid.current = undefined;

        if (!payload.data.signed) {
            const error = new Error('User rejected the request');
            (error as any).code = 4005;
            throw error;
        }

        return {
            tx_json: { hash: payload.data.txid },
        };
    };

    return {
        connect,
        disconnect,
        init,
        client,
        getSigner,
        request,
    };
}
