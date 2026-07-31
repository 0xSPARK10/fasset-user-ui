import React, { useEffect, useState } from "react";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { groupBy, map, orderBy } from "lodash-es";
import FAssetTable from "@/components/elements/FAssetTable";
import { useUserHistory } from "@/api/oft";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS } from "@/config/coin";
import { useTransactionInvalidation } from "@/hooks/useTransactionInvalidation";
import {
    IBridgeTransaction,
    ACTION_TYPE_REDEEM,
    LATEST_TRANSACTIONS_REFRESH_INTERVAL,
} from "./transactionTypes";
import { useBridgeTransactionTable } from "./useBridgeTransactionTable";

interface IBridgeTransactionsCard {
    className?: string;
    refreshKey?: number;
}

export default function BridgeTransactionsCard({ className, refreshKey }: IBridgeTransactionsCard) {
    const [bridgeTransactions, setBridgeTransactions] = useState<IBridgeTransaction[]>();
    const { t } = useTranslation();
    const { mainToken, connectedCoins } = useWeb3();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const oftUserHistory = useUserHistory(mainToken?.address ?? '', mainToken !== undefined);

    const fetchInterval = useInterval(() => {
        oftUserHistory.refetch();
    }, LATEST_TRANSACTIONS_REFRESH_INTERVAL);

    useTransactionInvalidation({
        type: 'bridge',
        address: mainToken?.address,
        data: oftUserHistory.data,
    });

    useEffect(() => {
        oftUserHistory.refetch();
    }, [refreshKey]);

    useEffect(() => {
        if (!oftUserHistory.data) return;
        if (oftUserHistory.data.length === 0) {
            setBridgeTransactions([]);
            return;
        }

        const redeemItems = oftUserHistory.data.filter(item => item.action.toLowerCase() === ACTION_TYPE_REDEEM);
        const nonRedeemItems: IBridgeTransaction[] = oftUserHistory.data.filter(item => item.action.toLowerCase() !== ACTION_TYPE_REDEEM);

        const grouped = groupBy(redeemItems, 'txhash');
        const redeemTransactions: IBridgeTransaction[] = map(grouped, (group) => {
            const coin = COINS.find(c => c.type.toLowerCase() === group[0].fasset.toLowerCase());
            return {
                ...group[0],
                tickets: group.map(item => ({
                    ticketId: item.ticketID,
                    value: item.underlyingPaid,
                    type: coin?.nativeName!,
                    status: item.status
                }))
            };
        });

        setBridgeTransactions(orderBy([...nonRedeemItems, ...redeemTransactions], ['timestamp'], 'desc'));
    }, [oftUserHistory.data]);

    useEffect(() => {
        fetchInterval.start();
        return fetchInterval.stop;
    }, []);

    const { columns, renderAppendRow } = useBridgeTransactionTable({ className, isMobile: !!isMobile });

    const tableKey = connectedCoins.map(coin => coin.type).sort().join(',');

    return (
        <FAssetTable
            key={tableKey}
            items={bridgeTransactions ?? []}
            loading={oftUserHistory.isPending}
            columns={columns}
            style={{ maxWidth: '1080px' }}
            emptyLabel={t('latest_transactions_card.empty_label')}
            pagination={true}
            perPage={10}
            scrollContainerWidth={500}
            mobileBreakPoint={768}
            appendColumn={renderAppendRow}
        />
    );
}
