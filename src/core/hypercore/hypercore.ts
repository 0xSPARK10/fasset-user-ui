import type { TypedDataDomain, TypedDataField } from "ethers";

// Hyperliquid (Core spot) ↔ HyperEVM moves go through the token's system address, not LayerZero:
// https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/hypercore-less-than-greater-than-hyperevm-transfers

// Core → EVM is charged 200k gas at the next HyperEVM block's base gas price (Hyperliquid docs)
export const HYPERCORE_TO_EVM_GAS = BigInt(200_000);

// FXRP has 6 decimals on Core (weiDecimals) and on HyperEVM (evm_extra_wei_decimals 0)
const CORE_AMOUNT_DECIMALS = 6;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// One entry of `POST /info {type: "spotMeta"}` → `tokens`
export interface ISpotMetaToken {
    name: string;
    index: number;
    tokenId: string;
    weiDecimals: number;
    evmContract: { address: string; evm_extra_wei_decimals: number } | null;
}

export interface IHyperCoreToken {
    // Core token name, e.g. "FXRP"
    name: string;
    index: number;
    tokenId: string;
    // 0x20 + zeros + index (big-endian) — transfers to it cross between Core and HyperEVM
    systemAddress: string;
}

export function hyperCoreSystemAddress(tokenIndex: number): string {
    return `0x20${tokenIndex.toString(16).padStart(38, "0")}`;
}

/**
 * The Core token linked to an ERC-20 on HyperEVM — matched by the linked contract address,
 * not by name (testnet has several XRP-like tokens).
 */
export function findHyperCoreToken(tokens: ISpotMetaToken[], evmAddress: string): IHyperCoreToken | undefined {
    if (!evmAddress) return undefined;
    const token = tokens.find(item => item.evmContract?.address?.toLowerCase() === evmAddress.toLowerCase());
    if (!token) return undefined;
    return {
        name: token.name,
        index: token.index,
        tokenId: token.tokenId,
        systemAddress: hyperCoreSystemAddress(token.index),
    };
}

/**
 * Amount as Hyperliquid signs it: plain decimal, at most 6 decimals (floored, never rounded up),
 * no trailing zeros — the string is part of the signed message.
 */
export function formatCoreAmount(amount: number): string {
    const [whole, fraction = ""] = amount.toFixed(12).split(".");
    const trimmed = fraction.slice(0, CORE_AMOUNT_DECIMALS).replace(/0+$/, "");
    return trimmed ? `${whole}.${trimmed}` : whole;
}

// Hyperliquid rejected a signed action (`/exchange` answered `status: "err"`); the message is its reason
export class HyperCoreActionError extends Error {
    name = 'HyperCoreActionError';
}

/**
 * `sendAsset` user-signed action (EIP-712) and what the wallet signs for it. `signatureChainId`
 * is the chain the wallet is on when signing (HyperEVM) — wallets reject typed data whose domain
 * chainId differs from the active chain.
 */
export function buildSendAssetTypedData({
    destination,
    token,
    amount,
    time,
    mainnet,
    signatureChainId,
}: {
    destination: string;
    token: IHyperCoreToken;
    amount: string;
    // Also the action's nonce (ms timestamp)
    time: number;
    mainnet: boolean;
    signatureChainId: number;
}): {
    action: Record<string, unknown>;
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    message: Record<string, unknown>;
} {
    // sendAsset, not spotSend: Hyperliquid rejects spotSend for Unified accounts ("Action disabled
    // when unified account is active"). Fields and types as in Hyperliquid's Python SDK.
    const message = {
        hyperliquidChain: mainnet ? "Mainnet" : "Testnet",
        destination: destination.toLowerCase(),
        sourceDex: "spot",
        destinationDex: "spot",
        token: `${token.name}:${token.tokenId}`,
        amount,
        fromSubAccount: "",
        nonce: time,
    };

    return {
        action: {
            type: "sendAsset",
            signatureChainId: `0x${signatureChainId.toString(16)}`,
            ...message,
        },
        domain: {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: signatureChainId,
            verifyingContract: ZERO_ADDRESS,
        },
        types: {
            "HyperliquidTransaction:SendAsset": [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "sourceDex", type: "string" },
                { name: "destinationDex", type: "string" },
                { name: "token", type: "string" },
                { name: "amount", type: "string" },
                { name: "fromSubAccount", type: "string" },
                { name: "nonce", type: "uint64" },
            ],
        },
        message,
    };
}

// Ledger entry as `userNonFundingLedgerUpdates` returns it — only the fields read here
interface ILedgerEntry {
    time: number;
    hash: string;
    delta?: { user?: string; destination?: string; token?: string; amount?: string; [key: string]: unknown };
}

export interface IHyperCoreTransfer {
    hash: string;
    time: number;
    // Core amount string as the ledger has it
    amount: string;
    // to_evm = Hyperliquid → HyperEVM, to_core = HyperEVM → Hyperliquid
    direction: "to_evm" | "to_core";
}

/**
 * HyperEVM ↔ Hyperliquid transfers of `token` in the wallet's Core ledger: entries with the
 * token's system address on one side and the wallet on the other. Everything else (composer
 * deliveries from Flare, other tokens, trades) is skipped; odd entries are skipped, not thrown.
 */
export function pickHyperCoreTransfers(
    updates: ILedgerEntry[] | undefined,
    wallet: string,
    token: IHyperCoreToken | undefined,
    sinceMs: number,
): IHyperCoreTransfer[] {
    if (!updates || !token || !wallet) return [];
    const self = wallet.toLowerCase();
    const system = token.systemAddress.toLowerCase();

    return updates.flatMap(entry => {
        const delta = entry?.delta;
        if (!delta || !entry.hash || typeof entry.time !== "number" || entry.time < sinceMs) return [];
        const tokenName = String(delta.token ?? "").split(":")[0];
        if (tokenName !== token.name || !delta.amount) return [];
        const from = String(delta.user ?? "").toLowerCase();
        const to = String(delta.destination ?? "").toLowerCase();
        const direction = from === self && to === system
            ? "to_evm"
            : from === system && to === self
                ? "to_core"
                : undefined;
        return direction ? [{ hash: entry.hash, time: entry.time, amount: String(delta.amount), direction }] : [];
    });
}

// One entry of `spotClearinghouseState.balances` — only the fields read here
interface ICoreBalanceEntry {
    token: number;
    total: string;
    hold: string;
}

/**
 * Spendable amount of a Core token: `total` minus `hold` (open orders), never below 0. Matched by
 * token index, not by name. undefined = balances not loaded; 0 = no entry.
 */
export function hyperCoreFreeBalance(balances: ICoreBalanceEntry[] | undefined, tokenIndex: number): number | undefined {
    if (!balances) return undefined;
    const entry = balances.find(item => item.token === tokenIndex);
    if (!entry) return 0;
    return Math.max(Number(entry.total) - Number(entry.hold || 0), 0);
}
