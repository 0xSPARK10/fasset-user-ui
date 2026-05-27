# Changelog

All notable changes to FAsset User UI are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

## [1.3.13] — 2026-05-26

- `BridgeXrplForm`: amount preview now resolves underlying icon/name via `FASSET_COIN` (`@/config/coin`) instead of hardcoded `XrpIcon` / `"XRP"` — correct for both FXRP (mainnet) and FTestXRP (testnet)
- Form validation: Next button stays disabled while validation errors persist
- Home: chart responsiveness improved on mobile and tablet
- Home: TVL tab hides timeframe filter; chart Y-axis values rounded
- Home: `FAssetPositionCard` hidden when wallet is not connected
- Home: `MintRedeemChartCard` split into dedicated `HomeChartCard/` folder
- Home: clearstar provider icon added; chart label format fixed
- Post-review fixes across homepage redesign (overview, limits, chart, mint modal)
- v1.3 API patches integrated (mint trim, limits, tvlGraph, monarq)
- Migration docs adopt date-prefixed naming convention
- Stale `MIGRATION_v1.3.md` references removed
- `DEV_SPEC.md`: documented Coin Catalog Constants (`COINS`, `BRIDGE_COINS`, `FASSET_COIN`, `HYPE`) and the `FASSET_COIN` caveat

## [1.3.12] — 2026-05-18

- Homepage redesign — simplified card grid, removed CollateralPoolsCard / CoreVaultCard / EcoSystemInformationCard / MyPoolsPositionCard
- `LimitCard` added — hourly/daily mint limits (mocked, BE endpoint pending)
- `Header` extracted into its own component — top bar + mobile drawer, nav links unified through a single array (bridge link added conditionally)
- `Footer` extracted into its own component
- Footer translations moved from `layout.footer` to top-level `footer`; unused keys removed (`documentation_label`, `become_an_fasset_agent_label`, `copyright_label`, `header.quest_label`)
- `ILimitsData` and `ILimitWindow` types added
- Cards no longer receive `timeData` / `activeFilter` props (MintRedeemChartCard, FassetsOverviewCard, ProofOfReservesCard)

## [1.3.11] — 2026-05-13

- Decimal separator: accept both `.` and `,` on amount inputs
- iOS: decimal keyboard shown on amount inputs
- Balances refreshed when a tracked tx finishes
- Bridge: improved data freshness, prevent double-submit

## [1.3.10] — 2026-05-12

- Empty Hype balance no longer throws

## [1.3.9] — 2026-05-07

- Mint: wallet card and auto-submit guard use fAssetCoin wallet
- Mint: Ledger card condition at payment step uses fAssetCoin wallet

## [1.3.8] — 2026-05-06

- `ConfirmStepper` migrated to `useModalGuard`
- Modals migrated to `useModalGuard run(fn(assertOpen))` API
- CI: GitLab caching and pipeline optimizations

## [1.3.7] — 2026-04-30

- Modal async guards and close-session handling unified
- Modal flow preserved on close; stale tx state cleared on reopen
- `Badge` component extracted (5 variants: trend, status, label, info, count) — migrated across cards, tables, and combobox

## [1.3.6] — 2026-04-29

- Tag autocomplete with saved tag suggestions
- Tag combobox and address warnings improved

## [1.3.5] — 2026-04-28

- `isPartialRedeemCardActive` removed
- `.env.example` updated with correct `MINTING_TAG_MANAGER_ADDRESS`

## [1.3.4] — 2026-04-24

- Latest transactions poll interval reduced 90s → 45s
- Network `brandName` property added for dynamic display
- Tags refetch interval moved from query to component effect
- Mint: max button disabled when amount is zero, fees formatted, concurrent validation prevented
- Tags: API calls prevented when wallet not connected
- `ethers` coalesce error handled after successful tx
- Docs: redemption tag spec; interval constants fix; PRODUCT_OWNER renumbering
- `.env.example` updated for `NEXT_PUBLIC_APP_ENV`

## [1.3.3] — 2026-04-23

- New fAssets explorer URL (without `type` param)

## [1.3.2] — 2026-04-22

- CI: `.gitlab-ci.yml` runs only on MR
- Mint: user progress query invalidated after minting completes
- Mint: fAssetCoin wallet used to show wallet connect notification

## [1.3.1] — 2026-04-21

- Minting cap enforced on form and max amount

## [1.3.0] — 2026-04-21

- Direct minting via Core Vault — only supported minting path (agent-backed removed)
- Bridge: LayerZero OFT cross-chain transfers (Flare ↔ HyperEVM), 4 directions: `hyper_evm`, `hyper_core`, `flare`, `xrpl`
- Minting Tags system — register XRP destination tag mapped to Flare address for automated minting
- `FormAlert` component — inline type-aware alert for forms (`error`, `warning`, `info`)
- `AlertBox` component — block alert with title + children for modals
- Queue max cap enforcement in BridgeXrplForm — prevents partial redemptions
- `format.ts` — standardized amount formatting (`formatFeeAmount`, `formatInputAmount`)
- `AlertBox` added to TransferTagModal and EditExecutorModal
- Redemption: `depositAuth` block scoped to entered destination address only (previously global)
- Bridge: query invalidations scoped by bridge type on LayerZero delivery
- `addressTag` filtered by `mintingRecipient` — prevents incorrect tag display when address changes
- `xrplDestAddress` reset on redeem modal close and open
- iOS Safari viewport zoom prevented on input focus
- Underlying balance fetch skipped for invalid destination addresses
- Zero queue cap and whitespace destination tag handled correctly
- Redeem row columns aligned in latest transactions table
