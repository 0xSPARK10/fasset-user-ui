---
id: bridge-mint-typed-recipient-wallet-tag
title: XRPL → Flare — a typed recipient keeps the FXRP when the wallet has a minting tag
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# XRPL → Flare — a typed recipient keeps the FXRP when the wallet has a minting tag

## Context
XRPL → Flare (mint) sends the recipient either as the XRPL destination tag (when the recipient is the connected EVM wallet and it has a registered minting tag) or as the payment memo (any other address). The address can be typed before the EVM wallet connects. Regression: connecting the wallet afterwards set the wallet's tag next to the typed address, so the payment carried the wallet's tag and the FXRP was minted to the wallet instead of the typed address.

## Preconditions
- XRPL wallet with at least 25 XRP, connected without an EVM wallet (a wallet other than Xaman — Xaman connects only after a Flare wallet).
- EVM wallet W with a registered minting tag (check on `/tags`; register one there if missing).
- Address A: an EVM address other than W, with no minting tag of its own.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md` (XRPL wallet only)
1. Open `/bridge?srcChain=xrpl&dstChain=flare`, type address A as the destination address, enter 10.
1. Connect EVM wallet W.
1. Click Bridge, Confirm, sign the XRP payment once, wait for the modal to finish.
1. Control: reload, connect both wallets, leave the destination address as it is (W), enter 10, Bridge, sign, wait.

## Expected Results
- [ ] Step 4: the destination address still shows address A.
- [ ] Verify: step 5 XRPL payment has no `DestinationTag` and one memo (payment reference) that contains address A (XRPL explorer).
- [ ] Verify: Coston2 FTestXRP balance of address A: after = before + 10; balance of W unchanged (Coston2 explorer, `DirectMintingExecuted.targetAddress` = A).
- [ ] Verify: step 6 XRPL payment has `DestinationTag` = W's minting tag; FTestXRP balance of W: after = before + 10.

## Edge Cases
- Does NOT test Mint & Bridge to a remote chain — `bridge-mint-and-bridge-custom-recipient`
- Does NOT test an address typed after the wallet is connected (the tag was cleared there already)

## Domain References
- App (this repo): `docs/BUSINESS_RULES.md` (addressTag must be filtered by mintingRecipient — Bridge page), `docs/CHANGELOG.md`
