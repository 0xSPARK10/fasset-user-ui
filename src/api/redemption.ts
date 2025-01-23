import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import {
    IRedemptionDefault,
    IRedemptionDefaultStatus,
    IRedemptionFee,
    IRedemptionFeeData,
    IRedemptionStatus,
    ITrailingFee
} from "@/types";

export const REDEMPTION_KEY = {
    REDEMPTION_FEE: 'redemption.redemptionFee',
    REDEMPTION_STATUS: 'redemption.redemptionStatus',
    REQUEST_REDEMPTION_DEFAULT_STATUS: 'redemption.requestRedemptionDefaultStatus',
    TRAILING_FEE: 'redemption.trailingFee',
    REDEMPTION_FEE_DATA: 'redemption.redemptionFeeData'
}

export function useRedemptionFee(fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [REDEMPTION_KEY.REDEMPTION_FEE, fAsset],
        queryFn: async () => {
            const response = await apiClient.get(`redemptionFee/${fAsset}`);
            return response.data as IRedemptionFee;
        },
        enabled: enabled
    });
}

export function useRedemptionStatus(fAsset: string, txHash: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [REDEMPTION_KEY.REDEMPTION_STATUS, fAsset, txHash],
        queryFn: async () => {
            const response = await apiClient.get(`redemptionStatus/${fAsset}/${txHash}`);
            return response.data as IRedemptionStatus;
        },
        enabled: enabled
    })
}

export function useRedemptionDefaultStatus(txHash: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [REDEMPTION_KEY.REQUEST_REDEMPTION_DEFAULT_STATUS, txHash],
        queryFn: async () => {
            const response = await apiClient.get(`redemptionDefaultStatus/${txHash}`);
            return response.data as IRedemptionDefaultStatus;
        },
        enabled: enabled
    })
}

export function useRequestRedemptionDefault() {
    return useMutation({
        mutationFn: async ({
           txHash,
           fAsset,
           amount,
           userAddress
       }: {
            txHash: string,
            amount: number,
            fAsset: string,
            userAddress: string
        }) => {
            const response = await apiClient.get(`requestRedemptionDefault/${fAsset}/${txHash}/${amount}/${userAddress}`);
            return response.data as IRedemptionDefault;
        }
    });
}

export function useTrailingFee(fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [REDEMPTION_KEY.TRAILING_FEE],
        queryFn: async () => {
            const response = await apiClient.get(`trailingFee/${fAsset}`);
            return response.data as ITrailingFee;
        },
        enabled: enabled
    })
}

export function useRedemptionFeeData(enabled: boolean = true) {
    return useQuery({
        queryKey: [REDEMPTION_KEY.REDEMPTION_FEE_DATA],
        queryFn: async () => {
            const response = await apiClient.get('redemptionFeeData');
            return response.data as IRedemptionFeeData;
        },
        enabled: enabled
    })
}

