import { groupBy, map } from "lodash-es";
import { COINS } from "@/config/coin";
import { IUserProgress } from "@/types";
import { ITransaction, ACTION_TYPE_MINT, ACTION_TYPE_REDEEM } from "./transactionTypes";

/**
 * User progress → table rows: mints as they are, redeems grouped by `txhash` into one row with
 * a ticket per agent. Shared by the Mint page table and the bridge table (fullHistory); not sorted.
 */
export function progressRows(data: IUserProgress[]): ITransaction[] {
    const mintTransactions: ITransaction[] = data.filter(transaction => transaction.action.toLowerCase() === ACTION_TYPE_MINT);
    const grouped = groupBy(data.filter(transaction => transaction.action.toLowerCase() === ACTION_TYPE_REDEEM), 'txhash');
    const redeemTransactions: ITransaction[] = map(grouped, (group) => ({
        ...group[0],
        tickets: group.map(item => {
            const coin = COINS.find(coin => coin.type.toLowerCase() === item.fasset.toLowerCase());
            return {
                ticketId: item.ticketID!,
                value: 'vaultToken' in item ? item.vaultTokenValueRedeemed! : item.underlyingPaid!,
                type: 'vaultToken' in item ? item.vaultToken! : coin?.nativeName!,
                status: item.status
            };
        })
    }));

    return [...mintTransactions, ...redeemTransactions];
}
