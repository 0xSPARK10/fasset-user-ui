---
doc_version: "1.58"
app_version: "v1.5"
last_updated: "2026-11-23"
---

# FAsset User UI — Developer Specification

> Single source of truth for developers and AI tools implementing features.
> Covers: domain concepts, data types, flows, APIs, fees, wallets, code patterns.
> For product/roadmap context see `docs/PRODUCT_OWNER.md`.

---

## 1. Protocol Overview

FAsset wraps assets from non-smart-contract chains (XRP, BTC, DOGE) into ERC-20 tokens on Flare/Songbird. The tokens are collateral-backed and minted via the Core Vault (direct minting) and redeemed via agents.

| Term | Meaning |
|------|---------|
| **Underlying asset** | Real asset on its native chain (XRP, BTC, DOGE) |
| **FAsset** | ERC-20 representation on Flare/Songbird (FXRP, FBTC, FDOGE) |
| **Agent** | Entity holding collateral, facilitates minting/redemption |
| **Core Vault** | System-level vault for direct minting (no agent selection needed) |
| **AssetManager** | Main on-chain contract governing the system |
| **CPT** | Collateral Pool Token — user's share in a collateral pool |
| **UBA** | Underlying Base Amount — integer in 6-decimal precision |
| **BIPS** | Basis points: 1 BIPS = 0.01%, `feeBIPS / 10000` = decimal multiplier |

---

## 2. Assets & Coins

### CoinEnum

| Enum | Description |
|------|-------------|
| `FXRP` / `FTestXRP` | FAsset XRP mainnet/testnet |
| `FBTC` / `FTestBTC` | FAsset BTC mainnet/testnet |
| `FDoge` / `FTestDOGE` | FAsset DOGE mainnet/testnet |
| `FLR` / `SGB` | Flare/Songbird native mainnet tokens |
| `C2FLR` / `CFLR` | Coston2/Coston testnet native tokens |
| `WFLR` / `WSGB` / `WCFLR` / `WC2FLR` | Wrapped native tokens (18 decimals on-chain) |
| `HYPE` | HyperEVM native token (bridge gas fees) |
| `TestUSDC` / `TestUSDT` / `USDT0` / `USDX` | Stablecoin collateral tokens |
| `TestETH` | Test ETH collateral |

### ICoin (key fields)

| Field | Meaning |
|-------|---------|
| `type` | `CoinEnum` — canonical ID, used as `fAsset` string in API calls |
| `isFAssetCoin` | `true` for FXRP/FBTC/FDOGE — these are mintable/redeemable |
| `isMainToken` | `true` for active native gas token (FLR/SGB/C2FLR/CFLR) |
| `lotSize` | Underlying tokens per 1 lot |
| `minWalletBalance` | Reserve that must stay in wallet (e.g. 3 XRP, 0.001 BTC) — never minted |
| `decimals` | UI display precision |
| `contractDecimals` | On-chain decimals for `parseUnits()` — FAssets = 6, wrapped native = 18 |
| `nativeName` | Underlying chain token name (e.g. `"XRP"` for FXRP) |
| `network` | `INetwork` for wallet connectivity — for FXRP this is XRPL, not Flare |
| `address` | Populated at runtime when wallet is connected |
| `connectedWallet` | Which wallet type is connected (string from `WALLET` constants) |
| `xpub` | Ledger + BTC/DOGE: AES-encrypted extended public key |
| `bipPath` | BIP44 derivation path string for Ledger |
| `accountAddresses` | BTC/DOGE WalletConnect: `{ receiveAddresses, changeAddresses }` |
| `enabled` | Computed from env vars at startup |

### IFAssetCoin

`type IFAssetCoin = INativeBalance & ICoin`

`INativeBalance` adds: `symbol`, `balance` (display units), `wrapped?`, `valueUSD?`, `lots?`

### Lot Sizes

| Coin | Lot Size |
|------|----------|
| FXRP (mainnet) | 10 XRP |
| FTestXRP (C2FLR) | 10 XRP |
| FTestXRP (CFLR) | 20 XRP |
| FBTC | 0.05 BTC |
| FTestBTC | 0.001 BTC |
| FDOGE | 200 DOGE |
| FTestDOGE | 100 DOGE |

### Lots System

UI input is in direct amounts (XRP, BTC, DOGE) — not lots. Lots appear in:
- Backend API responses (`maxLots`, `maxLotsOneRedemption`, `freeLots`)
- Pool capacity metrics (`mintedAssets`, `remainingAssets`)
- Contract calls (`redeem` takes `lots` integer)

```ts
toLots(value, lotSize)   = Math.floor(value / lotSize + Number.EPSILON)
fromLots(lots, lotSize)  = lots * lotSize
```

`IMaxLots`: `{ maxLots: string, lotsLimited: boolean }`

### Amount Precision

- Display: `coin.decimals`
- Contract calls: always `parseUnits(value, 6)` — 6 decimals
- UBA: integer in 6-decimal units

### Coin Catalog Constants (`@/config/coin`)

| Constant | Definition | Use |
|----------|------------|-----|
| `COINS` | All `ICoin` entries (mainnet + testnet, FAssets + collaterals + wrapped) | Lookup by `type` / `enabled` / `network` |
| `BRIDGE_COINS` | `[FTEST_XRP_HYPE, FXRP_HYPE]` — HyperEVM variants of FAssets | Bridge UI source token (lives on HyperEVM, `nativeIcon = HypeIcon`) |
| `FASSET_COIN` | `COINS.find(c => c.enabled && c.isFAssetCoin)!` — first enabled FAsset | Canonical underlying coin for the current network (FXRP mainnet, FTestXRP testnet) |
| `HYPE` / `BRIDGE_HYPE` | HyperEVM gas token (mainnet/testnet) | Bridge fee labels |

**`FASSET_COIN` caveat:** returns the FIRST enabled `isFAssetCoin` from `COINS` (array order: XRP variant comes before BTC/DOGE). Safe today because only one FAsset is enabled per deployment. If multiple FAssets are ever enabled simultaneously, use `COINS.find(c => c.enabled && c.type === token.type)` instead — `FASSET_COIN` would silently return the wrong coin (e.g. FXRP for an FBTC context).

Used in: `ReserveMintingTagModal`, `EditExecutorModal`, `pages/tags.tsx`, the bridge page (`config/bridgeRoutes.tsx`).

---

## 3. Networks

### Namespace System

| Constant | Value | Used for |
|----------|-------|---------|
| `ETH_NAMESPACE` | `"eip155"` | Flare, Songbird, Coston, HyperEVM |
| `XRP_NAMESPACE` | `"xrpl"` | XRP Ledger |
| `BTC_NAMESPACE` | `"bip122"` | Bitcoin, Dogecoin |

WalletConnect request format: `` chainId: `${namespace}:${chainId}` ``

### INetwork Key Fields

| Field | Meaning |
|-------|---------|
| `namespace` | One of the three namespace constants |
| `isMandatory` | Must be connected (applies to Flare/Songbird/Coston EVM) |
| `ledgerApp` | Ledger app string to validate (e.g. `"Flare Network"`, `"XRP"`) |
| `mainnet` | `true` for production networks |

### Network Table

| Network | Chain ID | mainnet | Role |
|---------|----------|---------|------|
| Flare | 14 | true | Primary FAsset EVM |
| Songbird | 19 | true | Secondary FAsset EVM |
| Coston2 | 114 | false | Primary testnet |
| Coston | 16 | false | Secondary testnet |
| HyperEVM | 999 | true | Bridge destination |
| HyperEVM Testnet | 998 | false | Bridge testnet |
| XRPL | 0 | true | XRP underlying |
| XRPL Testnet | 1 | false | Test XRP |
| Bitcoin | genesis hash | true | BTC underlying |
| Dogecoin | genesis hash | true | DOGE underlying |

---

## 4. Wallets & Connectors

### Supported Wallets (`WALLET` constant)

| ID | Description | Chains |
|----|-------------|--------|
| `WalletConnect` | WalletConnect v2 | EVM + XRPL + BTC/DOGE |
| `MetaMask` | Browser extension | EVM only |
| `Ledger` | Hardware wallet | EVM + XRPL + BTC/DOGE |
| `Xaman` | XRPL mobile wallet | XRPL only |
| `Fireblocks` | User's own Fireblocks workspace via the REST API (API key + RSA key in the browser) | XRPL; Flare/Songbird where Fireblocks has the asset (`FLR`, `SGB` — not Coston/Coston2) |

Enabled wallets controlled by `ENABLED_WALLETS` env var.

### Connector Interface

```ts
connect(...)
disconnect()
getSigner(token?)
request({ chainId, method, params })
```

### mainToken vs bridgeToken

- **`mainToken`**: Active native EVM token (`isMainToken: true`). Used for Flare-side contracts.
- **`bridgeToken`**: Only when bridge enabled (C2FLR/FLR). Represents OFT context on HyperEVM. `getSigner(bridgeToken)` selects HyperEVM provider.
- **`isBridgeEnabled`**: `true` only when `mainToken.type` is `C2FLR` or `FLR`.

### fAssetCoin vs connectedCoin

Two distinct coin representations appear throughout the codebase:

**`fAssetCoin: IFAssetCoin`**
- Type: `IFAssetCoin = INativeBalance & ICoin` — adds balance, lots, valueUSD to ICoin
- Source: built from `COINS` config + optional wallet data; passed as **props** to modals/forms
- `address` is **optional** — `undefined` if user hasn't connected a wallet for this fasset
- Used for: UI display, balance queries, passing fasset context into components

**`connectedCoin: ICoin`**
- Source: runtime lookup from Zustand store — `connectedCoins.find(coin => coin.type == fAssetCoin?.type)`
- Only exists for coins the user has actively connected a wallet to
- `address` is **always populated** when found
- Also carries: `connectedWallet`, `xpub` (Ledger), `accountAddresses` (BTC/DOGE WalletConnect)
- Used for: wallet signing, provider selection, cache invalidation with user's underlying address

**Pattern in modals:**
```ts
const connectedCoin = connectedCoins.find(coin => coin.type == fAssetCoin?.type);
// fAssetCoin → metadata + optional address (from props)
// connectedCoin → guaranteed wallet address + signing context
```

### Provider Selection

`getProvider(address)` in `useContracts.ts` → looks up connected coin → returns matching connector.

### Ledger Specifics

- Validates correct app is open before signing
- BTC/DOGE: xpub stored AES-encrypted, decrypted at use time with `XPUB_SECRET`
- BIP44 paths:

| Chain | Mainnet | Testnet |
|-------|---------|---------|
| BTC | `m/44'/0'/0'/0/0` | `m/44'/1'/0'/0/0` |
| DOGE | `m/44'/3'/0'/0/0` | `m/44'/1'/0'/0/0` |
| XRP | `m/44'/144'/0'/0/0` | `m/44'/144'/0'/0/0` |
| ETH/Flare | `m/44'/60'/0'/0/0` | `m/44'/60'/0'/0/0` |

### Xaman Specifics

- Tiered service fee: 0.1% for $50k–$100k USD, 0.07% above $100k
- Checked in `MintForm.checkXamanBalance()` / `evaluateMint` (`xaman_insufficient`) — deducted from available balance before validation
- **Max leaves room for it:** `XamanFee.maxSpendable(availableXrp, price)` (`core/mint/xamanFee.ts`) = largest payment that still fits with Xaman's fee, tried per tier (the rate drops above $100k, so one formula does not fit). Used by `useMintQuote` (bridge page) and `MintForm` (`/mint`); with Xaman, Max stays empty until the FAsset price has loaded
- Mobile: deep link opens app; shows manual "Confirm" button in UI

### Wallet capabilities (bridge routes)

