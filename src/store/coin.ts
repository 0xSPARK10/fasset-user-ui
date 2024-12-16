import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ICoin {
    type: string;
    address: string;
    xpub?: string;
    connectedWallet?: string;
    accountAddresses?: {
        receiveAddresses: string[];
        changeAddresses: string[];
    }
}

interface IConnectedCoinState {
    localConnectedCoins: ICoin[];
    addConnectedCoin: (coin: ICoin) => void;
    updateConnectedCoin: (address: string, updatedCoin: ICoin) => void;
    removeConnectedCoin: (address: string) => void;
    resetConnectedCoins: () => void;
}

export const useConnectedCoin = create<IConnectedCoinState>()(
    persist(
        (set) => ({
            localConnectedCoins: [],
            addConnectedCoin: (coin: ICoin) => set((state) => ({
                localConnectedCoins: [...state.localConnectedCoins, coin]
            })),
            updateConnectedCoin: (address: string, updatedCoin: ICoin) => {
                set((state) => ({
                    localConnectedCoins: state.localConnectedCoins.map((coin) =>
                        coin.address === address ? updatedCoin : coin
                    ),
                }));
            },
            removeConnectedCoin: (address: string) => {
                set((state) => ({
                    localConnectedCoins: state.localConnectedCoins.filter((coin) => coin.address !== address),
                }));
            },
            resetConnectedCoins: () => set({
                localConnectedCoins: []
            })
        }),
        {
            name: 'coinStore',
            storage: createJSONStorage(() => localStorage)
        }
    )
)
