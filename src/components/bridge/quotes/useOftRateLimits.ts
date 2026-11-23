import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { oftLimitsQuery, useOftLimits } from "@/api/oft";
import { OftRateLimits } from "@/core/bridge";
import { useWeb3 } from "@/hooks/useWeb3";

/**
 * The Flare OFT adapter's rate limits for the bridge form. `limits` comes from page load (no
 * polling); `fetchFresh` asks the backend again on the CTA click, before signing.
 * Not loaded (endpoint down) = undefined = not checked.
 */
export function useOftRateLimits(enabled: boolean) {
    const queryClient = useQueryClient();
    const { mainToken } = useWeb3();
    const mainnet = !!mainToken?.network?.mainnet;
    const oftLimits = useOftLimits(enabled);

    const limits = useMemo(
        () => oftLimits.data ? new OftRateLimits(oftLimits.data, mainnet) : undefined,
        [oftLimits.data, mainnet]
    );

    // fetchQuery also updates the cache, so the form shows a new limit right away
    const fetchFresh = async (): Promise<OftRateLimits | undefined> => {
        const fresh = await queryClient.fetchQuery({ ...oftLimitsQuery, staleTime: 0 }).catch(() => undefined);
        return fresh ? new OftRateLimits(fresh, mainnet) : undefined;
    };

    // Still on its first request — a failed one ends it too (then `limits` stays undefined)
    return { limits, isLoading: enabled && oftLimits.isLoading, fetchFresh };
}
