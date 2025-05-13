import React, { useCallback } from "react";
import { Text, Title, rem, Tabs, Popover, Grid } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IconGift, IconInfoHexagon } from "@tabler/icons-react";
import FXrpIcon from "@/components/icons/FXrpIcon";
import FBtcIcon from "@/components/icons/FBtcIcon";
import FDogeIcon from "@/components/icons/FDogeIcon";
import { useLifetimeClaimed } from "@/api/user";
import { useWeb3 } from "@/hooks/useWeb3";
import { IPool } from "@/types";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import { useEcosystemInfo } from "@/api/minting";

interface IPoolsPositionCard {
    className?: string;
    pools: IPool[];
}

interface IPosition {
    fAsset: string;
    lifetimeEarned: number;
    rewards: number;
    total: number;
    icon: React.ReactNode | undefined;
}

export default function PoolsPositionCard({ className, pools }: IPoolsPositionCard) {
    const { t } = useTranslation();
    const { mainToken, isConnected } = useWeb3();

    const ecosystemInfo = useEcosystemInfo();
    const lifetimeClaimed = useLifetimeClaimed(mainToken?.address ?? '', isConnected && mainToken !== undefined);

    const positions: IPosition[] = lifetimeClaimed.data
        ? lifetimeClaimed.data?.map(item => {
            const total = pools
                .filter(pool => pool.vaultType === item.fasset)
                .reduce((accumulator, pool) => {
                    accumulator['natBalance'] += toNumber(pool.userPoolNatBalanceInUSD!);
                    accumulator['rewards'] += toNumber(pool.userPoolFeesUSD!);

                    return accumulator;
                }, { natBalance: 0, rewards: 0 });

            let icon = undefined;
            if (item.fasset.toLowerCase().includes('xrp')) {
                icon = <FXrpIcon
                    width="60"
                    height="60"
                    className="flex-shrink-0"
                />
            } else if (item.fasset.toLowerCase().includes('btc')) {
                icon = <FBtcIcon
                    width="60"
                    height="60"
                    className="flex-shrink-0"
                />
            } else if (item.fasset.toLowerCase().includes('doge')) {
                icon = <FDogeIcon
                    width="60"
                    height="60"
                    className="flex-shrink-0"
                />
            }

            return {
                fAsset: item.fasset,
                lifetimeEarned: toNumber(item.claimed),
                rewards: total['rewards'],
                total: total['natBalance'],
                icon: icon
            }
        })
        : [];

    const totalPosition = positions?.reduce((accumulator, position) => {
        return accumulator + position.total;
    }, 0);
    const totalRewards = positions?.reduce((accumulator, lifetimeClaimed) => {
        return accumulator + lifetimeClaimed.rewards;
    }, 0);

    const renderPositionMobile = useCallback(() => {
        return <div className="flex items-center my-10">
            {positions?.map(((position, index) => (
                <div
                    style={{
                        transform: `translateX(${index * -10}px)`,
                        zIndex: positions.length - index
                    }}
                    key={index}
                >
                    {position.icon !== undefined && position.icon}
                </div>
            )))}
            <div className="ml-3">
                <Text
                    className="text-48 md:text-32"
                    fw={300}
                >
                    ${formatNumberWithSuffix(totalPosition ?? 0)}
                </Text>
                <div className="flex items-center">
                    <IconGift style={{width: rem(18), height: rem(18)}} />
                    <Text
                        className="ml-1 text-base"
                        fw={400}
                    >
                        ${formatNumberWithSuffix(totalRewards ?? 0)}
                    </Text>
                </div>
            </div>
        </div>
    }, [positions, totalPosition, totalRewards]);

    const renderEcosystemActivity = useCallback(() => {
        return <div className="flex flex-col bg-[var(--flr-lightest-gray)] !pb-0 md:p-4">
            <Title
                fw={300}
                className="hidden md:block mb-[14px] text-24"
            >
                {t('pools_position_card.ecosystem_activity_label')}
            </Title>
            <div className="flex h-full">
                <div
                    className="md:-ml-4 px-3 pt-5 md:min-h-auto md:pb-2 border-t border-r border-[var(--flr-light-gray)] w-full md:w-auto md:min-w-52"
                    style={{minHeight: '6.5rem'}}
                >
                    <div className="flex items-center mb-2">
                        <Text
                            c="var(--flr-gray)"
                            className="text-16"
                        >
                            {t('pools_position_card.tvl_label')}
                        </Text>
                        <Popover
                            withArrow
                        >
                            <Popover.Target>
                                <IconInfoHexagon
                                    style={{width: rem(16), height: rem(16)}}
                                    color="var(--mantine-color-gray-6)"
                                    className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                />
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Text size="sm" className="px-3">{t('pools_position_card.tvl_description_label')}</Text>
                            </Popover.Dropdown>
                        </Popover>
                    </div>
                    <Text className="text-32" fw={300}>${formatNumberWithSuffix(ecosystemInfo?.data?.tvl ?? 0)}</Text>
                </div>
                <div className="px-3 pt-5 border-t border-[var(--flr-light-gray)] md:-mr-4 w-full md:w-auto md:min-w-52">
                    <div className="flex items-center mb-2">
                        <Text
                            c="var(--flr-gray)"
                            className="text-16"
                        >
                            {t('pools_position_card.transactions_label')}
                        </Text>
                        <Popover
                            withArrow
                        >
                            <Popover.Target>
                                <IconInfoHexagon
                                    style={{ width: rem(16), height: rem(16) }}
                                    color="var(--mantine-color-gray-6)"
                                    className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                />
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Text size="sm" className="px-3">{t('pools_position_card.transactions_description_label')}</Text>
                            </Popover.Dropdown>
                        </Popover>
                    </div>
                    <Text className="text-32" fw={300}>{formatNumberWithSuffix(ecosystemInfo?.data?.numTransactions ?? 0, 0)}</Text>
                </div>
            </div>
        </div>
    }, [ecosystemInfo]);

    return (
        <div className={className}>
            <div className="text-right mb-2">
                <Link
                    href="https://dev.flare.network/fassets/collateral"
                    target="_blank"
                    className="font-normal text-16 underline leading-11 hidden md:inline-block"
                >
                    {t('pools_position_card.what_are_collateral_pools_label')}
                </Link>
            </div>
            {isConnected &&
                <Tabs
                    defaultValue="position"
                    className="block md:hidden"
                >
                    <Tabs.List>
                        <Tabs.Tab value="position">
                            {t('pools_position_card.your_position_label')}
                        </Tabs.Tab>
                        <Tabs.Tab value="ecosystem">
                            {t('pools_position_card.ecosystem_activity_label')}
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="position" className="mt-5">
                        {renderPositionMobile()}
                    </Tabs.Panel>
                    <Tabs.Panel value="ecosystem" className="mt-5">
                        {renderEcosystemActivity()}
                    </Tabs.Panel>
                </Tabs>
            }
            <div className="hidden md:flex">
                {isConnected &&
                    <div className="grow">
                        <div className="flex items-center border-b border-[var(--flr-light-gray)]">
                            <Title
                                fw={300}
                                className="text-28 mr-2"
                            >
                                {t('pools_position_card.your_position_label')}
                            </Title>
                            <Title
                                fw={300}
                                className="invisible min-[1120px]:visible text-48"
                            >
                                ${formatNumberWithSuffix(totalPosition ?? 0)}
                            </Title>
                        </div>
                        <div className="flex min-[1120px]:hidden">
                            {renderPositionMobile()}
                        </div>
                        <div className="hidden min-[1120px]:flex items-center">
                            {positions?.map(((position, index) => (
                                <div
                                    className={`px-4 pt-5 pb-2 w-56 grow border-[var(--flr-light-gray)] ${index !== positions.length - 1 ? 'border-r ' : ''}`}
                                    key={index}
                                >
                                    <div className="flex items-center">
                                        {position.icon !== undefined && position.icon}
                                        <div className="flex flex-col ml-4">
                                            <Text
                                                className="text-32"
                                                fw={300}
                                            >
                                                ${formatNumberWithSuffix(position.total ?? 0)}
                                            </Text>
                                            <div className="flex items-center">
                                                <IconGift style={{ width: rem(18), height: rem(18) }} />
                                                <Text
                                                    className="ml-1 text-16"
                                                    fw={400}
                                                >
                                                    ${formatNumberWithSuffix(position.rewards)}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-5">
                                        <IconGift
                                            style={{width: rem(20), height: rem(20)}}
                                            color="var(--flr-gray)"
                                            className="flex-shrink-0 mr-2"
                                        />
                                        <Text
                                            c="var(--flr-gray)"
                                            className="text-14"
                                        >
                                            {t('pools_position_card.lifetime_earned_label', {
                                                amount: formatNumberWithSuffix(position.lifetimeEarned)
                                            })}
                                        </Text>
                                    </div>
                                </div>
                            )))}
                        </div>
                    </div>
                }
                {renderEcosystemActivity()}
            </div>
        </div>
    );
}
