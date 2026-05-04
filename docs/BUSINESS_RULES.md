---
doc_version: "1.5"
app_version: "v1.3"
last_updated: "2026-04-28"
---

# FAsset User UI — Business Rules & Edge Cases

> This document captures things discovered along the way — edge cases, constraints, decisions and why.
> It is not a technical spec (that's `DEV_SPEC.md`) and not a domain glossary (that's `dev-docs/DOMAIN.md`).
> Format: short rule + why + where in code.

---

## Minting

### Mint destination: tag vs memo encoding

For XRPL direct minting the user has two ways to specify the destination:

1. **Address mode** — user manually enters an XRPL address
2. **Tag mode** — user enters a tag number, the system resolves the address via the API

Priority for how the transaction is sent (in `ConfirmStepper`):
1. **Tag mode** → sends `DestinationTag` (= user-entered tag)
2. **Address mode + addressTag** → sends `DestinationTag` (= auto-fetched tag for the default address at modal open)
3. **Address mode without tag** → encodes the address as `paymentReference` (direct minting memo)

`addressTag` is auto-fetched only once at modal open for `mainToken.address`. If the user types a different address in address mode, `addressTag` is cleared → fallback to memo encoding. The tag is not re-fetched while typing.

**Why:** re-fetching the tag on every keystroke would be unnecessary network overhead; memo encoding is a safe fallback for addresses without a registered tag.

**Code:** `src/components/mint/ConfirmStepper.tsx` (selection logic), `src/components/forms/MintForm.tsx` (tag fetch + watch), `src/components/forms/MintDestinationEditor.tsx` (UI)

### addressTag must be filtered by mintingRecipient

`addressTag` (auto-fetched XRPL destination tag) may only be displayed or used **for the address it was fetched for** — i.e. the `mintingRecipient` that was active at fetch time.

If the user types a different address in address mode, `addressTag` is immediately cleared (`undefined`). This prevents incorrect tag display (a tag from the old address showing next to a new address) and incorrect transaction encoding (the old tag being sent for a different address).

**Why:** `addressTag` is bound to a specific XRPL address — another address's tag is invalid and potentially dangerous (funds would go to the wrong account at the provider). Clearing on address change is the only safe approach.

**Code:** `src/components/forms/MintForm.tsx` (watch on `mintingRecipient`, clear `addressTag` on change)

### Xaman wallet adds its own fee tiers on top of the XRP amount

When the connected wallet is Xaman, the form must account for Xaman's service fee before validating whether the user has sufficient balance. The fee is calculated in USD based on the total transaction value:

| Total transaction USD | Xaman fee |
|-----------------------|-----------|
| ≤ $50,000             | 0%        |
| $50,001 – $100,000    | 0.1%      |
| > $100,000            | 0.07%     |

The fee is converted back to XRP using the current FAsset price and added to `totalSend` before the balance check. If `totalXrp > balance - minWalletBalance`, the form is disabled with an insufficient balance error.

**Why:** Xaman charges a transaction fee at the wallet layer that the smart contract knows nothing about. Ignoring it causes transactions to fail after signing.

**Code:** `src/components/forms/MintForm.tsx` (`checkXamanBalance`, triggered after every transfer amount change when wallet is Xaman)

### High minting fee warning threshold is 2%

If the computed minting fee exceeds **2% of the transfer amount**, the form notifies the parent component via `setHighMintingFee(fee, transfer)` so a warning can be displayed to the user.

```ts
const MINTING_FEE_LIMIT = 2; // percent
const isMintingFeeHigh = mintFeePercentage > MINTING_FEE_LIMIT;
```

The warning is purely informational — it does not block submission.

**Why:** When the transfer is close to the minimum amount, the flat `minimumMintingFee` dominates and the effective fee rate can spike. Users need to be aware before confirming.

**Code:** `src/components/forms/MintForm.tsx` (`MINTING_FEE_LIMIT`, `isMintingFeeHigh`, `setHighMintingFee` call in useEffect)

### Mint cap reached disables the form entirely

When `mintingCapInfo` indicates `mintingCap !== "0"` and `totalSupply >= mintingCap`, the form treats this as a soft block:

- `maxAmount` is set to `0`
- An info-type alert is shown (`type: 'info'`)
- `isFormDisabled(true)` is called
- `hasMintCapError.current` is set to prevent the error from being cleared by other state changes

**Why:** The protocol enforces a global minting cap. Attempting to mint above it would revert on-chain. The UI blocks early to avoid a bad UX.

