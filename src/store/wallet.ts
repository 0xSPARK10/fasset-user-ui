import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface IWalletState {
    connectedWallet: string|undefined;
    setConnectedWallet: (wallet: string) => void;
    resetWallet: () => void;
}

export const useWalletStore = create<IWalletState>()(
    persist(
        (set) => ({
            connectedWallet: undefined,
            setConnectedWallet: (wallet: string) => set((state) => ( { connectedWallet: wallet })),
            resetWallet: () => set({
                connectedWallet: undefined
            })
        }),
        {
            name: 'walletStore',
            storage: createJSONStorage(() => localStorage)
        }
    )
)
