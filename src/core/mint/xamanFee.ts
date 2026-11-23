// Xaman adds its own USD-tiered fee on top of a payment (MintForm:453-483)
export class XamanFee {
    static forUsd(totalUsd: number): number {
        if (totalUsd > 100000) return totalUsd * 0.0007;
        if (totalUsd > 50000) return totalUsd * 0.001;
        return 0;
    }

    /**
     * Largest XRP payment T with T + Xaman's fee ≤ `availableXrp`. Tried per tier: the fee is
     * lower above $100k (0.07%) than between $50k and $100k (0.1%), so the payment just above
     * $100k can fit where the one just below it does not.
     */
    static maxSpendable(availableXrp: number, price: number): number {
        const usd50k = 50000 / price;
        const usd100k = 100000 / price;
        // Each candidate pays its own tier's rate exactly; it counts only if it lands in that tier
        // (checking `T + fee ≤ available` instead fails on float rounding at equality)
        const noFee = Math.min(availableXrp, usd50k);
        const midTier = Math.min(availableXrp / 1.001, usd100k);
        const topTier = availableXrp / 1.0007;
        return Math.max(
            0,
            noFee,
            midTier > usd50k ? midTier : 0,
            topTier > usd100k ? topTier : 0,
        );
    }
}
