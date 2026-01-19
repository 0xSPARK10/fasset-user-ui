import React, { ReactNode } from "react";
import { MantineSize } from "@mantine/core";

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

export interface INetwork {
    chainId: string;
    name: string;
    shortName?: string;
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
    missingUnderlying: boolean;
    underlyingTransactionData: {
        amount: string;
        destinationAddress: string;
        paymentReference: string;
        agentName: string;
        lastUnderlyingBlock: string;
        expirationMinutes: string;
    };
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
    coreVaultData: {
        inflowDiff: string;
        inflowGraph: {
            timestamp: number;
            value: string;
        }[];
        isPositiveInflowDiff: boolean;
        isPositiveOutflowDiff: boolean;
        isPositiveSupplyDiff: boolean;
        outflowDiff: string;
        outflowGraph: {
            timestamp: number;
            value: string;
        }[];
        supplyDiff: string;
        tvlGraph: {
            timestamp: number;
            value: string;
        }[];
    }
    proofOfReserve: {
        timestamp: number;
        value: string;
    }[];
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

export interface IEarn {
    [key: string]: {
        type: string;
        pairs: string[];
        coin_type: string;
        url: string;
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
}