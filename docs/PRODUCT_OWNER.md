---
doc_version: "1.1"
app_version: "v1.3"
last_updated: "2026-04-24"
---

# FAsset User UI — Product Owner Reference

> Business-oriented reference for product owners and Claude. Covers what the system does, edge cases, open decisions, and known gaps.
> For technical implementation details see `docs/DEV_SPEC.md`.

---

## 1. What This App Does

FAsset User UI is a web application that gives users access to the FAsset protocol.

**Core concept:** Blockchains like XRP, Bitcoin, and Dogecoin have no smart contracts. The FAsset protocol solves this by "locking" real XRP/BTC/DOGE and issuing a corresponding ERC-20 token on the Flare network (FXRP, FBTC, FDOGE). These tokens can then be used in Flare's DeFi ecosystem. When you no longer need them, you redeem them back for the underlying asset.

**Target audiences:**
- XRP/BTC/DOGE holders who want DeFi access
- Investors who want to earn by providing collateral (collateral pools)
- Advanced users who want to automate minting (tags)

**Networks:** Flare (mainnet), Songbird (mainnet), Coston / Coston2 (testnet)

**Features at a glance:**
- **Minting** — send XRP → receive FXRP on your Flare wallet
- **Redeem** — burn FXRP → receive XRP back to your native wallet
- **Bridge** — move FXRP between Flare and HyperEVM (Hyperliquid ecosystem)
- **Collateral Pools** — deposit FLR/SGB and earn a share of minting fees
- **Minting Tags** — register an XRP destination tag tied to your Flare address for automated minting
- **Dashboard** — overview of your assets, pool positions, transaction history, and protocol-wide metrics

---

## 2. Supported Wallets

| Wallet | Chains | Notes |
|--------|--------|-------|
| **MetaMask** | Flare / Songbird / Coston (EVM) | EVM only |
| **WalletConnect v2** | EVM + XRPL + BTC/DOGE | Multi-chain; most commonly used with Bifrost Wallet |
| **Ledger** | EVM + XRPL + BTC/DOGE | Hardware wallet; correct app must be open on the device |
| **Xaman** (XUMM) | XRPL | Mobile; charges an additional fee on large transactions |

**Why 4 wallets?** XRPL and BTC/DOGE are not EVM-compatible — MetaMask does not support them. Ledger and Xaman cover the gap for XRP; Ledger and WalletConnect cover BTC/DOGE.

---

## 3. Minting

### Flow

**Direct Minting (the only supported path since v1.3):**
1. Send XRP directly to the Core Vault address
2. No need to select an agent
3. The backend detects the payment, generates a cryptographic proof (FDC proof), and calls the smart contract
4. FXRP is issued to the destination (address or tag)

**Agent-backed Minting — removed in v1.3.** BTC and DOGE required this flow; neither is currently supported in the UI.

### Fees

When you send XRP for minting:

```
FXRP received = sent XRP − system fee − executor fee

System fee = max(amount × fee rate, minimum fee)
Executor fee = fixed amount (backend service that triggers minting)
```

Example — fee rate 1%, minimum fee 0.5 XRP, executor fee 0.3 XRP, sending 100 XRP:
- System fee = max(1.0, 0.5) = 1.0 XRP
- Total sent: 101.3 XRP
- Received: ~100 FXRP

### Max Mintable Amount

Not simply "your balance." The system accounts for:
- XRP reserve that must remain in the wallet (e.g. 3 XRP — XRPL account reserve)
- Executor fee that will be deducted
- System fee that scales with the amount

Formula: `effectiveMax = (balance − reserve − executor fee) / (1 + fee rate)`

### High Fee Warning

If the system fee exceeds 2% of the requested amount, the app shows a warning. The user must explicitly confirm before continuing.

**Open question:** Was the 2% threshold determined by product or engineering? (See section 9.)

### Destination: Address vs Tag

Two ways to specify where FXRP should land:

**Address:** Enter your Flare (EVM) address. It is encoded into the XRP transaction as a memo.

**Tag:** Enter a numeric XRP destination tag that has been previously registered. Useful for automation — the recipient does not need to be online.

**Important behavior — addressTag auto-fetch:**
The destination tag is fetched automatically once when the minting modal opens, using the user's currently connected wallet address. If the user types a different address in the destination field, the tag is cleared immediately. The tag must always match the address it was fetched for — using a mismatched tag would route funds incorrectly. The tag is never re-fetched on each keystroke; only on modal open for the connected address.

### Rate Limiting

When there is too much minting traffic, the system does not reject — it delays:
- Hourly limit exceeded → minting waits
- Daily limit exceeded → minting waits
- Single large minting → waits for a set duration

