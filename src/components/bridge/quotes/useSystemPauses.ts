import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fassetStateQuery, useFassetState } from "@/api/user";
import { oftPausedQuery, useOftPaused } from "@/api/oft";
import { evaluatePauses } from "@/core/bridge";
import { FASSET_COIN } from "@/config/coin";
import { IFassetState } from "@/types";

// API answers → the pauses; nothing loaded = undefined = not checked.
// /mintEnabled is the same flag as /fassetState (backend team), so it is not read here
function toPauses(fassetState: IFassetState[] | undefined, oftPaused: boolean | undefined) {
    if (fassetState === undefined && oftPaused === undefined) return undefined;
    return evaluatePauses({
        fassetPaused: !!fassetState?.some(item => item.fasset === FASSET_COIN.type && item.state),
        oftPaused: oftPaused === true,
    });
}

/**
 * FAsset emergency pause and the OFT pause for the bridge page. `pauses` comes from page load
 * (no polling); `fetchFresh` asks the backend again on the CTA click, before signing.
 */
export function useSystemPauses(enabled: boolean) {
    const queryClient = useQueryClient();
    const fassetState = useFassetState(enabled);
    const oftPaused = useOftPaused(enabled);

    const pauses = useMemo(() => toPauses(fassetState.data, oftPaused.data), [fassetState.data, oftPaused.data]);

    // fetchQuery also updates the cache — the form and the banners show the change right away
    const fetchFresh = async () => {
        const [freshFassetState, freshOftPaused] = await Promise.all([
            queryClient.fetchQuery({ ...fassetStateQuery, staleTime: 0 }).catch(() => undefined),
            queryClient.fetchQuery({ ...oftPausedQuery, staleTime: 0 }).catch(() => undefined),
        ]);
        return toPauses(freshFassetState, freshOftPaused);
    };

    return { pauses, fetchFresh };
}
