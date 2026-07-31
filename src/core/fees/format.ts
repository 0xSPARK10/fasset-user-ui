import { formatNumber, roundDownToDecimals, roundUpToDecimals } from "@/utils";

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

/**
 * Format a balance for display — floors to the coin's display decimals, then shows only the
 * decimals the number actually needs, never fewer than two: `0` renders `0.00`, `0.0004`
 * renders in full, and `2.3333333333` stops at the coin's precision.
 *
 * Variable width rather than a fixed `0.000000`, because the two ends of an ETH-priced range
 * want different things: a sub-cent balance is meaningless without six decimals, while a
 * whole-ETH one padded out to six reads as false precision. Nothing here needs a fixed width
 * — the row renders the value as text stacked under its label, not in a numeric column.
 *
 * Floors rather than rounds, like the other helpers here: a balance shown higher than the
 * one held reads as spendable when it is not. Takes the value as a string so an 18-decimal
 * `formatUnit` result reaches BigNumber without a detour through a float.
 *
 * Precision comes from `ICoin.decimals`; the 2-decimal default suits FLR- and HYPE-sized
 * balances, while ETH needs more of it (see `ETH` in `config/coin.tsx`).
 */
export const formatBalanceAmount = (value: string | number, decimals = 2): string =>
    formatNumber(roundDownToDecimals(value, decimals), decimals, 'en-US', 2);

/**
 * Format a cross-chain (LayerZero) fee, which arrives as a formatted 18-decimal string.
 *
 * Rounds *up*, unlike `formatFeeAmount` — a fee shown lower than the one actually charged
 * understates the cost, and flooring would also turn a small-but-real fee into a row of
 * zeros that reads as "free". Rounding up, the smallest non-zero fee lands on the last
 * shown digit instead.
 *
 * The string is passed through to BigNumber rather than via `toNumber`, so an 18-decimal
 * value never takes a detour through a float.
 *
 * Precision comes from `ICoin.feeDecimals`; the default suits FLR- and HYPE-priced fees,
 * while ETH needs more of it (see the field's comment in `types.ts`).
 */
export const formatCrossChainFee = (value: string | number, decimals = 4): string =>
    formatNumber(roundUpToDecimals(value, decimals), decimals);
