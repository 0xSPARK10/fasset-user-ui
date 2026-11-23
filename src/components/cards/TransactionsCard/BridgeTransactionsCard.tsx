import React, { useEffect, useState } from "react";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { groupBy, map, orderBy } from "lodash-es";
import FAssetTable, { IFAssetColumn } from "@/components/elements/FAssetTable";
import DirectMintRecoveryModal from "@/components/bridge/submit/DirectMintRecoveryModal";
import { useDirectMintRecoveryStore } from "@/store/directMintRecovery";
import { isOftHistoryItem, useFullHistory } from "@/api/oft";
import { useLayerZeroWalletMessages, useMessagesByTx } from "@/api/bridge";
import { directMintDeliveryOf, DirectMintDelivery, isDirectMintRecoveryStatus } from "@/core/bridge/directMint";
import { useWeb3 } from "@/hooks/useWeb3";
import { COINS, FASSET_COIN } from "@/config/coin";
import { IFAssetCoin, IMessage, IOFTHistory, IUserProgress } from "@/types";
import { useTransactionInvalidation } from "@/hooks/useTransactionInvalidation";
import {
    IBridgeTransaction,
    ITransaction,
    ACTION_TYPE_REDEEM,
    ACTION_TYPE_DIRECT_MINT_BRIDGE,
    LATEST_TRANSACTIONS_REFRESH_INTERVAL,
} from "./transactionTypes";
import { useBridgeTransactionTable } from "./useBridgeTransactionTable";
import { useMintTransactionTable } from "./useMintTransactionTable";
import { remoteTransfersFromLayerZero } from "./layerZeroHistory";
import { hyperCoreTransfersFromLedger } from "./hyperCoreHistory";
import { useHyperCoreFxrpToken, useHyperCoreLedger } from "@/api/hypercore";
import { useHyperliquidBalance } from "@/api/bridge";
import { isBridgeChainEnabled } from "@/config/bridge";
import { BRIDGE_CHAIN, IS_MAINNET } from "@/constants";
import { progressRows } from "./progressRows";
import { useRetryMint } from "./useRetryMint";

interface IBridgeTransactionsCard {
    className?: string;
    refreshKey?: number;
}

type BridgeTableRow = IBridgeTransaction | ITransaction;

const isProgressRow = (row: BridgeTableRow): row is ITransaction => !!(row as ITransaction).isProgress;

// XRPL hash as the backend sends it for DIRECT_MINT_BRIDGE (upper case, no 0x)
const normalizeXrplHash = (hash?: string) => (hash ?? '').replace(/^0x/i, '').toUpperCase();

/** OFT rows: redeems grouped by `txhash` into one row with a ticket per agent, the rest as they are. */
function oftRows(items: IOFTHistory[]): IBridgeTransaction[] {
    const redeemItems = items.filter(item => item.action.toLowerCase() === ACTION_TYPE_REDEEM);
    const nonRedeemItems: IBridgeTransaction[] = items.filter(item => item.action.toLowerCase() !== ACTION_TYPE_REDEEM);

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

    return [...nonRedeemItems, ...redeemTransactions];
}

/**
 * The bridge page's "Latest transactions": OFT transfers and direct mint & bridge (bridge table)
 * plus mints / redeems (Mint page table, Try again included) from one `oft/fullHistory` call, and
 * remote → remote transfers from LayerZero Scan. Each row renders with its own table's cells.
 */
