import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveAlert } from "@/core/alerts/alerts";
import { IBridgePageState } from "@/components/bridge/state/useBridgePageState";
import { IBridgeRouteQuote } from "@/components/bridge/quotes/useBridgeRouteQuote";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";
import { buildSubmitPayload } from "@/core/bridge";
import { oftIssueMessage } from "@/components/bridge/quotes/oftIssueMessages";
import { pauseIssueMessage } from "@/components/bridge/quotes/pauseIssueMessages";
import { devError, devLog } from "@/utils/debug";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";

/**
 * CTA of the bridge page (desktop panel + mobile card): whether it can be pressed, the alert
 * to show (a failed submit outranks validation), and the click path — the route's fresh
 * submit extras merged with the page state into one payload for the confirm modals.
 */
export function useBridgeSubmit({
    state,
    quote,
    amount,
    isTyping,
    onSubmit,
}: {
    state: IBridgePageState;
    quote: IBridgeRouteQuote;
    amount: number;
    isTyping: boolean;
    onSubmit: (payload: BridgeSubmitPayload) => void;
}) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { route, submitError, setSubmitError } = state;

    // A new amount is a new attempt — the old error no longer applies
    useEffect(() => {
        setSubmitError(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount]);

    const canSubmit = state.isConnected && route !== undefined && amount > 0 && state.isRecipientValid
        && !quote.validation.isBlocked && !quote.isLoading && !isTyping && !isSubmitting;

    // Nothing wrong, just not settled yet (typing pause, quote / recipient lookup) — the CTA
    // shows loading instead of looking disabled
    const isPreparing = state.isConnected && route !== undefined && amount > 0
        && (isTyping || quote.isLoading || state.isRecipientLoading);

    // Shown once typing pauses (old forms debounced 500 ms); the CTA is blocked meanwhile anyway
    const alert = isTyping
        ? undefined
        : resolveAlert([submitError ? { msg: submitError, type: "error" as const } : undefined, ...quote.validation.alerts]);

    const submit = async () => {
        if (!canSubmit || !route) return;
        setIsSubmitting(true);
        setSubmitError(undefined);
        try {
            // Side by side: the flow's fresh extras (LayerZero re-quote), the pauses and the OFT
            // limit — the form's are from page load, a pause or a lower limit since then must stop
            // the transfer before anything is signed. Unreachable = not checked
            const [extras, pauses, limits] = await Promise.all([quote.submit?.(), quote.checkPauses(), quote.checkOftLimits()]);
            if (pauses?.isPaused) {
                devLog('bridge: blocked by a pause', pauses.issues);
                setSubmitError(pauseIssueMessage(t)(pauses.issues[0]));
                return;
            }
            const limitCheck = limits?.evaluate(route, amount);
            if (limitCheck?.isBlocked) {
                devLog('bridge: blocked by the OFT limit', limitCheck.issues);
                setSubmitError(oftIssueMessage(t)(limitCheck.issues[0]));
                return;
            }

            const result = buildSubmitPayload({
                route,
                amount,
                extras,
                recipientKind: state.recipientKind,
                recipientAddress: state.recipientAddress,
                destinationTag: state.destinationTag,
                mint: state.mintRecipient.values,
            });
            if (!result.ok) {
                devError('bridge: submit payload incomplete', result.reason);
                setSubmitError(t("bridge_page.submit_failed_label"));
                return;
            }
            const { payload } = result;
            devLog('bridge: submit', payload);
            onSubmit(payload);
        } catch (error: any) {
            devError('bridge: submit failed', error);
            // handleErrors throws translated messages; anything else (raw ethers) gets the generic one
            const decoded = await ErrorDecoder.create([FAssetOFTAdapterAbi]).decode(error).catch(() => undefined);
            setSubmitError(decoded?.reason || t("bridge_page.submit_failed_label"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        canSubmit,
        // CTA loading: a submit in flight, or the quote / recipient still settling
        isSubmitting: isSubmitting || isPreparing,
        // Only a submit in flight — the swap button must not wait for a quote
        isSending: isSubmitting,
        alert,
        submit,
    };
}
