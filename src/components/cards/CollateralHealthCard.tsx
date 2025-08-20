import {
    Title,
    Grid,
    RingProgress,
    Text,
    Progress,
    Divider,
    Badge,
    SimpleGrid,
    Tooltip
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import { IEcosystemInfo, ITimeData } from "@/types";
import { COINS } from "@/config/coin";

interface ICollateralHealth {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
}

export default function CollateralHealthCard({ ecoSystemInfo, timeData }: ICollateralHealth) {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 640px)');

    const fAssetTokens = ecoSystemInfo?.supplyByFasset?.map(supply => {
        let color = '';

        if (supply.fasset.toLowerCase().includes('xrp')) {
            color = '#E62058';
        } else if (supply.fasset.toLowerCase().includes('doge')) {
            color = '#A11041';
        } else if (supply.fasset.toLowerCase().includes('btc')) {
            color = 'transparent';
        }

        let progressValue = ecoSystemInfo ? toNumber(supply.minted) / toNumber(ecoSystemInfo.totalMinted) * 100 : 0
        if (progressValue < 0.5) {
            progressValue += 0.5;
        }

        return {
            ...supply,
            token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
            timeData: timeData?.supplyDiff.find(diff => diff.fasset.toLowerCase() === supply.fasset.toLowerCase()),
            progressColor: color,
            progressValue: progressValue,
        };
    });

    const collateralTokens = ecoSystemInfo?.supplyByCollateral?.map(supply => {
        let color = '';

        if (supply.symbol.toLowerCase().includes('flr')) {
            color = 'var(--flr-pink)';
        } else if (supply.symbol.toLowerCase().includes('eth') || supply.symbol.toLowerCase().includes('usdx')) {
            color = 'var(--flr-black)';
        } else if (supply.symbol.toLowerCase().includes('usdt0')) {
            color = '#00B988';
        } else if (supply.symbol.toLowerCase().includes('usdt')) {
            color = 'var(--flr-teal)';
        } else if (supply.symbol.toLowerCase().includes('usdc')) {
            color = 'var(--flr-blue)';
        }

        return {
            ...supply,
            progressValue: ecoSystemInfo ? toNumber(supply.supplyUSD) / toNumber(ecoSystemInfo.totalCollateral) * 100 : 0,
            progressColor: color,
            token: COINS.find(coin => coin.type.toLowerCase() === supply.symbol.toLowerCase()),
        }
    });

    const total = ecoSystemInfo !== undefined
        ? toNumber(ecoSystemInfo?.totalCollateral) + toNumber(ecoSystemInfo?.totalMinted)
        : 0;

    return (
        <div className="max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)]">
            <Title
                className="text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t('collateral_health_card.title')}
            </Title>
            <Grid
                className="bg-[var(--flr-lightest-gray)] border-t border-[var(--flr-border-color)]"
                styles={{
                    root: {
                        '--grid-gutter': 0
                    }
                }}
            >
                <Grid.Col
                    span={{ base: 12, md: 4 }}
                    className="max-[991px]:border-b min-[992px]:border-r border-[var(--flr-border-color)]"
                >
                    <div className="flex flex-col justify-center h-full">
                        <RingProgress
                            size={isMobile ? 310 : 340}
                            thickness={30}
                            label={
                                <div className="flex flex-col items-center">
                                    <Text
                                        className="text-12 uppercase"
                                        c="var(--flr-black)"
                                        fw={400}
                                    >
                                        {t('collateral_health_card.over_collateralized_label')}
                                    </Text>
                                    <Text
                                        className="text-[38px] md:text-48"
                                        fw={300}
                                        c="#232323"
                                    >
                                        {ecoSystemInfo?.overCollaterazied ?? 0}%
                                    </Text>
                                    <Text
                                        className="text-16"
                                        fw={400}
                                    >
                                        ${formatNumberWithSuffix(ecoSystemInfo?.totalCollateral ?? 0)}
                                    </Text>
                                </div>
                            }
                            sections={[
                                {
                                    value: ecoSystemInfo !== undefined ? (toNumber(ecoSystemInfo.totalMinted) / total) * 100 : 0,
                                    color: '#C10F45'
                                },
                                {
                                    value: ecoSystemInfo !== undefined ? (toNumber(ecoSystemInfo.totalCollateral) / total) * 100 : 0,
                                    color: '#FFCCD5'
                                }
                            ]}
                            className={isMobile ? '' : '-translate-x-3'}
                            classNames={{
                                root: 'mx-auto'
                            }}
                        />
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }} className="px-[15px] lg:px-6 pt-5 pb-2 min-[992px]:border-r border-[var(--flr-border-color)]">
                    <div className="flex items-center mb-1">
                        <div className="w-5 h-5 bg-[#C10F45] rounded-md mr-2" />
                        <Text
                            className="text-16 uppercase"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('collateral_health_card.circulating_supply_label')}
                        </Text>
                    </div>
                    <Text
                        className="text-24"
                        fw={300}
                        c="var(--flr-dark-gray)"
                    >
                        ${formatNumberWithSuffix(ecoSystemInfo?.totalMinted ?? 0)}
                    </Text>
                    <Progress.Root
                        size={20}
                        classNames={{
                            root: 'bg-transparent'
                        }}
                    >
                        {fAssetTokens?.map((token, index) => (
                            <Tooltip label={token.fasset} key={index}>
                                <Progress.Section
                                    value={token.progressValue}
                                    color={token.progressColor}
                                    className={`${token.fasset.toLowerCase().includes('btc') ? 'border border-[var(--flr-red)]' : ''}`}
                                />
                            </Tooltip>
                        ))}
                    </Progress.Root>
                    <Divider color="var(--flr-border-color)" className="mt-4 mb-2 -mx-[15px] lg:-mx-6 hidden min-[992px]:block" />
                    <div className="flex flex-wrap lg:flex-col max-[992px]:mt-8 -mx-2">
                        {fAssetTokens?.map((token, index) => (
                            <div
                                className="grow m-1 p-1"
                                key={index}
                            >
                                <div className="flex items-center">
                                    {token?.token?.icon({ width: isMobile ? "48" : "72", height: isMobile ? "48" : "72" })}
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            <div
                                                className={`w-5 h-5 border border-[#C10F45] rounded-md mr-2`}
                                                style={{ backgroundColor: token.progressColor }}
                                            />
                                            {token?.token?.nativeIcon && token?.token?.nativeIcon({
                                                width: "20",
                                                height: "20"
                                            })}
                                            <Text
                                                className="ml-2 text-16"
                                                fw={400}
                                            >
                                                {formatNumberWithSuffix(token.supply, token.token?.type.toLowerCase().includes('btc') ? 6 : 2)}
                                            </Text>
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <Text
                                                className="text-14 mr-2"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                ${formatNumberWithSuffix(token.minted)}
                                            </Text>
                                            <Badge
                                                variant="outline"
                                                color={token?.timeData?.isPositive ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                                radius="xs"
                                                leftSection={token?.timeData?.isPositive
                                                    ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                                    : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                                }
                                                className="px-1"
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
                                    </div>
                                </div>
                                {index < fAssetTokens.length - 1
                                    && <Divider color="var(--flr-border-color)" className="mt-4 -mx-[15px] lg:-mx-6 hidden min-[992px]:block" />
                                }
                            </div>
                        ))}
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }} className="px-[15px] lg:px-6 py-5 max-[991px]:border-t border-[var(--flr-border-color)]">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center mb-1">
                            <div className="w-5 h-5 bg-[#FFCCD5] rounded-md mr-2" />
                            <Text
                                className="text-16 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('collateral_health_card.total_collateral_label')}
                            </Text>
                        </div>
                        <div className="flex items-center justify-between">
                            <Text
                                className="text-24"
                                fw={300}
                                c="var(--flr-dark-gray)"
                            >
                                ${formatNumberWithSuffix(ecoSystemInfo?.totalCollateral ?? 0)}
                            </Text>
                            <Badge
                                variant="outline"
                                color={timeData?.isPositiveCollateralDiff ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                radius="xs"
                                leftSection={timeData?.isPositiveCollateralDiff
                                    ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                    : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                                }
                                className="px-1"
                            >
                                <Text
                                    className="text-14"
                                    fw={400}
                                    c={timeData?.isPositiveCollateralDiff ? 'var(--flr-green)' : 'var(--flr-red)'}
                                >
                                    {timeData?.totalCollateralDiff}%
                                </Text>
                            </Badge>
                        </div>
                        <Progress.Root
                            size={20}
                        >
                            {collateralTokens?.map((token, index) => (
                                <Tooltip label={token.symbol} key={index}>
                                    <Progress.Section value={token.progressValue} color={token.progressColor} />
                                </Tooltip>
                            ))}
                        </Progress.Root>
                        <Divider color="var(--flr-border-color)" className="my-4 -mx-[15px] lg:-mx-6" />
                        <SimpleGrid
                            cols={2}
                            className="-mx-3 grow"
                            styles={{
                                root: {
                                    '--sg-spacing-y': '2rem'
                                }
                            }}
                            style={{
                                'gridTemplateRows': 'auto 1fr'
                            }}
                        >
                            {collateralTokens?.map((token, index) => (
                                <div className="p-3" key={index}>
                                    <div className="flex items-center">
                                        {token?.token?.icon({ width: "20", height: "20" })}
                                        <Text
                                            className="ml-2 text-16"
                                            fw={400}
                                        >
                                            {formatNumberWithSuffix(token.supply)}
                                        </Text>
                                    </div>
                                    <Text
                                        className="mt-2 text-14"
                                        fw={400}
                                        c="var(--flr-dark-gray)"
                                    >
                                        ${formatNumberWithSuffix(token.supplyUSD)}
                                    </Text>
                                </div>
                            ))}
                        </SimpleGrid>
                    </div>
                </Grid.Col>
            </Grid>
        </div>
    );
}
