---
id: bridge-route-remote-to-remote
title: Bridge route — Between two remote chains
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Between two remote chains

## Context
LayerZero transfer between two non-Flare chains (e.g. Ethereum → HyperEVM), without going through Flare. Listed in Latest transactions from LayerZero Scan.

## Preconditions
- EVM wallet with FXRP and gas on the source chain.
- A pair whose OFTs are peered (testnet: Base Sepolia is peered only with Coston2 — do not use it here).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM Ethereum, TO HyperEVM, enter 1.
1. Click Bridge, send.
1. Wait for Finished; reload Latest transactions.

## Expected Results
- [ ] Fee in the source gas coin.
- [ ] Latest transactions lists the transfer with the amount decoded from the message.
- [ ] Verify: Destination FXRP balance: after = before + 1; source: after = before − 1.

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
