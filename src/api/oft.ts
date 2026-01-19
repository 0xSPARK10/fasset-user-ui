import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { IOFTHistory } from "@/types";

const OFT_KEY = {
    USER_HISTORY: 'oft.userHistory'
}

export function useUserHistory(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [OFT_KEY.USER_HISTORY, address],
        queryFn: async () => {
            const response = await apiClient.get(`oft/userHistory/${address}`);
            return response.data as IOFTHistory[];
        },
        enabled: enabled
    })
}