- `core/wallet/walletCapabilities.ts`: what each wallet can sign — `evmChains` (`all` / `main` / `none`), `typedData` (EIP-712), `xrpl`, `xrplMemo`. The table is `satisfies Record<WalletId, …>` (`WALLET` is `as const`), so a new wallet without a row fails `tsc`. Fireblocks gets `evmChains: "main"` only where `getEvmAssetId(mainToken.type)` exists (Flare, Songbird), else `none`.
- `core/bridge/routeRequirements.ts`: `getRouteRequirements(route)` (where the user signs — `xrpl` or an EVM chain — plus `typedData` / `xrplMemo`, exhaustive over `BRIDGE_ROUTE_ACTION`) and `getRouteBlockReason(requirements, capabilities)` (`no_xrpl` / `evm_chain` / `typed_data` / `xrpl_memo`).
- `useRouteWalletBlock` checks the wallet connected for the signing side (XRPL wallet for XRPL routes, the EVM wallet otherwise) and returns the translated reason (`bridge_page.wallet_block.*`). Used by the FROM / TO rows (disabled + tooltip; a FROM row is off only when none of its routes work), the swap button, and the route quote (alert + blocked CTA, which also covers deeplinks). Nothing is blocked before a wallet connects.

### Fireblocks Specifics

- `connectors/FireblocksConnector.ts`; pure rules in `core/fireblocks/`. Every API JWT is signed in the browser with the user's non-extractable key; requests go through the pass-through relay `/fireblocks-proxy/…` → `pages/api/fireblocks/[...path].ts` (Fireblocks has no CORS). The relay forwards only the paths in its `ALLOWED_ROUTES` and answers 404 when Fireblocks is not in `ENABLED_WALLETS` (`isWalletEnabled` in `config/enabledWallets.ts`, kept apart from `connectors.ts` so server code can use it).
- **XRPL:** direct mint with a tag only — a `TRANSFER` to a whitelisted `EXTERNAL_WALLET` (core vault + tag), polled until `COMPLETED`.
- **Flare (EVM):** the connect modal's vault step lists the networks — XRPL (required) and, where Fireblocks has the asset and no other wallet holds the Flare side, Flare (ticked by default). With Flare ticked, connect also reads the vault's address for `getEvmAssetId(mainToken.type)` (creates the vault wallet if missing; any failure leaves Fireblocks XRPL-only) and connects the main token with `connectedWallet: Fireblocks` — unless another wallet already holds the Flare side. `getSigner()` returns a `VoidSigner` whose `sendTransaction` runs `populateTransaction` (estimateGas, so reverts fail before Fireblocks), creates a `CONTRACT_CALL` (contract as `ONE_TIME_ADDRESS`, `amount` = msg.value in FLR, `feeLevel: MEDIUM` + estimated `gasLimit` × 1.2, since approval can come hours later), polls until `COMPLETED` (a failed broadcast or revert ends as `FAILED`; polling stops after 2 h 15 min or on a revoked key), then returns `provider.getTransaction(hash)` from the Flare RPC so `tx.wait()` and receipt logs work as with any wallet.
- Not supported: other chains (`getSigner(token)` for HyperEVM, Ethereum … throws `fireblocks.unsupported_chain`), EIP-712 / personal_sign, plain FLR transfers. On testnet Fireblocks has no Coston2 asset, so Fireblocks stays XRPL-only there and the "connect Flare first" gate applies.

### Redirect after connecting

Protected pages (`/mint`) send a disconnected user to `/connect?redirect=<path>`
(`RouteGuard`). `/bridge` is not protected — it works without a wallet and its CTA connects. After a wallet connects, **every** wallet (incl. Ledger's multi-network flow
in `SelectNetworkModal`) redirects only when the current page is `/connect`; anywhere else
the user stays on the page. The target is `getRedirectPath(router.query)` (`utils/url.ts`):
`?redirect=` when it is a same-site path, otherwise `/mint`. It rejects arrays, absolute URLs,
`//host`, `/\host` and control characters (`/%09/host` becomes `//host` in the URL parser) —
never push `router.query.redirect` directly (open redirect).

---

## 5. Minting Flow

> Only direct minting (Core Vault) is supported. Agent-backed minting is removed from the UI.

### Steps

1. `MintForm`: user enters amount (XRP), selects destination (address or tag)
2. Fetch `IDirectMintingInfo` from `GET /directMintingInfo/:fasset`
3. Validate: amount, balance, fees, address format
4. If `mintFeePercent > 2%` → show `HighMintingFeeModal`
5. `ConfirmStepper`: calculate payment amount in UBA, encode memo
6. User signs XRP payment in wallet
7. `POST /mint` — notify backend
8. Poll `GET /mint/:txHash` every 10s until `status: true`

### IDirectMintingInfo

```ts
{
  paymentAddress: string,         // Core Vault XRP address
  minMintingAmount?: string,
  mintingFeeBIPS: string,         // e.g. "500" = 5%
  minimumMintingFeeUBA: string,   // minimum system fee in UBA
  executorAddress: string,
  executorFee: string,            // executor fee in NAT (wei)
  fassetsExecutorFee: string,     // executor fee in UBA
}
```

### Fee Calculation

```
feeRate = mintingFeeBIPS / 10000
percentageFee = (transfer + executorFee) × feeRate / (1 − feeRate)
mintingFee = max(percentageFee, minimumMintingFeeUBA)
totalFees = mintingFee + executorFee
totalSend = transfer + mintingFee + executorFee
mintFeePercent = (mintingFee / transfer) × 100
```

Warning shown if `mintFeePercent > 2` (constant `MINTING_FEE_LIMIT = 2`).

### Max Mintable Amount

```
availableToSpend = rawBalance − minWalletBalance − executorFee
mintingFeeThreshold = minimumMintingFeeUBA / feeRate

effectiveMax:
  availableToSpend ≤ 0                      → 0
  avail ≤ threshold + minimumMintingFeeUBA  → max(avail − minimumMintingFeeUBA, 0)
  else                                       → avail / (1 + feeRate)
```

### Payment Amount (UBA precision)

```ts
mintAmountUba = round(amount × 10^6)
percentageFee = round((mintAmountUba + executorFee) × feeBIPS / (10000 − feeBIPS))
mintingFee = max(percentageFee, minimumFee)
paymentAmount = (mintAmountUba + mintingFee + executorFee).toString()
```

### Memo Encoding

**Address mode:**
```
PREFIX = "4642505266410018"  // DIRECT_MINTING type
memo = 0x + PREFIX + "0000000000000000" + address.toLowerCase().replace("0x","")
// 64 hex chars total (32 bytes)
```

**Tag mode:** hardcoded workaround `"0x4642505266410001...01A3E9AE"` — waiting for FDC verifier fix.

### Tag vs Memo priority (ConfirmStepper)

Per spec: tag is the **recommended** approach when user has a registered tag.

