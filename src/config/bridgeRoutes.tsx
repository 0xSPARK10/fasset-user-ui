import React from "react";
import { BRIDGE_CHAIN, BRIDGE_ROUTE_ACTION, BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BridgeChain, BridgeRouteAction, BridgeRouteChain, BridgeType, IIconProps } from "@/types";
import {
    BRIDGE_LZ_ROUTES,
    BridgeConfig,
    bridgeChainEid,
    bridgeTypeOf,
    getBridgeConfig,
    isBridgeChainEnabled
} from "@/config/bridge";
import { FASSET_COIN } from "@/config/coin";
import XrpIcon from "@/components/icons/XrpIcon";
import FXrpFlareIcon from "@/components/icons/FXrpFlareIcon";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import FXrpEthIcon from "@/components/icons/FXrpEthIcon";
import FXrpBnbIcon from "@/components/icons/FXrpBnbIcon";
import FXrpBaseIcon from "@/components/icons/FXrpBaseIcon";
import FXrpKatanaIcon from "@/components/icons/FXrpKatanaIcon";
import FXrpMonadIcon from "@/components/icons/FXrpMonadIcon";
import { isSmartAccountsApiConfigured } from "@/api/directMint";

export interface IBridgeRouteChain {
    chain: BridgeRouteChain;
    // Token held on this chain — the underlying on XRPL, the FAsset everywhere else.
    tokenSymbol: string;
    // i18n key under `bridge_page.chains`
    labelKey: string;
    icon: (props?: IIconProps) => React.ReactNode;
}

export interface IBridgeRoute {
    from: BridgeRouteChain;
    to: BridgeRouteChain;
    action: BridgeRouteAction;
    // Set only for BRIDGE_ROUTE_ACTION.BRIDGE — the LayerZero route the existing hooks run.
    bridgeType?: BridgeType;
    // Set only for BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE — see DIRECT_MINT_DESTINATIONS
    lzDestination?: BridgeChain;
}

/**
 * Whether a picker chain is offered at all. XRPL and Flare are always there; the remote
 * chains follow `isBridgeChainEnabled`, so a chain without a wired OFT never shows a row.
 * Hyperliquid (Core spot) is reached through HyperEVM, hence it follows that chain.
 */
function isRouteChainEnabled(chain: BridgeRouteChain): boolean {
    switch (chain) {
        case BRIDGE_ROUTE_CHAIN.XRPL:
        case BRIDGE_ROUTE_CHAIN.FLARE:
            return true;
        case BRIDGE_ROUTE_CHAIN.HYPER_CORE:
            return isBridgeChainEnabled(BRIDGE_CHAIN.HYPER_EVM);
        default:
            return isBridgeChainEnabled(chain);
    }
}

// Picker rows, in display order (same list for the FROM and the TO column).
// Built at import time — FASSET_COIN is undefined when no FAsset is enabled (e.g. the CI build
// without env), so read it with ?. or `next build` fails while collecting page data.
export const BRIDGE_ROUTE_CHAINS: IBridgeRouteChain[] = ([
    {
        chain: BRIDGE_ROUTE_CHAIN.XRPL,
        tokenSymbol: FASSET_COIN?.nativeName ?? 'XRP',
        labelKey: 'xrpl',
        icon: (props?: IIconProps) => <XrpIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.FLARE,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'flare',
        icon: (props?: IIconProps) => <FXrpFlareIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.HYPER_EVM,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'hyper_evm',
        icon: (props?: IIconProps) => <FXrpHypeEVMIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.ETHEREUM,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'ethereum',
        icon: (props?: IIconProps) => <FXrpEthIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.BSC,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'bsc',
        icon: (props?: IIconProps) => <FXrpBnbIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.BASE,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'base',
        icon: (props?: IIconProps) => <FXrpBaseIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.KATANA,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'katana',
        icon: (props?: IIconProps) => <FXrpKatanaIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.MONAD,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'monad',
        icon: (props?: IIconProps) => <FXrpMonadIcon {...props} />
    },
    {
        chain: BRIDGE_ROUTE_CHAIN.HYPER_CORE,
        tokenSymbol: FASSET_COIN?.type ?? 'FXRP',
        labelKey: 'hyper_core',
        icon: (props?: IIconProps) => <FXrpHypeCoreIcon {...props} />
    }
] as IBridgeRouteChain[]).filter(item => isRouteChainEnabled(item.chain));

