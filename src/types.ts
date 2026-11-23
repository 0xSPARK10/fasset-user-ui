import React, { ReactNode } from "react";
import { MantineSize } from "@mantine/core";
import { BRIDGE_CHAIN, BRIDGE_ROUTE_ACTION, BRIDGE_ROUTE_CHAIN, WalletId } from "./constants";

export type BridgeChain = typeof BRIDGE_CHAIN[keyof typeof BRIDGE_CHAIN];
// How composeMsg + extraOptions are encoded: 'plain' = a straight transfer, 'xrpl' = the redeem
// composer on Flare, 'hyper_core' = the Hyperliquid composer on HyperEVM.
export type BridgeComposeKind = 'plain' | 'xrpl' | 'hyper_core';
// A LayerZero route, `<destination>_from_<source>` — see `bridgeTypeOf` in config/bridge.ts
export type BridgeType = `${BridgeChain | 'xrpl' | 'hyper_core'}_from_${BridgeChain}`;
export type BridgeRouteChain = typeof BRIDGE_ROUTE_CHAIN[keyof typeof BRIDGE_ROUTE_CHAIN];
export type BridgeRouteAction = typeof BRIDGE_ROUTE_ACTION[keyof typeof BRIDGE_ROUTE_ACTION];

// The wallet that signs (FROM) or receives (TO) on a bridge page chain.
export interface IBridgeAccount {
    address?: string;
}

export interface ITableRowAction<T> {
    name: string;
    disabled?: (row: T) => boolean;
    click?: (row: T) => void;
    rightSection?: ReactNode;
    leftSection?: ReactNode;
}

export type IFAssetCoin = INativeBalance & ICoin;

export interface IIconProps {
    width?: string;
    height?: string;
    className?: string;
    style?: any;
    color?: string;
    size?: number | MantineSize | (string & {}) | undefined;
    onClick?: () => void;
    disabled?: boolean;
}

export type INamespaceMethods = string[];

export const enum CoinEnum {
    FXRP = 'FXRP',
    FTestXRP = 'FTestXRP',
    FTestBTC = 'FTestBTC',
    FBTC = 'FBTC',
    FTestDOGE = 'FTestDOGE',
    FDoge = 'FDOGE',
    TestUSDC = 'testUSDC',
    TestUSDT = 'testUSDT',
    USDT0 = 'USDT0',
    TestETH = 'testETH',
    USDX = 'USDX',
    CFLR = 'CFLR',
    SGB = 'SGB',
    C2FLR = 'C2FLR',
    FLR = 'FLR',
    HYPE = 'HYPE',
    ETH = 'ETH',
    BNB = 'BNB',
    MON = 'MON',
    WCFLR = 'WCFLR',
    WC2FLR = 'WC2FLR',
    WFLR = 'WFLR',
    WSGB = 'WSGB',
}

export interface ICoin {
    type: CoinEnum;
    icon: (props?: IIconProps) => React.ReactNode;
    nativeName?: string;
    nativeIcon?: (props?: IIconProps) => React.ReactNode;
    lotSize: number;
    minWalletBalance: number;
    network: INetwork;
    enabled: boolean;
    isFAssetCoin: boolean;
    address?: string; // only when connected to wallet
    balance?: string;
    faucetUrl?: string | string[];
    supportedWallets?: string[];
    decimals: number;
    connectedWallet?: WalletId;
    isMainToken?: boolean;
    accountAddresses?: {
        receiveAddresses: string[];
        changeAddresses: string[];
    },
    xpub?: string;
    bipPath?: string;
    isStableCoin?: boolean;
    contractDecimals?: number; // on-chain decimals for parseUnits (e.g. 18 for wnat, 6 for fasset/collateral)
    feeDecimals?: number; // display decimals for a fee paid in this coin, when it needs more precision than `decimals` (e.g. 6 for ETH); omit to take formatCrossChainFee's default
}

