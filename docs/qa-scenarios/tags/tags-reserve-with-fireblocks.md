---
id: tags-reserve-with-fireblocks
title: My Tags — Reserve a Minting Tag with Fireblocks as the only wallet
scenario_group: tags
tags: [dev-proposal, p2, trigger-ui]
networks: [flare]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# My Tags — Reserve a Minting Tag with Fireblocks as the only wallet

## Context
On Flare, connecting Fireblocks also connects the Flare side: the vault's FLR address becomes the user's Flare address, and every Flare action is sent to Fireblocks as a contract call that a person approves in the Fireblocks mobile app. Reserving a tag is the first Flare action of the Fireblocks direct-mint flow, and the only one that pays a fee (msg.value in FLR) and reads an event from the receipt (`MintingTagReserved`).

## Preconditions
- Flare mainnet. Fireblocks has no Coston2 asset, so on testnet Fireblocks stays XRPL-only and this flow does not apply.
- A Fireblocks workspace with an Editor API user, a vault holding `FLR` (reservation fee + gas) and `XRP`, and a **Contract call** policy rule for that API user and vault whose signer is a person with the Fireblocks mobile app.
- No other wallet connected in the browser.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`, choosing Fireblocks (API key ID, private key file, vault).
1. Open My Tags and click "Reserve Tag", then "Next".
1. Approve the transaction in the Fireblocks mobile app.
1. Reserve again and reject the transaction in the Fireblocks mobile app.

## Expected Results
- [ ] Step 2: the header shows the vault's Flare address (the Fireblocks icon on narrow screens); the app does not ask to connect a Flare wallet first.
- [ ] Step 3: the modal shows "Please confirm in your wallet app" and waits while the approval is pending (it can take minutes).
- [ ] Step 4: "Tag #N reserved successfully!" and the tag is listed on My Tags.
- [ ] Step 5: the modal shows an error; no second transaction appears in the Fireblocks Console.
- [ ] Verify: vault FLR after = before − reservation fee − gas (Flare explorer, the vault's address).
- [ ] Verify: the tag's owner is the vault's Flare address (`MintingTagManager`, `MintingTagReserved` event of the tx).

## Edge Cases
- Does NOT test the direct mint with the reserved tag (XRPL side of Fireblocks).
- Policy rule with "Initiator" as signer → Fireblocks fails the transaction with `SIGNER_NOT_FOUND` and the modal shows an error.
- A Flare wallet connected before Fireblocks stays the Flare wallet; Fireblocks then connects only XRPL.
- Bridge from Flare to another chain is signed by Fireblocks; bridge from HyperEVM, Ethereum … is not supported with Fireblocks.

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Fireblocks Specifics), `docs/BUSINESS_RULES.md` (Fireblocks), `docs/CHANGELOG.md`
