import { MantineSize } from "@mantine/core";
import React, { ReactNode } from "react";

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

export type INamespaceMethods = string[];

export interface INetwork {
    chainId: string;
    name: string;
    rpcUrl: string;
    namespace: string;
    methods: INamespaceMethods;
    addRpcMap?: boolean;
    ledgerApp?: string;
    icon?: (props?: IIconProps) => React.ReactNode;
    isMandatory?: boolean;
    explorerUrl?: string;
    mainnet: boolean;
}


export interface ICrEvent {
    collateralReservationId: string;
    paymentAddress?: string;
    paymentAmount?: string;
    paymentReference?: string;
}

export interface IMintStatus {
    status: boolean;
    step: number;
}

export interface IRedemptionStatus {
    status: string;
    incomplete: boolean;
    incompleteData: {
        redeemer: string;
        remainingLots: string;
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

export interface IAssetManagerAddress {
    address: string;
}

export interface IUnderylingBalance {
    balance: string|null;
}

export interface IRedemptionFee {
    redemptionFee: number;
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
    handshakeType: number;
    underlyingAddress: string;
    infoUrl: string;
}

export interface IDepositLots {
    createdLots: number;
}

export interface ITableRowAction<T> {
    name: string;
    disabled?: (row: T) => boolean;
    click?: (row: T) => void;
    rightSection?: ReactNode;
    leftSection?: ReactNode;
}

export enum CoinEnum {
    FXRP = 'FXRP',
    FTestXRP = 'FTestXRP',
    FTestBTC = 'FTestBTC',
    FBTC = 'FBTC',
    FTestDOGE = 'FTestDOGE',
    FDoge = 'FDOGE',
    TestUSDC = 'testUSDC',
    TestUSDT = 'testUSDT',
    TestETH = 'testETH',
    USDX = 'USDX',
    CFLR = 'CFLR',
    SGB = 'SGB'
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
    connectedWallet?: string;
    isMainToken?: boolean;
    accountAddresses?: {
        receiveAddresses: string[];
        changeAddresses: string[];
    },
    xpub?: string;
    bipPath?: string;
    isStableCoin?: boolean;
}

export type IFAssetCoin = INativeBalance & ICoin;

export interface IIconProps {
    width?: string;
    height?: string;
    className?: string;
    style?: any;
    size?: number | MantineSize | (string & {}) | undefined;
    onClick?: () => void;
}

export interface IUserProgress {
    action: string;
    timestamp: number;
    amount: string;
    fasset: string;
    status: boolean;
    txhash: string;
    defaulted: boolean;
    ticketID: string;
    underlyingPaid: string;
    vaultToken?: string;
    vaultTokenValueRedeemed?: string;
    poolTokenValueRedeemed?: string;
    remainingLots: string|null;
    incomplete: boolean;
}

export interface IEstimateFee {
    estimatedFee: string;
    extraBTC: string;
}

export interface IRedemptionDefault {
    incomplete: boolean;
    remainingLots?: string;
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
    availableToMintLots: number;
    availableToMintUSD: string;
    fasset: string;
    minted: string;
    mintedPercentage: string;
    supply: string;
}

export interface IEcosystemInfo {
    agentCollateral: string;
    tvl: string;
    tvlPoolsNat: string;
    numTransactions: string;
    agentsInLiquidation: number;
    numAgents: number;
    numLiquidations: number;
    overCollaterazied: string;
    rewardsAvailableUSD: string;
    supplyByCollateral: {
        symbol: string;
        supply: string;
        supplyUSD: string;
    }[];
    supplyByFasset: IEcoSystemInfoSupplyByFasset[];
    totalCollateral: string;
    totalMinted: string;
    numMints: number;
    totalPoolRewardsPaidUSD: string;
    poolRewards: {
        fasset: string;
        rewards: string;
        rewardsUSD: string;
    }[];
    numHolders: string;
}

export interface ISubmitTx {
    hash: string;
}

export interface ITimeData {
    supplyDiff: {
        fasset: string;
        diff: string;
        isPositive: boolean;
    }[];
    mintGraph: {
        timestamp: number;
        value: string;
    }[];
    redeemGraph: {
        timestamp: number;
        value: string;
    }[];
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
}
