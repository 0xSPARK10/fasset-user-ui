---
id: bridge-route-flare-to-remote
title: Bridge route — Flare to a remote chain
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Flare to a remote chain

## Context
LayerZero transfer out of Flare to every enabled remote chain, including Flare → Hyperliquid (LayerZero compose onto Hyperliquid spot). Parametrize over the chains enabled on the network.

## Preconditions
- EVM wallet with at least 5 FXRP and C2FLR / FLR on Flare.
- Chains: HyperEVM, Hyperliquid, Ethereum (testnet: Sepolia) — plus BNB Chain / Base / Katana / Monad where enabled.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM Flare, TO <chain>, enter 1.
1. Click Bridge; approve (first time) and send in the EVM wallet.
1. Wait for Finished.

## Expected Results
- [ ] The LayerZero fee is in C2FLR / FLR with 4 decimals; received = amount.
- [ ] Flare → Hyperliquid has no Change link (recipient is always the own address).
- [ ] Finished: "Bridge completed. Your FXRP is now available on <chain>."; Latest transactions shows the transfer; amount cleared.
- [ ] Verify: Destination FXRP balance: after = before + 1 (Hyperliquid: spot balance).
- [ ] Verify: Flare FXRP balance: after = before − 1.

## Edge Cases
- Failure paths are separate scenarios — limits, pauses, account checks, wallet rejects, recovery
- Mobile layout (< 768 px) not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