export interface INetwork {
    chainId: string;
    name: string;
    shortName?: string;
    brandName?: string;
    rpcUrl: string;
    namespace: string;
    methods: INamespaceMethods;
    addRpcMap?: boolean;
    ledgerApp?: string;
    icon?: (props?: IIconProps) => React.ReactNode;
    isMandatory?: boolean;
    explorerAddressUrl?: string;
    explorerTxUrl?: string;
    mainnet: boolean;
}

export interface INativeBalance {
    symbol: string;
    balance: string;
    wrapped?: string;
    valueUSD?: string;
    lots?: string;
}

export interface IBestAgent {
    agentAddress: string;
    agentName: string;
    feeBIPS: string;
    collateralReservationFee: string;
    maxLots: string;
    handshakeType: number;
    underlyingAddress: string;
    infoUrl: string;
}

export interface ICrEvent {
    collateralReservationId: string;
    paymentAddress?: string;
    paymentAmount?: string;
    paymentReference?: string;
    lastUnderlyingBlock: string;
    expirationMinutes: string;
}

export interface IMintStatus {
    status: boolean;
    step: number;
    delayed?: boolean;
    delayTimestamp?: number;
}

export interface IRedemptionStatus {
    status: string;
    incomplete: boolean;
    incompleteData: {
        redeemer: string;
        remainingLots?: string;
        remainingAmountUBA?: string;
    }|null;
}

export interface IRedemptionDefaultStatus {
    status: string;
    underlyingPaid?: string;
    vaultCollateralPaid?: {
        token: string;
        value: string;
    }[];
    poolCollateralPaid?: string;
    vaultCollateral?: string;
    fasset?: string;
}

export interface IExecutor {
    executorAddress: string;
    executorFee: string;
    redemptionFee: string;
}

export interface IDirectMintingExecutor {
    executorAddress: string;
    executorFee: string;
}

export interface IAssetManagerAddress {
    address: string;
}

export interface IUnderlyingBalance {
    accountInfo: {
        depositAuth: boolean;
        requireDestTag: boolean;
    },
    balance: string | null;
}

export interface IRedemptionFee {
    redemptionFee: string;
    maxLotsOneRedemption: number;
    maxRedemptionLots: number;
    minimumRedeemAmountUBA: string;
}

export interface IRedemptionQueue {
    /** Max per single redemption to avoid Partial redemption */
    maxLotsOneRedemption: number;
    /** Max redeemable without failing the redemption — use this for UI limits */
    maxLots: number;
    /** Max per single redemption to avoid Partial redemption (in drops) */
    maxAmountOneRedemptionDrops: string;
    /** Max per single redemption to avoid Partial redemption (in XRP) */
    maxAmountOneRedemptionXRP: string;
    maxAmountDrops: string;
    /** Max redeemable without failing the redemption (in XRP) — use this for UI limits */
    maxAmountXRP: string;
}

export interface IMaxLots {
    maxLots: string;
    lotsLimited: boolean;
}

export interface IPool {
    vault: string;
    totalPoolCollateral: string;
    poolCR: string;
    vaultCR: string;
    feeShare: string;
    agentName: string;
    vaultType: string;
    poolExitCR: string;
    poolTopupCR: string;
    freeLots: string;
    status: boolean;
    tokenAddress: string;
    transferableTokens: string;
    fassetDebt: string;
    userPoolBalance?: string;
    userPoolFees?: string;
    userPoolNatBalance?: string;
    userPoolNatBalanceInUSD?: string;
    userPoolShare?: string;
    userPoolTokensFull?: string;
    health: number;
    mintCount: number;
    numLiquidations: number;
    pool: string;
    redeemRate: string;
    collateralToken: string;
    poolCollateralUSD: string;
    url: string;
    vaultCollateral: string;
    nonTimeLocked?: string;
    mintingPoolCR: string;
    poolCCBCR: string;
    poolMinCR: string;
    poolSafetyCR: string;
    mintingVaultCR: string;
    vaultCCBCR: string;
    vaultMinCR: string;
    vaultSafetyCR: string;
    mintFee: string;
    userPoolFeesUSD?: string;
    allLots: number;
    mintedAssets: string;
    mintedUSD: string;
    remainingAssets: string;
    remainingUSD: string;
    poolOnlyCollateralUSD: string;
    vaultOnlyCollateralUSD: string;
    limitUSD: string;
    totalPortfolioValueUSD: string;
    description: string;
    lifetimeClaimedPoolFormatted?: string;
    lifetimeClaimedPoolUSDFormatted?: string;
    infoUrl: string;
}

