import React, { useState, useEffect } from "react";
import {
    Container,
    Title,
    Grid,
    Text,
    Anchor,
    rem
} from "@mantine/core";
import { IconArrowUpRight, IconExclamationCircle } from "@tabler/icons-react";
import { useScrollIntoView } from "@mantine/hooks";
import { useTranslation, Trans } from "react-i18next";
import UnderlyingBalanceCard from "@/components/cards/UnderlyingBalanceCard";
import BalanceCard from "@/components/cards/BalanceCard";
import LatestTransactionsCard from "@/components/cards/LatestTransactionsCard";
import FaucetCard from "@/components/cards/FaucetCard";
import { IFAssetCoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS } from "@/config/coin";
import classes from "@/styles/pages/Mint.module.scss";
import { useMintEnabled } from "@/api/minting";
import { NETWORK_FLARE, NETWORK_FLARE_COSTON2_TESTNET, NETWORK_SONGBIRD } from "@/config/networks";

export default function Mint() {
    const [fAssetCoins, setFAssetCoins] = useState<IFAssetCoin[]>([]);
    const { t } = useTranslation();
    const { connectedCoins, mainToken } = useWeb3();
    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
        offset: 60,
    });

    const mintEnabled = useMintEnabled();
    const disabledFassets = mintEnabled.data?.filter(item => !item.status)?.map(item => item.fasset) ?? [];

    useEffect(() => {
        const coins: IFAssetCoin[] = [];
        COINS
            .filter(coin => coin.enabled && coin.isFAssetCoin)
            .forEach(coin => {
                const connectedCoin = connectedCoins.find(connectedCoin => connectedCoin.type === coin.type);
                coins.push({ ...coin, address: connectedCoin?.address, connectedWallet: connectedCoin?.connectedWallet } as IFAssetCoin);
            });
        setFAssetCoins(coins);
    }, [connectedCoins]);

    return (
        <Container fluid className={`${classes.container} mt-8`}>
            {!mainToken?.network.mainnet &&
                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <FaucetCard />
                    </Grid.Col>
                </Grid>
            }
            <Title
                fw={300}
                className="text-32 mb-5"
            >
                {t('dashboard.balance_title')}
            </Title>
            {disabledFassets.length > 0 &&
                <div className="flex items-center border border-[var(--flr-green)] bg-[var(--flr-lightest-green)] rounded-sm p-2">
                    <IconExclamationCircle
                        size={25}
                        color="var(--flr-green)"
                        className="mr-2 flex-shrink-0"
                    />
                    <Trans
                        i18nKey={`dashboard.winddown_label`}
                        values={{ fAssets: disabledFassets.join(', ') }}
                        components={{
                            a1: <Anchor
                                underline="always"
                                href={process.env.WIND_DOWN_BLOG_URL}
                                target="_blank"
                                className="inline-flex"
                                fw={400}
                                c="var(--flr-black)"
                            />,
                            a2: <Anchor
                                underline="always"
                                href="https://v3.dex.enosys.global/"
                                target="_blank"
                                className="inline-flex"
                                fw={400}
                                c="var(--flr-black)"
                            />,
                            a3: <Anchor
                                underline="always"
                                href="https://app.blazeswap.xyz/swap/"
                                target="_blank"
                                className="inline-flex"
                                fw={400}
                                c="var(--flr-black)"
                            />
                        }}
                        parent={Text}
                        fw={400}
                        className="text-16"
                        c="var(--flr-black)"
                    />
                </div>
            }
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }} className="mt-5">
                    <BalanceCard
                        onViewPendingTransactionsClick={() => scrollIntoView()}
                        disabledFassets={disabledFassets}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }} className="mt-5">
                    {fAssetCoins.map(coin =>
                        <UnderlyingBalanceCard
                            fAssetCoin={coin}
                            key={'card_' + coin.type}
                            className="mb-2"
                        />
                    )}
                    {(!mainToken?.network.mainnet || ![NETWORK_FLARE.chainId, NETWORK_SONGBIRD.chainId].includes(mainToken.network.chainId)) &&
                        <Trans
                            i18nKey={'dashboard.know_more_label'}
                            components={{
                                a: <Anchor
                                    underline="always"
                                    href="https://youtu.be/eYxB-epe3fA"
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
                            className="text-center mt-5 text-14"
                        />
                    }
                </Grid.Col>
            </Grid>
            <Title
                fw={300}
                className="mt-10 text-32"
            >
                {t('dashboard.latest_transactions_title')}
            </Title>
            <Title
                fw={300}
                className="mb-5 text-18"
                ref={targetRef}
            >
                {t('dashboard.latest_transactions_subtitle')}
            </Title>
            <LatestTransactionsCard />
        </Container>
    );
}

Mint.protected = true;
