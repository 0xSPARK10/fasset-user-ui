---
id: bridge-guard-oft-rate-limit
title: Bridge — OFT rate limit caps the amount
scenario_group: bridge
tags: [dev-proposal, p2, trigger-harness]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — OFT rate limit caps the amount

## Context
A send above the OFT adapter's rate limit reverts after the LayerZero fee is paid, so the app caps the amount.

## Preconditions
- EVM wallet with more FXRP than the mocked limit.
- `GET /oft/limits` mocked with `outgoingRemainingDrops` = `5000000` (5 FXRP) for the destination EID.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick Flare → HyperEVM, click Max.
1. Enter 6.

## Expected Results
- [ ] Max fills 5.
- [ ] 6 shows "The bridge limit for this route is 5 FXRP right now." and blocks the CTA.
- [ ] Verify: Limits are 6-decimal UBA: `1000000` = 1 FXRP. Outgoing applies to Flare → remote and Mint & Bridge; incoming to remote → Flare and bridge → XRPL.

## Edge Cases
- Hyperliquid ↔ HyperEVM skips the pause and OFT-limit checks once picked (it passes neither the FAsset nor the OFT adapter), but the picker locks it like every other chain — a pause after it was picked is not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
