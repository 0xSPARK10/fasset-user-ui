---
id: bridge-deeplink-invalid-values
title: Bridge deep link — invalid, unknown and unsupported values are ignored
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge deep link — invalid, unknown and unsupported values are ignored

## Context
The URL is untrusted. Every value is checked; an invalid one is dropped and the rest of the link still
applies — except a malformed destination tag, which blocks Bridge instead (see `bridge-deeplink-recipient-and-tag.md`, step 8).
The page never crashes or shows a raw value outside the form fields.

## Preconditions
- Any wallet state (connected or not).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open each URL below and check the result before the next one.

| URL (path after the base URL) | Expected |
|---|---|
| `/bridge?srcChain=foo&dstChain=flare&amount=10` | Nothing picked, no amount |
| `/bridge?srcChain=__proto__&dstChain=constructor` | Nothing picked, no error |
| `/bridge?srcChain=flare&dstChain=foo` | FROM Flare only |
| `/bridge?srcChain=hypercore&dstChain=ethereum&amount=10` | FROM Hyperliquid only (route not supported), amount 10 once the balance loads |
| `/bridge?srcChain=flare&dstChain=ethereum&amount=-5` | Route picked, amount empty |
| `/bridge?srcChain=flare&dstChain=ethereum&amount=1e9` | Route picked, amount empty |
| `/bridge?srcChain=flare&dstChain=ethereum&amount=1,5` | Route picked, amount empty |
| `/bridge?srcChain=flare&dstChain=ethereum&amount=1.1234567` | Amount 1.123456 |
| `/bridge?srcChain=flare&srcChain=bsc&dstChain=ethereum` | Nothing picked (parameter twice) |
| `/bridge?from=flare&to=ethereum` | Nothing picked (old names) |
| `/bridge?srcChain=flare&dstChain=bsc&srcToken=0xAd55…&dstToken=0xCE61…` | Flare → BNB Chain, tokens ignored |
| `/bridge?srcChain=flare&dstChain=xrpl&recipient=%3Cscript%3E` | Route picked, no recipient |

## Expected Results
- [ ] Every row in the table matches; no error page, no console error.
- [ ] No value from the URL appears anywhere except inside the form fields.
- [ ] A chain not enabled on the environment (e.g. `katana` / `monad` on testnet) behaves like an unknown chain.

## Edge Cases
- Does NOT test valid prefill — see `bridge-deeplink-prefill.md`

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Bridge page → Deep link), `docs/CHANGELOG.md`
- Code: `src/core/bridge/deeplinkRules.ts` (parsing, chain keys), `src/components/bridge/state/useBridgeDeeplink.ts` (URL sync)
