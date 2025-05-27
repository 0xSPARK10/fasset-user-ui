import React from "react";
import CflrIcon from "@/components/icons/CflrIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import BtcIcon from "@/components/icons/BtcIcon";
import DogeIcon from "@/components/icons/DogeIcon";
import SgbIcon from "@/components/icons/SgbIcon";
import C2FlrIcon from "@/components/icons/C2FlrIcon";
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
    ledgerApp: LEDGER_APP.FLARE,
    icon: (props) => <CflrIcon width="32" height="32" {...props} />,
    isMandatory: true,
    explorerAddressUrl: 'https://coston-explorer.flare.network/address',
    explorerTxUrl: 'https://coston-explorer.flare.network/tx',
    mainnet: false
}

export const NETWORK_FLARE_COSTON2_TESTNET: INetwork = {
    chainId: '114',
    name: 'Flare Testnet Coston2',
    rpcUrl: 'https://coston2-api.flare.network/ext/C/rpc',
    namespace: ETH_NAMESPACE,
    methods: ETH_NAMESPACE_METODS,
    addRpcMap: true,
    ledgerApp: LEDGER_APP.FLARE,
    icon: (props) => <C2FlrIcon width="32" height="32" {...props} />,
    isMandatory: true,
    explorerAddressUrl: 'https://coston2-explorer.flare.network/address',
    explorerTxUrl: 'https://coston2-explorer.flare.network/tx',
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
    explorerAddressUrl: 'https://testnet.xrpl.org/accounts',
    explorerTxUrl: 'https://testnet.xrpl.org/transactions',
    mainnet: false
}

export const NETWORK_BTC_TESTNET: INetwork = {
    chainId: '00000000da84f2bafbbc53dee25a72ae',
    name: 'Bitcoin Test Network',
    rpcUrl: 'https://bitcoin-testnet.gateway.tatum.io',
    namespace: BTC_NAMESPACE,
    methods: BTC_NAMESPACE_METHODS,
    ledgerApp: LEDGER_APP.BTC_TEST,
    icon: (props) => <BtcIcon width="32" height="32" {...props} />,
    explorerAddressUrl: 'https://sochain.com/address/BTCTEST',
    explorerTxUrl: 'https://sochain.com/tx/BTCTEST',
    mainnet: false
}

export const NETWORK_DOGE_TESTNET: INetwork = {
    chainId: 'bb0a78264637406b6360aad926284d54',
    name: 'Dogecoin Test Network',
    rpcUrl: 'https://rpc-testnet.dogechain.dog',
    namespace: BTC_NAMESPACE,
    methods: BTC_NAMESPACE_METHODS,
    icon: (props) => <DogeIcon width="18" height="18" {...props} />,
    explorerAddressUrl: 'https://blockexplorer.one/dogecoin/testnet/address',
    explorerTxUrl: 'https://blockexplorer.one/dogecoin/testnet/tx',
    mainnet: false
}

export const NETWORK_SONGBIRD: INetwork = {
    chainId: '19',
    name: 'Songbird Canary-Network',
    rpcUrl: 'https://songbird-api.flare.network/ext/C/rpc',
    namespace: ETH_NAMESPACE,
    methods: ETH_NAMESPACE_METODS,
    addRpcMap: true,
    ledgerApp: LEDGER_APP.FLARE,
    icon: (props) => <SgbIcon width="32" height="32" {...props} />,
    isMandatory: true,
    explorerAddressUrl: 'https://songbird-explorer.flare.network/address',
    explorerTxUrl: 'https://songbird-explorer.flare.network/tx',
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
    explorerAddressUrl: 'https://blockexplorer.one/bitcoin/mainnet/address',
    explorerTxUrl: 'https://blockexplorer.one/bitcoin/mainnet/tx',
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
    explorerAddressUrl: 'https://blockexplorer.one/dogecoin/mainnet/address',
    explorerTxUrl: 'https://blockexplorer.one/dogecoin/mainnet/tx',
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
    explorerAddressUrl: 'https://livenet.xrpl.org/accounts',
    explorerTxUrl: 'https://livenet.xrpl.org/transactions',
    mainnet: true
}

export const NETWORK_FLARE: INetwork = {
    chainId: '14',
    name: 'Flare Mainnet',
    rpcUrl: 'https://flare-api.flare.network/ext/C/rpc"',
    namespace: ETH_NAMESPACE,
    methods: ETH_NAMESPACE_METODS,
    addRpcMap: true,
    ledgerApp: LEDGER_APP.FLARE,
    icon: (props) => <CflrIcon width="32" height="32" {...props} />,
    isMandatory: true,
    explorerAddressUrl: 'https://flare-explorer.flare.network/address',
    explorerTxUrl: 'https://flare-explorer.flare.network/tx',
    mainnet: true
}