// The picker chain a LayerZero route lands on — the composer routes name their real target
function lzRouteTarget(route: (typeof BRIDGE_LZ_ROUTES)[number]): BridgeRouteChain {
    if (route.compose === 'xrpl') return BRIDGE_ROUTE_CHAIN.XRPL;
    if (route.compose === 'hyper_core') return BRIDGE_ROUTE_CHAIN.HYPER_CORE;
    return route.destination;
}

// XRPL → these chains is direct mint & bridge (smart-accounts API `destination_kind`);
// lzDestination = the chain the executor sends the minted FXRP to
const DIRECT_MINT_DESTINATIONS: { to: BridgeRouteChain; lzDestination: BridgeChain }[] = [
    { to: BRIDGE_ROUTE_CHAIN.ETHEREUM, lzDestination: BRIDGE_CHAIN.ETHEREUM },
    { to: BRIDGE_ROUTE_CHAIN.HYPER_EVM, lzDestination: BRIDGE_CHAIN.HYPER_EVM },
    // Hyperliquid (Core) is reached through HyperEVM
    { to: BRIDGE_ROUTE_CHAIN.HYPER_CORE, lzDestination: BRIDGE_CHAIN.HYPER_EVM },
    { to: BRIDGE_ROUTE_CHAIN.BSC, lzDestination: BRIDGE_CHAIN.BSC },
    { to: BRIDGE_ROUTE_CHAIN.BASE, lzDestination: BRIDGE_CHAIN.BASE },
    { to: BRIDGE_ROUTE_CHAIN.KATANA, lzDestination: BRIDGE_CHAIN.KATANA },
    { to: BRIDGE_ROUTE_CHAIN.MONAD, lzDestination: BRIDGE_CHAIN.MONAD }
];

/**
 * Every FROM → TO pair the bridge page can run. A pair missing here is shown disabled.
 *
 * LayerZero routes come from `BRIDGE_LZ_ROUTES`: Flare ↔ every remote chain, remote → XRPL
 * (bridge + redeem on Flare), Flare / remote → Hyperliquid (HyperEVM composer), and remote ↔ remote — direct OFT sends, the
 * OFTs are peered with each other (testnet checked on-chain 2026-10-26: quoteSend succeeds for
 * HyperEVM / Ethereum / BSC; Base Sepolia has only the Coston2 peer, so its remote ↔ remote
 * quotes fail on testnet until those peers are set).
 *
 * XRPL → `DIRECT_MINT_DESTINATIONS` are direct mint & bridge: one XRP payment, the
 * smart-accounts executor mints FXRP and bridges it (offered only with SMART_ACCOUNTS_API_URL).
 *
 * Hyperliquid ↔ HyperEVM is a Hyperliquid system transfer (the FXRP system address on Core /
 * HyperEVM), not LayerZero — it always lands on the sender's own address.
 *
 * Not supported on purpose:
 * - Hyperliquid → anything but HyperEVM (would be two operations: Core → HyperEVM, then LayerZero)
 */
