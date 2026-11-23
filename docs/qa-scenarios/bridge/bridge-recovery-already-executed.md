---
id: bridge-recovery-already-executed
title: Mint & Bridge Recovery — Bridge executed after all
scenario_group: bridge
tags: [dev-proposal, p2, trigger-harness]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge Recovery — Bridge executed after all

## Context
History can still say `AWAITING_RECOVERY` while the fresh smart status is already `executed`; recovery cannot undo a send that happened.

## Preconditions
- A history row in `AWAITING_RECOVERY`.
- `GET /api/v3/direct_mint/status/{hash}` mocked to `status: executed`.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Click Recover.

## Expected Results
- [ ] The modal reads "This transfer was bridged after all — there is nothing to recover."
- [ ] No payment is offered.

## Edge Cases
- Does NOT test Asset Recovery (redeemer account) — see `bridge-asset-recovery-transfer`
- Stuck payments older than 7 days are not listed (history window) — not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
