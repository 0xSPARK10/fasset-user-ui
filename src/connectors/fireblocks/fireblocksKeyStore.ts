import { FireblocksSession, FireblocksStoredState, importFireblocksPrivateKey } from "@/core/fireblocks";

const DB_NAME = "fasset-fireblocks";
const STORE_NAME = "state";
const STATE_KEY = "current";
const STORAGE_UNAVAILABLE = "fireblocks.storage_unavailable";

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error(STORAGE_UNAVAILABLE));
            return;
        }
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error(STORAGE_UNAVAILABLE));
    });
}

async function runRequest<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await openDb();
    try {
        return await new Promise<T>((resolve, reject) => {
            const request = run(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error(STORAGE_UNAVAILABLE));
        });
    } finally {
        db.close();
    }
}

function isStoredState(value: unknown): value is FireblocksStoredState {
    return (
        typeof value === "object" &&
        value !== null &&
        "privateKey" in value &&
        value.privateKey instanceof CryptoKey
    );
}

export async function loadFireblocksState(): Promise<FireblocksStoredState | undefined> {
    const value: unknown = await runRequest("readonly", (store) => store.get(STATE_KEY));
    return isStoredState(value) ? value : undefined;
}

async function saveFireblocksState(state: FireblocksStoredState): Promise<void> {
    await runRequest("readwrite", (store) => store.put(state, STATE_KEY));
}

// A new key belongs to a new API user, so any saved session is dropped.
export async function saveFireblocksKey(pem: string): Promise<void> {
    const privateKey = await importFireblocksPrivateKey(pem);
    await saveFireblocksState({ privateKey });
}

export async function saveFireblocksSession(session: FireblocksSession | undefined): Promise<void> {
    const state = await loadFireblocksState();
    if (!state) throw new Error(STORAGE_UNAVAILABLE);
    await saveFireblocksState({ ...state, session });
}
