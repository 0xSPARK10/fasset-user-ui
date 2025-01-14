import React from "react";
import CflrIcon from "@/components/icons/CflrIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import BtcIcon from "@/components/icons/BtcIcon";
import DogeIcon from "@/components/icons/DogeIcon";
import SgbIcon from "@/components/icons/SgbIcon";
import { INamespaceMethods, INetwork } from "@/types";
import { LEDGER_APP } from "@/constants";

export const ETH_NAMESPACE = 'eip155';
export const XRP_NAMESPACE = 'xrpl';
export const BTC_NAMESPACE = 'bip122';

export const ETH_NAMESPACE_METODS: INamespaceMethods = [
    'eth_sign',
    'eth_sendTransaction',
    'eth_requestAccounts'
];

export const XRP_NAMESPACE_METHODS: INamespaceMethods = [
    'xrpl_signTransaction'
];

export const BTC_NAMESPACE_METHODS: INamespaceMethods = [
    'sendTransfer',
    'getAccountAddresses',
    'signPsbt'
];

export const NETWORK_FLARE_COSTON_TESTNET: INetwork = {
    chainId: '16',
    name: 'Flare Testnet Coston',
    rpcUrl: 'https://coston-api.flare.network/ext/C/rpc',
    namespace: ETH_NAMESPACE,
    methods: ETH_NAMESPACE_METODS,
    addRpcMap: true,
    ledgerApp: LEDGER_APP.ETH,
    icon: (props) => <CflrIcon width="32" height="32" {...props} />,
    isMandatory: true,
    explorerUrl: 'https://coston-explorer.flare.network',
    mainnet: false
}

export const NETWORK_XRPL_TESTNET: INetwork = {
    chainId: '1',
    name: 'XRPL Testnet',
    rpcUrl: 'https://testnet.xrpl-labs.com',
    namespace: XRP_NAMESPACE,
    methods: XRP_NAMESPACE_METHODS,
    ledgerApp: LEDGER_APP.XRP,
    icon: (props) => <XrpIcon width="32" height="32" {...props} />,
    explorerUrl: 'https://testnet.xrpl.org',
    mainnet: false
}

export const NETWORK_BTC_TESTNET: INetwork = {
    chainId: '000000000933ea01ad0ee984209779ba',
    name: 'Bitcoin Test Network',
    rpcUrl: 'https://bitcoin-testnet.gateway.tatum.io',
    namespace: BTC_NAMESPACE,
    methods: BTC_NAMESPACE_METHODS,
    ledgerApp: LEDGER_APP.BTC_TEST,
    icon: (props) => <BtcIcon width="32" height="32" {...props} />,
    explorerUrl: 'https://blockexplorer.one/bitcoin/testnet',
    mainnet: false
}

export const NETWORK_DOGE_TESTNET: INetwork = {
    chainId: 'bb0a78264637406b6360aad926284d54',
    name: 'Dogecoin Test Network',
    rpcUrl: 'https://rpc-testnet.dogechain.dog',
    namespace: BTC_NAMESPACE,
    methods: BTC_NAMESPACE_METHODS,
    icon: (props) => <DogeIcon width="18" height="18" {...props} />,
    explorerUrl: 'https://blockexplorer.one/dogecoin/testnet',
    mainnet: false
}

export const NETWORK_SONGBIRD: INetwork = {
    chainId: '19',
    name: 'Songbird Canary-Network',
    rpcUrl: 'https://songbird-api.flare.network/ext/C/rpc',
    namespace: ETH_NAMESPACE,
    methods: ETH_NAMESPACE_METODS,
    addRpcMap: true,
    ledgerApp: LEDGER_APP.ETH,
    icon: (props) => <SgbIcon width="32" height="32" {...props} />,
    isMandatory: true,
    explorerUrl: 'https://songbird-explorer.flare.network',
    mainnet: true
}

export const NETWORK_BTC: INetwork = {
    chainId: '000000000019d6689c085ae165831e93',
    name: 'Bitcoin Network',
    rpcUrl: 'https://bitcoin-mainnet.gateway.tatum.io',
    namespace: BTC_NAMESPACE,
    methods: BTC_NAMESPACE_METHODS,
    ledgerApp: LEDGER_APP.BTC,
    icon: (props) => <BtcIcon width="32" height="32" {...props} />,
    explorerUrl: 'https://blockexplorer.one/bitcoin/mainnet',
    mainnet: true
}

export const NETWORK_DOGE: INetwork = {
    chainId: '1a91e3dace36e2be3bf030a65679fe82',
    name: 'Dogecoin Network',
    rpcUrl: 'https://rpc.dogechain.dog',
    namespace: BTC_NAMESPACE,
    methods: BTC_NAMESPACE_METHODS,
    ledgerApp: LEDGER_APP.DOGE,
    icon: (props) => <DogeIcon width="18" height="18" {...props} />,
    explorerUrl: 'https://blockexplorer.one/dogecoin/mainnet',
    mainnet: true
}

export const NETWORK_XRPL: INetwork = {
    chainId: '0',
    name: 'XRPL',
    rpcUrl: 'https://s1.ripple.com:51234',
    namespace: XRP_NAMESPACE,
    methods: XRP_NAMESPACE_METHODS,
    ledgerApp: LEDGER_APP.XRP,
    icon: (props) => <XrpIcon width="32" height="32" {...props} />,
    explorerUrl: 'https://livenet.xrpl.org',
    mainnet: true
}


