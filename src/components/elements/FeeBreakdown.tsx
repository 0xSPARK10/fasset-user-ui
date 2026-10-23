import React, { ReactNode, useEffect, useState } from "react";
import { Loader, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { t } from "i18next";
import { FeeItem } from "@/core/fees/feeItem";
import { formatFeeAmount } from "@/core/fees/format";

export interface FeeSection {
	/** Heading rendered above the group (uppercased). Omit for an unlabeled group. */
	label?: ReactNode;
	items: FeeItem[];
}

export interface FeeBreakdownProps {
	/**
	 * Labeled groups rendered top-to-bottom. Every row across all sections shares
	 * one currency-column width, so icons and amounts stay aligned between groups
	 * (e.g. a "you will receive" row lines up with the "fees" rows below it).
	 */
	sections?: FeeSection[];
	/** Single-section shorthand. Ignored when `sections` is provided. */
	items?: FeeItem[];
	/** Heading for the `items` shorthand; defaults to the shared "fees" label. */
	feesLabel?: ReactNode;
	/** Icon width/height in px. */
	iconSize?: number;
}

interface FeeRowProps {
	item: FeeItem;
	index: number;
	iconSize: number;
	labelWidth: number;
	marginTop: boolean;
	onMeasure: (index: number, width: number) => void;
}

/** Render the fee value: loading → spinner, missing → dash, otherwise formatted amount. */
function renderFeeValue({ fee, format, token }: FeeItem): ReactNode {
	if (fee.isLoading) return <Loader size={14} />;
	if (fee.amount == null) return <span>&mdash;</span>;
	return (format ?? ((amount) => formatFeeAmount(amount, token.decimals)))(
		fee.amount,
	);
}

function FeeRow({
	item,
	index,
	iconSize,
	labelWidth,
	marginTop,
	onMeasure,
}: FeeRowProps) {
	const { ref, width } = useElementSize();

	useEffect(() => {
		onMeasure(index, width);
	}, [index, width, onMeasure]);

	return (
		<div className={`flex justify-between ${marginTop ? "mt-2" : ""}`}>
			<Text className="text-16" fw={400} c="var(--flr-black)">
				{item.label}
			</Text>
			<div className="flex items-center">
				{(item.token?.nativeIcon ?? item.token?.icon)?.({
					width: `${iconSize}`,
					height: `${iconSize}`,
				})}
				<Text className="mx-2 text-16" fw={400}>
					{renderFeeValue(item)}
				</Text>
				<Text
					ref={ref}
					className="text-16"
					fw={400}
					c="var(--flr-gray)"
					style={{ width: labelWidth > 0 ? `${labelWidth}px` : "auto" }}
				>
					{item.currencyName}
				</Text>
			</div>
		</div>
	);
}

export default function FeeBreakdown({
	sections,
	items,
	feesLabel,
	iconSize = 16,
}: FeeBreakdownProps) {
	// Each row reports its currency-label width; align every row to the widest one.
	const [widths, setWidths] = useState<Record<number, number>>({});
	const handleMeasure = (index: number, width: number) =>
		setWidths((prev) =>
			prev[index] === width ? prev : { ...prev, [index]: width },
		);
	const labelWidth = Math.max(0, ...Object.values(widths));

	const resolvedSections: FeeSection[] = sections ?? [
		{
			label: feesLabel ?? t("redeem_modal.form.fees_label"),
			items: items ?? [],
		},
	];

	// Stable global index per row so widths are measured across every section.
	let rowIndex = 0;

	return (
		<>
			{resolvedSections.map((section, sectionIndex) => {
				// The first section of an explicit `sections` layout sits flush so the
				// caller controls its top spacing; every other heading keeps `mt-5`.
				const headingTopMargin = sectionIndex === 0 && sections ? "" : "mt-5";
				return (
					<React.Fragment key={sectionIndex}>
						{section.label != null && (
							<Text
								fw={400}
								c="var(--flr-gray)"
								className={`mb-1 ${headingTopMargin} uppercase text-12`}
							>
								{section.label}
							</Text>
						)}
						{section.items.map((item, itemIndex) => {
							const globalIndex = rowIndex++;
							return (
								<FeeRow
									key={globalIndex}
									item={item}
									index={globalIndex}
									iconSize={iconSize}
									labelWidth={labelWidth}
									marginTop={itemIndex > 0}
									onMeasure={handleMeasure}
								/>
							);
						})}
					</React.Fragment>
				);
			})}
		</>
	);
}
