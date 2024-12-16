import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import {
    IAgent,
    IAssetManagerAddress,
    IBestAgent,
    IExecutor,
    IFassetState,
    ILifetimeClaimed,
    ITimeData,
    IUserProgress
} from "@/types";

export const USER_KEY = {
    ALL_AGENTS: 'user.allAgents',
    ASSET_MANAGER_ADDRESS: 'user.assetManagerAddress',
    EXECUTOR: 'user.executor',
    USER_PROGRESS: 'user.userProgress',
    LIFETIME_CLAIMED: 'user.lifetimeClaimed',
    TIME_DATA: 'user.timeData',
    FASSET_STATE: 'user.fassetState'
}

export function useBestAgent() {
    return useMutation({
        mutationFn:  async ({ fAsset, lots }: { fAsset: string, lots: number, }) => {
            const response = await apiClient.get(`agent/${fAsset}/${lots}`);
            return response.data as IBestAgent;
        }
    });
}

export function useAllAgents(fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.ALL_AGENTS],
        queryFn: async () => {
            const response = await apiClient.get(`agents/${fAsset}`);
            return response.data as IAgent[];
        },
        enabled: enabled
    });
}

export function useAssetManagerAddress(fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.ASSET_MANAGER_ADDRESS, fAsset],
        queryFn: async () => {
            const response = await apiClient.get(`assetManagerAddress/${fAsset}`);
            return response.data as IAssetManagerAddress;
        },
        enabled: enabled
    });
}

export function useExecutor(fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.EXECUTOR, fAsset],
        queryFn: async () => {
            const response = await apiClient.get(`executor/${fAsset}`);
            return response.data as IExecutor;
        },
        enabled: enabled
    });
}

export function useUserProgress(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.USER_PROGRESS, address],
        queryFn: async () => {
            const response = await apiClient.get(`userProgress/${address}`);
            return response.data as IUserProgress[];
        },
        enabled: enabled
    })
}

export function useLifetimeClaimed(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.LIFETIME_CLAIMED, address],
        queryFn: async () => {
            const response = await apiClient.get(`lifetimeClaimed/${address}`);
            return response.data as ILifetimeClaimed[];
        },
        enabled: enabled
    });
}

export function useTimeData(time: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.TIME_DATA, time],
        queryFn: async () => {
            const response = await apiClient.get(`timeData/${time}`);
            return response.data as ITimeData;
        },
        enabled: enabled
    })
}

export function useFassetState(enabled: boolean = true) {
    return useQuery({
        queryKey: [USER_KEY.FASSET_STATE],
        queryFn: async () => {
            const response = await apiClient.get('fassetState');
            return response.data as IFassetState[];
        },
        enabled: enabled
    })
}
