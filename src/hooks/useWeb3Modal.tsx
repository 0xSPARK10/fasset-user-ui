import React, { createContext, useContext, useState } from 'react';
import { useRouter } from "next/router";
import { useConnectedCoin } from "@/store/coin";
import ConnectWalletModal from "@/components/modals/ConnectWalletModal";
import SessionExpiredModal from "@/components/modals/SessionExpiredModal";
import { useWeb3 } from "@/hooks/useWeb3";

type ConnectWalletModalContextType = {
    openConnectWalletModal: (callback?: (wallet: string) => void) => void;
    closeConnectWalletModal: (callback?: () => void, redirect?: boolean) => void;
    openConnectWalletModalCallback?: (wallet: string) => void;
    isConnectWalletModalActive: boolean;
    openSessionExpiredModal: () => void;
    closeSessionExpiredModal: () => void;
};

const ConnectWalletModalContext = createContext<ConnectWalletModalContextType | null>(null);

export const Web3ModalProvider = ({ children }: React.PropsWithChildren<{ children: JSX.Element }>) => {
    const [openConnectWalletModalCallback, setOpenConnectWalletModalCallback] = useState<() => void>();
    const [isConnectWalletModalActive, setIsConnectWalletModalActive] = useState<boolean>(false);
    const { localConnectedCoins, } = useConnectedCoin();
    const { disconnect, connectedWallets, mainToken } = useWeb3();
    const [isSessionExpiredModalActive, setIsSessionExpiredModalActive] = useState<boolean>(false);
    const router = useRouter();

    const closeConnectWalletModal = async (callback?: () => void, redirect: boolean = true) => {
        setIsConnectWalletModalActive(false);
        if (callback) {
            callback();
            setOpenConnectWalletModalCallback(undefined);
        }

        const isConnectedToCoston = localConnectedCoins.find(connectedCoin => connectedCoin.type === mainToken?.type) !== undefined;
        if (redirect && !isConnectedToCoston) {
            for (const wallet of connectedWallets) {
                await disconnect(wallet, false);
            }

            if (router.pathname === '/mint') {
                await router.push('/');
            }
        }
    }

    const openConnectWalletModal = (callback?: (wallet: string) => void) => {
        if (callback) setOpenConnectWalletModalCallback(() => callback);
        setIsConnectWalletModalActive(true);
    }

    const openSessionExpiredModal = () => {
        setIsSessionExpiredModalActive(true);
    }

    const closeSessionExpiredModal = async () => {
        setIsSessionExpiredModalActive(false);
        for (const wallet of connectedWallets) {
            await disconnect(wallet, false);
        }
        await router.push('/');
    }

    return (
        <ConnectWalletModalContext.Provider
            value={{
                closeConnectWalletModal: closeConnectWalletModal,
                openConnectWalletModal: openConnectWalletModal,
                openConnectWalletModalCallback: openConnectWalletModalCallback,
                isConnectWalletModalActive: isConnectWalletModalActive,
                openSessionExpiredModal: openSessionExpiredModal,
                closeSessionExpiredModal: closeSessionExpiredModal
            }}
        >
            {children}
            <ConnectWalletModal
                opened={isConnectWalletModalActive}
                onClose={closeConnectWalletModal}
            />
            <SessionExpiredModal
                opened={isSessionExpiredModalActive}
                onClose={closeSessionExpiredModal}
            />
        </ConnectWalletModalContext.Provider>
    );
};

export function useConnectWalletModal(): ConnectWalletModalContextType {
    const value = useContext(ConnectWalletModalContext);

    if (!value) {
        throw new Error('Must be used inside Web3-React provider');
    }

    return value as NonNullable<ConnectWalletModalContextType>;
}
