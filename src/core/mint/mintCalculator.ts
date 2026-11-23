import { Fees } from "@/core/fees";
import { MintingParams } from "@/core/mint/mintingParams";

/**
 * Direct mint amounts (same model as MintForm, see the derivation there): the user enters the
 * FAsset amount to receive; the XRP payment adds the system fee (max(percentage, minimum))
 * and the executor fee. `reserve` = the XRPL account reserve that must stay in the wallet.
 */
export class MintCalculator {
    constructor(private readonly params: MintingParams, readonly reserve: number) {}

    get executorFee(): number {
        return this.params.executorFee;
    }

    // System minting fee for `amount`
    fee(amount: number): number {
        return Fees.mintingFee(amount, this.params.executorFee, this.params.feeBips, this.params.minimumFee);
    }

    // What is paid on top of the amount: system fee + executor fee
    totalFees(amount: number): number {
        return this.fee(amount) + this.params.executorFee;
    }

    feePercent(amount: number): number {
        return amount > 0 ? (this.fee(amount) / amount) * 100 : 0;
    }

    // XRP needed to mint `minAmount` and keep the reserve
    required(minAmount: number): number {
        // Same summation order as MintForm — a different order changes the last digit, and
        // at the boundary that flips "insufficient balance"
        return minAmount + this.fee(minAmount) + this.params.executorFee + this.reserve;
    }

    // Largest amount the XRP balance can pay, capped by what is left under the mint cap
    maxAmount(balance: number, minAmount: number, capRemaining: number = Infinity): number {
        if (balance < this.required(minAmount)) return 0;

        const { feeBips, minimumFee, executorFee } = this.params;
        const feeRate = feeBips / 10000;
        const availableToSpend = balance - this.reserve - executorFee;
        // Below the threshold the minimum fee applies, above it the percentage
        const threshold = feeRate > 0 ? minimumFee / feeRate : Number.POSITIVE_INFINITY;
        const effectiveMax = availableToSpend <= threshold + minimumFee
            ? Math.max(availableToSpend - minimumFee, 0)
            : (availableToSpend + executorFee) * (1 - feeRate) - executorFee;

        return Math.min(effectiveMax, Math.max(capRemaining, 0));
    }
}
