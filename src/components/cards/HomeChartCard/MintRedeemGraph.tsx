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
    COLOR_PLUM,
    COLOR_STROKE,
    FILL_OPACITY,
    formatValue,
    getXLabelFormat,
    GRADIENT_ID,
    IChartSeriesConfig,
    PINK_GRADIENT_TOP_OPACITY,
    REDEEM_DASH,
} from "./shared";

interface IMintRedeemPoint {
    xLabel: string;
    mint: number;
    redeem: number;
}

interface IMintRedeemGraphProps {
    mintData: IGraphPoint[] | undefined;
    redeemData: IGraphPoint[] | undefined;
    chartFilter: string;
}

const renderAreaProps = (s: any) => ({
    stroke: COLOR_STROKE,
    fill: `url(#${(s as IChartSeriesConfig).gradientId})`,
    fillOpacity: FILL_OPACITY,
});

export default function MintRedeemGraph({
    mintData,
    redeemData,
    chartFilter,
}: IMintRedeemGraphProps) {
    const { t } = useTranslation();
    const xLabelFormat = getXLabelFormat(chartFilter);

    const data: IMintRedeemPoint[] = useMemo(() => {
        const redeemByTs = new Map<number, string>();
        (redeemData ?? []).forEach((r) => redeemByTs.set(r.timestamp, r.value));

        return (mintData ?? []).map((mint) => ({
            xLabel: moment.unix(mint.timestamp).format(xLabelFormat),
            mint: toNumber(mint.value),
            redeem: toNumber(redeemByTs.get(mint.timestamp) ?? "0"),
        }));
    }, [mintData, redeemData, xLabelFormat]);

    const series = useMemo<IChartSeriesConfig[]>(
        () => [
            {
                name: "mint",
                label: t("mint_redeem_chart_card.mints_label"),
                color: COLOR_PINK,
                gradientId: GRADIENT_ID.mint,
            },
            {
                name: "redeem",
                label: t("mint_redeem_chart_card.redeems_label"),
                color: COLOR_PLUM,
                gradientId: GRADIENT_ID.redeem,
                strokeDasharray: REDEEM_DASH,
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
            data={data}
            dataKey="xLabel"
            series={series}
            curveType="bump"
            tickLine="none"
            gridAxis="none"
            valueFormatter={formatValue}
            withDots={false}
            withGradient={false}
            areaProps={renderAreaProps}
            classNames={{ root: "pl-[2px]" }}
            tooltipProps={{ content: renderTooltip }}
        >
            <defs>
                <AreaGradient
                    id={GRADIENT_ID.mint}
                    color={COLOR_PINK_HEX}
                    topOpacity={PINK_GRADIENT_TOP_OPACITY}
                />
                <AreaGradient id={GRADIENT_ID.redeem} color={COLOR_PLUM} />
            </defs>
        </AreaChart>
    );
}
