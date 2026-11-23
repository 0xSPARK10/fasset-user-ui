import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { BridgeXrplIssueCode } from "@/core/bridge";
import { FASSET_COIN } from "@/config/coin";

// Bridge → XRPL rule codes → texts
export function bridgeXrplIssueMessage(t: TFunction) {
    return (issue: Issue<BridgeXrplIssueCode>): string => {
        switch (issue.code) {
            case "insufficient_balance":
                // "Insufficient balance" alone does not say how much is needed
                return t("bridge_page.insufficient_balance_min_label", { min: issue.values?.min, coinName: FASSET_COIN.type });
            case "below_min":
                return t("redeem_modal.form.min_amount_error", { min: issue.values?.min, coinName: FASSET_COIN.type });
        }
    };
}
