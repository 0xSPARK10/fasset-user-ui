import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { IOFTHistory, IOFTRedemptionFees } from "@/types";

export interface IRedeemerBalance {
    balance: string;
    symbol: string;
    address: string;
    type: string;
    exact: string;
}

export interface IRedeemerAccount {
    address: string;
    balances: IRedeemerBalance[];
}

export const OFT_KEY = {
    USER_HISTORY: 'oft.userHistory',
    REDEMPTION_FEES: 'oft.redemptionFees',
    REDEEMER_ACCOUNT: 'oft.redeemerAccount'
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

export function useRedemptionFees(srcEid: number, enabled: boolean = true) {
    return useQuery({
        queryKey: [OFT_KEY.REDEMPTION_FEES, srcEid],
        queryFn: async () => {
            const response = await apiClient.get(`oft/redemptionFees/${srcEid}`);
            return response.data as IOFTRedemptionFees;
        },
        enabled: enabled
    })
}

export function useRedeemerAccount(redeemer: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [OFT_KEY.REDEEMER_ACCOUNT, redeemer],
        queryFn: async () => {
            const response = await apiClient.get(`oft/redeemerAccount/${redeemer}`);
            return response.data as IRedeemerAccount;
        },
        enabled: enabled
    })
}