Priority logic in `ConfirmStepper.tsx`:
1. **Tag mode** (user manually entered a tag) → send `DestinationTag`, no memo
2. **Address mode + `addressTag` present** (auto-populated from user's address) → send `DestinationTag`, no memo
3. **Address mode + no `addressTag`** → send memo (Option B fallback)

`addressTag` is fetched via `useUserTags` and auto-set in `MintForm` — it's the first registered tag for the destination address. Even if user never clicks "Edit", the tag is used if present.

### XRP Transaction Structure

```ts
{
  TransactionType: 'Payment',
  Account: userAddress,
  Amount: paymentAmount,        // drops string
  Destination: paymentAddress,  // Core Vault XRP address
  // Option A (preferred): user has a registered tag
  ...(destinationTag ? { DestinationTag: Number(destinationTag) } : {}),
  // Option B (fallback): no tag → encode recipient address in memo
  ...(memo ? { Memos: [{ Memo: { MemoData: memo.substring(2) } }] } : {}),
  ...(lastUnderlyingBlock ? { LastLedgerSequence: Number(lastUnderlyingBlock) } : {}),
}
```

### Wallet Signing

| Wallet | Behavior |
|--------|---------|
| MetaMask / WalletConnect desktop | Auto-submits on component mount |
| Xaman desktop | Auto-submits via deep link |
| Xaman mobile | Manual "Confirm" button |
| Ledger | Manual "Confirm"; validates app; signs |

### TX Hash Extraction

```ts
txId = (namespace === XRP_NAMESPACE)
  ? response.tx_json.hash
  : response.txid
```

### IMintStatus

```ts
{ status: boolean, step: number, delayed?: boolean, delayTimestamp?: number }
```

Polling interval: 10 seconds. On `status: true` → show success, close modal.

### Rate Limiting (backend enforced)

| Limit | Parameter | Effect |
|-------|-----------|--------|
| Hourly | `directMintingHourlyLimitUBA` | Delays, not rejects |
| Daily | `directMintingDailyLimitUBA` | Delays, not rejects |
| Large minting | `directMintingLargeMintingThresholdUBA` | Delayed by `directMintingLargeMintingDelaySeconds` |

When delayed: `delayed: true`, backend retries after `delayTimestamp`.

### Wallet IDs (requestMinting payload)

`0`=unknown, `1`=MetaMask, `2`=WalletConnect, `3`=Ledger, `4`=Xaman

---

## 6. Redemption Flow

### Steps

1. User enters amount (converted from `maxLots × lotSize` limit), provides underlying address
2. `AssetManager.redeem(lots, underlyingAddress, executorAddress)` — pays `executorFee` as `msg.value`
3. Agent sends underlying to user's address
4. Poll `GET /redemptionStatus/:fasset/:txHash` every 15s
5. On agent default → `POST /requestRedemptionDefault/...`

### IRedemptionStatus

```ts
{
  status: string,       // "SUCCESS", "PENDING"
  incomplete: boolean,
  incompleteData: { redeemer: string, remainingLots: string } | null
}
```

### IRedemptionDefaultStatus

```ts
{
  underlyingPaid: number,
  vaultCollateralPaid: { token: string, value: string }[],
  poolCollateralPaid: number,
  vaultCollateral: string,
  fasset: string,
}
```

### IRedemptionFee (from `GET /redemptionFee/:fasset`)

```ts
{
  redemptionFee: string,            // percentage
  maxLotsOneRedemption: number,     // max lots per single tx
  maxRedemptionLots: number,        // system-wide max
}
```

### IRedemptionQueue (from `GET /redemptionQueue/:fasset`)

```ts
{
  maxLotsOneRedemption: number,        // max lots per single tx (avoid partial redemption)
  maxLots: number,                     // max redeemable without failing — use for UI limits
  maxAmountOneRedemptionDrops: string, // same limit in drops
  maxAmountOneRedemptionXRP: string,   // same limit in XRP
  maxAmountDrops: string,              // system-wide max in drops
  maxAmountXRP: string,                // system-wide max in XRP — use for UI limits
}
```

**Redeem max = `maxAmountXRP`** (Max, clamp, "N redeemable", the `above_total` warning). A request
above `maxAmountOneRedemptionXRP` is not blocked: it is partially redeemed
(`RedemptionAmountIncomplete`) and the rest stays in the user's wallet — decided with Jurij,
April 2026. **Bridge → XRPL max = `min(maxAmountXRP, maxAmountOneRedemptionXRP)`**
(`RedemptionMapper.singleRequestMax`): the composer moves the whole amount to the redeemer account
first, so a partial rest would stay there (Asset Recovery) — confirmed with Jurij, 2026-11-02.

### XRPL Destination Checks

Before submitting redemption:
- `depositAuth: true` → blocked, cannot receive payment
- `requireDestTag: true` → user must provide destination tag

`depositAuth` check is scoped to the user-entered destination address, not global. The check runs dynamically when the user changes the destination address field.

---

## 7. Bridge (LayerZero OFT)

### Bridge chains & LayerZero routes

`BRIDGE_CHAIN` (`constants.ts`): `flare`, `hyper_evm`, `ethereum`, `bsc`, `base`, `katana`, `monad`.
Every chain but Flare is a remote chain with its own FXRP OFT (`REMOTE_BRIDGE_CHAINS`, picker order).
`BRIDGE_ROUTE_CHAIN` = `xrpl` + `BRIDGE_CHAIN` + `hyper_core`.

There is no hand-written route table: `BRIDGE_LZ_ROUTES` (`config/bridge.ts`) is generated from
the chain list as `{ source, destination, compose }` (`BridgeLzRoute`), compose =
`plain` | `xrpl` | `hyper_core`:

| Routes | Source → LZ destination | compose |
|---|---|---|
| Flare → each remote | Flare → remote | `plain` |
| Flare → Hyperliquid | Flare → HyperEVM (→ composer → Core spot) | `hyper_core` |
| each remote but HyperEVM → Hyperliquid | remote → HyperEVM (→ composer → Core spot) | `hyper_core` |
| each remote → Flare | remote → Flare | `plain` |
| each remote → XRPL | remote → Flare (→ redeem composer → XRPL) | `xrpl` |
| remote ↔ remote | remote → other remote | `plain` |

`BridgeType` is the route id `<target>_from_<source>` (`bridgeTypeOf`, target = `xrpl` /
`hyper_core` for the composer routes, else the dstEid chain), e.g. `ethereum_from_flare`,
`xrpl_from_bsc`. `getBridgeLzRoute(type)` returns the route, `getBridgeConfig(type)` the derived
`BridgeConfig` (cached, one object per route):

| Field | Rule |
|---|---|
| `needsApproval` | source is Flare (the remote chains hold a plain OFT that burns from the caller) |
| `feeChain` | `undefined` = mainToken (source Flare), else the source chain — its gas coin from `BRIDGE_GAS_COIN` |
| `ledgerApp` | `source` from Flare, else `bridge` |
| `titleKey` | `chain` (from Flare), `xrpl`, `flare` (remote → Flare), `remote` (remote → remote) |
| `finishedDescriptionKey` | `xrpl`, `flare`, else `chain` |

i18n keys `bridge_modal.<titleKey>_title`, `bridge_<titleKey>_step_*`,
`finished_modal.description_<key>_label` interpolate the chain names: `{{bridgeType}}` =
`t(bridgeDestinationNameKey(type))` (Hyperliquid for the composer route, else
`bridge_page.chains.<destination>`), `{{sourceChain}}` = `t(bridgeSourceNameKey(type))`.

XRPL routes: lzCompose gas per source chain from `xrplComposeGas(source)` — 1.5M from Ethereum
(the Sepolia executor caps lzReceive + lzCompose at 5M), 5M from every other chain.

**Adding a chain** = `BRIDGE_CHAIN` entry, `BRIDGE_CHAIN_EID`, `BRIDGE_SOURCE_OFT` (+ env var in
`next.config.mjs` and `.env.example`), networks (mainnet + testnet), gas + FXRP coins
(`BRIDGE_GAS_COIN` / `BRIDGE_FASSET_COIN` / `BRIDGE_COINS`), a picker row in
`BRIDGE_ROUTE_CHAINS`, `bridge_page.chains.<chain>`, optionally `DIRECT_MINT_DESTINATIONS`. Routes,
balances (`useRemoteFxrpBalances`), accounts and WalletConnect chains follow the list.

**Peering** is not checked by the app: every pair of enabled chains is offered. A pair whose OFTs
are not peered fails at `quoteSend` (the page shows the error). Testnet Base Sepolia (`0xac7c4a07…`)
has only the Coston2 peer (2026-11-03), so its remote ↔ remote routes fail there; on mainnet every
OFT is peered with every other.

Remote OFTs (6 decimals; mainnet checked on-chain 2026-10-23 / 2026-11-03):

| Chain | Testnet | Mainnet |
|---|---|---|
| BNB Chain | `0xac7c4a07…45a4bf4e` | `0xCE6170EA…125F0110` |
| Base | Base Sepolia `0xac7c4a07…45a4bf4e` (Coston2 peer only) | `0xCE6170EA…125F0110` |
| Katana | — (no testnet OFT) | `0x565f9415…8d218059` |
| Monad | — (no testnet OFT) | `0xCE6170EA…125F0110` |

Remote → remote transfers do not touch Flare, so the backend history (`oft/fullHistory`) does not
list them — "Latest transactions" adds them from LayerZero Scan (see *Bridge history* below).

Endpoint IDs are never hardcoded: `BRIDGE_CHAIN_EID` + `bridgeChainEid(chain, mainnet)` in
`config/bridge.ts` read them from `@layerzerolabs/lz-definitions`. `bridgeChainFromEid(eid)`
is the reverse lookup, used where only the backend's `eid` is available (bridge history).

**Which contract is called** — `BRIDGE_SOURCE_OFT[sourceChain]`: an OFTAdapter on Flare
(wraps existing FXRP), a standalone OFT on every remote chain. Remote OFT addresses are
NOT shared between chains; Ethereum has its own.

### LayerZero Send Parameters

```ts
{
  dstEid: number,           // LayerZero endpoint ID
  to: bytes32,              // zero-padded destination address
  amountLD: bigint,         // amount in local decimals
  minAmountLD: bigint,      // slippage protection (= amountLD currently)
  extraOptions: hex,        // encoded gas options
  composeMsg: hex,          // '0x' or ABI-encoded compose message
  oftCmd: '0x',
}
```

**Gas:** `useBridgeSend` estimates `send()` gas explicitly and submits it with a 1.5x buffer (same as `POOL_ENTER` / `POOL_EXIT`) — an under-provisioned OFT send still burns the LayerZero fee before reverting. On a status-0 receipt the thrown message includes the tx hash.

### Compose Messages

```ts
// HYPER_CORE: receiver on Hyperliquid — the custom recipient, else the signer
abi.encode(['uint256', 'address'], ['0', recipient])

// compose 'xrpl' — FAssetRedeemComposer v2 tuple:
abi.encode(
  ['tuple(address, string, bool, uint256, address, uint256)'],
  [[
    signerAddress,           // redeemer on Flare
    destinationAddress,      // XRPL classic address, '' when unset
    tag !== 0,               // redeemWithTag
    BigInt(tag),             // destinationTag
    ethers.ZeroAddress,      // executor
    BigInt(executorFee),     // executorFee, from /api/oft/redemptionFees
  ]]
)
```

Every XRPL route targets the same composer on Flare (`FXRP_COMPOSER_ADDRESS`) — it supports
every source chain. extraOptions = `addExecutorLzReceiveOption(400_000, 0)` +
`addExecutorComposeOption(0, xrplComposeGas(source), executorFee)`.

Note `tag !== 0`: destination tag `0` is encoded as "no tag" and goes out untagged — see
BUSINESS_RULES.md. The direct redeem path does not share this limitation.

### Composer Fee Formula

```
amountToSend = amount × 1_000_000 / (1_000_000 − composerFeePPM)
```

From `GET /api/oft/redemptionFees/:srcEid` → `IOFTRedemptionFees.composerFeePPM`.

### Contract Addresses (env vars)

| Env var | Description |
|---------|-------------|
| `BRIDGE_FXRP_ADDRESS` | FAsset ERC-20 on Flare (needs approve) |
| `BRIDGE_FXRP_OFT_ADAPTER_ADDRESS` | OFT Adapter on Flare |
| `BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS` | OFT token on HyperEVM (misnomer — not an adapter) |
| `BRIDGE_ETH_FXRP_OFT_ADDRESS` | OFT token on Ethereum — its own address, not HyperEVM's |
| `HYPERLIQUID_COMPOSER_ADDRESS` | Composer on HyperEVM (HYPER_CORE) |
| `FXRP_COMPOSER_ADDRESS` | Composer on Flare (every → XRPL route) |
| `BRIDGE_BSC_FXRP_OFT_ADDRESS` / `BRIDGE_BASE_FXRP_OFT_ADDRESS` / `BRIDGE_KATANA_FXRP_OFT_ADDRESS` / `BRIDGE_MONAD_FXRP_OFT_ADDRESS` | OFT token on BNB Chain / Base / Katana / Monad — each its own, no fallback |
| `ENABLED_BRIDGE_CHAINS` | Comma-separated remote chains the app offers (`hyper_evm,ethereum,bsc,base,katana,monad`). Defaults to `hyper_evm` when the line is absent |

A remote chain is offered only when it is listed in `ENABLED_BRIDGE_CHAINS` **and** has an OFT
address — see `isBridgeChainEnabled`. The address alone is no proof the contract is live and
its peers are wired, which is why the flag exists as a no-deploy kill switch. A misconfigured line is not
an error — the chain is just hidden — so in development the console warns about an unknown chain
name and about a listed chain without an OFT address (`[bridge] ENABLED_BRIDGE_CHAINS …`).

Every address above is network-specific. When deploying to mainnet all of them change, not
just `NETWORK`; only `BRIDGE_ETH_FXRP_OFT_ADDRESS` currently documents its mainnet
counterpart inline in `.env.example`.

### IMessage (LayerZero status)

`status.name` values from `LAYER_ZERO_STATUS`:
`DELIVERED`, `INFLIGHT`, `PAYLOAD_STORED`, `FAILED`, `BLOCKED`, `CONFIRMING`

### IOFTHistory

```ts
{
  toHypercore: boolean,
  eid: number,
  amountSent: string,
  amountReceived: string,
  redemptionBlocked: boolean,
}
```

### Bridge history ("Latest transactions")

Three sources, merged by `BridgeTransactionsCard` and sorted by time:

| Source | Rows |
|---|---|
| backend `oft/fullHistory` (`useFullHistory`) | user progress + OFT history in one list: mints / redeems (as on the Mint page), and everything through the Flare adapter: SEND / RECEIVE, REDEEM (+ tickets), REDEEMFAIL, direct mint & bridge |
| LayerZero Scan `messages/wallet/{address}` (`useLayerZeroWalletMessages`) | remote → remote transfers (action `remote`), and remote → Flare until delivered — the backend lists those only once they reach Flare (action `receive`, or `redeem` when the payload carries a compose = bridge + redeem to XRPL; dropped once DELIVERED or a backend row has the same `txhash`). Rows carry `fromLayerZero`: tx links to LayerZero Scan, FAILED / BLOCKED / PAYLOAD_STORED read "Failed" (`layerZeroHistory.ts`) |
| Hyperliquid `userNonFundingLedgerUpdates` (`useHyperCoreLedger`, `api/hypercore.ts`) | Hyperliquid ↔ HyperEVM transfers (action `hypercore`, `hyperCoreDirection` `to_evm` / `to_core`): ledger entries with the FXRP system address on one side and the wallet on the other (`pickHyperCoreTransfers`, `hyperCoreHistory.ts`). Flare → Hyperliquid composer deliveries are skipped (the backend has them). "Finished", except HyperEVM → Hyperliquid while FXRP is held in Core's escrow ("In progress"); the hash is a Hyperliquid hash → Hyperliquid explorer. An API outage hides only these rows |

LayerZero rows are kept only when the sender is one of our remote FXRP OFTs (`BRIDGE_SOURCE_OFT`)
and Flare is on neither side — so nothing is duplicated, and other LayerZero apps (Stargate …)
are skipped. Same 7-day window as the backend. Scan has no amount field: it is decoded from
`source.tx.payload` (OFT message = recipient bytes32 + `amountSD` uint64, 6 shared decimals).
Scan cannot replace the backend: it knows nothing of redeem outcomes or direct mint & bridge,
lists by sender only, and on testnet no longer sees Coston2 transfers. A Scan outage hides only
the remote rows.

`fullHistory` mixes two shapes that share `action: "REDEEM"` — `isOftHistoryItem` tells them
apart: SEND / RECEIVE / REDEEMFAIL / DIRECT_MINT_BRIDGE are OFT, a REDEEM with `eid` or `guid` is
OFT, the rest is progress (not `amountSent`: required in the swagger, missing on live SEND rows). OFT rows render with `useBridgeTransactionTable`; progress rows are built
by `progressRows` (shared with `MintTransactionsCard`: redeems grouped by `txhash` into tickets),
marked `isProgress` and render with `useMintTransactionTable` — Try again (`useRetryMint`, shared),
partial redeem, Delayed / Defaulted included. The card merges the two tables per column id (bridge
headers). A direct mint whose XRPL hash matches a `DIRECT_MINT_BRIDGE` row is dropped, should the
backend ever list both. History invalidation uses a prefix key (`[OFT_KEY.FULL_HISTORY, evm]`) —
the key also carries the XRPL address. The Mint page keeps `userProgress`.

Token icons in both tables are wrapped in `NetworkIcon` (`TransactionsCard/NetworkIcon.tsx`) —
a tooltip with `bridge_page.chains.<key>`, since the badged FXRP icons differ only slightly.
`remoteChainIcon(eid)` returns the icon plus its key; anything without a badged coin (no `eid`, an
unknown chain) is the plain FXRP icon = Flare. A `DIRECT_MINT_BRIDGE` row without `eid` and
`oftSent` (not matched yet, or stuck before the OFT send) shows a neutral circle as destination;
the backend is asked to return `eid` + `toHypercore` from the request (2026-11-03) — then the right
icon shows with no FE change (HyperEVM and HyperCore share an eid, `toHypercore` tells them apart).

Direct mint & bridge rows (`DIRECT_MINT_BRIDGE`) come only when the connected XRPL address is
passed (`useFullHistory(evm, enabled, xrpAddress)` → `?xrpAddress=`), so they need both wallets.
The backend tracks only the Flare side (XRPL payment → mint → OFT sent); `directMintingStatus`
stays `EXECUTED_TO_SMART_ACCOUNT` even after LayerZero delivered. So once the executor sent the OFT
(`evmTxHash ?? oftSent.txhash`, status not `AWAITING_RECOVERY` / `RECOVERED`), the card asks
LayerZero Scan `messages/tx/{hash}` per row (`useMessagesByTx`, `api/bridge.ts`; 404 = not indexed
yet) and `directMintDeliveryOf` (`core/bridge/directMint.ts`) decides: the message to
`eid ?? oftSent.dstEid` `DELIVERED` (Hyperliquid also `lzCompose` SUCCEEDED) → "Finished",
FAILED / BLOCKED / PAYLOAD_STORED or a failed compose → "Failed", undelivered 15 min after the
LayerZero send (`source.tx.blockTimestamp`, not the XRP payment — a delayed mint sends later) →
"Delayed", otherwise "In progress". A backend `EXECUTED` stays "Finished" unless Scan says "Failed".
Each query (own key `MESSAGE_BY_TX`, not shared with `useMessage`) polls every 30 s until
DELIVERED — Failed keeps polling, PAYLOAD_STORED / a failed compose can be retried; DELIVERED gets
`staleTime: Infinity` (no refetch on remount / window focus). Mainnet only
(`IS_MAINNET`): testnet Scan does not index Coston2, every lookup would be a 404.
This is not the wallet query above: the executor (Personal Account) sends the OFT, not the user's
wallet, so `messages/wallet` never lists these and adds no duplicate rows. Without a Scan message
(testnet, loading, outage, not indexed yet) and for rows not sent yet, the status comes from `directMintingStatus`, not the
boolean `status` (that only means the source was processed): `EXECUTED` → "Finished",
`EXECUTED_TO_SMART_ACCOUNT` (minted to the Personal Account, bridge on its way) → "In progress",
`DELAYED` → "Delayed", `AWAITING_RECOVERY` → "Needs recovery", `RECOVERED` → "Recovered",
`MINTING_PAYMENT_TOO_SMALL_FOR_FEE` → "Payment too small", otherwise "In progress". The link is
the XRPL payment until `evmTxHash` exists, then LayerZero Scan; the destination icon uses
`eid ?? oftSent.dstEid` (generic FXRP until matched); `amountEstimated` prefixes the amount with "≈".
Rows without `oftSent` are provisional and can disappear.


### Hyperliquid ↔ HyperEVM (route action `hypercore_transfer`)

Not LayerZero: FXRP crosses between Hyperliquid Core spot and HyperEVM through its **system
address** — `0x20` + zeros + Core token index, big-endian (`hyperCoreSystemAddress`,
`core/hypercore/`). The token (index, `tokenId`) is read from `POST /info {type:"spotMeta"}` by
matching `evmContract.address` to `BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS` (`useHyperCoreFxrpToken`,
`api/hypercore.ts`) — testnet index 1443 (`0x20…05a3`), mainnet 367 (`0x20…016f`); no env var.
Both directions credit the sender's own address (recipient kind `none`).

| Direction | How | Fee | Hook |
|---|---|---|---|
| Hyperliquid → HyperEVM | `sendAsset` (`sourceDex`/`destinationDex` `"spot"`) to the system address — not `spotSend`, which Hyperliquid rejects for Unified accounts; EIP-712 (`HyperliquidSignTransaction`, `HyperliquidTransaction:SendAsset`, `signatureChainId` = HyperEVM chain id, wallet switched to HyperEVM first), `POST /exchange` | 200k HyperEVM gas at the base fee, paid in HYPE on Hyperliquid | `useHyperCoreToEvmTransfer`; Ledger: `LedgerConnector` `signTypedData` (`signEIP712Message`, on `0x6d00` (no clear signing, e.g. Nano S / old Ethereum app) → `signEIP712HashedMessage` = Blind signing), confirmed from `LedgerConfirmTransactionCard` |
| HyperEVM → Hyperliquid | ERC-20 `transfer(systemAddress, amount)` on the HyperEVM OFT | HyperEVM gas in HYPE | `useEvmToHyperCoreTransfer` |

`/exchange` answers HTTP 200 also for a rejected action (`{status:"err"}`) — `postHyperCoreAction`
throws its reason. Quote: `useHyperCoreTransferQuote` — rules in `evaluateHyperCoreTransfer` (`core/hypercore/hypercoreRules.ts`, texts in `hyperCoreIssueMessages.ts`); Core balances are spendable only (`hyperCoreFreeBalance`: `total − hold`, by token index, also for the FXRP row in `useBridgeBalances`); fee row from `useHyperCoreTransferFees`
(read-only HyperEVM RPC), blocking alerts before any amount:
no / too little HYPE on Hyperliquid, token not loadable; HyperEVM → Hyperliquid uses
`useGasBalanceCheck`, plus a blue (info) blocking alert "Your Hyperliquid account isn’t active yet — visit Hyperliquid to
activate it." when the address does not exist on Core (`userRole` = `missing`,
`useHyperCoreAccountExists`) — Core would not credit it, the FXRP would wait in
`spotClearinghouseState.evmEscrows` until the account is activated. HYPE sent from HyperEVM
(`0x2222…2222`) activates it (≈0.0004 HYPE `accountActivationGas`) and the escrow is then
credited (testnet, 2026-11-03); history shows such HyperEVM →
Hyperliquid rows "In progress" while an FXRP escrow is left. Pauses and OFT limits do not apply (neither the FAsset nor the adapter is
involved). Confirm: `HyperCoreTransferConfirmModal` (one step, then finished in the same modal).

