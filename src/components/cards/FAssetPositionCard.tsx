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
    isLoading: boolean;
}

export default function FAssetPositionCard({ balance, isLoading }: IFAssetPositionCard) {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 767px)');

    const fassetTokensCount = balance?.filter(balance => 'lots' in balance)?.length;
    const tokens = balance
        ?.filter(balance => 'lots' in balance && balance.symbol.toLowerCase().includes('xrp') && (isMobile ? balance.balance !== '0' : true))
        ?.map(balance => {
            return {
                ...balance,
                token: COINS.find(coin => coin.type.toLowerCase() === balance.symbol.toLowerCase()),
            }
        });

    const tokensWithoutAssets = balance
        ?.filter(balance => 'lots' in balance && balance.symbol.toLowerCase().includes('xrp') && balance.balance === '0')
        ?.map(balance => {
            return {
                ...balance,
                token: COINS.find(coin => coin.type.toLowerCase() === balance.symbol.toLowerCase()),
            }
        });

    const hasTokensWithoutAssets = tokensWithoutAssets !== undefined && tokensWithoutAssets?.length === fassetTokensCount;
    const isRedeemButtonDisabled = fassetTokensCount === tokensWithoutAssets?.length;

    return (
        <div className="flex flex-col border-x-0 md:border-x border-y border-[var(--flr-border-color)] relative h-full">
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
                    inner: 'h-full bg-[var(--flr-lightest-gray)]'
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
                        span={{ base: 12 }}
                        className={`flex items-center px-[15px] lg:px-5 py-3 ${index < tokens?.length - 1 ? 'md:border-r' : ''} border-[var(--flr-border-color)]`}
                        key={index}
                    >
                        {token?.token?.icon({ width: isMobile ? "45" : "70", height: isMobile ? "45" : "70" })}
                        {token?.balance !== '0'
                            ? <div className="ml-2 flex items-center">
                                <Text
                                    className="text-32"
                                    c="var(--flr-black)"
                                    fw={300}
                                >
                                    {formatNumberWithSuffix(token?.balance, token?.symbol?.toLowerCase().includes('btc') ? 4 : 2)}
                                </Text>
                                <div className="ml-12">
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {formatNumberWithSuffix(token?.lots ?? 0, 0)} {t('fasset_position_card.lots_label')}
                                    </Text>
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-dark-gray)"
                                    >
                                        ${formatNumberWithSuffix(token?.valueUSD ?? 0)}
                                    </Text>
                                </div>
                            </div>
                            : <div className="ml-2">
                                <Text
                                    className="text-28"
                                    fw={300}
                                    c="var(--flr-gray)"
                                >
                                    {formatNumberWithSuffix(token?.balance, token?.symbol?.toLowerCase().includes('btc') ? 4 : 2)}
                                </Text>
                            </div>
                        }
                    </Grid.Col>
                ))}
            </Grid>
            {!isLoading && hasTokensWithoutAssets &&
                <div
                    className={`md:hidden flex items-center px-[15px] lg:px-5 py-5 bg-[var(--flr-lightest-gray)] ${tokens?.length === 0 ? 'border-t' : ''} max-[991px]:border-t md:border-b-0 border-[var(--flr-border-color)]`}
                >
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
