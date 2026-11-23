import { EndpointId } from "@layerzerolabs/lz-definitions";
import { FAssetOFTAdapterAbi, OFTUpgradeableAbi } from "@/abi";
import { BRIDGE_CHAIN } from "@/constants";
import { BridgeChain, BridgeComposeKind, BridgeType } from "@/types";
import { devWarn } from "@/utils/debug";

/**
 * LayerZero endpoint ID per bridge chain. Values come from `@layerzerolabs/lz-definitions`
 * (Ethereum mainnet = 30101, Sepolia = 40161) — never hardcode the numbers.
 */
export const BRIDGE_CHAIN_EID: Record<BridgeChain, { mainnet: number; testnet: number }> = {
    [BRIDGE_CHAIN.FLARE]: {
        mainnet: EndpointId.FLARE_V2_MAINNET,
        testnet: EndpointId.FLARE_V2_TESTNET
    },
    [BRIDGE_CHAIN.HYPER_EVM]: {
        mainnet: EndpointId.HYPERLIQUID_V2_MAINNET,
        testnet: EndpointId.HYPERLIQUID_V2_TESTNET
    },
    [BRIDGE_CHAIN.ETHEREUM]: {
        mainnet: EndpointId.ETHEREUM_V2_MAINNET,
        testnet: EndpointId.SEPOLIA_V2_TESTNET
    },
    [BRIDGE_CHAIN.BSC]: {
        mainnet: EndpointId.BSC_V2_MAINNET,
        testnet: EndpointId.BSC_V2_TESTNET
    },
    [BRIDGE_CHAIN.BASE]: {
        mainnet: EndpointId.BASE_V2_MAINNET,
        testnet: EndpointId.BASESEP_V2_TESTNET
    },
    [BRIDGE_CHAIN.KATANA]: {
        mainnet: EndpointId.KATANA_V2_MAINNET,
        testnet: EndpointId.KATANA_V2_TESTNET
    },
    [BRIDGE_CHAIN.MONAD]: {
        mainnet: EndpointId.MONAD_V2_MAINNET,
        testnet: EndpointId.MONAD_V2_TESTNET
    }
};

export function bridgeChainEid(chain: BridgeChain, mainnet: boolean): number {
    return mainnet ? BRIDGE_CHAIN_EID[chain].mainnet : BRIDGE_CHAIN_EID[chain].testnet;
}

/**
 * Reverse of `BRIDGE_CHAIN_EID` — which bridge chain a LayerZero eid belongs to, on
 * either network. Needed wherever we only have the eid from the backend (bridge
 * history) and must tell Ethereum apart from HyperEVM.
 */
export function bridgeChainFromEid(eid: number): BridgeChain | undefined {
    return (Object.keys(BRIDGE_CHAIN_EID) as BridgeChain[]).find(
        chain => BRIDGE_CHAIN_EID[chain].mainnet === eid || BRIDGE_CHAIN_EID[chain].testnet === eid
    );
}

