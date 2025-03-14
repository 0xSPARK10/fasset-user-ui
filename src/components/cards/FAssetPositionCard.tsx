import React, { useEffect, useRef, useState } from "react";
import moment, { type Moment } from "moment";
import {
    Button,
    Title,
    Text,
    LoadingOverlay,
    Grid,
    Popover
} from "@mantine/core";
import Link from "next/link";
import { IconTicket, IconInfoHexagon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import { formatNumber, formatNumberWithSuffix, toNumber } from "@/utils";
import ClockIcon from "@/components/icons/ClockIcon";
import CflrIcon from "@/components/icons/CflrIcon";
import { INativeBalance, IReward } from "@/types";
import { COINS } from "@/config/coin";
import { useDistribution } from "@/hooks/useDistribution";

interface IFAssetPositionCard {
    balance: INativeBalance[] | undefined;
    rewards: IReward | undefined;
    isLoading: boolean;
}

export default function FAssetPositionCard({ balance, rewards, isLoading }: IFAssetPositionCard) {
    const { distributionCountdown, isDistributionCountdownActive } = useDistribution();
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 767px)');

    const fassetTokensCount = balance?.filter(balance => 'lots' in balance)?.length;
    const tokens = balance
        ?.filter(balance => 'lots' in balance && (isMobile ? balance.balance !== '0' : true))
        ?.map(balance => {
            return {
                ...balance,
                token: COINS.find(coin => coin.type.toLowerCase() === balance.symbol.toLowerCase()),
            }
        });

    const tokensWithoutAssets = balance
        ?.filter(balance => 'lots' in balance && balance.balance === '0')
        ?.map(balance => {
            return {
                ...balance,
                token: COINS.find(coin => coin.type.toLowerCase() === balance.symbol.toLowerCase()),
            }
        });

    const hasTokensWithoutAssets = tokensWithoutAssets !== undefined && tokensWithoutAssets?.length === fassetTokensCount;
    const isRedeemButtonDisabled = fassetTokensCount === tokensWithoutAssets?.length;
    const totalRewardsEarnedUSD = toNumber(rewards?.claimedUsd ?? "0") + toNumber(rewards?.claimableUsd ?? "0");
    const totalRewardsEarned = toNumber(rewards?.claimedRflr ?? "0") + toNumber(rewards?.claimableRflr ?? "0");

    return (
        <div className="flex flex-col border-x-0 md:border-x border-y border-[var(--flr-border-color)] relative">
            <LoadingOverlay visible={isLoading} />
            <div
                className="flex flex-wrap items-center justify-between px-[15px] lg:px-5 py-2 min-h-14 h-full md:h-auto border-b border-[var(--flr-border-color)]">
                <Title
                    className="text-16 uppercase"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('fasset_position_card.fasset_position_label')}
                </Title>
                <div className="flex items-center shrink-0">
                    <Link
                        href="/mint"
                        className="hidden md:block underline text-16 font-normal mr-4"
                    >
                        {t('fasset_position_card.view_mint_page_label')}
                    </Link>
                    <Button
                        variant="gradient"
                        component={Link}
                        href="/mint"
                        radius="xl"
                        size="sm"
                        h={isMobile ? 34 : 41}
                        fw={400}
                        disabled={isRedeemButtonDisabled}
                        onClick={(e) => {
                            if (isRedeemButtonDisabled) e.preventDefault();
                        }}
                    >
                        {t('fasset_position_card.redeem_button')}
                    </Button>
                </div>
            </div>
            <Grid
                classNames={{
                    root: 'h-full',
                    inner: 'bg-[var(--flr-lightest-gray)]'
                }}
                styles={{
                    root: {
                        '--grid-gutter': 0
                    }
                }}
                breakpoints={{
                    xs: '576px',
                    sm: '768px',
                    md: '992px',
                    lg: '1200px',
                    xl: '1482px'
                }}
            >
                {tokens?.map((token, index) => (
                    <Grid.Col
                        span={{ base: 12, xs: 4 }}
                        className={`flex items-center px-[15px] lg:px-5 py-5 md:py-12 ${index < tokens?.length - 1 ? 'md:border-r' : ''} border-[var(--flr-border-color)]`}
                        key={index}
                    >
                        {token?.token?.icon({ width: isMobile ? "45" : "90", height: isMobile ? "45" : "90" })}
                        {token?.balance !== '0'
                            ? <div className="ml-2">
                                <Text
                                    className="text-16"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    {formatNumberWithSuffix(token?.lots ?? 0, 0)} {t('fasset_position_card.lots_label')}
                                </Text>
                                <Text
                                    className="text-32"
                                    fw={300}
                                >
                                    {formatNumberWithSuffix(token?.balance, token?.symbol?.toLowerCase().includes('btc') ? 4 : 2)}
                                </Text>
                                <Text
                                    className="text-16"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    ${formatNumberWithSuffix(token?.valueUSD ?? 0)}
                                </Text>
                            </div>
                            : <div className="ml-2">
                                <Text
                                    className="text-32"
                                    fw={300}
                                    c="var(--flr-gray)"
                                >
                                    {formatNumberWithSuffix(token?.balance, token?.symbol?.toLowerCase().includes('btc') ? 4 : 2)}
                                </Text>
                            </div>
                        }
                    </Grid.Col>
                ))}
                {isDistributionCountdownActive &&
                    <Grid
                        classNames={{
                            root: 'w-full'
                        }}
                        styles={{
                            root: {
                                '--grid-gutter': 0
                            }
                        }}
                    >
                        {toNumber(rewards?.claimableRflr ?? "0") > 0
                            ? <>
                                <Grid.Col
                                    span={{ base: 12, md: 8 }}
                                    className="flex items-center px-[15px] lg:px-5 py-3 border-t min-[992px]:border-r border-[var(--flr-border-color)] min-h-[70px]"
                                >
                                    <div>
                                        <Text
                                            className="text-12 uppercase"
                                            fw={400}
                                            c="var(--flr-gray)"
                                        >
                                            {t('fasset_position_card.available_rewards_label')}
                                        </Text>
                                        <div className="flex mt-1 mr-5">
                                            <CflrIcon width="20" height="20" className="flex-shrink-0" />
                                            <Text
                                                className="text-16 ml-1"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                {formatNumberWithSuffix(rewards?.claimableRflr ?? 0, 2)}
                                                <span
                                                    className="ml-1 text-[var(--flr-gray)]"
                                                >
                                                (${formatNumberWithSuffix(rewards?.claimableUsd ?? 0, 2)})
                                            </span>
                                            </Text>
                                        </div>
                                    </div>
                                    <Button
                                        variant="gradient"
                                        component={Link}
                                        href="https://portal.flare.network"
                                        target="_blank"
                                        radius="xl"
                                        size="sm"
                                        fw={400}
                                        className="ml-5"
                                    >
                                        {t('my_pools_position_card.claim_rewards_button')}
                                    </Button>
                                </Grid.Col>
                                <Grid.Col
                                    span={{ base: 12, md: 4 }}
                                    className="flex flex-col justify-center px-[15px] py-3 lg:px-5 border-t border-[var(--flr-border-color)]"
                                >
                                    <Text
                                        className="text-12 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('fasset_position_card.rewards_earned_to_date_label')}
                                    </Text>
                                    <div className="flex mt-1">
                                        <CflrIcon width="20" height="20" className="flex-shrink-0" />
                                        <Text
                                            className="text-16 ml-1"
                                            fw={400}
                                            c="var(--flr-dark-gray)"
                                        >
                                            {formatNumberWithSuffix(totalRewardsEarned, 2)}
                                            <span
                                                className="ml-1 text-[var(--flr-gray)]"
                                            >
                                                (${formatNumberWithSuffix(totalRewardsEarnedUSD, 2)})
                                            </span>
                                        </Text>
                                    </div>
                                </Grid.Col>
                            </>
                            : <>
                                <Grid.Col
                                    span={{ base: 12, md: 4 }}
                                    className={`flex flex-col justify-center px-[15px] lg:px-5 py-3 ${tokens && tokens.length > 0 ? 'border-t' : ''} min-[992px]:border-r border-[var(--flr-border-color)] min-h-[71px]`}
                                >
                                    <div>
                                        <div className="flex items-center">
                                            <Text
                                                className="text-12 uppercase mr-1"
                                                fw={400}
                                                c="var(--flr-gray)"
                                            >
                                                {t('fasset_position_card.nr_lottery_tickets_label')}
                                            </Text>
                                            <Popover
                                                withArrow
                                                width={250}
                                            >
                                                <Popover.Target>
                                                    <IconInfoHexagon
                                                        size={15}
                                                        color="var(--flr-gray)"
                                                        className="cursor-pointer"
                                                    />
                                                </Popover.Target>
                                                <Popover.Dropdown>
                                                    <Text
                                                        className="text-14"
                                                        c="var(--flr-dark-gray)"
                                                    >
                                                        {t('fasset_position_card.nr_lottery_tickets_description_label')}
                                                    </Text>
                                                </Popover.Dropdown>
                                            </Popover>
                                        </div>
                                        {toNumber(rewards?.share ?? "0") === 0
                                            ? <Text
                                                className="text-16 mt-1"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                {t('fasset_position_card.none_label')}
                                            </Text>
                                            : <div className="flex items-center mt-1">
                                                <IconTicket
                                                    size={18}
                                                    color="var(--flr-dark-gray)"
                                                />
                                                <Text
                                                    c="var(--flr-dark-gray)"
                                                    className="text-16 ml-1"
                                                    fw={400}
                                                >
                                                    {rewards?.numTickets}
                                                </Text>
                                                <Text
                                                    c="var(--flr-gray)"
                                                    className="text-16 ml-5"
                                                    fw={400}
                                                >
                                                    ({formatNumber(rewards?.share ?? 0, 4)} %)
                                                </Text>
                                            </div>
                                        }
                                    </div>
                                </Grid.Col>
                                <Grid.Col
                                    span={{ base: 12, md: 4 }}
                                    className="flex flex-col justify-center px-[15px] lg:px-5 py-3 border-t min-[992px]:border-r border-[var(--flr-border-color)]"
                                >
                                    <div>
                                        <Text
                                            className="text-12 uppercase"
                                            fw={400}
                                            c="var(--flr-gray)"
                                        >
                                            {t('fasset_position_card.distribution_period_label')}
                                        </Text>
                                        <div className="flex items-center mt-1">
                                            <ClockIcon
                                                width="24"
                                                height="24"
                                                className="mr-1"
                                            />
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                {distributionCountdown}
                                            </Text>
                                        </div>
                                    </div>
                                </Grid.Col>
                                <Grid.Col
                                    span={{ base: 12, md: 4 }}
                                    className="flex flex-col justify-center px-[15px] py-3 lg:px-5 border-t border-[var(--flr-border-color)]"
                                >
                                    <Text
                                        className="text-12 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('fasset_position_card.rewards_earned_to_date_label')}
                                    </Text>
                                    <div className="flex mt-1">
                                        <CflrIcon width="20" height="20" className="flex-shrink-0" />
                                        <Text
                                            className="text-16 ml-1"
                                            fw={400}
                                            c="var(--flr-dark-gray)"
                                        >
                                            {formatNumberWithSuffix(totalRewardsEarned, 2)}
                                            <span
                                                className="ml-1 text-[var(--flr-gray)]"
                                            >
                                                (${formatNumberWithSuffix(totalRewardsEarnedUSD, 2)})
                                            </span>
                                        </Text>
                                    </div>
                                </Grid.Col>
                            </>
                        }
                    </Grid>
                }
            </Grid>
            {!isLoading && hasTokensWithoutAssets &&
                <div
                    className={`md:hidden flex items-center px-[15px] lg:px-5 py-5 bg-[var(--flr-lightest-gray)] ${tokens?.length === 0 ? 'border-t' : ''} max-[991px]:border-t md:border-b-0 border-[var(--flr-border-color)]`}>
                    {tokensWithoutAssets?.map((token, index) => (
                        <div
                            style={{
                                transform: `translateX(${index * -10}px)`,
                                zIndex: tokensWithoutAssets.length - index
                            }}
                            key={index}
                        >
                            {token?.token?.icon({ width: "32", height: "32" })}
                        </div>
                    ))}
                    <Text
                        className={`text-16 ${tokensWithoutAssets?.length > 1 ? '' : 'ml-2'}`}
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('fasset_position_card.no_assets_label', { fassets: tokensWithoutAssets?.map(token => token?.symbol).join(', ') })}
                    </Text>
                </div>
            }
        </div>
    );
}
