---
doc_version: "1.9"
app_version: "v1.3"
last_updated: "2026-07-30"
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

### A tag is blocked when the asset manager does not support tag redemptions

On the XRPL bridge routes, entering a destination tag is blocked unless
`AssetManager.redeemWithTagSupported()` returns `true`. The block also applies while the query
is still pending, errored, or reverting — i.e. `data` being `undefined` blocks too.

```ts
if (isXrplRoute && String(destinationTag ?? '').trim() !== '' && !redeemWithTagSupported.data) {
    setErrorMessage(t('redeem_modal.form.destination_tag_not_supported_error'));
    return;
}
```

**Why:** older asset managers revert on `redeemWithTagSupported()`. Treating the unknown case
as "supported" would send the payment untagged, and on an account that requires a tag the XRP
would be lost. Failing closed is the only safe reading.

**Code:** `src/components/modals/BridgeModal.tsx` (lines ~208–218)

### Destination tag `0` is sent untagged — known limitation

The bridge compose message sets `redeemWithTag: tag !== 0`, so a tag of `0` collapses into
"no tag" and the XRP arrives without one. `parseDestinationTag` preserves `0` correctly, but
the encoder one layer down discards it, so the helper's stated purpose is not achieved.

The **direct redeem path does not share this limitation**: it passes the tag as a string and
tests `destinationTag ? … : …`, and `"0"` is truthy, so `0` goes out as a real tag. The
`requireDestTag` block likewise measures an empty string, not falsiness.

**Why it is left as is:** the behaviour is unchanged from before the Ethereum work (the old
`Number(value) || undefined` also dropped `0`), tag `0` is rare in practice, and whether the
composer contract repeats the same `tag != 0` test is unverified. An empty input already
expresses "no tag", so `0` carries no meaning the UI cannot otherwise convey.

**Code:** `src/hooks/useContracts.ts` (`buildBridgeSendParams`, `tag !== 0`),
`src/utils/number.ts` (`parseDestinationTag`)

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

### The OFT send is submitted with a 1.5x gas buffer

`useBridgeSend` estimates gas at submit time and adds 50% before sending, the same multiplier
`POOL_ENTER` / `POOL_EXIT` already use:

```ts
let gasLimit = await contract.send.estimateGas(...);
gasLimit = (gasLimit * BigInt(150)) / BigInt(100);
```

**Why:** with no explicit `gasLimit`, ethers v6 estimates and submits the bare figure, so the
send carries no margin at all. An OFT send's cost is not stable between the estimate and
inclusion — LayerZero endpoint and DVN configuration change what `send` executes — and an
under-provisioned send still burns the LayerZero fee before reverting out of gas. This was the
app's least predictable call and the only contract call submitted without headroom.

Note the estimate is not an extra round trip: ethers already made the same `eth_estimateGas`
call internally when `gasLimit` was absent. It is now explicit so the buffer can be applied.

**Code:** `src/hooks/useContracts.ts` (`useBridgeSend`)

### A WalletConnect session does not gain chains added in a later release

Chains are requested once, in `connect()`, and a session then persists for weeks. Adding a bridge chain therefore reaches new sessions only — every session negotiated before the release keeps its old chain set, and nothing renegotiates it. Observed on mainnet: bridging *to* Ethereum worked (signed on Flare, always in the session) while bridging *from* Ethereum failed until the user disconnected and reconnected the wallet.

The failure is pre-flight and surfaces as ethers' `no such account`, already at the fee quote while the user is typing the amount — not at send:

```
setDefaultChain('eip155:1')                     // succeeds; no validation against the session
BrowserProvider.getSigner() → eth_accounts      // UniversalProvider filters accounts by default chain
  → []                                          // no eip155:1 account in the session
  → Error("no such account")                     // ethers, provider-jsonrpc.js
```

**Why:** A `wallet_addEthereumChain` equivalent does not exist in the WalletConnect session protocol, and `optionalNamespaces` are approved at the wallet's discretion, so no connect-time code can repair a session that already exists. The only fix is a new session, which is why the user is told to disconnect and reconnect rather than the app trying to recover silently.

The handling is one branch in `handleErrors` and nothing more. Every `getSigner()` call in `useContracts.ts` — all 17 of them — is already wrapped by it and there are no callers elsewhere, so a guard inside the connector would catch nothing that this does not. It was tried and dropped for that reason.

Deliberately **not** a modal with a reconnect button, and no pre-flight check on the card: the case could not be reproduced on testnet (Bifrost approves the chains it supports regardless of a narrower request), and unverifiable flow is worse than a message that is guaranteed to appear.

Should a pre-flight check ever be added, two things decide whether it works:

