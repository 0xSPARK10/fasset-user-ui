---
id: bridge-ui-repick-same-chain
title: Bridge — clicking the already picked TO keeps the recipient and destination tag
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — clicking the already picked TO keeps the recipient and destination tag

## Context
Clicking the chain that is already picked as TO changes nothing. Regression: the click cleared the recipient address and destination tag in the form state while the fields kept showing them. After the user corrected the address, the transfer went with the new address but without the destination tag still shown in the field — for an exchange address that needs a tag, the XRP would not reach the user's account.

## Preconditions
- EVM wallet with FXRP on Flare and a little FLR for gas.
- An XRPL address (e.g. an exchange deposit address) and a destination tag for it.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`, pick FROM Flare, TO XRPL.
1. Enter 10, type the XRPL address in "Destination address" and the tag in "Dest. tag".
1. Click XRPL in the TO list again (mobile: open TO and tap XRPL).
1. Replace the last character of the address and type it again.
1. Click Bridge, Confirm, sign.

## Expected Results
- [ ] Step 5: both fields keep their values; the page URL still has `recipient=` and `tag=`.
- [ ] Step 6: the URL has the address and `tag=` with the typed tag.
- [ ] Verify: the XRP payment of the redemption has `DestinationTag` = the typed tag (XRPL explorer).
- [ ] Picking another TO (e.g. HyperEVM) still clears both fields.

## Edge Cases
- Does NOT test the swap button — `bridge-ui-swap-direction`
- A recipient and tag from a /bridge link — `bridge-deeplink-recipient-and-tag`

## Domain References
- App (this repo): `docs/BUSINESS_RULES.md` (Re-picking the selected TO changes nothing), `docs/CHANGELOG.md`
