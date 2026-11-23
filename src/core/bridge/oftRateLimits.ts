import { Issue } from "@/core/alerts";
import { bridgeChainEid } from "@/config/bridge";
import type { IBridgeRoute } from "@/config/bridgeRoutes";
import { BRIDGE_CHAIN, BRIDGE_ROUTE_ACTION, BRIDGE_ROUTE_CHAIN } from "@/constants";
import type { BridgeChain, BridgeRouteChain } from "@/types";

export type OftIssueCode = "oft_limit_exceeded";

// GET oft/limits — what is left per remote EID, in 6-decimal UBA ("drops", 1e12 = 1,000,000 FXRP)
export type OftLimits = Record<string, { incomingRemainingDrops: string; outgoingRemainingDrops: string }>;

const UBA = 1e6;

// The remote side of a route as a LayerZero chain — XRPL and Flare are not remote, Core goes through HyperEVM
function remoteChain(chain: BridgeRouteChain): BridgeChain | undefined {
    switch (chain) {
        case BRIDGE_ROUTE_CHAIN.XRPL:
        case BRIDGE_ROUTE_CHAIN.FLARE:
            return undefined;
        case BRIDGE_ROUTE_CHAIN.HYPER_CORE:
            return BRIDGE_CHAIN.HYPER_EVM;
        default:
            return chain;
    }
}

/**
 * Rate limits of the Flare OFT adapter (backend oft/limits). Out of Flare (incl. direct mint &
 * bridge) is bound by outgoing[dstEid], into Flare (incl. bridge to XRPL) by incoming[srcEid].
 * Remote → remote does not pass the adapter, so no limit is known for it. The OFT pause is in
 * pauseRules.
 */
export class OftRateLimits {
    constructor(private readonly limits: OftLimits, private readonly mainnet: boolean) {}

    // FXRP the adapter still lets through on this route; undefined = no limit known
    remaining(route: IBridgeRoute): number | undefined {
        // Mint and redeem are FAsset flows, Hyperliquid ↔ HyperEVM a Core system transfer — not LayerZero
        if (route.action === BRIDGE_ROUTE_ACTION.MINT || route.action === BRIDGE_ROUTE_ACTION.REDEEM
            || route.action === BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER) return undefined;
        const from = remoteChain(route.from);
        const to = remoteChain(route.to);

        const drops = !from && to
            ? this.limits[bridgeChainEid(to, this.mainnet)]?.outgoingRemainingDrops
            : from && !to
                ? this.limits[bridgeChainEid(from, this.mainnet)]?.incomingRemainingDrops
                : undefined;

        return drops === undefined ? undefined : Number(drops) / UBA;
    }

    // Max for the form: the route's own max, capped by the remaining limit
    maxAmount(route: IBridgeRoute, routeMax: number): number {
        const remaining = this.remaining(route);
        return remaining === undefined ? routeMax : Math.min(routeMax, remaining);
    }

    evaluate(route: IBridgeRoute, amount: number): { issues: Issue<OftIssueCode>[]; isBlocked: boolean } {
        const remaining = this.remaining(route);
        const issues: Issue<OftIssueCode>[] = [];
        if (remaining !== undefined && amount > remaining) {
            issues.push({ code: "oft_limit_exceeded", severity: "error", blocking: true, values: { max: remaining } });
        }
        return { issues, isBlocked: issues.length > 0 };
    }
}