- **`session.namespaces` is the authority, not `universalProvider.namespaces`.** `createProviders` builds each rpcProvider with `accounts` taken from the session, overriding the merged namespaces — which hold what we *requested*, including chains the wallet never approved. Checking the requested set yields false positives.
- **Compare the chain reference, not a string prefix.** On mainnet Ethereum is `eip155:1`, which prefixes Flare (`eip155:14`) and Songbird (`eip155:19`); an `includes('eip155:1')` check passes on a Flare-only session. Testnet cannot catch this — Sepolia (`11155111`) prefixes nothing.

**Code:** `src/hooks/useContracts.ts` (`handleErrors`)

### ETH-priced fees and balances come from the coin, and the fee is rounded up

Both the cross-chain fee row on Bridge to Flare / Bridge to XRPL and the gas balance row on
the Ethereum bridge card are displayed with as many decimals as the ETH figure needs, taken
from the coin rather than from a default at the call site:

```ts
ETH.feeDecimals = SEPOLIA_ETH.feeDecimals = 6   // fee row; every other coin falls back to 4
ETH.decimals    = SEPOLIA_ETH.decimals    = 6   // balance row; every other coin falls back to 2
```

Two fields because the two numbers do not track each other: HYPE fees are shown at four
decimals while a HYPE balance is shown at two. For ETH they happen to coincide at six.

The fee row pads to a fixed width; the balance row does not. `ETH.decimals` is a *ceiling* for
the balance — it floors to six decimals, then trims trailing zeros down to a floor of two:

| ETH balance      | renders      |
| ---------------- | ------------ |
| `0`              | `0.00`       |
| `0.0004`         | `0.0004`     |
| `1.5`            | `1.50`       |
| `2.3333333333`   | `2.333333`   |

**Why variable width:** the two ends of an ETH-priced range want different things. A sub-cent
balance is meaningless without all six decimals, while a whole-ETH one padded out to
`1.500000` reads as false precision. Version 1.8 of this doc argued a fixed width was needed
for column alignment — that was wrong: `BalanceRow` renders the value as text stacked under
its label, not in a right-aligned numeric column, so nothing lines up against it.

The minimum of two decimals is what keeps `0` rendering as `0.00` rather than a bare `0`, and
it comes from `formatNumber`'s `minFractionDigits` parameter, which defaults to the fixed-width
behaviour every other call site relies on.

**Why the extra decimals:** One ETH is worth orders of magnitude more than one FLR or HYPE, so
the same fee in value terms is a much smaller number — the LayerZero nativeFee is thousandths
of an ETH on mainnet and millionths on Sepolia. At the four decimals the HyperEVM routes use,
both round to `0.0000`, and a fee row of zeros reads as "bridging is free" rather than "the fee
is tiny".

**Why rounded up:** `formatCrossChainFee` is the one helper in `core/fees/format.ts` that rounds
up instead of flooring. A fee shown lower than the one actually charged understates the cost,
and flooring would also drop a small-but-real fee into a row of zeros — rounding up lands it on
the last shown digit instead, which removes the need for a separate `< 0.000001` case. The other
helpers there (`formatInputAmount`, `formatFeeAmount`) still floor, because flooring is what
protects the user in their context: a max amount must never exceed what can actually be sent.

**Why the balance row floors:** `formatBalanceAmount` rounds down, the opposite of the fee row
and for the same reason it protects the user — a balance shown higher than the one held reads
as spendable when it is not. The cost is that dust below `0.000001 ETH` floors to `0.00`, so it
is indistinguishable from an empty account, while the fee row rounds *up* and quotes
`0.000001`. A user holding dust therefore sees a balance that reads as nothing next to a fee
that reads as something — accepted, because the alternative shows a balance they cannot spend.

The zero-balance placeholder goes through the same helper rather than a hardcoded string, so
a not-yet-loaded row and a genuinely empty one render identically. Note that
`useHypeBalance` returns `0n` for an empty account, which is falsy — the placeholder branch
is what actually renders a zero balance, and both branches agree only because they share the
helper.

**Code:** `src/types.ts` (`ICoin.decimals`, `ICoin.feeDecimals`),
`src/config/coin.tsx` (`ETH`, `SEPOLIA_ETH`),
`src/utils/number.ts` (`formatNumber`'s `minFractionDigits`),
`src/core/fees/format.ts` (`formatCrossChainFee`, `formatBalanceAmount`),
`src/components/forms/BridgeForm.tsx` and `BridgeXrplForm.tsx` (cross-chain fee row),
`src/components/cards/BridgeUnderlyingBalanceCard.tsx` (gas balance row)

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
