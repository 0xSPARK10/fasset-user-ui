import type { IAlertMessage } from "@/core/alerts/types";

/**
 * A rule violation as data: what is wrong, how loud, whether it blocks the CTA. Rules in
 * `core/` return these without translating; the hook turns them into alerts with `toAlert`.
 * Order in a list = priority (first one wins in `resolveAlert`).
 */
export interface Issue<C extends string> {
    code: C;
    severity: NonNullable<IAlertMessage["type"]>;
    blocking: boolean;
    // Raw values for the message (formatted by the caller)
    values?: Record<string, number>;
}

export function toAlert<C extends string>(
    issue: Issue<C>,
    message: (issue: Issue<C>) => string,
): IAlertMessage {
    return { msg: message(issue), type: issue.severity };
}
