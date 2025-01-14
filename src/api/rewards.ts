import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { IReward } from "@/types";

export const REWARDS_KEY = {
    REWARDS: 'rewards.rewards'
};

export function useRewards(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [REWARDS_KEY.REWARDS, address],
        queryFn: async () => {
            const response = await apiClient.get(`rewards/${address}`);
            return response.data as IReward;
        },
        enabled: enabled
    });
}
