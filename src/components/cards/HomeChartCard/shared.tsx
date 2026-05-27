import { Text } from "@mantine/core";
import { getFilteredChartTooltipPayload } from "@mantine/charts";
import { FILTERS } from "@/constants";
import { formatNumberWithSuffix } from "@/utils";

export interface IChartSeriesConfig {
    name: string;
    label: string;
    color: string;
    gradientId?: string;
    strokeDasharray?: string;
}

export const CHART_HEIGHT = 300;
export const FILL_OPACITY = 0.41;
export const REDEEM_DASH = "5 5";

export const COLOR_PINK = "var(--flr-pink)";
export const COLOR_PINK_HEX = "#E61E57";
export const COLOR_PLUM = "#5E3F56";
export const COLOR_STROKE = "#9489AC";

export const GRADIENT_ID = {
    tvl: "tvlGradient",
    mint: "mintGradient",
    redeem: "redeemGradient",
} as const;

const GRADIENT_TOP_OFFSET = "9.84%";
const GRADIENT_BOTTOM_OFFSET = "79.25%";
export const PINK_GRADIENT_TOP_OPACITY = 0.55;

function ColorChip({ color, size }: { color: string; size: number }) {
    return (
        <span
            className="inline-block rounded-md"
            style={{ width: size, height: size, backgroundColor: color }}
        />
    );
}

export function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <span
                className="inline-block rounded-md w-3 h-3 sm:w-5 sm:h-5"
                style={{ backgroundColor: color }}
            />
            <Text className="text-12 sm:text-14 uppercase" fw={400} c="var(--flr-dark-gray)">
                {label}
            </Text>
        </div>
    );
}

interface IAreaGradientProps {
    id: string;
    color: string;
    topOpacity?: number;
}

export function AreaGradient({ id, color, topOpacity = 1 }: IAreaGradientProps) {
    return (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop
                offset={GRADIENT_TOP_OFFSET}
                stopColor={color}
                stopOpacity={topOpacity}
            />
            <stop
                offset={GRADIENT_BOTTOM_OFFSET}
                stopColor="white"
                stopOpacity={0}
            />
        </linearGradient>
    );
}

interface IChartTooltipProps {
    label: React.ReactNode;
    payload: readonly Record<string, any>[] | undefined;
    series: IChartSeriesConfig[];
}

export function ChartTooltip({ label, payload, series }: IChartTooltipProps) {
    if (!payload || payload.length === 0) return null;

    const getConfig = (item: any) =>
        series.find((s) => s.name === item.name || s.name === item.dataKey);

    return (
        <div className="bg-white border border-[var(--flr-border-color)] rounded-md shadow-md p-3 min-w-[180px]">
            <Text className="text-14" fw={500} c="var(--flr-black)" mb={8}>
                {label}
            </Text>
            <div className="flex flex-col gap-2">
                {getFilteredChartTooltipPayload([...payload]).map((item: any) => {
                    const config = getConfig(item);
                    return (
                        <div
                            key={item.name}
                            className="flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <ColorChip
                                    color={config?.color ?? item.color}
                                    size={16}
                                />
                                <Text
                                    className="text-14 uppercase"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {config?.label ?? item.name}
                                </Text>
                            </div>
                            <Text className="text-14" fw={500} c="var(--flr-black)">
                                ${formatNumberWithSuffix(item.value, 2)}
                            </Text>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const formatValue = (value: number) => `$${formatNumberWithSuffix(value, 0)}`;

const X_LABEL_FORMATS: Record<string, string> = {
    [FILTERS.LAST_24_HOURS]: "HH:mm",
    [FILTERS.ALL_TIME]: "MMM 'YY",
};

export function getXLabelFormat(chartFilter: string): string {
    return X_LABEL_FORMATS[chartFilter] ?? "MMM DD";
}
