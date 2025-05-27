import { Badge, Progress, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import { COINS } from "@/config/coin";
import { IEcosystemInfo, ITimeData } from "@/types";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

interface ICollateralCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
}

export default function CollateralCard({ ecoSystemInfo, timeData }: ICollateralCard) {
    const { t } = useTranslation();

    const collateralTokens = ecoSystemInfo?.supplyByCollateral?.map(supply => {
        let color = '';

        if (supply.symbol.toLowerCase().includes('flr')) {
            color = 'var(--flr-pink)';
        } else if (supply.symbol.toLowerCase().includes('eth') || supply.symbol.toLowerCase().includes('usdx')) {
            color = 'var(--flr-black)';
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

    return (
        <div className="bg-[var(--flr-lightest-gray)] max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)] h-full">
            <Text
                className="bg-[var(--flr-white)] text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t('collateral_card.title')}
            </Text>
            <div className="px-5 py-3 border-y border-[var(--flr-border-color)]">
                <Text
                    className="text-12 uppercase mb-1"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('collateral_card.total_label')}
                </Text>
                <div className="flex items-center">
                    {collateralTokens?.map((collateralToken, index) => (
                        <div key={index}>
                            <div
                                className="relative"
                                style={{
                                    transform: `translateX(${index * -5}px)`,
                                    zIndex: collateralTokens.length - index
                                }}
                            >
                                {collateralToken.token?.icon({ width: "40", height: "40" })}
                            </div>
                        </div>
                    ))}
                    <Text
                        className="text-24"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        ${formatNumberWithSuffix(ecoSystemInfo?.totalCollateral ?? 0)}
                    </Text>
                </div>
                <Badge
                    variant="outline"
                    color={timeData?.isPositiveCollateralDiff ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                    radius="xs"
                    leftSection={timeData?.isPositiveCollateralDiff
                        ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                        : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                    }
                    className="px-1 mt-2"
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
            <div className="px-5 py-3">
                <Progress.Root
                    size={10}
                >
                    {collateralTokens?.map((token, index) => (
                        <Tooltip label={token.symbol} key={index}>
                            <Progress.Section value={token.progressValue} color={token.progressColor} />
                        </Tooltip>
                    ))}
                </Progress.Root>

                <div className="flex flex-wrap mt-4 -mx-4">
                    {collateralTokens?.map((token, index) => (
                        <div key={index}>
                            <div className="px-4 py-2 flex items-center">
                                {token?.token?.icon({ width: "20", height: "20" })}
                                <Text
                                    className="flex items-center flex-wrap ml-2 text-16"
                                    fw={400}
                                >
                                    <span className="mr-1">{formatNumberWithSuffix(token.supply)}</span>
                                    <span className="text-14 text-[var(--flr-dark-gray)]">(${formatNumberWithSuffix(token.supplyUSD)})</span>
                                </Text>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
