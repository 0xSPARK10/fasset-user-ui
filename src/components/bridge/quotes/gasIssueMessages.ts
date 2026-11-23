import { TFunction } from "i18next";
import { Issue } from "@/core/alerts";
import { GasIssueCode } from "@/core/bridge";
import { formatNumber, roundDownToDecimals, roundUpToDecimals } from "@/utils";

// Testnet executor fees are as small as 0.0000001 — 2 decimals would show "0"
function feeMessageDecimals(fee: number): number {
    return fee < 0.01 ? 8 : 2;
}

// Gas codes → texts; `tokenName` = the gas coin the fee is paid in
export function gasIssueMessage(t: TFunction, tokenName?: string) {
    return (issue: Issue<GasIssueCode>): string => {
        switch (issue.code) {
            case "gas_insufficient": {
                const fee = issue.values?.fee ?? 0;
                // Same precision for both, so the two amounts compare at a glance
                const decimals = feeMessageDecimals(fee);
                return t("bridge_page.insufficient_fee_balance_label", {
                    // Up for the fee, down for the balance: 9.99996 must not read as the 10 that is needed
                    fee: formatNumber(roundUpToDecimals(fee, decimals), decimals, "en-US", 0),
                    balance: formatNumber(roundDownToDecimals(issue.values?.gasBalance ?? 0, decimals), decimals, "en-US", 0),
                    tokenName,
                });
            }
            case "gas_unavailable":
                return t("bridge_page.gas_balance_unavailable_label", { tokenName });
        }
    };
}
