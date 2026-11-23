---
id: bridge-guard-hyperliquid-to-hyperevm
title: Bridge — Hyperliquid to HyperEVM guards
scenario_group: bridge
tags: [dev-proposal, p3, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — Hyperliquid to HyperEVM guards

## Context
Hyperliquid → HyperEVM pays its fee in HYPE on Hyperliquid and needs an EIP-712 signature (Ledger: Ethereum app).

## Preconditions
- Case A: EVM wallet with FXRP on Hyperliquid and no spendable HYPE there.
- Case B: a Ledger without EIP-712 clear signing (e.g. Nano S or an old Ethereum app) with Blind signing off in the Ethereum app settings.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick Hyperliquid → HyperEVM, enter 1 (each case).
1. Case B: click Bridge, then "I’m ready to Confirm transaction".

## Expected Results
- [ ] A: blocked for missing HYPE.
- [ ] B: not blocked before Bridge; after the confirm click the app shows "Enable Blind signing in the Ethereum app settings on your Ledger, then try again." and nothing is transferred.
- [ ] B, Blind signing on: the device shows a hash; after approving, "Transfer sent".

## Edge Cases
- Remote ↔ remote routes (e.g. Ethereum → HyperEVM) are not covered; on testnet Base Sepolia is peered only with Coston2

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
