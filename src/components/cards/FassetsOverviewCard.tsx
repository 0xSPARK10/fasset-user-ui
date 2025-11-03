import { useTranslation } from "react-i18next";
import { Title, Text, Badge, Grid, SimpleGrid, rem, Divider, Button } from "@mantine/core";
import { IEcosystemInfo, ITimeData } from "@/types";
import { formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";
import { IconCaretDownFilled, IconCaretUpFilled, IconInfoHexagon } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { modals } from "@mantine/modals";
import { useMediaQuery } from "@mantine/hooks";

interface IFassetsOverviewCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
}

export default function FassetsOverviewCard({ ecoSystemInfo, timeData } : IFassetsOverviewCard) {
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');

    const xrpFasset = ecoSystemInfo?.supplyByFasset
        ?.map(supply => {
            return {
                ...supply,
                token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
                timeData: timeData?.supplyDiff.find(diff => diff.fasset.toLowerCase() === supply.fasset.toLowerCase())
            };
        })
        ?.find(supply => supply.fasset.toLowerCase().includes('xrp'));

    const openModal = () => {
        modals.open({
            zIndex: 3000,
            size: 800,
            fullScreen: mediaQueryMatches,
            title: <Text className="text-32" fw={300} c="var(--flr-black)">
                {t('fassets_overview_card.available_to_mint_modal.title')}
            </Text>,
            children: (
                <div>
                    <div className="py-2 px-0 sm:px-8">
                        <Title
                            className="text-24 mb-3"
                            fw={300}
                            c="var(--flr-dark-gray)"
                        >
                            {t('fassets_overview_card.available_to_mint_modal.what_title')}
                        </Title>
                        <Text
                            className="text-16 whitespace-pre-line"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('fassets_overview_card.available_to_mint_modal.what_description_label')}
                        </Text>
                        <Title
                            className="text-24 mb-3 mt-10"
                            fw={300}
                            c="var(--flr-dark-gray)"
                        >
                            {t('fassets_overview_card.available_to_mint_modal.how_title')}
                        </Title>
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('fassets_overview_card.available_to_mint_modal.how_description_label')}
                        </Text>
                    </div>
                    <Divider
                        c="var(--flr-border-color)"
                        className="my-10 -mx-4"
                    />
                    <Button
                        onClick={() => {
                            modals.closeAll()
                        }}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mb-5"
                    >
                        {t('fassets_overview_card.available_to_mint_modal.confirm_button')}
                    </Button>
                </div>
            )
        })
    }

    return (
        <div className="flex flex-col max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)] h-full relative">
            <div className="flex items-center justify-between px-[15px] lg:px-6 py-4 min-h-14 border-b border-[var(--flr-border-color)]">
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
                className="flex items-center bg-[var(--flr-lightest-gray)] h-full"
                classNames={{
                    root: 'h-full',
                    inner: 'h-full w-full'
                }}
                styles={{
                    root: {
                        '--grid-gutter': 0
                    },
                }}
            >
                <Grid.Col
                    span={{ base: 12, xs: 8 }}
                    className="max-[575px]:pt-[15px] pl-[15px] lg:pl-6"
                >
                    <div className="flex items-center min-[576px]:border-r border-[var(--flr-border-color)] h-full py-3">
                        {xrpFasset?.token?.icon({ width: "140", height: "140" })}
                        <div className="ml-5">
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
                        </div>
                    </div>
                </Grid.Col>
                <Grid.Col
                    span={{ base: 12, xs: 4 }}
                    className="p-0 flex flex-col"
                >
                    <div className="flex flex-col justify-center max-[576px]:border-t border-b border-[var(--flr-border-color)] px-[15px] lg:px-6 py-3 basis-1/2">
                        <Text
                            className="text-12 uppercase"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('fassets_overview_card.overall_fxrp_cap_label', { fAsset: xrpFasset?.fasset })}
                        </Text>
                        <div className="flex items-center">
                            {xrpFasset?.token?.icon({ width: "24", height: "24" })}
                            {xrpFasset?.mintingCap === '0' &&
                                <Text
                                    className="text-32 ml-2 leading-none"
                                    fw={300}
                                    c="var(--flr-dark-gray)"
                                >
                                    <span dangerouslySetInnerHTML={{ __html: '&infin;' }} />
                                </Text>
                            }
                            <Text
                                className="text-16 ml-2"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {xrpFasset?.mintingCap === '0'
                                    ? t('fassets_overview_card.cap_removed_label')
                                    : formatNumberWithSuffix(xrpFasset?.mintingCap ?? 0)
                                }
                            </Text>
                        </div>
                        {xrpFasset?.mintingCap !== '0' &&
                            <Text
                                className="text-14 mt-1"
                                c="var(--flr-dark-gray)"
                                fw={400}
                            >
                                ${formatNumberWithSuffix(xrpFasset?.mintingCapUSD ?? 0, xrpFasset?.token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                            </Text>
                        }
                    </div>
                    <div className="flex flex-col justify-center px-[15px] lg:px-6 py-3 basis-1/2">
                        <div className="flex items-center">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('fassets_overview_card.available_to_mint_label')}
                            </Text>
                            <IconInfoHexagon
                                style={{width: rem(16), height: rem(16)}}
                                color="var(--mantine-color-gray-6)"
                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                onClick={openModal}
                            />
                        </div>

                        <div className="flex items-center mt-1">
                            {xrpFasset?.token?.icon({ width: "24", height: "24" })}
                            <Text
                                className="text-16 ml-2 leading-none"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {formatNumberWithSuffix(xrpFasset?.availableToMintAsset ?? 0)}
                            </Text>
                        </div>
                        <Text
                            className="text-14 mt-1"
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
