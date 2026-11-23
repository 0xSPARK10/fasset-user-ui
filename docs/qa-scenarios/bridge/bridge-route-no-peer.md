---
id: bridge-route-no-peer
title: Bridge — Route without a LayerZero peer
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — Route without a LayerZero peer

## Context
The fee quote (`quoteSend`) reverts with `NoPeer` when the source OFT has no peer for the destination chain. On testnet Base Sepolia is peered only with Coston2, so Base Sepolia ↔ BNB testnet triggers it.

## Preconditions
- Testnet. No wallet needed (the fee is quoted before connecting); optionally an EVM wallet with FXRP on Base Sepolia.

## Steps
1. Navigate to the base URL with the path `/bridge`
1. Pick FROM Base, TO BNB Chain.
1. Enter 5.
1. Change the amount to 6.

## Expected Results
- [ ] After step 3: an error toast "This route is not available yet." (not the raw "NoPeer" error); no fee is shown; the CTA cannot send.
- [ ] Step 4: the same toast again (each failed quote shows it).
- [ ] Base → Flare in the same session quotes a fee normally.

## Edge Cases
- Mainnet routes all have peers; this only shows up on a misconfigured or new chain

## Domain References
- App (this repo): `docs/CHANGELOG.md`
