---
id: bridge-recovery-no-double-payment
title: Mint & Bridge Recovery — No second payment while processing
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge Recovery — No second payment while processing

## Context
The backend keeps offering the `RecoveryMemo` for a few minutes after the recovery is paid. A second payment would be lost, so the app must not offer it.

## Preconditions
- Run `bridge-recovery-trigger-awaiting.md` first (produces the stuck payment)
- The same XRPL wallet connected.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pay the recovery as in `bridge-recovery-happy-path`.
1. Right after signing, close the modal and click the row / box again.
1. Reload the page.
1. Harness variant: mock smart status `awaiting_recovery` with `payload: null`, then `payload.type: RecoveryReplayPending`, and click Recover.

## Expected Results
- [ ] After reopening: "The recovery is being processed. This can take a few minutes — you can close this window.", no Next.
- [ ] After reload: the box and the row show "Recovering…" / one "Recovering" badge, no Recover.
- [ ] Harness variant: the modal shows the processing text, no Next.
- [ ] Verify: Exactly one `0xE0` payment from the wallet on XRPL.
- [ ] Verify: After reload, the history row has `directMintingStatus = RECOVERY_PENDING`.

## Edge Cases
- Does NOT test Asset Recovery (redeemer account) — see `bridge-asset-recovery-transfer`
- Stuck payments older than 7 days are not listed (history window) — not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
