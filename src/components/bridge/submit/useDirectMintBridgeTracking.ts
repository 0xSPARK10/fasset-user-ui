import { useDirectMintStatus } from "@/api/directMint";
import { useMessage } from "@/api/bridge";
import { directMintDestinationEid, IBridgeRoute } from "@/config/bridgeRoutes";
import { BRIDGE_ROUTE_CHAIN, IS_MAINNET, LAYER_ZERO_STATUS } from "@/constants";
import { IDirectMintStatus, IMessage } from "@/types";
import { createLogger } from "@/utils/debug";

const log = createLogger('DIRECT_MINT_BRIDGE').child('TRACKING');

// Same cadence as MintWaitingModal
const POLL_INTERVAL = 10000;

export type DirectMintBridgePhase =
    // Payment seen / mint in progress (404, received, created)
    | "pending"
    | "delayed"
    // Mint executed, the executor's LayerZero send is on its way
    | "bridging"
    | "delivered"
    // Minted, but no bridge — the FXRP stayed with the Personal Account on Flare
    | "memo_skipped"
    // Minted, bridge could not run — recovery (part 2) releases the FXRP
    | "awaiting_recovery"
    | "error"
    | "delivery_failed";

export interface IDirectMintBridgeTracking {
    phase: DirectMintBridgePhase;
    delayedTo?: string;
    errorMessage?: string;
}

const LZ_FAILED: string[] = [LAYER_ZERO_STATUS.FAILED, LAYER_ZERO_STATUS.BLOCKED, LAYER_ZERO_STATUS.PAYLOAD_STORED];

// The mint executed as a bridge and the executor's send is known
function bridgeTxHashOf(status: IDirectMintStatus | null | undefined): string | undefined {
    return status?.status === "executed" && status.type === "BRIDGE" && status.action?.action === "BRIDGE"
        ? status.tx_hash ?? undefined
        : undefined;
}

// Where the transfer stands, from the last smart-accounts status and the route's LayerZero message
function derivePhase(
    status: IDirectMintStatus | null | undefined,
    message: IMessage | undefined,
    route: IBridgeRoute | undefined
): IDirectMintBridgeTracking {
    switch (status?.status) {
        case "error":
            return { phase: "error", errorMessage: status.error ?? undefined };
        case "memo_skipped":
        case "awaiting_recovery":
            return { phase: status.status };
        case "delayed":
            return { phase: "delayed", delayedTo: status.delayed_to ?? undefined };
    }
    if (!bridgeTxHashOf(status)) return { phase: "pending" };
    if (!message) return { phase: "bridging" };

    if (LZ_FAILED.includes(message.status?.name)) {
        return { phase: "delivery_failed", errorMessage: message.status?.message };
    }
    if (message.status?.name !== LAYER_ZERO_STATUS.DELIVERED) return { phase: "bridging" };

    // Hyperliquid: the compose onto Core must succeed too — failed means the FXRP stayed on HyperEVM
    if (route?.to === BRIDGE_ROUTE_CHAIN.HYPER_CORE) {
        const compose = message.destination?.lzCompose?.status;
        if (compose === "FAILED") return { phase: "delivery_failed" };
        if (compose !== "SUCCEEDED") return { phase: "bridging" };
    }
    return { phase: "delivered" };
}

/**
 * After the XRP payment: smart-accounts status until the executor has minted and sent the
 * FXRP, then LayerZero Scan until it is delivered on the route's destination. Both queries poll
 * by themselves and stop once their answer is final; the phase is derived from the two answers.
 */
export function useDirectMintBridgeTracking(xrplTxHash: string | undefined, route?: IBridgeRoute): IDirectMintBridgeTracking {
    const destinationEid = route ? directMintDestinationEid(route, IS_MAINNET) : undefined;
    // The executor's tx can carry more than one message — the route's is the one to its EID
    const routeMessage = (messages: IMessage[] | undefined) => messages?.find(item => item.pathway.dstEid === destinationEid);

    const status = useDirectMintStatus(xrplTxHash ?? "", !!xrplTxHash, data => {
        // React Query also calls this for a disabled query (modal closed) — log only real polls
        if (xrplTxHash) log.log('status:', { xrplTxHash, status: data?.status ?? '404 (not indexed yet)', type: data?.type, txHash: data?.tx_hash, error: data?.error, delayedTo: data?.delayed_to, payload: data?.payload?.type });
        // Keep asking until the mint ends: a final status, or the executor's send is known
        return bridgeTxHashOf(data) || ["error", "memo_skipped", "awaiting_recovery"].includes(data?.status ?? "")
            ? false
            : POLL_INTERVAL;
    });

    const bridgeTxHash = bridgeTxHashOf(status.data);
    const messages = useMessage(bridgeTxHash ?? "", !!bridgeTxHash, data => {
        const message = routeMessage(data);
        const phase = derivePhase(status.data, message, route).phase;
        if (bridgeTxHash) log.log('LayerZero:', { bridgeTxHash, destinationEid, status: message?.status?.name ?? 'not found yet', compose: message?.destination?.lzCompose?.status, phase });
        return phase === "bridging" ? POLL_INTERVAL : false;
    });

    return derivePhase(status.data, routeMessage(messages.data), route);
}
