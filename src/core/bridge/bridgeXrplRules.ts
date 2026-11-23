import { Issue } from "@/core/alerts";
import { BridgeXrplCalculator } from "@/core/bridge/bridgeXrplCalculator";

export const BRIDGE_XRPL_RULES = {
    // TODO: replace with redemptionFee.data.minimumRedeemAmountUBA once confirmed by backend
    MIN_AMOUNT: 5,
} as const;

export type BridgeXrplIssueCode = "insufficient_balance" | "below_min";

export interface IBridgeXrplRulesInput {
    amount: number;
    // undefined = not loaded (balance rule skipped)
    balance?: number;
    calc: BridgeXrplCalculator;
    // Composer fees loaded — without them `affordable` has no composer cut yet
    feesLoaded: boolean;
}

/**
 * Insufficient balance wins over the min amount (the opposite of
 * redeem, where a typed sub-minimum amount wins).
 */
export function evaluateBridgeXrpl({ amount, balance, calc, feesLoaded }: IBridgeXrplRulesInput): Issue<BridgeXrplIssueCode>[] {
    if (balance !== undefined && feesLoaded && calc.affordable(balance) < BRIDGE_XRPL_RULES.MIN_AMOUNT) {
        return [{ code: "insufficient_balance", severity: "info", blocking: true, values: { min: BRIDGE_XRPL_RULES.MIN_AMOUNT } }];
    }
    if (amount > 0 && amount < BRIDGE_XRPL_RULES.MIN_AMOUNT) {
        return [{ code: "below_min", severity: "info", blocking: true, values: { min: BRIDGE_XRPL_RULES.MIN_AMOUNT } }];
    }
    return [];
}
