import { formatEther, formatUnits } from "ethers";
import { FireblocksAssetId, FireblocksEvmAssetId, FireblocksTxOutcome, FireblocksVault } from "./types";

const XRP_DECIMALS = 6;
const FAILED_STATUSES = ["FAILED", "REJECTED", "CANCELLED", "BLOCKED"];

// Only to a whitelisted wallet: it already holds the core vault address and the exact tag, so
// a bug or XSS in the app cannot redirect funds, and institutional workspaces block one-time addresses.
export function buildXrpTransferBody({
    assetId,
    vaultId,
    walletId,
    drops,
}: {
    assetId: FireblocksAssetId;
    vaultId: string;
    walletId: string;
    drops: string;
}): string {
    return JSON.stringify({
        operation: "TRANSFER",
        assetId,
        source: { type: "VAULT_ACCOUNT", id: vaultId },
        destination: { type: "EXTERNAL_WALLET", id: walletId },
        amount: formatUnits(drops, XRP_DECIMALS),
        note: "FAsset direct mint",
    });
}

// A Flare contract call. The contract goes as a one-time address: the designated signer sees it in
// the Fireblocks app before approving, and the workspace's Contract call policy rule decides who signs.
export function buildContractCallBody({
    assetId,
    vaultId,
    to,
    data,
    valueWei,
    gasLimit,
}: {
    assetId: FireblocksEvmAssetId;
    vaultId: string;
    to: string;
    data: string;
    valueWei: bigint;
    gasLimit?: bigint;
}): string {
    return JSON.stringify({
        operation: "CONTRACT_CALL",
        assetId,
        source: { type: "VAULT_ACCOUNT", id: vaultId },
        destination: { type: "ONE_TIME_ADDRESS", oneTimeAddress: { address: to } },
        // msg.value in whole FLR; formatEther always keeps a fraction ("10.0")
        amount: formatEther(valueWei).replace(/\.0$/, ""),
        extraParameters: { contractCallData: data },
        feeLevel: "MEDIUM",
        ...(gasLimit !== undefined ? { gasLimit: gasLimit.toString() } : {}),
        note: "FAsset",
    });
}

export function whitelistWalletName(tag: number): string {
    return `FAssets core vault (tag ${tag})`;
}

export function buildWhitelistWalletBody(tag: number): string {
    return JSON.stringify({ name: whitelistWalletName(tag) });
}

export function buildWhitelistAssetBody({ address, tag }: { address: string; tag: number }): string {
    return JSON.stringify({ address, tag: String(tag) });
}

export type FireblocksWhitelistStatus =
    // emptyWalletId: our wallet from an earlier request whose asset was never added — reuse it
    | { kind: "missing"; emptyWalletId?: string }
    | { kind: "pending"; walletId: string }
    | { kind: "approved"; walletId: string };

// GET /v1/external_wallets → [{ id, name, assets: [{ id, address, tag, status }] }].
// Rejected or cancelled entries count as missing, so the user can request a new one.
export function getWhitelistStatus(
    response: unknown,
    { assetId, address, tag }: { assetId: FireblocksAssetId; address: string; tag: number },
): FireblocksWhitelistStatus {
    if (!Array.isArray(response)) return { kind: "missing" };

    let pendingWalletId: string | undefined;
    let emptyWalletId: string | undefined;
    for (const wallet of response) {
        if (typeof wallet !== "object" || wallet === null) continue;
        const walletId = readString(wallet, "id");
        if (!walletId) continue;
        const assets: unknown[] = "assets" in wallet && Array.isArray(wallet.assets) ? wallet.assets : [];

        if (assets.length === 0 && readString(wallet, "name") === whitelistWalletName(tag)) emptyWalletId = walletId;

        for (const asset of assets) {
            if (typeof asset !== "object" || asset === null) continue;
            const isTarget =
                readString(asset, "id") === assetId &&
                readString(asset, "address") === address &&
                readString(asset, "tag") === String(tag);
            if (!isTarget) continue;

            const status = readString(asset, "status");
            if (status === "APPROVED") return { kind: "approved", walletId };
            if (status === "WAITING_FOR_APPROVAL") pendingWalletId = walletId;
        }
    }
    if (pendingWalletId) return { kind: "pending", walletId: pendingWalletId };
    return { kind: "missing", emptyWalletId };
}

function readString(source: object, key: string): string | undefined {
    if (!(key in source)) return undefined;
    const value: unknown = Reflect.get(source, key);
    return typeof value === "string" && value !== "" ? value : undefined;
}

export function getTxOutcome(tx: unknown): FireblocksTxOutcome {
    if (typeof tx !== "object" || tx === null) return { kind: "pending" };

    const status = readString(tx, "status");
    const txHash = readString(tx, "txHash");

    if (status === "COMPLETED" && txHash) return { kind: "completed", txHash };
    if (status && FAILED_STATUSES.includes(status)) {
        return { kind: "failed", status, subStatus: readString(tx, "subStatus") };
    }
    return { kind: "pending" };
}

// Set once Fireblocks broadcasts, before COMPLETED, so the app can follow the tx on the RPC
export function getTxHash(tx: unknown): string | undefined {
    if (typeof tx !== "object" || tx === null) return undefined;
    return readString(tx, "txHash");
}

export function getResponseId(response: unknown): string | undefined {
    if (typeof response !== "object" || response === null) return undefined;
    return readString(response, "id");
}

// GET /v1/vault/accounts_paged → { accounts: [{ id, name }] }
export function parseVaults(response: unknown): FireblocksVault[] {
    if (typeof response !== "object" || response === null || !("accounts" in response)) return [];
    const { accounts } = response;
    if (!Array.isArray(accounts)) return [];

    return accounts.flatMap((account: unknown) => {
        if (typeof account !== "object" || account === null) return [];
        const id = readString(account, "id");
        if (!id) return [];
        return [{ id, name: readString(account, "name") ?? id }];
    });
}

// GET /v1/vault/accounts/{id}/{asset}/addresses_paginated → { addresses: [{ address }] }
export function parseFirstAddress(response: unknown): string | undefined {
    if (typeof response !== "object" || response === null || !("addresses" in response)) return undefined;
    const { addresses } = response;
    if (!Array.isArray(addresses) || addresses.length === 0) return undefined;

    const [first]: unknown[] = addresses;
    if (typeof first !== "object" || first === null) return undefined;
    return readString(first, "address");
}
