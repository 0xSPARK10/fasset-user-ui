import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";
import { Title, Text, Badge } from "@mantine/core";
import { IEcosystemInfo, IMintEnabled, ITimeData } from "@/types";
import { formatNumber, formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";
import { IconArrowRight, IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

interface IFassetsOverviewCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
    mintEnabled: IMintEnabled[] | undefined;
}

export default function FassetsOverviewCard({ ecoSystemInfo, timeData, mintEnabled } : IFassetsOverviewCard) {
    const { t } = useTranslation();

    const fAssetTokens = ecoSystemInfo?.supplyByFasset?.map(supply => {
        const mintToken = mintEnabled?.find(item => item.fasset.toLowerCase() === supply.fasset.toLowerCase());

        return {
            ...supply,
            token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
            timeData: timeData?.supplyDiff.find(diff => diff.fasset.toLowerCase() === supply.fasset.toLowerCase()),
            enabled: mintToken?.status
        };
    }) ?? [];

    const enabledFassetTokens = COINS.filter(coin => coin.isFAssetCoin && coin.enabled);
    const isSingleFassetEnabled = fAssetTokens?.length === 1 || fAssetTokens?.length !== enabledFassetTokens?.length;

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
                {isSingleFassetEnabled && fAssetTokens.length > 0 &&
                    <Link
                        href="/mint"
                        className="flex items-center underline text-16"
                    >
                        <span>{t('available_to_mint_card.mint_label', { fAsset: fAssetTokens[0].fasset })}</span>
                    </Link>
                }
            </div>
            <div className="hidden sm:block h-full">
                {isSingleFassetEnabled && fAssetTokens.length > 0
                    ? <div className="flex items-center bg-[var(--flr-lightest-gray)] p-5 border-t border-[var(--flr-border-color)] h-full">
                        {fAssetTokens[0]?.token?.icon({ width: "140", height: "140" })}
                        <div className="mx-14">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('fassets_overview_card.circulating_supply_label')}
                            </Text>
                            <div className="flex items-baseline my-2">
                                <Text
                                    className="text-32 mr-2 leading-none"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {formatNumberWithSuffix(fAssetTokens[0].supply, fAssetTokens[0].token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                                </Text>
                                <Text
                                    className="text-16 leading-none"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    ({t('fassets_overview_card.lots_label', { lots: fAssetTokens[0]?.mintedLots })})
                                </Text>
                            </div>
                            <div className="flex items-center">
                                <Text
                                    className="text-16 mr-3"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    ${formatNumberWithSuffix(fAssetTokens[0].minted)}
                                </Text>
                                <Badge
                                    variant="outline"
                                    color={fAssetTokens[0]?.timeData?.isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                    radius="xs"
                                    leftSection={fAssetTokens[0]?.timeData?.isPositive
                                        ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                        : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                    }
                                    className="px-1 shrink-0"
                                >
                                    <Text
                                        className="text-14"
                                        fw={400}
                                        c={fAssetTokens[0]?.timeData?.isPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                                    >
                                        {fAssetTokens[0]?.timeData?.diff}%
                                    </Text>
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('fassets_overview_card.available_to_mint_label')}
                            </Text>
                            <div className="flex items-baseline my-2">
                                <Text
                                    className="text-32 mr-2 leading-none"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {fAssetTokens[0].availableToMintAsset}
                                </Text>
                                <Text
                                    className="text-16 leading-none"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    ({t('fassets_overview_card.lots_label', { lots: fAssetTokens[0].availableToMintLots })})
                                </Text>
                            </div>
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                ${formatNumber(fAssetTokens[0].availableToMintUSD)}
                            </Text>
                        </div>
                    </div>
                    : <table className="w-full border-t border-[var(--flr-border-color)]">
                        <tbody>
                        {fAssetTokens?.map((token, index) => (
                            <tr
                                key={index}
                                className={`bg-[var(--flr-lightest-gray)] ${index < fAssetTokens.length -1 ? 'border-b border-[var(--flr-border-color)]' : ''}`}
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center w-full">
                                        {token?.token?.icon({ width: "85", height: "85" })}
                                        <div className="ml-3">
                                            <Text
                                                className="text-12 uppercase"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                {t('fassets_overview_card.circulating_supply_label')}
                                            </Text>
                                            <div className="flex items-center">
                                                <Text
                                                    className="text-24 mr-2"
                                                    fw={300}
                                                >
                                                    {formatNumberWithSuffix(token.supply, token.token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                                                </Text>
                                                <Badge
                                                    variant="outline"
                                                    color={token?.timeData?.isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                                    radius="xs"
                                                    leftSection={token?.timeData?.isPositive
                                                        ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                                        : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                                    }
                                                    className="px-1 shrink-0"
                                                >
                                                    <Text
                                                        className="text-14"
                                                        fw={400}
                                                        c={token?.timeData?.isPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                                                    >
                                                        {token?.timeData?.diff}%
                                                    </Text>
                                                </Badge>
                                            </div>
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-black)"
                                            >
                                                ${formatNumberWithSuffix(token.minted)}
                                            </Text>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3">
                                    <div>
                                        <Text
                                            className="text-12 uppercase"
                                            fw={400}
                                            c="var(--flr-dark-gray)"
                                        >
                                            {t('fassets_overview_card.available_to_mint_label')}
                                        </Text>
                                        <Text
                                            className="text-24"
                                            fw={300}
                                            c="var(--flr-black)"
                                        >
                                            {token.availableToMintAsset} ({t('fassets_overview_card.lots_label', { lots: token.availableToMintLots })})
                                        </Text>
                                        <Text
                                            className="text-16"
                                            fw={400}
                                            c="var(--flr-black)"
                                        >
                                            ${formatNumber(token.availableToMintUSD)}
                                        </Text>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link
                                        href="/mint"
                                        onClick={(event) => {
                                            if (!token.enabled) {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }
                                        }}
                                        className={`underline text-16 font-normal ${!token.enabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                                    >
                                        {t('fassets_overview_card.mint_button', { fAsset: token.token?.type })}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                }
            </div>
            <div className="block sm:hidden border-t border-[var(--flr-border-color)] bg-[var(--flr-lightest-gray)]">
                {isSingleFassetEnabled && fAssetTokens.length > 0
                    ? <div className="flex flex-col items-center bg-[var(--flr-lightest-gray)] p-5 border-t border-[var(--flr-border-color)] h-full">
                        {fAssetTokens[0]?.token?.icon({ width: "140", height: "140" })}
                        <div className="flex flex-col items-center mt-5">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('fassets_overview_card.circulating_supply_label')}
                            </Text>
                            <div className="flex items-baseline my-2">
                                <Text
                                    className="text-32 mr-2 leading-none"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {formatNumberWithSuffix(fAssetTokens[0].supply, fAssetTokens[0].token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                                </Text>
                                <Text
                                    className="text-16 leading-none"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    ({t('fassets_overview_card.lots_label', { lots: fAssetTokens[0]?.mintedLots })})
                                </Text>
                            </div>
                            <div className="flex items-center">
                                <Text
                                    className="text-16 mr-3"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    ${formatNumberWithSuffix(fAssetTokens[0].minted)}
                                </Text>
                                <Badge
                                    variant="outline"
                                    color={fAssetTokens[0]?.timeData?.isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                    radius="xs"
                                    leftSection={fAssetTokens[0]?.timeData?.isPositive
                                        ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                        : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                    }
                                    className="px-1 shrink-0"
                                >
                                    <Text
                                        className="text-14"
                                        fw={400}
                                        c={fAssetTokens[0]?.timeData?.isPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                                    >
                                        {fAssetTokens[0]?.timeData?.diff}%
                                    </Text>
                                </Badge>
                            </div>
                        </div>
                        <div className="text-center mt-5">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('fassets_overview_card.available_to_mint_label')}
                            </Text>
                            <div className="flex items-baseline">
                                <Text
                                    className="inline text-32 mr-2"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {fAssetTokens[0].availableToMintAsset}
                                </Text>
                                <Text
                                    className="text-16 leading-none"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    ({t('fassets_overview_card.lots_label', { lots: fAssetTokens[0].availableToMintLots })})
                                </Text>
                            </div>
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                ${formatNumber(fAssetTokens[0].availableToMintUSD)}
                            </Text>
                        </div>
                    </div>
                    : fAssetTokens?.map((token, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center py-5 ${index < fAssetTokens.length - 1 ? 'border-b border-[var(--flr-border-color)]' : ''}`}
                        >
                            <div className="flex justify-center mb-3">
                                {token?.token?.icon({ width: "85", height: "85" })}
                                <div className="ml-3">
                                    <Text
                                        className="text-12 uppercase"
                                        fw={400}
                                        c="var(--flr-dark-gray)"
                                    >
                                        {t('fassets_overview_card.circulating_supply_label')}
                                    </Text>
                                    <div className="flex items-center">
                                        <Text
                                            className="text-24 mr-2"
                                            fw={300}
                                        >
                                            {formatNumberWithSuffix(token.supply, token.token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                                        </Text>
                                        <Badge
                                            variant="outline"
                                            color={token?.timeData?.isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                            radius="xs"
                                            leftSection={token?.timeData?.isPositive
                                                ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                                : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                            }
                                            className="px-1 shrink-0"
                                        >
                                            <Text
                                                className="text-14"
                                                fw={400}
                                                c={token?.timeData?.isPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                                            >
                                                {token?.timeData?.diff}%
                                            </Text>
                                        </Badge>
                                    </div>
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-black)"
                                    >
                                        ${formatNumberWithSuffix(token.minted)}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex flex-col items-center mb-3">
                                <Text
                                    className="text-12 uppercase"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {t('fassets_overview_card.available_to_mint_label')}
                                </Text>
                                <Text
                                    className="text-24"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {token.availableToMintAsset} ({t('fassets_overview_card.lots_label', { lots: token.availableToMintLots })})
                                </Text>
                                <Text
                                    className="text-16"
                                    fw={400}
                                    c="var(--flr-black)"
                                >
                                    ${formatNumber(token.availableToMintUSD)}
                                </Text>
                            </div>
                            <Link
                                href="/mint"
                                onClick={(event) => {
                                    if (!token.enabled) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }}
                                className={`underline text-16 font-normal ${!token.enabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                {t('fassets_overview_card.mint_button', { fAsset: token.token?.type })}
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
