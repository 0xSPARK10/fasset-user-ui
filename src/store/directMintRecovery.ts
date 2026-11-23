import { create } from "zustand";

interface IDirectMintRecoveryState {
    // Original (stuck) XRPL hash → recovery payment hash
    sent: Record<string, string>;
    markSent: (xrplTxHash: string, recoveryTxHash: string) => void;
}

/**
 * Recovery payments sent from this tab. The backend sees one only after a few minutes and offers
 * the RecoveryMemo until then, so this keeps the user from paying twice — outside the React Query
 * cache, which is cleared on wallet connect / network switch. In memory only: lost on a reload.
 */
export const useDirectMintRecoveryStore = create<IDirectMintRecoveryState>()((set) => ({
    sent: {},
    markSent: (xrplTxHash, recoveryTxHash) => set(state => ({
        sent: { ...state.sent, [xrplTxHash]: recoveryTxHash },
    })),
}));
