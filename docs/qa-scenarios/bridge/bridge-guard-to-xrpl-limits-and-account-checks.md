---
id: bridge-guard-to-xrpl-limits-and-account-checks
title: Bridge to XRPL — Limits, account flags and destination tag
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge to XRPL — Limits, account flags and destination tag

## Context
Bridge → XRPL redeems through the composer on Flare. Wrong limits or destination checks can strand funds on the redeemer account.

## Preconditions
- EVM wallet with FXRP on HyperEVM and HYPE.
- XRPL test addresses: one with Deposit Authorization, one with `requireDestTag`.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick HyperEVM → XRPL, enter 3.
1. Click Max.
1. Custom destination: the Deposit Authorization address.
1. The `requireDestTag` address with an empty tag, then tag 123.
1. Tag `0`, then `9999999999`, then paste `18446744073709551616`.

## Expected Results
- [ ] 3 → "Please enter at least 5 …" after typing stops; balance < 5 → "Insufficient balance (min 5 FXRP)".
- [ ] Max = min(balance after the composer fee, one redemption request); FROM shows "N redeemable".
- [ ] Redemption queue below the balance → FROM shows "N redeemable" and a blue notice "Current max redeemable: N FXRP."; an amount above N → the "above max" warning replaces the notice. Same on Flare → XRPL.
- [ ] Deposit Authorization → error, blocked.
- [ ] `requireDestTag` without tag → alert; with tag → cleared.
- [ ] Tag `0` accepted; the two large tags → "Destination tag invalid" (not truncated).
- [ ] Verify: Sent `amountLD` = net × 1e6 / (1e6 − composerFeePPM).

## Edge Cases
- Remote ↔ remote routes (e.g. Ethereum → HyperEVM) are not covered; on testnet Base Sepolia is peered only with Coston2

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