const ALL_BRIDGE_ROUTES: IBridgeRoute[] = [
    { from: BRIDGE_ROUTE_CHAIN.XRPL, to: BRIDGE_ROUTE_CHAIN.FLARE, action: BRIDGE_ROUTE_ACTION.MINT },
    { from: BRIDGE_ROUTE_CHAIN.FLARE, to: BRIDGE_ROUTE_CHAIN.XRPL, action: BRIDGE_ROUTE_ACTION.REDEEM },
    ...BRIDGE_LZ_ROUTES.map((route): IBridgeRoute => ({
        from: route.source,
        to: lzRouteTarget(route),
        action: BRIDGE_ROUTE_ACTION.BRIDGE,
        bridgeType: bridgeTypeOf(route)
    })),
    ...DIRECT_MINT_DESTINATIONS.map(({ to, lzDestination }): IBridgeRoute => ({
        from: BRIDGE_ROUTE_CHAIN.XRPL,
        to,
        action: BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE,
        lzDestination
    })),
    { from: BRIDGE_ROUTE_CHAIN.HYPER_CORE, to: BRIDGE_ROUTE_CHAIN.HYPER_EVM, action: BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER },
    { from: BRIDGE_ROUTE_CHAIN.HYPER_EVM, to: BRIDGE_ROUTE_CHAIN.HYPER_CORE, action: BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER }
];

export const BRIDGE_ROUTES = ALL_BRIDGE_ROUTES.filter(
    route => isRouteChainEnabled(route.from) && isRouteChainEnabled(route.to)
        && (route.action !== BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE || isSmartAccountsApiConfigured())
);

export function findBridgeRoute(from?: BridgeRouteChain, to?: BridgeRouteChain): IBridgeRoute | undefined {
    if (!from || !to) return undefined;
    return BRIDGE_ROUTES.find(route => route.from === from && route.to === to);
}

export function getBridgeRouteChain(chain?: BridgeRouteChain): IBridgeRouteChain | undefined {
    return BRIDGE_ROUTE_CHAINS.find(item => item.chain === chain);
}

// LayerZero behaviour of a bridge route (approve, fee token, Ledger app). Mint / redeem
// routes have none — they run the existing mint / redeem flows.
export function getBridgeRouteConfig(route?: IBridgeRoute): BridgeConfig | undefined {
    return route?.bridgeType ? getBridgeConfig(route.bridgeType) : undefined;
}

export function isHyperCoreTransfer(route?: IBridgeRoute): boolean {
    return route?.action === BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER;
}

// LayerZero EID of a direct mint & bridge destination; undefined for every other route
export function directMintDestinationEid(route: IBridgeRoute, mainnet: boolean): number | undefined {
    return route.lzDestination ? bridgeChainEid(route.lzDestination, mainnet) : undefined;
}

/**
 * Who may receive on a route, i.e. whether the "To" field offers "Custom":
 * - `xrpl`  redeem and the bridge + redeem routes: any XRPL address + destination tag
 * - `evm_or_tag` mint: any Flare address or a minting tag (MintDestinationEditor)
 * - `evm_address` any EVM address, the sender's by default:
 *           plain LayerZero transfers (`SendParam.to`), → Hyperliquid (the composer's
 *           `receiver`, which must have an active Hyperliquid account — useBridgeRecipientCheck)
 *           and direct mint & bridge (`evm_recipient` of /direct_mint/request)
 * - `none`  Hyperliquid ↔ HyperEVM: the connected EVM address, no "Custom" (the system
 *           transfer credits the sender)
 */
export type BridgeRecipientKind = 'none' | 'xrpl' | 'evm_or_tag' | 'evm_address';

export function getBridgeRouteRecipient(route?: IBridgeRoute): BridgeRecipientKind {
    if (!route) return 'none';
    if (route.action === BRIDGE_ROUTE_ACTION.MINT) return 'evm_or_tag';
    if (route.action === BRIDGE_ROUTE_ACTION.REDEEM) return 'xrpl';
    if (route.action === BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE) return 'evm_address';
    if (route.action === BRIDGE_ROUTE_ACTION.HYPERCORE_TRANSFER) return 'none';
    const composeKind = route.bridgeType ? getBridgeConfig(route.bridgeType).compose : undefined;
    if (composeKind === 'xrpl') return 'xrpl';
    if (composeKind === 'plain' || composeKind === 'hyper_core') return 'evm_address';
    return 'none';
}
