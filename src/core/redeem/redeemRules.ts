import { Issue } from "@/core/alerts";
import { RedemptionLimits } from "@/core/redeem/redemptionLimits";

export type RedeemIssueCode = "above_total" | "below_min" | "insufficient_balance";

export interface IRedeemRulesInput {
    amount: number;
    // undefined = not loaded (balance rule skipped)
    balance?: number;
    limits: RedemptionLimits;
}

/**
 * The queue channel: above what the queue can redeem in total (or nothing redeemable today).
 * Checked only from the minimum up. A request above `maxAmountOneRedemptionXRP` is allowed — it
 * is partially redeemed and the rest stays in the wallet (Jurij, April 2026).
 */
export function evaluateRedeemQueue({ amount, limits }: IRedeemRulesInput): Issue<RedeemIssueCode>[] {
    const { min, queueMax } = limits;
    const belowMin = amount > 0 && amount < min;
    if (amount > 0 && !belowMin && ((queueMax !== undefined && amount > queueMax) || queueMax === 0)) {
        return [{ code: "above_total", severity: "warning", blocking: true, values: { amount: queueMax ?? 0 } }];
    }
    return [];
}

/**
 * RedeemForm:213-225 (balance), 264 (min) — the form channel. A typed sub-minimum amount
 * overwrites the insufficient-balance alert, as the old single form-alert slot did.
 */
export function evaluateRedeemAmount({ amount, balance, limits }: IRedeemRulesInput): Issue<RedeemIssueCode>[] {
    if (amount > 0 && amount < limits.min) {
        return [{ code: "below_min", severity: "info", blocking: true, values: { min: limits.min } }];
    }
    if (balance !== undefined && balance < limits.min) {
        return [{ code: "insufficient_balance", severity: "info", blocking: true, values: { min: limits.min } }];
    }
    return [];
}
