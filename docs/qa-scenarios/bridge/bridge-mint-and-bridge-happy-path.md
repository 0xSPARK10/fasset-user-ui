---
id: bridge-mint-and-bridge-happy-path
title: Mint & Bridge — XRPL to Ethereum in one XRP payment
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge — XRPL to Ethereum in one XRP payment

## Context
XRP → FXRP on a remote chain in one XRP payment (direct mint & bridge): the backend mints FXRP to the user's Personal Account on Flare and an executor bridges it via LayerZero. No EVM signature or gas is needed. On testnet only Ethereum (Sepolia) completes.

## Preconditions
- XRPL wallet with at least 20 XRP.
- EVM wallet connected — the recipient is the connected EVM address (Custom not used; see `bridge-mint-and-bridge-custom-recipient`).
- No FAsset or OFT pause.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`, pick FROM XRPL and TO Ethereum.
1. Enter 10.
1. Click Bridge, then Confirm.
1. Sign the XRP payment in the XRPL wallet.
1. Wait for the modal to finish.

## Expected Results
- [ ] The fee panel shows "Minting fee" and "LayerZero fee" in XRP.
- [ ] The modal goes from "Confirm in your wallet" to waiting to finished.
- [ ] Latest transactions shows the row as "In progress", later "Finished" (testnet: from the backend status).
- [ ] Verify: The XRP payment goes to `payment_address` from `POST /api/v3/direct_mint/request`, with `memo` from the same response (starts with `0xFE`) and **no DestinationTag**.
- [ ] Verify: Payment drops = `amount.exact + total_fee.exact` from `/request`.
- [ ] Verify: Sepolia FXRP balance of the EVM address: after = before + `to_receive`.

## Edge Cases
- Does NOT test recovery — see the `bridge-recovery-*` scenarios

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
