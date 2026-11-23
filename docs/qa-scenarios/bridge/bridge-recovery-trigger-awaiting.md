---
id: bridge-recovery-trigger-awaiting
title: Mint & Bridge Recovery — Put a payment into awaiting recovery
scenario_group: bridge
tags: [dev-proposal, p1, trigger-harness]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge Recovery — Put a payment into awaiting recovery

## Context
Setup for the recovery scenarios: puts a direct mint & bridge into `awaiting_recovery` on purpose. Two `/request` calls with the same input return the same memo; paying it twice makes the second payment fail on Flare (`CALL_FAILED`).

## Preconditions
- XRPL testnet wallet whose seed the harness keeps — recovery must be paid from the same wallet.
- EVM wallet; at least 25 XRP.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Call `POST /api/v3/direct_mint/request` twice with the same input; check both return the same `memo`.
1. Pay that memo once (from the app or the harness).
1. Pay the same memo a second time from the harness, same amount.
1. Wait a few minutes, open `/bridge` with both wallets connected.

## Expected Results
- [ ] A "Recovery needed" box above the form: "Your Mint & Bridge didn’t complete, but your funds are safe…" with **Recover**.
- [ ] The Latest transactions row reads "Needs recovery" with **Recover**.
- [ ] Verify: First payment: smart status `executed`.
- [ ] Verify: Second payment: `GET /api/v3/direct_mint/status/{hash}` → `status = awaiting_recovery`, `payload.type = RecoveryMemo`, `payload.reason = CALL_FAILED`, `payload.amount` = 0.1 XRP, `payload.memo` starts with `0xE0`.
- [ ] Verify: History `directMintingStatus = AWAITING_RECOVERY`.

## Edge Cases
- Does NOT test Asset Recovery (redeemer account) — see `bridge-asset-recovery-transfer`
- Stuck payments older than 7 days are not listed (history window) — not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
