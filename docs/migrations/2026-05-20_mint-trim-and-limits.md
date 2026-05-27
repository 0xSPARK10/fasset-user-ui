---
date: 2026-05-20
type: api-patch
breaking: true
---

# API Patches — Mint Trim, Limits, TVL Graph, Monarq

## Changed Endpoints

### POST `/api/mint` — reduced to wallet registration

`requestMinting` now only upserts wallet records and returns. The CR-event lookup, duplicate-minting guard, and `UnderlyingPayment` persistence have been removed. The `RequestMint` request body has been shrunk to only the fields the trimmed handler reads.

**New request body (`RequestMint`):**

```json
{
    "userUnderlyingAddress": "rajgVNW9b4H4ifvB1238kfgsSJYesXwwtv",
    "userAddress": "0x0048508b510502555ED47E98dE98Dd6426dDd0C4",
    "underlyingWalletId": "<WalletType enum>",
    "nativeWalletId": "<WalletType enum>"
}
```

**Removed fields** (no longer accepted/used): `fasset`, `collateralReservationId`, `txhash`, `paymentAddress`, `amount`, `nativeHash`, `vaultAddress`.

**Behavior:**

- If `underlyingWalletId` is set and `userUnderlyingAddress` validates, an XRP Wallet is created when none already exists.
- If `nativeWalletId` is set and `userAddress` validates, an EVM Wallet is created when none already exists.
- No other side effects. Response remains `204 No Content` (void).

**Komentar:** Zdej ko user pošlje XRP tx za direct mint kličeš ta endpoint samo z podatki o walletih. Sami IDji itd so ostali isti kot prej.

---

### GET `/api/ecosystemInfo` — added `limits`

`EcosystemData` now carries a `limits` object that exposes the direct-minting throttle state read from the default (FXRP) AssetManager contract on every pool-refresh cycle. Existing fields are unchanged.

**New field:**

```json
{
    "limits": {
        "hourlyLimitDrops": "1000000000",
        "hourlyMintedDrops": "250000000",
        "dailyLimitDrops": "20000000000",
        "dailyMintedDrops": "4500000000",
        "decimals": 6
    }
}
```

- `hourlyLimitDrops` / `dailyLimitDrops` — cap for the current window, in drops (256-bit, string).
- `hourlyMintedDrops` / `dailyMintedDrops` — amount already minted within the current window, in drops (string).
- `decimals` — FXRP fasset decimals, included so the FE can render drop amounts without a second lookup.

Torej `MintedDrops` podatek pove koliko je namintano trenutno, `Limit` pa koliko lahko v tistem oknu.

If the asset manager call fails (e.g. older deployment without the limiter), the four limit fields fall back to `"0"` and `decimals` to `0`.

---

### GET `/api/timeData/:time` — added `tvlGraph`

`TimeData` now includes a `tvlGraph` array, sibling of `mintGraph` / `redeemGraph`.

**New field:**

```json
{
    "tvlGraph": [
        {
            "timestamp": 1779117659,
            "value": "770.616"
        },
        {
            "timestamp": 1779123830,
            "value": "459.342"
        }
    ]
}
```

Return value je formatiran isto kot pri `mintGraph` / `redeemGraph` torej je že v dolarjih itd. Povečano je tudi število podatkovnih točk, ki jih vrne — to lahko še prilagajamo kasneje.

---

### GET `/api/earn` — added `monarq`

Nov vnos v response:

```json
{
    "monarq": {
        "type": "vault",
        "pairs": [
            "fxrp"
        ],
        "coin_type": "assets",
        "url": "https://app.upshift.finance/pools/14/0x2439D4bb753A0f3777d4C9011AFacc475ba6B951",
        "yt_url": "",
        "description": "Stake FXRP"
    }
}
```
