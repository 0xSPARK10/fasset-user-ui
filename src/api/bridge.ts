import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IHyperCoreInfo, IMessage } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";

const layerZeroApiClient = axios.create({
    baseURL: process.env.NETWORK === 'mainnet'
        ? 'https://scan.layerzero-api.com/v1'
        : 'https://scan-testnet.layerzero-api.com/v1'
});
const hyperliquidApiClient = axios.create({
    baseURL: process.env.NETWORK === 'mainnet'
        ? 'https://api.hyperliquid.xyz'
        : 'https://api.hyperliquid-testnet.xyz'
});

export const BRIDGE_KEY = {
    MESSAGE: 'bridge.message',
    BALANCE: 'bridge.balance'
}

export function useMessage(txHash: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [BRIDGE_KEY.MESSAGE, txHash],
        queryFn: async () => {
            const response = await layerZeroApiClient.get(`messages/tx/${txHash}`);
            return response.data.data as IMessage[];
        },
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