import { IEcosystemInfo, ITimeData } from "@/types";
import { useTranslation } from "react-i18next";
import { Badge, Button, Divider, rem, SimpleGrid, Text, Title } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpFilled, IconInfoHexagon } from "@tabler/icons-react";
import XrpIcon from "@/components/icons/XrpIcon";
import { formatNumberWithSuffix } from "@/utils";
import { modals } from "@mantine/modals";
import React from "react";

interface ICoreVaultCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
    timeData: ITimeData | undefined;
}

export default function CoreVaultCard({ ecoSystemInfo, timeData }: ICoreVaultCard) {
    const { t } = useTranslation();

    const openModal = () => {
        modals.open({
            zIndex: 3000,
            size: 800,
            title: <Text className="text-32" fw={300} c="var(--flr-black)">
                {t('core_vault_card.modal.title')}
            </Text>,
            children: (
                <div>
                    <div className="py-2 px-0 sm:px-8">
                        <Title
                            className="text-24 mb-3"
                            fw={300}
                            c="var(--flr-dark-gray)"
                        >
                            {t('core_vault_card.modal.why_core_vault_title')}
                        </Title>
                        <Text
                            className="text-16 whitespace-pre-line"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('core_vault_card.modal.why_core_vault_description_label')}
                        </Text>
                        <Title
                            className="text-24 mb-3 mt-10"
                            fw={300}
                            c="var(--flr-dark-gray)"
                        >
                            {t('core_vault_card.modal.what_is_core_vault_title')}
                        </Title>
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('core_vault_card.modal.what_is_core_vault_description_label')}
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
                        {t('core_vault_card.modal.confirm_button')}
                    </Button>
                </div>
            )
        })
    }

    return (
        <div className="max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)] bg-[var(--flr-lightest-gray)] h-full">
            <div className="bg-[var(--flr-white)] flex items-center px-[15px] lg:px-6 py-4 min-h-14">
                <Text
                    className="text-16 uppercase"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('core_vault_card.title')}
                </Text>
                <IconInfoHexagon
                    style={{width: rem(16), height: rem(16)}}
                    color="var(--mantine-color-gray-6)"
                    className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                    onClick={openModal}
                />
            </div>
            <div className="px-5 py-3 border-y border-[var(--flr-border-color)]">
                <Text
                    className="text-12 uppercase mb-1"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('core_vault_card.total_label')}
                </Text>
                <div className="flex items-center">
                    <XrpIcon width="40" height="40" />
                    <Text
                        className="ml-2 text-24"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {formatNumberWithSuffix(ecoSystemInfo?.coreVaultSupply ?? 0)}
                    </Text>
                </div>
                <div className="flex items-center mt-1">
                    <Text
                        className="mr-2 text-16"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        ${formatNumberWithSuffix(ecoSystemInfo?.coreVaultSupplyUSD ?? 0)}
                    </Text>
                    <Badge
                        variant="outline"
                        color={timeData?.coreVaultData?.isPositiveSupplyDiff ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                        radius="xs"
                        leftSection={timeData?.coreVaultData?.isPositiveSupplyDiff
                            ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                            : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                        }
                        className="px-1"
                    >
                        <Text
                            className="text-14"
                            fw={400}
                            c={timeData?.coreVaultData?.isPositiveSupplyDiff ? 'var(--flr-green)' : 'var(--flr-red)'}
                        >
                            {timeData?.coreVaultData?.supplyDiff}%
                        </Text>
                    </Badge>
                </div>
            </div>
            <SimpleGrid
                cols={2}
            >
                <div className="px-5 py-[1.45rem] border-r border-[var(--flr-border-color)]">
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('core_vault_card.inflow_label')}
                    </Text>
                    <div className="flex items-center">
                        <XrpIcon width="22" height="22" className="shrink-0" />
                        <Text
                            className="ml-2 text-24"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {formatNumberWithSuffix(ecoSystemInfo?.coreVaultInflows ?? 0)}
                        </Text>
                    </div>
                    <div className="flex items-center mt-1 flex-wrap">
                        <Text
                            className="mr-2 text-16"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {formatNumberWithSuffix(ecoSystemInfo?.coreVaultInflowsUSD ?? 0)}
                        </Text>
                        <Badge
                            variant="outline"
                            color={timeData?.coreVaultData?.isPositiveInflowDiff ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                            radius="xs"
                            leftSection={timeData?.coreVaultData?.isPositiveInflowDiff
                                ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                            }
                            className="px-1 shrink-0"
                        >
                            <Text
                                className="text-14"
                                fw={400}
                                c={timeData?.coreVaultData?.isPositiveInflowDiff ? 'var(--flr-green)' : 'var(--flr-red)'}
                            >
                                ${timeData?.coreVaultData?.inflowDiff}%
                            </Text>
                        </Badge>
                    </div>
                </div>
                <div className="px-5 py-[1.45rem]">
                    <Text
                        className="text-12 uppercase"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('core_vault_card.outflow_label')}
                    </Text>
                    <div className="flex items-center">
                        <XrpIcon width="22" height="22" className="shrink-0" />
                        <Text
                            className="ml-2 text-24"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {formatNumberWithSuffix(ecoSystemInfo?.coreVaultOutflows ?? 0)}
                        </Text>
                    </div>
                    <div className="flex items-center mt-1 flex-wrap">
                        <Text
                            className="mr-2 text-16"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {formatNumberWithSuffix(ecoSystemInfo?.coreVaultOutflowsUSD ?? 0)}
                        </Text>
                        <Badge
                            variant="outline"
                            color={timeData?.coreVaultData?.isPositiveOutflowDiff ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                            radius="xs"
                            leftSection={timeData?.coreVaultData?.isPositiveOutflowDiff
                                ? <IconCaretUpFilled size={15} color="var(--flr-green)" />
                                : <IconCaretDownFilled size={15} color="var(--flr-red)" />
                            }
                            className="px-1 shrink-0"
                        >
                            <Text
                                className="text-14"
                                fw={400}
                                c={timeData?.coreVaultData?.isPositiveOutflowDiff ? 'var(--flr-green)' : 'var(--flr-red)'}
                            >
                                ${timeData?.coreVaultData?.outflowDiff}%
                            </Text>
                        </Badge>
                    </div>
                </div>
            </SimpleGrid>
        </div>
    );
}
