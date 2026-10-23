import { buildFeeItem } from "@/core/fees/feeItem";
import { IFAssetCoin } from "@/types";
import { useTranslation } from "react-i18next";

interface MintFeesProps {
    fAssetCoin: IFAssetCoin;
    totalFees?: number;
    isLoading: boolean;
}

export function useMintFees({ fAssetCoin, totalFees, isLoading }: MintFeesProps) {
    const { t } = useTranslation();
    return [
        buildFeeItem({
            label: t("mint_modal.form.minting_fee_label"),
            token: fAssetCoin,
            currencyName: fAssetCoin.nativeName,
            fee: { amount: totalFees ?? null, isLoading },
        }),
    ];
}
