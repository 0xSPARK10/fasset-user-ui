import { buildFeeItem } from "@/core/fees/feeItem";
import { ICoin, IFAssetCoin } from "@/types";
import { useTranslation } from "react-i18next";

interface RedeemFeesProps {
    fAssetCoin: IFAssetCoin;
    mainToken?: ICoin;
    redeemingFee?: number;
    amount?: number;
    executorFee?: string;
}

export function useRedeemFees({
    fAssetCoin,
    mainToken,
    redeemingFee,
    amount,
    executorFee,
}: RedeemFeesProps) {
    const { t } = useTranslation();
    return [
        buildFeeItem({
            label: t("redeem_modal.form.redeeming_fee_label"),
            token: fAssetCoin,
            currencyName: fAssetCoin.nativeName,
            fee: { amount: redeemingFee ? redeemingFee : null },
        }),
        buildFeeItem({
            label: t("redeem_modal.form.executor_fee_label"),
            token: mainToken as ICoin,
            currencyName: mainToken?.type,
            fee: {
                amount: amount && executorFee ? Number(executorFee) / 1e18 : null,
            },
            format: (n) =>
                n.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
        }),
    ];
}
