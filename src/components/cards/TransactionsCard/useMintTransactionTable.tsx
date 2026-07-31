import React from "react";
import { IconInfoHexagon } from "@tabler/icons-react";
import Link from "next/link";
import { Text, Table, rem, Popover, lighten, Button, Tooltip, Anchor } from "@mantine/core";
import { Trans, useTranslation } from "react-i18next";
import moment from "moment";
import Badge from "@/components/elements/Badge";
import CopyIcon from "@/components/icons/CopyIcon";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS } from "@/config/coin";
import { toNumber, truncateString } from "@/utils";
import { CoinEnum, IFAssetCoin } from "@/types";
import { FASSETS_EXPLORER_URL } from "@/constants";
import { IFAssetColumn } from "@/components/elements/FAssetTable";
import classes from "@/styles/components/cards/LatestTransactionsCard.module.scss";
import {
    ITransaction,
    IUnderlyingTransactionData,
    ACTION_TYPE_MINT,
    ACTION_TYPE_REDEEM,
} from "./transactionTypes";

interface UseMintTransactionTableOptions {
    className?: string;
    fAssetCoin?: IFAssetCoin;
    mintingTransaction: { [id: string]: boolean };
    onRetryMintClick: (data: IUnderlyingTransactionData) => void;
    isMobile: boolean;
}

interface MintTransactionTable {
    columns: IFAssetColumn[];
    renderAppendRow: (item: ITransaction) => React.ReactNode;
}

