import type { IBridgeRoute } from "@/config/bridgeRoutes";
import type { WalletCapabilities } from "@/core/wallet/walletCapabilities";
import { BRIDGE_CHAIN, BRIDGE_ROUTE_ACTION, BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BridgeChain, BridgeRouteChain } from "@/types";

export interface RouteRequirements {
    signOn: "xrpl" | BridgeChain;
    typedData: boolean;
    xrplMemo: boolean;
}

export type RouteBlockReason =
    | { kind: "no_xrpl" }
    | { kind: "evm_chain"; chain: BridgeChain }
    | { kind: "typed_data" }
    | { kind: "xrpl_memo" };

const BRIDGE_CHAINS: readonly string[] = Object.values(BRIDGE_CHAIN);

function isBridgeChain(chain: BridgeRouteChain): chain is BridgeChain {
    return BRIDGE_CHAINS.includes(chain);
}

export function getRouteRequirements(route: IBridgeRoute): RouteRequirements {
    const none = { typedData: false, xrplMemo: false };

    switch (route.action) {
        case BRIDGE_ROUTE_ACTION.MINT:
            return { ...none, signOn: "xrpl" };
        case BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE:
            // The executor reads the recipient chain from the payment memo
            return { ...none, signOn: "xrpl", xrplMemo: true };
        case BRIDGE_ROUTE_ACTION.REDEEM:
            return { ...none, signOn: BRIDGE_CHAIN.FLARE };
        case BRIDGE_ROUTE_ACTION.BRIDGE:
            // LayerZero routes always start on a LayerZero chain
            if (!isBridgeChain(route.from)) throw new Error(`Not an EVM route source: ${route.from}`);
            return { ...none, signOn: route.from };
        case BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER:
            // The HyperEVM account signs both ways; Hyperliquid → HyperEVM is an EIP-712 action
            return { ...none, signOn: BRIDGE_CHAIN.HYPER_EVM, typedData: route.from === BRIDGE_ROUTE_CHAIN.HYPER_CORE };
        default: {
            const _exhaustive: never = route.action;
            return _exhaustive;
        }
    }
}

// undefined = the wallet can sign this route
export function getRouteBlockReason(
    requirements: RouteRequirements,
    capabilities: WalletCapabilities,
): RouteBlockReason | undefined {
    if (requirements.signOn === "xrpl") {
        if (!capabilities.xrpl) return { kind: "no_xrpl" };
        if (requirements.xrplMemo && !capabilities.xrplMemo) return { kind: "xrpl_memo" };
        return undefined;
    }

    const canSignOnChain =
        capabilities.evmChains === "all" ||
        (capabilities.evmChains === "main" && requirements.signOn === BRIDGE_CHAIN.FLARE);
    if (!canSignOnChain) return { kind: "evm_chain", chain: requirements.signOn };
    if (requirements.typedData && !capabilities.typedData) return { kind: "typed_data" };
    return undefined;
}
