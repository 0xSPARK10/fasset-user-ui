import React, { useEffect, useRef, useState } from "react";
import { IconArrowNarrowRight, IconArrowUpRight, IconInfoHexagon } from "@tabler/icons-react";
import Link from "next/link";
import { Text, Badge, Table, rem, Popover, lighten, Button, Tooltip, Anchor, Stack } from "@mantine/core";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { Trans, useTranslation } from "react-i18next";
import moment from "moment";
import FAssetTable, { IFAssetColumn } from "@/components/elements/FAssetTable";
import { useUserProgress } from "@/api/user";
import { IUserProgress, IOFTHistory, IFAssetCoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS } from "@/config/coin";
import CopyIcon from "@/components/icons/CopyIcon";
import { toNumber, truncateString } from "@/utils";
import { groupBy, map, orderBy } from "lodash-es";
import RetryMintModal from "@/components/modals/RetryMintModal";
import classes from "@/styles/components/cards/LatestTransactionsCard.module.scss";
import { useUserHistory } from "@/api/oft";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { XRP_NAMESPACE } from "@/config/networks";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import { FASSETS_EXPLORER_URL } from "@/constants";

interface ILatestTransactionsCard {
    className?: string;
    refreshKey?: number;
    type: 'mint' | 'bridge';
    fAssetCoin?: IFAssetCoin;
}

interface ITicket {
    ticketId: string;
    value: string;
    type: string;
    status: boolean;
}

interface ITransaction extends IUserProgress {
    tickets?: ITicket[];
}

interface IBridgeTransaction extends IOFTHistory {
    tickets?: ITicket[];
}

interface IUnderlyingTransaction {
    fAsset: string;
    fAssetAmount: string;
    amount: string;
    destinationAddress: string;
    paymentReference: string;
    agentName: string;
    lastUnderlyingBlock: string;
    expirationMinutes: string;
}


const ACTION_TYPE_MINT = 'mint';
const ACTION_TYPE_REDEEM = 'redeem';
const ACTION_TYPE_SEND = 'send';
const ACTION_TYPE_RECEIVE = 'receive';
const ACTION_TYPE_REDEEM_FAIL = 'redeemfail';
const LATEST_TRANSACTIONS_REFRESH_INTERVAL = 45000;

