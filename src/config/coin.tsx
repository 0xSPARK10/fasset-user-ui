import React from "react";
import { CoinEnum, ICoin } from "@/types";
import XrpIcon from "@/components/icons/XrpIcon";
import FXrpIcon from "@/components/icons/FXrpIcon";
import FBtcIcon from "@/components/icons/FBtcIcon";
import FDogeIcon from "@/components/icons/FDogeIcon";
import BtcIcon from "@/components/icons/BtcIcon";
import DogeIcon from "@/components/icons/DogeIcon";
import CflrIcon from "@/components/icons/CflrIcon";
import SgbIcon from "@/components/icons/SgbIcon";
import EthIcon from "@/components/icons/EthIcon";
import UsdcIcon from "@/components/icons/UsdcIcon";
import UsdtIcon from "@/components/icons/UsdtIcon";
import UsdxIcon from "@/components/icons/UsdxIcon";
import {
    NETWORK_BTC,
    NETWORK_BTC_TESTNET,
    NETWORK_DOGE,
    NETWORK_DOGE_TESTNET,
    NETWORK_FLARE_COSTON_TESTNET,
    NETWORK_SONGBIRD,
    NETWORK_XRPL,
    NETWORK_XRPL_TESTNET
} from "@/config/networks";
import { BIP44_PATH, WALLET } from "@/constants";

const enabledUnderlyingFassets = process.env.ENABLED_UNDERLYING_FASSETS && process.env.ENABLED_UNDERLYING_FASSETS.length > 0
    ? process.env.ENABLED_UNDERLYING_FASSETS.split(',').map(fasset => fasset.toLowerCase())
    : [];

const isMainnet = process.env.NETWORK === 'mainnet';

export const CFLR_COIN: ICoin = {
    type: CoinEnum.CFLR,
    icon: (props) => <CflrIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'CFLR',
    nativeIcon: (props) => <CflrIcon width="18" height="18" {...props} />,
    lotSize: 1,
    minWalletBalance: 2,
    network: NETWORK_FLARE_COSTON_TESTNET,
    enabled: !isMainnet,
    isFAssetCoin: false,
    faucetUrl: 'https://faucet.flare.network/coston',
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.META_MASK, WALLET.LEDGER],
    decimals: 2,
    isMainToken: true,
    bipPath: BIP44_PATH.TESTNET.ETH
}

export const FTEST_XRP: ICoin = {
    type: CoinEnum.FTestXRP,
    icon: (props) => <FXrpIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'XRP',
    nativeIcon: (props) => <XrpIcon width="18" height="18" className="flex-shrink-0" {...props} />,
    lotSize: 20,
    minWalletBalance: 20,
    network: NETWORK_XRPL_TESTNET,
    enabled: !isMainnet && enabledUnderlyingFassets.includes(CoinEnum.FTestXRP.toLowerCase()),
    isFAssetCoin: true,
    faucetUrl: 'https://test.bithomp.com/faucet',
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.LEDGER],
    decimals: 2,
    bipPath: BIP44_PATH.TESTNET.XRP
}

export const FTEST_BTC: ICoin = {
    type: CoinEnum.FTestBTC,
    icon: (props) => <FBtcIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'BTC',
    nativeIcon: (props) => <BtcIcon width="18" height="18" {...props} />,
    lotSize: 0.0004,
    minWalletBalance: 0.0004,
    network: NETWORK_BTC_TESTNET,
    enabled: !isMainnet && enabledUnderlyingFassets.includes(CoinEnum.FTestBTC.toLowerCase()),
    isFAssetCoin: true,
    faucetUrl: ['https://coinfaucet.eu/en/btc-testnet4/', 'https://faucet.testnet4.dev/'],
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.LEDGER],
    decimals: 8,
    bipPath: BIP44_PATH.TESTNET.BTC
}

export const FTEST_DOGE: ICoin = {
    type: CoinEnum.FTestDOGE,
    icon: (props) => <FDogeIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'DOGE',
    nativeIcon: (props) => <DogeIcon width="18" height="18" {...props} />,
    lotSize: 100,
    minWalletBalance: 0,
    network: NETWORK_DOGE_TESTNET,
    enabled: !isMainnet && enabledUnderlyingFassets.includes(CoinEnum.FTestDOGE.toLowerCase()),
    isFAssetCoin: true,
    faucetUrl: ['https://faucet.doge.toys/', 'https://dogecoin-faucet.ruan.dev/'],
    supportedWallets: [WALLET.WALLET_CONNECT],
    decimals: 2,
    bipPath: BIP44_PATH.TESTNET.DOGE
}

