---
id: bridge-recovery-wrong-xrpl-wallet
title: Mint & Bridge Recovery — Different XRPL wallet connected
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge Recovery — Different XRPL wallet connected

## Context
Recovery must be paid from the XRPL wallet that made the stuck payment.

## Preconditions
- Run `bridge-recovery-trigger-awaiting.md` first (produces the stuck payment)
- A stuck row (`bridge-recovery-trigger-awaiting`).
- A **different** XRPL wallet connected whose history still lists the row (or the history response mocked).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Hover Recover on the row.
1. Open the recovery modal.
1. Disconnect the XRPL wallet (EVM wallet only).

## Expected Results
- [ ] Recover is disabled with tooltip "Connect the XRPL wallet that made the payment to recover."
- [ ] The modal reads "Connect the XRPL wallet that made the payment ({address}) to recover."
- [ ] Without an XRPL wallet no Mint & Bridge rows and no "Recovery needed" box (the history request has no `xrpAddress`).

## Edge Cases
- Does NOT test Asset Recovery (redeemer account) — see `bridge-asset-recovery-transfer`
- Stuck payments older than 7 days are not listed (history window) — not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
