---
id: bridge-route-hyperliquid-to-hyperevm-unified
title: Bridge route — Hyperliquid → HyperEVM from a Unified account
scenario_group: bridge
tags: [dev-proposal, p1, trigger-ui]
# Dev proposal from the FAsset User UI repo (docs/qa-scenarios/) — wallets, domain,
# requires and verifies are left for QA; the values to verify are the "Verify:" items
# under Expected Results.
---

# Bridge route — Hyperliquid → HyperEVM from a Unified account

## Context
Hyperliquid recommends the "Unified Account" mode. Hyperliquid rejects the `spotSend` action for such accounts ("Action disabled when unified account is active"), so Hyperliquid → HyperEVM failed after signing and the FXRP could not leave Hyperliquid. The app now sends `sendAsset`, which works in every account mode. Regression: the error after signing, or a message asking to switch the account mode off.

## Preconditions
- EVM address active on Hyperliquid, with FXRP and a little HYPE on Hyperliquid spot.
- On Hyperliquid (testnet: the testnet Hyperliquid app) open Portfolio → Account Type, pick "Unified Account" and confirm with the same wallet.
- The account mode can be read without the UI: Hyperliquid `POST /info` `{"type":"userAbstraction","user":"<address>"}` answers `"unifiedAccount"`.

## Steps
1. Navigate to the base URL
1. Connect wallet using steps from `connect-wallet.md`
1. Open `/bridge`, pick FROM Hyperliquid, TO HyperEVM, enter 1.
1. Click Bridge and sign the transfer.
1. On Hyperliquid switch the account type to "Manual", then repeat steps 3–4.

## Expected Results
- [ ] Step 4: the transfer finishes ("Finished"); no error after signing and no message about Unified account mode.
- [ ] Step 4: the transfer shows in Latest transactions.
- [ ] Step 5: the same result in Manual mode.
- [ ] Verify: Hyperliquid spot FXRP after = before − 1 and HyperEVM FXRP after = before + 1 (Hyperliquid `spotClearinghouseState`, FXRP `balanceOf` on HyperEVM), for each run.
- [ ] Verify: the Hyperliquid ledger entry of the transfer is a `send` with `sourceDex` and `destinationDex` `spot` to the FXRP system address (Hyperliquid `userNonFundingLedgerUpdates`).

## Edge Cases
- Does NOT test HyperEVM → Hyperliquid — `bridge-route-hyperevm-hyperliquid`
- Ledger signing of the same transfer — `bridge-route-hyperevm-hyperliquid` (Preconditions)
- "Portfolio Margin" mode not covered

## Domain References
- App (this repo): `docs/DEV_SPEC.md` (Hyperliquid → HyperEVM row), `docs/CHANGELOG.md`
