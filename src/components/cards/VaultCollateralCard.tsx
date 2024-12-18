import { Grid, rem, Stepper, Text, Title, Popover } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconInfoHexagon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import UsdcIcon from "@/components/icons/UsdcIcon";
import UsdtIcon from "@/components/icons/UsdtIcon";
import EthIcon from "@/components/icons/EthIcon";
import { IPool } from "@/types";
import { formatNumberWithSuffix, toNumber, isMaxCRValue } from "@/utils";
import UsdxIcon from "@/components/icons/UsdxIcon";

interface IVaultCollateralCard {
    pool: IPool | undefined;
}

export default function VaultCollateralCard({ pool }: IVaultCollateralCard) {
    const { t } = useTranslation();

    const getCollateralTokenIcon = () => {
        if (!pool) return undefined;

        if (pool.collateralToken.toLowerCase().includes('usdc')) {
            return <UsdcIcon width="40" height="40" className="flex-shrink-0" />;
        } else if (pool.collateralToken.toLowerCase().includes('usdt')) {
            return <UsdtIcon width="40" height="40" className="flex-shrink-0" />;
        } else if (pool.collateralToken.toLowerCase().includes('eth')) {
            return <EthIcon width="40" height="40" className="flex-shrink-0" />;
        } else if (pool.collateralToken.toLowerCase().includes('usdx')) {
            return <UsdxIcon width="40" height="40" className="flex-shrink-0" />;
        }

        return undefined;
    }

    return (
        <div>
            <Title className="text-24 mb-4 px-[10px] md:px-0" fw={300}>{t('agent_details.collateral_label')}</Title>
            <div className="p-0 min-[992px]:p-4">
                <div className="flex items-center">
                    <Title
                        className="text-28 px-[10px] md:px-0"
                        fw={400}
                    >
                        {t('agent_details.vault_collateral_label')}
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
                            <Text className="text-16">{t('agent_details.vault_collateral_description_label')}</Text>
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
                            {getCollateralTokenIcon()}
                            <Text className="ml-2 text-16" fw={400}>{pool?.collateralToken}</Text>
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
                        <Text className="text-16" fw={400}>{formatNumberWithSuffix(pool?.vaultCollateral ?? 0)}</Text>
                        <Text
                            className="text-12"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            ${formatNumberWithSuffix(pool?.vaultOnlyCollateralUSD ?? 0)}
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
                            {isMaxCRValue(pool?.vaultCR) ? '∞' : pool?.vaultCR}
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
                                        color={toNumber(pool?.vaultCR ?? '0') >= 1.6
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
                                        {t('agent_details.minting_cr_label', { amount: 1.6 })}
                                    </Text>
                                }
                                classNames={{
                                    stepIcon: toNumber(pool?.vaultCR ?? '0') >= 1.6
                                        ? '!bg-[var(--flr-green)] !border-[var(--flr-green)]'
                                        : 'bg-transparent'
                                }}
                            />
                            <Stepper.Step
                                icon={
                                    <IconArrowUp
                                        color={toNumber(pool?.vaultCR ?? '0') >= 1.5 && toNumber(pool?.vaultCR ?? '0') < 1.6
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
                                        {t('agent_details.safety_cr_label', { amount: 1.5 })}
                                    </Text>
                                }
                                classNames={{
                                    stepIcon: toNumber(pool?.vaultCR ?? '0') >= 1.5 && toNumber(pool?.vaultCR ?? '0') < 1.6
                                        ? '!bg-[var(--flr-warning)] border-[var(--flr-warning)]'
                                        : 'bg-transparent'
                                }}
                            />
                            <Stepper.Step
                                icon={
                                    <IconArrowDown
                                        color={toNumber(pool?.vaultCR ?? '0') > 1.3 && toNumber(pool?.vaultCR ?? '0') <= 1.4
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
                                        {t('agent_details.minimum_cr_label', { amount: 1.4 })}
                                    </Text>
                                }
                                classNames={{
                                    stepIcon: toNumber(pool?.vaultCR ?? '0') > 1.3 && toNumber(pool?.vaultCR ?? '0') <= 1.4
                                        ? '!bg-[var(--flr-red)] border-[var(--flr-red)]'
                                        : 'bg-transparent'
                                }}
                            />
                            <Stepper.Step
                                icon={
                                    <IconArrowDown
                                        color={toNumber(pool?.vaultCR ?? '0') <= 1.3
                                            ? 'var(--flr-white)'
                                            : 'var(--flr-black)'
                                        }
                                        size={18}
                                    />
                                }
                                color="transparent"
                                withIcon
                                label={
                                    <Text
                                        className="text-12"
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.ccb_cr_label', { amount: 1.3 })}
                                    </Text>
                                }
                                classNames={{
                                    stepIcon:toNumber(pool?.vaultCR ?? '0') <= 1.3
                                        ? '!bg-[var(--flr-red)] border-[var(--flr-red)]'
                                        : 'bg-transparent'
                                }}
                            />
                        </Stepper>
                    </Grid.Col>
                </Grid>
            </div>
        </div>
    )
}
