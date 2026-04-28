import React, { forwardRef } from "react";
import { Button, NumberInput, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { ICoin } from "@/types";

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
		}: IAmountInput,
		ref,
	) => {
		const { t } = useTranslation();
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
				size="sm"
				inputMode="numeric"
				type="tel"
				autoComplete="off"
				step={1}
				min={1}
				max={maxAmount}
				allowDecimal={allowDecimal}
				decimalScale={decimalScale ?? fAssetCoin.contractDecimals ?? 6}
				disabled={disabled}
				readOnly={readOnly}
				clampBehavior="strict"
				onBlur={(e) => {
					if (onBlur) onBlur(parseFloat(e.target.value));
				}}
				className={className}
				classNames={{
					wrapper: "flex-shrink-0 w-full sm:w-2/4",
					section: "w-auto",
				}}
				styles={{
					input: { borderRadius: "0.125rem" },
					description: { marginBottom: "calc(var(--mantine-spacing-xs) / 2)" },
				}}
				rightSection={
					<Button
						size="sm"
						variant="transparent"
						color="var(--flr-gray)"
						fw={400}
						className="pr-2 text-16"
						style={{ opacity: maxAmount === undefined || maxAmount === 0 || readOnly ? 0.4 : 1, pointerEvents: maxAmount === undefined || maxAmount === 0 || readOnly ? 'none' : 'auto' }}
						onClick={() => {
							if (maxAmount === undefined || maxAmount === 0 || readOnly) return;
							const scale = allowDecimal ? (decimalScale ?? fAssetCoin.contractDecimals ?? 6) : 0;
							const factor = Math.pow(10, scale);
							const floored = Math.floor(maxAmount * factor) / factor;
							form.setFieldValue(fieldName, floored);
						}}
					>
						{t("bridge_modal.form.max_button")}
					</Button>
				}
				rightSectionPointerEvents="all"
				rightSectionWidth={64}
				inputContainer={(children) => (
					<div className="flex items-center flex-wrap sm:flex-nowrap">
						{children}
						<div className="sm:ml-2 mb-1 hidden sm:flex items-center">
							{fAssetCoin.icon({ width: "24", height: "24" })}
							<Text c="var(--flr-gray)" className="text-18 mx-2" fw={400}>
								{fAssetCoin.type}
							</Text>
						</div>
					</div>
				)}
			/>
		);
	},
);

AmountInput.displayName = "AmountInput";

export default AmountInput;
