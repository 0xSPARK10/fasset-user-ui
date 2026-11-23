---
id: bridge-history-remote-to-flare-in-flight
title: Bridge — In-flight remote to Flare transfer in Latest transactions
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
networks: [flare]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — In-flight remote to Flare transfer in Latest transactions

## Context
The backend lists a remote → Flare transfer only once LayerZero delivers it; until then the row comes from LayerZero Scan.

## Preconditions
- EVM wallet with FXRP on HyperEVM (or Ethereum) and gas.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Bridge 1 FXRP HyperEVM → Flare.
1. Watch Latest transactions until delivery.

## Expected Results
- [ ] The row shows "In progress" right after the send, linking to LayerZero Scan.
- [ ] After delivery there is one row (no duplicate).
- [ ] Verify: Flare FXRP balance: after = before + 1.

## Edge Cases
- Remote ↔ remote routes (e.g. Ethereum → HyperEVM) are not covered; on testnet Base Sepolia is peered only with Coston2

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