export const TEST_USDT: ICoin = {
    type: CoinEnum.TestUSDT,
    icon: (props) => <UsdtIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    lotSize: 0,
    minWalletBalance: 0,
    network: NETWORK_FLARE_COSTON_TESTNET,
    enabled: !isMainnet,
    isFAssetCoin: false,
    isStableCoin: true,
    decimals: 2
}

export const TEST_USDC: ICoin = {
    type: CoinEnum.TestUSDC,
    icon: (props) => <UsdcIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    lotSize: 0,
    minWalletBalance: 0,
    network: NETWORK_FLARE_COSTON_TESTNET,
    enabled: !isMainnet,
    isFAssetCoin: false,
    isStableCoin: true,
    decimals: 2
}

export const TEST_ETH: ICoin = {
    type: CoinEnum.TestETH,
    icon: (props) => <EthIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    lotSize: 0,
    minWalletBalance: 0,
    network: NETWORK_FLARE_COSTON_TESTNET,
    enabled: !isMainnet,
    isFAssetCoin: false,
    decimals: 2
}

export const SGB: ICoin = {
    type: CoinEnum.SGB,
    icon: (props) => <SgbIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'SGB',
    nativeIcon: (props) => <SgbIcon width="18" height="18" {...props} />,
    lotSize: 1,
    minWalletBalance: 2,
    network: NETWORK_SONGBIRD,
    enabled: isMainnet,
    isFAssetCoin: false,
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.META_MASK, WALLET.LEDGER],
    decimals: 2,
    isMainToken: true,
    bipPath: BIP44_PATH.MAINNET.ETH,
}

export const FXRP: ICoin = {
    type: CoinEnum.FXRP,
    icon: (props) => <FXrpIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'XRP',
    nativeIcon: (props) => <XrpIcon width="18" height="18" className="flex-shrink-0" {...props} />,
    lotSize: 100,
    minWalletBalance: 20,
    network: NETWORK_XRPL,
    enabled: isMainnet && enabledUnderlyingFassets.includes(CoinEnum.FXRP.toLowerCase()),
    isFAssetCoin: true,
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.LEDGER],
    decimals: 2,
    bipPath: BIP44_PATH.MAINNET.XRP
}

export const FBTC: ICoin = {
    type: CoinEnum.FBTC,
    icon: (props) => <FBtcIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'BTC',
    nativeIcon: (props) => <BtcIcon width="18" height="18" {...props} />,
    lotSize: 0.1,
    minWalletBalance: 0.0004,
    network: NETWORK_BTC,
    enabled: isMainnet && enabledUnderlyingFassets.includes(CoinEnum.FBTC.toLowerCase()),
    isFAssetCoin: true,
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.LEDGER],
    decimals: 8,
    bipPath: BIP44_PATH.MAINNET.BTC
}

export const FDOGE: ICoin = {
    type: CoinEnum.FDoge,
    icon: (props) => <FDogeIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    nativeName: 'DOGE',
    nativeIcon: (props) => <DogeIcon width="18" height="18" {...props} />,
    lotSize: 200,
    minWalletBalance: 0,
    network: NETWORK_DOGE,
    enabled: isMainnet && enabledUnderlyingFassets.includes(CoinEnum.FDoge.toLowerCase()),
    isFAssetCoin: true,
    supportedWallets: [WALLET.WALLET_CONNECT, WALLET.LEDGER],
    decimals: 2,
    bipPath: BIP44_PATH.MAINNET.DOGE
}

export const USDX: ICoin = {
    type: CoinEnum.USDX,
    icon: (props) => <UsdxIcon width="32" height="32" className="flex-shrink-0" {...props} />,
    lotSize: 0,
    minWalletBalance: 0,
    network: NETWORK_SONGBIRD,
    enabled: isMainnet,
    isFAssetCoin: false,
    isStableCoin: true,
    decimals: 2
}

export const COINS = [
    CFLR_COIN,
    FTEST_XRP,
    FTEST_BTC,
    FTEST_DOGE,
    TEST_USDT,
    TEST_USDC,
    TEST_ETH,
    SGB,
    FXRP,
    FBTC,
    FDOGE,
    USDX
]


