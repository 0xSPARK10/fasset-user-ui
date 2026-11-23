---
id: bridge-route-remote-to-xrpl
title: Bridge route — Remote chain to XRPL (bridge + redeem)
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Remote chain to XRPL (bridge + redeem)

## Context
Bridge + redeem: FXRP on a remote chain → XRP on XRPL in one send; the redeem composer on Flare redeems it. Capped at one redemption request.

## Preconditions
- EVM wallet with at least 10 FXRP and gas on HyperEVM or Ethereum.
- XRPL wallet connected (or a custom XRPL address).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM HyperEVM (repeat with Ethereum), TO XRPL.
1. Enter 10, click Bridge, send in the EVM wallet.
1. Wait for Finished.

## Expected Results
- [ ] Fees: LayerZero fee in the source gas coin + redemption fee in XRP; received is less than the amount, cut to 2 decimals.
- [ ] With a composer fee (testnet, `composerFeePPM` > 0): a "Composer fee" row in FXRP; "N available" under the source token equals what Max fills (e.g. balance 122.95 → 122.83), not the balance. Mainnet (PPM 0): no composer row, available = balance.
- [ ] Finished: "Bridge completed. Your XRP is now available on XRPL."
- [ ] No "Recovery needed" box appears afterwards.
- [ ] Verify: XRPL balance: after ≈ before + received (the agent pays, may take minutes).
- [ ] Verify: Sent `amountLD` = net × 1e6 / (1e6 − composerFeePPM).
- [ ] Verify: Redeemer (bridge) account FXRP balance stays 0.

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
