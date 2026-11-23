---
id: bridge-deeplink-url-sync
title: Bridge deep link — form changes are written back into the URL
scenario_group: bridge
tags: [dev-proposal, p3, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge deep link — form changes are written back into the URL

## Context
The form and the URL stay in sync: changes in the form go into the URL (about 0.5 s after the last
change, without a new history entry), and a URL change while on the page fills the form again. The
connected wallet's address is never written into the URL.

## Preconditions
- EVM wallet with FXRP on Flare and gas.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Navigate to `/bridge`, pick FROM Flare, TO Ethereum, type 5 as the amount.
1. Click "Change" on TO and paste another EVM address.
1. Reload the page.
1. Click "Use my wallet".
1. Click the "Bridge" link in the header.
1. Complete a small bridge (or close the confirm modal).

## Expected Results
- [ ] Step 3: the URL becomes `/bridge?srcChain=flare&dstChain=ethereum&amount=5` — no wallet address in it.
- [ ] Step 3: typing is never interrupted or overwritten while the URL updates.
- [ ] Step 4: `&recipient=0x…` (the pasted address) is added.
- [ ] Step 5: after reload the same route, amount and recipient are back (amount after the wallet reconnects); the recipient shows the "From the link…" hint.
- [ ] Step 6: `recipient` is removed from the URL.
- [ ] Step 7: the form is cleared and the URL is `/bridge`.
- [ ] Step 8: after the confirm modal closes the form and the URL parameters are cleared.

## Edge Cases
- Does NOT test the browser Back button within the page: the URL is replaced, not pushed, so Back leaves the bridge page

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Bridge page → Deep link), `docs/CHANGELOG.md`
- Code: `src/core/bridge/deeplinkRules.ts` (parsing, chain keys), `src/components/bridge/state/useBridgeDeeplink.ts` (URL sync)
