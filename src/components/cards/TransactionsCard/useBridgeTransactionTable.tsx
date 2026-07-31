import React from "react";
import { IconArrowNarrowRight, IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { Text, Table } from "@mantine/core";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Badge from "@/components/elements/Badge";
import CopyIcon from "@/components/icons/CopyIcon";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import { useWeb3 } from "@/hooks/useWeb3";
import { BRIDGE_FASSET_COIN, COINS } from "@/config/coin";
import { bridgeChainFromEid } from "@/config/bridge";
import { toNumber, truncateString } from "@/utils";
import { FASSETS_EXPLORER_URL, IS_MAINNET } from "@/constants";
import { IFAssetColumn } from "@/components/elements/FAssetTable";
import classes from "@/styles/components/cards/LatestTransactionsCard.module.scss";
import {
    IBridgeTransaction,
    ACTION_TYPE_REDEEM,
    ACTION_TYPE_SEND,
    ACTION_TYPE_RECEIVE,
    ACTION_TYPE_REDEEM_FAIL,
} from "./transactionTypes";

interface UseBridgeTransactionTableOptions {
    className?: string;
    isMobile: boolean;
}

interface BridgeTransactionTable {
    columns: IFAssetColumn[];
    renderAppendRow: (item: IBridgeTransaction) => React.ReactNode;
}

/**
 * The FXRP icon of the remote chain a transfer's counterparty lives on, read from
 * `BRIDGE_FASSET_COIN` so the badged icon per chain stays defined in one place. `eid`
 * from the bridge history always refers to the non-Flare side of the route, so Flare
 * needs no entry; HyperEVM stays the fallback for an unrecognised eid.
 */
function remoteChainIcon(eid: number) {
    const chain = bridgeChainFromEid(eid);
    const coin = chain ? BRIDGE_FASSET_COIN[chain] : undefined;

    return coin
        ? coin.icon({ width: '26', height: '26' })
        : <FXrpHypeEVMIcon width={'26'} height={'26'} />;
}

export function useBridgeTransactionTable({
    className,
    isMobile,
}: UseBridgeTransactionTableOptions): BridgeTransactionTable {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();

    const renderTimestamp = (progress: IBridgeTransaction) => {
        return <Text className="text-14 pt-[5px]" fw={400}>
            {moment(Number(progress.timestamp)).format('DD.MM.YYYY HH:mm')}
        </Text>;
    };

    const renderTransaction = (progress: IBridgeTransaction) => {
        const isHash = /^0x[a-fA-F0-9]{64}$/.test(progress.txhash) || /^[A-F0-9]{64}$/.test(progress.txhash);
        const action = progress.action.toLowerCase();
        const isRedeemAction = action === ACTION_TYPE_REDEEM || action === ACTION_TYPE_REDEEM_FAIL;

        // Both branches take the network from the build: a testnet deployment queries a
        // testnet backend, so a record from the other network cannot appear here.
        const href = isRedeemAction
            ? `${FASSETS_EXPLORER_URL}/tx/${progress.txhash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`
            : IS_MAINNET
                ? `https://layerzeroscan.com/tx/${progress.txhash}`
                : `https://testnet.layerzeroscan.com/tx/${progress.txhash}`;

        return <div className={`flex max-[768px]:flex-wrap text-wrap items-center pt-[5px] ${className ?? ''}`}>
            <Link
                href={href}
                target="_blank"
                className="text-14 underline font-normal"
            >
                <span className="hidden sm:block">{truncateString(progress.txhash, 24, 24)}</span>
                <span className="block sm:hidden">{truncateString(progress.txhash, 7, 7)}</span>
            </Link>
            {isHash &&
                <CopyIcon text={progress.txhash} color="var(--mantine-color-gray-5)" />
            }
        </div>
    };

    const renderAction = (progress: IBridgeTransaction) => {
        const coin = COINS.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase());
        const action = progress.action.toLowerCase();
        const isRedeemFail = action === ACTION_TYPE_REDEEM_FAIL;
        const isRedeem = action === ACTION_TYPE_REDEEM;
        return (
            <div className="flex flex-col items-flex-start">
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center">
                        {action === ACTION_TYPE_SEND || isRedeemFail
                            ? coin?.icon({ width: '26', height: '26' })
                            : remoteChainIcon(progress.eid)
                        }
                        <IconArrowNarrowRight size={20} className="mx-2" />
                        {action === ACTION_TYPE_RECEIVE
                            ? coin?.icon({ width: '26', height: '26' })
                            : isRedeemFail || isRedeem
                                ? <XrpIcon width={'26'} height={'26'} />
                                : progress.toHypercore
                                    ? <FXrpHypeCoreIcon width={'26'} height={'26'} />
                                    : remoteChainIcon(progress.eid)
                        }
                    </div>
                    {isRedeemFail &&
                        <Text c="var(--flr-gray)" fw={400} className="text-10">
                            {t('latest_transactions_card.redemption_failed_label')}
                        </Text>
                    }
                    {isRedeem && progress.tickets &&
                        progress.tickets.map((ticket, index) => (
                            <div className="hidden md:flex items-baseline" key={`${ticket.ticketId}-${index}`}>
                                <Text c="var(--flr-gray)" className="text-10 mr-1 flex-shrink-0">
                                    {t('latest_transactions_card.table.ticket_id_label')}
                                </Text>
                                <Link
                                    href={`${FASSETS_EXPLORER_URL}/tx/${progress.txhash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`}
                                    target="_blank"
                                    className="text-14 underline font-normal flex items-center"
                                >
                                    {ticket.ticketId}
                                    <IconArrowUpRight size={14} className="ml-0.5" />
                                </Link>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    };

    const renderAmount = (progress: IBridgeTransaction) => {
        if ([ACTION_TYPE_SEND, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM_FAIL].includes(progress.action.toLowerCase())) {
            return <div className="flex items-center md:justify-end h-[26px]">
                <Text className="text-14 mr-1" fw={400}>{progress.amount}</Text>
                <Text c="var(--flr-gray)" className="text-14 w-16" fw={400}>{progress.fasset}</Text>
            </div>
        }

        const coin = COINS.find(c => c.type.toLowerCase() === progress.fasset.toLowerCase());
        const isPartial = progress.incomplete && progress.remainingLots;
        const totalRequested = isPartial
            ? toNumber(progress.amount) + (toNumber(progress.remainingLots ?? '0') * (coin?.lotSize ?? 0))
            : null;

        return <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center whitespace-nowrap h-[26px]">
                <Text className="text-14 mr-1" fw={400}>
                    {isPartial
                        ? `${progress.amount} (of ${totalRequested?.toLocaleString('en-US')})`
                        : progress.amount
                    }
                </Text>
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

    const renderStatus = (progress: IBridgeTransaction) => {
        const action = progress.action.toLowerCase();
        if ([ACTION_TYPE_SEND, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM_FAIL].includes(action)
            || (action === ACTION_TYPE_REDEEM && !progress.tickets?.length)) {
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

    const renderAppendRow = (item: IBridgeTransaction) => {
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
                label: t('latest_transactions_card.table.bridge_label'),
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
                tdClass: `${classes.fitWidth} !align-top`,
                render: renderTimestamp,
            },
            {
                id: 'transaction',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.transaction_label')}
                </Text>,
                thClass: `min-w-[350px] ${classes.fitWidth} !align-top`,
                tdClass: `min-w-[350px] ${classes.fitWidth} !align-top`,
                render: renderTransaction,
            },
            {
                id: 'action',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.bridge_label')}
                </Text>,
                thClass: 'pl-8 min-w-[200px] !align-top',
                tdClass: 'pl-8 min-w-[200px] !align-top',
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
                thClass: `${classes.fitWidth} min-w-[200px] !align-top`,
                tdClass: 'min-w-[200px] !align-top',
                thInnerClass: 'justify-end',
                tdInnerClass: 'justify-end',
                render: renderAmount,
            },
            {
                id: 'status',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.status_label')}
                </Text>,
                thClass: 'min-w-28 !align-top',
                tdClass: 'min-w-28 !align-top',
                render: renderStatus,
            },
        ];

    return { columns, renderAppendRow };
}