export interface IMaxWithdraw {
    natReturn: string;
    fees: string;
}

export interface IPoolsBalance {
    balance: string;
}

export interface IMaxCptWithdraw {
    maxWithdraw: string;
}

export interface IAgent {
    vault: string;
    totalPoolCollateral: string;
    poolCR: string;
    vaultCR: string;
    feeShare: string;
    agentName: string;
    vaultType: string;
    poolExitCR: string;
    freeLots: string;
    status: boolean;
    mintFee: string;
    feeBIPS: string;
    health: number;
    url: string;
    handshakeType: number;
    underlyingAddress: string;
}

export interface ISelectedAgent {
    name: string;
    address: string;
    feeBIPS: string;
    underlyingAddress: string;
    infoUrl: string;
}

export interface IDepositLots {
    createdLots: number;
}

export interface IUserProgress {
    action: string;
    timestamp: number;
    amount: string;
    fasset: string;
    status: boolean;
    defaulted: boolean;
    ticketID?: string;
    vaultToken?: string;
    vaultTokenValueRedeemed?: string;
    poolTokenValueRedeemed?: string;
    underlyingPaid?: string;
    incomplete?: boolean;
    remainingLots?: string | null;
    rejected?: boolean;
    takenOver?: boolean;
    rejectionDefaulted?: boolean;
    txhash: string;
    evm_txhash: string | null;
    missingUnderlying: boolean;
    underlyingTransactionData: {
        amount: string;
        destinationAddress: string;
        paymentReference: string;
        agentName: string;
        lastUnderlyingBlock: string;
        expirationMinutes: string;
    };
    directMinting?: boolean;
    directMintingStatus?: 'INPROGRESS' | 'DELAYED' | 'EXECUTED' | 'EXECUTED_TO_SMART_ACCOUNT' | 'MINTING_PAYMENT_TOO_SMALL_FOR_FEE';
    delayTimestamp?: number | null;
    redeemWithTag?: boolean;
    redeemStatus?: 'INPROGRESS' | 'FAILED' | 'BLOCKED' | 'DEFAULTED' | 'COMPLETED';
    destinationTag?: string;
    remainingAmount?: string;
}

export interface IEstimateFee {
    estimatedFee: string;
    extraBTC: string;
}

export interface IRedemptionDefault {
    incomplete: boolean;
    remainingLots?: string;
    remainingAmountUBA?: string;
}

export interface IUtxo {
    address?: string;
    hexTx: string;
    index: number;
    txid: number;
    utxoAddress: string;
    value: string;
    vout: number;
}

export interface IUtxoForTransaction {
    selectedUtxos: IUtxo[];
    returnAddresses: string[];
    estimatedFee: number;
}

export interface ILifetimeClaimed {
    fasset: string;
    claimed: string;
}

export interface IEcoSystemInfoSupplyByFasset {
    allLots: number;
    availableToMintAsset: string;
    availableToMintLots: number;
    availableToMintUSD: string;
    fasset: string;
    minted: string;
    mintedLots: number;
    mintedPercentage: string;
    supply: string;
    mintingCap: string;
    mintingCapUSD: string;
}

export interface IEcosystemInfo {
    agentCollateral: string;
    agentsInLiquidation: number;
    coreVaultInflows: string;
    coreVaultInflowsUSD: string;
    coreVaultOutflows: string;
    coreVaultOutflowsUSD: string;
    coreVaultSupply: string;
    coreVaultSupplyUSD: string;
    numAgents: number;
    numHolders: string;
    numLiquidations: number;
    numMints: number;
    numRedeems: number;
    numTransactions: string;
    overCollaterazied: string;
    poolRewards: {
        fasset: string;
        rewards: string;
        rewardsUSD: string;
    }[];
    rewardsAvailableUSD: string;
    supplyByCollateral: {
        symbol: string;
        supply: string;
        supplyUSD: string;
    }[];
    supplyByFasset: IEcoSystemInfoSupplyByFasset[];
    totalCollateral: string;
    totalMinted: string;
    totalPoolRewardsPaidUSD: string;
    tvl: string;
    tvlPoolsNat: string;
    proofOfReserve: {
        ratio: string;
        reserve: string;
        reserveUSD: string;
        total: string;
        totalUSD: string;
    }
    limits: ILimitsData;
}

