/**
 * Centralized fee math for bridge, redeem and mint flows
 */

export class Fees {
    // Composer fee is expressed in PPM
    private static readonly PPM = 1_000_000;
    // Basic-points denominator 
    private static readonly BIPS = 10_000;

    // Gross to bridge so the user receives 'net' value afer composers cut:
    static totalToBridge(net: number, feePPM: number): number {
        if (feePPM <= 0) return net;
        return (net * Fees.PPM) / (Fees.PPM - feePPM);
    }

    // Same gross-up on raw on-chain units (drops), for the actual tx value (twin of totalToBridge)
    static totalToBridgeRaw(net: bigint, feePPM: bigint): bigint {
        if (feePPM <= BigInt(0)) return net;
        const ppm = BigInt(Fees.PPM);
        return (net * ppm) / (ppm - feePPM);
    }

    // Largest net bridgeable from `balance` after the composer cut (inverse of totalToBridge)
    static affordableNet(balance: number, feePPM: number): number {
        if (feePPM <= 0) return balance;
        return (balance * (Fees.PPM - feePPM)) / Fees.PPM;
    }

    // Redemption fee = amount * bips/10000
    static redeemingFee(amount: number, bips: number): number {
        return amount * (bips / Fees.BIPS);
    }

    // System minting fee (gross-up + min floor): max((base + executorFee) * feeRate/(1 - feeRate), minimumFee)
    static mintingFee(base: number, executorFee: number, bips: number, minimumFee: number): number {
        const feeRate = bips / Fees.BIPS;
        const percentageFee = ((base + executorFee) * feeRate) / (1 - feeRate);
        return Math.max(percentageFee, minimumFee);
    }

    // Total direct-mint payment in underlying smallest units (drops), as string for the
    // on-chain request. On-chain integer twin of mintingFee.
    static mintPaymentRaw(
        amount: number,
        underlyingDecimals: number,
        mintingFeeBIPS: string,
        minimumMintingFeeUBA: string,
        fassetsExecutorFee: string,
    ): string {
        const mintAmountUba = Math.round(amount * 10 ** underlyingDecimals);
        const feeBIPS = Number(mintingFeeBIPS ?? "0");
        const minimumFee = Number(minimumMintingFeeUBA ?? "0");
        const executorFee = Number(fassetsExecutorFee ?? "0");
        const percentageFee = Math.round(
            ((mintAmountUba + executorFee) * feeBIPS) / (Fees.BIPS - feeBIPS),
        );
        const systemFee = Math.max(percentageFee, minimumFee);
        return (mintAmountUba + systemFee + executorFee).toString();
    }
}
