import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BRIDGE_CHAIN, IS_MAINNET } from "@/constants";
import { BRIDGE_SOURCE_OFT } from "@/config/bridge";
import { findHyperCoreToken, HyperCoreActionError, IHyperCoreToken, ISpotMetaToken } from "@/core/hypercore";
import { IHyperCoreLedgerUpdate } from "@/types";

export const hyperliquidApiClient = axios.create({
    baseURL: IS_MAINNET
        ? 'https://api.hyperliquid.xyz'
        : 'https://api.hyperliquid-testnet.xyz'
});

export const HYPERCORE_KEY = {
    SPOT_META: 'hypercore.spotMeta',
    LEDGER: 'hypercore.ledger',
    USER_ROLE: 'hypercore.userRole'
}

// Same window as the backend's oft/userHistory
const LEDGER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * FXRP on Hyperliquid Core: the spot token linked to our HyperEVM OFT. Token index and the
 * system address differ per network, so they are read from spotMeta rather than configured.
 */
export function useHyperCoreFxrpToken(enabled: boolean = true) {
    return useQuery({
        queryKey: [HYPERCORE_KEY.SPOT_META],
        queryFn: async () => {
            const response = await hyperliquidApiClient.post('info', { type: 'spotMeta' });
            const tokens = (response.data?.tokens ?? []) as ISpotMetaToken[];
            return findHyperCoreToken(tokens, BRIDGE_SOURCE_OFT[BRIDGE_CHAIN.HYPER_EVM].address ?? '') ?? null;
        },
        staleTime: Infinity,
        enabled: enabled
    });
}

// The wallet's Core ledger (transfers, deposits …) for the last 7 days — HyperEVM ↔ Core
// transfers are picked out of it for "Latest transactions"
export function useHyperCoreLedger(address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [HYPERCORE_KEY.LEDGER, address],
        queryFn: async () => {
            const response = await hyperliquidApiClient.post('info', {
                type: 'userNonFundingLedgerUpdates',
                user: address,
                startTime: Date.now() - LEDGER_WINDOW_MS
            });
            return (response.data ?? []) as IHyperCoreLedgerUpdate[];
        },
        // Polled with the history — no retry storm while the API is down
        retry: false,
        enabled: enabled
    });
}

/**
 * Whether the address exists on Hyperliquid Core. HyperEVM → Hyperliquid to an address Core does
 * not know (`role: "missing"`) is not credited: it stays in `evmEscrows` until the account is
 * activated, which only HYPE does (≈0.0004 HYPE `accountActivationGas`, testnet 2026-11-03) —
 * so FXRP alone never activates it; the route blocks until the account exists. A failed lookup
 * blocks too, so it is retried once (not React Query's 3×) before the error shows.
 * "Missing" and a failure are asked again every 10 s: the user may activate the account in another
 * tab, or the API comes back — the app does not refetch on window focus.
 */
export function useHyperCoreAccountExists(address: string, enabled: boolean = true): {
    // undefined = not answered yet
    exists?: boolean;
    isLoading: boolean;
    // Failed and no answer yet — a refetch after an error resets `isError` while it runs, so
    // `isError` alone flickers; a known answer stays valid when a later refetch fails
    isUnavailable: boolean;
} {
    const query = useQuery({
        queryKey: [HYPERCORE_KEY.USER_ROLE, address],
        queryFn: async () => {
            const response = await hyperliquidApiClient.post('info', { type: 'userRole', user: address });
            return response.data?.role !== 'missing';
        },
        retry: 1,
        refetchInterval: query => (query.state.status === 'error' || query.state.data === false ? 10_000 : false),
        enabled: enabled && address !== ''
    });
    const isUnavailable = query.data === undefined && query.errorUpdatedAt > query.dataUpdatedAt;
    return {
        exists: query.data,
        // A retry after an error is not "loading" — the error stays shown, the CTA does not flicker
        isLoading: query.isLoading && !isUnavailable,
        isUnavailable,
    };
}

/**
 * Posts a signed user action to `/exchange`. Hyperliquid answers HTTP 200 also for a rejected
 * action (`{status: "err", response: "<reason>"}`) — that is thrown with its reason.
 */
export async function postHyperCoreAction({
    action,
    nonce,
    signature
}: {
    action: Record<string, unknown>;
    nonce: number;
    signature: { r: string; s: string; v: number };
}): Promise<void> {
    const response = await hyperliquidApiClient.post('exchange', { action, nonce, signature });
    if (response.data?.status !== 'ok') {
        throw new HyperCoreActionError(String(response.data?.response ?? 'Hyperliquid rejected the transfer'));
    }
}

export type { IHyperCoreToken };
