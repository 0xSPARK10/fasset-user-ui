import {
    AppShell,
    Burger,
    Container,
    Drawer, 
    Text,
    Title
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import Link from "next/link";
import { useInterval } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import ConnectWalletButton from "@/components/elements/ConnectWalletButton";
import LogoIcon from "@/components/icons/LogoIcon";
import FlareIcon from "@/components/icons/FlareIcon";
import SgbAltIcon from "@/components/icons/SgbAltIcon";
import ChainSwitcher from "@/components/elements/ChainSwitcher";
import { useWeb3 } from "@/hooks/useWeb3";
import { useFassetState } from "@/api/user";
import { usePools, useUserPools } from "@/api/pool";
import { useModalState } from "@/hooks/useModalState";
import { COINS } from "@/config/coin";
import { CoinEnum } from "@/types";
import { useVersion } from "@/api/version";

export interface ILayout {
    children?: React.ReactNode;
}

const REDEMPTION_STATUS_FETCH_INTERVAL = 300000;

export default function Layout({ children, ...props }: ILayout) {
    const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
    const [redirectBackUrl, setRedirectBackUrl] = useState<string>();

    const { t } = useTranslation();
    const { walletConnectConnector, isConnected, connectedCoins, mainToken } = useWeb3();
    const { isMintModalActive, isRedeemModalActive } = useModalState();

    const isTestnet = process.env.NETWORK === 'testnet';
    const version = useVersion(isTestnet);

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
            if (!isConnected && window.history.state.as !== '/mint') {
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
                    <Container
                        fluid
                        className="flex justify-between p-2 bg-white px-[10px] md:px-[26px] w-full items-center border-b  border-[--flr-border-color]"
                    >
                        <div className="flex items-center">
                            <Link
                                href="/"
                            >
                                <LogoIcon width="44" height="44" />
                            </Link>
                            <div className="ml-1">
                                <Title
                                    className="text-14"
                                    fw={300}
                                >
                                    {t('layout.header.title')}
                                </Title>
                                <div className="flex items-center">
                                    {mainToken?.type === CoinEnum.SGB
                                        ? <SgbAltIcon width="18" height="18" />
                                        : <FlareIcon width="10" height="10" />
                                    }
                                    <Text
                                        className="ml-1 text-10"
                                        fw={300}
                                        c="var(--flr-dark-gray)"
                                    >
                                        {mainToken?.network?.mainnet
                                            ? (mainToken?.type === CoinEnum.SGB
                                                    ? t('layout.header.songbird_label')
                                                    : t('layout.header.flare_label')
                                            )
                                            : t('layout.header.beta_label')
                                        }
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center">
                            <Link
                                href="/"
                                className={`text-14 font-light mr-8 ${router.pathname === '/' ? 'underline underline-offset-4' : ''}`}
                            >
                                {t('layout.header.home_label')}
                            </Link>
                            <Link
                                href="/mint"
                                className={`text-14 font-light mr-8 ${router.pathname === '/mint' ? 'underline underline-offset-4' : ''}`}
                            >
                                {t('layout.header.mint_label')}
                            </Link>
                            <Link
                                href="/pools"
                                className={`text-14 font-light mr-8 ${router.pathname.includes('pools') ? 'underline underline-offset-4' : ''}`}
                            >
                                {t('layout.header.agents_label')}
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <ChainSwitcher className="mr-2 sm:mr-5" />
                            <ConnectWalletButton />
                            <Burger
                                opened={isMenuOpened}
                                onClick={() => setIsMenuOpened(!isMenuOpened)}
                                size={25}
                                className="block sm:hidden ml-4"
                            />
                        </div>
                    </Container>
                    <div className="flex flex-1 w-full">
                        <div className="flex flex-col w-full">
                            {children}
                        </div>
                    </div>
                    <Container
                        fluid
                        className="flex flex-col md:flex-row justify-between md:items-center px-[15px] py-3 w-full mt-5 bg-[var(--flr-lightest-gray)]"
                    >
                        <div className="flex flex-wrap items-center pb-4 md:pb-0 md:ml-0 md:mr-5">
                            <Link
                                href="https://dev.flare.network/fassets/overview/"
                                target="_blank"
                                className="font-normal text-12 border-r pr-3 mr-3 border-[--flr-border-color]"
                            >
                                {t('layout.footer.documentation_label')}
                            </Link>
                            <Link
                                href="https://dev.flare.network/fassets/guides/deploy-fassets-agent"
                                target="_blank"
                                className={`font-normal text-12 ${isTestnet ? 'pr-3 mr-3 border-r border-[--flr-border-color]' : ''}`}
                            >
                                {t('layout.footer.become_an_fasset_agent_label')}
                            </Link>
                            {isTestnet &&
                                <div className="inline">
                                    <p
                                        className="inline font-normal text-12 border-r pr-3 mr-3 border-[--flr-border-color]"
                                    >
                                        {t('layout.footer.fe_version', { version: process.env.APP_VERSION })}
                                    </p>
                                    <p
                                        className="inline font-normal text-12"
                                    >
                                        {t('layout.footer.be_version', { version: version.data })}
                                    </p>
                                </div>
                            }
                        </div>
                    </Container>
                </AppShell.Main>
                <Drawer
                    opened={isMenuOpened}
                    onClose={() => setIsMenuOpened(false)}
                    size="100%"
                    position="right"
                    styles={{
                        close: {
                            transform: 'scale(1.5)'
                        },
                        content: {
                            overflowY: 'unset',
                            height: '100%'
                        },
                        body: {
                            height: '100%'
                        }
                    }}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <Link
                            href="/"
                            className={`font-light text-32 mb-8 ${router.pathname === '/' ? 'underline underline-offset-4' : ''}`}
                            onClick={() => setIsMenuOpened(false)}
                        >
                            {t('layout.header.home_label')}
                        </Link>
                        <Link
                            href="/mint"
                            className={`font-light text-32 mb-8 ${router.pathname === '/mint' ? 'underline underline-offset-4' : ''}`}
                            onClick={() => setIsMenuOpened(false)}
                        >
                            {t('layout.header.mint_label')}
                        </Link>
                        <Link
                            href="/pools"
                            className={`font-light text-32 mb-8 ${router.pathname.includes('pools') ? 'underline underline-offset-8' : ''}`}
                            onClick={() => setIsMenuOpened(false)}
                        >
                            {t('layout.header.agents_label')}
                        </Link>
                    </div>
                </Drawer>
            </AppShell>
        </>
    );
}
