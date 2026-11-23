import type { ParsedUrlQuery } from "querystring";
import { BRIDGE_ROUTE_CHAIN } from "@/constants";
import { roundDownToDecimals } from "@/utils";
import type { BridgeRouteChain } from "@/types";
import type { BridgeDeeplink } from "./types";

// The URL is untrusted (anyone can build a link): every value has a strict shape and a length
// cap before it reaches the form. Route rules (enabled chain, reachable TO, recipient kind) are
// checked where the form applies the link.

// Chain keys in the URL — Stargate's own (stargate.finance `?srcChain=…&dstChain=…`), so their links
// work here unchanged; `xrpl` is ours (Stargate has no XRPL). Their `hyperliquid` is HyperEVM, and
// `hypercore` the chain our app calls Hyperliquid. A chain missing here cannot be linked to.
const URL_CHAIN_KEYS = {
    xrpl: BRIDGE_ROUTE_CHAIN.XRPL,
    flare: BRIDGE_ROUTE_CHAIN.FLARE,
    ethereum: BRIDGE_ROUTE_CHAIN.ETHEREUM,
    bsc: BRIDGE_ROUTE_CHAIN.BSC,
    base: BRIDGE_ROUTE_CHAIN.BASE,
    katana: BRIDGE_ROUTE_CHAIN.KATANA,
    monad: BRIDGE_ROUTE_CHAIN.MONAD,
    hyperliquid: BRIDGE_ROUTE_CHAIN.HYPER_EVM,
    hypercore: BRIDGE_ROUTE_CHAIN.HYPER_CORE,
} as const satisfies Record<string, BridgeRouteChain>;

// Form field → URL param name (Stargate's names for the chains)
const URL_PARAMS = {
    from: "srcChain",
    to: "dstChain",
    amount: "amount",
    recipient: "recipient",
    tag: "tag",
} as const satisfies Record<keyof BridgeDeeplink, string>;

const AMOUNT_PATTERN = /^\d{1,15}(\.\d{1,18})?$/;
// FXRP / OFT decimals — extra digits are cut off, never rounded up
const AMOUNT_DECIMALS = 6;
// Letters and digits only (XRPL r-address, EVM 0x-address); the field checks the format and
// shows its error for anything else
const RECIPIENT_PATTERN = /^[0-9A-Za-z]{1,64}$/;
// The field checks the 0–4294967295 range
const TAG_PATTERN = /^\d{1,10}$/;

// Own keys only — `__proto__`, `constructor` and the like are not chains
function isUrlChainKey(key: string): key is keyof typeof URL_CHAIN_KEYS {
    return Object.hasOwn(URL_CHAIN_KEYS, key);
}

function chainFromUrlKey(key: string | undefined): BridgeRouteChain | undefined {
    return key && isUrlChainKey(key) ? URL_CHAIN_KEYS[key] : undefined;
}

function urlKeyOfChain(chain: BridgeRouteChain | undefined): string | undefined {
    return Object.entries(URL_CHAIN_KEYS).find(([, value]) => value === chain)?.[0];
}

// One value per param: a missing or repeated param (Next gives string[]) is ignored
function singleValue(query: ParsedUrlQuery, field: keyof BridgeDeeplink): string | undefined {
    const value = query[URL_PARAMS[field]];
    return typeof value === "string" ? value.trim() : undefined;
}

function truncateDecimals(amount: string, decimals: number): string {
    const [whole, fraction] = amount.split(".");
    const kept = fraction?.slice(0, decimals).replace(/0+$/, "");
    return kept ? `${whole}.${kept}` : whole;
}

// A link's tag the number field can show as it is — anything else it would reformat into
// another number (`1.5` → `15`, `-1` → `1`)
export function isWellFormedDeeplinkTag(tag: string): boolean {
    return TAG_PATTERN.test(tag);
}

// `/bridge?srcChain=flare&dstChain=xrpl&amount=100&recipient=r…&tag=123` → form values; anything
// malformed is dropped except the tag (Stargate's `srcToken` / `dstToken` too — always FXRP here).
// Whether the route takes a recipient / tag is checked where the form applies the link.
export function parseBridgeDeeplink(query: ParsedUrlQuery): BridgeDeeplink {
    const amount = singleValue(query, "amount");
    const recipient = singleValue(query, "recipient");
    const tag = singleValue(query, "tag");

    return {
        from: chainFromUrlKey(singleValue(query, "from")),
        to: chainFromUrlKey(singleValue(query, "to")),
        amount: amount && AMOUNT_PATTERN.test(amount) ? truncateDecimals(amount, AMOUNT_DECIMALS) : undefined,
        recipient: recipient && RECIPIENT_PATTERN.test(recipient) ? recipient : undefined,
        // A malformed tag is kept: dropping it would send without one (an exchange address without
        // RequireDest takes that). The tag field blocks Bridge until it is fixed
        tag: tag || undefined,
    };
}

// Form values → the query, in a fixed key order so equal values give an equal string
export function buildBridgeDeeplinkQuery(link: BridgeDeeplink): string {
    const values: Partial<Record<keyof BridgeDeeplink, string>> = {
        ...link,
        from: urlKeyOfChain(link.from),
        to: urlKeyOfChain(link.to),
    };
    const params = new URLSearchParams();
    (["from", "to", "amount", "recipient", "tag"] as const).forEach(field => {
        const value = values[field];
        if (value) params.set(URL_PARAMS[field], value);
    });
    return params.toString();
}

// A link's amount above what the route lets through is set to the max; floored to the token's
// decimals (a computed max can carry float noise), whole-number routes (mint) to an integer.
export function clampDeeplinkAmount(amount: number, maxAmount: number, allowDecimal: boolean): number {
    const capped = Math.min(amount, maxAmount);
    return allowDecimal ? roundDownToDecimals(capped, AMOUNT_DECIMALS) : Math.floor(capped);
}