/**
 * The contract `quoteSend` / `send` is called on, selected by the route's source chain.
 *
 * Two different contract types, which is where the env var naming confusion comes from —
 * both are called `..._OFT_ADAPTER_ADDRESS` even though only the first is an adapter:
 *
 *   BRIDGE_FXRP_OFT_ADAPTER_ADDRESS       → OFTAdapter on Flare
 *   BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS  → OFT on HyperEVM (not an adapter!)
 *
 * Verified on-chain 2026-07-28 against the testnet values in `.env`:
 *
 *   0xCd3d2127…dbF46639 on Coston2:  token() → 0x0b6a3645… (= BRIDGE_FXRP_ADDRESS),
 *                                    no name()/symbol() → adapter wrapping FXRP
 *   0x14bfb521…C7d4284c on HyperEVM: name() = "FTestXRP OFT", symbol() = FTestXRP,
 *                                    token() → itself → an OFT, an ERC20 in its own right
 *
 * Each address exists only on its own chain (`eth_getCode` returns 0x elsewhere).
 * The architecture is therefore: one adapter on the home chain + one OFT per remote
 * chain + the redeem composer on Flare. Ethereum needs only the OFT — no adapter and
 * no composer (Jurij + Boštjan Kovač, 2026-07-28).
 *
 * OFT addresses are NOT shared with HyperEVM — every remote chain has its own contract. On
 * mainnet Ethereum and BNB Chain happen to use the same address (deterministic deploy), but
 * they are still separate contracts.
 * Verified on-chain 2026-07-28; all three are the same contract type (2740 bytes,
 * `token()` returns itself, decimals 6):
 *
 *   HyperEVM testnet  0x14bfb521…C7d4284c  name "FTestXRP OFT"
 *   Sepolia           0x81672c5d…c547d4E6  name "FTestXRP OFT", supply 187
 *   Ethereum mainnet  0xCE6170EA…125F0110  name "FXRP",         supply 850,920.98
 */
export const BRIDGE_SOURCE_OFT: Record<BridgeChain, { address?: string; abi: any }> = {
    [BRIDGE_CHAIN.FLARE]: {
        address: process.env.BRIDGE_FXRP_OFT_ADAPTER_ADDRESS,
        abi: FAssetOFTAdapterAbi
    },
    [BRIDGE_CHAIN.HYPER_EVM]: {
        address: process.env.BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS,
        abi: OFTUpgradeableAbi
    },
    [BRIDGE_CHAIN.ETHEREUM]: {
        // Required, no fallback. The Ethereum OFT has its own address, different from
        // HyperEVM's. Inheriting that address would mean calling `balanceOf` and `send`
        // on a foreign contract — worse than the route simply being unavailable.
        address: process.env.BRIDGE_ETH_FXRP_OFT_ADDRESS,
        abi: OFTUpgradeableAbi
    },
    [BRIDGE_CHAIN.BSC]: {
        // Same rule as Ethereum: its own OFT, no fallback. Peers checked on-chain 2026-10-26:
        // the BSC testnet OFT (0xac7c4a07…45a4bf4e) is wired to Coston2, Sepolia and HyperEVM.
        address: process.env.BRIDGE_BSC_FXRP_OFT_ADDRESS,
        abi: OFTUpgradeableAbi
    },
    // Base, Katana and Monad: same rule, own OFT each, no fallback. Mainnet (checked on-chain
    // 2026-11-03, 6 decimals, peered with the Flare adapter 0xd706…): Base and Monad
    // 0xCE6170EA…125F0110, Katana 0x565f9415…8d218059. Testnet has only Base Sepolia
    // (0xac7c4a07…45a4bf4e, peered with Coston2 alone); Katana and Monad have no testnet OFT.
    [BRIDGE_CHAIN.BASE]: {
        address: process.env.BRIDGE_BASE_FXRP_OFT_ADDRESS,
        abi: OFTUpgradeableAbi
    },
    [BRIDGE_CHAIN.KATANA]: {
        address: process.env.BRIDGE_KATANA_FXRP_OFT_ADDRESS,
        abi: OFTUpgradeableAbi
    },
    [BRIDGE_CHAIN.MONAD]: {
        address: process.env.BRIDGE_MONAD_FXRP_OFT_ADDRESS,
        abi: OFTUpgradeableAbi
    }
};

/**
 * Which bridge chains the app actually offers. Kept separate from the OFT address
 * because the address can be known before the deploy — its mere presence is no proof
 * that the contract is live on that chain and that peers are wired.
 *
 * Defaults to HyperEVM only, i.e. today's behaviour. Ethereum is switched on with one
 * env line and no code change: `ENABLED_BRIDGE_CHAINS=hyper_evm,ethereum`
 */