### Bridge page (`/bridge`)

One page for every way FXRP moves: the user picks FROM and TO, the pair resolves to a
route, the right side runs it. Not protected — balances and routes show without a wallet.
It replaced the old card-based `/bridge` (BridgeBalanceCard / BridgeUnderlyingBalanceCard /
BridgeAccountBalanceCard + BridgeModal with BridgeForm / BridgeXrplForm), which is removed.

**Route registry** — `config/bridgeRoutes.tsx`, the only place route rules live:

| Item | Meaning |
|------|---------|
| `BRIDGE_ROUTE_CHAIN` (`constants.ts`) | Picker rows: `xrpl`, every `BRIDGE_CHAIN`, `hyper_core`. Wider than `BRIDGE_CHAIN` (XRPL is not LayerZero, Core lives in HyperEVM) |
| `BRIDGE_ROUTE_ACTION` (`constants.ts`) | `mint` (XRPL → Flare), `redeem` (Flare → XRPL), `bridge` (LayerZero, carries a `BridgeType`), `direct_mint_bridge`, `hypercore_transfer` (Hyperliquid ↔ HyperEVM, not LayerZero — see *Hyperliquid ↔ HyperEVM* below) |
| `BRIDGE_ROUTE_CHAINS` | Rows in display order, filtered by `isBridgeChainEnabled` (Hyperliquid follows HyperEVM) |
| `BRIDGE_ROUTES` | The supported pairs: mint, redeem, every `BRIDGE_LZ_ROUTES` route, direct mint & bridge to `DIRECT_MINT_DESTINATIONS`, Hyperliquid ↔ HyperEVM; a pair missing here is disabled in the TO column |
| `findBridgeRoute(from, to)` / `getBridgeRouteChain(chain)` / `getBridgeRouteConfig(route)` | Lookups; the last returns the route's `BridgeConfig` |

`getBridgeConfig` / `BridgeConfig` (approve, fee chain, Ledger app, i18n keys per route) lives in
`config/bridge.ts`; the registry and the confirm step read it.

UI rules: FROM is always selectable; TO stays locked until FROM is picked, then only
`findBridgeRoute(from, chain)` pairs are enabled. Picking a new FROM drops an unreachable TO;
a new TO closes the custom recipient.

**State & data hooks** (`components/bridge/state/`, shared by desktop and mobile):

| Hook | Returns |
|------|---------|
| `useBridgePageState()` | from / to / route, accounts, balances, custom recipient + handlers — components take it as one `state` prop (`IBridgePageState`); composes `useBridgeRouteSelection` (from / to, swap flags), `useBridgeRecipient` (custom + mint recipient), `useBridgeDestinationTag`, `useBridgeLinkState` (link prefill / pending amount) — the handlers that reset several of them (`onToChange`, `onFromChange`, `onSwap`, `applyLink`, `resetForm`) stay in the composer; recipient rules are pure functions in `core/bridge/recipientRules.ts` |
| `useBridgeAccounts()` | `Record<BridgeRouteChain, IBridgeAccount>` — XRPL from the XRPL wallet, every other chain from `mainToken` |
| `useBridgeBalances(accounts)` | FXRP / XRP balance per chain (`display` strings + numeric `values`) from the old cards' queries, polled every `BALANCE_FETCH_INTERVAL` |
| `useBridgeAmountForm(from)` | `useForm` + `yupResolver` amount form; resets when FROM changes |
| `useBridgeRouteQuote({ from, route, amount, balances })` | `fees: FeeItem[]`, `received`, `available`, `maxAmount` (XRPL minus `minWalletBalance`), `isQuoteSupported` |

`useBridgeRouteQuote` is the single entry point; it calls one hook per flow from
`components/bridge/quotes/` (all on every render, only the active one `enabled`), each
returning `IRouteQuotePart` (`fees`, `received`, `maxAmount`, `isLoading`) with the same math
as the existing forms:

| Flow hook | Route | Fees / received / max |
|-----------|-------|-----------------------|
| `useBridgeTransferQuote` | Flare ↔ HyperEVM / Hyperliquid / Ethereum | `useBridgeFees` (nativeFee in gas coin); received = amount; max = balance |
| `useBridgeToXrplQuote` | HyperEVM / Ethereum → XRPL | `useBridgeXrplFees` (nativeFee + redemption fee in XRP + composer fee in FXRP when PPM > 0); received = net − redemption fee; max = affordable net ∧ queue; `limit` "available" = affordable net when below the balance |
| `useRedeemQuote` | Flare → XRPL | `useRedeemFees` (redemption bips + executor); received = amount − fee; max = balance ∧ queue (as `RedeemForm`) |
| `useMintQuote` | XRPL → Flare | `useMintFees` (system fee + executor, XRP side); received = amount; max from XRP balance − reserve, capped by mint cap (as `MintForm`) |

