---
id: bridge-mint-and-bridge-fee-changed
title: Mint & Bridge — Fee changed between preview and request
scenario_group: bridge
tags: [dev-proposal, p2, trigger-harness]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge — Fee changed between preview and request

## Context
The fee preview (`/fee`) is non-binding; `/request` returns the real fee. Only when it is worse for the user by more than 1 XRP (fee higher or FXRP received lower) must the user confirm again before signing; smaller or better changes sign right away.

## Preconditions
- XRPL and EVM wallets connected.
- `POST /api/v3/direct_mint/request` mocked to return a `total_fee` more than 1 XRP higher (or `to_receive` more than 1 lower) than `GET /api/v3/direct_mint/fee`.
- Second run: the mock raises `total_fee` by 0.1 XRP only.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick XRPL → Ethereum, enter 10.
1. Click Bridge.

## Expected Results
- [ ] The modal shows "The fee changed: you now send {total} XRP and receive {receive} FXRP. Confirm to continue."
- [ ] Nothing is sent to the XRPL wallet until Confirm is clicked again.
- [ ] Second run (+0.1 XRP): no notice, the wallet prompt opens right away with the `/request` amount.
- [ ] Verify: After confirming, the signed payment drops = the **mocked** `/request` `amount.exact + total_fee.exact`, not the preview.

## Edge Cases
- Does NOT test recovery — see the `bridge-recovery-*` scenarios

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
