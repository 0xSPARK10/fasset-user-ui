import { formatBalanceAmount } from "@/core/fees";

// Full value up to the token's 6 decimals (at least 2), so more decimals typed in the amount
// show here too. Floored — rounding up would show more than the user receives. Fixed en-US,
// same as the balances.
export function formatReceivedAmount(amount: number): string {
    return amount > 0 ? formatBalanceAmount(amount, 6) : "--";
}
