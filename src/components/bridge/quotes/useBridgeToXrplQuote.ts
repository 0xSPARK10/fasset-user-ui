import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeXrplFees } from "@/hooks/fees/useBridgeXrplFees";
import { useRedemptionFees } from "@/api/oft";
import { useRedemptionFee, useRedemptionQueue } from "@/api/redemption";
import { formatInputAmount } from "@/core/fees";
import { toAlert } from "@/core/alerts";
import { BridgeXrplCalculator, evaluateBridgeXrpl } from "@/core/bridge";
import { RedemptionMapper } from "@/core/redeem";
import { BridgeConfig, bridgeChainEid, getBridgeLzRoute } from "@/config/bridge";
import { BRIDGE_FASSET_COIN, BRIDGE_GAS_COIN, FASSET_COIN } from "@/config/coin";
import { BridgeType } from "@/types";
import { toNumber } from "@/utils";
import { useLayerZeroFee } from "@/components/bridge/quotes/useLayerZeroFee";
import { IAmountLimit, IRouteQuotePart } from "@/components/bridge/quotes/types";
import { useGasBalanceCheck } from "@/components/bridge/quotes/useGasBalanceCheck";
import { useXrplDestinationChecks } from "@/components/bridge/quotes/useXrplDestinationChecks";
import { bridgeXrplIssueMessage } from "@/components/bridge/quotes/bridgeXrplIssueMessages";
import { useTranslation } from "react-i18next";

/**
 * Bridge where FXRP ends up as XRP (HyperEVM / Ethereum → XRPL): bridge to Flare, the
 * redeem composer there redeems onward to XRP. Counterpart: useBridgeTransferQuote.
 * The user enters the net amount; gross = composer
 * gross-up, received = net − redemption fee, max = affordable net capped by the queue.
 */
export function useBridgeToXrplQuote({
    bridgeType,
    config,
    amount,
    balance,
    destinationAddress,
    destinationTag,
    enabled,
}: {
    bridgeType?: BridgeType;
    config?: BridgeConfig;
    amount: number;
    balance?: number;
    destinationAddress?: string;
    destinationTag: string;
    enabled: boolean;
}): IRouteQuotePart {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    // The source chain determines the srcEid the composer / executor fees are quoted for
    const srcEid = bridgeType ? bridgeChainEid(getBridgeLzRoute(bridgeType).source, !!mainToken?.network?.mainnet) : 0;

    const redemptionFees = useRedemptionFees(srcEid, enabled && srcEid !== 0);
    const redemptionFee = useRedemptionFee(FASSET_COIN.type, enabled);
    const redemptionQueue = useRedemptionQueue(FASSET_COIN.type, enabled);

    const { fee, isLoading, requote } = useLayerZeroFee({
        bridgeType,
        amount,
        // The compose message needs the executor / composer fee — wait for them
        enabled: enabled && !!redemptionFees.data,
        executorFee: redemptionFees.data?.executorFee,
        composerFeePPM: redemptionFees.data?.composerFeePPM,
        destinationAddress,
        destinationTag,
    });

    const composerFeePPM = Number(redemptionFees.data?.composerFeePPM ?? "0");
    const calc = new BridgeXrplCalculator(
        composerFeePPM,
        toNumber(redemptionFee.data?.redemptionFee ?? "0"),
    );
    const received = amount > 0 ? calc.received(amount) : undefined;
    const redemptionFeeAmount = amount > 0 ? calc.redemptionFee(amount) : undefined;
    // No composer fee row while the composer takes nothing (mainnet today)
    const sourceCoin = config ? BRIDGE_FASSET_COIN[config.source] : undefined;
    const composerFee = amount > 0 && composerFeePPM > 0 && sourceCoin
        ? { amount: calc.composerFee(amount), coin: sourceCoin }
        : undefined;

    const feeChain = config?.feeChain;
    const feeCoin = feeChain ? BRIDGE_GAS_COIN[feeChain] : mainToken;
    const fees = useBridgeXrplFees({ feeCoin, fee, isLoading, redemptionFeeAmount, composerFee });
    const gas = useGasBalanceCheck({ feeChain, feeCoin, fee, enabled });
    const destination = useXrplDestinationChecks({ address: destinationAddress, tag: destinationTag, enabled, keys: "bridge_modal" });

    // One request at most — a partial rest would stay on the redeemer account (Asset Recovery)
    const requestMax = RedemptionMapper.singleRequestMax(redemptionQueue.data);
    const issues = enabled ? evaluateBridgeXrpl({ amount, balance, calc, feesLoaded: !!redemptionFees.data }) : [];
    const affordableBalance = balance !== undefined ? calc.affordable(balance) : 0;

    // The redemption queue can take less than the balance — that is what can be redeemed now
    const redeemable = balance !== undefined && requestMax !== undefined && requestMax < affordableBalance
        ? formatInputAmount(requestMax, FASSET_COIN.decimals ?? 2)
        : undefined;
    // The composer fee comes on top, so less than the balance can be sent — "available" shows Max
    const affordable = balance !== undefined && affordableBalance < balance
        ? formatInputAmount(affordableBalance, FASSET_COIN.decimals ?? 2)
        : undefined;
    let limit: IAmountLimit | undefined;
    if (redeemable) limit = { amount: redeemable, kind: "redeemable" };
    else if (affordable) limit = { amount: affordable, kind: "available" };

    return {
        fees,
        received,
        maxAmount: balance !== undefined ? calc.maxAmount(balance, requestMax) : undefined,
        limit,
        submit: async () => {
            const fresh = await requote();
            return fresh !== undefined
                ? { fee: fresh, executorFee: redemptionFees.data?.executorFee, composerFeePPM: redemptionFees.data?.composerFeePPM }
                : undefined;
        },
        isLoading: isLoading || (enabled && (redemptionFees.isPending || redemptionFee.isPending || redemptionQueue.isPending)),
        validation: {
            // In priority order: depositAuth, required tag, tag not supported, gas, form, queue max
            alerts: [
                destination.depositAuth,
                destination.requireDestTag,
                destination.tagNotSupported,
                gas.alert,
                ...issues.map(issue => toAlert(issue, bridgeXrplIssueMessage(t))),
                redeemable
                    ? { msg: t("redeem_modal.form.current_max_redeemable_label", { amount: redeemable, token: FASSET_COIN.type }), type: "info" }
                    : undefined,
            ],
            isBlocked: enabled && (
                !redemptionFees.data
                || (amount > 0 && (fee == null || isLoading))
                || gas.isBlocked
                || issues.some(issue => issue.blocking)
                || destination.isBlocked
            ),
        },
    };
}
