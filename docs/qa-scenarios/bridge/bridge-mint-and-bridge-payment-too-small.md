---
id: bridge-mint-and-bridge-payment-too-small
title: Mint & Bridge — Payment too small for the fee
scenario_group: bridge
tags: [dev-proposal, p2, trigger-harness]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge — Payment too small for the fee

## Context
An XRP payment below `amount + total_fee` cannot cover the fee. Not reachable from the UI — the app always pays the full amount.

## Preconditions
- XRPL wallet whose seed the harness controls (the payment is sent outside the app).
- The same XRPL address connected in the app, plus an EVM wallet.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Call `POST /api/v3/direct_mint/request` for 10 FXRP to Ethereum.
1. From the harness, pay **less** than `amount + total_fee` drops to `payment_address` with that `memo`.
1. Open `/bridge` and wait for the row in Latest transactions (a few minutes).

## Expected Results
- [ ] The row reads "Payment too small".
- [ ] No Recover button.
- [ ] Verify: `GET /api/oft/userHistory/{evm}?xrpAddress={xrpl}` row has `directMintingStatus = MINTING_PAYMENT_TOO_SMALL_FOR_FEE`.

## Edge Cases
- Does NOT test recovery — see the `bridge-recovery-*` scenarios

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
