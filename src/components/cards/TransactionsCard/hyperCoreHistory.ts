import { IHyperCoreLedgerUpdate } from "@/types";
import { BRIDGE_CHAIN, IS_MAINNET } from "@/constants";
import { bridgeChainEid } from "@/config/bridge";
import { formatBalanceAmount } from "@/core/fees";
import { IHyperCoreToken, pickHyperCoreTransfers } from "@/core/hypercore";
import { ACTION_TYPE_HYPERCORE, IBridgeTransaction } from "./transactionTypes";

// Same window as the backend's oft/userHistory
const HISTORY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const HYPERLIQUID_EXPLORER_TX_URL = IS_MAINNET
    ? 'https://app.hyperliquid.xyz/explorer/tx'
    : 'https://app.hyperliquid-testnet.xyz/explorer/tx';

/**
 * Hyperliquid ↔ HyperEVM transfers from the wallet's Core ledger, as history rows. Neither the
 * backend nor LayerZero Scan sees them (no LayerZero message). Finished, except HyperEVM →
 * Hyperliquid while Core still holds FXRP in escrow; the hash is a Hyperliquid (Core) hash.
 */
export function hyperCoreTransfersFromLedger(
    updates: IHyperCoreLedgerUpdate[] | undefined,
    wallet: string,
    token: IHyperCoreToken | null | undefined,
    fasset: string,
    // FXRP from HyperEVM still held in Core's escrow — those HyperEVM → Hyperliquid rows are not done
    hasEscrow: boolean = false,
): IBridgeTransaction[] {
    const transfers = pickHyperCoreTransfers(updates, wallet, token ?? undefined, Date.now() - HISTORY_WINDOW_MS);

    return transfers.map(transfer => ({
        action: ACTION_TYPE_HYPERCORE,
        timestamp: transfer.time,
        eid: bridgeChainEid(BRIDGE_CHAIN.HYPER_EVM, IS_MAINNET),
        txhash: transfer.hash,
        amount: formatBalanceAmount(transfer.amount, 2),
        fasset,
        // The ledger lists the credit as soon as Core sees the transfer; with an escrow left the
        // FXRP is not spendable yet (Core account missing) — in progress until it clears
        status: !(hasEscrow && transfer.direction === 'to_core'),
        defaulted: false,
        toHypercore: transfer.direction === 'to_core',
        hyperCoreDirection: transfer.direction,
    } as IBridgeTransaction));
}
