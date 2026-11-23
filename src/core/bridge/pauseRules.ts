import { Issue } from "@/core/alerts";

export type PauseIssueCode = "fasset_paused" | "oft_paused";

export interface IPauseRulesInput {
    // GET /fassetState for the bridged FAsset — emergency pause, any level
    fassetPaused: boolean;
    // GET /oft/paused — the Flare OFT adapter
    oftPaused: boolean;
}

/**
 * Either pause stops the whole bridge page (UX decision 2026-10-29 — no half-working page, pauses
 * are rare). Order = priority, the wider pause first. OFT rate limits are in OftRateLimits.
 */
export function evaluatePauses({ fassetPaused, oftPaused }: IPauseRulesInput): {
    issues: Issue<PauseIssueCode>[];
    isPaused: boolean;
} {
    const issues: Issue<PauseIssueCode>[] = [];
    if (fassetPaused) issues.push({ code: "fasset_paused", severity: "info", blocking: true });
    if (oftPaused) issues.push({ code: "oft_paused", severity: "info", blocking: true });
    return { issues, isPaused: issues.length > 0 };
}
