import { useQuery, useQueries } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { useWeb3 } from "@/hooks/useWeb3";
import qs from "qs";
import {
    INativeBalance,
    IPoolsBalance,
    IUnderlyingBalance
} from "@/types";

export const BALANCE_KEY = {
    UNDERLYING_BALANCE: 'balance.underlyingBalance',
    NATIVE_BALANCE: 'balance.nativeBalance',
    POOLS_BALANCE: 'balance.poolsBalance',
    XPUB_BALANCE: 'balance.xpub'
}

const resource = 'balance';

export function useUnderlyingBalance(address: string, fAsset: string, enabled: boolean = true, isXpub: boolean = false) {
    const { connectedCoins } = useWeb3();
    const bip122Account = connectedCoins.find(coin => coin.address === address);

    let config: any = {};
    if (bip122Account) {
        config = {
            params: {
                receiveAddresses: bip122Account?.accountAddresses?.receiveAddresses.join(','),
                changeAddresses: bip122Account?.accountAddresses?.changeAddresses.join(','),
            },
            paramsSerializer: (params: any) => {
                return qs.stringify(params);
            }
        }
    }

    if (isXpub) {
        return useXpubBalance(address, fAsset, enabled);
    }

    return useQuery({
        queryKey: [BALANCE_KEY.UNDERLYING_BALANCE, fAsset, address, config?.params?.changeAddresses, config?.params?.receiveAddresses],
        queryFn: async () => {
            try {
                const response = await apiClient.get(`${resource}/underlying/${fAsset}/${address}`, config);
                return response.data as IUnderlyingBalance;
            } catch (error) {
                return { balance: "error" } as IUnderlyingBalance;
            }
        },
        enabled: enabled
    });
}

export function useUnderlyingBalances(
    assets: { address: string, fAsset: string, isXpub: boolean }[],
    enabled: boolean = true
) {
    const { connectedCoins } = useWeb3();
    const queries = assets.map(asset => {
        const bip122Account = connectedCoins.find(coin => coin.address === asset.address);

        let config: any = {};
        if (bip122Account) {
            config = {
                params: {
                    receiveAddresses: bip122Account?.accountAddresses?.receiveAddresses.join(','),
                    changeAddresses: bip122Account?.accountAddresses?.changeAddresses.join(','),
                },
                paramsSerializer: (params: any) => {
                    return qs.stringify(params);
                }
            }
        }

        if (asset.isXpub) {
            return {
                queryKey: [BALANCE_KEY.XPUB_BALANCE, asset.address, asset.fAsset],
                queryFn: async () => {
                    const response = await apiClient.get(`${resource}/xpub/${asset.fAsset}/${asset.address}`);
                    return {
                        fAsset: asset.fAsset,
                        balance: response.data.balance,
                        accountInfo: response.data.accountInfo
                    }
                },
                enabled: enabled
            }
        }

        return {
            queryKey: [BALANCE_KEY.UNDERLYING_BALANCE, asset.fAsset, asset.address, config?.params?.changeAddresses, config?.params?.receiveAddresses],
            queryFn: async () => {
                const response = await apiClient.get(`${resource}/underlying/${asset.fAsset}/${asset.address}`, config);
                return {
                    fAsset: asset.fAsset,
                    balance: response.data.balance,
                    accountInfo: response.data.accountInfo
                }
            },
            enabled: enabled
        }
    });

    return useQueries({
        queries: queries,
        combine: (results) => {
            return {
                data: results.filter(result => result.data).map((result) => result.data),
                isPending: results.some((result) => result.isPending),
                res: results
            }
        },
    });
}

export function useNativeBalance(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [BALANCE_KEY.NATIVE_BALANCE, address],
        queryFn: async () => {
            const response = await apiClient.get(`${resource}/native/${address}`);
            return response.data as INativeBalance[];
        },
        enabled: enabled
    });
}

export function usePoolsBalance(userAddress: string, fAssets: string[] = [], enabled: boolean = true) {
    return useQuery({
        queryKey: [BALANCE_KEY.POOLS_BALANCE, userAddress, fAssets.join()],
        queryFn: async () => {
            const response = await apiClient.get(`${resource}/pool/${userAddress}`, {
                params: { fasset: fAssets },
                paramsSerializer: params => {
                    return qs.stringify(params);
                }
            });
            return response.data as IPoolsBalance;
        },
        enabled: enabled
    })
}

export function useXpubBalance(xpub: string, fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [BALANCE_KEY.XPUB_BALANCE, xpub, fAsset],
        queryFn: async () => {
            const response = await apiClient.get(`${resource}/xpub/${fAsset}/${xpub}`);
            return response.data as IUnderlyingBalance;
        },
        enabled: enabled
    })
}