export default function LatestTransactionsCard({ className, refreshKey, type, fAssetCoin }: ILatestTransactionsCard) {
    const [transactions, setTransactions] = useState<ITransaction[]>();
    const [bridgeTransactions, setBridgeTransactions] = useState<IBridgeTransaction[]>();
    const [mintingTransaction, setMintingTransaction] = useState<{[id: string]: boolean}>({});
    const [isRetryMintModalActive, setIsRetryMintModalActive] = useState<boolean>(false);
    const { t } = useTranslation();
    const { mainToken, connectedCoins } = useWeb3();
    const isMint = type === 'mint';

    const underlyingTransaction = useRef<IUnderlyingTransaction>();
    const userProgressFetchInterval = useInterval(() => {
        if (isMint) {
            userProgress.refetch();
        } else {
            oftUserHistory.refetch();
        }
    }, LATEST_TRANSACTIONS_REFRESH_INTERVAL);

    const xrpAddress = fAssetCoin?.network.namespace === XRP_NAMESPACE ? fAssetCoin.address : undefined;
    const userProgress = useUserProgress(mainToken?.address ?? '', mainToken !== undefined && isMint, xrpAddress);
    const oftUserHistory = useUserHistory(mainToken?.address ?? '', mainToken !== undefined && !isMint);
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        if (isMint) {
            userProgress.refetch();
        } else {
            oftUserHistory.refetch();
        }
    }, [refreshKey]);

    useEffect(() => {
        if (!userProgress.data) return;
        if (userProgress.data.length === 0) {
            setTransactions([]);
            return;
        }

        const mintTransactions: ITransaction[] = userProgress.data.filter(transaction => transaction.action.toLowerCase() === ACTION_TYPE_MINT);
        const grouped = groupBy(userProgress.data.filter(transaction => transaction.action.toLowerCase() === ACTION_TYPE_REDEEM), 'txhash');
        const redeemTransactions: ITransaction[] = map(grouped, (group, key) => {
            return {
                ...group[0],
                tickets: group.map(item => {
                    const coin = COINS.find(coin => coin.type.toLowerCase() === item.fasset.toLowerCase());

                    return {
                        ticketId: item.ticketID!,
                        value: 'vaultToken' in item ? item.vaultTokenValueRedeemed! : item.underlyingPaid!,
                        type: 'vaultToken' in item ? item.vaultToken! : coin?.nativeName!,
                        status: item.status
                    }
                })
            }
        });

        const items = orderBy([...mintTransactions, ...redeemTransactions], ['timestamp'], 'desc');
        setTransactions(items);
    }, [userProgress.data]);

    useEffect(() => {
        if (!oftUserHistory.data || isMint) return;
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
    }, [oftUserHistory.data, isMint]);

    const renderTimestamp = (progress: ITransaction | IOFTHistory) => {
        if (isMint) {
            const item = progress as ITransaction;
            const isTryAgainButtonVisible = item.missingUnderlying &&
                item?.underlyingTransactionData?.paymentReference &&
                (!mintingTransaction[item.underlyingTransactionData.paymentReference] ||
                    mintingTransaction[item.underlyingTransactionData.paymentReference] === false
                );

            if (isTryAgainButtonVisible) {
                return <div className="flex min-h-[30px] items-center">
                    <Text
                        className="text-14"
                        fw={400}
                    >
                        {moment(progress.timestamp).format('DD.MM.YYYY HH:mm')}
                    </Text>
                </div>
            }
        }

        if (isMint && (progress as ITransaction).action.toLowerCase() === ACTION_TYPE_REDEEM) {
            return <div className="h-[26px] flex items-center">
                <Text className="text-14" fw={400}>
                    {moment(Number(progress.timestamp)).format('DD.MM.YYYY HH:mm')}
                </Text>
            </div>;
        }

        return <Text className={`text-14${!isMint ? ' pt-[5px]' : ''}`} fw={400}>
            {moment(Number(progress.timestamp)).format('DD.MM.YYYY HH:mm')}
        </Text>;
    }

    const renderTransaction = (progress: ITransaction | IOFTHistory) => {
        const isHash = /^0x[a-fA-F0-9]{64}$/.test(progress.txhash) || /^[A-F0-9]{64}$/.test(progress.txhash);
        
        if (isMint) {
            progress = progress as ITransaction;
            let href = progress.evm_txhash == null
            ? `${fAssetCoin?.network.explorerTxUrl}/${progress.txhash}`
            : `${FASSETS_EXPLORER_URL}/tx/${progress.evm_txhash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`;
            
            const isTryAgainDisabled = connectedCoins.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase()) === undefined;
            const showTryAgainButton = isHash && progress.missingUnderlying &&
                progress?.underlyingTransactionData?.paymentReference &&
                (!mintingTransaction[progress.underlyingTransactionData.paymentReference] ||
                    mintingTransaction[progress.underlyingTransactionData.paymentReference] === false
                );
            
            const txHash =  progress.evm_txhash == null ? progress.txhash : progress.evm_txhash;
           
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
                                underlyingTransaction.current = {
                                    ...(progress as ITransaction).underlyingTransactionData,
                                    fAsset: progress.fasset,
                                    fAssetAmount: progress.amount
                                };
                                setIsRetryMintModalActive(true);
                            }}
                            className="sm:ml-auto px-2"
                        >
                            {t('latest_transactions_card.try_again_button')}
                        </Button>
                    </Tooltip>
                }
            </div>
        }

        progress = progress as IOFTHistory;
        const action = progress.action.toLowerCase();
        const isRedeemAction = action === ACTION_TYPE_REDEEM || action === ACTION_TYPE_REDEEM_FAIL;

        const isMainnet = progress.eid === EndpointId.HYPERLIQUID_V2_MAINNET;
        let href: string;
        if (isRedeemAction) {
            href = `${fAssetCoin?.network.explorerTxUrl}/${progress.txhash}`;
        } else {
            href = isMainnet
                ? `https://layerzeroscan.com/tx/${progress.txhash}`
                : `https://testnet.layerzeroscan.com/tx/${progress.txhash}`;
        }

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
    }

    const renderAction = (progress: ITransaction | IOFTHistory) => {
        const coin = COINS.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase());
        if (isMint) {
            progress = progress as ITransaction;
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
        }

        const bridgeProgress = progress as IBridgeTransaction;
        const action = bridgeProgress.action.toLowerCase();
        const isRedeemFail = action === ACTION_TYPE_REDEEM_FAIL;
        const isRedeem = action === ACTION_TYPE_REDEEM;
        return (
            <div className="flex flex-col items-flex-start">
                <div className={"flex flex-col items-start gap-2"}>
                <div className="flex items-center">
                    {action === ACTION_TYPE_SEND || isRedeemFail
                        ? coin?.icon({ width: '26', height: '26' })
                        : <FXrpHypeEVMIcon width={'26'} height={'26'} />
                    }
                    <IconArrowNarrowRight
                        size={20}
                        className="mx-2"
                    />
                    {action === ACTION_TYPE_RECEIVE
                        ?  coin?.icon({ width: '26', height: '26' })
                        : isRedeemFail || isRedeem
                            ? <XrpIcon width={'26'} height={'26'} />
                            : bridgeProgress.toHypercore
                                ? <FXrpHypeCoreIcon width={'26'} height={'26'} />
                                : <FXrpHypeEVMIcon width={'26'} height={'26'} />
                    }
                </div>
                {isRedeemFail &&
                    <Text
                        c="var(--flr-gray)"
                        fw={400}
                        className="text-10"
                    >
                        {t('latest_transactions_card.redemption_failed_label')}
                    </Text>
                }
                {isRedeem && bridgeProgress.tickets &&
                    bridgeProgress.tickets.map((ticket, index) => (
                        <div className="hidden md:flex items-baseline" key={`${ticket.ticketId}-${index}`}>
                            <Text
                                c="var(--flr-gray)"
                                className="text-10 mr-1 flex-shrink-0"
                            >
                                {t('latest_transactions_card.table.ticket_id_label')}
                            </Text>
                            <Link
                                href={`${FASSETS_EXPLORER_URL}/tx/1/${bridgeProgress.txhash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`}
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
    }

    const renderAmount = (progress: ITransaction | IBridgeTransaction) => {
        if ([ACTION_TYPE_MINT, ACTION_TYPE_SEND, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM_FAIL].includes(progress.action.toLowerCase())) {
            const isDelayed = (progress as ITransaction).directMintingStatus === 'DELAYED';
            return <div className={`flex ${isDelayed ? 'items-start' : 'items-center'} md:justify-end h-[26px]`}>
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

        const coin = COINS.find(c => c.type.toLowerCase() === progress.fasset.toLowerCase());
        const isPartial = !isMint && progress.incomplete && progress.remainingLots;
        const totalRequested = isPartial
            ? toNumber(progress.amount) + (toNumber(progress.remainingLots ?? '0') * (coin?.lotSize ?? 0))
            : null;

        return <div className="flex flex-col items-end gap-2">
            <div className="flex items-center whitespace-nowrap h-[26px]">
                <Text className="text-14 mr-1" fw={400}>
                    {isPartial
                        ? `${progress.amount} (of ${totalRequested?.toLocaleString('en-US')})`
                        : progress.amount
                    }
                </Text>
                <Text
                    c="var(--flr-gray)"
                    className="text-14 w-16"
                    fw={400}
                >
                    {progress.fasset}
                </Text>
            </div>
            {progress?.tickets?.map((ticket: ITicket, index: number) => (
                ticket.value
                    ? <div className="hidden md:flex items-center whitespace-nowrap" key={`${ticket.ticketId}-${index}`}>
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
                    : null
            ))}
        </div>
    }

    const renderStatus = (progress: ITransaction) => {
        if (progress.directMinting && progress.directMintingStatus === 'DELAYED') {
            return <Badge
                color="var(--flr-sky)"
                variant="outline"
                radius="xs"
                size="md"
                className="font-normal"
            >
                <div className="flex items-center">
                    <span className="status-dot mr-1 shrink-0" style={{ backgroundColor: 'var(--flr-sky)' }} />
                    <Text className="text-10 shrink-0" fw={400} c="var(--flr-sky)">
                        {t('latest_transactions_card.delayed_label')}
                    </Text>
                </div>
            </Badge>
        }

        if (progress.action.toLowerCase() === ACTION_TYPE_MINT) {
            return <Badge
                color={progress.defaulted
                    ? 'rgba(230, 30, 87, 0.13)'
                    : (progress.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)')
                }
                variant="outline"
                radius="xs"
                size="md"
                className="font-normal"
            >
                <div className="flex items-center">
                    <span
                        className="status-dot mr-1 shrink-0"
                        style={{ backgroundColor: progress.defaulted
                            ? 'var(--flr-pink)'
                            : (progress.status ? 'var(--flr-green)' : 'var(--flr-warning)') }}
                    />
                    <Text
                        className="text-10 shrink-0"
                        fw={400}
                        c={progress.defaulted
                            ? 'var(--flr-pink)'
                            : (progress.status ? 'var(--flr-green)' : 'var(--flr-warning)')
                        }
                    >
                        {t(`latest_transactions_card.${progress.defaulted ? 'defaulted_label' : (progress.status ? 'finished_label' : 'in_progress_label')}`)}
                    </Text>
                </div>
            </Badge>
        } else if ([ACTION_TYPE_SEND, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM_FAIL].includes(progress.action.toLowerCase())
            || (progress.action.toLowerCase() === ACTION_TYPE_REDEEM && !progress.tickets?.length)) {
            return <div className="flex items-center h-[26px]">
                <Badge
                    color={progress.defaulted
                        ? 'rgba(230, 30, 87, 0.13)'
                        : (progress.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)')
                    }
                    variant="outline"
                    radius="xs"
                    size="md"
                    className="font-normal"
                >
                    <div className="flex items-center">
                        <span
                            className="status-dot mr-1 shrink-0"
                            style={{
                                backgroundColor: progress.status ? 'var(--flr-green)' : 'var(--flr-warning)'
                            }}
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
            </div>
        }

        return <div className="flex flex-col gap-2">
            {progress?.tickets?.length ? (
                <>
                    <div className="h-[26px]" />
                    {progress.tickets.map((ticket, index) => (
                        <Badge
                            color={ticket.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                            variant="outline"
                            radius="xs"
                            size="md"
                            key={`${ticket.ticketId}-${index}`}
                            className="flex"
                        >
                            <div className="flex items-center">
                    <span
                        className="status-dot mr-1 shrink-0"
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
                </>
            ) : null}
        </div>;
    }

    let mobileColumns: IFAssetColumn[] = [
        {
            id: 'timestamp',
            label: t('latest_transactions_card.table.date_label'),
            thClass: `${classes.fitWidth} align-middle !text-12`,
            tdClass: `${classes.fitWidth} !align-top`,
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
            thClass: `align-middle ${classes.fitWidth} !text-12`,
            tdClass: `!align-top ${classes.fitWidth}`,
        },
        {
            id: 'action',
            label: t(`latest_transactions_card.table.${isMint ? 'type' : 'bridge'}_label`),
            thClass: 'pl-4 !text-12',
            tdClass: 'pl-4',
            render: (progress: ITransaction) => {
                return renderAction(progress);
            }
        },
        {
            id: 'amount',
            label:
                <div className="md:flex">
                    <Text className="text-12">
                        {t('latest_transactions_card.table.amount_label')}</Text>
                    <div className="md:w-16" />
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
            thClass: `${classes.fitWidth}`,
            tdClass: isMint
                ? (item: ITransaction) => `${classes.fitWidth}${item.action.toLowerCase() === ACTION_TYPE_REDEEM ? ' !align-top' : ''}`
                : `${classes.fitWidth} !align-top`,
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
            thClass: `${isMint ? '' : 'min-w-[350px]'} ${classes.fitWidth}${!isMint ? ' !align-top' : ''}`,
            tdClass: isMint
                ? (item: ITransaction) => `${classes.fitWidth}${item.action.toLowerCase() === ACTION_TYPE_REDEEM ? ' !align-top' : ''}`
                : `min-w-[350px] ${classes.fitWidth} !align-top`,
        },
        {
            id: 'action',
            label: <Text
                className="text-12"
                fw={400}
                c="var(--flr-gray)"
            >
                {t(`latest_transactions_card.table.${isMint ? 'type' : 'bridge'}_label`)}
            </Text>,
            thClass: `pl-8${!isMint ? ' min-w-[200px] !align-top' : ''}`,
            tdClass: isMint
                ? (item: ITransaction) => `pl-8${item.directMinting && item.directMintingStatus === 'DELAYED' ? ' !align-top' : ''}`
                : `pl-8 min-w-[200px] !align-top`,
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
            thClass: `${classes.fitWidth}${!isMint ? ' min-w-[200px] !align-top' : ''}`,
            tdClass: isMint
                ? (item: ITransaction) => item.directMinting && item.directMintingStatus === 'DELAYED' ? '!align-top' : ''
                : 'min-w-[200px] !align-top',
            thInnerClass: 'justify-end',
            tdInnerClass: 'justify-end',
            render: (progress: ITransaction) => {
                return renderAmount(progress);
            },
        },
        {
            id: 'status',
            thClass: `min-w-28${!isMint ? ' !align-top' : ''}`,
            tdClass: isMint
                ? (item: ITransaction) => `min-w-28${item.directMinting && item.directMintingStatus === 'DELAYED' ? ' !align-top' : ''}`
                : 'min-w-28 !align-top',
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

    const tableKey = `${connectedCoins.map(coin => coin.type).sort().join(',')}-${Object.keys(mintingTransaction).join(',')}`;

    return (
        <>
            <FAssetTable
                key={tableKey}
                items={(isMint ? transactions : bridgeTransactions) ?? []}
                loading={isMint ? userProgress.isPending : oftUserHistory.isPending}
                columns={isMobile ? mobileColumns : columns}
                style={{ maxWidth: '1080px' }}
                emptyLabel={t('latest_transactions_card.empty_label')}
                pagination={true}
                perPage={10}
                scrollContainerWidth={500}
                mobileBreakPoint={768}
                appendColumn={(item: ITransaction) => {
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
