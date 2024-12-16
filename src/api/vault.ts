import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { IDepositLots } from "@/types";

const VAULT_KEY = {
    DEPOSIT_LOTS: 'vault.depositLots',
}

export function useDepositLots(vaultAddress: string, amount: number, enabled: boolean = true) {
    return useQuery({
        queryKey: [VAULT_KEY.DEPOSIT_LOTS, vaultAddress, amount],
        queryFn: async() => {
            const response = await apiClient.get(`depositLots/${vaultAddress}/${amount}`);
            return response.data as IDepositLots;
        },
        enabled: enabled
    });
}