const enabledBridgeChains = process.env.ENABLED_BRIDGE_CHAINS
    ? process.env.ENABLED_BRIDGE_CHAINS.split(',').map(chain => chain.trim().toLowerCase())
    : [BRIDGE_CHAIN.HYPER_EVM as string];

// A misconfigured chain is just hidden — say why in the dev console
enabledBridgeChains.forEach(chain => {
    if (!(Object.values(BRIDGE_CHAIN) as string[]).includes(chain)) {
        devWarn(`[bridge] ENABLED_BRIDGE_CHAINS: unknown chain "${chain}" — expected one of ${Object.values(BRIDGE_CHAIN).join(', ')}`);
    } else if (!BRIDGE_SOURCE_OFT[chain as BridgeChain]?.address) {
        devWarn(`[bridge] ENABLED_BRIDGE_CHAINS lists "${chain}" but its OFT address is not set — the chain is hidden`);
    }
});

export function isBridgeChainEnabled(chain: BridgeChain): boolean {
    // Flare is the home chain and the destination of the return routes — always available.
    if (chain === BRIDGE_CHAIN.FLARE) return true;

    // Both conditions: the chain must be listed AND have an OFT address. Without an
    // address the balance queries stay disabled, which means a permanent `isPending`
    // and a stuck LoadingOverlay — so a flag without an address must not show the card.
    return enabledBridgeChains.includes(chain) && !!BRIDGE_SOURCE_OFT[chain]?.address;
}

// Every chain but Flare, in picker order — each has its own FXRP OFT.
export const REMOTE_BRIDGE_CHAINS = (Object.values(BRIDGE_CHAIN) as BridgeChain[])
    .filter(chain => chain !== BRIDGE_CHAIN.FLARE);

/**
 * lzCompose gas of the bridge + redeem to XRPL routes, per source chain. The Sepolia / Ethereum
 * executor caps lzReceive + lzCompose at 5M gas per message, so 400k + 5M reverts quoteSend
 * there — Ethereum composes with 1.5M. Every other source keeps 5M.
 */
const XRPL_COMPOSE_GAS: Partial<Record<BridgeChain, number>> = {
    [BRIDGE_CHAIN.ETHEREUM]: 1_500_000
};

export function xrplComposeGas(source: BridgeChain): number {
    return XRPL_COMPOSE_GAS[source] ?? 5_000_000;
}

// The LayerZero leg of a bridge page route.
export interface BridgeLzRoute {
    source: BridgeChain;
    // dstEid — XRPL routes target Flare, where the redeem composer redeems onward into XRP
    destination: BridgeChain;
    compose: BridgeComposeKind;
}

// `<destination>_from_<source>`; XRPL and Hyperliquid name the compose target, not the dstEid.
export function bridgeTypeOf({ source, destination, compose }: BridgeLzRoute): BridgeType {
    const target = compose === 'xrpl' ? 'xrpl' : compose === 'hyper_core' ? 'hyper_core' : destination;
    return `${target}_from_${source}`;
}

/**
 * Every LayerZero route: Flare ↔ each remote chain, each remote chain → XRPL (bridge + redeem
 * on Flare), remote ↔ remote (direct OFT sends), and Flare / each remote chain but HyperEVM →
 * Hyperliquid through the HyperEVM composer (HyperEVM → Hyperliquid is a system transfer).
 * Which of them the page offers is decided in config/bridgeRoutes.tsx.
 */
export const BRIDGE_LZ_ROUTES: BridgeLzRoute[] = [
    { source: BRIDGE_CHAIN.FLARE, destination: BRIDGE_CHAIN.HYPER_EVM, compose: 'hyper_core' },
    ...REMOTE_BRIDGE_CHAINS.flatMap((remote): BridgeLzRoute[] => [
        { source: BRIDGE_CHAIN.FLARE, destination: remote, compose: 'plain' },
        { source: remote, destination: BRIDGE_CHAIN.FLARE, compose: 'plain' },
        { source: remote, destination: BRIDGE_CHAIN.FLARE, compose: 'xrpl' },
        ...(remote === BRIDGE_CHAIN.HYPER_EVM
            ? []
            : [{ source: remote, destination: BRIDGE_CHAIN.HYPER_EVM, compose: 'hyper_core' } satisfies BridgeLzRoute]),
        ...REMOTE_BRIDGE_CHAINS
            .filter(other => other !== remote)
            .map((other): BridgeLzRoute => ({ source: remote, destination: other, compose: 'plain' }))
    ])
];

