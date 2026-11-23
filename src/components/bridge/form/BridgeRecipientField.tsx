import React, { useEffect } from "react";
import { Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { isValidClassicAddress } from "xrpl";
import PasteClipboard from "@/components/elements/PasteClipboard";
import BridgeCustomLink from "@/components/bridge/form/BridgeCustomLink";
import { BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BridgeRouteChain } from "@/types";
import { isValidEvmAddress } from "@/utils/guards";
import classes from "@/styles/components/elements/DestinationAddressField.module.scss";

interface IBridgeRecipientField {
    // Destination chain — decides the address format
    chain: BridgeRouteChain;
    // Called with the address once it is valid, `undefined` while it is not
    onChange: (address: string | undefined) => void;
    // "Remove" — back to the connected wallet; no link when there is none for this chain
    onRemove?: () => void;
    // Only when the user opened it via "Change" — not when it is open from the start
    autoFocus?: boolean;
    // Address from a /bridge link — validated at once, so a bad one shows its error; while it is
    // untouched a hint asks to check it (anyone can build a link)
    initialValue?: string;
    // The user typed or pasted — the link's address must not come back when the field remounts
    onEdit?: () => void;
}

// Destination address input in the TO header. Opened by "Change" ("Use my wallet" falls back to
// the connected wallet's address) or shown from the start when no wallet is connected for
// the destination chain (then no link — the address has to be typed).
export default function BridgeRecipientField({ chain, onChange, onRemove, autoFocus = false, initialValue = "", onEdit }: IBridgeRecipientField) {
    const { t } = useTranslation();

    // XRPL takes a classic r-address, every other destination is EVM
    const isValid = (value: string) => chain === BRIDGE_ROUTE_CHAIN.XRPL
        ? isValidClassicAddress(value)
        : isValidEvmAddress(value);

    const schema = yup.object().shape({
        recipient: yup
            .string()
            .trim()
            .required(
                t("validation.messages.required", {
                    field: t("bridge_page.custom_recipient_label"),
                }),
            )
            .test(
                "is-valid-address",
                // Same messages as the old forms: RedeemForm (XRPL), MintForm (EVM)
                (chain === BRIDGE_ROUTE_CHAIN.XRPL
                    ? t("redeem_modal.form.invalid_xrp_address_label")
                    : t("validation.messages.invalid_address")) as string,
                (value) => !value || isValid(value),
            ),
    });

    const form = useForm({
        mode: "controlled",
        initialValues: {
            recipient: initialValue,
        },
        validate: yupResolver(schema),
    });

    const reportAddress = (value: string) => {
        const address = value.trim();
        onChange(address && isValid(address) ? address : undefined);
    };

    form.watch("recipient", ({ value }) => {
        reportAddress(value);
        onEdit?.();
    });

    // Nothing typed yet = no valid recipient; a link's address counts right away
    useEffect(() => {
        reportAddress(initialValue);
        if (initialValue) form.validate();
        // Mount only — a new link remounts the field (key)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const inputProps = form.getInputProps("recipient");
    const isUntouchedLinkAddress = initialValue !== "" && form.getValues().recipient === initialValue;

    return (
        <div className="flex flex-col gap-[5px] flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 h-4 whitespace-nowrap">
                <Text c="var(--flr-gray)" className="text-12 uppercase">
                    {t("bridge_page.custom_recipient_label")}
                </Text>
                {onRemove && <BridgeCustomLink onClick={onRemove} labelKey="bridge_page.remove_button" />}
            </div>
            <TextInput
                {...inputProps}
                key={form.key("recipient")}
                autoComplete="off"
                autoFocus={autoFocus}
                onBlur={() => form.validateField("recipient")}
                rightSection={
                    <PasteClipboard
                        onPaste={text => {
                            form.setFieldValue("recipient", text.trim());
                            form.validateField("recipient");
                        }}
                    />
                }
                classNames={{
                    wrapper: classes.inputCompactWrapper,
                    input: `${classes.inputCompact} ${inputProps.error ? classes.inputError : ""}`,
                    error: classes.inputErrorText,
                }}
                // Same text as the shown address (the theme makes input text gray)
                styles={{ input: { borderRadius: "0.125rem", color: "var(--mantine-color-text)" } }}
            />
            {isUntouchedLinkAddress && !inputProps.error && (
                <Text c="var(--flr-gray)" className="text-12">
                    {t("bridge_page.link_recipient_hint")}
                </Text>
            )}
        </div>
    );
}
