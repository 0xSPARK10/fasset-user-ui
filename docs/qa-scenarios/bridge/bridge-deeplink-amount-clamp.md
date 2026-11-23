---
id: bridge-deeplink-amount-clamp
title: Bridge deep link — amount above the balance is set to the maximum
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge deep link — amount above the balance is set to the maximum

## Context
Anyone can build a link with a huge amount. Above what the user can send, the amount is set to the
maximum, so the form never holds an amount the user cannot send. There is no extra notice: the field
shows the value and the FROM row the limit.

## Preconditions
- EVM wallet with FXRP on Flare (any amount below 1,000,000) and gas.
- XRPL wallet with XRP (any amount below 1,000,000) for step 7.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Navigate to `/bridge?srcChain=flare&dstChain=ethereum&amount=1000000`
1. Wait for the balances to load.
1. Change the amount by one digit.
1. Navigate to `/bridge?srcChain=flare&dstChain=xrpl&amount=0.5` (below one lot).
1. Navigate to `/bridge?srcChain=xrpl&dstChain=bsc&amount=1000000` (Mint & Bridge) and wait for the fees.

## Expected Results
- [ ] Step 4: the amount equals the FROM row's available amount (the same value Max sets).
- [ ] Step 4: no notice or alert about the change; "Bridge" is enabled.
- [ ] Step 5: the edited value is kept (not set back to the maximum).
- [ ] Step 6: the amount stays 0.5 and the form's existing minimum alert shows; "Bridge" is disabled.
- [ ] Step 7: the amount equals what Max sets (whole XRP after the minting fee and the LayerZero fee) and stays so after the fees load; "Bridge" is enabled.
- [ ] Verify: amount in the form = min(link amount, max sendable) (FROM row "N available" / "N redeemable")

## Edge Cases
- Does NOT test an amount sent in base units by mistake (e.g. `100500000`) — same path: it is above the balance and set to the maximum
- Does NOT test a route with nothing to send (balance 0): the link's amount is dropped and the form's own state shows

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Bridge page → Deep link), `docs/CHANGELOG.md`
- Code: `src/core/bridge/deeplinkRules.ts` (parsing, chain keys), `src/components/bridge/state/useBridgeDeeplink.ts` (URL sync)
