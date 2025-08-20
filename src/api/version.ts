import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";

export const VERSION_KEY = {
    VERSION: 'version'
}

export function useVersion(enabled: boolean = true) {
    return useQuery({
        queryKey: [VERSION_KEY.VERSION],
        queryFn: async () => {
            const response = await apiClient.get('version');
            return response.data as string;
        },
        enabled: enabled
    })
}