export function useMintTransactionTable({
    className,
    fAssetCoin,
    mintingTransaction,
    onRetryMintClick,
    isMobile,
}: UseMintTransactionTableOptions): MintTransactionTable {
    const { t } = useTranslation();
    const { mainToken, getConnectedCoin } = useWeb3();

    const renderTimestamp = (progress: ITransaction) => {
        const isTryAgainButtonVisible = progress.missingUnderlying &&
            progress?.underlyingTransactionData?.paymentReference &&
            (!mintingTransaction[progress.underlyingTransactionData.paymentReference] ||
                mintingTransaction[progress.underlyingTransactionData.paymentReference] === false
            );

        if (isTryAgainButtonVisible) {
            return <div className="flex min-h-[30px] items-center">
                <Text className="text-14" fw={400}>
                    {moment(progress.timestamp).format('DD.MM.YYYY HH:mm')}
                </Text>
            </div>
        }

        if (progress.action.toLowerCase() === ACTION_TYPE_REDEEM) {
            return <div className="h-[26px] flex items-center">
                <Text className="text-14" fw={400}>
                    {moment(Number(progress.timestamp)).format('DD.MM.YYYY HH:mm')}
                </Text>
            </div>;
        }

        return <Text className="text-14" fw={400}>
            {moment(Number(progress.timestamp)).format('DD.MM.YYYY HH:mm')}
        </Text>;
    };

    const renderTransaction = (progress: ITransaction) => {
        const isHash = /^0x[a-fA-F0-9]{64}$/.test(progress.txhash) || /^[A-F0-9]{64}$/.test(progress.txhash);

        let href = progress.evm_txhash == null
            ? `${fAssetCoin?.network.explorerTxUrl}/${progress.txhash}`
            : `${FASSETS_EXPLORER_URL}/tx/${progress.evm_txhash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`;

        const isTryAgainDisabled = getConnectedCoin(progress.fasset as CoinEnum) === undefined;
        const showTryAgainButton = isHash && progress.missingUnderlying &&
            progress?.underlyingTransactionData?.paymentReference &&
            (!mintingTransaction[progress.underlyingTransactionData.paymentReference] ||
                mintingTransaction[progress.underlyingTransactionData.paymentReference] === false
            );

        const txHash = progress.evm_txhash == null ? progress.txhash : progress.evm_txhash;

        if (progress.action.toLowerCase() === ACTION_TYPE_REDEEM) {
            href = `${FASSETS_EXPLORER_URL}/tx/${progress.txhash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`;
        }

        const isRedeem = progress.action.toLowerCase() === ACTION_TYPE_REDEEM;
        return <div className={`flex max-[768px]:flex-wrap text-wrap items-center ${isRedeem ? 'min-h-[26px]' : ''} ${className ?? ''}`}>
            {!isHash
                ? <span>{
                    progress.defaulted ? t('latest_transactions_card.defaulted_label') : progress.txhash}
                </span>
                : showTryAgainButton
                    ? <Trans
                        i18nKey="latest_transactions_card.reserved_collateral_label"
                        components={{
                            a: <Anchor
                                underline="always"
                                href={href}
                                target="_blank"
                                className="text-14 text-[var(--flr-black)]"
                            />
                        }}
                        parent={Text}
                        className="text-14 whitespace-nowrap mr-2"
                    />
                    : <Link
                        href={href}
                        target="_blank"
                        className="text-14 underline font-normal"
                    >
                        <span className="hidden sm:block">{truncateString(txHash ?? "", 24, 24)}</span>
                        <span className="block sm:hidden">{truncateString(txHash ?? "", 7, 7)}</span>
                    </Link>
            }
            {isHash && !showTryAgainButton &&
                <CopyIcon
                    text={txHash}
                    color="var(--mantine-color-gray-5)"
                    className="mr-2"
                />
            }
            {showTryAgainButton &&
                <Tooltip
                    label={t('latest_transactions_card.connect_tooltip')}
                    withArrow
                    disabled={!isTryAgainDisabled}
                >
                    <Button
                        variant="gradient"
                        size="xs"
                        radius="xl"
                        fw={400}
                        disabled={isTryAgainDisabled}
                        onClick={() => {
                            onRetryMintClick({
                                ...progress.underlyingTransactionData,
                                fAsset: progress.fasset,
                                fAssetAmount: progress.amount
                            });
                        }}
                        className="sm:ml-auto px-2"
                    >
                        {t('latest_transactions_card.try_again_button')}
                    </Button>
                </Tooltip>
            }
        </div>
    };

    const renderAction = (progress: ITransaction) => {
        const coin = COINS.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase());

        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            return <div>
                <Text className="text-14" fw={400}>
                    {t('latest_transactions_card.mint_label')}
                </Text>
                {progress.directMinting && progress.directMintingStatus === 'DELAYED' && progress.delayTimestamp &&
                    <div className="flex items-baseline mt-1">
                        <Text className="text-10 mr-1 whitespace-nowrap" fw={400} c="var(--flr-gray)">
                            {t('latest_transactions_card.delayed_until_label')}
                        </Text>
                        <Text className="text-14" fw={400}>
                            {moment.unix(progress.delayTimestamp).format('D.M.YYYY HH:mm')}
                        </Text>
                    </div>
                }
            </div>;
        }

        return <div className="flex flex-col gap-2">
            {progress.remainingLots !== null && progress.remainingLots !== undefined &&
                <Text className="text-14 flex items-center h-[26px]" fw={400}>
                    <span className="flex-shrink-0">{t('latest_transactions_card.partial_redeem_label')}</span>
                    <Popover
                        withArrow
                        width="auto"
                    >
                        <Popover.Target>
                            <IconInfoHexagon
                                style={{ width: rem(16), height: rem(16) }}
                                color="var(--flr-border-color)"
                                className="ml-1 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                            />
                        </Popover.Target>
                        <Popover.Dropdown>
                            <div className="flex items-center justify-between min-w-48 mb-4">
                                <Text className="text-12 mr-2" fw={400}>
                                    {t('latest_transactions_card.requested_label')}
                                </Text>
                                <div className="flex items-center">
                                    {coin && coin.icon && coin.icon({ width: "18", height: "18" })}
                                    <Text className="text-12 mx-2" fw={400}>
                                        {toNumber(progress.amount) + (toNumber(progress.remainingLots) * coin?.lotSize!)}
                                    </Text>
                                    <Text
                                        className="text-12"
                                        c={lighten('var(--flr-gray)', 0.67)}
                                        fw={400}
                                    >
                                        {progress.fasset}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex items-center justify-between min-w-48">
                                <Text className="text-12 mr-2" fw={400}>
                                    {t('latest_transactions_card.completed_label')}
                                </Text>
                                <div className="flex items-center">
                                    {coin && coin.icon && coin.icon({ width: "18", height: "18" })}
                                    <Text className="text-12 mx-2" fw={400}>
                                        {progress.amount}
                                    </Text>
                                    <Text
                                        className="text-12"
                                        c={lighten('var(--flr-gray)', 0.67)}
                                        fw={400}
                                    >
                                        {progress.fasset}
                                    </Text>
                                </div>
                            </div>
                        </Popover.Dropdown>
                    </Popover>
                </Text>
            }
            {progress.remainingLots == null &&
                <div className="h-[26px] flex items-center">
                    <Text className="text-14" fw={400}>
                        {t('latest_transactions_card.redeem_label')}
                    </Text>
                </div>
            }
            {progress?.tickets?.map((ticket, index) => (
                <div className="hidden md:flex items-baseline" key={`${ticket.ticketId}-${index}`}>
                    <Text
                        c="var(--flr-gray)"
                        className="text-10 mr-1 flex-shrink-0"
                    >
                        {t('latest_transactions_card.table.ticket_id_label')}
                    </Text>
                    <Text
                        className="text-14"
                        fw={400}
                    >
                        {ticket.ticketId}
                    </Text>
                </div>
            ))}
        </div>
    };

    const renderAmount = (progress: ITransaction) => {
        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            const isDelayed = progress.directMintingStatus === 'DELAYED';
            return <div className={`flex ${isDelayed ? 'items-start' : 'items-center'} md:justify-end h-[26px]`}>
                <Text className="text-14 mr-1" fw={400}>{progress.amount}</Text>
                <Text c="var(--flr-gray)" className="text-14 w-16" fw={400}>{progress.fasset}</Text>
            </div>
        }

        return <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center whitespace-nowrap h-[26px]">
                <Text className="text-14 mr-1" fw={400}>{progress.amount}</Text>
                <Text c="var(--flr-gray)" className="text-14 w-16" fw={400}>{progress.fasset}</Text>
            </div>
            {progress?.tickets?.map((ticket, index) => (
                ticket.value
                    ? <div className="hidden md:flex items-center whitespace-nowrap" key={`${ticket.ticketId}-${index}`}>
                        <Text className="text-14 mr-1" fw={400}>{ticket.value}</Text>
                        <Text c="var(--flr-gray)" className="text-14 w-16">{ticket.type}</Text>
                    </div>
                    : null
            ))}
        </div>
    };

    const renderStatus = (progress: ITransaction) => {
        if (progress.directMinting && progress.directMintingStatus === 'DELAYED') {
            return <Badge variant="status" dotColor="var(--flr-sky)" bgColor="var(--flr-sky)" size="md" className="font-normal">
                {t('latest_transactions_card.delayed_label')}
            </Badge>
        }

        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            const dotColor = progress.defaulted ? 'var(--flr-pink)' : (progress.status ? 'var(--flr-green)' : 'var(--flr-warning)');
            const bgColor = progress.defaulted ? 'rgba(230, 30, 87, 0.13)' : (progress.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)');
            return <Badge variant="status" dotColor={dotColor} bgColor={bgColor} size="md" className="font-normal">
                {t(`latest_transactions_card.${progress.defaulted ? 'defaulted_label' : (progress.status ? 'finished_label' : 'in_progress_label')}`)}
            </Badge>
        }

        if (progress.action.toLowerCase() === ACTION_TYPE_REDEEM && !progress.tickets?.length) {
            return <div className="flex items-center h-[26px]">
                <Badge
                    variant="status"
                    dotColor={progress.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                    bgColor={progress.defaulted ? 'rgba(230, 30, 87, 0.13)' : (progress.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)')}
                    size="md"
                    className="font-normal"
                >
                    {t(`latest_transactions_card.${progress.status ? 'finished_label' : 'in_progress_label'}`)}
                </Badge>
            </div>
        }

        return <div className="flex flex-col gap-2">
            {progress?.tickets?.length ? (
                <>
                    <div className="h-[26px]" />
                    {progress.tickets.map((ticket, index) => (
                        <Badge
                            variant="status"
                            dotColor={ticket.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                            bgColor={ticket.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                            size="md"
                            key={`${ticket.ticketId}-${index}`}
                            className="flex"
                        >
                            {t(`latest_transactions_card.${ticket.status ? 'finished_label' : 'in_progress_label'}`)}
                        </Badge>
                    ))}
                </>
            ) : null}
        </div>;
    };

    const renderAppendRow = (item: ITransaction) => {
        if (item.action.toLowerCase() === ACTION_TYPE_MINT) {
            return <Table.Tr>
                <Table.Td
                    className="font-normal !text-12 uppercase !align-top"
                    style={{
                        color: 'rgba(119, 119, 119, 1)',
                        backgroundColor: 'rgba(251, 251, 251, 1)',
                        borderBottom: '1px solid rgba(231, 231, 231, 1)'
                    }}
                >
                    {t('latest_transactions_card.table.status_label')}
                </Table.Td>
                <Table.Td>
                    <Badge
                        variant="status"
                        dotColor={item.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                        bgColor={item.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                        size="md"
                        className="font-normal"
                    >
                        {t(`latest_transactions_card.${item.status ? 'finished_label' : 'in_progress_label'}`)}
                    </Badge>
                </Table.Td>
            </Table.Tr>;
        }

        return item?.tickets?.map((ticket, index) => (
            <Table.Tr key={`${ticket.ticketId}-${index}`}>
                <Table.Td
                    className="font-normal !text-12 uppercase !align-top"
                    style={{
                        color: 'rgba(119, 119, 119, 1)',
                        backgroundColor: 'rgba(251, 251, 251, 1)',
                        borderBottom: '1px solid rgba(231, 231, 231, 1)'
                    }}
                >
                    {t('latest_transactions_card.table.ticket_id_label')}
                </Table.Td>
                <Table.Td>
                    <div className="flex items-center justify-between">
                        <Text className="text-14" fw={400}>{ticket.ticketId}</Text>
                        <Badge
                            variant="status"
                            dotColor={ticket.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                            bgColor={ticket.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                            size="md"
                            className="font-normal"
                        >
                            {t(`latest_transactions_card.${ticket.status ? 'finished_label' : 'in_progress_label'}`)}
                        </Badge>
                    </div>
                    <div className="flex items-center mt-1">
                        <Text className="text-14 mr-1" fw={400}>{ticket.value}</Text>
                        <Text c="var(--flr-gray)" className="text-14 w-16">{ticket.type}</Text>
                    </div>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const columns: IFAssetColumn[] = isMobile
        ? [
            {
                id: 'timestamp',
                label: t('latest_transactions_card.table.date_label'),
                thClass: `${classes.fitWidth} align-middle !text-12`,
                tdClass: `${classes.fitWidth} !align-top`,
                render: renderTimestamp,
            },
            {
                id: 'transaction',
                label: t('latest_transactions_card.table.transaction_label'),
                thClass: `align-middle ${classes.fitWidth} !text-12`,
                tdClass: `!align-top ${classes.fitWidth}`,
                render: renderTransaction,
            },
            {
                id: 'action',
                label: t('latest_transactions_card.table.type_label'),
                thClass: 'pl-4 !text-12',
                tdClass: 'pl-4',
                render: renderAction,
            },
            {
                id: 'amount',
                label:
                    <div className="md:flex">
                        <Text className="text-12">{t('latest_transactions_card.table.amount_label')}</Text>
                        <div className="md:w-16" />
                    </div>,
                thClass: `${classes.fitWidth} !text-12`,
                tdClass: classes.fitWidth,
                thInnerClass: 'justify-end',
                tdInnerClass: 'justify-end',
                render: renderAmount,
            },
        ]
        : [
            {
                id: 'timestamp',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.date_label')}
                </Text>,
                thClass: classes.fitWidth,
                tdClass: (item: ITransaction) => `${classes.fitWidth}${item.action.toLowerCase() === ACTION_TYPE_REDEEM ? ' !align-top' : ''}`,
                render: renderTimestamp,
            },
            {
                id: 'transaction',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.transaction_label')}
                </Text>,
                thClass: classes.fitWidth,
                tdClass: (item: ITransaction) => `${classes.fitWidth}${item.action.toLowerCase() === ACTION_TYPE_REDEEM ? ' !align-top' : ''}`,
                render: renderTransaction,
            },
            {
                id: 'action',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.type_label')}
                </Text>,
                thClass: 'pl-8',
                tdClass: (item: ITransaction) => `pl-8${item.directMinting && item.directMintingStatus === 'DELAYED' ? ' !align-top' : ''}`,
                render: renderAction,
            },
            {
                id: 'amount',
                label: <div className="md:flex">
                    <Text className="text-12" fw={400} c="var(--flr-gray)">
                        {t('latest_transactions_card.table.amount_label')}
                    </Text>
                    <div className="md:w-16" />
                </div>,
                thClass: classes.fitWidth,
                tdClass: (item: ITransaction) => item.directMinting && item.directMintingStatus === 'DELAYED' ? '!align-top' : '',
                thInnerClass: 'justify-end',
                tdInnerClass: 'justify-end',
                render: renderAmount,
            },
            {
                id: 'status',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.status_label')}
                </Text>,
                thClass: 'min-w-28',
                tdClass: (item: ITransaction) => `min-w-28${item.directMinting && item.directMintingStatus === 'DELAYED' ? ' !align-top' : ''}`,
                render: renderStatus,
            },
        ];

    return { columns, renderAppendRow };
}
