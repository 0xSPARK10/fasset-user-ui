import React, { useEffect, useState } from "react";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { orderBy } from "lodash-es";
import FAssetTable from "@/components/elements/FAssetTable";
import { useUserProgress } from "@/api/user";
import { useWeb3 } from "@/hooks/useWeb3";
import { IFAssetCoin } from "@/types";
import { useTransactionInvalidation } from "@/hooks/useTransactionInvalidation";
import { XRP_NAMESPACE } from "@/config/networks";
import {
    ITransaction,
    LATEST_TRANSACTIONS_REFRESH_INTERVAL,
} from "./transactionTypes";
import { useMintTransactionTable } from "./useMintTransactionTable";
import { progressRows } from "./progressRows";
import { useRetryMint } from "./useRetryMint";

interface IMintTransactionsCard {
    className?: string;
    refreshKey?: number;
    fAssetCoin?: IFAssetCoin;
}

export default function MintTransactionsCard({ className, refreshKey, fAssetCoin }: IMintTransactionsCard) {
    const [transactions, setTransactions] = useState<ITransaction[]>();
    const { mintingTransaction, onRetryMintClick, retryMintModal } = useRetryMint();
    const { t } = useTranslation();
    const { mainToken, connectedCoins } = useWeb3();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const xrpAddress = fAssetCoin?.network.namespace === XRP_NAMESPACE ? fAssetCoin.address : undefined;
    const userProgress = useUserProgress(mainToken?.address ?? '', mainToken !== undefined, xrpAddress);

    const fetchInterval = useInterval(() => {
        userProgress.refetch();
    }, LATEST_TRANSACTIONS_REFRESH_INTERVAL);

    useTransactionInvalidation({
        type: 'mint',
        address: mainToken?.address,
        data: userProgress.data,
    });

    useEffect(() => {
        userProgress.refetch();
    }, [refreshKey]);

    useEffect(() => {
        if (!userProgress.data) return;
        if (userProgress.data.length === 0) {
            setTransactions([]);
            return;
        }

        setTransactions(orderBy(progressRows(userProgress.data), ['timestamp'], 'desc'));
    }, [userProgress.data]);

    useEffect(() => {
        fetchInterval.start();
        return fetchInterval.stop;
    }, []);

    const { columns, renderAppendRow } = useMintTransactionTable({
        className,
        fAssetCoin,
        mintingTransaction,
        onRetryMintClick,
        isMobile: !!isMobile,
    });

    const tableKey = `${connectedCoins.map(coin => coin.type).sort().join(',')}-${Object.keys(mintingTransaction).join(',')}`;

    return (
        <>
            <FAssetTable
                key={tableKey}
                items={transactions ?? []}
                loading={userProgress.isPending}
                columns={columns}
                style={{ maxWidth: '1080px' }}
                emptyLabel={t('latest_transactions_card.empty_label')}
                pagination={true}
                perPage={10}
                scrollContainerWidth={500}
                mobileBreakPoint={768}
                appendColumn={renderAppendRow}
            />
            {retryMintModal}
        </>
    );
}
