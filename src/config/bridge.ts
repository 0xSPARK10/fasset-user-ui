import { EndpointId } from "@layerzerolabs/lz-definitions";
import { FAssetOFTAdapterAbi, OFTUpgradeableAbi } from "@/abi";
import { BRIDGE_CHAIN } from "@/constants";
import { BridgeChain } from "@/types";

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
 * Which chain carries the fee token for a given `BridgeConfig.feeTokenKey`.
 * `undefined` = the route originates on Flare, so the fee is paid in mainToken.
 */
export const FEE_TOKEN_CHAIN: Record<'native' | 'hype' | 'eth', BridgeChain | undefined> = {
    native: undefined,
    hype: BRIDGE_CHAIN.HYPER_EVM,
    eth: BRIDGE_CHAIN.ETHEREUM
};

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
 * OFT addresses are NOT reused across chains — every remote chain has its own.
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

export function isBridgeChainEnabled(chain: BridgeChain): boolean {
    // Flare is the home chain and the destination of the return routes — always available.
    if (chain === BRIDGE_CHAIN.FLARE) return true;

    // Both conditions: the chain must be listed AND have an OFT address. Without an
    // address the balance queries stay disabled, which means a permanent `isPending`
    // and a stuck LoadingOverlay — so a flag without an address must not show the card.
    return enabledBridgeChains.includes(chain) && !!BRIDGE_SOURCE_OFT[chain]?.address;
}
