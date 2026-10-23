import { FASSET_COIN } from "@/config/coin";
import { formatNumber, toNumber } from "@/utils";
import { formatCrossChainFee } from "@/core/fees/format";
import { buildFeeItem } from "@/core/fees/feeItem";
import { ICoin } from "@/types";
import { useTranslation } from "react-i18next";

interface BridgeXrplFeesProps {
    /**
     * The coin the LayerZero nativeFee is paid in — resolved by the caller from
     * `FEE_TOKEN_CHAIN[bridgeConfig.feeTokenKey]` (undefined chain = mainToken).
     */
    feeCoin?: ICoin;
    fee?: string;
    isLoading: boolean;
    totalFeeAmount?: number;
}

export function useBridgeXrplFees({
    feeCoin,
    fee,
    isLoading,
    totalFeeAmount,
}: BridgeXrplFeesProps) {
    const { t } = useTranslation();
    return [
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
                amount: totalFeeAmount && totalFeeAmount > 0 ? totalFeeAmount : null,
            },
            format: (n) => formatNumber(n, 4),
        }),
    ];
}
