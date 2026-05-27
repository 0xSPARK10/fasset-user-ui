import { AppShell, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import { useInterval } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import { useWeb3 } from "@/hooks/useWeb3";
import { useFassetState } from "@/api/user";
import { usePools, useUserPools } from "@/api/pool";
import { useModalState } from "@/hooks/useModalState";
import { COINS } from "@/config/coin";

export interface ILayout {
    children?: React.ReactNode;
}

const REDEMPTION_STATUS_FETCH_INTERVAL = 300000;

export default function Layout({ children, ...props }: ILayout) {
    const [redirectBackUrl, setRedirectBackUrl] = useState<string>();

    const { t } = useTranslation();
    const { walletConnectConnector, isConnected, connectedCoins, mainToken } = useWeb3();
    const { isMintModalActive, isRedeemModalActive } = useModalState();

    const pools = usePools(COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type), false);
    const userPools = useUserPools(
        mainToken?.address!,
        connectedCoins.filter(coin => coin.address && coin.isFAssetCoin).map(coin => coin.type),
        false
    );
    const fassetState = useFassetState();
    const pausedTokens = fassetState.data?.filter(item => item.state)?.map(item => item.fasset);

    const router = useRouter();
    const userPoolInterval = useInterval(() => {
        userPools.refetch();
    }, REDEMPTION_STATUS_FETCH_INTERVAL);
    const poolInterval = useInterval(() => {
        pools.refetch();
    }, REDEMPTION_STATUS_FETCH_INTERVAL);


    useEffect(() => {
        const handleBackButton = async () => {
            if (redirectBackUrl) {
                setRedirectBackUrl(undefined);
                await router.push(redirectBackUrl);
            }
        }

        const routeChangeStart = () => {
            fassetState.refetch();
            if (!isConnected && (window.history.state?.as !== '/mint' || window.history.state?.as !== '/bridge')) {
                setRedirectBackUrl(window.history.state?.as?.replace(router.basePath, '') ?? '');
            }
        }

        window.addEventListener('popstate', handleBackButton);
        router.events.on('routeChangeStart', routeChangeStart)

        return () => {
            window.removeEventListener('popstate', handleBackButton);
            router.events.off('routeChangeStart', routeChangeStart);
        }
    }, [redirectBackUrl, isConnected]);

    useEffect(() => {
        if (walletConnectConnector.isInitializing || !walletConnectConnector.hasCheckedPersistedSession) return;

        if (isConnected) {
            userPoolInterval.start();
            poolInterval.stop();
        } else {
            poolInterval.start();
            userPoolInterval.stop();
        }

    }, [walletConnectConnector.isInitializing, walletConnectConnector.hasCheckedPersistedSession, isConnected]);

    useEffect(() => {
        if (isMintModalActive || isRedeemModalActive) {
            fassetState.refetch();
        }
    }, [isMintModalActive, isRedeemModalActive]);

    return (
        <>
            <Head>
                <title>{ t('meta.title') }</title>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileColor" content="#b91d47" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <AppShell>
                <AppShell.Main className="flex flex-col">
                    {pausedTokens && pausedTokens?.length > 0 &&
                        <div className="flex items-center justify-center bg-[var(--flr-red)] py-2">
                            <IconAlertTriangle
                                size={24}
                                color="var(--flr-white)"
                                className="flex-shrink-0"
                            />
                            <Text
                                className="text-16 ml-4"
                                fw={400}
                                c="var(--flr-white)"
                            >
                                {t('layout.fasset_system_paused_label', { tokens: pausedTokens.join(', ')})}
                            </Text>
                        </div>
                    }
                    <Header />
                    <div className="flex flex-1 w-full">
                        <div className="flex flex-col w-full">
                            {children}
                        </div>
                    </div>
                    <Footer />
                </AppShell.Main>
            </AppShell>
        </>
    );
}