`useLayerZeroFee` is the shared debounced `quoteSend` (amount, address and tag debounced
500 ms). It calls **`useBridgeQuoteSendReadOnly`** (`useContracts.ts`): a view call through
the source chain's RPC with the same `buildBridgeSendParams` and sender = `mainToken.address`.
Never quote through the wallet signer — `getSigner`
switches the wallet's chain, the page re-quotes often, and a still-pending switch left the
call on the wrong chain (`could not decode result data … "0x"`).

**Validation** — every flow hook also returns `validation: IRouteValidation`
(`quotes/types.ts`: `alerts` in priority order, `isBlocked`, `input` = placeholder /
description / readOnly / field error). Panel and mobile show one alert (`resolveAlert` +
`FormAlert`) at the top of the FROM row and add `!isBlocked` to the CTA condition;
`useApplyAmountValidation` puts the field error on the amount and resets it when the field
turns read-only (mint cap). `useBridgeRouteQuote` adds `input.disabled` when `maxAmount === 0`
(nothing can be sent — also at a reached mint cap); the field is disabled as well without a
source wallet. Rules are 1:1 with the old forms + modals — see
`docs/superpowers/specs/2026-10-21-bridge-page-validation-design.md` (ids T*, X*, R*, M*).
Shared pieces: `useGasBalanceCheck` (nativeFee vs FLR/HYPE/ETH balance) and
`useXrplDestinationChecks` (depositAuth, requireDestTag without tag, tag not supported —
fail closed). Descriptions that only repeat "available" (old "Your balance is …", "Waiting to
receive XRP balance") are left out; the FROM row is top-aligned so a description grows it
downwards.

**Recipient** — `getBridgeRouteRecipient(route)` (`config/bridgeRoutes.tsx`): `xrpl`
(redeem, bridge + redeem) → any XRPL address + destination tag; `evm_or_tag` (mint) → any Flare
address (no minting tag on this page); `evm_address` (compose kind
`plain` or `hyper_core`, direct mint & bridge) → any EVM address (`useBridgeSend`: `destinationAddress`, else
`mainToken.address`; the read-only quote keeps the sender — the fee does not depend on it): `plain`
sends it as `SendParam.to`, `hyper_core` as the composer's `receiver` in `composeMsg`, direct mint
& bridge as `evm_recipient` (payload `evmRecipient`). A Hyperliquid recipient (`hyper_core`, XRPL →
Hyperliquid) is checked like HyperEVM → Hyperliquid (`useBridgeRecipientCheck`, once in `useBridgeRouteQuote`
for every route → `useHyperCoreAccountExists` →
`evaluateHyperCoreRecipient`): no active
Hyperliquid account → info alert `recipient_not_active_label`, CTA blocked (the composer would
revert and leave the FXRP on HyperEVM); blocked while the check loads and when it fails (error
`recipient_check_failed_label`, fail closed; `useHyperCoreAccountExists` retries once, then asks
again every 10 s while failed or `missing`, and returns `exists` / `isLoading` / `isUnavailable`);
`none` (Hyperliquid ↔ HyperEVM) → always the connected EVM address, no "Custom". One `BridgeRecipientField` (own form, EVM vs XRPL address check) serves every
route. The input is open when the user chose "Custom" or when no wallet is connected for the
destination chain; "Remove" shows only when there is a wallet address to fall back to. The
picker has no "Connect wallet" links — the CTA connects. XRPL tag: `BridgeDestinationTagField`
(0–4294967295, `0` is a tag) — in the custom address's row when the address is typed, below
the wallet address otherwise (never both). Mint: `useMintRecipient` still resolves the typed
address (`addressTag`) for the payload.

**Deep link** — `/bridge?srcChain=…&dstChain=…&amount=…&recipient=…&tag=…` opens the page filled
in (partner links, e.g. Stargate); the form and the URL stay in sync both ways. It only pre-fills —
nothing is submitted without the user.

| Piece | Role |
|-------|------|
| `core/bridge/deeplinkRules.ts` | Pure: `parseBridgeDeeplink(query)` → `BridgeDeeplink` (`core/bridge/types.ts`), `buildBridgeDeeplinkQuery(values)`, `clampDeeplinkAmount(amount, max, allowDecimal)` |
| `URL_CHAIN_KEYS` (same file) | URL key ↔ `BridgeRouteChain`. Stargate's own keys (`flare`, `ethereum`, `bsc`, `base`, `katana`, `monad`, **`hyperliquid` = HyperEVM**, `hypercore` = HyperCore) + our `xrpl`. A chain missing here cannot be linked to |
| `useBridgeDeeplink(state)` (`components/bridge/state/`) | URL → form on load and on every outside URL change (`router.isReady`, query watch); form → URL with a shallow `router.replace`, debounced 500 ms. Both sides compared as normalized query strings — the echo of our own write is skipped (`syncedQueryRef`), and the form's not-yet-caught-up query right after a link is never written (`staleFormQueryRef`) |
| `useBridgePageState().applyLink` | Replaces the whole form: drops a chain not enabled here (`getBridgeRouteChain`), a `dstChain` not in `BRIDGE_ROUTES`, a recipient on `none` routes, a tag on a non-XRPL destination (with or without `recipient` — the tag field takes the user's own XRPL wallet too). Recipient / tag go in as field `initialValue`s (`linkPrefill`, fields remounted by key); the user's first edit of a field clears its prefill (`onEdit`), so a remount (inline ↔ below tag, mobile ↔ desktop, route change) never brings the link's value back over a correction |
| `useBridgeAmountLink(form, quote, state, amount)` (`useBridgeAmountForm.ts`) | The link's amount waits as `pendingAmount` until the route's `maxAmount` is final — with a source wallet, once its balance is in; without one it goes in as is (dropped when nothing can be sent, e.g. the mint cap) (`quote.isMaxFinal`: the flow, the OFT rate limit and the mint cap have loaded — a failed request counts as loaded) (`useApplyAmountValidation` empties a disabled field, and the amount resets on every chain change). Above max → set to max (no notice: the field shows the value, the FROM row the limit). Max 0 / read-only → dropped. An amount typed (or linked) before the wallet connected is capped once, when its balance is in. Also reports the settled amount back for the URL |

The amount input is enabled without a wallet (fees and the received amount are quoted with a zero-address sender); Max stays disabled until there is a max, the CTA reads "Connect wallet".

URL rules: each param once (a repeated one, `string[]`, is ignored); `amount` `^\d{1,15}(\.\d{1,18})?$`,
cut (never rounded) to 6 decimals; `recipient` letters / digits ≤ 64 (format checked by the field,
shown with its error); `tag` 1–10 digits goes into the field (range checked there); any other non-empty
`tag` (`-1`, `1.5`, `abc`, 11+ digits) is **not dropped**: the field stays empty,
shows the range error and blocks Bridge until the user edits it (`isWellFormedDeeplinkTag`) — the tag is
optional, so a dropped one would send without a tag; `srcToken` / `dstToken` and
unknown params ignored. Chain keys are looked up with `Object.hasOwn` (no `__proto__`).
Form → URL never writes the connected wallet's address — only an open custom recipient that differs
from it; the tag is written on every XRPL destination (an invalid tag from a link stays in the URL until the field is edited, so a reload still blocks). A link's recipient shows the hint "From the link. Check that this is the right address."
under the field while untouched. Partner-facing spec: "FAssets Bridge — Deep Link Specification"
(Claude doc, shared with the partner).

**Submit** (`components/bridge/submit/`) — the page is the amount step; the CTA opens the
existing confirm step of the route's flow.
- `useBridgeSubmit` (panel + mobile): `canSubmit`, CTA `loading` while the click path runs,
  the alert (`state.submitError` first, then validation), and the click path: `quote.submit()`
  (route extras: bridge re-quotes the LayerZero fee — fresh raw `nativeFee` via
  `useLayerZeroFee.requote()`; redeem → executor; mint → `highMintingFee` when above 2 %),
  merged with the page state into a `BridgeSubmitPayload` (`kind: bridge | mint | redeem`).
- `pages/bridge.tsx` mounts `BridgeConfirmModal` (wraps `bridge/ConfirmStepper`),
  `MintConfirmModal` (`HighMintingFeeModal` gate + `mint/ConfirmStepper`, kept mounted for the
  waiting / limit modals) and `RedeemConfirmModal` (`useRedeemRequest`, auto-start except Ledger,
  deferred so Strict Mode starts once).
- Pre-broadcast errors → modal closes, `state.setSubmitError(msg)` (cleared on amount / route /
  recipient change). Success → `state.onSubmitSuccess()` (balances refetch + amount reset) and
  "Latest transactions" refresh. LayerZero FAILED / BLOCKED / PAYLOAD_STORED → bridge stepper's
  `onDeliveryFailed` closes the waiting modal → toast.
- `components/redeem/useRedeemRequest.tsx` — RedeemModal's request + post-tx flow (guard,
  redemption default, status / default polling, waiting / unresponsive-agent / finished modals)
  extracted; `RedeemModal` and `RedeemConfirmModal` share it. `reset()` cancels the guard, so the
  caller must toggle `opened` before the next request.

**Folders** (`components/bridge/`): `picker/` (chain picker, address, headings), `form/`
(amount panel, mobile card, footer, recipient / tag fields), `state/` (page state, accounts,
balances, amount form, mint recipient), `quotes/` (`useBridgeRouteQuote` + one hook per flow),
`submit/` (payload, confirm modals), `ConfirmStepper.tsx` (the LayerZero confirm step).

**Direct mint & bridge** (XRPL → `DIRECT_MINT_DESTINATIONS`: Ethereum, HyperEVM, Hyperliquid, BNB
Chain, Base, Katana, Monad — route action
`DIRECT_MINT_BRIDGE`; spec `docs/superpowers/specs/2026-10-27-direct-mint-bridge-design.md`) —
one XRP payment, the smart-accounts executor mints FXRP on Flare and sends it over LayerZero; no
EVM signature, no gas coin. Offered only when `SMART_ACCOUNTS_API_URL` is set (testnet
`https://smart-accounts-ctn2-api.flare.rocks/api/v3/`). `api/directMint.ts`:
`useDirectMintFee` (`GET direct_mint/fee`, nonbinding preview), `useDirectMintRequest`
(`POST direct_mint/request`, authoritative), `useDirectMintStatus` (`GET direct_mint/status/{xrplTxHash}`,
404 → `null`). `destination_kind` = `route.to.toUpperCase()` (the API rejects lower case);
`destination_eid` = `directMintDestinationEid(route, IS_MAINNET)` (Core uses HyperEVM's EID; the
network from config, not the EVM wallet — the route works without one).
- Quote `useDirectMintBridgeQuote`: mint rules (min, cap, pause, XRP balance) from `useMintQuote`,
  fees "Minting fee" (`breakdown.minting_fee`) + "LayerZero fee" (`breakdown.operator_fee`),
  received = `to_receive`, max = mint max − operator fee; `evm_recipient` = the TO field (connected
  EVM wallet or custom), the preview always quotes a placeholder (the fee does not depend on it);
  the EVM wallet stays required (history / Recover load by the EVM address). → Hyperliquid: the
  account check in `useBridgeRouteQuote` (`useBridgeRecipientCheck`, `isLoading` while it runs).
- `DirectMintBridgeConfirmModal`: `/request` on open; when `to_receive` / `total_fee` differ from the
  form's preview the user confirms again; one XRP payment to `payment_address`, memo = `memo`, no
  DestinationTag, drops = `amount.exact + total_fee.exact` (BigInt). Then
  `useDirectMintBridgeTracking`: smart status every 10 s (`delayed`, `memo_skipped`,
  `awaiting_recovery`, `error`) until `executed` with `tx_hash`, then LayerZero Scan for the
  route's `dstEid` (Core also needs `lzCompose` SUCCEEDED). One modal: confirm → waiting →
  finished (Figma). Testnet: only XRPL → Ethereum (Sepolia) completes.
- History rows: see "Bridge history" above.
- Recovery (`DirectMintRecoveryModal`, opened by **Recover** in the "Recovery needed" notice
  (below) or on a history row in `AWAITING_RECOVERY`; the amount shown is the row's `amount`): reads the smart status fresh by the original hash and offers the payment
  only while `type` / `action.action` are `BRIDGE`, `status` is `awaiting_recovery` and
  `payload.type` is `RecoveryMemo`. Pays exactly `payload.amount.exact` drops to
  `payload.payment_address` with `payload.memo` (0xE0), from the XRPL wallet that paid
  (`payment.transaction_account`, else the button is disabled); then polls the original hash —
  `recovery_pending` / no memo = processing, `memo_skipped` = FXRP released to the Personal Account
  on Flare (no XRP refund, no bridge retry), `executed` = nothing to recover. Testnet: paying the
  same `/request` memo twice puts the second payment in `awaiting_recovery` (`CALL_FAILED`).
  The backend sees the recovery payment only after a few minutes (`RecoveryReplayPending`, then
  `memo_skipped`) and offers the `RecoveryMemo` until then, so the sent hash is kept in an in-memory
  zustand store (`store/directMintRecovery.ts` — the query cache is cleared on wallet connect /
  network switch): reopening shows "processing", the history row "Recovering…" instead of Recover.
  Lost on a page reload. Both modals pay through `useXrplPayment` (memo payment, hash or throw,
  `xrplPaymentError` for rejected / Ledger / other); the confirm modal drops a `/request` or a
  signature that finishes after it was closed (`runId`). On `memo_skipped` the history is
  refetched at once. Steps (Figma): Review (amount, Flare Smart Account =
  `action.personal_account`, recovery fee = `payload.amount`, Next signs) → "Confirm in your
  wallet" → "Recovering" spinner while processing → Finished ("Open FSA app" =
  `SMART_ACCOUNTS_WEBSITE_URL`).
  Recovered transfers stay in the history as `RECOVERED` (backend, 2026-10-29) → badge "Recovered"
  with "Open in Smart Accounts" (`SMART_ACCOUNTS_WEBSITE_URL` in `constants.ts`: fsa.flare.network /
  smart-account-coston2.flare.rocks): the FXRP is on the
  Personal Account, managed in the smart accounts dApp — the recovery modal links it too.

**Pauses & OFT limits** — `core/bridge/pauseRules.ts` (`evaluatePauses`, used through
`useSystemPauses` from `GET /fassetState` and `GET /oft/paused`). **Either pause stops the whole
bridge page** (UX decision 2026-10-29: no half-working page, pauses are rare):

| Backend | Meaning |
|---|---|
| `/fassetState` → `state: true` | FAsset emergency pause, **any level** (the backend does not report it; at `FULL_AND_TRANSFER` even FXRP transfers stop; `redeem*` has `notEmergencyPaused` on the contract) |
| `/oft/paused` → `true` | Flare OFT adapter paused — technically only LayerZero transfers; mint and redeem still work on `/mint` |

- `/mintEnabled` reads the same flag as `/fassetState` (backend team); the bridge page uses only
  `/fassetState` (Home / `/mint` still read `/mintEnabled`).
- While paused: every chain in the picker is greyed out (`state.isPaused` → `BridgeChainList`), the
  form shows an info alert, the amount is locked and the CTA is blocked (fallback for a pause that
  comes after the pick). Red `PauseBanner`s in `MainLayout`: the FAsset pause on every network, the
  OFT pause only where the bridge exists (`isBridgeEnabled`); refetched on route change.
- Polling only while paused (every 60 s, `useFassetState` / `useOftPaused`) — otherwise the locked
  page would never notice the unpause (no refetch on focus, the blocked CTA never re-checks).

`OftRateLimits` (`core/bridge/oftRateLimits.ts`, `useOftRateLimits`, `GET /oft/limits`, 6-decimal
UBA, `1000000000000` = 1,000,000 FXRP) caps the amount: `outgoing[dstEid]` out of Flare (incl.
direct mint), `incoming[srcEid]` into Flare (incl. bridge to XRPL); remote → remote has no known
limit (remote OFTs have their own, not reported). Polled every 60 s only while a limit is used up.
On CTA click `quote.checkPauses()` and `quote.checkOftLimits()` fetch fresh, side by side with the
flow's `submit()`, and stop with the same message before anything is signed. Unreachable = not
checked.

**Recovery notices** — `BridgeRecoveryNotice` (top of the page, desktop + mobile), two notices
drawn by the shared `RecoveryNotice` (grey header with a full border, then one box per item):
- **Asset Recovery** — `useRedeemerAccount` polls itself (`refetchInterval: BALANCE_FETCH_INTERVAL`)
  and is invalidated by `useTransactionInvalidation` (`BRIDGE_KEYS`) when a bridge tx finishes, so
  the notice appears without a reload; one box per token ≥ 0.01 on the redeemer
  (bridge) account, **Transfer** → `RedeemerWithdrawModal`: the whole balance (no input) to the
  connected wallet — review (amount, destination) → confirm → finished. Both recovery modals render
  outside the notice: a finished transfer empties the account and hides the notice, the modal stays.
- **Mint & Bridge recovery** — one box per `DIRECT_MINT_BRIDGE` row in `AWAITING_RECOVERY` or `RECOVERY_PENDING` (paid, backend processing — "Recovering…", no Recover, also after a reload)
  (one recovery payment each), from the same `useFullHistory` query as "Latest transactions" (no
  extra request; XRPL wallet needed; last 7 days only — a longer-stuck payment needs a backend
  endpoint, asked). **Recover** → `DirectMintRecoveryModal`; "Recovering…" once paid.
Both notices span the chain picker's column (same grid as the page: `components/bridge/layout.ts` — `BRIDGE_WIDE_QUERY` 1250px, `BRIDGE_FORM_COL_STYLE`), 3 boxes per row, Mint & Bridge below Asset Recovery. i18n: a link tag in `Trans` must not be `<link>` —
react-i18next parses it as a void HTML element (the notice uses `<fsa>`).

**Components:** desktop = `BridgeChainPicker` (FROM/TO header + two `BridgeChainList`
columns) + `BridgeFormPanel`; mobile (`max-width: 767px`) = `BridgeMobile` (FROM/TO as
`Collapse` dropdowns). Shared: `BridgeChainHeading`, `BridgeAddress` / `BridgeWalletAddress`,
`BridgeRecipientField` (own form, EVM vs XRPL address check), `BridgeCustomLink`,
`BridgeSwapButton` (FROM ↔ TO on the divider: `state.canSwap` / `isSwapUnsupported` / `onSwap`
from `useBridgePageState`; `data-disabled` instead of `disabled` so the "not supported" Mantine
`Tooltip` still gets hover), `BridgeFormFooter` (`FeeBreakdown` + CTA: "Bridge" on every route,
"Select network" until FROM and TO are picked, "Connect wallet" when disconnected). Desktop
grid: picker `lg: 8`, panel `lg: 4`. Received amount and fees show up to 6
decimals (received floored, fees rounded up — the fee format is a temporary override in
`BridgeFormFooter`).

**Shared pieces touched:** `AmountInput` `variant="inline"` (value left, Max right like every other amount input, no coin
label, full width — default unchanged). Disabled buttons keep Mantine's default look (the
custom pink disabled style was dropped).

