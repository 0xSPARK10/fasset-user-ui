---
id: bridge-ui-swap-direction
title: Bridge — Swap FROM and TO
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — Swap FROM and TO

## Context
The button between FROM and TO (↓↑ icon, label "Swap direction") switches the two chains. The
new TO starts over like a freshly picked one: a custom recipient or destination tag typed for
the old TO must not be carried over to the new direction, or the transfer would go to an
address meant for another chain.

## Preconditions
- EVM wallet with FXRP on Flare and on HyperEVM, and a little FLR / HYPE for gas.
- A second EVM address to type as a custom recipient.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`.
1. Pick FROM Flare, TO HyperEVM.
1. Enter 10.
1. Click "Change" under TO and type the second EVM address.
1. Click the "Swap direction" button.
1. Enter 10 and click "Bridge"; confirm in the wallet.
1. Repeat steps 4–7 on a mobile viewport (< 768 px) with the FROM list open before the swap.

## Expected Results
- [ ] After the swap FROM is HyperEVM and TO is Flare; the FROM line shows the HyperEVM balance.
- [ ] The amount field is empty.
- [ ] No error flashes during the swap (e.g. "Not enough native token for LayerZero cross-chain fee." for the old amount on the new source chain).
- [ ] The custom recipient is gone; TO shows the connected wallet's address with "Change".
- [ ] The URL now has HyperEVM as source and Flare as destination, without the recipient.
- [ ] The fee row shows the HyperEVM → Flare LayerZero fee (paid in HYPE).
- [ ] Mobile: the open chain list closes after the swap.
- [ ] Verify: Flare FXRP of the connected wallet = before + 10 (on-chain balance, after LayerZero delivery)
- [ ] Verify: the second EVM address received nothing (on-chain balance)

## Edge Cases
- Does NOT test the disabled button — see `bridge-ui-swap-unsupported.md`.
- Does NOT test the transfer itself in depth — see `bridge-route-remote-to-flare.md`.

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge components), `docs/CHANGELOG.md`
