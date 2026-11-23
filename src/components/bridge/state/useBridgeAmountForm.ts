import { useEffect, useRef, useState } from "react";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { BridgeRouteChain } from "@/types";
import { clampDeeplinkAmount } from "@/core/bridge";
import type { IBridgeRouteQuote } from "@/components/bridge/quotes/useBridgeRouteQuote";
import type { IBridgePageState } from "@/components/bridge/state/useBridgePageState";

// Amount form of the bridge page — shared by the desktop panel and the mobile card.
export function useBridgeAmountForm(from?: BridgeRouteChain, to?: BridgeRouteChain, resetKey?: number) {
    const { t } = useTranslation();

    const schema = yup.object().shape({
        amount: yup
            .number()
            .transform((value) => (Number.isNaN(value) ? undefined : value))
            .required(
                t("validation.messages.required", {
                    field: t("bridge_modal.form.amount_label"),
                }),
            )
            .moreThan(0),
    });

    // Empty = "" (not undefined): Mantine NumberInput treats an undefined value as
    // uncontrolled and keeps showing the old digits after a reset
    const form = useForm<{ amount: number | "" }>({
        mode: "controlled",
        initialValues: {
            amount: "",
        },
        validate: yupResolver(schema),
    });

    // Any chain change starts the amount over: a new route has its own token, max, decimals
    // and fees, and a carried-over amount would quote the new route before the user chose it.
    // `resetKey`: the page clears it after a successful submit too.
    const routeKey = `${from}|${to}|${resetKey}`;
    const [amountRouteKey, setAmountRouteKey] = useState<string>(routeKey);
    useEffect(() => {
        form.reset();
        setAmountRouteKey(routeKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeKey]);

    // The reset runs after the first render of a new route — until then the old amount would be
    // quoted for it (e.g. a flash of "Not enough native token" on the new source chain)
    const amount = amountRouteKey === routeKey ? Number(form.getValues().amount) || 0 : 0;

    // While the user is still typing ("1" on the way to "15"), messages wait 500 ms like the
    // old forms did; blocking the CTA stays immediate
    const [settledAmount] = useDebouncedValue(amount, 500);
    const isTyping = amount !== settledAmount;

    return { form, amount, isTyping };
}

// Applies the active route's amount-field state: the error border (e.g. above the redemption
// queue), and an amount reset when the field turns read-only (mint cap reached) or disabled
// (nothing to send).
export function useApplyAmountValidation(
    form: ReturnType<typeof useBridgeAmountForm>["form"],
    input: { hasError?: boolean; readOnly?: boolean; disabled?: boolean } | undefined,
    amount: number,
    isTyping: boolean,
) {
    // Mantine clears a field error on every change — re-apply it for the new amount too,
    // once typing pauses
    useEffect(() => {
        // `true` = border only; the message is in the alert box
        if (input?.hasError && !isTyping) form.setFieldError("amount", true);
        else form.clearFieldError("amount");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input?.hasError, amount, isTyping]);

    const isLocked = !!input?.readOnly || !!input?.disabled;
    useEffect(() => {
        if (isLocked) form.setFieldValue("amount", "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocked]);
}

// Amount ↔ /bridge link. A link's amount goes into the field once the route's max is known; above
// the max it is set to the max. Without a source wallet there is no balance to wait for — it goes in
// as is (dropped when nothing can be sent, e.g. the mint cap). An amount entered before the wallet
// connects is capped once its balance is in. The settled amount goes back to the page for the URL.
export function useBridgeAmountLink(
    form: ReturnType<typeof useBridgeAmountForm>["form"],
    quote: Pick<IBridgeRouteQuote, "maxAmount" | "allowDecimal" | "isMaxFinal" | "validation">,
    state: IBridgePageState,
    amount: number,
): void {
    const { pendingAmount, hasSourceWallet } = state;
    const { maxAmount, allowDecimal, isMaxFinal } = quote;
    const isReadOnly = !!quote.validation.input?.readOnly;
    const hasBalance = !!state.from && state.balances.values[state.from] !== undefined;

    useEffect(() => {
        if (pendingAmount === undefined || !isMaxFinal) return;
        // No wallet = no balance to wait for; with one, wait until its max is in
        const cap = hasSourceWallet ? maxAmount : maxAmount ?? Infinity;
        if (cap === undefined) return;
        // Nothing can be sent (empty balance, mint cap, pause) — the form already says why
        if (cap === 0 || isReadOnly) {
            state.onLinkAmountApplied();
            return;
        }
        form.setFieldValue("amount", clampDeeplinkAmount(Number(pendingAmount), cap, allowDecimal));
        state.onLinkAmountApplied();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingAmount, hasSourceWallet, isMaxFinal, maxAmount, allowDecimal, isReadOnly]);

    // Typed (or from a link) before the wallet connected: the input could not clamp it, so cap it
    // once — when the balance is in. Later max changes leave the amount alone (the CTA blocks)
    const capAfterConnect = useRef(false);
    const hadSourceWallet = useRef(hasSourceWallet);
    useEffect(() => {
        if (hasSourceWallet && !hadSourceWallet.current) capAfterConnect.current = true;
        hadSourceWallet.current = hasSourceWallet;
        if (!capAfterConnect.current || !hasSourceWallet || !hasBalance || !isMaxFinal || maxAmount === undefined) return;
        capAfterConnect.current = false;
        if (amount <= maxAmount) return;
        form.setFieldValue("amount", maxAmount > 0 ? clampDeeplinkAmount(amount, maxAmount, allowDecimal) : "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasSourceWallet, hasBalance, isMaxFinal, maxAmount]);

    useEffect(() => {
        state.onFormAmountChange(amount > 0 ? String(amount) : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount]);
}
