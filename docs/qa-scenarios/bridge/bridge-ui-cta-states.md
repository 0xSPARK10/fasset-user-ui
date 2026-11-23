---
id: bridge-ui-cta-states
title: Bridge — CTA label and form resets
scenario_group: bridge
tags: [dev-proposal, p3, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — CTA label and form resets

## Context
CTA label and form resets guide the user through the route choice.

## Preconditions
- No wallet connected at the start.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`.
1. Pick FROM Flare, TO HyperEVM.
1. Enter 10.
1. Connect the EVM wallet.
1. Change TO, then FROM.
1. Pick XRPL → Ethereum and Flare → Hyperliquid.
1. Connect only an XRPL wallet and pick XRPL → Ethereum.

## Expected Results
- [ ] CTA "Select network" until both chains are picked, then "Connect wallet", then "Bridge".
- [ ] The fee shows without a wallet.
- [ ] Changing FROM or TO resets the amount.
- [ ] Hyperliquid ↔ HyperEVM has no "Custom" recipient.
- [ ] XRPL → Ethereum without an EVM wallet: "Connect an EVM wallet. Latest transactions and recovery of a stuck transfer need it."; the CTA does not start a payment.

## Edge Cases
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
