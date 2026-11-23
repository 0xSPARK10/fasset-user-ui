---
id: bridge-recovery-happy-path
title: Mint & Bridge Recovery — Recover to the Personal Account
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge Recovery — Recover to the Personal Account

## Context
Recovery releases the stuck FXRP to the user's Personal Account on Flare. It does not refund XRP and does not retry the bridge.

## Preconditions
- Run `bridge-recovery-trigger-awaiting.md` first (produces the stuck payment)
- The XRPL wallet that made the stuck payment is connected, with at least 1 XRP.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Click Recover in the "Recovery needed" box (or on the history row).
1. Check the review step, click Next.
1. Sign the XRP payment.
1. Wait in the modal (a few minutes).

## Expected Results
- [ ] Review shows the amount, the Flare Smart Account address and "Recovery fee" 0.1 XRP.
- [ ] Then "Confirm in your wallet" → "Recovering" → finished: "Your FXRP is now available on Flare Smart Account" and "Open FSA app".
- [ ] The box disappears; the history row reads "Recovered" with "Open FSA app".
- [ ] Verify: Recovery payment = exactly `payload.amount.exact` drops to `payload.payment_address` with `payload.memo` (`0xE0…` + original hash).
- [ ] Verify: Smart status of the **original** hash: `awaiting_recovery` + `RecoveryMemo` → `RecoveryReplayPending` (~3 min) → `memo_skipped`.
- [ ] Verify: Personal Account FXRP on Flare: after = before + the row amount.
- [ ] Verify: EVM recipient balance on the destination chain unchanged; no XRP refund.

## Edge Cases
- Does NOT test Asset Recovery (redeemer account) — see `bridge-asset-recovery-transfer`
- Stuck payments older than 7 days are not listed (history window) — not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
