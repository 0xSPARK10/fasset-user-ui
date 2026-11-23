import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { RedeemIssueCode } from "@/core/redeem";
import { formatFeeAmount } from "@/core/fees";
import { FASSET_COIN } from "@/config/coin";

// Redeem rule codes → the same texts RedeemForm shows
export function redeemIssueMessage(t: TFunction) {
    return (issue: Issue<RedeemIssueCode>): string => {
        switch (issue.code) {
            case "above_total":
                return t("redeem_modal.form.above_max_amount_core_vault_error", {
                    amount: formatFeeAmount(issue.values?.amount ?? 0, FASSET_COIN.decimals),
                    fAsset: FASSET_COIN.type,
                });
            case "below_min":
                return t("redeem_modal.form.min_amount_error", { min: issue.values?.min, coinName: FASSET_COIN.type });
            case "insufficient_balance":
                // "Insufficient balance" alone does not say how much is needed
                return t("bridge_page.insufficient_balance_min_label", { min: issue.values?.min, coinName: FASSET_COIN.type });
        }
    };
}
