import { Fees } from "@/core/fees";
import { roundDownToDecimals } from "@/utils/number";

/**
 * Bridge + redeem to XRPL (HyperEVM / Ethereum / BNB Chain → XRPL) amounts: the user enters
 * the net amount; the composer fee is grossed up on top,
 * the redemption fee is taken from the net.
 */
export class BridgeXrplCalculator {
    constructor(private readonly composerFeePPM: number, private readonly redemptionFeeBips: number) {}

    // FXRP that leaves the source chain for `net` to reach the composer
    gross(net: number): number {
        return Fees.totalToBridge(net, this.composerFeePPM);
    }

    // XRP that arrives on XRPL
    received(net: number): number {
        return net - Fees.redeemingFee(net, this.redemptionFeeBips);
    }

    // FXRP the composer keeps on top of `net` (0 when composerFeePPM is 0)
    composerFee(net: number): number {
        return this.gross(net) - net;
    }

    // Taken from `net` by the redemption, paid out of the XRP
    redemptionFee(net: number): number {
        return net - this.received(net);
    }

    // Largest net the balance can bridge after the composer cut (2 decimals, rounded down)
    affordable(balance: number): number {
        return this.composerFeePPM > 0 ? roundDownToDecimals(Fees.affordableNet(balance, this.composerFeePPM), 2) : balance;
    }

    // Affordable net, capped by what the redemption queue can serve
    maxAmount(balance: number, queueMax?: number): number {
        const affordable = this.affordable(balance);
        return queueMax !== undefined ? Math.min(affordable, queueMax) : affordable;
    }
}
