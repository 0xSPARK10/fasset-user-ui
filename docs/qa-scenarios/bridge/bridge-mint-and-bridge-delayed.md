---
id: bridge-mint-and-bridge-delayed
title: Mint & Bridge — Minting delayed by the rate limit
scenario_group: bridge
tags: [dev-proposal, p2, trigger-harness]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge — Minting delayed by the rate limit

## Context
The minting rate limit can delay the mint; the bridge then runs later.

## Preconditions
- XRPL and EVM wallets connected.
- `GET /api/v3/direct_mint/status/{xrplTxHash}` mocked to return `status: delayed` with `delayed_to`.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Run `bridge-mint-and-bridge-happy-path` up to signing the payment.
1. Wait for the first status poll (every 10 s).

## Expected Results
- [ ] The modal shows "Minting is delayed until {time}."
- [ ] The Latest transactions row reads "Delayed".
- [ ] Verify: The shown time equals `delayed_to` from the status response.

## Edge Cases
- Does NOT test recovery — see the `bridge-recovery-*` scenarios

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
