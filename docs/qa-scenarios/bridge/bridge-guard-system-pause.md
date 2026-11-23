---
id: bridge-guard-system-pause
title: Bridge — FAsset or OFT pause locks the page
scenario_group: bridge
tags: [dev-proposal, p1, trigger-harness]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — FAsset or OFT pause locks the page

## Context
A FAsset emergency pause (`GET /fassetState` → `state: true`) or a paused Flare OFT adapter (`GET /oft/paused` → `true`) locks the whole bridge page, mint and redeem on it included. `/mint` keeps working under an OFT pause.

## Preconditions
- Both wallets connected.
- Case A: `GET /fassetState` mocked to `state: true`.
- Case B: `GET /oft/paused` mocked to `true`.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge` with the mock active (each case).
1. Try to pick a chain and enter an amount.
1. Case B: without the mock, pick Flare → HyperEVM and enter 1; turn the mock on; click Bridge.
1. Case B: open `/mint` and start a mint.
1. Remove the mock and wait ~60 s.

## Expected Results
- [ ] Every chain in the picker is greyed out — Hyperliquid and HyperEVM too — the amount is locked, an info alert and a red banner show, the CTA is blocked.
- [ ] Case B banner: "Bridging is temporarily paused. You can still mint and redeem on the Mint page."
- [ ] A pause that starts after the route was picked still blocks on CTA click — nothing is signed.
- [ ] Case B: `/mint` works.
- [ ] After unmocking the page unlocks without reload.
- [ ] Verify: The CTA click re-fetches `/fassetState` and `/oft/paused` before any wallet prompt.

## Edge Cases
- Hyperliquid ↔ HyperEVM skips the pause and OFT-limit checks once picked (it passes neither the FAsset nor the OFT adapter), but the picker locks it like every other chain — a pause after it was picked is not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
