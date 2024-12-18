import { Grid, rem, Stepper, Text, Title, Popover } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconInfoHexagon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { IPool } from "@/types";
import {formatNumberWithSuffix, isMaxCRValue, toNumber} from "@/utils";
import { useWeb3 } from "@/hooks/useWeb3";

interface IPoolCollateralCard {
    pool: IPool | undefined;
}

export default function PoolCollateralCard({ pool }: IPoolCollateralCard) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();

    return (
        <div className="p-0 min-[992px]:p-4">
            <div className="flex items-center">
                <Title
                    className="text-28 px-[10px] md:px-0"
                    fw={400}
                >
                    {t('agent_details.pool_collateral_label')}
                </Title>
                <Popover withArrow>
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
                        <Stepper.Step
                            icon={
                                <IconArrowUp
                                    color={toNumber(pool?.poolCR ?? '0') >= 2.6
                                        ? 'var(--flr-white)'
                                        : 'var(--flr-black)'
                                    }
                                />
                            }
                            withIcon
                            label={
                                <Text
                                    className="text-12"
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.exit_cr_label', { amount: 2.6 })}
                                </Text>
                            }
                            classNames={{
                                stepIcon: toNumber(pool?.poolCR ?? '0') >= 2.6
                                    ? '!bg-[var(--flr-green)] !border-[var(--flr-green)]'
                                    : 'bg-transparent'
                            }}
                        />
                        <Stepper.Step
                            icon={
                                <IconArrowUp
                                    color={toNumber(pool?.poolCR ?? '0') >= 2.4 && toNumber(pool?.poolCR ?? '0') < 2.6
                                        ? 'var(--flr-white)'
                                        : 'var(--flr-black)'
                                    }
                                />
                            }
                            withIcon
                            label={
                                <Text
                                    className="text-12"
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.minting_cr_label', { amount: 2.4 })}
                                </Text>
                            }
                            classNames={{
                                stepIcon: toNumber(pool?.poolCR ?? '0') >= 2.4 && toNumber(pool?.poolCR ?? '0') < 2.6
                                    ? '!bg-[var(--flr-green)] border-[var(--flr-green)]'
                                    : 'bg-transparent'
                            }}
                        />
                        <Stepper.Step
                            icon={
                                <IconArrowUp
                                    color={toNumber(pool?.poolCR ?? '0') >= 2.2 && toNumber(pool?.poolCR ?? '0') < 2.4
                                        ? 'var(--flr-white)'
                                        : 'var(--flr-black)'
                                    }
                                />
                            }
                            color="transparent"
                            withIcon
                            label={
                                <Text
                                    className="text-12"
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.topup_cr_label', { amount: 2.2 })}
                                </Text>
                            }
                            classNames={{
                                stepIcon: toNumber(pool?.poolCR ?? '0') >= 2.2 && toNumber(pool?.poolCR ?? '0') < 2.4
                                    ? '!bg-[var(--flr-warning)] border-[var(--flr-warning)]'
                                    : 'bg-transparent'
                            }}
                        />
                        <Stepper.Step
                            icon={
                                <IconArrowUp
                                    color={toNumber(pool?.poolCR ?? '0') >= 2.1 && toNumber(pool?.poolCR ?? '0') < 2.2
                                        ? 'var(--flr-white)'
                                        : 'var(--flr-black)'
                                    }
                                />
                            }
                            color="transparent"
                            withIcon
                            label={
                                <Text
                                    className="text-12"
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.safety_cr_label', {amount: 2.1 })}
                                </Text>
                            }
                            classNames={{
                                stepIcon: toNumber(pool?.poolCR ?? '0') >= 2.1 && toNumber(pool?.poolCR ?? '0') < 2.2
                                    ? '!bg-[var(--flr-warning)] border-[var(--flr-warning)]'
                                    : 'bg-transparent'
                            }}
                        />
                        <Stepper.Step
                            icon={
                                <IconArrowDown
                                    color={toNumber(pool?.poolCR ?? '0') > 1.9 && toNumber(pool?.poolCR ?? '0') <= 2.0
                                        ? 'var(--flr-white)'
                                        : 'var(--flr-black)'
                                    }
                                />
                            }
                            color="transparent"
                            withIcon
                            label={
                                <Text
                                    className="text-12"
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.minimum_cr_label', {amount: "2.0" })}
                                </Text>
                            }
                            classNames={{
                                stepIcon: toNumber(pool?.poolCR ?? '0') > 1.9 && toNumber(pool?.poolCR ?? '0') <= 2.0
                                    ? '!bg-[var(--flr-red)] border-[var(--flr-red)]'
                                    : 'bg-transparent'
                            }}
                        />
                        <Stepper.Step
                            icon={
                                <IconArrowDown
                                    color={toNumber(pool?.poolCR ?? '0') <= 1.9
                                        ? 'var(--flr-white)'
                                        : 'var(--flr-black)'
                                    }
                                />
                            }
                            color="transparent"
                            withIcon
                            label={
                                <Text
                                    className="text-12"
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.ccb_cr_label', {amount: 1.9 })}
                                </Text>
                            }
                            classNames={{
                                stepIcon: toNumber(pool?.poolCR ?? '0') <= 1.9
                                    ? '!bg-[var(--flr-red)] border-[var(--flr-red)]'
                                    : 'bg-transparent'
                            }}
                        />
                </Stepper>
                </Grid.Col>
            </Grid>
        </div>
    )
}
