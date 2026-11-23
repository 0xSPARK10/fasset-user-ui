import React, { useEffect } from "react";
import { NumberInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import classes from "@/styles/components/elements/DestinationAddressField.module.scss";
import { isValidDestinationTag } from "@/utils";
import { isWellFormedDeeplinkTag } from "@/core/bridge";

interface IBridgeDestinationTagField {
    // Called with the trimmed tag ("" = none) and whether it is a valid tag
    onChange: (tag: string, isValid: boolean) => void;
    className?: string;
    // Tag from a /bridge link — validated at once, so a bad one shows its error
    initialValue?: string;
    // The user typed — the link's tag must not come back when the field remounts
    onEdit?: () => void;
}

// XRPL destination tag for redeem and bridge + redeem routes. Same rules as RedeemForm:
// optional, an integer 0–4294967295 when given (`0` is a tag).
export default function BridgeDestinationTagField({ onChange, className, initialValue = "", onEdit }: IBridgeDestinationTagField) {
    const { t } = useTranslation();

    const schema = yup.object().shape({
        destinationTag: yup
            .string()
            .test(
                "valid-destination-tag",
                t("redeem_modal.form.destination_tag_invalid") as string,
                isValidDestinationTag,
            ),
    });

    // A link's tag like `-1` or `1.5` stays out of the number input (it would show another, valid
    // number): the field starts empty with the error and blocks until the user edits it
    const isLinkTagMalformed = initialValue !== "" && !isWellFormedDeeplinkTag(initialValue);
    const isLinkTagValid = !isLinkTagMalformed && isValidDestinationTag(initialValue);

    const form = useForm({
        mode: "controlled",
        initialValues: {
            destinationTag: isLinkTagMalformed ? "" : initialValue,
        },
        initialErrors: isLinkTagValid ? {} : { destinationTag: t("redeem_modal.form.destination_tag_invalid") },
        validate: yupResolver(schema),
    });

    form.watch("destinationTag", ({ value }) => {
        const tag = String(value ?? "").trim();
        onChange(tag, isValidDestinationTag(tag));
        onEdit?.();
    });

    useEffect(() => {
        onChange(isLinkTagMalformed ? "" : initialValue, isLinkTagValid);
        // Mount only — a new link remounts the field (key)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const inputProps = form.getInputProps("destinationTag");

    return (
        // Label row built like BridgeRecipientField's (h-4 + 5px gap), so the two inputs line up
        // when they sit side by side
        <div className={`flex flex-col gap-[5px] ${className ?? ""}`}>
            <Text c="var(--flr-gray)" className="text-12 uppercase h-4 whitespace-nowrap">
                {t("bridge_page.destination_tag_label")}
            </Text>
            <NumberInput
                {...inputProps}
                key={form.key("destinationTag")}
                placeholder="Optional"
                inputMode="numeric"
                hideControls
                allowNegative={false}
                allowDecimal={false}
                min={0}
                // Validating the still-empty field would hide the link's error while Bridge stays blocked
                onBlur={() => {
                    if (isLinkTagMalformed && !form.isDirty("destinationTag")) return;
                    form.validateField("destinationTag");
                }}
                classNames={{
                    wrapper: classes.inputCompactWrapper,
                    input: `${classes.inputCompact} ${inputProps.error ? classes.inputError : ""}`,
                    error: classes.inputErrorText,
                }}
                // Same text as the shown address (the theme makes input text gray)
                styles={{ input: { borderRadius: "0.125rem", color: "var(--mantine-color-text)" } }}
            />
        </div>
    );
}