---

## 8. Collateral Pools

### Contract Calls

```ts
CollateralPool.enter({ value: amount })           // deposit native → receive CPT
CollateralPool.exit(tokenShare)                   // burn CPT → receive native
CollateralPool.withdrawFees(feeShare)             // claim FAsset fees
```

### IPool Key Fields

| Field | Meaning |
|-------|---------|
| `vault` / `pool` / `tokenAddress` | Contract addresses |
| `totalPoolCollateral` | Total native tokens in pool |
| `poolCR` / `vaultCR` | Current collateral ratios |
| `mintingPoolCR` / `mintingVaultCR` | Minimum CR for minting |
| `poolExitCR` | Minimum CR to allow user exit |
| `poolMinCR` / `poolSafetyCR` / `poolCCBCR` | Safety thresholds |
| `freeLots` / `allLots` | Minting capacity |
| `mintedAssets` / `remainingAssets` | Current supply metrics |
| `feeBIPS` / `mintFee` / `feeShare` | Fee structure |
| `health` | 0–100 health score |
| `redeemRate` | CPT to native exchange rate |
| `userPoolBalance` / `userPoolFees` | User-specific stats |
| `nonTimeLocked` | Unlocked CPT portion |

`MAX_CR_VALUE = 1000` — displayed as infinity. Check with `isMaxCRValue()`.

### Removed: CPT transfer & fee debt payment

`SendCPTsModal` / `PayDebtModal` (and `useTransferCollateralPoolToken`, `useFreeCptApprove`, `useFreeCptPayAssetFeeDebt`) were removed in 2026-09 — unreachable since the `PoolsTable` entry point was dropped (Jun 2025). The UI no longer calls `payFAssetFeeDebt` or uses the Free CPT contracts.

### IMaxWithdraw

`GET /maxWithdraw/:fasset/:pool/:user/:value` → `{ natReturn, fees }`

`GET /maxPoolWith/:fasset/:pool` → `{ maxWithdraw }` (system-level cap)

---

## 9. Direct Minting Tags

### How Tags Work

User registers XRP destination tag → maps to Flare address. Anyone paying Core Vault with that tag → FAssets minted to registered address automatically.

### ITagsByAddress

```ts
{
  tagId: string,
  mintingRecipient: string,           // Flare EVM address
  allowedExecutor: string,            // zero = anyone can execute
  executorChangePending?: boolean,
  pendingNewExecutor?: string,
  executorChangeActiveAfterTs?: number,
}
```

### IMintingRecipient

`GET /mintingRecipient/:fasset/:tagId` → `{ recipient: string }`

Zero address = tag not registered.

### Redemption Tag (`redeemWithTag`)

Distinct from minting tags. The redeemer requests that the agent includes a specific XRP destination tag in the underlying redemption payment — used to route XRP to exchanges or custodians that require a tag for account identification.

- **XRPL-only** — only available when `redeemWithTagSupported()` returns `true`
- **Per-request** — tag is supplied at redemption time, not pre-registered
- **Contract:** `redeemWithTag(amountUBA, address, executor, destinationTag)`
- **Proof type:** XRP-specific FDC proofs (`confirmXRPRedemptionPayment`, `xrpRedemptionPaymentDefault`)
- **Event:** emits `RedemptionWithTagRequested` (not `RedemptionRequested`)
- **Form input** (redeem, bridge + redeem): validate with `isValidDestinationTag` (empty = no tag, else uint32 0–4294967295) and convert with `parseDestinationTag`, both in `utils/number.ts`. No `maxLength` on the `NumberInput` — it silently truncates a paste into a valid but wrong tag; let the validator show the error instead

| Concept | Minting Tag | Redemption Tag |
|---------|-------------|----------------|
| Direction | XRP → FXRP | FXRP → XRP |
| Purpose | Identify FXRP recipient on Flare | Identify XRP recipient on XRPL |
| Setup | One-time registration (ERC-721) | Per-redemption parameter |
| Contract | `MintingTagManager` | `IAssetManager.redeemWithTag()` |

---

## 10. User Progress & History

### IUserProgress

