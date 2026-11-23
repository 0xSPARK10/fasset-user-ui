import { Issue } from "@/core/alerts";

export type GasIssueCode = "gas_insufficient" | "gas_unavailable";

export interface IGasRulesInput {
    // Fee paid in the gas coin (LayerZero nativeFee or redeem executor fee) and the gas balance, in whole units; undefined = unknown
    fee?: number;
    gasBalance?: number;
    // The balance is expected (wallet connected, fee quoted) but not in yet
    isWaiting: boolean;
    // While waiting: the query settled without a value or took too long
    isUnavailable: boolean;
}

/**
 * Enough gas coin for the fee. Unknown balance blocks, and "unavailable"
 * says why.
 */
export function evaluateGas({ fee, gasBalance, isWaiting, isUnavailable }: IGasRulesInput): {
    issues: Issue<GasIssueCode>[];
    isBlocked: boolean;
} {
    const insufficient = fee !== undefined && gasBalance !== undefined && gasBalance < fee;
    const issues: Array<Issue<GasIssueCode> | false> = [
        insufficient && { code: "gas_insufficient", severity: "error", blocking: true, values: { fee, gasBalance } },
        !insufficient && isWaiting && isUnavailable && { code: "gas_unavailable", severity: "warning", blocking: true },
    ];
    const visible = issues.filter((issue): issue is Issue<GasIssueCode> => !!issue);
    // Waiting blocks without a message until it counts as unavailable
    return { issues: visible, isBlocked: isWaiting || visible.some(issue => issue.blocking) };
}
