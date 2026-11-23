---
id: bridge-deeplink-recipient-and-tag
title: Bridge deep link — recipient and destination tag from the URL
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge deep link — recipient and destination tag from the URL

## Context
A link can carry another receiving address (`recipient`) and, for routes ending on XRPL, a
destination tag (`tag`). A recipient from a link is a phishing risk, so it is always shown in the open
"Destination address" field with the hint "From the link. Check that this is the right address." A
tag is applied on every route that ends on XRPL — for the link's address or for the user's own XRPL wallet.

## Preconditions
- EVM wallet with at least 20 FXRP on Flare and gas; XRPL wallet connected.
- A valid XRPL test address that is not the user's own (placeholder `rRECIPIENT…`).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Navigate to `/bridge?srcChain=flare&dstChain=xrpl&amount=10&recipient=rRECIPIENT…&tag=123`
1. Edit one character of the address.
1. Replace the address with another valid XRPL address and the tag with 456, then resize the window across the width where "Dest. tag" moves below the address and back (or switch between mobile and desktop width).
1. Navigate to `/bridge?srcChain=flare&dstChain=xrpl&recipient=0x0000000000000000000000000000000000000001`
1. Navigate to `/bridge?srcChain=flare&dstChain=xrpl&tag=123` (no recipient)
1. Navigate to `/bridge?srcChain=flare&dstChain=xrpl&recipient=rRECIPIENT…&tag=99999999999`
1. Navigate to `/bridge?srcChain=xrpl&dstChain=ethereum&recipient=0x0000000000000000000000000000000000000001` (Mint & Bridge)

## Expected Results
- [ ] Step 3: "Destination address" is open with the link's address; "Dest. tag" shows 123; the hint "From the link. Check that this is the right address." is under the address.
- [ ] Step 3: the address field does not take focus (no keyboard pop-up on mobile).
- [ ] Step 4: the hint disappears after the edit.
- [ ] Step 5: the address and tag stay the user's (456), or the fields come back empty — never the link's address or 123 again.
- [ ] Step 6: the field shows the EVM address with "Invalid XRPL address"; "Bridge" is disabled.
- [ ] Step 7: the user's own XRPL wallet is the destination and "Dest. tag" shows 123; the URL keeps `tag=123`.
- [ ] Step 8: a tag over 10 digits leaves "Dest. tag" empty with "Destination tag must be a whole number between 0 and 4294967295"; "Bridge" is disabled until the tag is edited. The same for `tag=-1`, `tag=1.5`, `tag=abc` (the field never shows another number such as `15` or `1`). A 10-digit tag above 4294967295 (e.g. `4294967296`) shows in the field with the same error.
- [ ] Step 8: typing a valid tag, or typing and deleting (no tag), clears the error and enables "Bridge".
- [ ] Step 9: the address is in the TO field as a custom recipient with "From the link. Check that this is the right address."
- [ ] After step 3 and a redeem: the confirm modal shows the link's address and tag before the user signs.
- [ ] Verify: the redeem request's destination address and tag = the link's values (redeem ticket / XRPL payment)

## Edge Cases
- Does NOT test an EVM recipient on a LayerZero route (e.g. `srcChain=flare&dstChain=ethereum&recipient=0x…`) — same field, EVM check
- Does NOT test the user replacing the address with "Use my wallet" — the hint and the link's address go with it

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Bridge page → Deep link), `docs/CHANGELOG.md`
- Code: `src/core/bridge/deeplinkRules.ts` (parsing, chain keys), `src/components/bridge/state/useBridgeDeeplink.ts` (URL sync)
