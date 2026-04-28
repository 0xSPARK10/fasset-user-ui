import { Button, NumberInput, Text, TextInput } from "@mantine/core";
import { IconClipboard } from "@tabler/icons-react";
import React from "react";
import classes from "@/styles/components/elements/DestinationAddressField.module.scss";
import PasteClipboard from "./PasteClipboard";

interface IDestinationAddressField {
	label: string;
	editAddress: boolean;
	editButtonLabel: string;
	onEdit: () => void;
	inputProps: Record<string, any>;
	inputKey: string;
	readOnlyValue?: string;
	onPaste: (text: string) => void;
	containerClassName?: string;
	labelClassName?: string;
	inputClassName?: string;
	valueClassName?: string;
	editButtonClassName?: string;
	// Optional destination tag
	destinationTagLabel?: string;
	destinationTagInputProps?: Record<string, any>;
	destinationTagInputKey?: string;
	destinationTagReadOnlyValue?: string;
    maxTagLength?: number;
}

export default function DestinationAddressField({
	label,
	editAddress,
	editButtonLabel,
	onEdit,
	inputProps,
	inputKey,
	readOnlyValue,
	onPaste,
	containerClassName,
	labelClassName,
	inputClassName,
	valueClassName,
	editButtonClassName,
	destinationTagLabel,
	destinationTagInputProps,
	destinationTagInputKey,
	destinationTagReadOnlyValue,
    maxTagLength
}: IDestinationAddressField) {
	const hasDestinationTag = !!destinationTagInputProps;

	return (
		<div className={containerClassName}>
			{hasDestinationTag ? (
				<div
					className={`grid grid-cols-1  sm:grid-cols-12 gap-3 ${editAddress ? "grow" : ""}`}
				>
					<div
						className={`flex flex-col ${editAddress ? "sm:col-span-8" : "sm:col-span-8"} min-w-0`}
					>
						<Text c="var(--flr-gray)" fw={400} className={labelClassName}>
							{label}
						</Text>
						{editAddress ? (
							<TextInput
								{...inputProps}
								key={inputKey}
								rightSection={<PasteClipboard onPaste={onPaste} />}
								className={inputClassName}
								classNames={{
									input: inputProps.error ? classes.inputError : undefined,
									error: classes.inputErrorText,
								}}
							/>
						) : (
							<Text c="var(--flr-black)" fw={400} className={valueClassName}>
								{readOnlyValue}
							</Text>
						)}
					</div>
					<div
						className={`flex flex-col ${editAddress ? "sm:col-span-4" : "sm:col-span-4"}`}
					>
						<Text
							c="var(--flr-gray)"
							fw={400}
							className={labelClassName}
							style={{ whiteSpace: "nowrap" }}
						>
							{destinationTagLabel}
						</Text>
						{editAddress ? (
							<NumberInput
								{...destinationTagInputProps}
								key={destinationTagInputKey}
								inputMode="numeric"
								className={inputClassName}
								placeholder="--"
								hideControls
                                maxLength={maxTagLength}
								min={0}
							/>
						) : (
							<Text c="var(--flr-black)" fw={400} className={valueClassName}>
								{destinationTagReadOnlyValue || "--"}
							</Text>
						)}
					</div>
				</div>
			) : (
				<div className={`flex flex-col ${editAddress ? "grow" : ""}`}>
					<Text c="var(--flr-gray)" fw={400} className={labelClassName}>
						{label}
					</Text>
					{editAddress ? (
						<TextInput
							{...inputProps}
							key={inputKey}
							rightSection={<PasteClipboard onPaste={onPaste} />}
							className={inputClassName}
							classNames={{
								input: inputProps.error ? classes.inputError : undefined,
								error: classes.inputErrorText,
							}}
						/>
					) : (
						<Text c="var(--flr-black)" fw={400} className={valueClassName}>
							{readOnlyValue}
						</Text>
					)}
				</div>
			)}
			{!editAddress && (
				<Button
					variant="gradient"
					size="xs"
					radius="xl"
					fw={400}
					className={editButtonClassName}
					onClick={onEdit}
				>
					{editButtonLabel}
				</Button>
			)}
		</div>
	);
}
