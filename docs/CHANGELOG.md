# Changelog

All notable changes to FAsset User UI are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

## [1.3.0] — 2026-04-21

### Added

- Direct minting via Core Vault — only supported minting path (agent-backed removed)
- Bridge: LayerZero OFT cross-chain transfers (Flare ↔ HyperEVM), 4 directions: `hyper_evm`, `hyper_core`, `flare`, `xrpl`
- Minting Tags system — register XRP destination tag mapped to Flare address for automated minting
- `FormAlert` component — inline type-aware alert for forms (`error`, `warning`, `info`)
- `AlertBox` component — block alert with title + children for modals
- Queue max cap enforcement in BridgeXrplForm — prevents partial redemptions
- `format.ts` — standardized amount formatting (`formatFeeAmount`, `formatInputAmount`)
- `AlertBox` added to TransferTagModal and EditExecutorModal

### Changed

- Agent-backed minting removed from UI (BTC/DOGE minting not supported)
- Redemption: `depositAuth` block scoped to entered destination address only (previously global)
- Bridge: query invalidations scoped by bridge type on LayerZero delivery

### Fixed

- `addressTag` now filtered by `mintingRecipient` — prevents incorrect tag display when address changes
- `xrplDestAddress` reset on redeem modal close and open
- iOS Safari viewport zoom prevented on input focus
- Underlying balance fetch skipped for invalid destination addresses
- Zero queue cap and whitespace destination tag handled correctly
- Redeem row columns aligned in latest transactions table
