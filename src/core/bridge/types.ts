import type { IBridgeRoute } from "@/config/bridgeRoutes";
import type { BridgeRouteChain } from "@/types";

export type MintDestinationMode = "address" | "tag";

// Mint destination fields — exactly what mint/ConfirmStepper reads (useMintRecipient fills them).
// A type alias (not an interface) so it fits yupResolver's Record<string, unknown>
export type IMintRecipientValues = {
    destinationMode: MintDestinationMode;
    destinationAddress: string;
    destinationTag: string;
    resolvedAddress: string;
    // The user's own minting tag for the default address — sent instead of the memo
    addressTag: string;
};

// What a route flow adds to the submit payload on CTA click (IRouteQuotePart.submit)
export interface RouteSubmitExtras {
    // Bridge: raw LayerZero nativeFee (msg.value of the send), fresh from the click
    fee?: bigint;
    executorFee?: string;
    composerFeePPM?: string;
    // Redeem: the direct minting executor
    executorAddress?: string;
    // Mint: system minting fee, only when above the 2 % limit (opens HighMintingFeeModal first)
    highMintingFee?: number;
    // Direct mint & bridge: the preview the user saw — /direct_mint/request is compared with it
    directMintPreview?: { toReceive: number; totalFee: number };
}

// Everything a confirm modal needs, built by the page on CTA click from its state and the
// route's fresh quote (spec 2026-10-21-bridge-page-submit-design.md).
export type BridgeSubmitPayload =
    | {
        kind: "bridge";
        route: IBridgeRoute;
        amount: number;
        // Raw LayerZero nativeFee — sent as msg.value, must match the quote
        fee: bigint;
        executorFee?: string;
        composerFeePPM?: string;
        destinationAddress?: string;
        destinationTag?: string;
    }
    | {
        kind: "mint";
        route: IBridgeRoute;
        amount: number;
        mint: IMintRecipientValues;
        // Set = above the 2 % limit, HighMintingFeeModal asks before the confirm step
        highMintingFee?: number;
    }
    | {
        kind: "directMintBridge";
        route: IBridgeRoute;
        amount: number;
        // `evm_recipient`: the connected EVM address or a custom one
        evmRecipient: string;
        // What the form showed — the confirm modal asks again when /direct_mint/request differs
        preview: { toReceive: number; totalFee: number };
    }
    | {
        // Hyperliquid ↔ HyperEVM through the FXRP system address — always to the sender
        kind: "hyperCoreTransfer";
        route: IBridgeRoute;
        amount: number;
    }
    | {
        kind: "redeem";
        route: IBridgeRoute;
        amount: number;
        destinationAddress: string;
        destinationTag?: string;
        executorAddress: string;
        executorFee: string;
    };

// Bridge form values carried in the /bridge URL (deeplink from another app, back / forward,
// a copied link). Strings as they appear in the URL; parseBridgeDeeplink checks their shape
export interface BridgeDeeplink {
    from?: BridgeRouteChain;
    to?: BridgeRouteChain;
    amount?: string;
    recipient?: string;
    tag?: string;
}
