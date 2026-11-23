import { IOFTHistory, IUserProgress } from "@/types";

export interface ITicket {
    ticketId: string;
    value: string;
    type: string;
    status: boolean;
}

export interface ITransaction extends IUserProgress {
    tickets?: ITicket[];
    // Bridge table only: a mint / redeem row among the OFT rows (fullHistory mixes both)
    isProgress?: boolean;
}

export interface IBridgeTransaction extends IOFTHistory {
    tickets?: ITicket[];
    // Remote → remote transfers only (from LayerZero Scan) — `eid` is then the destination
    srcEid?: number;
    // Built from LayerZero Scan (remote → remote, or remote → Flare not delivered yet) — its
    // tx links to LayerZero Scan, a failed delivery reads "Failed"
    fromLayerZero?: boolean;
    // Hyperliquid ↔ HyperEVM (from the Core ledger) — `txhash` is a Hyperliquid hash
    hyperCoreDirection?: 'to_evm' | 'to_core';
}

export interface IUnderlyingTransactionData {
    fAsset: string;
    fAssetAmount: string;
    amount: string;
    destinationAddress: string;
    paymentReference: string;
    agentName: string;
    lastUnderlyingBlock: string;
    expirationMinutes: string;
}

export const ACTION_TYPE_MINT = 'mint';
export const ACTION_TYPE_REDEEM = 'redeem';
export const ACTION_TYPE_SEND = 'send';
export const ACTION_TYPE_RECEIVE = 'receive';
export const ACTION_TYPE_REDEEM_FAIL = 'redeemfail';
// OFT transfer between two remote chains (no Flare on either side) — built from LayerZero Scan
export const ACTION_TYPE_REMOTE = 'remote';
// XRP → FXRP on a remote chain in one XRP payment (backend row, needs userHistory?xrpAddress=)
export const ACTION_TYPE_DIRECT_MINT_BRIDGE = 'direct_mint_bridge';
// Hyperliquid ↔ HyperEVM through the FXRP system address — built from the Hyperliquid ledger
export const ACTION_TYPE_HYPERCORE = 'hypercore';
export const LATEST_TRANSACTIONS_REFRESH_INTERVAL = 30000;
