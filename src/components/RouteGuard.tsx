import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LoadingOverlay } from "@mantine/core";
import { useWeb3 } from "@/hooks/useWeb3";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";

export default function AuthGuard({ children }: { children: React.ReactNode}) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const { isConnected, walletConnectConnector } = useWeb3();
    const { isConnectWalletModalActive } = useConnectWalletModal();

    const isWalletConnected = useCallback(async () => {
        if (isConnected || isConnectWalletModalActive) {
            setIsLoading(false);
            return;
        }

        const redirectStatus = await router.push({
            pathname: "/connect",
            query: { redirect: router.asPath },
        });

        if (redirectStatus) setIsLoading(false);
    }, [isConnected, isConnectWalletModalActive, router]);

    useEffect(() => {
        if (
            walletConnectConnector.isInitializing ||
            !walletConnectConnector.hasCheckedPersistedSession
        )
            return;

        isWalletConnected();
    }, [
        walletConnectConnector.isInitializing,
        walletConnectConnector.hasCheckedPersistedSession,
        isWalletConnected,
    ]);

    useEffect(() => {
        router.events.on("routeChangeComplete", isWalletConnected);
        return () => {
            router.events.off("routeChangeComplete", isWalletConnected);
        };
    }, [router.events, isWalletConnected]);

    if (isLoading) {
        return <LoadingOverlay
            visible={true}
            zIndex={1000}
        />;
    }

    return children;
}
