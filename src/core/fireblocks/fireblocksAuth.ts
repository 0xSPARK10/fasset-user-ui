const JWT_LIFETIME_SECONDS = 29; // Fireblocks rejects tokens with exp - iat >= 30 s

function base64UrlEncode(bytes: Uint8Array): string {
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeJson(value: object): string {
    return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}

export async function sha256Hex(text: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Fireblocks API token: RS256 JWT bound to one request.
 * `uri` is the path incl. `/v1` and query; `body` must be the exact string sent over the wire.
 */
export async function signFireblocksJwt({
    key,
    apiKey,
    uri,
    body,
}: {
    key: CryptoKey;
    apiKey: string;
    uri: string;
    body: string;
}): Promise<string> {
    const issuedAt = Math.floor(Date.now() / 1000);
    const header = base64UrlEncodeJson({ alg: "RS256", typ: "JWT" });
    const payload = base64UrlEncodeJson({
        uri,
        nonce: crypto.randomUUID(),
        iat: issuedAt,
        exp: issuedAt + JWT_LIFETIME_SECONDS,
        sub: apiKey,
        bodyHash: await sha256Hex(body),
    });
    const signingInput = `${header}.${payload}`;
    const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        key,
        new TextEncoder().encode(signingInput),
    );
    return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

const PKCS8_PEM = /-----BEGIN PRIVATE KEY-----([A-Za-z0-9+/=\s]+)-----END PRIVATE KEY-----/; // gitleaks:allow (PEM header pattern, not a key)

/**
 * Imports the user's PKCS#8 PEM key (what `openssl req -newkey` writes) as non-extractable,
 * so after import nothing in the page can read the key bytes back.
 */
export async function importFireblocksPrivateKey(pem: string): Promise<CryptoKey> {
    const match = PKCS8_PEM.exec(pem);
    if (!match) throw new Error("fireblocks.key_invalid");
    const der = Uint8Array.from(atob(match[1].replace(/\s/g, "")), (char) => char.charCodeAt(0));
    try {
        return await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, [
            "sign",
        ]);
    } catch {
        throw new Error("fireblocks.key_invalid");
    }
}
