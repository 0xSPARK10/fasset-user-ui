import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { HyperCoreIssueCode } from "@/core/hypercore";

// Hyperliquid codes → texts: Hyperliquid ↔ HyperEVM and the → Hyperliquid recipient check
export function hyperCoreIssueMessage(t: TFunction) {
    return (issue: Issue<HyperCoreIssueCode>): string => {
        switch (issue.code) {
            case "token_unavailable":
                return t("bridge_page.hypercore.unavailable_label");
            case "core_balance_unavailable":
            case "core_account_unavailable":
                return t("bridge_page.hypercore.core_balance_unavailable_label");
            case "no_core_hype":
                return t("bridge_page.hypercore.no_hype_on_core_label");
            case "core_account_missing":
                return t("bridge_page.hypercore.core_account_missing_label");
            case "recipient_account_missing":
                return t("bridge_page.hypercore.recipient_not_active_label");
            case "recipient_account_unavailable":
                return t("bridge_page.hypercore.recipient_check_failed_label");
            default: {
                const _exhaustive: never = issue.code;
                return _exhaustive;
            }
        }
    };
}
