import { INativeBalance } from "@/types";

export const findBalanceBySymbol = (
    data: INativeBalance[] | undefined,
    symbol: string,
): INativeBalance | undefined => {
    return data?.find((b) => b.symbol.toLowerCase() === symbol.toLowerCase());
};
