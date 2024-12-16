import React from "react";
import { Button, Title, Text, LoadingOverlay } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import FXrpIcon from "@/components/icons/FXrpIcon";
import FBtcIcon from "@/components/icons/FBtcIcon";
import FDogeIcon from "@/components/icons/FDogeIcon";
import { useMediaQuery } from "@mantine/hooks";
import { useLifetimeClaimed } from "@/api/user";
import { useWeb3 } from "@/hooks/useWeb3";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import {IPool} from "@/types";

interface IMyPoolsPositionCard {
    pools: IPool[] | undefined;
    isLoading: boolean;
}

interface IReward {
    type: string;
    icon: React.ReactNode | undefined;
    total: number;
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
    const lifetimeClaimed = useLifetimeClaimed(mainToken?.address ?? '', mainToken !== undefined);

    const totalLifetimeClaimed = lifetimeClaimed.data?.reduce((accumulator, lifetimeClaimed) => {
        return accumulator + toNumber(lifetimeClaimed.claimed);
    }, 0);

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
                existingReward.total += toNumber(pool.userPoolFees!);
            } else {
                accumulator['rewards'].push({
                    type: pool.vaultType,
                    icon: icon,
                    total: toNumber(pool.userPoolFees!)
                });
            }

            return accumulator;
        }, { totalFassets: 0, totalFassetsUSD: 0, totalRewardsUSD: 0, rewards: [] }  as IPosition);

    const hasNoAssets = position?.totalFassets === 0;
    const isClaimRewardsButtonDisabled = position?.totalRewardsUSD.toFixed(2) === "0.00";

    return (
        <div className="flex flex-col border-x-0 md:border-x md:border-y border-[var(--flr-border-color)] h-full relative">
            <LoadingOverlay visible={isLoading} />
            <div className="flex flex-wrap items-center max-[430px]:mb-2 min-[430px]:items-center justify-between px-[15px] lg:px-6 py-2 min-h-14 h-full">
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
            <div
                className="flex flex-wrap bg-[var(--flr-lightest-gray)] border-t border-b md:border-b-0 border-[var(--flr-border-color)] h-full">
                {!isLoading && hasNoAssets &&
                    <div className="px-[15px] lg:px-5 py-5 md:hidden">
                    <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('my_pools_position_card.no_assets_label')}
                        </Text>
                    </div>
                }
                <div
                    className={`${hasNoAssets ? 'hidden md:flex' : 'flex'} flex-col basis-full min-[430px]:basis-6/12 px-[15px] lg:px-6 py-6 grow md:border-r border-[var(--flr-border-color)]`}
                >
                    <Text
                        className={`text-16 uppercase ${isLoading ? '' : 'mt-0 xl:mt-4'}`}
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('my_pools_position_card.your_position_label')}
                    </Text>
                    <Text
                        className="text-32"
                        fw={300}
                    >
                        ${formatNumberWithSuffix(position?.totalFassetsUSD ?? 0)}
                    </Text>
                    {hasNoAssets &&
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('my_pools_position_card.no_assets_label')}
                        </Text>
                    }
                    {!hasNoAssets &&
                        <div className="flex items-center">
                            {mainToken?.icon({width: "20", height: "20"})}
                            <Text
                                className="ml-2 text-16"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {formatNumberWithSuffix(position?.totalFassets ?? 0)}
                            </Text>
                        </div>
                    }
                </div>
                <div className={`${hasNoAssets ? 'hidden md:flex' : 'flex'} flex-col basis-full min-[430px]:basis-6/12 px-[15px] lg:px-6 py-6 grow border-t md:border-t-0 border-[var(--flr-border-color)]`}>
                    <Text
                        className={`text-16 uppercase ${isLoading ? '' : 'mt-0 xl:mt-4'}`}
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('my_pools_position_card.available_rewards_label')}
                    </Text>
                    <Text
                        className="text-32"
                        fw={300}
                    >
                        ${formatNumberWithSuffix(position?.totalRewardsUSD ?? 0)}
                    </Text>
                    {hasNoAssets &&
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('my_pools_position_card.deposit_into_pools_label')}
                        </Text>
                    }
                    {!hasNoAssets &&
                        <div className="flex items-center">
                            {position?.rewards?.map((reward, index) => (
                                <div
                                    className={`flex items-center ${index < position.rewards.length - 1 ? 'mr-10' : ''}`}
                                    key={index}
                                >
                                    {reward.icon !== undefined && reward.icon}
                                    <Text
                                        className="text-16 ml-2"
                                        fw={400}
                                        c="var(--flr-dark-gray)"
                                    >
                                        {formatNumberWithSuffix(reward.total, reward.type.toLowerCase().includes('btc') ? 5 : 2)}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    }
                    {!hasNoAssets &&
                        <Text
                            className="text-12 mt-2"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('my_pools_position_card.rewards_earned_to_date_label', {amount: formatNumberWithSuffix(totalLifetimeClaimed ?? 0)})}
                        </Text>
                    }
                </div>
            </div>
        </div>
    );
}
