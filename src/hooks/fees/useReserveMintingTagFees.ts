import { buildFeeItem } from "@/core/fees/feeItem";
import { ICoin } from "@/types";
import { formatNumber, formatUnit, toNumber } from "@/utils";
import { useTranslation } from "react-i18next";

interface ReserveMintingTagFeesProps {
    mainToken?: ICoin;
    reservationFee?: string;
}

export function useReserveMintingTagFees({
    mainToken,
    reservationFee,
}: ReserveMintingTagFeesProps) {
    const { t } = useTranslation();
    return [
        buildFeeItem({
            label: t("reserve_minting_tag_modal.reservation_fee_label"),
            token: mainToken as ICoin,
            currencyName: mainToken?.type,
            fee: {
                amount: reservationFee
                    ? toNumber(formatUnit(BigInt(reservationFee), 18))
                    : null,
            },
            format: (n) => formatNumber(n),
        }),
    ];
}
