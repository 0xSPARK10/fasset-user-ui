import { useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IHyperCoreInfo, IMessage } from "@/types";
import { IS_MAINNET } from "@/constants";
import { hyperliquidApiClient } from "@/api/hypercore";

const layerZeroApiClient = axios.create({
    baseURL: IS_MAINNET
        ? 'https://scan.layerzero-api.com/v1'
        : 'https://scan-testnet.layerzero-api.com/v1'
});

export const BRIDGE_KEY = {
    MESSAGE: 'bridge.message',
    // useMessagesByTx — not shared with MESSAGE: 404 → [] and no retry there, an error and retries in useMessage
    MESSAGE_BY_TX: 'bridge.messageByTx',
    WALLET_MESSAGES: 'bridge.walletMessages',
    BALANCE: 'bridge.balance'
}

export function useMessage(
    txHash: string,
    enabled: boolean = true,
    // Optional polling: ms until the next fetch, false = stop (decided from the last answer)
    refetchInterval?: (data: IMessage[] | undefined) => number | false
) {
    return useQuery({
        queryKey: [BRIDGE_KEY.MESSAGE, txHash],
        queryFn: async () => {
            const response = await layerZeroApiClient.get(`messages/tx/${txHash}`);
            return response.data.data as IMessage[];
        },
        refetchInterval: refetchInterval ? query => refetchInterval(query.state.data) : undefined,
        enabled: enabled
    })
}

/**
 * `messages/tx` for several txs at once. A tx Scan has not indexed
 * yet answers 404 → empty list. Each query polls every `pollInterval` until `isFinal` — a final
 * answer cannot change, so it is never fetched again (no refetch on remount / window focus).
 */
export function useMessagesByTx(
    txHashes: string[],
    isFinal: (txHash: string, data: IMessage[] | undefined) => boolean,
    pollInterval: number,
    enabled: boolean = true
) {
    return useQueries({
        queries: txHashes.map(txHash => ({
            queryKey: [BRIDGE_KEY.MESSAGE_BY_TX, txHash],
            queryFn: async () => {
                try {
                    const response = await layerZeroApiClient.get(`messages/tx/${txHash}`);
                    return response.data.data as IMessage[];
                } catch (error: any) {
                    if (error?.response?.status === 404) return [];
                    throw error;
                }
            },
            refetchInterval: (query: { state: { data?: IMessage[] } }) => isFinal(txHash, query.state.data) ? false : pollInterval,
            staleTime: (query: { state: { data?: IMessage[] } }) => isFinal(txHash, query.state.data) ? Infinity : 0,
            // Polled anyway — no retry storm while Scan is down
            retry: false,
            enabled,
        })),
    });
}

// Every LayerZero message the wallet sent, on any chain — the only source for OFT transfers
// that never touch Flare (the backend indexes the Flare adapter only). The 100 newest cover
// every LayerZero app the wallet used, so a busy wallet can push older FXRP rows out.
export function useLayerZeroWalletMessages(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [BRIDGE_KEY.WALLET_MESSAGES, address],
        queryFn: async () => {
            try {
                const response = await layerZeroApiClient.get(`messages/wallet/${address}`, { params: { limit: 100 } });
                return response.data.data as IMessage[];
            } catch (error: any) {
                // Scan answers 404 for a wallet with no messages
                if (error?.response?.status === 404) return [];
                throw error;
            }
        },
        // Polled every 30 s with the history — no retry storm while Scan is down
        retry: false,
        enabled: enabled
    })
}

export function useHyperliquidBalance(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [BRIDGE_KEY.BALANCE, address],
        queryFn: async () => {
            const response = await hyperliquidApiClient.post('info', {
                type: 'spotClearinghouseState',
                user: address
            });

            return response.data as IHyperCoreInfo;
        },
        enabled: enabled
    })
}
