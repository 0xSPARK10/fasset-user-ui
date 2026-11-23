import { useRouter } from "next/router";
import i18next from "i18next";
import { getBigInt, JsonRpcProvider, Signer, TransactionRequest, TransactionResponse, VoidSigner } from "ethers";
import { WALLET } from "@/constants";
import { useConnectedCoin } from "@/store/coin";
import { COINS, FTEST_XRP, FXRP } from "@/config/coin";
import { ICoin } from "@/types";
import {
    buildContractCallBody,
    buildWhitelistAssetBody,
    buildWhitelistWalletBody,
    buildXrpTransferBody,
    FireblocksAssetId,
    FireblocksWhitelistStatus,
    getWhitelistStatus,
    FireblocksRegion,
    FireblocksSession,
    FireblocksVault,
    getEvmAssetId,
    getResponseId,
    getTxHash,
    getTxOutcome,
    parseFirstAddress,
    parseVaults,
    signFireblocksJwt,
} from "@/core/fireblocks";
import { loadFireblocksState, saveFireblocksKey, saveFireblocksSession } from "@/connectors/fireblocks/fireblocksKeyStore";
import { createLogger } from "@/utils/debug";

const POLL_INTERVAL_MS = 5000;
// After Fireblocks broadcasts, the Flare RPC normally knows the tx within seconds
const RPC_LOOKUP_INTERVAL_MS = 2000;
const RPC_LOOKUP_TRIES = 30;
// Fireblocks fails a transaction left unsigned for 2 hours; past that, stop waiting for an answer
const POLL_DEADLINE_MS = 2.25 * 60 * 60 * 1000;
// Approval can come hours after the estimate, when the call may need more gas
const GAS_LIMIT_BUFFER_PERCENT = 120;

// The core vault address and the minting tag the payment goes to.
export interface FireblocksWhitelistTarget {
    address: string;
    tag: number;
}

export interface IFireblocksConnector {
    hasKey: () => Promise<boolean>;
    importKey: (pem: string) => Promise<void>;
    listVaults: (args: { apiKey: string; region: FireblocksRegion }) => Promise<FireblocksVault[]>;
    // connectFlare: the user ticked Flare in the connect modal (only offered where Fireblocks has the asset)
    connect: (args: { apiKey: string; region: FireblocksRegion; vaultId: string; connectFlare: boolean }) => Promise<void>;
    disconnect: () => Promise<void>;
    init: () => void;
    getWhitelist: (target: FireblocksWhitelistTarget) => Promise<FireblocksWhitelistStatus>;
    requestWhitelist: (target: FireblocksWhitelistTarget) => Promise<void>;
    getSigner: (token?: ICoin) => Promise<Signer>;
    request: (args: { chainId: string; method: string; params: unknown }) => Promise<{ tx_json: { hash: string } }>;
}

const mainToken = COINS.find((coin) => !coin.isFAssetCoin && !coin.isStableCoin && coin.enabled && coin.isMainToken);

function getAssetId(): FireblocksAssetId {
    return FXRP.enabled ? "XRP" : "XRP_TEST";
}

