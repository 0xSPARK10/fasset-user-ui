---
id: bridge-mint-and-bridge-custom-recipient
title: Mint & Bridge — XRP to FXRP on another EVM address
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
networks: [coston2]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Mint & Bridge — XRP to FXRP on another EVM address

## Context
Mint & Bridge (XRPL → a remote chain in one XRP payment) can deliver to any EVM address ("Custom"), sent to the backend as `evm_recipient`. The XRP payment pays everything, but an EVM wallet stays required: Latest transactions and the Recover notice find the transfer by it. To Hyperliquid the address must have an active Hyperliquid account. On testnet only Ethereum (Sepolia) completes.

## Preconditions
- XRPL wallet with at least 20 XRP (a wallet other than Xaman for case B — Xaman connects only after a Flare wallet).
- Case B needs an XRPL wallet connected without an EVM wallet.
- Address A: any EVM address other than the connected one.
- Address B: an EVM address never used on Hyperliquid. Address C: an EVM address active on Hyperliquid.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md` (XRPL and EVM wallets)
1. Open `/bridge`, pick FROM XRPL and TO Ethereum, click "Custom", type half of address A.
1. Complete address A, enter 10, click Bridge, Confirm, sign the XRP payment, wait for the modal to finish.
1. Pick TO Hyperliquid, "Custom" with address B, enter 10.
1. Replace it with address C.
1. Case B: disconnect the EVM wallet (XRPL wallet only), pick XRPL → Ethereum.
1. Type address A, enter 10.
1. Connect the EVM wallet again.

## Expected Results
- [ ] Step 3: no alert, "Bridge" disabled while the address is incomplete.
- [ ] Step 4: "Bridge" enabled; the modal finishes as in `bridge-mint-and-bridge-happy-path`.
- [ ] Verify: `POST /api/v3/direct_mint/request` body `evm_recipient` = address A; `destination_eid` = 40161 on testnet (30101 on mainnet).
- [ ] Verify: Sepolia FXRP balance of address A: after = before + `to_receive`; the connected EVM address unchanged.
- [ ] Step 5: blue alert "The destination address has no active Hyperliquid account. Activate it on Hyperliquid first, or the FXRP arrives on HyperEVM instead."; "Bridge" disabled.
- [ ] Step 6: the alert disappears; "Bridge" enabled (do not send on testnet — Coston2 → HyperEVM may not deliver).
- [ ] Step 7: blue alert "Connect an EVM wallet. Latest transactions and recovery of a stuck transfer need it."
- [ ] Step 8: the alert stays; "Bridge" does not start a payment, also with address A typed (fees may show).
- [ ] Step 9: the alert disappears; "Bridge" enabled.

## Edge Cases
- Does NOT test the connected EVM wallet as recipient — `bridge-mint-and-bridge-happy-path`
- A recipient from a /bridge link — `bridge-deeplink-recipient-and-tag` step 9
- Hyperliquid API failing — `bridge-guard-hyperliquid-inactive-account` case B

## Domain References
- App (this repo): `docs/BUSINESS_RULES.md` (Direct mint & bridge needs an EVM wallet; → Hyperliquid custom recipient must have an active Hyperliquid account), `docs/DEV_SPEC.md` (Recipient, Direct mint & bridge), `docs/CHANGELOG.md`
