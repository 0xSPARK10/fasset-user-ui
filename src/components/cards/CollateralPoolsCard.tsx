import {
    Title,
    Button,
    Text,
    Table,
    Badge,
    Avatar
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import Link from "next/link";
import LogoIcon from "@/components/icons/LogoIcon";
import { usePools } from "@/api/pool";
import { useWeb3 } from "@/hooks/useWeb3";
import { IEcosystemInfo, ITimeData } from "@/types";
import { formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";

interface ICollateralPoolsCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
}

export default function CollateralPoolsCard({ ecoSystemInfo, timeData }: ICollateralPoolsCard) {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 640px)');
    const { mainToken } = useWeb3();
    const pools = usePools(COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type));

    const fAssetTokens = ecoSystemInfo?.poolRewards?.map(supply => {
        return {
            ...supply,
            token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
        };
    });
    const mainTokenTvl = ecoSystemInfo?.supplyByCollateral.find(supply => supply.symbol.toLowerCase() === mainToken?.type.toLowerCase());

    const bestPools = timeData?.bestPools?.map(pool => {
        return {
            ...pool,
            token: COINS.find(coin => coin.type.toLowerCase() === pool.fasset.toLowerCase())
        }
    });

    return (
        <div className="flex flex-col h-full max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)]">
            <div className="flex max-[403px]:flex-col max-[403px]:items-start max-[403px]:mb-2 min-[403px]:items-center justify-between px-[15px] lg:px-6 py-2 min-h-14">
                <Title
                    className="text-16 uppercase"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('collateral_pools_card.title')}
                </Title>
                <Button
                    variant="gradient"
                    component={Link}
                    href="/pools"
                    radius="xl"
                    size="sm"
                    h={isMobile ? 34 : 41}
                    fw={400}
                    className="max-[403px]:mt-3 shrink-0"
                >
                    {t('collateral_pools_card.view_pools_button')}
                </Button>
            </div>
            <div className="flex flex-wrap bg-[var(--flr-lightest-gray)] border-t border-[var(--flr-border-color)]">
                <div className="basis-full min-[403px]:basis-6/12 px-[15px] lg:px-6 py-6 grow border-r border-[var(--flr-border-color)]">
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('collateral_pools_card.total_pools_rewards_label')}
                    </Text>
                    <Text
                        className="text-48 mt-2"
                        fw={300}
                        c="var(--flr-dark-gray)"
                    >
                        ${formatNumberWithSuffix(ecoSystemInfo?.totalPoolRewardsPaidUSD ?? 0)}
                    </Text>
                    <div className="flex items-center flex-wrap -mx-3">
                        {fAssetTokens?.map((fAsset, index) => (
                            <div
                                className="flex items-center mx-2 my-1 px-2 py-1"
                                key={index}
                            >
                                {fAsset?.token?.icon({width: "20", height: "20"})}
                                <Text
                                    className="ml-2 text-16"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {formatNumberWithSuffix(fAsset.rewards)}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="basis-full min-[403px]:basis-6/12 px-[15px] lg:px-6 py-6 grow">
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('collateral_pools_card.tvl_label')}
                    </Text>
                    <Text
                        className="text-48 mt-2"
                        fw={300}
                        c="var(--flr-dark-gray)"
                    >
                        ${formatNumberWithSuffix(ecoSystemInfo?.tvl ?? 0)}
                    </Text>
                    <div className="flex items-center mt-2">
                        {mainToken && mainToken.icon({ width: "20", height: "20" })}
                        <Text
                            className="ml-2 text-16"
                            fw={400}
                        >
                            {formatNumberWithSuffix(mainTokenTvl?.supply ?? 0)}
                        </Text>
                    </div>
                </div>
                <div
                    className="flex items-center justify-between pb-1 basis-full"
                >
                    <Text
                        className="text-16 pl-[15px] lg:pl-6"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('collateral_pools_card.top_performing_pools_label')}
                    </Text>
                    <Text
                        className="text-12 uppercase pr-[15px] lg:pr-6 text-right mt-1"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('collateral_pools_card.showing_label', {from: bestPools?.length, total: pools.data?.length})}
                    </Text>
                </div>
            </div>
            <Table
                verticalSpacing="md"
                className="!border-0"
                layout="fixed"
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th
                            className="w-6/12 !px-[15px] lg:!px-6 !py-3 !bg-[var(--flr-white)] border-t border-[var(--flr-border-color)]">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('collateral_pools_card.asset_type_label')}
                            </Text>
                        </Table.Th>
                        <Table.Th className="w-4/12 !px-[15px] lg:!px-6 !py-3 !bg-[var(--flr-white)] border-t border-[var(--flr-border-color)]">
                            <Text
                                className="text-12 uppercase text-right min-[403px]:text-left"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('collateral_pools_card.tvl_label')}
                            </Text>
                        </Table.Th>
                        <Table.Th className="w-3/12 !px-[15px] lg:!px-6 !py-3 text-right hidden min-[403px]:table-cell !p-3 !bg-[var(--flr-white)] border-t border-[var(--flr-border-color)]">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('collateral_pools_card.rewards_label')}
                            </Text>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {bestPools?.map((pool, index) => (
                        <Table.Tr key={index}>
                            <Table.Td className={`w-3/12 !px-[15px] lg:!px-6 !py-3 !bg-[var(--flr-lightest-gray)] ${index === bestPools?.length - 1 ? '!border-b-0' : ''}`}>
                                <div className="flex items-center">
                                    {pool.token?.nativeIcon && pool.token?.nativeIcon({
                                        width: isMobile ? "32" : "50",
                                        height: isMobile ? "32" : "50",
                                        className: 'z-20 shrink-0'
                                    })}
                                    {pool.url.length > 0 && pool.url != '-'
                                        ? <Avatar
                                            src={pool.url}
                                            size={isMobile ? "32" : "50"}
                                            className="z-10 -translate-x-2 shrink-0"
                                        />
                                        : <LogoIcon
                                            width={isMobile ? "32" : "50"}
                                            height={isMobile ? "32" : "50"}
                                            className="z-10 -translate-x-2 shrink-0"
                                        />
                                    }
                                    <Text
                                        className="ml-1 text-16 truncate"
                                        fw={400}
                                    >
                                        {pool.name}
                                    </Text>
                                </div>
                            </Table.Td>
                            <Table.Td className={`w-4/12 !px-[15px] lg:!px-6 !py-3 !bg-[var(--flr-lightest-gray)] text-right min-[403px]:text-left ${index === bestPools?.length - 1 ? '!border-b-0' : ''}`}>
                                <div className="flex max-[373px]:flex-col min-[403px]:flex-col max-[373px]:items-end max-[403px]:items-center">
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-dark-gray)"
                                    >
                                        ${formatNumberWithSuffix(pool.tvl)}
                                    </Text>
                                    <Badge
                                        variant="outline"
                                        color={pool?.tvlDiffPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                        radius="xs"
                                        leftSection={pool?.tvlDiffPositive
                                            ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                            : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                        }
                                        className="px-1 ml-2 min-[403px]:mt-1 min-[403px]:ml-0 shrink-0"
                                    >
                                        <Text
                                            className="text-12"
                                            fw={400}
                                            c={pool?.tvlDiffPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                                        >
                                            {pool?.tvlDiff}%
                                        </Text>
                                    </Badge>
                                </div>
                            </Table.Td>
                            <Table.Td className={`w-4/12 !px-[15px] lg:!px-6 !py-3 text-right hidden min-[403px]:table-cell !bg-[var(--flr-lightest-gray)] ${index === bestPools?.length - 1 ? '!border-b-0' : ''}`}>
                                <Text
                                    className="text-16"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    ${formatNumberWithSuffix(pool.rewardsPaid)}
                                </Text>
                                <Badge
                                    variant="outline"
                                    color={pool?.rewardsDiffPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                    radius="xs"
                                    leftSection={pool?.rewardsDiffPositive
                                        ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                        : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                    }
                                    className="px-1 mt-1"
                                    classNames={{
                                        label: 'overflow-visible'
                                    }}
                                >
                                    <Text
                                        className="text-12"
                                        fw={400}
                                        c={pool?.rewardsDiffPositive ? 'var(--flr-green)' : 'var(--flr-red)'}
                                    >
                                        {pool?.rewardsDiff}%
                                    </Text>
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </div>
    );
}
