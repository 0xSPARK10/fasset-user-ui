import { formatCrossChainFee } from "@/core/fees/format";
import { toNumber } from "@/utils";
import { buildFeeItem, FeeItem } from "@/core/fees/feeItem";
import { ICoin } from "@/types";
import { useTranslation } from "react-i18next";

interface BridgeFeesProps {
    /**
     * The coin the LayerZero nativeFee is paid in — resolved by the caller from
     * `FEE_TOKEN_CHAIN[bridgeConfig.feeTokenKey]` (undefined chain = mainToken).
     */
    feeCoin?: ICoin;
    fee?: string;
    isLoading: boolean;
}

export function useBridgeFees({
    feeCoin,
    fee,
    isLoading
}: BridgeFeesProps): FeeItem[] {
    const { t } = useTranslation();
    return [
        buildFeeItem({
            label: t("bridge_modal.form.cross_chain_fee_label"),
            token: feeCoin as ICoin,
            currencyName: feeCoin?.type,
            fee: { amount: fee ? toNumber(fee) : null, isLoading },
            // ETH needs more decimals than FLR/HYPE — see `feeDecimals` in types.ts.
            format: (n) => formatCrossChainFee(n, feeCoin?.feeDecimals),
        })
    ]
}
