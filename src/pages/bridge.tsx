import { Trans, useTranslation } from "react-i18next";
import { Anchor, Button, Container, Grid, rem, Text, Title } from "@mantine/core";
import BridgeBalanceCard from "@/components/cards/BridgeBalanceCard";
import classes from "@/styles/pages/Mint.module.scss";
import { useWeb3 } from "@/hooks/useWeb3";
import { CoinEnum, IFAssetCoin } from "@/types";
import React, { useMemo, useState } from "react";
import { COINS } from "@/config/coin";
import BridgeUnderlyingBalanceCard from "@/components/cards/BridgeUnderlyingBalanceCard";
import { GetServerSideProps } from "next";
import LatestTransactionsCard from "@/components/cards/LatestTransactionsCard";
import { IconArrowUpRight } from "@tabler/icons-react";
import { NETWORK_FLARE_COSTON2_TESTNET } from "@/config/networks";

export default function Bridge() {
    const { t } = useTranslation();
    const { connectedCoins, mainToken } = useWeb3();
    const [latestTransactionCardKey, setLatestTransactionCardKey] = useState<number>(0);

    const fAssetCoins = useMemo<IFAssetCoin[]>(() => {
        return COINS
            .filter(coin => coin.enabled && coin.isFAssetCoin)
            .map(coin => {
                const connectedCoin = connectedCoins.find(
                    connectedCoin => connectedCoin.type === coin.type
                );

                return {
                    ...coin,
                    address: connectedCoin?.address,
                    connectedWallet: connectedCoin?.connectedWallet,
                } as IFAssetCoin;
            });
    }, [connectedCoins]);

    return (
        <Container fluid className={`${classes.container} mt-8`}>
            <Title
                fw={300}
                className="text-32 mt-5"
            >
                {t('bridge.title')}
            </Title>
            <Grid
                gutter="md"
                className="mt-5"
            >
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <BridgeBalanceCard />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    {/*fAssetCoins.map(coin =>
                        <UnderlyingBalanceCard
                            fAssetCoin={coin}
                            key={'card_' + coin.type}
                            className="mb-2"
                        />
                    )*/}
                    <BridgeUnderlyingBalanceCard />
                    <Trans
                        i18nKey={'bridge.hyperliquid_trading_platform_label'}
                        components={{
                            a: <Anchor
                                underline="always"
                                href={mainToken?.network?.chainId === NETWORK_FLARE_COSTON2_TESTNET.chainId
                                    ? 'https://app.hyperliquid-testnet.xyz/trade'
                                    : 'https://app.hyperliquid.xyz/trade'
                                }
                                target="_blank"
                                className="inline-flex ml-1 mt-2 text-14"
                                c="black"
                                fw={500}
                            />,
                            icon: <IconArrowUpRight
                                style={{ width: rem(20), height: rem(20) }}
                                className="ml-1"
                            />
                        }}
                        parent={Text}
                        fw={400}
                        className="text-center mt-3 text-14"
                    />
                </Grid.Col>
            </Grid>
            <Title
                fw={300}
                className="mt-10 text-32"
            >
                {t('bridge.latest_transactions_title')}
            </Title>
            <div className="block sm:flex items-center justify-between mb-5 max-w-[1080px]">
                <Title
                    fw={300}
                    className="text-18"
                >
                    {t('bridge.latest_transactions_subtitle')}
                </Title>
                <Button
                    variant="gradient"
                    size="xs"
                    radius="xl"
                    fw={400}
                    onClick={() => setLatestTransactionCardKey(latestTransactionCardKey + 1)}
                    className="mt-2 sm:mt-0"
                >
                    {t('dashboard.refresh_button')}
                </Button>
            </div>
            <LatestTransactionsCard
                refreshKey={latestTransactionCardKey}
                type="bridge"
            />
        </Container>
    )
}

Bridge.protected = true;

export const getServerSideProps: GetServerSideProps = async () => {
    if ((process.env.NETWORK === 'testnet' && process.env.TESTNET_CHAIN !== CoinEnum.C2FLR) || (process.env.NETWORK === 'mainnet' && process.env.MAINNET_CHAIN !== CoinEnum.FLR)) {
        return {
            notFound: true,
        };
    }

    return {
        props: {},
    };
}