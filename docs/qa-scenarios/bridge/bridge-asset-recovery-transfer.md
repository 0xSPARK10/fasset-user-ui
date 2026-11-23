---
id: bridge-asset-recovery-transfer
title: Asset Recovery — Transfer the redeemer account balance
scenario_group: bridge
tags: [dev-proposal, p1, trigger-harness]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Asset Recovery — Transfer the redeemer account balance

## Context
A bridge → XRPL whose redeem fails leaves FXRP on the user's redeemer (bridge) account. Asset Recovery transfers the exact on-chain balance back. Open: the UI caps bridge → XRPL at one redemption request, so an easier trigger may need QA / backend input.

## Preconditions
- EVM wallet on a remote chain (e.g. Sepolia) with FXRP and gas.
- How to trigger: the harness calls the remote OFT `send` with the XRPL compose message directly, with an amount above `maxAmountOneRedemption` (the rest after the partial redeem stays on the redeemer account) or with a redeem that reverts.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Trigger the leftover as above.
1. Open `/bridge` and wait (the redeemer balance refreshes every 45 s, no reload).
1. Click Transfer on the token box.
1. Confirm in the wallet.

## Expected Results
- [ ] A "Recovery needed" box with one box per token ≥ 0.01: "Your previous bridge transaction didn’t complete, but your funds are safe…"
- [ ] The modal shows amount and destination, no amount input; it stays open on "Finished".
- [ ] The box disappears.
- [ ] Verify: Transferred amount = the redeemer account's `balanceOf` exactly (no dust; e.g. 709.655623, not 709.65).
- [ ] Verify: Redeemer balance after = 0; wallet balance after = before + that amount.

## Edge Cases
- Does NOT test Mint & Bridge recovery — see the `bridge-recovery-*` scenarios

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
