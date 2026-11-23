import { useState } from "react";
import { BridgeRouteChain } from "@/types";
import { findBridgeRoute, getBridgeRouteRecipient } from "@/config/bridgeRoutes";

/**
 * FROM / TO of the bridge page and what follows from the pair. The handlers that also reset the
 * recipient, tag and link values live in useBridgePageState.
 */
export function useBridgeRouteSelection(isPaused: boolean) {
    const [from, setFrom] = useState<BridgeRouteChain>();
    const [to, setTo] = useState<BridgeRouteChain>();
    const route = findBridgeRoute(from, to);
    // undefined until both chains are picked
    const reverseRoute = findBridgeRoute(to, from);

    return {
        from,
        to,
        route,
        recipientKind: getBridgeRouteRecipient(route),
        setFrom,
        setTo,
        canSwap: !isPaused && reverseRoute !== undefined,
        // The reverse pair is no route (e.g. → Hyperliquid) — the swap button explains why it is off
        isSwapUnsupported: from !== undefined && to !== undefined && reverseRoute === undefined,
    };
}
