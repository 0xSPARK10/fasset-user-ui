---
id: bridge-route-remote-to-hyperliquid
title: Bridge route — Remote chain to Hyperliquid in one transaction
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Remote chain to Hyperliquid in one transaction

## Context
Ethereum / BNB Chain / Base (any remote chain but HyperEVM) → Hyperliquid: one LayerZero send to HyperEVM; the Hyperliquid composer on HyperEVM moves the FXRP to the recipient's Hyperliquid spot account (the sender's unless "Custom" is used).

## Preconditions
- EVM address active on Hyperliquid; FXRP + ETH on Ethereum (testnet: Sepolia).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM Ethereum, TO Hyperliquid — the TO field shows the connected address with "Custom".
1. Enter 3, click Bridge, confirm the Ethereum transaction, wait for "Finished".

## Expected Results
- [ ] Fee row in ETH; one wallet transaction.
- [ ] Waiting modal closes with "Finished" once LayerZero delivers (testnet Scan can lag a few minutes).
- [ ] Latest transactions: a row Ethereum → Hyperliquid (Hyperliquid icon), 3.00, "Finished".
- [ ] Verify: Ethereum FXRP after = before − 3; Hyperliquid spot FXRP after = before + 3.

## Edge Cases
- HyperEVM → Hyperliquid is a different route (system transfer) — `bridge-route-hyperevm-hyperliquid`
- Custom recipient and an inactive recipient — `bridge-guard-hyperliquid-custom-recipient`
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Bridge chains & LayerZero routes), `docs/CHANGELOG.md`
