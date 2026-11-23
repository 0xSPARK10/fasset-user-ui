---
id: bridge-guard-hyperliquid-custom-recipient
title: Bridge — To Hyperliquid with a custom recipient (active and inactive)
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge — To Hyperliquid with a custom recipient (active and inactive)

## Context
Flare / remote chain → Hyperliquid can send to another EVM address ("Custom"). The Hyperliquid composer credits that address on Hyperliquid only if it has an active Hyperliquid account; otherwise the FXRP stays on HyperEVM at that address. The page checks the recipient and blocks Bridge for an inactive one.

## Preconditions
- Connected EVM wallet with FXRP and gas on Flare (testnet: Coston2).
- Address A: another EVM address with an active Hyperliquid account (has received or traded on Hyperliquid).
- Address B: an EVM address never used on Hyperliquid (e.g. a fresh wallet).

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Pick FROM Flare, TO Hyperliquid, enter 1.
1. Click "Custom" in the TO field and paste address B.
1. Replace it with address A, click Bridge, confirm the Flare transaction, wait for "Finished".

## Expected Results
- [ ] With address B: blue alert "The destination address has no active Hyperliquid account. Activate it on Hyperliquid first, or the FXRP arrives on HyperEVM instead."; CTA blocked.
- [ ] While a half-typed address is in the field, the alert does not show and the CTA stays blocked.
- [ ] With address A: no alert; CTA enabled; one wallet transaction.
- [ ] Latest transactions: a row Flare → Hyperliquid, 1.00, "Finished".
- [ ] Verify: Flare FXRP of the connected wallet after = before − 1; Hyperliquid spot FXRP of address A after = before + 1 − composer fee.
- [ ] Removing the custom address (back to the connected wallet, active on Hyperliquid) clears the alert.

## Edge Cases
- Does NOT test the connected wallet's own address — `bridge-route-remote-to-hyperliquid`
- Does NOT test HyperEVM → Hyperliquid (no "Custom", own account only) — `bridge-guard-hyperliquid-inactive-account`
- Hyperliquid API failing — `bridge-guard-hyperliquid-inactive-account` case B
- Same check from Ethereum / BNB / Base → Hyperliquid — same code path, not repeated

## Domain References
- App (this repo): `docs/BUSINESS_RULES.md` (→ Hyperliquid custom recipient must have an active Hyperliquid account), `docs/DEV_SPEC.md` (Recipient), `docs/CHANGELOG.md`
