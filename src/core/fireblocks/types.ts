import { CoinEnum } from "@/types";

export type FireblocksRegion = "us" | "eu" | "eu2";

export const FIREBLOCKS_REGIONS = ["us", "eu", "eu2"] as const satisfies readonly FireblocksRegion[];

// The same host serves testnet and mainnet workspaces of a region.
export const FIREBLOCKS_HOSTS = {
    us: "https://api.fireblocks.io",
    eu: "https://eu-api.fireblocks.io",
    eu2: "https://eu2-api.fireblocks.io",
} satisfies Record<FireblocksRegion, string>;

export type FireblocksAssetId = "XRP" | "XRP_TEST";

export type FireblocksEvmAssetId = "FLR" | "SGB";

// App main token (CoinEnum value) → Fireblocks asset. Coston and Coston2 have no Fireblocks asset,
// so on testnet Fireblocks stays an XRPL-only wallet.
const EVM_ASSET_IDS: Partial<Record<CoinEnum, FireblocksEvmAssetId>> = {
    [CoinEnum.FLR]: "FLR",
    [CoinEnum.SGB]: "SGB",
};

export function getEvmAssetId(coinType: CoinEnum): FireblocksEvmAssetId | undefined {
    return EVM_ASSET_IDS[coinType];
}

export interface FireblocksSession {
    apiKey: string;
    region: FireblocksRegion;
    vaultId: string;
    assetId: FireblocksAssetId;
    address: string;
    // Missing on networks without a Fireblocks EVM asset and in sessions saved before EVM support
    evm?: { assetId: FireblocksEvmAssetId; address: string };
}

export interface FireblocksStoredState {
    // Non-extractable: usable for signing, never readable as key material.
    privateKey: CryptoKey;
    session?: FireblocksSession;
}

export interface FireblocksVault {
    id: string;
    name: string;
}

export type FireblocksTxOutcome =
    | { kind: "pending" }
    | { kind: "completed"; txHash: string }
    | { kind: "failed"; status: string; subStatus?: string };

export function isFireblocksRegion(value: unknown): value is FireblocksRegion {
    return typeof value === "string" && FIREBLOCKS_REGIONS.some((region) => region === value);
}