Once the delay expires, the backend triggers minting automatically. The user sees a "delayed" status in the waiting screen.

### Edge Cases

| Case | Behavior |
|------|----------|
| **Xaman fee on large transactions** | Xaman charges 0.1% for $50k–$100k value, or 0.07% for >$100k. This is a wallet-level fee, not a protocol fee. The app pre-deducts it from the available amount to avoid a signing error. Edge case: if the XRP price jumps between entry and signing, the actual amount may exceed the limit and Xaman will reject the transaction. |
| **Ledger: correct app must be open** | Before signing, the app checks that the right Ledger app is open — "XRP" for XRPL transactions, "Flare Network" for EVM. Wrong app → clear error message. |
| **BTC/DOGE minting not implemented** | Only XRP direct minting is available. BTC and DOGE require agent-backed flow which is not implemented in the current UI. |

---

## 4. Redemption

### Flow

1. Enter the amount of FXRP to redeem
2. Provide your XRP wallet address (where the XRP should land)
3. Sign the EVM transaction on Flare (burns FXRP)
4. An agent sends XRP within a defined time window
5. The app polls status every 15 seconds

### Agent Default

If the agent does not send XRP within the deadline → "default." The user then has two options:
- Receive compensation in vault collateral tokens
- Receive compensation from pool tokens

The app shows exactly what will be received and allows the user to claim it.

### Incomplete Redemption

The system has per-request limits on how much can be redeemed at once. If you request more:
- The system fulfills what it can
- The remainder is returned as FXRP
- The app shows "incomplete" status with the number of lots remaining

### XRPL Destination Checks

Before a redemption is submitted, the app validates the destination XRP address:
- The address must not have the `depositAuth` flag set (which would reject untrusted senders)
- If the address requires a `destinationTag`, the user must provide one

**Scope:** The `depositAuth` check is scoped to the address the user types — it is checked dynamically as the user enters or changes the destination address, not as a global check on form open. The app shows the appropriate error before the user can submit.

---

## 5. Bridge (LayerZero)

### Directions

| Direction | From → To | Purpose |
|-----------|-----------|---------|
| `hyper_evm` | Flare → HyperEVM wallet | Basic bridge, FXRP stays in wallet |
| `hyper_core` | Flare → Hyperliquid Core | Directly to trading account |
| `flare` | HyperEVM → Flare | Bridge back |
| `xrpl` | HyperEVM → XRPL | Bridge + redeem in one step, lands as real XRP |

### Fees

- **LayerZero fee:** Gas for the cross-chain message (paid in FLR or HYPE depending on direction)
- **Composer fee (PPM):** For `hyper_core` and `xrpl` directions — a fraction is deducted from the amount
- **Executor fee:** For `xrpl` direction — the backend service that executes the redeem at the destination

### Queue Max Cap

For the `xrpl` direction, the UI caps the input amount to `min(affordableBalance, queueMaxAmount)` where `queueMaxAmount` comes from `IRedemptionQueue.maxAmountXRP`. This prevents the user from submitting an amount that would exceed the redemption queue limit, which would otherwise cause a partial redemption and unexpected FXRP being returned.

### Restrictions

Bridge is only available for **FLR** and **C2FLR** networks (Flare mainnet and Coston2 testnet). It is disabled for SGB and CFLR.

---

## 6. Collateral Pools

### Why Do Pools Exist?

Agents must provide collateral to cover risk. Each agent has its own pool where external investors (pool participants) contribute FLR/SGB and earn a share of minting fees.

### Pool Health Score

Each pool has a health score from 0 to 100, based on its collateral ratio (CR):
- High CR → healthy → safe to invest, minting works normally
- Low CR → risky → minting may be blocked, exit may be blocked

### When You Cannot Exit a Pool

Exit is blocked when:
- The collateral ratio is below the `poolExitCR` threshold
- You have "fee debt" (your share of fees has not been settled)

For fee debt, there is the **Free CPT program** — special tokens that help participants settle their debt.

---

## 7. Minting Tags

### Why Tags?

Standard minting requires the user to be online and sign each transaction. Tags allow a one-time setup: anyone (or an automated system) can then send XRP to the Core Vault with your tag, and FXRP automatically lands in your account — no further action required.

**Example use case:** An exchange that wants to accept XRP deposits and convert them to FXRP without each user signing individually.

### Executor

When registering a tag, you can designate an "executor" — the address allowed to trigger minting:
- A specific address (only that address may execute)
- Zero address (anyone may execute — suitable for open systems)

The executor can be changed, but the change does not take effect immediately — there is a delay to prevent frontrunning.

### Reservation Fee

Registering a tag requires paying a reservation fee in NAT tokens. The tag is then yours.

### Current Workaround

