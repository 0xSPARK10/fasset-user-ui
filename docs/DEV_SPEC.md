---
doc_version: "1.6"
app_version: "v1.3"
last_updated: "2026-04-24"
---

# FAsset User UI — Developer Specification

> Single source of truth for developers and AI tools implementing features.
> Covers: domain concepts, data types, flows, APIs, fees, wallets, code patterns.
> For product/roadmap context see `docs/PRODUCT.md`.

**Version:** 1.1 — 2026-04-13 (updated: agent-backed minting removed, direct minting is the only path)

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
- Checked in `MintForm.checkXamanBalance()` — deducted from available balance before validation
- Mobile: deep link opens app; shows manual "Confirm" button in UI

---

## 5. Minting Flow

> **v1.3:** Only direct minting (Core Vault) is supported. Agent-backed minting is removed from the UI. See `docs/migrations/MIGRATION_v1.3.md` for the full contract-level diff.

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

Per spec (MIGRATION_v1.3.md §3.1): tag is the **recommended** approach when user has a registered tag.

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

### XRPL Destination Checks

Before submitting redemption:
- `depositAuth: true` → blocked, cannot receive payment
- `requireDestTag: true` → user must provide destination tag

`depositAuth` check is scoped to the user-entered destination address, not global. The check runs dynamically when the user changes the destination address field.

---

## 7. Bridge (LayerZero OFT)

### BRIDGE_TYPE

```ts
BRIDGE_TYPE = {
  HYPER_EVM: 'hyper_evm',   // Flare → HyperEVM wallet
  HYPER_CORE: 'hyper_core', // Flare → Hyperliquid Core spot account
  FLARE: 'flare',           // HyperEVM → Flare
  XRPL: 'xrpl',            // HyperEVM → XRPL (bridge + redeem)
}
```

### Direction & Config

| Type | Source | Needs approve | Fee token | Ledger app |
|------|--------|--------------|-----------|-----------|
| `HYPER_EVM` | Flare | Yes | FLR/C2FLR | mainToken |
| `HYPER_CORE` | Flare | Yes | FLR/C2FLR | mainToken |
| `FLARE` | HyperEVM | No | HYPE | bridgeToken |
| `XRPL` | HyperEVM | No | HYPE | bridgeToken |

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

### Compose Messages

```ts
// HYPER_CORE:
abi.encode(['uint256', 'address'], ['0', signerAddress])

// XRPL:
abi.encode(['address', 'string'], [signerAddress, xrplDestinationAddress])
```

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
| `BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS` | OFT token on HyperEVM |
| `HYPERLIQUID_COMPOSER_ADDRESS` | Composer on HyperEVM (HYPER_CORE) |
| `FXRP_COMPOSER_ADDRESS` | Composer on Flare (XRPL) |

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

---

## 8. Collateral Pools

### Contract Calls

```ts
CollateralPool.enter({ value: amount })           // deposit native → receive CPT
CollateralPool.exit(tokenShare)                   // burn CPT → receive native
CollateralPool.withdrawFees(feeShare)             // claim FAsset fees
CollateralPool.payFAssetFeeDebt(amount)           // clear fee debt before exit
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

### Free CPT Program

`FREE_CPT_XRP/BTC/DOGE_CONTRACT_ADDRESS` — special CPT tokens for fee debt payment. Require `approve()` before `payFAssetFeeDebt`.

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
| GET | `/oft/userHistory/:address` | `IOFTHistory[]` |
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
| `FREE_CPT_XRP/BTC/DOGE_CONTRACT_ADDRESS` | Free CPT contracts |
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
| `api/bridge.ts` | `BRIDGE_KEY` | `message`, `balance` |
| `api/oft.ts` | `OFT_KEY` | `userHistory`, `redemptionFees`, `redeemerAccount` |
| `api/rewards.ts` | `REWARDS_KEY` | `rewards` |

`BALANCE_FETCH_INTERVAL = 90000` ms (balance cards) · `LATEST_TRANSACTIONS_REFRESH_INTERVAL = 45000` ms (transactions card only)

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

---

*For product decisions, edge cases, and roadmap context: see `docs/PRODUCT.md`*
*For v1.3 migration contracts/events: see `docs/migrations/MIGRATION_v1.3.md`*
