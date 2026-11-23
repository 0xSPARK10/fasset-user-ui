import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { MintIssueCode } from "@/core/mint";
import { formatFeeAmount } from "@/core/fees";
import { FASSET_COIN } from "@/config/coin";

// Mint rule codes → the same texts MintForm / MintModal show
export function mintIssueMessage(t: TFunction) {
    return (issue: Issue<MintIssueCode>): string => {
        switch (issue.code) {
            case "high_fee":
                return t("mint_modal.minting_fee_high_warning_label");
            case "cap_reached":
                return t("mint_modal.form.mint_cap_reached");
            case "insufficient_balance":
                return t("mint_modal.form.error_insufficient_balance_amount_is_needed_label", {
                    value: formatFeeAmount(issue.values?.required ?? 0, FASSET_COIN.decimals),
                    tokenName: FASSET_COIN.nativeName,
                });
            case "xaman_insufficient":
                return t("mint_modal.form.error_insufficient_balance_label", { tokenName: "XRP" });
            case "below_min":
                return t("mint_modal.form.min_amount_label", {
                    lotSize: issue.values?.min,
                    valueToken: FASSET_COIN.nativeName,
                });
        }
    };
}