export interface ISubmitTx {
    hash: string;
}

export interface IGraphPoint {
    timestamp: number;
    value: string;
}

export interface ITimeData {
    supplyDiff: {
        fasset: string;
        diff: string;
        isPositive: boolean;
    }[];
    mintGraph: IGraphPoint[];
    redeemGraph: IGraphPoint[];
    tvlGraph: IGraphPoint[];
    bestPools: {
        collateralSymbol: string;
        fasset: string;
        name: string;
        poolAddress: string;
        rewardsDiff: string;
        rewardsDiffPositive: boolean;
        rewardsPaid: string;
        tvl: string;
        tvlDiff: string;
        tvlDiffPositive: boolean;
        url: string;
        vaultAddress: string;
    }[];
    totalCollateralDiff: string;
    isPositiveCollateralDiff: boolean;
    coreVaultData: {
        inflowDiff: string;
        inflowGraph: IGraphPoint[];
        isPositiveInflowDiff: boolean;
        isPositiveOutflowDiff: boolean;
        isPositiveSupplyDiff: boolean;
        outflowDiff: string;
        outflowGraph: IGraphPoint[];
        supplyDiff: string;
        tvlGraph: IGraphPoint[];
    }
    proofOfReserve: IGraphPoint[];
}

export interface ICrStatus {
    status: boolean;
    accepted?: boolean;
    collateralReservationId: string;
    paymentAddress: string;
    paymentAmount: string;
    paymentReference: string;
}

export interface IReturnAddress {
    addresses: string[];
    estimatedFee: number;
    utxos: IUtxo[];
}

export interface IPrepareUtxo {
    psbt: string;
    selectedUtxos: IUtxo[];
}

export interface ITrailingFee {
    trailingFee: string;
}

export interface IFassetState {
    fasset: string;
    state: boolean;
}

export interface IReward {
    claimedRflr: string;
    claimedUsd: string;
    claimableRflr: string;
    claimableUsd: string;
    points: string;
    share: string;
    shareUsd: string;
    numTickets: number;
    prevBiweeklyPlace: number;
    prevBiweeklyRflr: string;
    prevBiweeklyRflrUSD: string;
    participated: boolean;
    rewardsDistributed: boolean;
}

export interface IFassetPrice {
    price: number;
}

export interface IRedemptionFeeData {
    fasset: string;
    feePercentage: string;
    feeUSD: string;
}

export interface IMintEnabled {
    fasset: string;
    status: boolean;
}

export interface IMintingCapInfo {
    totalSupply: string;
    mintingCap: string;
}

export interface IEarn {
    [key: string]: {
        type: string;
        pairs: string[];
        coin_type: string;
        url: string;
        yt_url: string;
        description: string;
    }
}


