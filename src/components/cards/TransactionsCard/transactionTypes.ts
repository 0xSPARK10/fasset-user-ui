import { IOFTHistory, IUserProgress } from "@/types";

export interface ITicket {
    ticketId: string;
    value: string;
    type: string;
    status: boolean;
}

export interface ITransaction extends IUserProgress {
    tickets?: ITicket[];
}

export interface IBridgeTransaction extends IOFTHistory {
    tickets?: ITicket[];
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
export const LATEST_TRANSACTIONS_REFRESH_INTERVAL = 30000;
