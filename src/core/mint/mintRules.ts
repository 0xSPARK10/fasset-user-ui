import { Issue } from "@/core/alerts";
import { MintCalculator } from "@/core/mint/mintCalculator";
import { XamanFee } from "@/core/mint/xamanFee";

export const MINT_RULES = {
    // TODO: use API value once backend returns minMintingAmount (same as MintForm)
    MIN_AMOUNT: 10,
    // System fee above this % of the amount shows the high-fee warning / modal
    HIGH_FEE_PERCENT: 2,
} as const;

export type MintIssueCode =
    | "high_fee"
    | "cap_reached"
    | "insufficient_balance"
    | "xaman_insufficient"
    | "below_min";

export interface IMintRulesInput {
    amount: number;
    // Raw XRP balance; undefined = not loaded (balance rules skipped)
    balance?: number;
    // undefined = minting info not loaded (fee rules skipped)
    calc?: MintCalculator;
    // Infinity = no cap / cap info still loading
    capRemaining: number;
    // FAsset USD price, only for Xaman (adds its own fee)
    xamanPrice?: number;
}

/**
 * Mint rules of MintForm + MintModal, in alert priority: the high-fee warning first
 * (MintModal:124-129), then the form channel in MintForm's order.
 */
export function evaluateMint({ amount, balance, calc, capRemaining, xamanPrice }: IMintRulesInput): Issue<MintIssueCode>[] {
    const isAmountValid = amount >= MINT_RULES.MIN_AMOUNT;
    const required = calc ? calc.required(MINT_RULES.MIN_AMOUNT) : undefined;

    const isXamanInsufficient = (() => {
        if (!calc || !xamanPrice || !isAmountValid || balance === undefined) return false;
        // Summation order as MintForm (amount + fee + executor fee)
        const totalUsd = xamanPrice * (amount + calc.fee(amount) + calc.executorFee);
        return (totalUsd + XamanFee.forUsd(totalUsd)) / xamanPrice > balance - calc.reserve;
    })();

    const issues: Array<Issue<MintIssueCode> | false> = [
        !!calc && isAmountValid && calc.feePercent(amount) > MINT_RULES.HIGH_FEE_PERCENT
            && { code: "high_fee", severity: "warning", blocking: false },
        capRemaining <= 0 && { code: "cap_reached", severity: "info", blocking: true },
        balance !== undefined && required !== undefined && balance < required
            && { code: "insufficient_balance", severity: "error", blocking: true, values: { required } },
        isXamanInsufficient && { code: "xaman_insufficient", severity: "error", blocking: true },
        amount > 0 && !isAmountValid
            && { code: "below_min", severity: "info", blocking: true, values: { min: MINT_RULES.MIN_AMOUNT } },
    ];
    return issues.filter((issue): issue is Issue<MintIssueCode> => !!issue);
}