**Code:** `src/components/forms/MintForm.tsx` (`isMintCapReached`, `hasMintCapError` ref, useEffect for `mintingCapInfo`)

### minMintingAmount is temporarily hardcoded to 10 XRP

`minMintingAmount = 10` is hardcoded. The backend does not yet return this value in the `directMintingInfo` response.

```ts
// TODO: use API value once backend returns minMintingAmount
const minMintingAmount = 10;
```

**Why:** Prevents dust transactions that would be consumed entirely by fees.

**Code:** `src/components/forms/MintForm.tsx` (line ~253)

---

## Redemption

### depositAuth check is scoped to the entered destination address

`depositAuth: true` on an XRPL account blocks incoming payments. The UI checks this flag **only for the address the user has typed** in the destination field — not globally.

When the user changes the destination address, the check re-runs for the new address. An address with `depositAuth` gets an error; the user cannot submit until they provide a different address.

**Why:** Blocking redemption based on any unrelated address would be incorrect. The check must be specific to where the XRP is actually going.

**Code:** `src/components/redeem/RedeemModal.tsx` (`isDepositAuthBlocking`), `src/components/forms/RedeemForm.tsx` (`onDestinationAddressChange`)

### requireDestTag blocks redemption when no tag is provided

If the destination XRPL account has `requireDestTag: true`, the user **must** provide a destination tag. Without it the redemption is blocked (same hard block as `depositAuth`).

```ts
const isRequireDestTagBlocking =
    !!underlyingBalance.data?.accountInfo?.requireDestTag &&
    String(destinationTag ?? '').trim() === '';
```

Both `isDepositAuthBlocking` and `isRequireDestTagBlocking` feed into `isNextButtonDisabled`.

**Why:** XRP payments to accounts with `requireDestTag` are rejected by the XRPL network if no tag is present. The agent would be unable to complete the redemption.

**Code:** `src/components/modals/RedeemModal.tsx` (`isRequireDestTagBlocking`, line ~108)

### Partial redemption: redeemed amount is calculated from the remaining

When the redemption API response has `incomplete: true`, the UI does not show `requestedAmount` as the result. Instead it computes the actual redeemed amount:

```ts
// if remainingAmountUBA is present (redeemAmount / redeemWithTag flows):
redeemedAmount = totalAmount - parseUBA(remainingAmountUBA)

// if remainingLots is present (redeem lots flow):
redeemedAmount = totalAmount - remainingLots * lotSize
```

The completion modal shows the actual redeemed amount and the partial redemption context.

**Why:** The redemption queue has a per-transaction ticket limit (`maxRedeemedTickets`). Large requests may only partially fill. The user needs to see what they actually received.

**Code:** `src/components/modals/RedeemModal.tsx` (`calculateRedeemedAmount`, lines ~119–140)

---

## Bridge (LayerZero / XRPL)

### BridgeXrplForm enforces queue total max cap as UI limit

When bridging to XRPL, the user's input amount is capped to:

```ts
effectiveMax = Math.min(affordableBalance, redemptionQueue.data.maxAmountXRP)
```

`maxAmountXRP` is the **total redeemable amount** across all queue tickets (not per-transaction). If the queue is nearly empty, this naturally limits how much can be bridged.

**Why:** Exceeding the queue total causes an on-chain revert. Capping in the UI avoids the failure entirely.

**Code:** `src/components/forms/BridgeXrplForm.tsx` (`queueMaxAmount`, `effectiveMax`, lines ~128–135)

### Composer fee uses PPM and affects affordable balance calculation

The bridge uses a LayerZero composer fee expressed in **parts-per-million (PPM)**. Because the user enters the **net amount** (what they want to receive), the gross amount sent must be inflated to cover the composer's cut:

```ts
// User enters net; gross covers the composer fee
totalToBridge = (amount * 1_000_000) / (1_000_000 - composerFeePPM)

// Affordable balance is the max net amount the user can enter given their balance
affordableBalance = balance * (1_000_000 - composerFeePPM) / 1_000_000
```

**Why:** The composer fee is deducted from the bridged amount on the destination side. If the user entered gross amount, the fee deduction would leave them with less than expected.

**Code:** `src/components/forms/BridgeXrplForm.tsx` (`calcTotalToBridge`, `calcAffordableBalance`, `PPM_DENOMINATOR`)

### MIN_BRIDGE_AMOUNT is temporarily hardcoded to 5 XRP

