import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import qs from "qs";
import { IMaxCptWithdraw, IMaxWithdraw, IPool } from "@/types";

export const POOL_KEY = {
    POOLS: 'pool.pools',
    USER_POOLS: 'pool.userPools',
    MAX_CPT_WITHDRAW: 'pool.maxCptWithdraw',
    MAX_WITHDRAW: 'pool.maxWithdraw',
    USER_POOL: 'pool.userPool',
    POOL: 'pool.pool'
}

export function usePools(fAssets: string[] = [], enabled: boolean = true) {
    return useQuery({
        queryKey: [POOL_KEY.POOLS, fAssets.join()],
        queryFn: async () => {
            const response = await apiClient.get(`pools`, {
                params: { fasset: fAssets },
                paramsSerializer: params => {
                    return qs.stringify(params);
                }
            });
            return response.data as IPool[];
        },
        retry: true,
        select: (data: IPool[]) => {
            return data.map(pool => {
                return {
                    ...pool,
                    agentName: pool.agentName.length === 0 ? 'Not defined' : pool.agentName,
                }
            });
        },
        enabled: enabled
    });
}

export function useUserPools(address: string, fAssets: string[] = [], enabled: boolean = true) {
    return useQuery({
        queryKey: [POOL_KEY.USER_POOLS, address, fAssets.join()],
        queryFn: async () => {
            const response = await apiClient.get(`pools/${address}`, {
                params: { fasset: fAssets },
                paramsSerializer: params => {
                    return qs.stringify(params);
                }
            });

            return (response.data === '' ? [] : response.data) as IPool[];
        },
        retry: true,
        select: (data: IPool[]) => {
            return data.map(pool => {
                return {
                    ...pool,
                    agentName: pool.agentName.length === 0 ? 'Not defined' : pool.agentName
                }
            });
        },
        enabled: enabled
    });
}

export function useMaxCptWithdraw(fAsset: string, poolAddress: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [POOL_KEY.MAX_CPT_WITHDRAW, fAsset, poolAddress],
        queryFn: async () => {
            const response = await apiClient.get(`maxPoolWith/${fAsset}/${poolAddress}`);
            return response.data as IMaxCptWithdraw;
        },
        enabled: enabled
    })
}

export function useMaxWithdraw(fAsset: string, poolAddress: string, userAddress: string, value: number, enabled: boolean = true) {
    return useQuery({
        queryKey: [POOL_KEY.MAX_WITHDRAW, fAsset, poolAddress, userAddress, value],
        queryFn: async () => {
            const response = await apiClient.get(`maxWithdraw/${fAsset}/${poolAddress}/${userAddress}/${value}`);
            return response.data as IMaxWithdraw;
        },
        retry: false,
        enabled: enabled
    });
}

export function useUserPool(fAsset: string, address: string, poolAddress: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [POOL_KEY.USER_POOL, fAsset, address, poolAddress],
        queryFn: async() => {
            const response = await apiClient.get(`pools/${fAsset}/${address}/${poolAddress}`);
            return response.data as IPool;
        },
        enabled: enabled
    });
}

export function usePool(fAsset: string, poolAddress: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [POOL_KEY.POOL, fAsset, poolAddress],
        queryFn: async() => {
            const response = await apiClient.get(`pools/${fAsset}/${poolAddress}`);
            return response.data as IPool;
        },
        enabled: enabled
    });
}
