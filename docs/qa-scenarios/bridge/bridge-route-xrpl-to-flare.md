---
id: bridge-route-xrpl-to-flare
title: Bridge route — XRPL to Flare (mint)
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — XRPL to Flare (mint)

## Context
Mint on the bridge page: XRP on XRPL → FXRP on Flare. Same rules as the Mint page (minimum 10 XRP, high-fee warning).

## Preconditions
- XRPL wallet with at least 30 XRP; EVM wallet connected (FXRP goes to the connected Flare address unless Change is used).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`, pick FROM XRPL, TO Flare.
1. Check the FROM row reads "N mintable".
1. Enter 10, click Bridge.
1. If "High Minting Fee" opens, continue.
1. Pay in the XRPL wallet and wait for Finished.

## Expected Results
- [ ] Fees show the minting fee; received amount shown.
- [ ] Modal: "Confirm in your wallet" → waiting → "Finished".
- [ ] Latest transactions: a mint row, later finished; balances refresh, amount cleared.
- [ ] Verify: Flare FXRP balance: after = before + minted amount.
- [ ] Verify: XRPL balance: after = before − (amount + fees + XRPL tx fee).

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