| Field | Meaning |
|-------|---------|
| `action` | `"mint"` or `"redeem"` |
| `fasset` | FAsset type string |
| `amount` | Display units |
| `status` | `true` = completed |
| `defaulted` | Agent defaulted (redeem) |
| `incomplete` | Partial redemption |
| `remainingLots` | Lots still pending |
| `rejected` / `takenOver` / `rejectionDefaulted` | Agent handshake outcomes |
| `missingUnderlying` | User didn't pay in time |
| `directMinting` | `true` if direct minting flow |
| `directMintingStatus` | `INPROGRESS`, `DELAYED`, `EXECUTED`, `EXECUTED_TO_SMART_ACCOUNT`, `MINTING_PAYMENT_TOO_SMALL_FOR_FEE` |
| `underlyingTransactionData` | Full payment instructions for retry flows |

---

## 11. Fees Reference

| Fee | Source | Paid in | When |
|-----|--------|---------|------|
| Minting fee (direct) | `mintingFeeBIPS` | Deducted from received FAssets | Minting |
| Executor fee (direct) | `fassetsExecutorFee` (UBA) | Deducted from sent amount | Minting |
| Executor fee (EVM) | `GET /executor/:fasset` → `executorFee` | `msg.value` | Redeem |
| Redemption fee | `GET /redemptionFee/:fasset` | Percentage of amount | Redeem |
| Trailing fee | `GET /trailingFee` | Ongoing on holdings | Holding FAssets |
| LZ native fee | `quoteSend` result | FLR or HYPE | Bridge |
| Composer fee (PPM) | `GET /oft/redemptionFees/:srcEid` | Deducted from amount | Bridge XRPL/CORE |
| OFT executor fee | same endpoint | Added to LZ fee | Bridge XRPL |
| Xaman fee | computed in UI | User's XRP balance | Xaman wallet only |

### Fee Code (`src/core/fees/`, `src/hooks/fees/`)

All fee math and display is centralized — never compute fees inline in a form or stepper.

**`Fees` class** (`core/fees/fees.ts`) — pure static math:

| Method | Use |
|--------|-----|
| `totalToBridge(net, feePPM)` / `totalToBridgeRaw(bigint…)` | Composer gross-up — gross to send so the user receives `net` |
| `affordableNet(balance, feePPM)` | Inverse — max net bridgeable from a balance |
| `redeemingFee(amount, bips)` | Redemption fee |
| `mintingFee(base, executorFee, bips, minimumFee)` | Direct-mint system fee (gross-up + min floor) |
| `mintPaymentRaw(...)` | Total direct-mint XRP payment in drops (string, for the on-chain request) |

Display formatting lives in `core/fees/format.ts` (`formatFeeAmount`, `formatCrossChainFee`, `formatBalanceAmount`, `formatInputAmount`).

**Per-flow hooks** (`hooks/fees/`) return ready-to-render `FeeItem[]`: `useNativeFee`, `useBridgeFees`, `useBridgeXrplFees`, `useMintFees`, `useRedeemFees`, `useReserveMintingTagFees`. Build new items with `buildFeeItem({ label, token, fee: { amount, isLoading }, currencyName, format? })`.

**`FeeBreakdown`** (`components/elements/FeeBreakdown.tsx`) renders them:

```tsx
const fees = useRedeemFees({...});
<FeeBreakdown items={fees} />                       // single "fees" group
<FeeBreakdown sections={[                            // several groups, one shared currency column
  { label: t("...you_will_receive"), items: receiveItems },
  { label: t("...fees"), items: fees },
]} />
```

`amount: null` renders a dash; `isLoading` renders a spinner.

### Domain Rules (`src/core/`)

Business math and validation rules live in `core/` as plain functions — no React, no i18n,
no imports from `components/` (type-only imports from `config/` are fine). Hooks and
components call them and translate the result.

| Module | Exports |
|--------|---------|
| `core/alerts` | `IAlertMessage` / `AlertType` (re-exported by `FormAlert`), `Issue<C>`, `toAlert`, `resolveAlert` |
| `core/fees` | `Fees`, fee formatting, `FeeItem` (see Fee Code above) |
| `core/mint` | `MINT_RULES`, `evaluateMint`, `MintCalculator`, `MintingInfoMapper` / `MintCapMapper`, `XamanFee` |
| `core/redeem` | `evaluateRedeemAmount`, `evaluateRedeemQueue`, `RedemptionMapper` / `RedemptionLimits` |
| `core/bridge` | `BRIDGE_XRPL_RULES`, `evaluateBridgeXrpl`, `BridgeXrplCalculator`, `evaluateGas`, `buildSubmitPayload`, `BridgeSubmitPayload` / `RouteSubmitExtras` / `IMintRecipientValues` |
| `core/xrpl` | `evaluateXrplDestination` (depositAuth, required tag, tag not supported) |

**Rules as data** — a rule returns `Issue<Code>[]` instead of translated alerts:

```ts
// core/…: what is wrong, how loud, does it block the CTA, raw values for the text
evaluateRedeemAmount(input) // → [{ code: "below_min", severity: "info", blocking: true, values: { min } }]

// components/bridge/quotes/*IssueMessages.ts: code → t(...) for that flow
const message = redeemIssueMessage(t);

// quote hook: Issue → IAlertMessage, order = priority
alerts: issues.map(issue => toAlert(issue, message)),
isBlocked: issues.some(issue => issue.blocking),
```

- Order in the list is the priority; `resolveAlert` shows the first alert with a message.
- Texts live in one mapper per flow (`bridgeXrplIssueMessages`, `gasIssueMessages`,
  `mintIssueMessages`, `redeemIssueMessages`, `xrplDestinationIssueMessages`) — add a new code
  to the `…IssueCode` union and its mapper, never format a message inside `core/`.
- Moved types keep re-exports at their old paths (e.g. `IMintRecipientValues` from
  `bridge/state/useMintRecipient`), so existing imports keep working.

---

## 12. XRPL-Specific

### IUnderlyingBalance

```ts
{
  accountInfo: {
    depositAuth: boolean,     // rejects most deposits
    requireDestTag: boolean,  // requires destination tag on all payments
  },
  balance: string | null,     // null = UTXO not fetched / account inactive
}
```

`balance === null` triggers `walletConnectConnector.fetchUtxoAddresses()` in MintForm.

### paymentReference

Hex memo string linking payment to collateral reservation. **Strip `0x` when encoding:**
- XRPL: `MemoData: paymentReference.substring(2)`
- BTC/DOGE: `memo: paymentReference.substring(2)`

---

## 13. UTXO Networks (BTC/DOGE)

### xpub (Ledger)

```ts
// Store:
connectedCoin.xpub = CryptoJS.AES.encrypt(xpub, XPUB_SECRET).toString()

// Decrypt at use:
CryptoJS.AES.decrypt(xpub, XPUB_SECRET).toString(CryptoJS.enc.Utf8)

// Balance endpoint:
GET /balance/xpub/:fasset/:xpub
```

### accountAddresses (WalletConnect)

```ts
{ receiveAddresses: string[], changeAddresses: string[] }
// Passed as comma-joined query params to balance/UTXO endpoints
```

### IUtxo

```ts
{ hexTx, txid, vout, value, address, utxoAddress, index }
```

### IUtxoForTransaction

`GET /getUtxosForTransaction/:fasset/:xpub/:amount` → `{ selectedUtxos, returnAddresses, estimatedFee }`

`POST /prepareUtxos/...` → `{ psbt, selectedUtxos }` — PSBT signed via `useSignPsbt`.

`toSatoshi(value) = value × 100_000_000`

---

## 14. APIs

### Minting

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/directMintingInfo/:fasset` | `IDirectMintingInfo` |
| GET | `/mintingRecipient/:fasset/:tagId` | `IMintingRecipient` |
| GET | `/mint/:txHash` | `IMintStatus` |
| GET | `/mintEnabled` | `IMintEnabled[]` |
| GET | `/estimateFee/:fasset/:amount` | BTC fee estimate |
| GET | `/getUtxosForTransaction/:fasset/:xpub/:amount` | `IUtxoForTransaction` |
| POST | `/mint` | (no response, starts monitoring) |

### Redemption

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/redemptionFee/:fasset` | `IRedemptionFee` |
| GET | `/redemptionStatus/:fasset/:txHash` | `IRedemptionStatus` |
| GET | `/redemptionQueue/:fasset` | `IRedemptionQueue` |
| GET | `/redemptionDefaultStatus/:txHash` | `IRedemptionDefaultStatus` |
| POST | `/requestRedemptionDefault/:fasset/:txHash/:amount/:address` | — |

### Pools

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/pools` | `IPool[]` |
| GET | `/pools/:address` | user's pools |
| GET | `/pools/:fasset/:poolAddress` | `IPool` |
| GET | `/maxPoolWith/:fasset/:poolAddress` | `IMaxCptWithdraw` |
| GET | `/maxWithdraw/:fasset/:pool/:user/:value` | `IMaxWithdraw` |

### Tags

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/tags/:fasset/:address` | `ITagsByAddress[]` |
| GET | `/tag/:fasset/:tagId` | tag details |
| GET | `/tagReservationFee/:fasset` | NAT fee amount |
| POST | `/reserveMintingTag` | — |
| POST | `/editTag` | — |
| POST | `/editExecutor` | — |
| POST | `/transferTag` | — |

### Bridge

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/bridge/message/:txHash` | `IMessage` |
| GET | `/oft/fullHistory/:address?xrpAddress=` | `(IOFTHistory \| IUserProgress)[]` |
| GET | `/oft/redemptionFees/:srcEid` | `IOFTRedemptionFees` |
| GET | `/oft/redeemerAccount/:redeemer` | `IRedeemerAccount` |

### Dashboard & User

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/ecosystemInfo` | `IEcosystemInfo` |
| GET | `/timeData/:period` | `ITimeData` |
| GET | `/balance/:address` | native balances |
| GET | `/userProgress/:address` | `IUserProgress[]` |
| GET | `/rewards/:address` | `IReward` |
| GET | `/executor/:fasset` | `IExecutor` |
| GET | `/assetManagerAddress/:fasset` | `{ address }` |
| GET | `/fassetState` | which FAssets enabled |
| GET | `/fassetPrice/:fasset` | `IFassetPrice` |
| GET | `/trailingFee` | trailing fee rate |

---

## 15. ABI Errors

| Selector | Error |
|----------|-------|
| `0x59ed140d` | `CannotMintZeroLots` |
| `0xeb560756` | `MintingPaused` |
| `0xb561932a` | `AmountOfNatTooLow` |
| `0xdea97f50` | `AmountOfCollateralTooLow` |
| `0x083b70a9` | `DepositResultsInZeroTokens` |
| `0xd9ebc7e5` | `TokenShareIsZero` |
| `0xf132b8f9` | `FAssetAllowanceTooSmall` |

Other key errors: `NotEnoughFreeCollateral`, `EmergencyPauseActive`, `RedemptionRequiresClosingTooManyTickets`, `CollateralRatioFallsBelowExitCR`, `InappropriateFeeAmount`, `AgentNotInMintQueue`

Error handling pattern in `useContracts.ts`:
```ts
if (errorCode in ABI_ERRORS) throw new Error(t('errors.abi_custom_error_label', { error: ABI_ERRORS[errorCode] }))
if (error.code === 4001) → user rejected
if (error.cause === "ledger") → Ledger-specific notification
default → error?.response?.data?.message ?? error.message
```

`handleErrors` (`useContracts.ts`), used by every contract mutation, rethrows a translated `Error`:
ABI custom error → `errors.abi_custom_error_label`; `isWalletRequestBlocked(error)` (`@/utils`: EIP-1193 `4100`
with "spam filter" in the message — MetaMask blocks the site after several rejections in a row) →
`notifications.request_blocked_by_wallet_label`; any other "could not coalesce error" → `errors.try_reconnecting_label`;
`CALL_EXCEPTION` without `data` and without `receipt` ("missing revert data" — RPC down or a revert with no reason,
indistinguishable) and ethers `NETWORK_ERROR` / `TIMEOUT` / `SERVER_ERROR` (RPC unreachable, timed out, HTTP 5xx / 429)
→ `errors.network_unavailable_label`. A mined tx that reverted has a `receipt` and keeps its own error.
Checks on the wallet error itself (`error.error`, `error.code`) belong there — the components only see the rethrown `Error`.

