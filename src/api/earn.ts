import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { IEarn } from "@/types";

export const EARN_KEY = {
    EARN: 'earn'
}

export function useEarn() {
    return useQuery({
        queryKey: [EARN_KEY.EARN],
        queryFn: async () => {
            const response = await apiClient.get('earn');
            return response.data as IEarn;
        }
    })
}