export interface IMessage {
    pathway: {
        srcEid: number;
        dstEid: number;
        sender: {
            address: string;
            chain: string;
        };
        receiver: {
            address: string;
            chain: string;
        };
        id: string;
        nonce: number;
    };
    source: {
        status: "SUCCEEDED" | "FAILED" | "PENDING" | string;
        tx: {
            txHash: string;
            blockHash: string;
            blockNumber: string;
            blockTimestamp: number;
            from: string;
            payload: string;
            readinessTimestamp: number;
            options: {
                lzReceive: {
                    gas: string;
                    value: string;
                };
                ordered: boolean;
            };
        };
    };
    destination: {
        nativeDrop: {
            status: "N/A" | "SUCCEEDED" | "FAILED" | "PENDING" | string;
        };
        lzCompose: {
            status: "N/A" | "SUCCEEDED" | "FAILED" | "PENDING" | string;
        };
        tx: {
            txHash: string;
            blockHash: string;
            blockNumber: number;
            blockTimestamp: number;
        };
        status: "SUCCEEDED" | "FAILED" | "PENDING" | string;
    };
    verification: {
        dvn: {
            dvns: Record<string, {
                txHash: string;
                blockHash: string;
                blockNumber: number;
                blockTimestamp: number;
                proof: {
                    packetHeader: string;
                    payloadHash: string;
                };
                optional: boolean;
                status: "SUCCEEDED" | "FAILED" | "PENDING" | string;
            }>;
            status: "SUCCEEDED" | "FAILED" | "PENDING" | string;
        };
        sealer: {
            tx: {
                txHash: string;
                blockHash: string;
                blockNumber: number;
                blockTimestamp: number;
            };
            status: "SUCCEEDED" | "FAILED" | "PENDING" | string;
        };
    };
    guid: string;
    config: {
        error: boolean;
        receiveLibrary: string;
        sendLibrary: string;
        inboundConfig: {
            confirmations: number;
            requiredDVNCount: number;
            optionalDVNCount: number;
            optionalDVNThreshold: number;
            requiredDVNs: string[];
            requiredDVNNames: string[];
            optionalDVNs: string[];
            optionalDVNNames: string[];
        };
        outboundConfig: {
            confirmations: number;
            requiredDVNCount: number;
            optionalDVNCount: number;
            optionalDVNThreshold: number;
            requiredDVNs: string[];
            requiredDVNNames: string[];
            optionalDVNs: string[];
            optionalDVNNames: string[];
            executor: string;
        };
        ulnSendVersion: string;
        ulnReceiveVersion: string;
    };
    status: {
        name: string;
        message: string;
    };
    created: string;
    updated: string;
}

export interface IHyperCoreInfo {
    balances: {
        coin: string;
        token: number;
        total: string;
        hold: string;
        entryNtl: string;
    }[];
    // Sent from HyperEVM, not credited on Core yet (e.g. the Core account does not exist)
    evmEscrows?: {
        coin: string;
        token: number;
        total: string;
    }[];
}

// One entry of Hyperliquid `POST /info {type: "userNonFundingLedgerUpdates"}`
export interface IHyperCoreLedgerUpdate {
    time: number;
    hash: string;
    delta: {
        type: string;
        user?: string;
        destination?: string;
        token?: string;
        amount?: string;
        [key: string]: unknown;
    };
}

export interface IOFTHistory {
    action: string;
    timestamp: number;
    eid: number;
    txhash: string;
    amountSent: string;
    amountReceived: string;
    amount: string;
    toHypercore: boolean;
    fasset: string;
    status: boolean;
    defaulted: boolean;
    ticketID: string;
    vaultToken: string;
    vaultTokenValueRedeemed: string;
    poolTokenValueRedeemed: string;
    underlyingPaid: string;
    incomplete: boolean;
    remainingLots: string;
    redemptionBlocked: boolean;
    // LayerZero message of a remote → Flare row (RECEIVE, REDEEM, REDEEMFAIL) — its `txhash` is the
    // Flare tx, so this is what links it to the LayerZero Scan message
    guid?: string;
    // DIRECT_MINT_BRIDGE rows only (userHistory?xrpAddress=) — see dev-docs/DIRECT_MINT_BRIDGE_BACKEND.md
    // Uppercase XRPL hash without 0x (same as txhash)
    xrplTxHash?: string;
    // The executor's source EVM tx; null until it ran
    evmTxHash?: string | null;
    // Source lifecycle — `status: true` only means the source was processed, not delivered
    directMintingStatus?: "INPROGRESS" | "DELAYED" | "AWAITING_RECOVERY" | "RECOVERY_PENDING" | "RECOVERED" | "MINTING_PAYMENT_TOO_SMALL_FOR_FEE" | "EXECUTED_TO_SMART_ACCOUNT" | "EXECUTED";
    // `amount` is an estimate until the OFT send matches
    amountEstimated?: boolean;
    // Unix seconds
    delayTimestamp?: number | null;
    // Null until matched — a row without it is provisional and may disappear
    oftSent?: {
        guid: string;
        dstEid: number;
        fromAddress: string;
        amountSentLD: string;
        amountReceivedLD: string;
        txhash: string;
    } | null;
}

