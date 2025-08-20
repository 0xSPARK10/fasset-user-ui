import { Title, Text, Grid, Divider, Tabs } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import moment from "moment";
import { IEcosystemInfo, ITimeData } from "@/types";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import { FILTERS } from "@/constants";
import { useState } from "react";
import classes from "@/styles/pages/Home.module.scss";

interface IMintRedeemChartCard {
    timeData: ITimeData | undefined;
    ecoSystemInfo: IEcosystemInfo | undefined;
    filter: string | null;
}

interface IMintRedeemChartData {
    date: string;
    xLabel: string;
    mint: number;
    redeem: number;
}

interface ICoreVaultChartData {
    date: string;
    xLabel: string;
    inflow: number;
    outflow: number;
}

interface ITvlGraph {
    date: string;
    xLabel: string;
    value: number;
}

const TAB_MINTS_REDEEMS = 'mints_redeems';
const TAB_CORE_VAULT = 'core_vault';
const TAB_CORE_VAULT_TVL = 'core_vault_tvl';

export default function MintRedeemChartCard({ timeData, filter, ecoSystemInfo }: IMintRedeemChartCard) {
    const [activeTab, setActiveTab] = useState<string | null>(TAB_MINTS_REDEEMS);
    const { t } = useTranslation();
    const mintRedeemChartData: IMintRedeemChartData[] = [];
    const coreVaultChartData: ICoreVaultChartData[] = [];
    const coreVaultTvlChartData: ITvlGraph[] = [];

    const formatLabel = () => {
        if (!filter) return '';
        if (filter === FILTERS.LAST_24_HOURS) {
            return 'HH:mm'
        } else if (filter === FILTERS.LAST_WEEK) {
            return 'MMM DD';
        } else if (filter === FILTERS.LAST_MONTH) {
            return 'MMM DD';
        } else if (filter === FILTERS.YEAR_TO_DATE) {
            return 'MMM';
        } else if (filter === FILTERS.LAST_YEAR) {
            return 'MMM';
        } else if (filter === FILTERS.ALL_TIME) {
            return 'MMM';
        }
    }

    timeData?.mintGraph.forEach(mint => {
        const redeem = timeData?.redeemGraph.find(redeem => redeem.timestamp === mint.timestamp);

        mintRedeemChartData.push({
            date: moment.unix(mint.timestamp).format(),
            xLabel: moment.unix(mint.timestamp).format(formatLabel()),
            mint: toNumber(mint.value),
            redeem: toNumber(redeem?.value ?? '0')
        });
    });
    timeData?.coreVaultData?.inflowGraph.forEach(inflow => {
        const outflow = timeData?.coreVaultData?.outflowGraph.find(outflow => outflow.timestamp === inflow.timestamp);

        coreVaultChartData.push({
            date: moment.unix(inflow.timestamp).format(),
            xLabel: moment.unix(inflow.timestamp).format(formatLabel()),
            inflow: toNumber(inflow.value),
            outflow: toNumber(outflow?.value ?? '0')
        });
    });
    timeData?.coreVaultData?.tvlGraph.forEach(tvl => {
        coreVaultTvlChartData.push({
            date: moment.unix(tvl.timestamp).format(),
            xLabel: moment.unix(tvl.timestamp).format(formatLabel()),
            value: toNumber(tvl.value)
        });
    });

    return (
        <div className="flex flex-col h-full max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)]">
            <div className="flex items-center flex-wrap justify-between px-[15px] lg:px-6 py-2 min-h-14">
                <Title
                    className="text-16 uppercase mr-2"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('mint_redeem_chart_card.title')}
                </Title>
                <Link
                    href="https://dev.flare.network/fassets/guides/deploy-fassets-agent"
                    target="_blank"
                    className="underline"
                >
                    {t('mint_redeem_chart_card.become_an_agent_label')}
                </Link>
            </div>
            <div className="bg-[var(--flr-lightest-gray)] border-t border-[var(--flr-border-color)] p-[15px] lg:p-6 pb-8 grow">
                <div className="flex flex-wrap justify-between items-center mb-6">
                    <Tabs
                        value={activeTab}
                        onChange={setActiveTab}
                        classNames={{
                            root: `flex overflow-x-auto ${classes.mantineTabsRoot}`,
                            list: 'ml-auto flex-nowrap',
                            tab: `text-[--flr-gray] ${classes.tab}`
                        }}
                    >
                        <Tabs.List className="mb-2">
                            <Tabs.Tab
                                value={TAB_MINTS_REDEEMS}
                            >
                                {t('mint_redeem_chart_card.mints_and_redeems_label')}
                            </Tabs.Tab>
                            <Tabs.Tab
                                value={TAB_CORE_VAULT_TVL}
                            >
                                {t('mint_redeem_chart_card.core_vault_tvl_label')}
                            </Tabs.Tab>
                            <Tabs.Tab
                                value={TAB_CORE_VAULT}
                            >
                                {t('mint_redeem_chart_card.core_vault_label')}
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                    <div className="flex items-center">
                        <div className="flex items-center mr-10">
                            <div className="w-5 h-5 rounded-md bg-[var(--flr-pink)] mr-2" />
                            {activeTab === TAB_CORE_VAULT_TVL
                                ? <Text
                                    className="text-16 uppercase"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {t('mint_redeem_chart_card.balance_label')}
                                </Text>
                                : <Text
                                    className="text-16 uppercase"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {t(activeTab === TAB_MINTS_REDEEMS ? 'mint_redeem_chart_card.mints_label' : 'mint_redeem_chart_card.inflow_label')}
                                </Text>
                            }
                        </div>
                        {activeTab !== TAB_CORE_VAULT_TVL &&
                            <div className="flex items-center">
                                <div className="w-5 h-5 rounded-md bg-[var(--flr-black)] mr-2" />
                                <Text
                                    className="text-16 uppercase"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {t(activeTab === TAB_MINTS_REDEEMS ? 'mint_redeem_chart_card.redeems_label' : 'mint_redeem_chart_card.outflow_label')}
                                </Text>
                            </div>
                        }
                    </div>
                </div>
                {activeTab === TAB_MINTS_REDEEMS &&
                    <LineChart
                        h={300}
                        data={mintRedeemChartData}
                        dataKey="xLabel"
                        series={[
                            {
                                name: 'mint',
                                label: t('mint_redeem_chart_card.mints_label'),
                                color: 'var(--flr-pink)',
                            },
                            {
                                name: 'redeem',
                                label: t('mint_redeem_chart_card.redeems_label'),
                                color: 'var(--flr-black)',
                                strokeDasharray: '10 10'
                            },
                        ]}
                        curveType="bump"
                        tickLine="none"
                        gridAxis="none"
                        valueFormatter={(value) => `$${formatNumberWithSuffix(value, 2)}`}
                        withDots={false}
                        classNames={{
                            root: 'pl-[2px]'
                        }}
                    />
                }
                {activeTab === TAB_CORE_VAULT &&
                    <LineChart
                        h={300}
                        data={coreVaultChartData}
                        dataKey="xLabel"
                        series={[
                            {
                                name: 'inflow',
                                label: t('mint_redeem_chart_card.inflow_label'),
                                color: 'var(--flr-pink)',
                            },
                            {
                                name: 'outflow',
                                label: t('mint_redeem_chart_card.outflow_label'),
                                color: 'var(--flr-black)',
                                strokeDasharray: '10 10'
                            },
                        ]}
                        curveType="bump"
                        tickLine="none"
                        gridAxis="none"
                        valueFormatter={(value) => `$${formatNumberWithSuffix(value, 2)}`}
                        withDots={false}
                        classNames={{
                            root: 'pl-[2px]'
                        }}
                    />
                }
                {activeTab === TAB_CORE_VAULT_TVL &&
                    <LineChart
                        h={300}
                        data={coreVaultTvlChartData}
                        dataKey="xLabel"
                        series={[
                            {
                                name: 'value',
                                label: t('mint_redeem_chart_card.balance_label'),
                                color: 'var(--flr-pink)',
                            },
                        ]}
                        curveType="bump"
                        tickLine="none"
                        gridAxis="none"
                        valueFormatter={(value) => `$${formatNumberWithSuffix(value, 2)}`}
                        withDots={false}
                        classNames={{
                            root: 'pl-[2px]'
                        }}
                    />
                }
            </div>
            <Grid
                styles={{
                    root: {
                        '--grid-gutter': 0
                    }
                }}
            >
                <Grid.Col span={{ base: 12, sm: 6 }} className="p-[15px] lg:p-3 border-t border-b md:border-b-0 md:border-r border-[var(--flr-border-color)]">
                    <div className="flex items-center md:block">
                        <Text
                            className="text-12 uppercase basis-9/12"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('mint_redeem_chart_card.agent_collateral_label')}
                        </Text>
                        <Divider
                            orientation="vertical"
                            className="block md:hidden mr-3 -my-4"
                        />
                        <Text
                            className="text-16 mt-1"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {formatNumberWithSuffix(ecoSystemInfo?.agentCollateral ?? 0, 2)}
                        </Text>
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }} className="p-[15px] lg:p-3 md:border-t border-[var(--flr-border-color)]">
                    <div className="flex items-center md:block">
                        <Text
                            className="text-12 uppercase basis-9/12"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('mint_redeem_chart_card.number_of_liquidations_label')}
                        </Text>
                        <Divider
                            orientation="vertical"
                            className="block md:hidden mr-3 -my-4"
                        />
                        <Text
                            className="text-16 mt-1"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {ecoSystemInfo?.numLiquidations ?? 0}
                        </Text>
                    </div>
                </Grid.Col>
            </Grid>
        </div>
    )
}
