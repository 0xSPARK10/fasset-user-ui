import { Grid, rem, Stepper, Text, Title, Popover } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconInfoHexagon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { orderBy } from "lodash-es";
import { IPool } from "@/types";
import { formatNumberWithSuffix, isMaxCRValue, toNumber } from "@/utils";
import { useWeb3 } from "@/hooks/useWeb3";

interface IPoolCollateralCard {
    pool: IPool | undefined;
}

interface ICr {
    key: string;
    label: string;
    amount: number;
    iconName: string;
    iconColor: string;
}

export default function PoolCollateralCard({ pool }: IPoolCollateralCard) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();

    const cr: ICr[] = orderBy([
        {
            key: 'poolExitCR',
            label: t('agent_details.exit_cr_label', { amount: pool?.poolExitCR }),
            amount: toNumber(pool?.poolExitCR ?? '0'),
            iconName: 'IconArrowUp',
            iconColor: '!bg-[var(--flr-green)] border-[var(--flr-green)]'
        },
        {
            key: 'mintingPoolCR',
            label: t('agent_details.minting_cr_label', { amount: pool?.mintingPoolCR }),
            amount: toNumber(pool?.mintingPoolCR ?? '0'),
            iconName: 'IconArrowUp',
            iconColor: '!bg-[var(--flr-green)] border-[var(--flr-green)]'
        },
        {
            key: 'poolSafetyCR',
            label: t('agent_details.safety_cr_label', {amount: pool?.poolSafetyCR }),
            amount: toNumber(pool?.poolSafetyCR ?? '0'),
            iconName: 'IconArrowDown',
            iconColor: '!bg-[var(--flr-warning)] border-[var(--flr-warning)]'
        },
        {
            key: 'poolMinCR',
            label: t('agent_details.minimum_cr_label', {amount: pool?.poolMinCR }),
            amount: toNumber(pool?.poolMinCR ?? '0'),
            iconName: 'IconArrowDown',
            iconColor: '!bg-[var(--flr-red)] border-[var(--flr-red)]'
        }
    ], ['amount'], ['desc']);


    const getSelectedCr = () => {
        const amount = toNumber(pool?.poolCR ?? '0');

        for (let index = 0; index < cr.length; index++) {
            const currentCR = cr[index];
            const prevCR = index > 0 ? cr[index - 1] : undefined;
            const nextCR = index < cr.length - 1 ? cr[index + 1] : undefined;

            if (index === 0 && amount >= currentCR.amount) {
                return [currentCR.key];
            } else if (index === cr.length - 1 && amount <= currentCR.amount) {
                return [currentCR.key];
            }

            if (prevCR !== undefined && nextCR !== undefined) {
                if (currentCR.iconName === 'IconArrowUp' && amount >= currentCR.amount && amount < prevCR?.amount!) {
                    return [currentCR.key];
                } else if (currentCR.iconName === 'IconArrowDown' && amount > nextCR?.amount! && amount <= currentCR.amount) {
                    return [currentCR.key];
                }
            }
        }

        return cr
            .map(range => {
                return {
                    ...range,
                    value: Math.abs(amount - range.amount)
                };
            })
            .sort((a, b) => a.value - b.value)
            .splice(0, 2)
            .map(range => range.key);
    }

    const selectedCr = getSelectedCr();

    return (
        <div className="p-0 min-[992px]:p-4">
            <div className="flex items-center">
                <Title
                    className="text-28 px-[10px] md:px-0"
                    fw={400}
                >
                    {t('agent_details.pool_collateral_label')}
                </Title>
                <Popover
                    withArrow
                    width="auto"
                >
                    <Popover.Target>
                        <IconInfoHexagon
                            style={{width: rem(16), height: rem(16)}}
                            color="var(--mantine-color-gray-6)"
                            className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                        />
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text className="text-16">{t('agent_details.pool_collateral_description_label')}</Text>
                    </Popover.Dropdown>
                </Popover>
            </div>
            <Grid
                className="mt-5"
                styles={{
                    root: {
                        '--grid-gutter': 0
                    },
                }}
            >
                <Grid.Col span={6} className="p-4 border-t border-b border-r border-[--flr-border-color]">
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('agent_details.asset_label')}
                    </Text>
                    <div className="flex items-center mt-2">
                        {mainToken?.icon({width: "40", height: "40"})}
                        <Text className="ml-2 text-16" fw={400}>{mainToken?.type}</Text>
                    </div>
                </Grid.Col>
                <Grid.Col span={6} className="p-4 border-t border-b border-[--flr-border-color]">
                    <Text
                        className="mb-2 text-12 uppercase"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('agent_details.value_label')}
                    </Text>
                    <Text
                        className="text-16"
                        fw={400}
                    >
                        {formatNumberWithSuffix(pool?.totalPoolCollateral ?? 0)}
                    </Text>
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        ${formatNumberWithSuffix(pool?.poolOnlyCollateralUSD ?? 0)}
                    </Text>
                </Grid.Col>
                <Grid.Col span={6} className="p-4">
                    <Text
                        className="mb-2 text-12 uppercase"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('agent_details.current_cr_label')}
                    </Text>
                    <Text
                        className="text-16"
                        fw={400}
                    >
                        {isMaxCRValue(pool?.poolCR) ? '∞' : pool?.poolCR}
                    </Text>
                </Grid.Col>
                <Grid.Col span={6} className="p-4">
                    <Stepper
                        active={-1}
                        radius="xs"
                        orientation="vertical"
                        size="xs"
                        contentPadding="xs"
                        classNames={{
                            step: 'min-h-7 mt-0',
                            stepIcon: 'border border-[--flr-black]',
                            verticalSeparator: 'border !border-[--flr-black] border-s-0'
                        }}
                        styles={{
                            stepBody: {
                                marginTop: '0.2rem'
                            },
                            verticalSeparator: {
                                top: '1.1rem',
                                left: '50%',
                                transform: 'translateX(-50%)'
                            },
                            stepIcon: {
                                width: '18px',
                                height: '18px',
                                minWidth: '18px',
                                minHeight: '18px',
                            }
                        }}
                    >
                        {cr.map((item, index) => (
                            <Stepper.Step
                                key={index}
                                label={
                                    <Text
                                        className="text-12"
                                        c="var(--flr-gray)"
                                    >
                                        {item.label}
                                    </Text>
                                }
                                color="transparent"
                                classNames={{
                                    stepIcon: selectedCr.includes(item.key)
                                        ? item.iconColor
                                        : 'bg-transparent'
                                }}
                                withIcon
                                icon={
                                    item.iconName === 'IconArrowUp'
                                        ? <IconArrowUp
                                            color={selectedCr.includes(item.key)
                                                ? 'var(--flr-white)'
                                                : 'var(--flr-black)'
                                            }
                                        />
                                        : <IconArrowDown
                                                color={selectedCr.includes(item.key)
                                                    ? 'var(--flr-white)'
                                                    : 'var(--flr-black)'
                                                }
                                        />
                                }
                            />
                        ))}
                </Stepper>
                </Grid.Col>
            </Grid>
        </div>
    )
}
