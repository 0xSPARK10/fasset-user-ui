import { Button, NumberInput, Text, TextInput } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import classes from "@/styles/components/elements/DestinationAddressField.module.scss";
import PasteClipboard from "./PasteClipboard";
import FormAlert from "./FormAlert";

interface IRedeemDestinationEditor {
    label: string;
    editAddress: boolean;
    editButtonLabel: string;
    onEdit: () => void;
    inputProps: Record<string, any>;
    inputKey: string;
    readOnlyValue?: string;
    onPaste: (text: string) => void;
    destinationTagLabel: string;
    destinationTagInputProps: Record<string, any>;
    destinationTagInputKey: string;
    maxTagLength?: number;
    containerClassName?: string;
    labelClassName?: string;
    inputClassName?: string;
    valueClassName?: string;
    editButtonClassName?: string;
}

export default function RedeemDestinationEditor({
    label,
    editAddress,
    editButtonLabel,
    onEdit,
    inputProps,
    inputKey,
    readOnlyValue,
    onPaste,
    destinationTagLabel,
    destinationTagInputProps,
    destinationTagInputKey,
    maxTagLength,
    containerClassName,
    labelClassName,
    inputClassName,
    valueClassName,
    editButtonClassName,
}: IRedeemDestinationEditor) {
    const { t } = useTranslation();

    if (!editAddress) {
        return (
            <div className={`flex items-center ${containerClassName ?? ""}`}>
                <div className="flex flex-col">
                    <Text c="var(--flr-gray)" fw={400} className={labelClassName}>
                        {label}
                    </Text>
                    <Text c="var(--flr-black)" fw={400} className={valueClassName}>
                        {readOnlyValue}
                    </Text>
                </div>
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
            </div>
        );
    }

    return (
        <div className={containerClassName}>
            <FormAlert
                message={t("redeem_modal.form.destination_address_check_label")}
                type="info"
            />
            <div className="flex flex-col gap-3 sm:w-2/3">
                <div className="flex flex-col">
                    <Text c="var(--flr-gray)" fw={400} className={labelClassName}>
                        {label}
                    </Text>
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
                </div>
                <div className="flex flex-col">
                    <Text c="var(--flr-gray)" fw={400} className={labelClassName}>
                        {destinationTagLabel}
                    </Text>
                    <NumberInput
                        {...destinationTagInputProps}
                        key={destinationTagInputKey}
                        inputMode="numeric"
                        className={inputClassName}
                        placeholder="Optional"
                        hideControls
                        maxLength={maxTagLength}
                        min={0}
                    />
                </div>
            </div>
        </div>
    );
}
