import React from "react";
import {
    Button,
    Text,
    Loader,
    Grid,
    Flex,
} from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useMediaQuery, useMounted } from "@mantine/hooks";
import { formatNumberWithSuffix } from "@/utils";
import { INativeBalance } from "@/types";
import { COINS } from "@/config/coin";


interface IFAssetPositionCard {
    balance: INativeBalance[] | undefined;
    isLoading: boolean;
}

export default function FAssetPositionCard({ balance, isLoading }: IFAssetPositionCard) {
    const { t } = useTranslation();
    const mounted = useMounted();
    const matchesMobile = useMediaQuery('(max-width: 767px)');
    const isMobile = mounted && matchesMobile;

    const fassetTokensCount = balance?.filter(b => 'lots' in b)?.length;

    const tokens = balance
        ?.filter(b => 'lots' in b && (isMobile ? b.balance !== '0' : true))
        ?.map(b => ({
            ...b,
            token: COINS.find(coin => coin.type.toLowerCase() === b.symbol.toLowerCase()),
        }));

    const tokensWithoutAssets = balance?.filter(b => 'lots' in b && b.balance === '0');

    const isMintButtonDisabled = !isLoading && balance !== undefined && fassetTokensCount === tokensWithoutAssets?.length;
    const isLoadingState = isLoading || !balance;

    return (
        <div className="flex flex-col border-x-0 md:border-x border-y border-[var(--flr-border-color)] relative h-full">
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
                {isLoadingState ? (
                    <Grid.Col className="flex items-center justify-center px-[15px] lg:px-6 py-8">
                        <Loader size="md" color="var(--flr-black)" />
                    </Grid.Col>
                ) : (
                    tokens?.map((token, index) => (
                        <Grid.Col
                            className={`flex items-center justify-between px-[15px] lg:px-6 py-3 ${index < tokens?.length - 1 ? 'md:border-r' : ''} border-[var(--flr-border-color)]`}
                            key={index}
                        >
                            <Flex>
                                {token?.token?.icon({ width: isMobile ? "45" : "64", height: isMobile ? "45" : "64" })}
                                <div className="ml-5 flex flex-col items-start justify-center">
                                    <Text
                                        className="text-16 uppercase"
                                        c="var(--flr-dark-gray  )"
                                        fw={400}
                                    >
                                        {t('fasset_position_card.your_position_label')}
                                    </Text>
                                    <div>
                                        <Text
                                            className="text-16"
                                            fw={400}
                                            c="var(--flr-black)"
                                        >
                                            {formatNumberWithSuffix(token.balance)}
                                        </Text>
                                    </div>
                                </div>
                            </Flex>
                            <div>
                                <Button
                                    variant="gradient"
                                    component={Link}
                                    href="/mint"
                                    radius="xl"
                                    size="sm"
                                    h={isMobile ? 34 : 41}
                                    fw={400}
                                    disabled={isMintButtonDisabled}
                                    onClick={(e) => {
                                        if (isMintButtonDisabled) e.preventDefault();
                                    }}
                                >
                                    {t('fasset_position_card.mint_button', {fasset: token?.token?.type})}
                                </Button>
                            </div>
                        </Grid.Col>
                    ))
                )}
            </Grid>
        </div>
    );
}
