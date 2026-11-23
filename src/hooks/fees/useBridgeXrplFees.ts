import { FASSET_COIN } from "@/config/coin";
import { formatNumber, toNumber } from "@/utils";
import { formatCrossChainFee } from "@/core/fees/format";
import { buildFeeItem } from "@/core/fees/feeItem";
import { ICoin } from "@/types";
import { useTranslation } from "react-i18next";

interface BridgeXrplFeesProps {
    /**
     * The coin the LayerZero nativeFee is paid in — resolved by the caller from
     * `bridgeConfig.feeChain` (undefined chain = mainToken).
     */
    feeCoin?: ICoin;
    fee?: string;
    isLoading: boolean;
    redemptionFeeAmount?: number;
    // In FXRP on the source chain — undefined = no row (composer fee 0)
    composerFee?: { amount: number; coin: ICoin };
}

export function useBridgeXrplFees({
    feeCoin,
    fee,
    isLoading,
    redemptionFeeAmount,
    composerFee,
}: BridgeXrplFeesProps) {
    const { t } = useTranslation();
    const items = [
        buildFeeItem({
            label: t("bridge_modal.form.cross_chain_fee_label"),
            token: feeCoin as ICoin,
            currencyName: feeCoin?.type,
            fee: { amount: fee ? toNumber(fee) : null, isLoading },
            // ETH needs more decimals than FLR/HYPE — see `feeDecimals` in types.ts.
            format: (n) => formatCrossChainFee(n, feeCoin?.feeDecimals),
        }),
        buildFeeItem({
            label: t("bridge_modal.form.redemption_fee_label"),
            token: FASSET_COIN,
            currencyName: FASSET_COIN.nativeName,
            fee: {
                amount: redemptionFeeAmount && redemptionFeeAmount > 0 ? redemptionFeeAmount : null,
            },
            format: (n) => formatNumber(n, 4),
        }),
    ];
    if (!composerFee) return items;

    return [
        ...items,
        // Kept by the redeem composer on Flare, in FXRP — not part of the redemption
        buildFeeItem({
            label: t("bridge_modal.form.composer_fee_label"),
            // Fee rows prefer `nativeIcon`, which on a bridge FXRP coin is the chain's gas coin (ETH)
            token: { ...composerFee.coin, nativeIcon: undefined },
            currencyName: composerFee.coin.type,
            fee: { amount: composerFee.amount > 0 ? composerFee.amount : null },
            format: (n) => formatNumber(n, 4),
        }),
    ];
}
