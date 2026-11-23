---
id: bridge-route-remote-to-flare
title: Bridge route — Remote chain to Flare
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Remote chain to Flare

## Context
LayerZero transfer from a remote chain back to Flare. No approve; the fee is paid in the source chain's gas coin.

## Preconditions
- EVM wallet with FXRP and gas on the source chain (HyperEVM: HYPE, Ethereum: ETH, BNB Chain: BNB).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM <chain>, TO Flare, enter 1.
1. Click Bridge, send in the EVM wallet (the wallet switches to the source chain).
1. Wait for Finished.

## Expected Results
- [ ] Fee in the source gas coin (ETH with 6 decimals, others 4).
- [ ] No approve step.
- [ ] Latest transactions shows the transfer as "In progress" right after the send (mainnet), then finished.
- [ ] Verify: Flare FXRP balance: after = before + 1.
- [ ] Verify: Source FXRP balance: after = before − 1.

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
