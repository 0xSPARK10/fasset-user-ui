import { useTranslation } from "react-i18next";
import { Title, Text, Badge, Grid } from "@mantine/core";
import { IEcosystemInfo, ITimeData } from "@/types";
import { formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

interface IFassetsOverviewCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
}

export default function FassetsOverviewCard({ ecoSystemInfo, timeData } : IFassetsOverviewCard) {
    const { t } = useTranslation();

    const xrpFasset = ecoSystemInfo?.supplyByFasset
        ?.map(supply => {
            return {
                ...supply,
                token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
                timeData: timeData?.supplyDiff.find(diff => diff.fasset.toLowerCase() === supply.fasset.toLowerCase())
            };
        })
        ?.find(supply => supply.fasset.toLowerCase().includes('xrp'));

    return (
        <div className="flex flex-col max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)] h-full relative">
            <div className="flex items-center justify-between px-[15px] lg:px-6 py-4 min-h-14">
                <Title
                    className="text-16 uppercase"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('fassets_overview_card.title')}
                </Title>
                <Link
                    href="/mint"
                    className="flex items-center underline text-16"
                >
                    <span>{t('available_to_mint_card.mint_label', { fAsset: xrpFasset?.fasset })}</span>
                </Link>
            </div>
            <Grid
                grow
                className="flex items-center bg-[var(--flr-lightest-gray)] px-[15px] lg:px-6 py-5 border-t border-[var(--flr-border-color)] h-full"
            >
                <Grid.Col
                    span={{ base: 12, xs: 3 }}
                    className="flex justify-center md:justify-normal"
                >
                    {xrpFasset?.token?.icon({ width: "140", height: "140" })}
                </Grid.Col>
                <Grid.Col
                    span={{ base: 12, xs: 4 }}
                    className="flex flex-col max-[576px]:items-center justify-center"
                >
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('fassets_overview_card.circulating_supply_label')}
                    </Text>
                    <div className="flex min-[1330px]:flex-row min-[1200px]:flex-col items-baseline my-2">
                        <Text
                            className="text-32 mr-2 leading-none"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {formatNumberWithSuffix(xrpFasset?.supply ?? 0)}
                        </Text>
                        <Text
                            className="text-16 leading-none"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            ({t('fassets_overview_card.lots_label', { lots: formatNumberWithSuffix(xrpFasset?.mintedLots ?? 0, 1) })})
                        </Text>
                    </div>
                    <div className="flex items-center">
                        <Text
                            className="text-16 mr-2"
                            c="var(--flr-dark-gray)"
                            fw={400}
                        >
                            ${formatNumberWithSuffix(xrpFasset?.minted ?? 0, xrpFasset?.token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                        </Text>
                        <Badge
                            variant="outline"
                            color={xrpFasset?.timeData?.isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                            radius="xs"
                            leftSection={xrpFasset?.timeData?.isPositive
                                ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                            }
                            className="px-1 shrink-0"
                        >
                            <Text
                                className="text-14"
                                fw={400}
                                c={xrpFasset?.timeData?.isPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                            >
                                {xrpFasset?.timeData?.diff}%
                            </Text>
                        </Badge>
                    </div>
                </Grid.Col>
                <Grid.Col
                    span={{ base: 12, xs: 4 }}
                    className="flex flex-col max-[576px]:items-center justify-center max-[575px]:mt-5"
                >
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('fassets_overview_card.available_to_mint_label')}
                    </Text>
                    <div className="flex min-[1330px]:flex-row min-[1200px]:flex-col items-baseline my-2">
                        <Text
                            className="text-32 mr-2 leading-none"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {formatNumberWithSuffix(xrpFasset?.availableToMintAsset ?? 0)}
                        </Text>
                        <Text
                            className="text-16 leading-none"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            ({t('fassets_overview_card.lots_label', { lots: formatNumberWithSuffix(xrpFasset?.availableToMintLots ?? 0, 0) })})
                        </Text>
                    </div>
                    <div className="flex items-center">
                        <Text
                            className="text-16"
                            c="var(--flr-dark-gray)"
                            fw={400}
                        >
                            ${formatNumberWithSuffix(xrpFasset?.availableToMintUSD ?? 0, xrpFasset?.token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                        </Text>
                    </div>
                </Grid.Col>
            </Grid>
        </div>
    );
}
