import { buildFeeItem } from "@/core/fees/feeItem";
import { ICoin } from "@/types";
import { formatNumber } from "@/utils";
import { useTranslation } from "react-i18next";

interface NativeFeeProps {
    /** i18n key for the fee row label. */
    labelKey: string;
    mainToken?: ICoin;
    /** Fee in display units; null/0 → dash. */
    fee?: number;
    /** Async estimate still running → spinner. */
    isLoading: boolean;
    /** When `requireAmount`, the fee shows only once a positive `amount` is entered. */
    amount?: number;
    requireAmount?: boolean;
    /** Decimal places for the displayed value. */
    decimals?: number;
}

/**
 * Single native-token (gas) fee row shared by the pool/transfer/debt forms,
 * which differ only in label, loading source, decimals and the amount guard.
 */
export function useNativeFee({
    labelKey,
    mainToken,
    fee,
    isLoading,
    amount,
    requireAmount = false,
    decimals = 4,
}: NativeFeeProps) {
    const { t } = useTranslation();
    const show = requireAmount ? !!(amount && fee) : !!fee;
    return [
        buildFeeItem({
            label: t(labelKey),
            token: mainToken as ICoin,
            currencyName: mainToken?.type,
            fee: { amount: show ? fee! : null, isLoading },
            format: (n) => formatNumber(n, decimals),
        }),
    ];
}
