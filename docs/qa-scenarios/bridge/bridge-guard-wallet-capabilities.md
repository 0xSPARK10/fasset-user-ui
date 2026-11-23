---
id: bridge-guard-wallet-capabilities
title: Bridge guard — Routes the connected wallet cannot sign are disabled with a reason
scenario_group: bridge
tags: [dev-proposal, p2, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge guard — Routes the connected wallet cannot sign are disabled with a reason

## Context
Not every wallet can sign every route. Fireblocks pays XRP with a destination tag but no memo (so no Mint & Bridge) and signs EVM only on Flare / Songbird mainnet; Xaman signs only XRPL. The bridge page turns such routes off in the FROM / TO list and explains why, instead of failing after Bridge is clicked. Regression: a blocked route can be picked and fails only at signing, or a route the wallet can sign is shown disabled.

## Preconditions
- Testnet: an EVM wallet (MetaMask) for Coston2 and Fireblocks for XRPL (see `connect-wallet.md`; Fireblocks has no Coston2 asset, so its Flare side is not used on testnet).
- For step 6: a link `/bridge?srcChain=xrpl&dstChain=hyperliquid&amount=10` (`hyperliquid` = HyperEVM in links).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md` — MetaMask first, then Fireblocks for XRPL.
1. Open `/bridge`, pick FROM XRPL.
1. Hover (or tap) the HyperEVM row in the TO list.
1. Pick TO Flare.
1. Open the link from Preconditions.
1. Disconnect Fireblocks, connect an XRPL wallet that supports memos (Xaman or WalletConnect), repeat steps 3–4.

## Expected Results
- [ ] Step 3: the XRPL row in FROM stays enabled (XRPL → Flare works with Fireblocks).
- [ ] Step 4: the HyperEVM row (and every other Mint & Bridge destination) is disabled; the tooltip reads "Fireblocks can't add a memo to XRP payments, so this route isn't available. Mint to Flare first, then bridge."
- [ ] Step 5: XRPL → Flare is selectable and the mint form works as before.
- [ ] Step 6: the form shows the same text as an error and Bridge stays disabled.
- [ ] Step 7: the Mint & Bridge rows are enabled again.
- [ ] Before any wallet is connected, no row is disabled for a wallet reason.

## Edge Cases
- Mainnet with Fireblocks as the Flare wallet: FROM HyperEVM / Ethereum / BSC … and FROM Hyperliquid are disabled with "Fireblocks can't sign on <chain>. Connect another wallet to bridge from <chain>."; FROM Flare stays enabled.
- The swap button shows the same reason when the reverse route is blocked for the wallet.
- Does NOT test system pauses or route availability — `bridge-guard-system-pause`.

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Wallet capabilities), `docs/CHANGELOG.md`
