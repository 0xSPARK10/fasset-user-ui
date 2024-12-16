import React, { useEffect, useState } from "react";
import { IconInfoHexagon } from "@tabler/icons-react";
import Link from "next/link";
import { Text, Badge, Table, rem, Popover, lighten } from "@mantine/core";
import {useInterval, useMediaQuery} from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import moment from "moment";
import FAssetTable, { IFAssetColumn } from "@/components/elements/FAssetTable";
import { useUserProgress } from "@/api/user";
import { IUserProgress } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS } from "@/config/coin";
import CopyIcon from "@/components/icons/CopyIcon";
import { toNumber, truncateString } from "@/utils";
import { groupBy, map } from "lodash-es";
import classes from "@/styles/components/cards/LatestTransactionsCard.module.scss";

interface ILatestTransactionsCard {
    className?: string;
}

interface ITransaction extends IUserProgress {
    tickets: {
        ticketId: string;
        value: string;
        type: string;
        status: boolean;
    }[]
}

const USER_PROGRESS_FETCH_INTERVAL = 60000;

const ACTION_TYPE_MINT = 'mint';
const ACTION_TYPE_REDEEM = 'redeem';

export default function LatestTransactionsCard({ className }: ILatestTransactionsCard) {
    const [transactions, setTransactions] = useState<ITransaction[]>();
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const userProgressFetchInterval = useInterval(() => {
        userProgress.refetch();
    }, USER_PROGRESS_FETCH_INTERVAL);

    const userProgress = useUserProgress(mainToken?.address ?? '', mainToken !== undefined);
    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');

    useEffect(() => {
        if (!userProgress.data) return;
        if (userProgress.data.length === 0) {
            setTransactions([]);
            return;
        }
        const grouped = groupBy(userProgress.data, 'txhash');
        const items: ITransaction[] = map(grouped, (group, key) => {
            return {
                ...group[0],
                tickets: group.map(item => {
                    const coin = COINS.find(coin => coin.type.toLowerCase() === item.fasset.toLowerCase());

                    return {
                        ticketId: item.ticketID!,
                        value: 'vaultToken' in item ? item.vaultTokenValueRedeemed! : item.underlyingPaid,
                        type: 'vaultToken' in item ? item.vaultToken! : coin?.nativeName!,
                        status: item.status
                    }
                })
            }
        });

        setTransactions(items);
    }, [userProgress.data]);

    const renderTimestamp = (progress: ITransaction) => {
        return <Text
            className="text-14"
            fw={400}
        >
            {moment(progress.timestamp).format('DD.MM.YYYY HH:mm')}
        </Text>;
    }

    const renderTransaction = (progress: ITransaction) => {
        let href = progress.action.toLowerCase() === ACTION_TYPE_REDEEM
            ? `${mainToken?.network.explorerUrl}/tx/${progress.txhash}`
            : undefined;

        if (href === undefined) {
            const coin = COINS.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase());
            href = coin
                ? `${coin?.network?.explorerUrl}/${coin.nativeName?.toLowerCase() === 'xrp' ? 'transactions/' : 'tx/'}${progress.txhash}`
                : '#';
        }

        return <div className="flex items-center">
            <Link
                href={href}
                target="_blank"
                className="text-14 underline font-normal"
            >
                <span className="hidden sm:block">{progress.txhash}</span>
                <span className="block sm:hidden">{truncateString(progress.txhash, 7, 7)}</span>
            </Link>
            <CopyIcon text={progress.txhash} color="var(--mantine-color-gray-5)" />
        </div>
    }

    const renderAction = (progress: ITransaction) => {
        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            return <Text
                className="text-14"
                fw={400}
            >
                {t('latest_transactions_card.mint_label')}
            </Text>;
        }

        const coin = COINS.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase());
        return <div>
            {progress.remainingLots !== null &&
                <Text className="text-14 mb-2 flex items-center" fw={400}>
                    <span className="flex-shrink-0">{t('latest_transactions_card.partial_redeem_label')}</span>
                    <Popover
                        withArrow
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
                                    {coin && coin.icon && coin.icon({width: "18", height: "18"})}
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
                                    {coin && coin.icon && coin.icon({width: "18", height: "18"})}
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
            {progress.remainingLots === null &&
                <Text className="text-14 mb-2" fw={400}>
                    {t('latest_transactions_card.redeem_label')}
                </Text>
            }
            {progress.tickets.map((ticket, index) => (
                <div className="hidden md:flex items-baseline mb-2" key={`${ticket.ticketId}-${index}`}>
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
    }

    const renderAmount = (progress: ITransaction) => {
        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            return <div className="flex items-center md:justify-end">
                <Text className="text-14 mr-1" fw={400}>{progress.amount}</Text>
                <Text
                    c="var(--flr-gray)"
                    className="text-14 w-16"
                    fw={400}
                >
                    {progress.fasset}
                </Text>
            </div>
        }

        return <div className="flex flex-col">
            <div className="flex items-center md:justify-end mb-2">
                <Text className="text-14 mr-1" fw={400}>{progress.amount}</Text>
                <Text
                    c="var(--flr-gray)"
                    className="text-14 w-16"
                    fw={400}
                >
                    {progress.fasset}
                </Text>
            </div>
            {progress.tickets.map((ticket, index) => (
                <div className="hidden md:flex items-center md:justify-end mb-2" key={`${ticket.ticketId}-${index}`}>
                    <Text className="text-14 mr-1" fw={400}>
                        {ticket.value}
                    </Text>
                    <Text
                        c="var(--flr-gray)"
                        className="text-14 w-16"
                    >
                        {ticket.type}
                    </Text>
                </div>
            ))}
        </div>
    }

    const renderStatus = (progress: ITransaction) => {
        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            return <Badge
                color={progress.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                variant="outline"
                radius="xs"
                size="md"
                className="font-normal"
            >
                <div className="flex items-center">
                    <span
                        className="status-dot mr-1 shrink-0"
                        style={{ backgroundColor: progress.status ? 'var(--flr-green)' : 'var(--flr-warning)' }}
                    />
                    <Text
                        className="text-10 shrink-0"
                        fw={400}
                        c={progress.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                    >
                        {t(`latest_transactions_card.${progress.status ? 'finished_label' : 'in_progress_label'}`)}
                    </Text>
                </div>
            </Badge>
        }

        return <div>
            {progress.tickets.length > 0 &&
                <div className="h-[20px]" />
            }
            {progress.tickets.map((ticket, index) => (
                <Badge
                    color={ticket.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                    variant="outline"
                    radius="xs"
                    size="md"
                    style={{ marginBottom: index < progress.tickets.length - 1 ? '0.3rem' : '0' }}
                    key={`${ticket.ticketId}-${index}`}
                >
                    <div className="flex items-center">
                        <span
                            className="status-dot mr-1 srhink-0"
                            style={{ backgroundColor: ticket.status ? 'var(--flr-green)' : 'var(--flr-warning)' }}
                        />
                        <Text
                            className="text-10 shrink-0"
                            fw={400}
                            c={ticket.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                        >
                            {t(`latest_transactions_card.${ticket.status ? 'finished_label' : 'in_progress_label'}`)}
                        </Text>
                    </div>
                </Badge>
            ))}
        </div>;
    }

    let mobileColumns: IFAssetColumn[] = [
        {
            id: 'timestamp',
            label: t('latest_transactions_card.table.date_label'),
            thClass: `${classes.fitWidth} align-top !text-12`,
            tdClass: `${classes.fitWidth} align-top`,
            render: (progress: ITransaction) => {
                return renderTimestamp(progress);
            },
        },
        {
            id: 'transaction',
            label: t('latest_transactions_card.table.transaction_label'),
            render: (progress: ITransaction) => {
                return renderTransaction(progress);
            },
            thClass: `align-top ${classes.fitWidth} !text-12`,
            tdClass: `align-top ${classes.fitWidth}`,
        },
        {
            id: 'action',
            label: t('latest_transactions_card.table.type_label'),
            thClass: '!text-12',
            render: (progress: ITransaction) => {
                return renderAction(progress);
            }
        },
        {
            id: 'amount',
            label: <div className="md:flex"><Text className="text-12">
                {t('latest_transactions_card.table.amount_label')}</Text><div className="md:w-16" />
            </div>,
            thClass: `${classes.fitWidth} !text-12`,
            tdClass: classes.fitWidth,
            thInnerClass: 'justify-end',
            tdInnerClass: 'justify-end',
            render: (progress: ITransaction) => {
                return renderAmount(progress);
            },
        }
    ];

    const columns: IFAssetColumn[] = [
        {
            id: 'timestamp',
            label: <Text
                className="text-12"
                fw={400}
                c="var(--flr-gray)"
            >
                {t('latest_transactions_card.table.date_label')}
            </Text>,
            thClass: `${classes.fitWidth} align-top`,
            tdClass: `${classes.fitWidth} align-top`,
            render: (progress: ITransaction) => {
                return renderTimestamp(progress);
            },
        },
        {
            id: 'transaction',
            label: <Text
                className="text-12"
                fw={400}
                c="var(--flr-gray)"
            >
                {t('latest_transactions_card.table.transaction_label')}
            </Text>,
            render: (progress: ITransaction) => {
                return renderTransaction(progress);
            },
            thClass: `align-top ${classes.fitWidth}`,
            tdClass: `align-top ${classes.fitWidth}`,
        },
        {
            id: 'action',
            label: <Text
                className="text-12"
                fw={400}
                c="var(--flr-gray)"
            >
                {t('latest_transactions_card.table.type_label')}
            </Text>,
            render: (progress: ITransaction) => {
                return renderAction(progress);
            }
        },
        {
            id: 'amount',
            label: <div className="md:flex">
                <Text
                    className="text-12"
                    fw={400}
                    c="var(--flr-gray)"
                >
                    {t('latest_transactions_card.table.amount_label')}
                </Text>
                <div className="md:w-16" />
            </div>,
            thClass: classes.fitWidth,
            tdClass: '',
            thInnerClass: 'justify-end',
            tdInnerClass: 'justify-end',
            render: (progress: ITransaction) => {
                return renderAmount(progress);
            },
        },
        {
            id: 'status',
            thClass: 'min-w-28',
            tdClass: 'min-w-28',
            label: <Text
                className="text-12"
                fw={400}
                c="var(--flr-gray)"
            >
                {t('latest_transactions_card.table.status_label')}
            </Text>,
            render: (progress: ITransaction) => {
                return renderStatus(progress);
            }
        }
    ];

    useEffect(() => {
        userProgressFetchInterval.start();
        return userProgressFetchInterval.stop;
    }, []);

    return (
        <FAssetTable
            items={transactions ?? []}
            loading={userProgress.isPending}
            columns={mediaQueryMatches ? mobileColumns : columns}
            style={{ maxWidth: '1080px' }}
            emptyLabel={t('latest_transactions_card.empty_label')}
            pagination={true}
            perPage={10}
            scrollContainerWidth={500}
            mobileBreakPoint={640}
            appendColumn={(item: ITransaction) => {
                if (item.action.toLowerCase() === ACTION_TYPE_MINT) {
                    return <Table.Tr>
                        <Table.Td
                            className="font-normal !text-12 uppercase align-top"
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
                                color={item.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                variant="outline"
                                radius="xs"
                                size="md"
                                className="font-normal"
                            >
                                <div className="flex items-center">
                                    <span
                                        className="status-dot mr-1"
                                        style={{ backgroundColor: item.status ? 'var(--flr-green)' : 'var(--flr-warning)' }}
                                    />
                                    <Text
                                        className="text-10"
                                        fw={400}
                                        c={item.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                                    >
                                        {t(`latest_transactions_card.${item.status ? 'finished_label' : 'in_progress_label'}`)}
                                    </Text>
                                </div>
                            </Badge>
                        </Table.Td>
                    </Table.Tr>;
                }

                return item.tickets.map((ticket, index) => (
                    <Table.Tr key={`${ticket.ticketId}-${index}`}>
                        <Table.Td
                            className="font-normal text-sm uppercase align-top"
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
                                    color={ticket.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                                    variant="outline"
                                    radius="xs"
                                    size="md"
                                    className="font-normal"
                                >
                                    <div className="flex items-center">
                                        <span
                                            className="status-dot mr-1"
                                            style={{ backgroundColor: ticket.status ? 'var(--flr-green)' : 'var(--flr-warning)' }}
                                        />
                                        <Text
                                            className="text-10"
                                            fw={400}
                                            c={ticket.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                                        >
                                            {t(`latest_transactions_card.${ticket.status ? 'finished_label' : 'in_progress_label'}`)}
                                        </Text>
                                    </div>
                                </Badge>
                            </div>
                            <div className="flex items-center mt-1">
                                <Text className="text-14 mr-1" fw={400}>
                                    {ticket.value}
                                </Text>
                                <Text
                                    c="var(--flr-gray)"
                                    className="text-14 w-16"
                                >
                                    {ticket.type}
                                </Text>
                            </div>
                        </Table.Td>
                    </Table.Tr>
                ));
            }}
        />
    );
}
