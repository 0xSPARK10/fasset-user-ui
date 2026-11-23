---
id: bridge-history-mint-and-bridge-statuses
title: Mint & Bridge — Row status from LayerZero delivery
scenario_group: bridge
tags: [dev-proposal, p2, trigger-harness]
networks: [flare]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge — Row status from LayerZero delivery

## Context
The backend stays at `EXECUTED_TO_SMART_ACCOUNT` after the executor sends the OFT; the row status comes from LayerZero Scan. Mainnet only — testnet Scan does not index Coston2.

## Preconditions
- A `DIRECT_MINT_BRIDGE` history row with `oftSent` set.
- LayerZero Scan `GET /v1/messages/tx/{oftSent.txhash}` mocked per case.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Mock Scan `DELIVERED` and reload.
1. Mock `FAILED`, then `BLOCKED`, then `PAYLOAD_STORED`.
1. Mock no delivery with the source `blockTimestamp` 16 minutes ago.
1. For a Hyperliquid row, mock `DELIVERED` with `lzCompose.status = FAILED`.
1. Use a row with `eid = null`.

## Expected Results
- [ ] `DELIVERED` → "Finished" (Hyperliquid only with `lzCompose` `SUCCEEDED`).
- [ ] `FAILED` / `BLOCKED` / `PAYLOAD_STORED` / failed compose → "Failed".
- [ ] Not delivered 15 min after the LayerZero send → "Delayed"; before that "In progress".
- [ ] Row with unknown destination: gray circle, tooltip "Destination not available yet".
- [ ] Verify: The 15 min clock starts at the LayerZero send (`source.tx.blockTimestamp`), not at the XRP payment.

## Edge Cases
- Does NOT test recovery — see the `bridge-recovery-*` scenarios

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
