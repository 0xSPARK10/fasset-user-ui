---
id: bridge-ui-swap-unsupported
title: Bridge — Swap Off Where the Reverse Direction Is Not Supported
scenario_group: bridge
tags: [dev-proposal, p3, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — Swap Off Where the Reverse Direction Is Not Supported

## Context
Hyperliquid can only send to HyperEVM, so Flare / Ethereum / BNB Chain / Base / Katana / Monad /
XRPL → Hyperliquid cannot be reversed. The swap button is then off and explains why on hover.
It is also off until both chains are picked and while the bridge is paused.

## Preconditions
- EVM wallet connected (no balance needed — nothing is sent).
- For the pause step: a paused system (see `bridge-guard-system-pause.md` for the trigger).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`.
1. Pick only FROM Flare; hover and click the "Swap direction" button.
1. Pick TO Hyperliquid; hover and click the button.
1. Pick FROM HyperEVM (TO stays Hyperliquid); click the button.
1. With the system paused, pick a route chosen before the pause and click the button.

## Expected Results
- [ ] Only FROM picked: the button is greyed out, has no tooltip and does nothing.
- [ ] Flare → Hyperliquid: the button is greyed out; hovering shows "Bridging from Hyperliquid to Flare isn't supported"; clicking keeps Flare → Hyperliquid.
- [ ] HyperEVM → Hyperliquid: the button is active (grey, black on hover) and the swap gives Hyperliquid → HyperEVM.
- [ ] Paused: the button is greyed out and does nothing.
- [ ] Keyboard: the greyed-out button can get focus (the tooltip shows) but Enter does nothing.
- [ ] Mobile (< 768 px), Flare → Hyperliquid: tapping the button shows the same tooltip.

## Edge Cases
- Does NOT test a successful swap with recipient reset — see `bridge-ui-swap-direction.md`.
- Ethereum → XRPL cannot be swapped on an environment without Mint & Bridge (XRPL → Ethereum is then no route); not covered.

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (bridge components), `docs/CHANGELOG.md`