export default function BridgeTransactionsCard({ className, refreshKey }: IBridgeTransactionsCard) {
    const [transactions, setTransactions] = useState<BridgeTableRow[]>();
    // The direct mint & bridge being recovered: original XRPL hash + the row's FXRP amount
    const [recovery, setRecovery] = useState<{ xrplTxHash: string; amount: string }>();
    const { mintingTransaction, onRetryMintClick, retryMintModal } = useRetryMint();
    const { t } = useTranslation();
    const { mainToken, connectedCoins, getConnectedCoin } = useWeb3();
    const isMobile = useMediaQuery('(max-width: 768px)');

    // mainToken exists without a wallet too — no address = no request (it hit `userHistory/` → 404)
    const address = mainToken?.address ?? '';
    // With an XRPL wallet the backend adds the direct mint and direct mint & bridge rows
    const xrplCoin = FASSET_COIN ? getConnectedCoin(FASSET_COIN.type) : undefined;
    const xrpAddress = xrplCoin?.address;
    const fullHistory = useFullHistory(address, address !== '', xrpAddress);
    // Remote → remote transfers are not on the backend — LayerZero Scan fills them in
    const layerZeroMessages = useLayerZeroWalletMessages(address, address !== '');
    // Hyperliquid ↔ HyperEVM is neither on the backend nor on LayerZero — the Core ledger has it
    const hyperCoreEnabled = address !== '' && isBridgeChainEnabled(BRIDGE_CHAIN.HYPER_EVM);
    const hyperCoreToken = useHyperCoreFxrpToken(hyperCoreEnabled);
    const hyperCoreLedger = useHyperCoreLedger(address, hyperCoreEnabled);
    // Same query as the bridge page balance — its evmEscrows says whether a HyperEVM → Hyperliquid is still held
    const hyperCoreBalance = useHyperliquidBalance(address, hyperCoreEnabled);

    const fetchInterval = useInterval(() => {
        // refetch() ignores `enabled`
        if (!address) return;
        fullHistory.refetch();
        layerZeroMessages.refetch();
        if (hyperCoreEnabled) {
            hyperCoreLedger.refetch();
            hyperCoreBalance.refetch();
        }
    }, LATEST_TRANSACTIONS_REFRESH_INTERVAL);

    useTransactionInvalidation({
        type: 'bridge',
        address: mainToken?.address,
        data: fullHistory.data,
    });

    useEffect(() => {
        if (!address) return;
        fullHistory.refetch();
        layerZeroMessages.refetch();
        if (hyperCoreEnabled) {
            hyperCoreLedger.refetch();
            hyperCoreBalance.refetch();
        }
    }, [refreshKey]);

    useEffect(() => {
        if (!fullHistory.data) return;
        const oftItems = fullHistory.data.filter(isOftHistoryItem);
        // A LayerZero Scan outage only hides the rows the backend does not have
        const remoteTransfers = remoteTransfersFromLayerZero(
            layerZeroMessages.data,
            FASSET_COIN?.type ?? '',
            new Set(oftItems.flatMap(item => [item.txhash, item.guid])
                .filter((id): id is string => !!id)
                .map(id => id.toLowerCase())),
        );
        // A Hyperliquid API outage only hides these rows
        const hyperCoreTransfers = hyperCoreTransfersFromLedger(
            hyperCoreLedger.data,
            address,
            hyperCoreToken.data,
            FASSET_COIN?.type ?? '',
            !!hyperCoreBalance.data?.evmEscrows?.some(item => item.token === hyperCoreToken.data?.index && Number(item.total) > 0),
        );
        const progressItems = fullHistory.data.filter((item): item is IUserProgress => !isOftHistoryItem(item));

        // A direct mint & bridge is a direct mint underneath — should the backend list its mint
        // too, the direct mint & bridge row (with Recover) is the one kept
        const directMintBridgeHashes = new Set(oftItems
            .filter(item => item.action.toLowerCase() === ACTION_TYPE_DIRECT_MINT_BRIDGE)
            .map(item => normalizeXrplHash(item.xrplTxHash ?? item.txhash)));
        const mintRows: ITransaction[] = progressRows(progressItems
            .filter(item => !(item.directMinting && directMintBridgeHashes.has(normalizeXrplHash(item.txhash)))))
            .map(row => ({ ...row, isProgress: true }));

        setTransactions(orderBy([...oftRows(oftItems), ...mintRows, ...remoteTransfers, ...hyperCoreTransfers], ['timestamp'], 'desc'));
    }, [fullHistory.data, layerZeroMessages.data, hyperCoreLedger.data, hyperCoreToken.data, hyperCoreBalance.data, address]);

    // Direct mint & bridge rows the executor sent over LayerZero — the backend tracks only the Flare
    // side, Scan says whether it was delivered. Recovery rows are left out: their executor tx sent
    // no LayerZero message (the FXRP stayed on the Personal Account)
    const sentDirectMints = (fullHistory.data ?? [])
        .filter(isOftHistoryItem)
        .filter(item => item.action.toLowerCase() === ACTION_TYPE_DIRECT_MINT_BRIDGE
            && !!(item.evmTxHash ?? item.oftSent?.txhash)
            && !isDirectMintRecoveryStatus(item.directMintingStatus));
    const deliveryOf = (item: IOFTHistory, messages: IMessage[] | undefined): DirectMintDelivery | undefined => directMintDeliveryOf(messages, {
        dstEid: item.eid ?? item.oftSent?.dstEid,
        toHypercore: item.toHypercore,
        now: Date.now(),
    });
    const sentDirectMintMessages = useMessagesByTx(
        sentDirectMints.map(item => (item.evmTxHash ?? item.oftSent?.txhash)!),
        (txHash, data) => {
            const item = sentDirectMints.find(row => (row.evmTxHash ?? row.oftSent?.txhash) === txHash);
            // Only delivery is final: PAYLOAD_STORED and a failed compose can be retried on LayerZero
            return !item || deliveryOf(item, data) === 'delivered';
        },
        LATEST_TRANSACTIONS_REFRESH_INTERVAL,
        // Testnet Scan does not index Coston2 (every lookup is a 404) — no calls, the backend status shows
        IS_MAINNET,
    );
    // Undefined when Scan has no message (loading, outage, not indexed) — the row keeps the backend's status
    const directMintDelivery = (item: IBridgeTransaction): DirectMintDelivery | undefined => {
        const index = sentDirectMints.findIndex(row => row.txhash === item.txhash);
        return index === -1 ? undefined : deliveryOf(sentDirectMints[index], sentDirectMintMessages[index]?.data);
    };

    useEffect(() => {
        fetchInterval.start();
        return fetchInterval.stop;
    }, []);

    // Stuck rows whose recovery is already paid — "Recovering…" instead of the button
    const sentRecoveries = useDirectMintRecoveryStore(state => state.sent);

    const bridgeTable = useBridgeTransactionTable({
        className,
        isMobile: !!isMobile,
        onRecoverClick: (xrplTxHash, amount) => setRecovery({ xrplTxHash, amount }),
        isRecovering: xrplTxHash => !!sentRecoveries[xrplTxHash],
        directMintDelivery,
    });
    const mintTable = useMintTransactionTable({
        className,
        // XRPL explorer link of a mint's payment
        fAssetCoin: (xrplCoin ?? FASSET_COIN) as IFAssetCoin,
        mintingTransaction,
        onRetryMintClick,
        isMobile: !!isMobile,
        isBridgeTable: true,
    });

    // Same column ids in both tables (the mobile ones have no status) — the bridge headers,
    // each row rendered by its own table
    const columns: IFAssetColumn[] = bridgeTable.columns.map(column => {
        const mintColumn = mintTable.columns.find(c => c.id === column.id);
        const pick = (row: BridgeTableRow) => isProgressRow(row) && mintColumn ? mintColumn : column;
        return {
            ...column,
            tdClass: (row: BridgeTableRow) => {
                const tdClass = pick(row).tdClass;
                return typeof tdClass === 'function' ? tdClass(row) : (tdClass ?? '');
            },
            render: (row: BridgeTableRow) => pick(row).render?.(row),
        };
    });
    const renderAppendRow = (row: BridgeTableRow) => isProgressRow(row)
        ? mintTable.renderAppendRow(row)
        : bridgeTable.renderAppendRow(row);

    const tableKey = `${connectedCoins.map(coin => coin.type).sort().join(',')}-${Object.keys(mintingTransaction).join(',')}`;

    return (
        <>
            <FAssetTable
                key={tableKey}
                items={transactions ?? []}
                // isLoading, not isPending: a disabled query (no wallet) stays pending forever
                loading={fullHistory.isLoading}
                columns={columns}
                // Figma: 1110 px — wider than the Mint page table for Recover next to its badge
                style={{ maxWidth: '1110px' }}
                emptyLabel={t('latest_transactions_card.empty_label')}
                pagination={true}
                perPage={10}
                scrollContainerWidth={500}
                mobileBreakPoint={768}
                appendColumn={renderAppendRow}
            />
            {recovery &&
                <DirectMintRecoveryModal
                    xrplTxHash={recovery.xrplTxHash}
                    amount={recovery.amount}
                    onClose={(isRecovering) => {
                        setRecovery(undefined);
                        // The row changes (or disappears) once the backend indexes the recovery
                        if (isRecovering) fullHistory.refetch();
                    }}
                />
            }
            {retryMintModal}
        </>
    );
}
