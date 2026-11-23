import { useTranslation } from "react-i18next";
import { BRIDGE_ROUTE_CHAIN } from "@/constants";
import { IBridgeRoute, isHyperCoreTransfer } from "@/config/bridgeRoutes";
import { useHyperCoreAccountExists } from "@/api/hypercore";
import { toAlert } from "@/core/alerts";
import type { IAlertMessage } from "@/core/alerts/types";
import { evaluateHyperCoreRecipient } from "@/core/hypercore";
import { hyperCoreIssueMessage } from "@/components/bridge/quotes/hyperCoreIssueMessages";

/**
 * Whether the destination accepts the recipient — the checks that depend on where the FXRP
 * lands, not on the route's flow. The address format is checked by the page state
 * (`BridgeRecipientField` → `recipientAddress`, `isRecipientValid`); XRPL destinations keep their
 * account checks in the redeem quotes (`useXrplDestinationChecks`).
 * - → Hyperliquid (Flare / remote / XRPL): the composer credits only an active Hyperliquid account
 *   (`evaluateHyperCoreRecipient`)
 */
export function useBridgeRecipientCheck({ route, recipient }: { route?: IBridgeRoute; recipient?: string }): {
    alert?: IAlertMessage;
    isBlocked: boolean;
    // The account lookup runs — the CTA shows loading, not a dead button
    isLoading: boolean;
} {
    const { t } = useTranslation();
    // Hyperliquid ↔ HyperEVM always credits the sender — nothing to check
    const toHyperliquid = route?.to === BRIDGE_ROUTE_CHAIN.HYPER_CORE && !isHyperCoreTransfer(route);
    // `recipient` is a valid address or undefined (still being typed)
    const address = recipient ?? "";
    const account = useHyperCoreAccountExists(address, toHyperliquid);
    if (!toHyperliquid) return { isBlocked: false, isLoading: false };

    const { issues, isBlocked } = evaluateHyperCoreRecipient({
        hasAddress: address !== "",
        accountExists: account.exists,
        accountError: account.isUnavailable,
    });
    return {
        alert: issues[0] && toAlert(issues[0], hyperCoreIssueMessage(t)),
        isBlocked,
        isLoading: address !== "" && account.isLoading,
    };
}
