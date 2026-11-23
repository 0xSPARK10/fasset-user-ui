---
id: bridge-route-flare-to-xrpl
title: Bridge route — Flare to XRPL (redeem)
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Flare to XRPL (redeem)

## Context
Redeem on the bridge page: FXRP on Flare → XRP on XRPL.

## Preconditions
- EVM wallet with at least 20 FXRP and C2FLR / FLR for gas; XRPL wallet connected (or a custom XRPL address).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM Flare, TO XRPL.
1. Check the FROM row reads "N redeemable".
1. Enter one lot (e.g. 10), click Bridge, confirm in the EVM wallet.
1. Wait for Finished.

## Expected Results
- [ ] Fees show the redemption fee and the executor fee.
- [ ] Finished; Latest transactions shows a redeem row with its ticket(s).
- [ ] Verify: Flare FXRP balance: after = before − amount.
- [ ] Verify: XRPL balance: after ≈ before + amount − redemption fee (paid by the agent, may take minutes).

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
