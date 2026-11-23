import type { Issue } from "../alerts/issue";

export type HyperCoreIssueCode =
    | "token_unavailable"
    | "core_balance_unavailable"
    | "no_core_hype"
    | "core_account_missing"
    | "core_account_unavailable"
    | "recipient_account_missing"
    | "recipient_account_unavailable";

export interface IHyperCoreRulesInput {
    // to_evm = Hyperliquid → HyperEVM, to_core = HyperEVM → Hyperliquid
    direction: "to_evm" | "to_core";
    // An EVM wallet is connected — without one only the token check applies (the CTA connects)
    hasWallet: boolean;
    token: "loading" | "ok" | "unavailable";
    // to_evm: free HYPE on Hyperliquid; undefined = not loaded
    coreHype?: number;
    coreHypeError: boolean;
    // to_evm: the transfer fee in HYPE; undefined = not quoted yet
    fee?: number;
    // to_core: whether the address exists on Hyperliquid; undefined = not loaded
    accountExists?: boolean;
    accountError: boolean;
}

/**
 * Hyperliquid ↔ HyperEVM rules, in priority order.
 * - Hyperliquid → HyperEVM blocks without enough HYPE on Hyperliquid for the fee; it also waits
 *   (blocked, no message) for the HYPE balance.
 * - HyperEVM → Hyperliquid blocks for an inactive account (info, not an error): Core would hold
 *   the FXRP in escrow until the account is activated with HYPE. A failed account lookup blocks
 *   too (error) — without it an inactive account would go through.
 * HyperEVM gas for HyperEVM → Hyperliquid is checked by the caller (useGasBalanceCheck).
 */
export function evaluateHyperCoreTransfer(input: IHyperCoreRulesInput): {
    issues: Issue<HyperCoreIssueCode>[];
    isBlocked: boolean;
} {
    const { direction, hasWallet, token, coreHype, coreHypeError, fee, accountExists, accountError } = input;
    const toEvm = direction === "to_evm";
    const checksCoreHype = toEvm && hasWallet;
    const noCoreHype = coreHype !== undefined && (coreHype <= 0 || (fee !== undefined && coreHype < fee));

    const candidates: Array<Issue<HyperCoreIssueCode> | false> = [
        token === "unavailable" && { code: "token_unavailable", severity: "error", blocking: true },
        checksCoreHype && coreHypeError && { code: "core_balance_unavailable", severity: "error", blocking: true },
        checksCoreHype && noCoreHype && { code: "no_core_hype", severity: "error", blocking: true },
        !toEvm && hasWallet && accountExists === false && { code: "core_account_missing", severity: "info", blocking: true },
        !toEvm && hasWallet && accountError && { code: "core_account_unavailable", severity: "error", blocking: true },
    ];
    const issues = candidates.filter((issue): issue is Issue<HyperCoreIssueCode> => !!issue);

    const isWaiting = token !== "ok"
        || (checksCoreHype && coreHype === undefined)
        || (!toEvm && hasWallet && accountExists === undefined && !accountError);

    return { issues, isBlocked: isWaiting || issues.some(issue => issue.blocking) };
}

/**
 * Flare / remote → Hyperliquid (LayerZero composer): the recipient needs an active Hyperliquid
 * account — the composer reverts for an unknown one and the FXRP lands on the recipient's HyperEVM
 * address instead. Waits (blocked, no message) while the account is checked; a failed check blocks
 * (error) — the FXRP would land on another chain than the user picked.
 */
export function evaluateHyperCoreRecipient(input: {
    // A valid EVM address is entered — without one the "To" field blocks on its own
    hasAddress: boolean;
    // undefined = not loaded
    accountExists?: boolean;
    accountError: boolean;
}): {
    issues: Issue<HyperCoreIssueCode>[];
    isBlocked: boolean;
} {
    const { hasAddress, accountExists, accountError } = input;
    const candidates: Array<Issue<HyperCoreIssueCode> | false> = [
        accountExists === false && { code: "recipient_account_missing", severity: "info", blocking: true },
        hasAddress && accountError && { code: "recipient_account_unavailable", severity: "error", blocking: true },
    ];
    const issues = candidates.filter((issue): issue is Issue<HyperCoreIssueCode> => !!issue);
    const isWaiting = hasAddress && accountExists === undefined && !accountError;

    return { issues, isBlocked: isWaiting || issues.length > 0 };
}
