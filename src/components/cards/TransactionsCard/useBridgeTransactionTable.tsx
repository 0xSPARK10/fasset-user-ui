import React from "react";
import { IconArrowNarrowRight, IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { Text, Table, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Badge from "@/components/elements/Badge";
import CopyIcon from "@/components/icons/CopyIcon";
import FXrpIcon from "@/components/icons/FXrpIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import { useWeb3 } from "@/hooks/useWeb3";
import { BRIDGE_FASSET_COIN, COINS, FASSET_COIN } from "@/config/coin";
import { bridgeChainFromEid } from "@/config/bridge";
import { formatNumberDown, toNumber, truncateString } from "@/utils";
import { BRIDGE_CHAIN, FASSETS_EXPLORER_URL, IS_MAINNET, SMART_ACCOUNTS_WEBSITE_URL } from "@/constants";
import { IFAssetColumn } from "@/components/elements/FAssetTable";
import classes from "@/styles/components/cards/LatestTransactionsCard.module.scss";
import {
    IBridgeTransaction,
    ACTION_TYPE_REDEEM,
    ACTION_TYPE_SEND,
    ACTION_TYPE_RECEIVE,
    ACTION_TYPE_REDEEM_FAIL,
    ACTION_TYPE_REMOTE,
    ACTION_TYPE_DIRECT_MINT_BRIDGE,
    ACTION_TYPE_HYPERCORE
} from "./transactionTypes";
import FAssetButton from "@/components/elements/FAssetButton";
import NetworkIcon from "./NetworkIcon";
import { HYPERLIQUID_EXPLORER_TX_URL } from "./hyperCoreHistory";
import { isDirectMintRecoveryStatus, type DirectMintDelivery } from "@/core/bridge/directMint";

interface UseBridgeTransactionTableOptions {
    className?: string;
    isMobile: boolean;
    // Direct mint & bridge stuck in AWAITING_RECOVERY — opens the recovery modal
    onRecoverClick: (xrplTxHash: string, amount: string) => void;
    // Its recovery payment is already sent — no button, the backend catches up in a few minutes
    isRecovering: (xrplTxHash: string) => boolean;
    // LayerZero delivery of a direct mint & bridge the executor sent; undefined = no Scan answer
    directMintDelivery: (item: IBridgeTransaction) => DirectMintDelivery | undefined;
}

interface BridgeTransactionTable {
    columns: IFAssetColumn[];
    renderAppendRow: (item: IBridgeTransaction) => React.ReactNode;
}

/**
 * The FXRP icon of the remote chain a transfer's counterparty lives on, read from
 * `BRIDGE_FASSET_COIN` so the badged icon per chain stays defined in one place. `eid`
 * from the bridge history always refers to the non-Flare side of the route (remote → remote
 * rows carry both eids), so Flare needs no badged entry. Anything without a badged coin — no eid
 * (a Flare redeem from the progress history) or an eid we have no chain for — gets the plain
 * FXRP icon, which is Flare's, labelled Flare. `labelKey` is the `bridge_page.chains.*` key
 * (BridgeChain values match it).
 */
function remoteChainIcon(eid: number | undefined): { icon: React.ReactNode; labelKey: string } {
    const chain = eid === undefined ? undefined : bridgeChainFromEid(eid);
    const coin = chain ? BRIDGE_FASSET_COIN[chain] : undefined;

    return chain && coin
        ? { icon: coin.icon({ width: '26', height: '26' }), labelKey: chain }
        : { icon: <FXrpIcon width={'26'} height={'26'} />, labelKey: BRIDGE_CHAIN.FLARE };
}

/**
 * Direct mint & bridge row status → label and badge colours. Recovery comes from
 * `directMintingStatus` (not the boolean `status`); once the executor sent the OFT, LayerZero
 * Scan's delivery decides — the backend only tracks the Flare side, so EXECUTED_TO_SMART_ACCOUNT
 * stays even after delivery. Without a Scan answer the backend's status is shown.
 */
function directMintStatusBadge(status: IBridgeTransaction['directMintingStatus'], delivery: DirectMintDelivery | undefined) {
    // EXECUTED (backend: finished) gives way only to a failed delivery — Scan can lag behind it
    const showDelivery = status === 'EXECUTED'
        ? delivery === 'failed'
        : !isDirectMintRecoveryStatus(status);
    if (showDelivery) {
        switch (delivery) {
            case 'delivered':
                return { label: 'finished_label', dotColor: 'var(--flr-green)', bgColor: 'var(--flr-lightest-green)' };
            case 'failed':
                return { label: 'failed_label', dotColor: 'var(--flr-warning)', bgColor: 'rgba(230, 30, 87, 0.13)' };
            case 'stuck':
                return { label: 'delayed_label', dotColor: 'var(--flr-warning)', bgColor: 'var(--flr-lightest-red)' };
            case 'bridging':
                return { label: 'in_progress_label', dotColor: 'var(--flr-warning)', bgColor: 'var(--flr-lightest-red)' };
        }
    }
    switch (status) {
        case 'EXECUTED':
            return { label: 'finished_label', dotColor: 'var(--flr-green)', bgColor: 'var(--flr-lightest-green)' };
        case 'DELAYED':
            return { label: 'delayed_label', dotColor: 'var(--flr-warning)', bgColor: 'var(--flr-lightest-red)' };
        // Recovery paid, backend processing it
        case 'RECOVERY_PENDING':
            return { label: 'recovering_status_label', dotColor: 'var(--flr-warning)', bgColor: 'var(--flr-lightest-red)' };
        case 'AWAITING_RECOVERY':
            return { label: 'needs_recovery_label', dotColor: 'var(--flr-warning)', bgColor: 'var(--flr-lightest-red)' };
        // Recovery paid: the FXRP is on the Personal Account (smart accounts), not bridged
        case 'RECOVERED':
            return { label: 'recovered_label', dotColor: 'var(--flr-green)', bgColor: 'var(--flr-lightest-green)' };
        case 'MINTING_PAYMENT_TOO_SMALL_FOR_FEE':
            return { label: 'payment_too_small_label', dotColor: 'var(--flr-warning)', bgColor: 'rgba(230, 30, 87, 0.13)' };
        default:
            return { label: 'in_progress_label', dotColor: 'var(--flr-warning)', bgColor: 'var(--flr-lightest-red)' };
    }
}

export function useBridgeTransactionTable({
    className,
    isMobile,
    onRecoverClick,
    isRecovering,
    directMintDelivery,
}: UseBridgeTransactionTableOptions): BridgeTransactionTable {
    const { t } = useTranslation();
    const { mainToken, getConnectedCoin } = useWeb3();
    // The recovery payment must come from the XRPL wallet that paid
    const isRecoverDisabled = !FASSET_COIN || getConnectedCoin(FASSET_COIN.type) === undefined;

    const networkIcon = (icon: React.ReactNode, labelKey: string) => <NetworkIcon icon={icon} labelKey={labelKey} />;
    const remoteIcon = (eid: number | undefined) => {
        const { icon, labelKey } = remoteChainIcon(eid);
        return networkIcon(icon, labelKey);
    };

    const renderTimestamp = (progress: IBridgeTransaction) => {
        return <Text className="text-14 pt-[5px]" fw={400}>
            {moment(Number(progress.timestamp)).format('DD.MM.YYYY HH:mm')}
        </Text>;
    };

    const renderTransaction = (progress: IBridgeTransaction) => {
        const action = progress.action.toLowerCase();
        // Direct mint & bridge: the XRP payment until the executor sent the OFT, then its EVM tx on LayerZero Scan
        const txHash = action === ACTION_TYPE_DIRECT_MINT_BRIDGE
            ? progress.evmTxHash ?? progress.txhash
            : progress.txhash;
        const isHash = /^0x[a-fA-F0-9]{64}$/.test(txHash) || /^[A-F0-9]{64}$/.test(txHash);
        const isRedeemAction = action === ACTION_TYPE_REDEEM || action === ACTION_TYPE_REDEEM_FAIL;
        const layerZeroScanUrl = IS_MAINNET ? 'https://layerzeroscan.com/tx' : 'https://testnet.layerzeroscan.com/tx';

        // Both branches take the network from the build: a testnet deployment queries a
        // testnet backend, so a record from the other network cannot appear here.
        const href = action === ACTION_TYPE_HYPERCORE
            ? `${HYPERLIQUID_EXPLORER_TX_URL}/${txHash}`
            : progress.fromLayerZero
            ? `${layerZeroScanUrl}/${txHash}`
            : isRedeemAction
            ? `${FASSETS_EXPLORER_URL}/tx/${txHash}?network=${mainToken?.nativeName?.toLowerCase()?.includes('sgb') ? 'sgb' : 'flr'}`
            : action === ACTION_TYPE_DIRECT_MINT_BRIDGE && !progress.evmTxHash
                ? `${FASSET_COIN?.network.explorerTxUrl}/${txHash}`
                : `${layerZeroScanUrl}/${txHash}`;

        return <div className={`flex max-[768px]:flex-wrap text-wrap items-center pt-[5px] ${className ?? ''}`}>
            <Link
                href={href}
                target="_blank"
                className="text-14 underline font-normal"
            >
                <span className="hidden sm:block">{truncateString(txHash, 24, 24)}</span>
                <span className="block sm:hidden">{truncateString(txHash, 7, 7)}</span>
            </Link>
            {isHash &&
                <CopyIcon text={txHash} color="var(--mantine-color-gray-5)" />
            }
        </div>
    };

    const renderAction = (progress: IBridgeTransaction) => {
        const coin = COINS.find(coin => coin.type.toLowerCase() === progress.fasset.toLowerCase());
        const action = progress.action.toLowerCase();
        const isRedeemFail = action === ACTION_TYPE_REDEEM_FAIL;
        const isRedeem = action === ACTION_TYPE_REDEEM;

        // XRP → FXRP on the destination; the destination is unknown until the OFT send is matched
        if (action === ACTION_TYPE_DIRECT_MINT_BRIDGE) {
            const destinationEid = progress.eid ?? progress.oftSent?.dstEid;

            return (
                <div className="flex items-center">
                    {networkIcon(<XrpIcon width={'26'} height={'26'} />, 'xrpl')}
                    <IconArrowNarrowRight size={20} className="mx-2" />
                    {progress.toHypercore
                        ? networkIcon(<FXrpHypeCoreIcon width={'26'} height={'26'} />, 'hyper_core')
                        : destinationEid
                            ? remoteIcon(destinationEid)
                            // Destination unknown until the OFT send is matched (eid / oftSent null) —
                            // a neutral circle, not the Flare FXRP icon the transfer never lands on
                            : <Tooltip label={t('latest_transactions_card.destination_unknown_tooltip')} withArrow>
                                <span className="block w-[26px] h-[26px] rounded-full bg-[var(--flr-border-color)]" />
                            </Tooltip>
                    }
                </div>
            );
        }

        // Hyperliquid ↔ HyperEVM (Core ledger)
        if (action === ACTION_TYPE_HYPERCORE) {
            const core = networkIcon(<FXrpHypeCoreIcon width={'26'} height={'26'} />, 'hyper_core');
            const evm = remoteIcon(progress.eid);
            return (
                <div className="flex items-center">
                    {progress.hyperCoreDirection === 'to_evm' ? core : evm}
                    <IconArrowNarrowRight size={20} className="mx-2" />
                    {progress.hyperCoreDirection === 'to_evm' ? evm : core}
                </div>
            );
        }

        // Remote → remote (LayerZero Scan): source chain icon → destination chain icon
        if (action === ACTION_TYPE_REMOTE) {
            return (
                <div className="flex items-center">
                    {remoteIcon(progress.srcEid!)}
                    <IconArrowNarrowRight size={20} className="mx-2" />
                    {progress.toHypercore
                        ? networkIcon(<FXrpHypeCoreIcon width={'26'} height={'26'} />, 'hyper_core')
                        : remoteIcon(progress.eid)
                    }
                </div>
            );
        }

        return (
            <div className="flex flex-col items-flex-start">
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center">
                        {action === ACTION_TYPE_SEND || isRedeemFail
                            ? networkIcon(coin?.icon({ width: '26', height: '26' }), 'flare')
                            : remoteIcon(progress.eid)
                        }
                        <IconArrowNarrowRight size={20} className="mx-2" />
                        {action === ACTION_TYPE_RECEIVE
                            ? networkIcon(coin?.icon({ width: '26', height: '26' }), 'flare')
                            : isRedeemFail || isRedeem
                                ? networkIcon(<XrpIcon width={'26'} height={'26'} />, 'xrpl')
                                : progress.toHypercore
                                    ? networkIcon(<FXrpHypeCoreIcon width={'26'} height={'26'} />, 'hyper_core')
                                    : remoteIcon(progress.eid)
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
        if ([ACTION_TYPE_SEND, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM_FAIL, ACTION_TYPE_REMOTE, ACTION_TYPE_DIRECT_MINT_BRIDGE, ACTION_TYPE_HYPERCORE].includes(progress.action.toLowerCase())) {
            return <div className="flex items-center md:justify-end h-[26px]">
                <Text className="text-14 mr-1" fw={400}>
                    {formatNumberDown(progress.amount)}
                </Text>
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
                        ? `${formatNumberDown(progress.amount)} (of ${formatNumberDown(totalRequested ?? 0)})`
                        : formatNumberDown(progress.amount)
                    }
                </Text>
                <Text c="var(--flr-gray)" className="text-14 w-16" fw={400}>{progress.fasset}</Text>
            </div>
            {progress?.tickets?.map((ticket, index) => (
                ticket.value
                    ? <div className="hidden md:flex items-center whitespace-nowrap" key={`${ticket.ticketId}-${index}`}>
                        <Text className="text-14 mr-1" fw={400}>{formatNumberDown(ticket.value)}</Text>
                        <Text c="var(--flr-gray)" className="text-14 w-16">{ticket.type}</Text>
                    </div>
                    : null
            ))}
        </div>
    };

    const renderStatus = (progress: IBridgeTransaction) => {
        const action = progress.action.toLowerCase();

        if (action === ACTION_TYPE_DIRECT_MINT_BRIDGE) {
            const xrplTxHash = progress.xrplTxHash ?? progress.txhash;
            // Paid: the backend says so (RECOVERY_PENDING), or this browser sent it moments ago
            const isRecoveryPaid = progress.directMintingStatus === 'RECOVERY_PENDING'
                || (progress.directMintingStatus === 'AWAITING_RECOVERY' && isRecovering(xrplTxHash));
            const badge = directMintStatusBadge(isRecoveryPaid ? 'RECOVERY_PENDING' : progress.directMintingStatus, directMintDelivery(progress));

            // Badge, then its action next to it: Recover (needs recovery), Open FSA app (recovered)
            return <div className="flex items-center gap-2 w-full min-h-[26px] whitespace-nowrap">
                <Badge
                    variant="status"
                    dotColor={badge.dotColor}
                    bgColor={badge.bgColor}
                    size="md"
                    className="font-normal"
                >
                    {t(`latest_transactions_card.${badge.label}`)}
                </Badge>
                {progress.directMintingStatus === 'RECOVERED' && SMART_ACCOUNTS_WEBSITE_URL &&
                    <FAssetButton
                        variant="secondary"
                        component={Link}
                        href={SMART_ACCOUNTS_WEBSITE_URL}
                        target="_blank"
                        className="px-2"
                    >
                        {t('latest_transactions_card.open_smart_accounts_link')}
                    </FAssetButton>
                }
                {progress.directMintingStatus === 'AWAITING_RECOVERY' && !isRecoveryPaid &&
                    <Tooltip
                        label={t('latest_transactions_card.recover_connect_tooltip')}
                        withArrow
                        disabled={!isRecoverDisabled}
                    >
                        <FAssetButton
                            variant="secondary"
                            disabled={isRecoverDisabled}
                            onClick={() => onRecoverClick(xrplTxHash, progress.amount)}
                            className="px-2"
                        >
                            {t('latest_transactions_card.recover_button')}
                        </FAssetButton>
                    </Tooltip>
                }
            </div>;
        }
        if ([ACTION_TYPE_SEND, ACTION_TYPE_RECEIVE, ACTION_TYPE_REDEEM_FAIL, ACTION_TYPE_REMOTE, ACTION_TYPE_HYPERCORE].includes(action)
            || (action === ACTION_TYPE_REDEEM && !progress.tickets?.length)) {
            return <div className="flex items-center h-[26px]">
                <Badge
                    variant="status"
                    dotColor={progress.status ? 'var(--flr-green)' : 'var(--flr-warning)'}
                    bgColor={progress.defaulted ? 'rgba(230, 30, 87, 0.13)' : (progress.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)')}
                    size="md"
                    className="font-normal"
                >
                    {t(`latest_transactions_card.${progress.status
                        ? 'finished_label'
                        : progress.fromLayerZero && progress.defaulted ? 'failed_label' : 'in_progress_label'}`)}
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
        // Mobile has no Status column — direct mint & bridge needs it for "Needs recovery" + Recover
        if (item.action.toLowerCase() === ACTION_TYPE_DIRECT_MINT_BRIDGE) {
            return (
                <Table.Tr>
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
                    <Table.Td>{renderStatus(item)}</Table.Td>
                </Table.Tr>
            );
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
                        <Text className="text-14 mr-1" fw={400}>{formatNumberDown(ticket.value)}</Text>
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
                label: t('latest_transactions_card.table.transaction_hash_label'),
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
                // Column widths: 154 / 456 / 114 / 154 / 232 = the table's 1110 px (Figma: Type 154, Status
                // 192 — Status took 40 px from Type so a badge and its button fit, e.g. "Needs recovery" + Recover)
                thClass: 'w-[154px] whitespace-nowrap',
                tdClass: 'w-[154px] whitespace-nowrap !align-top',
                render: renderTimestamp,
            },
            {
                id: 'transaction',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.transaction_hash_label')}
                </Text>,
                thClass: 'w-[456px] min-w-[350px] whitespace-nowrap !align-top',
                tdClass: 'w-[456px] min-w-[350px] whitespace-nowrap !align-top',
                render: renderTransaction,
            },
            {
                id: 'action',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.type_label')}
                </Text>,
                thClass: 'w-[114px] min-w-[114px] !align-top',
                tdClass: 'w-[114px] min-w-[114px] !align-top',
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
                thClass: 'w-[154px] min-w-[154px] whitespace-nowrap !align-top',
                tdClass: 'w-[154px] min-w-[154px] !align-top',
                thInnerClass: 'justify-end',
                tdInnerClass: 'justify-end',
                render: renderAmount,
            },
            {
                id: 'status',
                label: <Text className="text-12" fw={400} c="var(--flr-gray)">
                    {t('latest_transactions_card.table.status_label')}
                </Text>,
                // Badge + its button on one line ("Needs recovery" + Recover, "Recovered" + Open FSA app)
                thClass: 'w-[232px] min-w-[232px] !align-top',
                tdClass: 'w-[232px] min-w-[232px] !align-top',
                render: renderStatus,
            },
        ];

    return { columns, renderAppendRow };
}
