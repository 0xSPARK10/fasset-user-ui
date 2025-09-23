import {
    Anchor,
    Button,
    Divider,
    Loader,
    LoadingOverlay,
    Paper, rem,
    SimpleGrid,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import { IconArrowUpRight, IconExclamationCircle } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { useNativeBalance, usePoolsBalance } from "@/api/balance";
import { useWeb3 } from "@/hooks/useWeb3";
import { Trans, useTranslation } from "react-i18next";
import MintModal from "@/components/modals/MintModal";
import RedeemModal from "@/components/modals/RedeemModal";
import CopyIcon from "@/components/icons/CopyIcon";
import { useFassetState, useUserProgress } from "@/api/user";
import { useModalState } from "@/hooks/useModalState";
import { ICoin, IFAssetCoin } from "@/types";
import { COINS } from "@/config/coin";
import { toNumber, truncateString } from "@/utils";
import { NETWORK_FLARE, NETWORK_FLARE_COSTON2_TESTNET, NETWORK_SONGBIRD } from "@/config/networks";

interface IBalanceCard {
    className?: string;
    onViewPendingTransactionsClick: () => void;
    disabledFassets: string[];
}

const BALANCE_FETCH_INTERVAL = 60000;
const USER_PROGRESS_FETCH_INTERVAL = 60000;

export default function BalanceCard({ className, onViewPendingTransactionsClick, disabledFassets }: IBalanceCard) {
    const [fAssetCoins, setfAssetCoins] = useState<(IFAssetCoin & { cantRedeem?: boolean })[]>([]);
    const [isMintModalActive, setIsMintModalActive] = useState<boolean>(false);
    const [isRedeemModalActive, setIsRedeemModalActive] = useState<boolean>(false);
    const { connectedCoins, mainToken } = useWeb3();
    const { t } = useTranslation();
    const [localMainToken, setLocalMainToken] = useState<ICoin>();
    const [stableCoins, setStableCoins] = useState<ICoin[]>([]);
    const activeFAssetCoin = useRef<IFAssetCoin>();
    const { setIsMintModalActive: setContextIsMintModalActive, setIsRedeemModalActive: setContextIsRedeemModalActive } = useModalState();
    const mediaQueryMatches = useMediaQuery('(max-width: 40rem)');

    const nativeBalance = useNativeBalance(localMainToken?.address ?? '', localMainToken !== undefined);
    const poolsBalances = usePoolsBalance(localMainToken?.address ?? '', fAssetCoins.map(c => c.type), localMainToken !== undefined && fAssetCoins.length > 0);
    const userProgress = useUserProgress(mainToken?.address ?? '', false);
    const fassetState = useFassetState();

    const pausedTokens = fassetState.data?.filter(item => item.state)?.map(item => item.fasset) ?? [];
    const pendingTransactions = userProgress.data
         ? userProgress.data.filter(progress => !progress.status).length
         : 0;
    const isPartialRedeemCardActive = mainToken?.network?.name === NETWORK_SONGBIRD.name && fAssetCoins.filter(fAssetCoin => fAssetCoin?.cantRedeem).length > 0;

    const nativeBalanceFetchInterval = useInterval(() => {
        nativeBalance.refetch();
    }, BALANCE_FETCH_INTERVAL);
    const userProgressFetchInterval = useInterval(() => {
        userProgress.refetch();
    }, USER_PROGRESS_FETCH_INTERVAL);

    useEffect(() => {
        if (nativeBalance.isPending) return;

        const mainBalance = nativeBalance?.data?.find(nativeBalance => 'wrapped' in nativeBalance);
        if (mainToken) {
            setLocalMainToken({ ...mainToken, balance: mainBalance?.balance ?? undefined });
        } else {
            setLocalMainToken(undefined);
        }

        const fAssetCoins: IFAssetCoin[] = [];
        const stableCoins: ICoin[] = [];
        nativeBalance?.data?.forEach(balance => {
            const connectedCoin = connectedCoins.find(connectedCoin => connectedCoin.type === balance.symbol);
            const coin = COINS.find(coin => coin.enabled && coin.type === balance.symbol);
            if (!coin) return;

            if ('lots' in balance) {
               let fAssetCoin: IFAssetCoin & { cantRedeem?: boolean };

               if (connectedCoin) {
                   fAssetCoin = { ...connectedCoin, cantRedeem: false } as IFAssetCoin & { cantRedeem?: boolean };
                   fAssetCoin.balance = balance?.balance || "0";
               } else {
                   fAssetCoin = { ...coin, cantRedeem: false } as IFAssetCoin & { cantRedeem?: boolean };
                   fAssetCoin.balance = balance?.balance || "0";
                   fAssetCoin.enabled = false;
               }

               if (pausedTokens.includes(fAssetCoin.type)) {
                   fAssetCoin.enabled = false;
               }
               if ((toNumber(balance?.balance || "0") / fAssetCoin.lotSize) < 1) {
                   fAssetCoin.cantRedeem = true;
               }

               fAssetCoins.push(fAssetCoin);
            } else if (!('lots' in balance) && !('valueUSD' in balance)) {
               let stableCoin;

               if (connectedCoin) {
                   stableCoin = { ...connectedCoin } as IFAssetCoin;
                   stableCoin.balance = balance?.balance || "0";
               } else {
                   const coin = COINS.find(coin => coin.type === balance.symbol);
                   stableCoin = { ...coin } as IFAssetCoin;
                   stableCoin.balance = balance?.balance || "0";
               }

               stableCoins.push(stableCoin);
           }
        });

        setfAssetCoins(fAssetCoins);
        setStableCoins(stableCoins);

        nativeBalanceFetchInterval.start();
        userProgressFetchInterval.start();

        return () => {
            nativeBalanceFetchInterval.stop();
            userProgressFetchInterval.stop();
        }
    }, [nativeBalance.data, nativeBalance.isPending, connectedCoins]);

    useEffect(() => {
        if (mainToken) {
            setLocalMainToken({
                ...mainToken,
                balance: localMainToken?.balance
            });
        }
    }, [mainToken]);

    useEffect(() => {
        setContextIsMintModalActive(isMintModalActive);
        setContextIsRedeemModalActive(isRedeemModalActive);
    }, [isMintModalActive, isRedeemModalActive]);

    return (
        <Paper
            className={`min-h-32 relative p-6 sm:p-8 border-primary ${className}`}
            withBorder
        >
            <LoadingOverlay visible={localMainToken !== undefined && nativeBalance.isPending} zIndex={2} />
            <div className="sm:hidden">
                <div className="flex items-center justify-between">
                    <Title fw={500} className="text-15 mr-3">
                        {localMainToken?.nativeName?.toLowerCase()?.includes('sgb')
                            ? t('balance_card.sgb_address_label')
                            : t('balance_card.flr_address_label')
                        }
                    </Title>
                    <Anchor
                        underline="always"
                        href={`${localMainToken?.network.explorerAddressUrl}/${localMainToken?.address}`}
                        target="_blank"
                        className="inline-flex items-center text-12"
                        c="black"
                        fw={700}
                    >
                        {t('balance_card.view_on_explorer_button')}
                        <IconArrowUpRight
                            size={20}
                            className="ml-1 flex-shrink-0"
                        />
                    </Anchor>
                </div>
                <div className="flex items-center">
                    <Text
                        fw={400}
                        className="block text-15"
                    >
                        {truncateString(localMainToken?.address ?? '', 8, 8)}
                    </Text>
                    <CopyIcon
                        text={localMainToken?.address ?? ''}
                        color="#AFAFAF"
                    />
                </div>
            </div>
            <div className="hidden sm:flex justify-between items-baseline">
                <div className="flex items-center">
                    <Title fw={500} className="text-15 mr-3">
                        {localMainToken?.nativeName?.toLowerCase()?.includes('sgb')
                            ? t('balance_card.sgb_address_label')
                            : t('balance_card.flr_address_label')
                        }
                    </Title>
                    {localMainToken &&
                        <div className="flex items-center break-all mr-3">
                            <Text
                            	fw={400}
                            	className="text-15 block"
                            >
                                {truncateString(localMainToken?.address ?? '', 8, 8)}
                            </Text>
                            <CopyIcon
                                text={localMainToken?.address ?? ''}
                                color="#AFAFAF"
                            />
                        </div>
                    }
                    {!localMainToken &&
                        <Text
                            className="text-15"
                            c="var(--flr-black)"
                            fw={400}
                        >
                            {t('balance_card.not_connected_label')}
                        </Text>
                    }
                </div>
                <Anchor
                    underline="always"
                    href={`${localMainToken?.network.explorerAddressUrl}/${localMainToken?.address}`}
                    target="_blank"
                    className="inline-flex items-center text-12"
                    c="var(--flr-black)"
                    fw={500}
                >
                    {t('balance_card.view_on_explorer_button')}
                    <IconArrowUpRight
                        size={20}
                        className="ml-1 flex-shrink-0"
                    />
                </Anchor>
            </div>
            {nativeBalance.data &&
                <>
                    <Title
                        fw={300}
                        className="mt-5 text-24"
                    >
                        {localMainToken?.nativeName?.toLowerCase()?.includes('sgb')
                            ? t('balance_card.sgb_title')
                            : t('balance_card.flare_title')
                        }
                    </Title>
                    <div className="flex justify-between flex-wrap border-t mt-2 pt-2">
                        <div className="flex items-center basis-full sm:basis-auto">
                            {localMainToken?.icon !== undefined &&
                                localMainToken.icon({ width: "32", height: "32", className: "flex-shrink-0" })
                            }
                            <div className="ml-3">
                                <Text
                                    c="var(--flr-gray)"
                                    className="text-12"
                                    fw={400}
                                >
                                    {localMainToken?.type}
                                </Text>
                                <Text
                                    className="text-14"
                                    fw={500}
                                >
                                    {localMainToken?.balance}
                                </Text>
                            </div>
                        </div>
                        <div className="flex items-center mt-5 sm:mt-0">
                            <div className="mr-5">
                                <Text
                                    c="var(--flr-gray)"
                                    className="text-12"
                                >
                                    {t('balance_card.my_position_label')}
                                </Text>
                                <div className="flex items-center">
                                    {poolsBalances.isPending
                                        ? <Loader size={14} />
                                        : <Text
                                            className="text-14"
                                            fw={500}
                                        >
                                            {poolsBalances?.data?.balance}
                                        </Text>
                                    }
                                    <Text
                                        fw={500}
                                        c="var(--flr-gray)"
                                        className="text-14 ml-1"
                                    >
                                        {mainToken?.type}
                                    </Text>
                                </div>
                            </div>
                            <Button
                                component={Link}
                                href="/pools"
                                variant="gradient"
                                size="xs"
                                radius="xl"
                                fw={400}
                            >
                                {t('balance_card.providing_collateral_button')}
                            </Button>
                        </div>
                    </div>
                    <Divider
                        className="my-10"
                        styles={{
                            root: {
                                marginLeft: mediaQueryMatches ? '-1.5rem' : '-2rem',
                                marginRight: mediaQueryMatches ? '-1.5rem' : '-2rem'
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <Title
                            className="text-24"
                            fw={300}
                        >
                            {t('balance_card.fassets_title')}
                        </Title>
                        {pendingTransactions > 0 &&
                            <div className="flex items-center">
                                <Text
                                    fw={500}
                                    className="text-12 mr-3"
                                >
                                    {t('balance_card.pending_transactions_label', { count: pendingTransactions })}
                                </Text>
                                <Button
                                    variant="gradient"
                                    size="xs"
                                    radius="xl"
                                    fw={400}
                                    onClick={onViewPendingTransactionsClick}
                                >
                                    {t('balance_card.view_button')}
                                </Button>
                            </div>
                        }
                    </div>
                    {isPartialRedeemCardActive &&
                        <div className="flex items-center mt-2 rounded p-3 bg-[#FCEBE2] whitespace-pre-line">
                            <IconExclamationCircle
                                style={{ width: rem(25), height: rem(25) }}
                                color="var(--flr-orange)"
                                className="mr-3 flex-shrink-0"
                            />
                            <div>
                                <Text>{
                                    t('balance_card.exchange_remaining_fassets_title', {
                                        fAssets: fAssetCoins.filter(fAssetCoin => fAssetCoin.cantRedeem).map(fAssetCoin => fAssetCoin.type).join(', ')
                                    })}
                                </Text>
                                <Trans
                                    i18nKey="balance_card.exchange_remaining_fassets_description_label"
                                    components={{
                                        a1: <Anchor
                                            underline="always"
                                            href="https://app.blazeswap.xyz/swap/"
                                            target="_blank"
                                            fw={400}
                                            c="var(--flr-black)"
                                            className="text-12"
                                        />,
                                        a2: <Anchor
                                            underline="always"
                                            href="https://v3.dex.enosys.global/"
                                            target="_blank"
                                            fw={400}
                                            c="var(--flr-black)"
                                            className="text-12"
                                        />
                                    }}
                                    parent={Text}
                                    c="var(--flr-black)"
                                    className="text-12"
                                    fw={400}
                                />
                            </div>

                        </div>
                    }
                    {fAssetCoins.map((fAssetCoin) => (
                        <div
                            key={fAssetCoin.type}
                            className="flex max-[360px]:flex-col justify-between border-t mt-2 pt-2"
                        >
                            <div className="flex items-center">
                                {fAssetCoin.icon !== null && fAssetCoin.icon()}
                                <div className="ml-3">
                                    <Text
                                        c="var(--flr-gray)"
                                        className="text-12"
                                        fw={400}
                                    >
                                        {fAssetCoin?.type}
                                    </Text>
                                    <Text
                                        className="text-14"
                                        fw={500}
                                    >
                                        {fAssetCoin?.balance}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex items-center max-[360px]:mt-2">
                                {!fAssetCoin.enabled
                                    ? <Tooltip label={t('balance_card.connect_tooltip')} withArrow>
                                        <Button
                                            variant="gradient"
                                            size="xs"
                                            className="mr-3"
                                            radius="xl"
                                            fw={400}
                                            disabled={!fAssetCoin.enabled || disabledFassets.includes(fAssetCoin.type)}
                                            onClick={() => {
                                                activeFAssetCoin.current = fAssetCoin;
                                                setIsMintModalActive(true);
                                            }}
                                        >
                                            {t('balance_card.mint_button')}
                                        </Button>
                                    </Tooltip>
                                    : <Button
                                        variant="gradient"
                                        size="xs"
                                        className="mr-3"
                                        radius="xl"
                                        fw={400}
                                        disabled={!fAssetCoin.enabled || disabledFassets.includes(fAssetCoin.type)}
                                        onClick={() => {
                                            activeFAssetCoin.current = fAssetCoin;
                                            setIsMintModalActive(true);
                                        }}
                                    >
                                        {t('balance_card.mint_button')}
                                    </Button>
                                }
                                {!fAssetCoin.enabled
                                    ? <Tooltip label={t('balance_card.connect_tooltip')} withArrow>
                                        <Button
                                            variant="gradient"
                                            size="xs"
                                            radius="xl"
                                            fw={400}
                                            disabled={!fAssetCoin.enabled}
                                            onClick={() => {
                                                activeFAssetCoin.current = fAssetCoin;
                                                setIsRedeemModalActive(true);
                                            }}
                                        >
                                            {t('balance_card.redeem_button')}
                                        </Button>
                                    </Tooltip>
                                    : <Button
                                        variant="gradient"
                                        size="xs"
                                        radius="xl"
                                        fw={400}
                                        disabled={!fAssetCoin.enabled}
                                        onClick={() => {
                                            activeFAssetCoin.current = fAssetCoin;
                                            setIsRedeemModalActive(true);
                                        }}
                                    >
                                        {t('balance_card.redeem_button')}
                                    </Button>
                                }
                            </div>
                        </div>
                    ))}
                    <Divider
                        className="my-10"
                        styles={{
                            root: {
                                marginLeft: mediaQueryMatches ? '-1.5rem' : '-2rem',
                                marginRight: mediaQueryMatches ? '-1.5rem' : '-2rem'
                            }
                        }}
                    />
                    <Title
                        className="text-24"
                        fw={300}
                    >
                        {mainToken && (mainToken.network.mainnet || [NETWORK_FLARE_COSTON2_TESTNET.chainId, NETWORK_FLARE.chainId].includes(mainToken.network.chainId))
                            ? t('balance_card.stablecoins_title')
                            : t('balance_card.stablecoins_eth_title')
                        }
                    </Title>
                    <SimpleGrid
                        cols={{ base: 1, sm: 2 }}
                        spacing="xl"
                        className="mt-2"
                    >
                        {stableCoins.map(stableCoin => (
                            <div
                                key={stableCoin.type}
                                className="flex items-center border-t pt-2"
                            >
                                {stableCoin.icon !== null && stableCoin.icon()}
                                <div className="ml-3">
                                    <Text
                                        c="var(--flr-gray)"
                                        fw={400}
                                        className="text-12"
                                    >
                                        {stableCoin?.type}
                                    </Text>
                                    <Text
                                        className="text-14"
                                        fw={500}
                                    >
                                        {stableCoin?.balance}
                                    </Text>
                                </div>
                            </div>
                        ))}
                    </SimpleGrid>
                </>
            }
            {activeFAssetCoin.current && localMainToken &&
                <MintModal
                    opened={isMintModalActive}
                    fAssetCoin={activeFAssetCoin.current}
                    onClose={(fetchProgress: boolean) => {
                        setIsMintModalActive(false);
                        if (activeFAssetCoin.current) {
                            activeFAssetCoin.current = undefined;
                        }

                        if (fetchProgress) {
                            userProgress.refetch();
                        }
                    }}
                />
            }
            {activeFAssetCoin.current && localMainToken &&
                <RedeemModal
                    opened={isRedeemModalActive}
                    fAssetCoin={activeFAssetCoin.current}
                    flareCoin={localMainToken}
                    onClose={(fetchProgress: boolean) => {
                        setIsRedeemModalActive(false);
                        if (activeFAssetCoin.current) {
                            activeFAssetCoin.current = undefined;
                        }

                        if (fetchProgress) {
                            userProgress.refetch();
                        }
                    }}
                />
            }
        </Paper>
    );
}
