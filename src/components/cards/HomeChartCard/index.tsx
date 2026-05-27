import { Text, Tabs, Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { IconCaretDownFilled } from "@tabler/icons-react";
import { IEcosystemInfo } from "@/types";
import { formatNumberWithSuffix } from "@/utils";
import { FILTERS } from "@/constants";
import { useTimeData } from "@/api/user";
import classes from "@/styles/pages/Home.module.scss";
import { COLOR_PINK, COLOR_PLUM, LegendItem } from "./shared";
import TVLGraph from "./TVLGraph";
import MintRedeemGraph from "./MintRedeemGraph";

interface IHomeChartCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
}

const TAB_TVL = "tvl";
const TAB_MINTS_REDEEMS = "mints_redeems";

interface IFilterSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
}

function FilterSelect({ value, onChange, options }: IFilterSelectProps) {
    return (
        <Select
            value={value}
            onChange={(val) => val && onChange(val)}
            data={options}
            w={140}
            radius="xl"
            size="sm"
            allowDeselect={false}
            checkIconPosition="right"
            rightSection={<IconCaretDownFilled size={14} />}
            rightSectionWidth={40}
            classNames={{
                input:
                    "text-[var(--flr-gray)] lowercase text-center font-light text-16",
                option:
                    "text-[var(--flr-gray)] lowercase font-light text-16",
            }}
            styles={{
                input: {
                    paddingInlineStart: 10,
                    paddingInlineEnd: 20,
                },
            }}
        />
    );
}

export default function HomeChartCard({ ecoSystemInfo }: IHomeChartCard) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<string | null>(TAB_TVL);
    const [chartFilter, setChartFilter] = useState<string>(FILTERS.LAST_YEAR);
    const timeData = useTimeData(chartFilter);
    const isLoading = timeData.isFetching;

    const filterOptions = useMemo(
        () => [
            { value: FILTERS.LAST_24_HOURS, label: t("home.filters.last_24_hours_label") },
            { value: FILTERS.LAST_WEEK, label: t("home.filters.last_week_label") },
            { value: FILTERS.LAST_MONTH, label: t("home.filters.last_month_label") },
            { value: FILTERS.YEAR_TO_DATE, label: t("home.filters.year_to_date_label") },
            { value: FILTERS.LAST_YEAR, label: t("home.filters.last_year_label") },
            { value: FILTERS.ALL_TIME, label: t("home.filters.all_time_label") },
        ],
        [t]
    );

    const chartWrapperClass = `transition-opacity ${
        isLoading ? "opacity-60" : "opacity-100"
    }`;

    return (
        <div className="flex flex-col h-full border border-[var(--flr-border-color)]">
            <div className="p-[15px] lg:p-6 grow">
                <div className="
                    flex flex-wrap items-start gap-x-2 sm:gap-x-6 gap-y-3 mb-6
                    min-[3400px]:flex-nowrap
                ">
                    {/* Tabs + Legend (top row on <340px, right on >=340px) */}
                    <div className="
                        flex flex-col items-end gap-3 ml-auto
                        w-full order-1
                        min-[340px]:w-auto min-[340px]:order-2 min-[340px]:flex-shrink-0
                    ">
                        <Tabs
                            value={activeTab}
                            onChange={setActiveTab}
                            classNames={{
                                root: `flex overflow-x-auto ${classes.mantineTabsRoot}`,
                                list: "flex-nowrap",
                                tab: `text-[--flr-gray] !text-14 min-[430px]:!text-16 ${classes.tab}`,
                            }}
                        >
                            <Tabs.List>
                                <Tabs.Tab value={TAB_TVL}>
                                    {t("mint_redeem_chart_card.tvl_label")}
                                </Tabs.Tab>
                                <Tabs.Tab value={TAB_MINTS_REDEEMS}>
                                    <span className="hidden min-[410px]:inline">
                                        {t("mint_redeem_chart_card.mints_and_redeems_label")}
                                    </span>
                                    <span className="min-[410px]:hidden">
                                        {t("mint_redeem_chart_card.mints_label")}
                                    </span>
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                        {activeTab === TAB_MINTS_REDEEMS && (
                            <div className="flex items-center gap-2 sm:gap-4">
                                <LegendItem
                                    color={COLOR_PINK}
                                    label={t("mint_redeem_chart_card.mints_label")}
                                />
                                <LegendItem
                                    color={COLOR_PLUM}
                                    label={t("mint_redeem_chart_card.redeems_label")}
                                />
                            </div>
                        )}
                    </div>

                    <div className="
                        flex w-full order-2 gap-4
                        items-end justify-between
                        max-[340px]:pt-[10px]
                        min-[340px]:items-start min-[340px]:justify-start
                        min-[340px]:w-auto min-[340px]:order-1 min-[340px]:min-w-0
                    ">
                        <div className="flex flex-col min-w-0">
                            <Text className="text-16" fw={400} c="var(--flr-gray)">
                                {t("mint_redeem_chart_card.tvl_title")}
                            </Text>
                            <div className="flex flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:flex-wrap sm:gap-x-6">
                                <Text
                                    className="text-24 sm:text-48 leading-none"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    ${formatNumberWithSuffix(ecoSystemInfo?.tvl ?? 0, 2)}
                                </Text>
                                {activeTab === TAB_MINTS_REDEEMS && (
                                <div className="hidden min-[340px]:block">
                                    <FilterSelect
                                        value={chartFilter}
                                        onChange={setChartFilter}
                                        options={filterOptions}
                                    />
                                </div>
                                )}
                            </div>
                        </div>
                        {activeTab === TAB_MINTS_REDEEMS && (
                        <div className="min-[340px]:hidden flex-shrink-0">
                            <FilterSelect
                                value={chartFilter}
                                onChange={setChartFilter}
                                options={filterOptions}
                            />
                        </div>
                        )}
                    </div>
                </div>

                {activeTab === TAB_TVL && (
                    <div className={chartWrapperClass}>
                        <TVLGraph
                            data={timeData.data?.tvlGraph}
                            chartFilter={chartFilter}
                        />
                    </div>
                )}
                {activeTab === TAB_MINTS_REDEEMS && (
                    <div className={chartWrapperClass}>
                        <MintRedeemGraph
                            mintData={timeData.data?.mintGraph}
                            redeemData={timeData.data?.redeemGraph}
                            chartFilter={chartFilter}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
