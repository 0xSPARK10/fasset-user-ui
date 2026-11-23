import type { NextApiRequest, NextApiResponse } from "next";
import { FIREBLOCKS_HOSTS, isFireblocksRegion } from "@/core/fireblocks";
import { WALLET } from "@/constants";
import { isWalletEnabled } from "@/config/enabledWallets";

// The browser cannot call the Fireblocks API directly (no CORS headers), so this route only
// relays requests the browser already signed. It stores nothing and must never log headers.

export const config = { api: { bodyParser: false } };

const ALLOWED_ROUTES: { method: string; path: RegExp }[] = [
    { method: "GET", path: /^\/v1\/vault\/accounts_paged$/ },
    { method: "GET", path: /^\/v1\/vault\/accounts\/\d+\/(XRP|XRP_TEST|FLR|SGB)\/addresses_paginated$/ },
    // Creates the vault's Flare wallet when the vault has none yet
    { method: "POST", path: /^\/v1\/vault\/accounts\/\d+\/(FLR|SGB)$/ },
    { method: "GET", path: /^\/v1\/external_wallets$/ },
    { method: "POST", path: /^\/v1\/external_wallets$/ },
    { method: "POST", path: /^\/v1\/external_wallets\/[0-9a-f-]{36}\/(XRP|XRP_TEST)$/ },
    { method: "POST", path: /^\/v1\/transactions$/ },
    { method: "GET", path: /^\/v1\/transactions\/[0-9a-f-]{36}$/ },
];

// Incoming header → header sent to Fireblocks. The token arrives under its own name because a
// basic-auth proxy in front of the app (ngrok, staging) uses `Authorization` itself.
const FORWARDED_HEADERS: [string, string][] = [
    ["x-api-key", "X-API-Key"],
    ["x-fireblocks-authorization", "Authorization"],
    ["content-type", "Content-Type"],
    ["idempotency-key", "Idempotency-Key"],
];

async function readRawBody(req: NextApiRequest): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // Not an open relay to Fireblocks on deploys that don't offer the wallet
    if (!isWalletEnabled(WALLET.FIREBLOCKS)) {
        res.status(404).end();
        return;
    }

    const url = new URL(req.url ?? "", "http://localhost");
    const region = url.searchParams.get("region");
    url.searchParams.delete("region");

    // req.url keeps the path the browser called (/fireblocks-proxy/…, see the rewrite in next.config)
    const path = url.pathname.replace(/^.*\/fireblocks-proxy/, "");
    const method = req.method ?? "GET";
    const isAllowed = ALLOWED_ROUTES.some((route) => route.method === method && route.path.test(path));

    if (!isFireblocksRegion(region) || !isAllowed) {
        res.status(400).json({ message: "Request not allowed" });
        return;
    }

    const headers = new Headers();
    FORWARDED_HEADERS.forEach(([incoming, outgoing]) => {
        const value = req.headers[incoming];
        if (typeof value === "string") headers.set(outgoing, value);
    });

    const body = method === "POST" ? await readRawBody(req) : undefined;
    const response = await fetch(`${FIREBLOCKS_HOSTS[region]}${path}${url.search}`, { method, headers, body });

    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") ?? "application/json");
    res.send(await response.text());
}
