import { ICoin } from "@/types";
import { ReactNode } from "react";
import { formatFeeAmount } from "./format";

export interface FeeValue {
    amount: number | null;
    isLoading?: boolean;
}

export interface FeeItem {
    label: ReactNode;
    token: ICoin;
    fee: FeeValue
    currencyName: ReactNode;
    format?: (amount: number) => string;
}

export function buildFeeItem({ label, token, fee, currencyName, format }: FeeItem):
    FeeItem {
    return {
        label,
        token,
        fee,
        currencyName,
        format: format ?? ((amount) => formatFeeAmount(amount, token.decimals))
    }
}