const BRIDGE_LZ_ROUTE_BY_TYPE = new Map(BRIDGE_LZ_ROUTES.map(route => [bridgeTypeOf(route), route]));

export function getBridgeLzRoute(type: BridgeType): BridgeLzRoute {
    const route = BRIDGE_LZ_ROUTE_BY_TYPE.get(type);
    // BridgeType also admits pairs that are no route (e.g. xrpl_from_flare)
    if (!route) throw new Error(`Unknown bridge route: ${type}`);
    return route;
}

// Per-LayerZero-route behaviour (approve, fee chain, Ledger app, UI keys), read by the route
// registry (config/bridgeRoutes.tsx) and the confirm step. Derived from the route — see
// `getBridgeConfig`.
export interface BridgeConfig extends BridgeLzRoute {
    type: BridgeType;
    // `bridge_modal.<titleKey>_title` and `bridge_modal.bridge_<titleKey>_step_*`:
    // 'chain' = Flare → remote, 'remote' = remote → remote, 'flare' / 'xrpl' = remote → Flare / XRPL
    titleKey: "chain" | "remote" | "flare" | "xrpl";
    // `bridge_modal.finished_modal.description_<key>_label`
    finishedDescriptionKey: "chain" | "flare" | "xrpl";
    // Only Flare-source routes approve — the remote chains hold a plain OFT that burns from the caller
    needsApproval: boolean;
    // Chain whose gas coin pays the LayerZero nativeFee; undefined = mainToken (the route starts on Flare)
    feeChain?: BridgeChain;
    ledgerApp: "source" | "bridge";
}

// Cached so a route keeps one config object — callers put it in hook dependencies
const BRIDGE_CONFIG_CACHE = new Map<BridgeType, BridgeConfig>();

export function getBridgeConfig(type: BridgeType): BridgeConfig {
    const cached = BRIDGE_CONFIG_CACHE.get(type);
    if (cached) return cached;

    const route = getBridgeLzRoute(type);
    const fromFlare = route.source === BRIDGE_CHAIN.FLARE;
    const toFlare = route.destination === BRIDGE_CHAIN.FLARE;

    const config: BridgeConfig = {
        ...route,
        type,
        titleKey: fromFlare ? "chain" : route.compose === 'xrpl' ? "xrpl" : toFlare ? "flare" : "remote",
        finishedDescriptionKey: route.compose === 'xrpl' ? "xrpl" : toFlare ? "flare" : "chain",
        needsApproval: fromFlare,
        feeChain: fromFlare ? undefined : route.source,
        ledgerApp: fromFlare ? "source" : "bridge",
    };
    BRIDGE_CONFIG_CACHE.set(type, config);
    return config;
}

// i18n key of the chain a route delivers to — Hyperliquid for the composer route, otherwise
// the dstEid chain. Interpolated as {{bridgeType}} by the bridge modal texts.
export function bridgeDestinationNameKey(type: BridgeType | undefined): string {
    const route = type ? getBridgeLzRoute(type) : undefined;
    return `bridge_page.chains.${route?.compose === 'hyper_core' ? 'hyper_core' : route?.destination ?? BRIDGE_CHAIN.HYPER_EVM}`;
}

// i18n key of the chain a route starts on, interpolated as {{sourceChain}}.
export function bridgeSourceNameKey(type: BridgeType): string {
    return `bridge_page.chains.${getBridgeLzRoute(type).source}`;
}