```ts
// TODO: replace with redemptionFee.data.minimumRedeemAmountUBA once confirmed by backend
const MIN_BRIDGE_AMOUNT = 5;
```

**Why:** Prevents dust bridge transactions. The actual minimum will come from `minimumRedeemAmountUBA` once the backend confirms the correct value.

**Code:** `src/components/forms/BridgeXrplForm.tsx` (line ~164)

---

## Smart Accounts

Smart account logic is handled entirely on-chain via `SmartAccountManager`. There is no dedicated UI flow for smart accounts in the current version. The ABI is present (`_smartAccountManager` in `src/abi.ts`) but no frontend component addresses smart account state directly.

---

## Collateral Pools

### Pools are split into active and other, both sorted by health

The pools page divides all pools into two lists:

- **Active pools** — pools where the user has any position:
  - `userPoolBalance !== 0`, OR
  - `userPoolNatBalance !== 0`, OR
  - `userPoolFees >= 0.01`
- **Other pools** — all remaining pools

Both lists are sorted by `['health', 'status']` ascending health, descending status. Lower health score = better collateral ratio = shown first.

**Why:** Users with existing positions need to see their pools prominently. Sorting by health puts the healthiest (safest) pools at the top of each list.

**Code:** `src/pages/pools/index.tsx` (`setPools`, lines ~86–105)

---

## Fees & Amounts

### Direct minting fee model

The system fee is percentage-based with a minimum floor. Because the fee is deducted from the total sent (not added on top), solving for the fee when the percentage case applies:

```
systemFee = max(totalSend × feeRate, minimumMintingFee)

When percentage case applies (systemFee = totalSend × feeRate):
  totalSend = transfer + systemFee + executorFee
  systemFee = (transfer + executorFee) × feeRate / (1 - feeRate)

When flat-fee case applies (systemFee = minimumMintingFee):
  totalSend = transfer + minimumMintingFee + executorFee
```

The threshold between cases: `transfer_threshold = minimumMintingFee / feeRate`. Below it the flat fee dominates.

**Code:** `src/components/forms/MintForm.tsx` (`percentageMintingFee`, `mintingFee`, `totalSend`, comments at lines ~257–275)

### Bridge total fee = composer fee + redemption fee

```ts
totalToBridge = calcTotalToBridge(amount, composerFeePPM)   // inflated gross
receivedAmount = totalToBridge * (1 - redemptionFeeBips / 10_000)
totalFeeAmount = totalToBridge - receivedAmount
```

The user sees `amount` (net) going in and `receivedAmount` coming out. The difference is the combined fee.

**Code:** `src/components/forms/BridgeXrplForm.tsx` (`calcRedeemingFee`, `totalFeeAmount`, lines ~157–161)

---

## XRPL Specifics

### XRPL account flags are checked before allowing redemption or bridge

Before the user can submit a redemption or bridge-to-XRPL, the UI fetches account info for the destination address and checks two flags:

| Flag | Effect |
|------|--------|
| `depositAuth: true` | Blocks the operation entirely — address rejects incoming payments |
| `requireDestTag: true` | Blocks the operation if no destination tag is provided |

Both checks are re-evaluated when the destination address changes.

**Code:** `src/components/modals/RedeemModal.tsx` (`isDepositAuthBlocking`, `isRequireDestTagBlocking`)

### Only XRPL classic addresses are accepted

The bridge and redemption forms validate destination addresses using `isValidClassicAddress` from the `xrpl` library. X-addresses and other formats are rejected.

**Code:** `src/components/forms/BridgeXrplForm.tsx` (schema validation), `src/components/forms/RedeemForm.tsx`

---

## General / UI

### Wind-down modal is suppressed per-FAsset via a 365-day cookie

When the protocol enters wind-down mode, a modal is shown once per FAsset. After the user closes it, a cookie (`COOKIE_WINDDOWN`) stores `{ [fAsset]: true }` for 365 days to prevent the modal from showing again for that FAsset.

If the user's balance for an FAsset is below `lotSize`, `cantRedeem` is set and the modal shows a "partial lots" variant — the user is informed they cannot redeem and no action button is shown.

**Why:** The modal is informational. Showing it repeatedly would be disruptive. Sub-lot balances cannot be redeemed through the normal flow and need a distinct message.

**Code:** `src/components/modals/FAssetWindDownModal.tsx` (`cantRedeem`, `closeModal`, `COOKIE_WINDDOWN`)
