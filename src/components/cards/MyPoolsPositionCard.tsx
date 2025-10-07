import React from "react";
import { Button, Title, Text, LoadingOverlay, SimpleGrid } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import FXrpIcon from "@/components/icons/FXrpIcon";
import FBtcIcon from "@/components/icons/FBtcIcon";
import FDogeIcon from "@/components/icons/FDogeIcon";
import { useMediaQuery } from "@mantine/hooks";
import { useWeb3 } from "@/hooks/useWeb3";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import { IPool } from "@/types";
import { COINS } from "@/config/coin";

interface IMyPoolsPositionCard {
    pools: IPool[] | undefined;
    isLoading: boolean;
}

interface IReward {
    type: string;
    icon: React.ReactNode | undefined;
    claimable: number;
    claimed: number;
    claimedUSD: number;
}

interface IPosition {
    totalFassets: number;
    totalFassetsUSD: number;
    totalRewardsUSD: number;
    rewards: IReward[];
}

export default function MyPoolsPositionCard({ pools, isLoading }: IMyPoolsPositionCard) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isSingleFassetEnabled = COINS.filter(coin => coin.isFAssetCoin && coin.enabled).length === 1;

    const position: IPosition | undefined = pools
        ?.reduce((accumulator, pool) => {
            accumulator['totalFassets'] += toNumber(pool.userPoolNatBalance!);
            accumulator['totalFassetsUSD'] += toNumber(pool.userPoolNatBalanceInUSD!);
            accumulator['totalRewardsUSD'] += toNumber(pool.userPoolFeesUSD!);

            let icon = undefined;
            if (pool.vaultType.toLowerCase().includes('xrp')) {
                icon = <FXrpIcon
                    width="20"
                    height="20"
                    className="flex-shrink-0"
                />
            } else if (pool.vaultType.toLowerCase().includes('btc')) {
                icon = <FBtcIcon
                    width="20"
                    height="20"
                    className="flex-shrink-0"
                />
            } else if (pool.vaultType.toLowerCase().includes('doge')) {
                icon = <FDogeIcon
                    width="20"
                    height="20"
                    className="flex-shrink-0"
                />
            }

            const existingReward = accumulator['rewards'].find((reward: IReward) => reward.type === pool.vaultType) as IReward | undefined;

            if (existingReward) {
                existingReward.claimable += toNumber(pool.userPoolFees!);
                existingReward.claimed += (toNumber(pool.userPoolFees!) + toNumber(pool.lifetimeClaimedPoolFormatted!));
                existingReward.claimedUSD += (toNumber(pool.userPoolFeesUSD!) + toNumber(pool.lifetimeClaimedPoolUSDFormatted!));
            } else {
                accumulator['rewards'].push({
                    type: pool.vaultType,
                    icon: icon,
                    claimable: toNumber(pool.userPoolFees!),
                    claimed: toNumber(pool.userPoolFees!) + toNumber(pool.lifetimeClaimedPoolFormatted!),
                    claimedUSD: toNumber(pool.userPoolFeesUSD!) + toNumber(pool.lifetimeClaimedPoolUSDFormatted!),
                });
            }

            return accumulator;
        }, { totalFassets: 0, totalFassetsUSD: 0, totalRewardsUSD: 0, rewards: [] }  as IPosition);

    const totalClaimed = position?.rewards.reduce((accumulator, reward) => {
        return accumulator + reward.claimedUSD;
    }, 0);
    const hasNoAssets = position?.totalFassets === 0;
    const isClaimRewardsButtonDisabled = position?.totalRewardsUSD.toFixed(2) === "0.00";

    const myPositionBlock = <div>
        <Text
            className="text-12 uppercase"
            fw={400}
            c="var(--flr-dark-gray)"
        >
            {t('my_pools_position_card.your_position_label')}
        </Text>
        <div className="flex items-baseline">
            <Text
                className="text-28"
                fw={300}
            >
                ${formatNumberWithSuffix(position?.totalFassetsUSD ?? 0)}
            </Text>
            {!hasNoAssets &&
                <div className="ml-2 flex items-baseline">
                    {mainToken?.icon({width: "20", height: "20"})}
                    <Text
                        className="ml-2 mb-1 text-16"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {formatNumberWithSuffix(position?.totalFassets ?? 0)}
                    </Text>
                </div>
            }
        </div>
        {hasNoAssets &&
            <Text
                className="text-16"
                fw={400}
                c="var(--flr-gray)"
            >
                {t('my_pools_position_card.no_assets_label')}
            </Text>
        }
    </div>;

    const availablePoolRewardsBlock = <>
        <Text
            className={`text-12 uppercase`}
            fw={400}
            c="var(--flr-dark-gray)"
        >
            {t('my_pools_position_card.available_rewards_label')}
        </Text>
        <div className="flex items-baseline flex-wrap">
            <Text
                className="text-28"
                fw={300}
            >
                ${formatNumberWithSuffix(position?.totalRewardsUSD ?? 0)}
            </Text>
            {!hasNoAssets &&
                <div className="ml-2 flex items-baseline">
                    {position?.rewards?.map((reward, index) => (
                        <div
                            className={`flex items-baseline ${index < position.rewards.length - 1 ? 'mr-8' : ''}`}
                            key={index}
                        >
                            {reward.icon !== undefined && reward.icon}
                            <Text
                                className="text-16 ml-2"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {formatNumberWithSuffix(reward.claimable, reward.type.toLowerCase().includes('btc') ? 5 : 2)}
                            </Text>
                        </div>
                    ))}
                </div>
            }
        </div>
        {hasNoAssets &&
            <Text
                className="text-16"
                fw={400}
                c="var(--flr-gray)"
            >
                {t('my_pools_position_card.deposit_into_pools_label')}
            </Text>
        }
    </>;

    const earnedRewardsBlock = <>
        <Text
            className="text-12 uppercase"
            c="var(--flr-dark-gray)"
            fw={400}
        >
            {t('my_pools_position_card.pools_rewards_earned_label')}
        </Text>
        <div className="flex items-baseline">
            <Text
                className="text-28 mr-2"
                fw={300}
            >
                ${formatNumberWithSuffix(totalClaimed ?? 0)}
            </Text>
            <div className="flex items-baseline">
            {position?.rewards?.map((reward, index) => (
                <div
                    className={`flex items-baseline ${index < position.rewards.length - 1 ? 'mr-5' : ''}`}
                    key={index}
                >
                    {reward.icon !== undefined && reward.icon}
                        <span className="ml-1 text-16 text-[var(--flr-dark-gray)]">{formatNumberWithSuffix(reward.claimed)}</span>
                </div>
            ))}
            </div>
        </div>
    </>;

    return (
        <div className="flex flex-col border-x-0 md:border-x md:border-y border-[var(--flr-border-color)] relative h-full">
            <LoadingOverlay visible={isLoading} />
            <div className="flex flex-wrap items-center max-[430px]:mb-2 min-[430px]:items-center justify-between px-[15px] lg:px-6 py-2">
                <Title
                    className="text-16 uppercase"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('my_pools_position_card.your_pools_position_label')}
                </Title>
                <div className="flex items-center shrink-0">
                    <Link
                        href="/pools"
                        className="hidden md:block underline text-16 font-normal mr-4"
                    >
                        {t('my_pools_position_card.view_all_pools_label')}
                    </Link>
                    <Button
                        variant="gradient"
                        component={Link}
                        href="/pools"
                        radius="xl"
                        size="sm"
                        h={isMobile ? 34 : 41}
                        fw={400}
                        disabled={isClaimRewardsButtonDisabled}
                        onClick={(e) => {
                            if (isClaimRewardsButtonDisabled) e.preventDefault();
                        }}
                    >
                        {t('my_pools_position_card.claim_rewards_button')}
                    </Button>
                </div>
            </div>
            <SimpleGrid
                cols={{ base: 1, sm: 3 }}
                styles={{
                    root: {
                        '--sg-spacing-y': 0
                    }
                }}
                className="bg-[var(--flr-lightest-gray)] border-t border-b md:border-b-0 border-[var(--flr-border-color)] h-full"
            >
                <div className="px-5 border-b md:border-b-0 md:border-r border-[var(--flr-border-color)] py-3 md:py-7">{myPositionBlock}</div>
                <div className="px-5 border-b md:border-b-0  md:border-r border-[var(--flr-border-color)] py-3 md:py-7">{availablePoolRewardsBlock}</div>
                <div className="px-5 py-3 md:py-7">{earnedRewardsBlock}</div>
            </SimpleGrid>
        </div>
    );
}