export interface IOFTRedemptionFees{
  composerFeePPM: string;
  executorAddress: string;
  executorFee: string;  
}

export interface IDirectMintingInfo {
    paymentAddress: string;
    minMintingAmount?: string;
    mintingFeeBIPS: string;
    minimumMintingFeeUBA: string;
    executorAddress: string;
    executorFee: string;
    fassetsExecutorFee: string;
}

export interface IMintingRecipient {
    recipient: string;
}

export interface ITagsByAddress {
    tagId: string;
    mintingRecipient: string;
    allowedExecutor: string;
    executorChangePending?: boolean;
    pendingNewExecutor?: string;
    executorChangeActiveAfterTs?: number;
}

export interface ITagReservationFee {
    reservationFee: string;
}

// Direct-minting throttle from default (FXRP) AssetManager. All *Drops are 256-bit
// integers as strings; decimals is the fasset's decimals (6 for FXRP). Falls back
// to "0" / 0 when the AssetManager has no limiter.
export interface ILimitsData {
    hourlyLimitDrops: string;
    hourlyMintedDrops: string;
    dailyLimitDrops: string;
    dailyMintedDrops: string;
    decimals: number;
}

// Amount as the smart-accounts API returns it: `exact` in raw units (FXRP: 6 decimals, XRP: drops),
// `value` the same as a decimal, `usd` its USD value. The backend may send `exact` as a number or a
// string — read it through BigInt(String(exact)), never do maths on it as a number
export interface ISmartAccountsBalance {
    exact: number | string;
    value: number;
    usd: number;
}

// GET /direct_mint/fee?action=BRIDGE — nonbinding preview, /direct_mint/request re-quotes
export interface IDirectMintFee {
    action: string;
    // What the user pays on top of the amount (minting_fee + operator_fee)
    payable_fee: ISmartAccountsBalance;
    overall_fee: ISmartAccountsBalance;
    // FXRP that lands on the destination
    to_receive: ISmartAccountsBalance;
    breakdown: {
        type: string;
        minting_fee: ISmartAccountsBalance;
        // Executor's fee — funds the LayerZero delivery
        operator_fee: ISmartAccountsBalance;
    };
    payment_address: string;
}

// POST /direct_mint/request — authoritative: sign exactly this
export interface IDirectMintRequestResult {
    action: string;
    amount: ISmartAccountsBalance;
    total_fee: ISmartAccountsBalance;
    to_receive: ISmartAccountsBalance | null;
    payment_address: string;
    // Goes in the XRP payment's memo as is
    memo: string;
    personal_account: string;
}

// GET /direct_mint/status/{xrplTxHash}
// Recovery payment for a stuck direct mint — pay exactly this, the memo must not be rebuilt
export interface IDirectMintRecoveryMemo {
    type: "RecoveryMemo";
    reason: string;
    memo: string;
    payment_address: string;
    amount: ISmartAccountsBalance;
    wallet_id: number;
}

export interface IDirectMintStatus {
    // received | created | delayed | executed | memo_skipped | awaiting_recovery | recovery_pending | error | …
    status: string;
    // BRIDGE for direct mint & bridge
    type: string;
    payment?: {
        // XRPL address that paid — the recovery must come from the same wallet
        transaction_account: string;
    };
    action: {
        action: string;
        amount?: ISmartAccountsBalance;
        destination_amount?: ISmartAccountsBalance;
        // Where a recovery releases the FXRP (on Flare)
        personal_account?: string;
    };
    // Source EVM tx of the bridge send — LayerZero Scan is polled with it
    tx_hash: string | null;
    error: string | null;
    delayed_to: string | null;
    // MintResult / RecoveryMemo / RecoveryReplayPending / RecoverySent / …
    payload: IDirectMintRecoveryMemo | { type: string } | null;
}