---

## 16. Environment Variables

| Variable | Purpose |
|----------|---------|
| `NETWORK` | `"mainnet"` or `"testnet"` |
| `MAINNET_CHAIN` | `"FLR"` or `"SGB"` |
| `TESTNET_CHAIN` | `"C2FLR"` or `"CFLR"` |
| `ENABLED_UNDERLYING_FASSETS` | Comma-separated FAsset types |
| `ENABLED_WALLETS` | Comma-separated wallet IDs |
| `API_URL` | Backend API base URL |
| `WALLETCONNECT_PROJECT_ID` | WC v2 project ID |
| `XAMAN_API_KEY` | Xaman API key |
| `XPUB_SECRET` | AES key for Ledger xpub |
| `FREE_CPT_XRP/BTC/DOGE_CONTRACT_ADDRESS` | Free CPT contracts — unused since 2026-09 (still in `.env.example`) |
| `BRIDGE_FXRP_ADDRESS` | FAsset ERC-20 on Flare |
| `BRIDGE_FXRP_OFT_ADAPTER_ADDRESS` | OFT Adapter on Flare |
| `BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS` | OFT token on HyperEVM |
| `HYPERLIQUID_COMPOSER_ADDRESS` | HyperEVM composer |
| `FXRP_COMPOSER_ADDRESS` | Flare composer |
| `WIND_DOWN_DATE` | If set, shows wind-down banner |
| `INCENTIVES_MODAL` | `"true"/"false"` |

---

## 17. React Query Keys

| File | Export | Keys |
|------|--------|------|
| `api/minting.ts` | `MINTING_KEY` | `maxLots`, `crEvent`, `mintingStatus`, `estimateFee`, `ecosystemInfo`, `crStatus`, `returnAddresses`, `mintEnabled`, `directMintingInfo`, `mintingRecipient` |
| `api/redemption.ts` | `REDEMPTION_KEY` | `redemptionFee`, `redemptionStatus`, `requestRedemptionDefaultStatus`, `trailingFee`, `redemptionFeeData` |
| `api/pool.ts` | `POOL_KEY` | `pools`, `userPools`, `maxCptWithdraw`, `maxWithdraw`, `userPool`, `pool` |
| `api/balance.ts` | `BALANCE_KEY` | `underlyingBalance`, `underlyingBalances`, `nativeBalance`, `poolsBalance`, `xpub` |
| `api/user.ts` | `USER_KEY` | `allAgents`, `assetManagerAddress`, `executor`, `userProgress`, `lifetimeClaimed`, `timeData`, `fassetState`, `fassetPrice`, `underlyingStatus` |
| `api/bridge.ts` | `BRIDGE_KEY` | `message`, `walletMessages`, `balance` |
| `api/oft.ts` | `OFT_KEY` | `fullHistory`, `redemptionFees`, `redeemerAccount` |
| `api/rewards.ts` | `REWARDS_KEY` | `rewards` |

`BALANCE_FETCH_INTERVAL = 45000` ms (balance cards) · `LATEST_TRANSACTIONS_REFRESH_INTERVAL = 30000` ms (transactions card only)

**`refetchOnWindowFocus: true`** is enabled on `useUnderlyingBalance`, `useNativeBalance`, `usePoolsBalance`, `useUserPools`, `useUserPool`. Users returning to the tab see fresh balances/pool data immediately instead of waiting for the next poll tick.

---

## 18. Code Patterns

### Conditional Object Spread (XRPL tx params)

```ts
{
  TransactionType: 'Payment',
  Account: userAddress,
  Amount: amount,
  Destination: destination,
  ...(paymentReference ? { Memos: [{ Memo: { MemoData: paymentReference.substring(2) } }] } : {}),
  ...(destinationTag ? { DestinationTag: Number(destinationTag) } : {}),
  ...(lastUnderlyingBlock ? { LastLedgerSequence: Number(lastUnderlyingBlock) } : {}),
}
```

Used because `Memos`, `DestinationTag`, `LastLedgerSequence` are optional per flow.

### Dev Logging (`devLog`)

Use `devLog` instead of `console.log` everywhere in the codebase. It only logs in `development` mode (`NODE_ENV === 'development'`) — silent in production.

```ts
import { devLog } from '@/utils/debug';

devLog('[CONTEXT] label:', { key: value });
```

Convention for log prefixes: `[MINT]`, `[REDEEM]`, `[BRIDGE]`, `[TAGS]` — helps filter in DevTools console.

**Never use bare `console.log`** — always `devLog`.

### Form Pattern

```ts
const form = useForm({ initialValues, validate: yupResolver(schema) })
// forwardRef + useImperativeHandle with FormRef
export type FormRef = { form: () => UseFormReturnType<any> }
```

### Contract Mutations

All contract calls via `useMutation` in `useContracts.ts`.

### Rewards Distribution Constants

```ts
DISTRIBUTION_START = '2024-12-16 00:00'
DISTRIBUTION_CYCLE_DAYS = 14
DISTRIBUTION_CYCLES_COUNT = 1000
```

### Alert Components

Two reusable components for user-facing alerts:

**`FormAlert`** — inline form alert with icon, type-aware styling. Renders nothing if `message` is undefined.

```tsx
import FormAlert from '@/components/elements/FormAlert';

<FormAlert message={errorMessage} type="error" />    // red
<FormAlert message={warningMessage} type="warning" /> // orange
<FormAlert message={infoMessage} type="info" />       // blue
<FormAlert message={undefined} />                     // renders nothing
```

Props: `message: string | undefined`, `type?: "error" | "warning" | "info"` (default: `"error"`), `className?: string`

**`AlertBox`** — block alert with title + children, for longer explanations in modals.

```tsx
import AlertBox from '@/components/elements/AlertBox';

<AlertBox title="Warning" type="info">
  <Text>Detailed explanation here</Text>
</AlertBox>
```

Props: `title: string`, `type?: "info" | "error"` (default: `"info"`, orange), `children: React.ReactNode`, `className?: string`

Both components live in `src/components/elements/`.

### Buttons (`FAssetButton`)

`components/elements/FAssetButton.tsx` — Mantine `Button` with the look per variant; replaces the
hand-set `variant` / `color` / `radius` / `size` / `fw` on every CTA (same API as the Smart
Accounts `Button`).

| `variant` | Look | Used for |
|---|---|---|
| `primary` (default) | black filled pill, `size="sm"`, `radius="xl"`, `fw={400}` | Bridge CTA, Next, OK, Confirm |
| `secondary` | small outline pill (Mantine `gradient`), `size="xs"`, `radius="xl"`, `fw={400}` | Mint, Redeem, Refresh, Recover, Transfer, table actions |

```tsx
import FAssetButton from '@/components/elements/FAssetButton';

<FAssetButton fullWidth loading={isSubmitting} onClick={submit}>Bridge</FAssetButton>
<FAssetButton variant="secondary" onClick={refetch}>Refresh</FAssetButton>
<FAssetButton component={Link} href="/mint" size="lg">Mint</FAssetButton>   // any Button prop overrides the variant
```

Polymorphic (`createPolymorphicComponent` + `forwardRef`): with `component={Link}` / `"a"` it
takes that element's props (`href` required, `target`, …), and the `ref` reaches the DOM button
(Mantine `Tooltip` / `Popover` need it). Not covered yet (plain Mantine `Button`): outline pairs
(`HighMintingFeeModal`, `FAssetWindDownModal`, `EarnCard`, `TimeToRedeemCard` pink link), text /
transparent buttons (Max, Back, pagination) and the header buttons — see TODO #44.

### Form Alert Channels (`useFormAlerts` + `resolveAlert`)

Modals with several error sources (stepper, balance check, form validation…) keep each in its own named **channel** instead of one shared `errorMessage` state. One alert is shown at a time, picked by priority.

```tsx
import { useFormAlerts } from "@/hooks/useFormAlerts";
import { resolveAlert } from "@/core/alerts";

const { set, get, clear, clearAll, setOrClear } =
    useFormAlerts<"stepper" | "balance" | "highFee" | "form">();

set("balance", { msg: t("..."), type: "warning" });
setOrClear("form", maybeMessage);          // sets if truthy, clears otherwise
clearAll();                                // on modal close (modals are keepMounted)

const activeAlert = resolveAlert([         // array order = priority
    get("stepper"), get("balance"), get("highFee"), get("form"),
]);
<FormAlert message={activeAlert?.msg} type={activeAlert?.type} />
```

- `IAlertMessage = { msg: string; type?: "error" | "warning" | "info" }` (from `FormAlert.tsx`)
- A channel is cleared by whoever owns it — e.g. the balance channel clears on a successful refetch, the XRPL form clears its channel when the destination address changes
- Used in: `MintModal`, `DepositToPoolModal`, `WithdrawalFromPoolModal`, `ClaimRewardsFromPoolModal`. Other modals still use a local `errorMessage` state + `FormAlert`

### Modal Async Guard (`useModalGuard`)

**Problem:** async callbacks (contract calls, polling intervals) don't know when the modal has been closed. Without guarding, state updates fire on a closed modal → React warnings, stale UI on next open.

**Solution:** `useModalGuard(opened)` in `src/hooks/useModalGuard.ts` creates an `AbortController` tied to the modal's `opened` state. When the modal closes, the controller aborts. Async functions check this via `assertOpen()`.

```ts
const { run, cancel } = useModalGuard(opened);
```

**`run(fn)`** — wraps the entire async operation. Passes `assertOpen` as a parameter to the callback; captures the session controller at call time so the check is always tied to the correct session. `AbortError` from `assertOpen()` is swallowed silently; real errors are re-thrown to `.catch()`:

```ts
const handleRequest = async () => {
    isRequestActive.current = true;
    setCurrentStep(STEP_CONFIRM);

    await run(async (assertOpen) => {
        await mutation.mutateAsync({...});
        assertOpen();           // throws if modal closed during the above await
        setIsTransactionDone(true);
        await new Promise(r => setTimeout(r, 1000));
        assertOpen();
        setCurrentStep(STEP_SUCCESS);
    }).catch((error: any) => {
        setErrorMessage(error.message);
        setCurrentStep(STEP_FORM);
    });

    isRequestActive.current = false; // always runs: success, error, or abort
};
```

**`cancel()`** — call in the modal's `useEffect` cleanup (when `!opened`) to immediately abort the current session:

```ts
useEffect(() => {
    if (!opened) {
        cancel();
        isRequestActive.current = false;
        setCurrentStep(STEP_FORM);
    }
}, [cancel, opened]);
```

**Rules:**
- Place globally-relevant side effects (cookies, query invalidation, toasts) **before** `assertOpen()` — they run regardless of modal state
- `isRequestActive.current = false` goes **after** `await run(...)` — never in a `finally` block, because `run()` always resolves
- For interval callbacks (`useInterval`), wrap with `run` and call `assertOpen()` after the `await`:
  ```ts
  useInterval(() => run(async (assertOpen) => {
      const response = await someQuery.refetch();
      assertOpen();
      if (response.data?.status === 'SUCCESS') { ... }
  }), INTERVAL_MS);
  ```
- `isAbortError(e)` is exported for nested `try/catch` blocks where an inner catch would otherwise swallow the `AbortError`:
  ```ts
  await run(async (assertOpen) => {
      try {
          const r = await apiClient.get(...);
          assertOpen();
          setData(r.data);
      } catch (e) {
          if (isAbortError(e)) throw e; // re-throw so outer run() catches it
          // otherwise non-critical, swallow
      }
  });
  ```

---

*For product decisions, edge cases, and roadmap context: see `docs/PRODUCT_OWNER.md`*
