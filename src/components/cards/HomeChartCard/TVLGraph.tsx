import { useCallback, useMemo } from "react";
import { AreaChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { IGraphPoint } from "@/types";
import { toNumber } from "@/utils";
import {
    AreaGradient,
    ChartTooltip,
    CHART_HEIGHT,
    COLOR_PINK,
    COLOR_PINK_HEX,
    COLOR_STROKE,
    FILL_OPACITY,
    formatValue,
    getXLabelFormat,
    GRADIENT_ID,
    IChartSeriesConfig,
    PINK_GRADIENT_TOP_OPACITY,
} from "./shared";

interface ITvlPoint {
    xLabel: string;
    value: number;
}

interface ITVLGraphProps {
    data: IGraphPoint[] | undefined;
    chartFilter: string;
}

const AREA_PROPS = {
    stroke: COLOR_STROKE,
    fill: `url(#${GRADIENT_ID.tvl})`,
    fillOpacity: FILL_OPACITY,
};

export default function TVLGraph({ data, chartFilter }: ITVLGraphProps) {
    const { t } = useTranslation();
    const xLabelFormat = getXLabelFormat(chartFilter);

    const tvlData: ITvlPoint[] = useMemo(
        () =>
            (data ?? []).map((point) => ({
                xLabel: moment.unix(point.timestamp).format(xLabelFormat),
                value: toNumber(point.value),
            })),
        [data, xLabelFormat]
    );

    const series = useMemo<IChartSeriesConfig[]>(
        () => [
            {
                name: "value",
                label: t("mint_redeem_chart_card.tvl_label"),
                color: COLOR_PINK,
            },
        ],
        [t]
    );

    const renderTooltip = useCallback(
        ({ label, payload }: any) => (
            <ChartTooltip label={label} payload={payload} series={series} />
        ),
        [series]
    );

    return (
        <AreaChart
            h={CHART_HEIGHT}
            data={tvlData}
            dataKey="xLabel"
            series={series}
            curveType="bump"
            tickLine="none"
            gridAxis="none"
            valueFormatter={formatValue}
            withDots={false}
            withGradient={false}
            areaProps={AREA_PROPS}
            classNames={{ root: "pl-[2px]" }}
            tooltipProps={{ content: renderTooltip }}
        >
            <defs>
                <AreaGradient
                    id={GRADIENT_ID.tvl}
                    color={COLOR_PINK_HEX}
                    topOpacity={PINK_GRADIENT_TOP_OPACITY}
                />
            </defs>
        </AreaChart>
    );
}
