import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { useRedeemFees } from "@/hooks/fees/useRedeemFees";
import { useRedemptionFee, useRedemptionQueue } from "@/api/redemption";
import { useDirectMintingExecutor } from "@/api/user";
import { Fees, formatInputAmount } from "@/core/fees";
import { toAlert } from "@/core/alerts";
import { evaluateRedeemAmount, evaluateRedeemQueue, RedemptionMapper } from "@/core/redeem";
import { FASSET_COIN } from "@/config/coin";
import { IFAssetCoin } from "@/types";
import { IRouteQuotePart } from "@/components/bridge/quotes/types";
import { useXrplDestinationChecks } from "@/components/bridge/quotes/useXrplDestinationChecks";
import { useGasBalanceCheck } from "@/components/bridge/quotes/useGasBalanceCheck";
import { formatUnit } from "@/utils";
import { redeemIssueMessage } from "@/components/bridge/quotes/redeemIssueMessages";

/**
 * Flare → XRPL: redeem FXRP to XRP. Same math as RedeemForm — redemption fee in bips is
 * taken from the amount, the executor fee is paid in the native token, max = balance
 * capped by what the redemption queue can serve. Validation = RedeemForm + RedeemModal.
 */
export function useRedeemQuote({
    amount,
    balance,
    destinationAddress,
    destinationTag,
    enabled,
}: {
    amount: number;
    balance?: number;
    destinationAddress?: string;
    destinationTag: string;
    enabled: boolean;
}): IRouteQuotePart {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const redemptionFee = useRedemptionFee(FASSET_COIN.type, enabled);
    const redemptionQueue = useRedemptionQueue(FASSET_COIN.type, enabled);
    const executor = useDirectMintingExecutor(FASSET_COIN.type, enabled);
    const destination = useXrplDestinationChecks({ address: destinationAddress, tag: destinationTag, enabled, keys: "redeem_modal" });
    // The executor fee is sent as msg.value — without enough native token the wallet rejects the tx
    const gas = useGasBalanceCheck({
        feeCoin: mainToken,
        fee: executor.data ? formatUnit(BigInt(executor.data.executorFee), 18) : undefined,
        enabled,
    });

    const limits = RedemptionMapper.toLimits(redemptionFee.data, redemptionQueue.data, FASSET_COIN);
    const redeemingFee = amount > 0 ? Fees.redeemingFee(amount, limits.feeBips) : undefined;

    const fees = useRedeemFees({
        fAssetCoin: FASSET_COIN as IFAssetCoin,
        mainToken,
        redeemingFee,
        amount,
        executorFee: executor.data?.executorFee,
    });

    const rulesInput = { amount, balance, limits };
    const queueIssues = enabled ? evaluateRedeemQueue(rulesInput) : [];
    const amountIssues = enabled ? evaluateRedeemAmount(rulesInput) : [];
    const message = redeemIssueMessage(t);
    const hasQueueIssue = queueIssues.length > 0;
    const queueMax = limits.queueMax;

    // The redemption queue can take less than the balance — that is what can be redeemed now
    const redeemable = FASSET_COIN.type.toLowerCase().includes("xrp") && balance !== undefined
        && queueMax !== undefined && queueMax < balance
        ? formatInputAmount(queueMax, FASSET_COIN.decimals)
        : undefined;

    return {
        fees,
        received: redeemingFee !== undefined ? amount - redeemingFee : undefined,
        maxAmount: RedemptionMapper.maxAmount(balance, limits),
        limit: redeemable ? { amount: redeemable, kind: "redeemable" } : undefined,
        isLoading: enabled && (redemptionFee.isPending || redemptionQueue.isPending || executor.isPending),
        // RedeemForm:240-245 — the executor goes into the redeem request
        submit: async () => executor.data
            ? { executorAddress: executor.data.executorAddress, executorFee: executor.data.executorFee }
            : undefined,
        validation: {
            // RedeemModal:502-518 render order: queue warning, depositAuth, required tag,
            // form (balance / min), tag not supported; then the queue max below the balance
            alerts: [
                ...queueIssues.map(issue => toAlert(issue, message)),
                destination.depositAuth,
                destination.requireDestTag,
                ...amountIssues.map(issue => toAlert(issue, message)),
                destination.tagNotSupported,
                gas.alert,
                redeemable
                    ? { msg: t("redeem_modal.form.current_max_redeemable_label", { amount: redeemable, token: FASSET_COIN.type }), type: "info" }
                    : undefined,
            ],
            // Limits are unknown until the balance and the queue are in — do not let it through meanwhile
            isBlocked: enabled && (
                balance === undefined
                || redemptionFee.isPending
                || redemptionQueue.isPending
                || [...queueIssues, ...amountIssues].some(issue => issue.blocking)
                || destination.isBlocked
                || gas.isBlocked
            ),
            input: {
                // TEMP hidden — how to show the minimum on the bridge page is open (TODO, Mitja);
                // the old RedeemForm used the placeholder `min is ${limits.min}`
                placeholder: undefined,
                hasError: hasQueueIssue,
            },
        },
    };
}
