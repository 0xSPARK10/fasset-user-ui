---
id: bridge-guard-hyperliquid-inactive-account
title: Bridge — To Hyperliquid with an inactive account or a failing account check
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — To Hyperliquid with an inactive account or a failing account check

## Context
Hyperliquid does not credit FXRP to an inactive account (HyperEVM → Hyperliquid: it waits in escrow; Flare / other chains / XRPL → Hyperliquid: it stays on HyperEVM), so the transfer is blocked. When the account check itself fails, the transfer is blocked too (fail closed) — otherwise an inactive account would go through.

## Preconditions
- Case A: EVM address never activated on Hyperliquid, with FXRP and HYPE on HyperEVM.
- Case B: EVM wallet with FXRP and HYPE on HyperEVM and FXRP + gas on Flare; the Hyperliquid API request fails. Trigger: block requests to the Hyperliquid API host (`api.hyperliquid-testnet.xyz` on testnet) — Playwright `page.route(…, route => route.abort())`, or DevTools → Network → Block request domain.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Case A: pick HyperEVM → Hyperliquid, enter 1.
1. Case B: block the Hyperliquid API, pick HyperEVM → Hyperliquid, enter 1, wait 5 seconds.
1. Case B: pick Flare → Hyperliquid, click "Custom", paste another valid EVM address, enter 1, wait 5 seconds.
1. Case B: unblock the API and wait up to 10 seconds (a failed check runs again every 10 s).

## Expected Results
- [ ] Case A: blue alert "Your Hyperliquid account isn’t active yet — visit Hyperliquid to activate it."; CTA blocked. After the account is activated (e.g. in another tab), the alert disappears within ~10 s without a reload.
- [ ] Case B, HyperEVM → Hyperliquid: red alert "Couldn't load your Hyperliquid account. Try again later." (with "Couldn't load FXRP from Hyperliquid. Try again later." too when the FXRP token info was not loaded before the block); CTA blocked.
- [ ] Case B, Flare → Hyperliquid with a custom address: red alert "Couldn't check the destination address on Hyperliquid. Try again later."; CTA blocked.
- [ ] Case B: before the alert shows, the CTA shows loading (the check is retried once); while the alert is shown, the CTA stays disabled without flickering to loading.
- [ ] Case B, after unblocking: the alert disappears; the CTA is enabled for an active account.

## Edge Cases
- Remote ↔ remote routes (e.g. Ethereum → HyperEVM) are not covered; on testnet Base Sepolia is peered only with Coston2
- Custom recipients with an active / inactive account — `bridge-guard-hyperliquid-custom-recipient`, `bridge-mint-and-bridge-custom-recipient`

## Domain References
- App (this repo): `docs/BUSINESS_RULES.md` (HyperEVM → Hyperliquid is blocked for an inactive Hyperliquid account; → Hyperliquid custom recipient must have an active Hyperliquid account), `docs/DEV_SPEC.md` (bridge sections), `docs/CHANGELOG.md`
