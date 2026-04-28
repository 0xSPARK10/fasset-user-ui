import { formatNumber, roundDownToDecimals } from "@/utils";

/**
 * Format an input amount — floors to given decimals before display.
 * Use for max-amount labels and input descriptions.
 * Pass decimals=0 for integer-only inputs (e.g. mint).
 */
export const formatInputAmount = (value: number, decimals = 0): string =>
    formatNumber(roundDownToDecimals(value, decimals), decimals);

/**
 * Format a fee or send amount — floors to coin decimals before display.
 * Use for minting fee, executor fee, totalSend, redeemFee rows.
 */
export const formatFeeAmount = (value: number, decimals: number): string =>
    formatNumber(roundDownToDecimals(value, decimals), decimals);
