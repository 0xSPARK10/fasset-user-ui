---
id: bridge-deeplink-prefill
title: Bridge deep link — route and amount filled in from the URL
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge deep link — route and amount filled in from the URL

## Context
A partner app (e.g. Stargate) links to `/bridge?srcChain=…&dstChain=…&amount=…`. The page opens with
the route picked and, once the source wallet is connected, the amount filled in. Nothing is submitted
by the link. Chain keys: `xrpl`, `flare`, `ethereum`, `bsc`, `base`, `katana`, `monad`,
`hyperliquid` (= HyperEVM), `hypercore` (= the chain the app labels "Hyperliquid").

## Preconditions
- EVM wallet with at least 20 FXRP on Flare and gas.
- No wallet connected at the start (the scenario checks the amount and fees before connecting).

## Steps
1. Navigate to the base URL with the path `/bridge?srcChain=flare&dstChain=ethereum&amount=12.5`
1. Check the FROM column has Flare picked and the TO column Ethereum.
1. Connect wallet using steps from `connect-wallet.md`
1. Wait for the balances to load.
1. Navigate to `/bridge?srcChain=hyperliquid&dstChain=hypercore` (wallet still connected).
1. Navigate to `/bridge?srcChain=xrpl&dstChain=flare&amount=10.7` with an XRPL wallet connected.

## Expected Results
- [ ] Step 2: Flare → Ethereum is picked before any wallet is connected; the amount field shows 12.5 and is editable, the LayerZero fee and the received amount are quoted for 12.5; Max is disabled, the CTA reads "Connect wallet".
- [ ] Step 4: the amount field still shows 12.5 (balance ≥ 20); with a balance below 12.5 it is set to the balance.
- [ ] Nothing is sent and no wallet prompt opens until the user clicks "Bridge".
- [ ] Step 5: FROM = HyperEVM, TO = Hyperliquid (the HyperCore chain).
- [ ] Step 6: the amount is 10 — mint takes whole XRP, the decimals are cut, never rounded up.

## Edge Cases
- Does NOT test an amount above the balance — see `bridge-deeplink-amount-clamp.md`
- Does NOT test recipient / tag — see `bridge-deeplink-recipient-and-tag.md`
- Does NOT test invalid values — see `bridge-deeplink-invalid-values.md`
- Mobile layout (< 768 px) uses the same state; worth one run of step 1–4 there

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Bridge page → Deep link), `docs/CHANGELOG.md`
- Code: `src/core/bridge/deeplinkRules.ts` (parsing, chain keys), `src/components/bridge/state/useBridgeDeeplink.ts` (URL sync)