The memo for tag-based direct minting is currently hardcoded in the UI. This is a temporary workaround waiting for a fix in the FDC verifier. Until then, tag-mode memo cannot be dynamically constructed per-tag.

---

## 8. Redemption Tag

### Why?

When redeeming FXRP back to XRP, some recipients (exchanges, custodians) require a destination tag on the incoming XRP payment to credit the correct account. Without a tag, the exchange cannot identify who sent the XRP.

### How It Works

The redeemer provides a destination tag when initiating redemption. The agent is then required to include that tag in the XRP payment they make on the underlying chain.

### Difference from Minting Tags

| | Minting Tag | Redemption Tag |
|---|---|---|
| **Flow** | XRP → FXRP (minting) | FXRP → XRP (redemption) |
| **Who sets it** | Tag owner (once, at registration) | Redeemer (each redemption) |
| **Purpose** | Route FXRP to correct Flare address | Route XRP to correct exchange account |
| **Setup** | One-time ERC-721 reservation | No setup — enter tag at redemption time |

### Availability

XRPL only. Not available on BTC/DOGE networks. UI must check `redeemWithTagSupported()` before showing the option.

---

## 10. Known Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| **Xaman fee tiers** | Xaman charges 0.1% ($50k–$100k) or 0.07% (>$100k) as a wallet-level fee. App pre-deducts it from available balance. If XRP price moves between entry and signing, Xaman may still reject the transaction. |
| **XRP account reserve** | Every XRPL account must maintain a minimum reserve (~3 XRP currently) that can never be spent. The app always subtracts this from the available minting amount. |
| **Ledger UTXO wallets (BTC/DOGE)** | For BTC/DOGE Ledger wallets, all UTXO addresses (receive + change) must be fetched before the actual balance is known. There is a brief loading state on first form open. |
| **Tag memo workaround** | The memo for tag-based direct minting is hardcoded. Waiting for FDC verifier fix. |
| **BTC testnet — 6 confirmations** | Bitcoin testnet requires 6 confirmations before minting continues. The app notifies the user during the wait. |
| **Incomplete redemption** | The system has per-request redemption limits. The excess is returned as FXRP. The app shows "incomplete" status with the remaining lot count. |
| **Minting delay (not rejection)** | When rate limits are hit, minting is not rejected — it is delayed. The backend resumes automatically when the delay expires. The user waits. |
| **Bridge: FLR/C2FLR only** | Bridge is disabled for SGB and CFLR networks. |
| **FXRP_HYPE ≠ FXRP** | On HyperEVM, FXRP is represented as an OFT token. It is not the same as FXRP on Flare — you cannot redeem it directly. You must bridge back to Flare first. |

---

## 11. Open Decisions

| Question | Status |
|----------|--------|
| Was the 2% high-fee warning threshold determined by product or engineering? | Open |
| Rate limiting: delays instead of rejections — protocol-level decision or our own? | Open |
| BTC/DOGE minting — is it planned? When? | Open |
| Bridge for SGB/CFLR — technical limitation or business decision? | Open |
| Bridge business rationale — partnership, user demand, or other? | Open |
| How often does incomplete redemption occur in practice? Is it a user pain point? | Open |
| Executor change delay — how long? Is it configurable? | Open |
| Tag reservation fee — how much? Can it be changed? | Open |
| Tag memo workaround — when will FDC verifier be fixed? | Open |
| Free CPT program — when was it introduced and why? | Open |

---

## 12. Not Yet Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| BTC/DOGE direct minting | Not implemented | Requires agent-backed flow |
| Minimum minting amount from API | Not implemented | Currently hardcoded to 10 lots; must come from API |
| Tag memo workaround | Active workaround | Waiting for FDC verifier fix |
| Countdown timer for delayed minting | Not implemented | App shows status text, not a countdown |

---

## 13. How the Protocol Works (Technical Context for PO)

**How the proof system works:** When you send XRP, the backend watches the XRPL network. When it detects the transaction, it requests a cryptographic proof from the FDC (Flare Data Connector) — an independent system that confirms the transaction actually happened on-chain. Only then is the smart contract called to issue FXRP. This is "trustless" — the system does not rely on trusting the backend alone; it trusts a mathematical proof.

**Why poll every 10 seconds?** XRPL needs ~3–5 seconds for confirmation. FDC proof generation can take up to a minute. Polling every 10 seconds is a compromise between UX responsiveness and server load.

**Why is minting only for XRP and not BTC/DOGE?** Direct minting requires a specific proof type (`IXRPPayment.Proof`) that is specific to XRPL. BTC and DOGE would require a different proof type and the agent-backed flow.

---

*For technical details (API endpoints, types, code, domain concepts): see `docs/DEV_SPEC.md`*
