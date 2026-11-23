import { FeeItem } from "@/core/fees/feeItem";
import type { IAlertMessage } from "@/core/alerts/types";
import type { RouteSubmitExtras } from "@/core/bridge/types";

// Live validation of one route flow — same rules, i18n keys and blocking as the old form +
// modal of that flow (docs/superpowers/specs/2026-10-21-bridge-page-validation-design.md).
export interface IRouteValidation {
    // Candidates in priority order — the first truthy one is shown (resolveAlert)
    alerts: Array<IAlertMessage | undefined | false>;
    // CTA disabled — with or without a visible alert
    isBlocked: boolean;
    // Nothing is written under the amount field: limits go to the FROM row (`limit`), reasons to
    // the alert box (`alerts`)
    input?: {
        placeholder?: string;
        readOnly?: boolean;
        // Nothing can be sent (max 0) — greyed out, unlike the mint cap's readOnly
        disabled?: boolean;
        // Red border on the amount field, no text — the reason is in the alert box above
        hasError?: boolean;
    };
}

// What the route lets through right now (display amount) — redeem routes set it only when the
// redemption queue takes less than the balance, mint always (balance minus fees and reserve)
export interface IAmountLimit {
    amount: string;
    // "available" = the balance less what the route adds on top (bridge → XRPL composer fee)
    kind: "redeemable" | "mintable" | "available";
}

export const NO_VALIDATION: IRouteValidation = { alerts: [], isBlocked: false };

// What one route flow contributes to the bridge form — every flow hook returns this shape.
export interface IRouteQuotePart {
    fees: FeeItem[];
    // What lands on the destination; undefined = not computable yet
    received?: number;
    // Largest amount the form accepts; undefined = no balance yet
    maxAmount?: number;
    // `maxAmount` is shown but still drops once a limit loads (mint cap) — a link's amount waits
    isMaxPending?: boolean;
    // Shown in the FROM row in place of "N available" ("N redeemable", "N mintable");
    // undefined = the balance is the limit
    limit?: IAmountLimit;
    isLoading: boolean;
    validation: IRouteValidation;
    // Called on CTA click: what this flow adds to the submit payload (bridge re-quotes the
    // fee); undefined = cannot submit (e.g. the fresh quote failed)
    submit?: () => Promise<RouteSubmitExtras | undefined>;
}

export type { RouteSubmitExtras } from "@/core/bridge/types";
