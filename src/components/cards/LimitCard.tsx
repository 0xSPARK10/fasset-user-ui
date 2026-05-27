import { Progress, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { formatNumberWithSuffix } from "@/utils";
import { ILimitsData } from "@/types";

interface ILimitCard {
    limits: ILimitsData | undefined;
    isLoading?: boolean;
}

interface IWindow {
    hasLimit: boolean;
    remaining: number;
    freePercent: number;
}

interface ILimitSectionProps {
    label: string;
    window: IWindow;
    isLoading: boolean;
    withBorderBottom: boolean;
    color?: string;
}

function computeWindow(limitDrops: string | undefined, mintedDrops: string | undefined, decimals: number): IWindow {
    const ZERO = BigInt(0);
    // 10^6 keeps two extra decimal places of precision past integer BPS,
    // so freePercent stays accurate down to 0.01%.
    const PCT_SCALE = BigInt(1_000_000);
    const limit = BigInt(limitDrops ?? "0");
    if (limit === ZERO) {
        return { hasLimit: false, remaining: 0, freePercent: 0 };
    }
    const minted = BigInt(mintedDrops ?? "0");
    const remainingDrops = limit > minted ? limit - minted : ZERO;
    const divisor = 10 ** decimals;
    const remaining = divisor > 0 ? Number(remainingDrops) / divisor : 0;
    const freePercent = Number((remainingDrops * PCT_SCALE) / limit) / 10000;
    return { hasLimit: true, remaining, freePercent };
}

function LimitSection({ label, window, isLoading, withBorderBottom, color = "var(--flr-pink)" }: ILimitSectionProps) {
    const { t } = useTranslation();
    const usedPercent = window.hasLimit ? 100 - window.freePercent : 0;

    return (
			<div
				className={`flex flex-1 flex-col justify-center px-[15px] lg:px-6 py-4 ${
					withBorderBottom ? "border-b border-[var(--flr-border-color)]" : ""
				}`}
			>
				<div className="flex items-center mb-2">
					<span
						className="inline-block w-[20px] h-[20px] rounded-md mr-2 "
						style={{ backgroundColor: color }}
					/>
					<Text className="text-16 uppercase" fw={200} c="var(--flr-dark-gray)">
						{label}
					</Text>
				</div>
				{isLoading ? (
					<>
						<div className="flex items-center justify-between mb-1">
							<Skeleton height={20} width={140} />
							<Skeleton height={20} width={70} />
						</div>
						<Skeleton height={20} radius="sm" />
					</>
				) : !window.hasLimit ? (
					<>
						<Text
							className="text-16 leading-none mb-1"
							fw={300}
							c="var(--flr-dark-gray)"
						>
							{t("limit_card.not_available_label")}
						</Text>
						<Progress
							value={0}
							color={color}
							size={20}
							radius="sm"
							styles={{
								root: {
									backgroundColor: "var(--flr-white)",
									border: "1px solid var(--flr-border-color)",
									opacity: 0.5,
								},
							}}
						/>
					</>
				) : (
					<>
						<div className="flex items-center justify-between mb-1">
							<Text
								className="text-16 leading-none"
								fw={300}
								c="var(--flr-black)"
							>
								{t("limit_card.remaining_label", {
									amount: formatNumberWithSuffix(window.remaining),
								})}
							</Text>
							<Text className="text-16" fw={300} c="var(--flr-dark-gray)">
								{window.freePercent > 0 && window.freePercent < 1
									? t("limit_card.percent_free_label", { percent: "<1" })
									: t("limit_card.percent_free_label", {
											percent: Math.floor(window.freePercent),
										})}
							</Text>
						</div>
						<Progress
							value={usedPercent}
							color={color}
							size={20}
							radius="sm"
							styles={{
								root: {
									backgroundColor: "var(--flr-white)",
									border: "1px solid var(--flr-pink)",
								},
							}}
						/>
					</>
				)}
			</div>
		);
}

export default function LimitCard({ limits, isLoading = false }: ILimitCard) {
    const { t } = useTranslation();
    const decimals = limits?.decimals ?? 0;
    const hourly = computeWindow(limits?.hourlyLimitDrops, limits?.hourlyMintedDrops, decimals);
    const daily = computeWindow(limits?.dailyLimitDrops, limits?.dailyMintedDrops, decimals);
    const showLoading = isLoading && limits === undefined;

    return (
        <div className="flex flex-col bg-[var(--flr-lightest-gray)] border border-[var(--flr-border-color)] h-full">
            <Text
                className="bg-[var(--flr-white)] text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14 border-b border-[var(--flr-border-color)]"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t("limit_card.title")}
            </Text>
            <LimitSection
                label={t("limit_card.hourly_label")}
                window={hourly}
                isLoading={showLoading}
                withBorderBottom
            />
            <LimitSection
                label={t("limit_card.daily_label")}
                color="#C10F45"
                window={daily}
                isLoading={showLoading}
                withBorderBottom={false}
            />
        </div>
    );
}
