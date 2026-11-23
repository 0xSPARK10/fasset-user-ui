import { IMessage } from "@/types";
import { BRIDGE_CHAIN, LAYER_ZERO_STATUS } from "@/constants";
import { BRIDGE_CHAIN_EID, BRIDGE_SOURCE_OFT } from "@/config/bridge";
import { formatUnit } from "@/utils";
import { formatBalanceAmount } from "@/core/fees";
import { IBridgeTransaction, ACTION_TYPE_REMOTE, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM } from "./transactionTypes";

// Same window as the backend's oft/userHistory
const HISTORY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// LayerZero statuses that will not deliver without intervention
const FAILED_STATUSES: string[] = [LAYER_ZERO_STATUS.FAILED, LAYER_ZERO_STATUS.BLOCKED, LAYER_ZERO_STATUS.PAYLOAD_STORED];

const FLARE_EIDS = [BRIDGE_CHAIN_EID[BRIDGE_CHAIN.FLARE].mainnet, BRIDGE_CHAIN_EID[BRIDGE_CHAIN.FLARE].testnet];

// recipient (bytes32) + amountSD (uint64) — anything longer carries a compose message
const OFT_PAYLOAD_HEX_LENGTH = 2 + 64 + 16;

// Our FXRP OFTs on the remote chains — the wallet endpoint returns every LayerZero app's messages
const REMOTE_OFT_ADDRESSES = Object.entries(BRIDGE_SOURCE_OFT)
    .filter(([chain, oft]) => chain !== BRIDGE_CHAIN.FLARE && !!oft.address)
    .map(([, oft]) => oft.address!.toLowerCase());

/**
 * OFT message payload = recipient (bytes32) + amountSD (uint64) [+ compose part].
 * FXRP has 6 shared decimals = its local decimals, so amountSD is the raw 6-decimal amount.
 */
function payloadAmount(payload?: string): string | undefined {
    const amountHex = payload?.slice(2 + 64, 2 + 64 + 16);
    if (!amountHex || !/^[0-9a-fA-F]{16}$/.test(amountHex)) return undefined;
    // Floored to 2 decimals like the backend rows next to it
    return formatBalanceAmount(formatUnit(BigInt(`0x${amountHex}`), 6), 2);
}

/**
 * FXRP transfers the backend does not list, as history rows:
 * - remote → remote (e.g. Sepolia → HyperEVM), any status — the backend only sees Flare.
 * - remote → Flare until LayerZero delivers it: the backend adds its row (with redeem details)
 *   only once the message reaches Flare. A compose part = bridge + redeem to XRPL (the redeem
 *   composer is the only compose on Flare). `backendIds` (backend rows' `txhash` and `guid`) drops
 *   one the backend already has — by `guid` once delivered, the backend row has the Flare tx hash.
 * Flare → remote is skipped — the backend lists it from the moment it is sent.
 */
export function remoteTransfersFromLayerZero(
    messages: IMessage[] | undefined,
    fasset: string,
    backendIds: Set<string>,
): IBridgeTransaction[] {
    if (!messages) return [];
    const since = Date.now() - HISTORY_WINDOW_MS;

    // The wallet endpoint returns every LayerZero app's messages — read them defensively, so one
    // odd message cannot take the whole history card (backend rows included) down with it
    return messages
        .filter(message => {
            if (!REMOTE_OFT_ADDRESSES.includes(message?.pathway?.sender?.address?.toLowerCase() ?? '')) return false;
            if (!message.source?.tx?.txHash || FLARE_EIDS.includes(message.pathway.srcEid)) return false;
            if ((message.source.tx.blockTimestamp ?? 0) * 1000 < since) return false;
            if (!FLARE_EIDS.includes(message.pathway.dstEid)) return true;
            return message.status?.name !== LAYER_ZERO_STATUS.DELIVERED
                && !backendIds.has(message.source.tx.txHash.toLowerCase())
                && !backendIds.has(message.guid?.toLowerCase() ?? '');
        })
        .map(message => {
            const toFlare = FLARE_EIDS.includes(message.pathway.dstEid);
            const hasCompose = (message.source.tx.payload?.length ?? 0) > OFT_PAYLOAD_HEX_LENGTH;
            const isRedeem = toFlare && hasCompose;
            return {
                // Remote → Flare: RECEIVE / REDEEM render with the remote chain from `eid`
                action: toFlare ? (isRedeem ? ACTION_TYPE_REDEEM : ACTION_TYPE_RECEIVE) : ACTION_TYPE_REMOTE,
                timestamp: message.source.tx.blockTimestamp * 1000,
                srcEid: message.pathway.srcEid,
                eid: toFlare ? message.pathway.srcEid : message.pathway.dstEid,
                txhash: message.source.tx.txHash,
                amount: payloadAmount(message.source.tx.payload) ?? '--',
                fasset,
                status: message.status?.name === LAYER_ZERO_STATUS.DELIVERED,
                // Not "in progress" forever — the table shows these as failed
                defaulted: FAILED_STATUSES.includes(message.status?.name),
                // Remote → remote with a compose part = the Hyperliquid composer on HyperEVM
                toHypercore: !toFlare && hasCompose,
                fromLayerZero: true,
            } as IBridgeTransaction;
        });
}
