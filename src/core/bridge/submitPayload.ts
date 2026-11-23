import { BRIDGE_ROUTE_ACTION } from "@/constants";
import type { BridgeRecipientKind, IBridgeRoute } from "@/config/bridgeRoutes";
import type { BridgeSubmitPayload, IMintRecipientValues, RouteSubmitExtras } from "@/core/bridge/types";

export type SubmitPayloadError = "missing_extras" | "missing_recipient" | "missing_executor" | "missing_fee";

export interface ISubmitPayloadInput {
    route: IBridgeRoute;
    amount: number;
    // The route's fresh extras from the CTA click; undefined = the quote could not provide them
    extras?: RouteSubmitExtras;
    recipientKind: BridgeRecipientKind;
    recipientAddress?: string;
    // "" = no tag
    destinationTag: string;
    mint: IMintRecipientValues;
}

/**
 * Page state + the route's submit extras → the payload a confirm modal opens with. A missing
 * piece is a reason, not a throw — the hook shows one generic message for all of them.
 */
export function buildSubmitPayload({
    route,
    amount,
    extras,
    recipientKind,
    recipientAddress,
    destinationTag,
    mint,
}: ISubmitPayloadInput): { ok: true; payload: BridgeSubmitPayload } | { ok: false; reason: SubmitPayloadError } {
    if (!extras) return { ok: false, reason: "missing_extras" };
    const tag = destinationTag || undefined;

    if (route.action === BRIDGE_ROUTE_ACTION.MINT) {
        return { ok: true, payload: { kind: "mint", route, amount, mint, highMintingFee: extras.highMintingFee } };
    }

    if (route.action === BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE) {
        if (!recipientAddress) return { ok: false, reason: "missing_recipient" };
        if (!extras.directMintPreview) return { ok: false, reason: "missing_fee" };
        return { ok: true, payload: { kind: "directMintBridge", route, amount, evmRecipient: recipientAddress, preview: extras.directMintPreview } };
    }

    if (route.action === BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER) {
        return { ok: true, payload: { kind: "hyperCoreTransfer", route, amount } };
    }

    if (route.action === BRIDGE_ROUTE_ACTION.REDEEM) {
        if (!recipientAddress) return { ok: false, reason: "missing_recipient" };
        // The quote returns extras only with the executor loaded
        if (!extras.executorAddress || !extras.executorFee) return { ok: false, reason: "missing_executor" };
        return {
            ok: true,
            payload: {
                kind: "redeem",
                route,
                amount,
                destinationAddress: recipientAddress,
                destinationTag: tag,
                executorAddress: extras.executorAddress,
                executorFee: extras.executorFee,
            },
        };
    }

    if (extras.fee === undefined) return { ok: false, reason: "missing_fee" };
    return {
        ok: true,
        payload: {
            kind: "bridge",
            route,
            amount,
            fee: extras.fee,
            executorFee: extras.executorFee,
            composerFeePPM: extras.composerFeePPM,
            // XRPL compose: the r-address; plain transfer: the EVM recipient (the sender's own by default)
            destinationAddress: recipientKind === "xrpl" || recipientKind === "evm_address" ? recipientAddress : undefined,
            destinationTag: tag,
        },
    };
}
