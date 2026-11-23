import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { IOFTHistory, IOFTRedemptionFees, IUserProgress } from "@/types";
import type { OftLimits } from "@/core/bridge";
import { BALANCE_FETCH_INTERVAL } from "@/constants";

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
    FULL_HISTORY: 'oft.fullHistory',
    REDEMPTION_FEES: 'oft.redemptionFees',
    REDEEMER_ACCOUNT: 'oft.redeemerAccount',
    PAUSED: 'oft.paused',
    LIMITS: 'oft.limits'
}

// Flare OFT adapter pause and rate limits — shared by the form (loaded on mount, no polling) and
// the CTA click, which fetches them fresh right before signing (`queryClient.fetchQuery`)
export const oftPausedQuery = {
    queryKey: [OFT_KEY.PAUSED],
    queryFn: async () => (await apiClient.get('oft/paused')).data as boolean,
};

export const oftLimitsQuery = {
    queryKey: [OFT_KEY.LIMITS],
    queryFn: async () => (await apiClient.get('oft/limits')).data as OftLimits,
};

// No polling normally; while paused, every minute — the locked page would never notice the unpause
// (no refetch on focus, and the blocked CTA never runs its fresh check)
const PAUSE_POLL_INTERVAL = 60000;

export function useOftPaused(enabled: boolean = true) {
    return useQuery({
        ...oftPausedQuery,
        enabled,
        refetchInterval: query => (query.state.data === true ? PAUSE_POLL_INTERVAL : false),
    });
}

export function useOftLimits(enabled: boolean = true) {
    return useQuery({
        ...oftLimitsQuery,
        enabled,
        // A used-up limit disables the amount input — poll until something is left again
        refetchInterval: query => Object.values(query.state.data ?? {})
            .some(limit => limit.outgoingRemainingDrops === '0' || limit.incomingRemainingDrops === '0')
            ? PAUSE_POLL_INTERVAL
            : false,
    });
}

// Mints / redeems (userProgress) and OFT transfers (userHistory) in one list — last 7 days,
// newest first. The two shapes share `action: "REDEEM"`; `isOftHistoryItem` tells them apart
export function useFullHistory(
    address: string,
    enabled: boolean = true,
    // Connected XRPL classic address — adds the direct mint and DIRECT_MINT_BRIDGE rows (an invalid one is a 400)
    xrpAddress?: string
) {
    return useQuery({
        queryKey: [OFT_KEY.FULL_HISTORY, address, xrpAddress],
        queryFn: async () => {
            const response = await apiClient.get(`oft/fullHistory/${address}`, {
                params: xrpAddress ? { xrpAddress } : undefined,
            });
            return response.data as Array<IOFTHistory | IUserProgress>;
        },
        enabled: enabled
    })
}

// Actions only OFT history has; REDEEM is in both (OFT: bridge + redeem to XRPL, progress: a
// Flare redeem)
const OFT_ONLY_ACTIONS = ['SEND', 'RECEIVE', 'REDEEMFAIL', 'DIRECT_MINT_BRIDGE'];

// Not by `amountSent`: the swagger marks it required, but a live SEND row comes without it.
// An OFT REDEEM carries the LayerZero side (`eid` / `guid`), a progress redeem has neither
export function isOftHistoryItem(item: IOFTHistory | IUserProgress): item is IOFTHistory {
    return OFT_ONLY_ACTIONS.includes(item.action.toUpperCase()) || 'eid' in item || 'guid' in item;
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
        enabled: enabled,
        refetchInterval: BALANCE_FETCH_INTERVAL
    })
}

