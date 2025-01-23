import React, { ReactNode } from "react";
import { MantineSize } from "@mantine/core";
import { INativeBalance } from "@/types/models";

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
