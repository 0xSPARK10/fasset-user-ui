import type { IDirectMintRecoveryMemo, IDirectMintStatus, IMessage, IOFTHistory } from "@/types";
import { LAYER_ZERO_STATUS } from "@/constants";

export type DirectMintRecoveryPhase =
    | "loading"
    // RecoveryMemo is there — the user can pay
    | "recoverable"
    // recovery_pending, RecoveryReplayPending or no payload yet — keep waiting, never pay twice
    | "processing"
    // memo_skipped — the FXRP was released to the Personal Account
    | "recovered"
    // The bridge went through after all — LayerZero handles the rest, 0xE0 cannot undo it
    | "executed"
    | "error"
    // The status request itself failed — nothing to show, nothing to pay
    | "unavailable";

// Smart status values after which nothing changes — polling stops
export const DIRECT_MINT_FINAL_STATUSES = ["memo_skipped", "executed", "error"];

// Recovery is offered only for a bridge that is still stuck and carries a fresh RecoveryMemo
export function recoveryMemoOf(status: IDirectMintStatus | null | undefined): IDirectMintRecoveryMemo | undefined {
    return status?.type === "BRIDGE"
        && status.action?.action === "BRIDGE"
        && status.status === "awaiting_recovery"
        && status.payload?.type === "RecoveryMemo"
        ? status.payload as IDirectMintRecoveryMemo
        : undefined;
}

/**
 * Smart status → recovery phase. A recovery payment already sent (`isRecoverySent`) stays
 * "processing" until the backend catches up, even while the old memo is still offered.
 */
export function deriveRecoveryPhase(
    status: IDirectMintStatus | null | undefined,
    { isFetched, isError, isRecoverySent }: { isFetched: boolean; isError: boolean; isRecoverySent: boolean },
): DirectMintRecoveryPhase {
    if (!isFetched) return "loading";
    if (isError && !status) return "unavailable";
    switch (status?.status) {
        case "memo_skipped":
            return "recovered";
        case "executed":
            return "executed";
        case "error":
            return "error";
    }
    return recoveryMemoOf(status) && !isRecoverySent ? "recoverable" : "processing";
}

/**
 * A direct mint & bridge in recovery (needs it, paid and pending, or done): no OFT send, no
 * LayerZero delivery — the FXRP goes to the Personal Account, and the amount is final.
 */
export function isDirectMintRecoveryStatus(status: IOFTHistory["directMintingStatus"]): boolean {
    return status === "AWAITING_RECOVERY" || status === "RECOVERY_PENDING" || status === "RECOVERED";
}

// How far a direct mint & bridge's LayerZero message got after the executor sent it from Flare
export type DirectMintDelivery =
    // On Scan, on its way
    | "bridging"
    // Still not delivered DIRECT_MINT_DELIVERY_STUCK_MS after the LayerZero send
    | "stuck"
    | "delivered"
    | "failed";

// LayerZero usually delivers within minutes — past this an undelivered message reads "Delayed"
export const DIRECT_MINT_DELIVERY_STUCK_MS = 15 * 60 * 1000;

const LZ_FAILED_STATUSES: string[] = [LAYER_ZERO_STATUS.FAILED, LAYER_ZERO_STATUS.BLOCKED, LAYER_ZERO_STATUS.PAYLOAD_STORED];

/**
 * LayerZero Scan messages of the executor's tx → delivery. The tx can carry more than one message —
 * the one to `dstEid` counts (the only one when `dstEid` is unknown). Hyperliquid also needs the
 * compose onto Core: a failed compose leaves the FXRP on HyperEVM. No message → undefined: Scan has
 * not indexed it yet, or never will (testnet Scan does not index Coston2) — not a sign it is stuck.
 */
export function directMintDeliveryOf(
    messages: IMessage[] | undefined,
    { dstEid, toHypercore, now }: { dstEid?: number; toHypercore?: boolean; now: number },
): DirectMintDelivery | undefined {
    const message = dstEid === undefined
        ? (messages?.length === 1 ? messages[0] : undefined)
        : messages?.find(item => item.pathway.dstEid === dstEid);
    if (!message) return undefined;
    const name = message.status?.name;

    if (name && LZ_FAILED_STATUSES.includes(name)) return "failed";
    if (name === LAYER_ZERO_STATUS.DELIVERED) {
        const compose = message.destination?.lzCompose?.status;
        if (!toHypercore || compose === "SUCCEEDED") return "delivered";
        if (compose === "FAILED") return "failed";
    }
    // From the LayerZero send, not the XRP payment — a delayed mint can send hours after it
    const sentAt = (message.source?.tx?.blockTimestamp ?? 0) * 1000;
    return sentAt && now - sentAt > DIRECT_MINT_DELIVERY_STUCK_MS ? "stuck" : "bridging";
}

// Re-confirm only past this, in XRP — the operator fee drifts on the 6th decimal at every request
export const DIRECT_MINT_QUOTE_CHANGE_THRESHOLD = 1;

/**
 * Whether the quote fetched on Confirm is worse for the user than the one they agreed to: the fee
 * rose or what they receive fell by more than the threshold. Better or smaller changes sign as is.
 * `toReceive` is FXRP, 1:1 with XRP; a null `toReceive` compares the fee only.
 */
export function isDirectMintQuoteWorse(
    preview: { toReceive: number; totalFee: number },
    fresh: { toReceive?: number | null; totalFee: number },
): boolean {
    const feeRise = fresh.totalFee - preview.totalFee;
    const receiveDrop = fresh.toReceive != null ? preview.toReceive - fresh.toReceive : 0;
    return feeRise > DIRECT_MINT_QUOTE_CHANGE_THRESHOLD || receiveDrop > DIRECT_MINT_QUOTE_CHANGE_THRESHOLD;
}
