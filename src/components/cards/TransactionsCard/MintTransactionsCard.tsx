import React, { useEffect, useRef, useState } from "react";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { groupBy, map, orderBy } from "lodash-es";
import FAssetTable from "@/components/elements/FAssetTable";
import { useUserProgress } from "@/api/user";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS } from "@/config/coin";
import { IFAssetCoin } from "@/types";
import RetryMintModal from "@/components/modals/RetryMintModal";
import { useTransactionInvalidation } from "@/hooks/useTransactionInvalidation";
import { XRP_NAMESPACE } from "@/config/networks";
import {
    ITransaction,
    IUnderlyingTransactionData,
    ACTION_TYPE_MINT,
    ACTION_TYPE_REDEEM,
    LATEST_TRANSACTIONS_REFRESH_INTERVAL,
} from "./transactionTypes";
import { useMintTransactionTable } from "./useMintTransactionTable";

interface IMintTransactionsCard {
    className?: string;
    refreshKey?: number;
    fAssetCoin?: IFAssetCoin;
}

export default function MintTransactionsCard({ className, refreshKey, fAssetCoin }: IMintTransactionsCard) {
    const [transactions, setTransactions] = useState<ITransaction[]>();
    const [mintingTransaction, setMintingTransaction] = useState<{ [id: string]: boolean }>({});
    const [isRetryMintModalActive, setIsRetryMintModalActive] = useState<boolean>(false);
    const underlyingTransaction = useRef<IUnderlyingTransactionData>();
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

        const mintTransactions: ITransaction[] = userProgress.data.filter(transaction => transaction.action.toLowerCase() === ACTION_TYPE_MINT);
        const grouped = groupBy(userProgress.data.filter(transaction => transaction.action.toLowerCase() === ACTION_TYPE_REDEEM), 'txhash');
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

        setTransactions(orderBy([...mintTransactions, ...redeemTransactions], ['timestamp'], 'desc'));
    }, [userProgress.data]);

    useEffect(() => {
        fetchInterval.start();
        return fetchInterval.stop;
    }, []);

    const { columns, renderAppendRow } = useMintTransactionTable({
        className,
        fAssetCoin,
        mintingTransaction,
        onRetryMintClick: (data) => {
            underlyingTransaction.current = data;
            setIsRetryMintModalActive(true);
        },
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
            {isRetryMintModalActive && underlyingTransaction.current &&
                <RetryMintModal
                    opened={isRetryMintModalActive}
                    onClose={(isMinting: boolean) => {
                        setIsRetryMintModalActive(false);
                        const id = underlyingTransaction.current?.paymentReference!;
                        if (isMinting && id) {
                            setMintingTransaction(prev => ({ ...prev, [id]: true }));
                            setTimeout(() => {
                                setMintingTransaction(prev => ({ ...prev, [id]: false }));
                            }, 30000);
                        }
                        underlyingTransaction.current = undefined;
                    }}
                    underlyingTransaction={underlyingTransaction.current}
                />
            }
        </>
    );
}
