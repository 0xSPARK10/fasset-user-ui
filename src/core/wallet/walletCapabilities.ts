import { WALLET, WalletId } from "@/constants";

export interface WalletCapabilities {
    // "main" = only the app's main chain (Flare / Songbird)
    evmChains: "all" | "main" | "none";
    // EIP-712 (Hyperliquid actions)
    typedData: boolean;
    xrpl: boolean;
    xrplMemo: boolean;
}

const WALLET_CAPABILITIES = {
    [WALLET.META_MASK]: { evmChains: "all", typedData: true, xrpl: false, xrplMemo: false },
    [WALLET.WALLET_CONNECT]: { evmChains: "all", typedData: true, xrpl: true, xrplMemo: true },
    [WALLET.LEDGER]: { evmChains: "all", typedData: true, xrpl: true, xrplMemo: true },
    [WALLET.XAMAN]: { evmChains: "none", typedData: false, xrpl: true, xrplMemo: true },
    // Fireblocks XRP transfers carry a destination tag but no memo
    [WALLET.FIREBLOCKS]: { evmChains: "main", typedData: false, xrpl: true, xrplMemo: false },
} satisfies Record<WalletId, WalletCapabilities>;

// Fireblocks has no Coston / Coston2 asset; the caller checks with `getEvmAssetId` so this module
// stays free of the coin config.
export function getWalletCapabilities(wallet: WalletId, hasFireblocksEvmAsset: boolean): WalletCapabilities {
    const capabilities = WALLET_CAPABILITIES[wallet];
    if (wallet === WALLET.FIREBLOCKS && !hasFireblocksEvmAsset) return { ...capabilities, evmChains: "none" };
    return capabilities;
}
