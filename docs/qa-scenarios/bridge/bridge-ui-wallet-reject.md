---
id: bridge-ui-wallet-reject
title: Bridge — Rejected signature on every wallet prompt
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — Rejected signature on every wallet prompt

## Context
A rejected signature must keep the form, show why, and leave nothing half-sent — for the EVM send, the XRP payment and the recovery payment.

## Preconditions
- EVM wallet with FXRP on Flare; XRPL wallet with XRP.
- For case C: a stuck Mint & Bridge (`bridge-recovery-trigger-awaiting`).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. A: Flare → HyperEVM, enter 1, click Bridge, reject in the EVM wallet; change the amount.
1. B: XRPL → Flare, enter 10, click Bridge, reject the XRP payment.
1. C: click Recover, Next, reject the recovery payment.
1. D (MetaMask): with MetaMask on Flare, pick HyperEVM → Hyperliquid, click Bridge, reject the "Switch network" prompt (to get the prompt, disconnect the site in MetaMask and reconnect on Flare).
1. Double-click Bridge on route A.

## Expected Results
- [ ] A and B: modal closes, "Request rejected" on top of the form, amount kept; changing the amount clears the error.
- [ ] C: error in the modal; Recover is still offered afterwards (not "Recovering…").
- [ ] D: the rejection is shown and nothing is sent — not "The network could not process the transaction right now"; MetaMask stays on Flare.
- [ ] Double-click opens one wallet prompt.
- [ ] Verify: No transaction from the EVM address on Flare and no XRP payment from the XRPL address after the rejects.

## Edge Cases
- Remote ↔ remote routes (e.g. Ethereum → HyperEVM) are not covered; on testnet Base Sepolia is peered only with Coston2

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
