import React, { forwardRef } from "react";
import { Button, NumberInput, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { ICoin } from "@/types";
import { ALLOWED_DECIMAL_SEPARATORS, parseLocaleFloat } from "@/utils";

interface IAmountInput {
	form: UseFormReturnType<any>;
	fieldName?: string;
	fAssetCoin: ICoin;
	maxAmount: number | undefined;
	label?: React.ReactNode;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	readOnly?: boolean;
	onBlur?: (value: number) => void;
	allowDecimal?: boolean;
	decimalScale?: number;
	autoFocus?: boolean
	className?: string;
	// "inline" = bridge page layout: full width and no coin label (the token is already named
	// next to the input). Amount left, Max right — like the default variant.
	variant?: "default" | "inline";
}

const AmountInput = forwardRef<HTMLInputElement, IAmountInput>(
	(
		{
			form,
			fieldName = "amount",
			fAssetCoin,
			maxAmount,
			label,
			placeholder,
			description,
			disabled,
			readOnly,
			onBlur,
			autoFocus = true,
			allowDecimal = true,
			decimalScale,
			className = "mt-3",
			variant = "default",
		}: IAmountInput,
		ref,
	) => {
		const { t } = useTranslation();
		const isInline = variant === "inline";
		const isMaxDisabled = maxAmount === undefined || maxAmount === 0 || readOnly;

		const maxButton = (
			<Button
				size="sm"
				variant="transparent"
				color="var(--flr-gray)"
				fw={400}
				className="pr-2 text-16"
				style={{ opacity: isMaxDisabled ? 0.4 : 1, pointerEvents: isMaxDisabled ? 'none' : 'auto' }}
				onClick={() => {
					if (isMaxDisabled) return;
					const scale = allowDecimal ? (decimalScale ?? fAssetCoin.contractDecimals ?? 6) : 0;
					const factor = Math.pow(10, scale);
					const floored = Math.floor(maxAmount! * factor) / factor;
					form.setFieldValue(fieldName, floored);
				}}
			>
				{t("bridge_modal.form.max_button")}
			</Button>
		);

		return (
			<NumberInput
				{...form.getInputProps(fieldName)}
				data-autofocus={autoFocus || undefined}
				ref={ref}
				key={form.key(fieldName)}
				label={label}
				placeholder={placeholder}
				description={description}
				inputWrapperOrder={["label", "input", "error", "description"]}
				// No size on the bridge page: Mantine would write --input-height (36px) inline on the
				// wrapper and override the 32px below. Without it the CSS defaults are the same as "sm".
				size={isInline ? undefined : "sm"}
				inputMode={allowDecimal ? "decimal" : "numeric"}
				autoComplete="off"
				step={1}
				// Strict clamping rejects typing below min, so 1 would block 0.5 — whole-unit inputs only
				min={allowDecimal ? 0 : 1}
				max={maxAmount}
				allowDecimal={allowDecimal}
				allowedDecimalSeparators={ALLOWED_DECIMAL_SEPARATORS}
				decimalScale={decimalScale ?? fAssetCoin.contractDecimals ?? 6}
				disabled={disabled}
				readOnly={readOnly}
				clampBehavior="strict"
				onBlur={(e) => {
					if (onBlur) onBlur(parseLocaleFloat(e.target.value));
				}}
				className={className}
				classNames={{
					wrapper: isInline ? "w-full" : "flex-shrink-0 w-full sm:w-2/4",
					section: "w-auto",
				}}
				styles={{
					// Bridge page: 32px like the destination address / tag inputs next to it
					wrapper: isInline ? { "--input-height": "32px" } as React.CSSProperties : undefined,
					input: { borderRadius: "0.125rem" },
					description: { marginBottom: "calc(var(--mantine-spacing-xs) / 2)" },
				}}
				hideControls={isInline || undefined}
				{...(isInline
					? {
						rightSection: maxButton,
						rightSectionPointerEvents: "all" as const,
						// Narrower than the default variant's right section — the inline input is small
						rightSectionWidth: 52,
					}
					: {
						rightSection: maxButton,
						rightSectionPointerEvents: "all" as const,
						rightSectionWidth: 64,
						inputContainer: (children: React.ReactNode) => (
							<div className="flex items-center flex-wrap sm:flex-nowrap">
								{children}
								<div className="sm:ml-2 mb-1 hidden sm:flex items-center">
									{fAssetCoin.icon({ width: "24", height: "24" })}
									<Text c="var(--flr-gray)" className="text-18 mx-2" fw={400}>
										{fAssetCoin.type}
									</Text>
								</div>
							</div>
						),
					})}
			/>
		);
	},
);

AmountInput.displayName = "AmountInput";

export default AmountInput;
