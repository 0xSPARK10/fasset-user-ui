import { IRedemptionFee, IRedemptionQueue } from "@/types";
import { toNumber } from "@/utils/number";

// Redemption limits in whole units (the API sends UBA / XRP strings)
export interface RedemptionLimits {
    feeBips: number;
    // Minimum redeem amount; the lot size until the API returns minimumRedeemAmountUBA
    min: number;
    // Max the queue can redeem without failing (`maxAmountXRP`); undefined = not loaded
    queueMax?: number;
}

export class RedemptionMapper {
    static toLimits(
        fee: IRedemptionFee | undefined,
        queue: IRedemptionQueue | undefined,
        coin: { contractDecimals?: number; lotSize: number },
    ): RedemptionLimits {
        return {
            feeBips: toNumber(fee?.redemptionFee ?? "0"),
            // RedeemForm:87-90
            min: fee?.minimumRedeemAmountUBA
                ? Number(fee.minimumRedeemAmountUBA) / Math.pow(10, coin.contractDecimals ?? 6)
                : coin.lotSize,
            queueMax: RedemptionMapper.queueMax(queue),
        };
    }

    // Max the queue can serve in total; undefined = not loaded
    static queueMax(queue: IRedemptionQueue | undefined): number | undefined {
        return queue?.maxAmountXRP != null ? Number(queue.maxAmountXRP) : undefined;
    }

    // Max one redeem call takes without a partial redemption (`maxAmountOneRedemptionXRP`, never
    // above the total); undefined = not loaded. Bridge → XRPL caps at it: the composer moves the
    // whole amount to the redeemer account, so a partial rest would stay there (Jurij, 2026-11-02)
    static singleRequestMax(queue: IRedemptionQueue | undefined): number | undefined {
        const total = RedemptionMapper.queueMax(queue);
        const single = queue?.maxAmountOneRedemptionXRP != null ? Number(queue.maxAmountOneRedemptionXRP) : undefined;
        if (total === undefined) return single;
        return single !== undefined ? Math.min(total, single) : total;
    }

    // Balance capped by what the queue can serve
    static maxAmount(balance: number | undefined, limits: RedemptionLimits): number | undefined {
        return balance !== undefined && limits.queueMax !== undefined ? Math.min(balance, limits.queueMax) : balance;
    }
}