function readXrpPayment(params: unknown): { destination: string; drops: string; destinationTag: number } {
    if (typeof params !== "object" || params === null) throw new Error("fireblocks.tx_failed");
    // Fireblocks XRP transfers carry a destination tag but no XRPL memo.
    if ("Memos" in params || !("DestinationTag" in params) || typeof params.DestinationTag !== "number") {
        throw new Error("fireblocks.memo_not_supported");
    }
    if (!("Destination" in params) || typeof params.Destination !== "string") throw new Error("fireblocks.tx_failed");
    if (!("Amount" in params) || typeof params.Amount !== "string") throw new Error("fireblocks.tx_failed");

    return { destination: params.Destination, drops: params.Amount, destinationTag: params.DestinationTag };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function FireblocksConnector(): IFireblocksConnector {
    const { basePath } = useRouter();
    const { addConnectedCoin, removeConnectedCoin } = useConnectedCoin();
    const log = createLogger("FIREBLOCKS");

    const callApi = async ({
        apiKey,
        region,
        method,
        uri,
        body = "",
    }: {
        apiKey: string;
        region: FireblocksRegion;
        method: "GET" | "POST";
        uri: string;
        body?: string;
    }): Promise<unknown> => {
        const state = await loadFireblocksState();
        if (!state) throw new Error("fireblocks.storage_unavailable");

        const token = await signFireblocksJwt({ key: state.privateKey, apiKey, uri, body });
        const separator = uri.includes("?") ? "&" : "?";
        const response = await fetch(`${basePath}/fireblocks-proxy${uri}${separator}region=${region}`, {
            method,
            headers: {
                "X-API-Key": apiKey,
                // Not `Authorization`: a basic-auth proxy in front of the app (ngrok, staging) owns that header.
                "X-Fireblocks-Authorization": `Bearer ${token}`,
                ...(method === "POST"
                    ? { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }
                    : {}),
            },
            body: method === "POST" ? body : undefined,
        });

        if (response.status === 401 || response.status === 403) throw new Error("fireblocks.unauthorized");
        if (!response.ok) {
            log.error("request failed", { uri, status: response.status });
            throw new Error("fireblocks.request_failed");
        }
        return response.json();
    };

    const hasKey = async () => (await loadFireblocksState()) !== undefined;

    const importKey = async (pem: string) => {
        await saveFireblocksKey(pem);
        removeFireblocksCoins();
    };

    const listVaults = async ({ apiKey, region }: { apiKey: string; region: FireblocksRegion }) => {
        const response = await callApi({
            apiKey,
            region,
            method: "GET",
            uri: `/v1/vault/accounts_paged?assetId=${getAssetId()}`,
        });
        return parseVaults(response);
    };

    const removeFireblocksCoins = () => {
        useConnectedCoin
            .getState()
            .localConnectedCoins.forEach((coin) => {
                if (coin.connectedWallet === WALLET.FIREBLOCKS && coin.address) removeConnectedCoin(coin.address);
            });
    };

    const connect = async ({ apiKey, region, vaultId, connectFlare }: { apiKey: string; region: FireblocksRegion; vaultId: string; connectFlare: boolean }) => {
        const assetId = getAssetId();
        const response = await callApi({
            apiKey,
            region,
            method: "GET",
            uri: `/v1/vault/accounts/${vaultId}/${assetId}/addresses_paginated`,
        });
        const address = parseFirstAddress(response);
        if (!address) throw new Error("fireblocks.no_xrp_vault");

        // Without a Flare wallet Fireblocks stays XRPL-only (as on testnet), so a failure here must not block the XRPL connect
        const evm = connectFlare
            ? await getEvmWallet({ apiKey, region, vaultId }).catch((error: unknown) => {
                log.warn("no Flare wallet from Fireblocks", { error });
                return undefined;
            })
            : undefined;
        const session: FireblocksSession = { apiKey, region, vaultId, assetId, address, evm };
        await saveFireblocksSession(session);

        removeFireblocksCoins();
        addConnectedCoin({
            type: FXRP.enabled ? FXRP.type : FTEST_XRP.type,
            address,
            connectedWallet: WALLET.FIREBLOCKS,
        });
        // A Flare wallet the user connected before (MetaMask, Ledger …) stays their Flare wallet
        const hasFlareWallet = useConnectedCoin
            .getState()
            .localConnectedCoins.some((coin) => coin.type === mainToken?.type);
        if (evm && mainToken && !hasFlareWallet) {
            addConnectedCoin({ type: mainToken.type, address: evm.address, connectedWallet: WALLET.FIREBLOCKS });
        }
    };

    // The vault's Flare address; a vault without the Flare asset gets it created (same address on every EVM asset).
    const getEvmWallet = async ({ apiKey, region, vaultId }: { apiKey: string; region: FireblocksRegion; vaultId: string }) => {
        const evmAssetId = mainToken ? getEvmAssetId(mainToken.type) : undefined;
        if (!evmAssetId) return undefined;

        const uri = `/v1/vault/accounts/${vaultId}/${evmAssetId}`;
        const readAddress = async () => {
            try {
                return parseFirstAddress(await callApi({ apiKey, region, method: "GET", uri: `${uri}/addresses_paginated` }));
            } catch (error) {
                // Fireblocks answers 404 while the vault has no wallet for the asset
                if (error instanceof Error && error.message === "fireblocks.request_failed") return undefined;
                throw error;
            }
        };

        let address = await readAddress();
        if (!address) {
            await callApi({ apiKey, region, method: "POST", uri, body: "{}" });
            address = await readAddress();
        }
        if (!address) throw new Error("fireblocks.request_failed");
        return { assetId: evmAssetId, address };
    };

    const disconnect = async () => {
        removeFireblocksCoins();
        // The key stays, so the user's existing Fireblocks API user keeps working on reconnect.
        await saveFireblocksSession(undefined).catch(() => undefined);
    };

    const init = () => {
        const hasFireblocksCoin = useConnectedCoin
            .getState()
            .localConnectedCoins.some((coin) => coin.connectedWallet === WALLET.FIREBLOCKS);
        if (!hasFireblocksCoin) return;

        loadFireblocksState()
            .then((state) => {
                if (!state?.session) removeFireblocksCoins();
            })
            .catch(() => removeFireblocksCoins());
    };

    const loadSession = async (): Promise<FireblocksSession> => {
        const session = (await loadFireblocksState())?.session;
        if (!session) throw new Error("fireblocks.storage_unavailable");
        return session;
    };

    const getWhitelist = async (target: FireblocksWhitelistTarget) => {
        const session = await loadSession();
        const response = await callApi({
            apiKey: session.apiKey,
            region: session.region,
            method: "GET",
            uri: "/v1/external_wallets",
        });
        return getWhitelistStatus(response, { ...target, assetId: session.assetId });
    };

    // Creates the entry in the user's workspace; it only takes effect after their admin quorum approves it.
    const createWhitelistWallet = async (session: FireblocksSession, tag: number) => {
        const wallet = await callApi({
            apiKey: session.apiKey,
            region: session.region,
            method: "POST",
            uri: "/v1/external_wallets",
            body: buildWhitelistWalletBody(tag),
        });
        const walletId = getResponseId(wallet);
        if (!walletId) throw new Error("fireblocks.request_failed");
        return walletId;
    };

    const requestWhitelist = async ({ address, tag }: FireblocksWhitelistTarget) => {
        const session = await loadSession();
        const status = await getWhitelist({ address, tag });
        if (status.kind !== "missing") return;
        // A wallet left empty by an earlier failed request is reused, so retries don't pile up wallets
        const walletId = status.emptyWalletId ?? (await createWhitelistWallet(session, tag));

        await callApi({
            apiKey: session.apiKey,
            region: session.region,
            method: "POST",
            uri: `/v1/external_wallets/${walletId}/${session.assetId}`,
            body: buildWhitelistAssetBody({ address, tag }),
        });
    };

    // Resolves only once the user approved in Fireblocks and `isDone` holds; Fireblocks itself
    // fails transactions left unsigned for 2 hours.
    const pollTransaction = async (
        session: FireblocksSession,
        transactionId: string,
        isDone: (tx: unknown) => boolean,
    ): Promise<unknown> => {
        const deadline = Date.now() + POLL_DEADLINE_MS;
        for (;;) {
            await wait(POLL_INTERVAL_MS);
            if (Date.now() > deadline) throw new Error("fireblocks.tx_status_unknown");
            let tx: unknown;
            try {
                tx = await callApi({
                    apiKey: session.apiKey,
                    region: session.region,
                    method: "GET",
                    uri: `/v1/transactions/${transactionId}`,
                });
            } catch (error) {
                // Retrying cannot fix a revoked API key or a cleared key store
                if (error instanceof Error && (error.message === "fireblocks.unauthorized" || error.message === "fireblocks.storage_unavailable")) {
                    throw error;
                }
                // The transaction exists and can still complete — giving up here would show an
                // error for a transaction that goes through, and the user might send it twice
                log.warn("status check failed, retrying", { transactionId, error });
                continue;
            }
            const outcome = getTxOutcome(tx);
            if (outcome.kind === "failed") {
                log.error("transaction failed", { status: outcome.status, subStatus: outcome.subStatus });
                throw new Error(outcome.status === "BLOCKED" ? "fireblocks.blocked_by_policy" : "fireblocks.tx_failed");
            }
            if (isDone(tx)) return tx;
        }
    };

    const sendContractCall = async (signer: VoidSigner, request: TransactionRequest): Promise<TransactionResponse> => {
        const session = await loadSession();
        if (!session.evm) throw new Error("fireblocks.unsupported_chain");
        // Runs estimateGas, so a call that would revert fails here, before Fireblocks is asked
        const populated = await signer.populateTransaction(request);
        if (typeof populated.to !== "string" || !populated.data || populated.data === "0x") {
            throw new Error("fireblocks.tx_failed");
        }

        const created = await callApi({
            apiKey: session.apiKey,
            region: session.region,
            method: "POST",
            uri: "/v1/transactions",
            body: buildContractCallBody({
                assetId: session.evm.assetId,
                vaultId: session.vaultId,
                to: populated.to,
                data: populated.data,
                valueWei: getBigInt(populated.value ?? 0),
                gasLimit:
                    populated.gasLimit == null
                        ? undefined
                        : (getBigInt(populated.gasLimit) * BigInt(GAS_LIMIT_BUFFER_PERCENT)) / BigInt(100),
            }),
        });
        const transactionId = getResponseId(created);
        if (!transactionId) throw new Error("fireblocks.tx_failed");

        // COMPLETED, not just a txHash: a failed broadcast still ends as FAILED, and a mined tx is on the RPC
        const tx = await pollTransaction(session, transactionId, (tx) => getTxOutcome(tx).kind === "completed");
        const txHash = getTxHash(tx);
        if (!txHash) throw new Error("fireblocks.tx_failed");

        // A real TransactionResponse, so callers' tx.wait() and receipt.logs work as with any wallet
        for (let i = 0; i < RPC_LOOKUP_TRIES; i++) {
            const response = await signer.provider?.getTransaction(txHash);
            if (response) return response;
            await wait(RPC_LOOKUP_INTERVAL_MS);
        }
        throw new Error(i18next.t("fireblocks.tx_not_found", { hash: txHash }));
    };

    const getSigner = async (token?: ICoin): Promise<Signer> => {
        const network = mainToken?.network.name ?? "Flare";
        if (!mainToken || (token && token.type !== mainToken.type)) {
            throw new Error(i18next.t("fireblocks.unsupported_chain", { network }));
        }
        const session = await loadSession().catch(() => {
            throw new Error(i18next.t("fireblocks.storage_unavailable"));
        });
        if (!session.evm) throw new Error(i18next.t("fireblocks.unsupported_chain", { network }));

        // Static network: an unreachable RPC is not re-queried for eth_chainId every second
        const provider = new JsonRpcProvider(mainToken.network.rpcUrl, Number(mainToken.network.chainId), {
            staticNetwork: true,
        });
        const signer = new VoidSigner(session.evm.address, provider);
        signer.sendTransaction = async (request: TransactionRequest) => {
            try {
                return await sendContractCall(signer, request);
            } catch (error) {
                // Connector errors are translation keys; ethers errors (reverts, RPC) pass through to handleErrors
                if (error instanceof Error && error.message.startsWith("fireblocks.")) {
                    const key =
                        error.message === "fireblocks.blocked_by_policy" ? "fireblocks.blocked_by_policy_contract_call" : error.message;
                    throw new Error(i18next.t(key, { network }));
                }
                throw error;
            }
        };
        return signer;
    };

    const request = async ({ method, params }: { chainId: string; method: string; params: unknown }) => {
        if (method !== "xrpl_signTransaction") throw new Error("fireblocks.tx_failed");

        const payment = readXrpPayment(params);
        const session = await loadSession();

        const whitelist = await getWhitelist({ address: payment.destination, tag: payment.destinationTag });
        if (whitelist.kind !== "approved") throw new Error("fireblocks.whitelist_required");

        const created = await callApi({
            apiKey: session.apiKey,
            region: session.region,
            method: "POST",
            uri: "/v1/transactions",
            body: buildXrpTransferBody({
                assetId: session.assetId,
                vaultId: session.vaultId,
                walletId: whitelist.walletId,
                drops: payment.drops,
            }),
        });
        const transactionId = getResponseId(created);
        if (!transactionId) throw new Error("fireblocks.tx_failed");

        const tx = await pollTransaction(session, transactionId, (tx) => getTxOutcome(tx).kind === "completed");
        const txHash = getTxHash(tx);
        if (!txHash) throw new Error("fireblocks.tx_failed");
        return { tx_json: { hash: txHash } };
    };

    return {
        hasKey,
        importKey,
        listVaults,
        connect,
        disconnect,
        init,
        getWhitelist,
        requestWhitelist,
        getSigner,
        request,
    };
}
