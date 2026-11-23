---
id: bridge-route-hyperevm-hyperliquid
title: Bridge route — HyperEVM and Hyperliquid, both directions
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — HyperEVM and Hyperliquid, both directions

## Context
FXRP between HyperEVM and Hyperliquid spot through the token's system address — not LayerZero. Both directions credit the sender's own address.

## Preconditions
- EVM address active on Hyperliquid, with FXRP + HYPE on HyperEVM and HYPE on Hyperliquid spot.
- Also run with a Ledger (Ethereum app open and up to date): Hyperliquid → HyperEVM shows the transfer fields on the device.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM HyperEVM, TO Hyperliquid, enter 1, click Bridge, confirm the HyperEVM transaction.
1. Pick FROM Hyperliquid, TO HyperEVM, enter 1, click Bridge, sign the transfer.

## Expected Results
- [ ] HyperEVM → Hyperliquid: one transaction, fee row in HYPE.
- [ ] Hyperliquid → HyperEVM: one signature ("Nothing is sent on-chain from your wallet, Hyperliquid moves the FXRP."), "Bridge fee" in HYPE.
- [ ] Modal title "Bridge FXRP to …"; finished: "Finished"; both appear in Latest transactions.
- [ ] Verify: Hyperliquid spot FXRP and HyperEVM FXRP: each after = before ± 1 per direction.

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
