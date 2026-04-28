# FAsset Developer Specification: Minting and Redemption Flows

This document provides a detailed comparison of the minting and redemption flows in the FAsset system, focusing on the differences that application developers need to understand when integrating.

---

## Part 1: Minting Flows

### 1.1 Regular Minting (Collateral Reservation)

Regular minting is a **two-step, agent-backed** process. The minter selects an agent, locks collateral via a reservation, pays on the underlying chain, and then proves the payment to receive FAssets.

#### Step 1: Reserve Collateral

**Function:** `reserveCollateral(address _agentVault, uint256 _lots, uint256 _maxMintingFeeBIPS, address payable _executor)`

**Parameters:**
- `_agentVault` — the agent vault to mint against
- `_lots` — number of lots to mint (each lot = `lotSizeAMG` in underlying units)
- `_maxMintingFeeBIPS` — maximum minting fee the minter accepts (prevents agent front-running a fee increase)
- `_executor` — optional third-party address authorized to execute minting after payment (use `address(0)` if the minter will execute themselves)

**Value sent:** The minter must send `msg.value >= collateralReservationFee`. If an executor is specified, any excess beyond the reservation fee becomes the executor fee. If no executor, excess is refunded.

**Preconditions:**
- System is not emergency-paused and minting is not paused
- Agent is whitelisted, in NORMAL status, and on the public available agents list
- Agent has enough free collateral for the requested lots
- Agent's current fee does not exceed `_maxMintingFeeBIPS`

**Event emitted:** `CollateralReserved`
```solidity
event CollateralReserved(
    address indexed agentVault,
    address indexed minter,
    uint256 indexed collateralReservationId,
    uint256 valueUBA,              // amount the minter will receive as FAssets
    uint256 feeUBA,                // agent's minting fee in underlying units
    uint256 firstUnderlyingBlock,  // earliest valid block for payment
    uint256 lastUnderlyingBlock,   // latest valid block for payment
    uint256 lastUnderlyingTimestamp,// latest valid timestamp for payment
    string paymentAddress,         // agent's underlying address to pay to
    bytes32 paymentReference,      // must be included as memo/tag in underlying payment
    address executor,              // executor address (or zero)
    uint256 executorFeeNatWei      // executor fee amount
);
```

**What developers need from this event:**
- `paymentAddress` — the destination for the underlying chain payment
- `valueUBA + feeUBA` — the exact amount to send on the underlying chain
- `paymentReference` — must be included as the memo/payment reference in the underlying transaction
- `lastUnderlyingBlock` / `lastUnderlyingTimestamp` — the deadline by which the underlying payment must be confirmed
- `collateralReservationId` — needed for executing the minting or handling defaults

**Payment reference format:** `0x4642505266410001<64-bit CRT ID>` (prefix `FBPRfA` + type `0001` + reservation ID).

#### Step 2: Pay on Underlying Chain (Off-chain)

The minter creates a transaction on the underlying chain (e.g., XRP):
- **Destination:** `paymentAddress` from the event
- **Amount:** at least `valueUBA + feeUBA`
- **Memo/Reference:** `paymentReference` from the event
- **Deadline:** must be finalized before `lastUnderlyingBlock` and `lastUnderlyingTimestamp`

#### Step 3: Execute Minting

**Function:** `executeMinting(IPayment.Proof calldata _payment, uint256 _crtId)`

**Who can call:** The minter, the designated executor, or the agent owner.

**Proof type:** `IPayment.Proof` — a generic FDC payment attestation (not XRP-specific).

**Proof validation:**
- Payment must be successful (`status == PAYMENT_SUCCESS`)
- Payment reference must match `PaymentReference.minting(_crtId)`
- Receiving address must match the agent's underlying address
- Amount received must be >= `valueUBA + feeUBA`
- Payment block must be >= `firstUnderlyingBlock` (prevents speculation)
- Transaction must not have been used before (double-spend prevention)

**Event emitted:** `MintingExecuted`
```solidity
event MintingExecuted(
    address indexed agentVault,
    uint256 indexed collateralReservationId,
    uint256 mintedAmountUBA,  // FAssets minted to the minter
    uint256 agentFeeUBA,      // fee kept by the agent (underlying)
    uint256 poolFeeUBA        // fee minted as FAssets to agent's pool
);
```

**What happens on execution:**
1. FAssets are minted to the minter (`mintedAmountUBA`)
2. Pool fee share is minted as FAssets to the agent's collateral pool
3. Reserved collateral is released and converted to locked (backing) collateral
4. Executor fee is paid in WNat (if executor called) or burned (if someone else called)
5. Collateral reservation fee is split between agent and pool

#### Minting Default (Payment Not Made)

If the minter fails to pay on the underlying chain within the deadline, the agent can prove non-payment.

**Function:** `mintingPaymentDefault(IReferencedPaymentNonexistence.Proof calldata _proof, uint256 _crtId)`

**Who can call:** Only the agent vault owner.

**Proof type:** `IReferencedPaymentNonexistence.Proof` — FDC attestation proving no payment with the correct reference was made within the required time window.

**Proof validation:**
- `firstOverflowBlockNumber > crt.lastUnderlyingBlock` and `firstOverflowBlockTimestamp > crt.lastUnderlyingTimestamp` (payment window has closed)
- `minimalBlockNumber <= crt.firstUnderlyingBlock` (proof covers the entire payment window)
- Payment reference, destination address, and amount must match the reservation

**Consequences:**
- Collateral reservation fee is paid to the agent (split with pool)
- Reserved collateral is unlocked
- No FAssets are minted

**Event emitted:** `MintingPaymentDefault`
```solidity
event MintingPaymentDefault(
    address indexed agentVault,
    address indexed minter,
    uint256 indexed collateralReservationId,
    uint256 reservedAmountUBA
);
```

#### Unstick Minting (Attestation Window Expired)

If too much time passes (typically ~14 days) and neither payment proof nor non-payment proof can be obtained from FDC, the agent can unstick the minting.

**Function:** `unstickMinting(IConfirmedBlockHeightExists.Proof calldata _proof, uint256 _crtId)`

**Who can call:** Only the agent vault owner. Must send NAT as `msg.value` to cover collateral burning.

**Proof type:** `IConfirmedBlockHeightExists.Proof` — proves the attestation window has closed.

**Consequences:**
- Collateral reservation fee and executor fee are burned (since outcome is unknown)
- Agent must buy back burned vault collateral at market price (NAT is burned)
- Reserved collateral is released

**Event emitted:** `CollateralReservationDeleted`
```solidity
event CollateralReservationDeleted(
    address indexed agentVault,
    address indexed minter,
    uint256 indexed collateralReservationId,
    uint256 reservedAmountUBA
);
```

---

### 1.2 Direct Minting (No Collateral Reservation)

Direct minting is a **single-step** process where the minter pays directly to the Core Vault's underlying address. There is no agent involvement, no collateral reservation step, and no collateral reservation fee. The minting is backed by the Core Vault instead of individual agents.

#### Entry Point

**Function:** `executeDirectMinting(IXRPPayment.Proof calldata _payment)`

**Who can call:** Anyone with a valid XRP payment proof (subject to executor restrictions — see below).

**Proof type:** `IXRPPayment.Proof` — an XRP-specific FDC payment attestation. This is different from regular minting which uses the generic `IPayment.Proof`.

**Value sent:** `msg.value` is only allowed for smart account minting paths. For direct recipient minting, `msg.value` must be 0.

#### How the Minter Specifies the Recipient

Unlike regular minting where the minter is always `msg.sender` of `reserveCollateral`, direct minting supports three ways to specify who receives the FAssets. The recipient is encoded in the underlying payment itself:

**Option 1: Destination Tag (highest priority)**
- Set the XRP destination tag to a value registered in the `MintingTagManager` contract
- The tag maps to a pre-registered recipient address and optionally an allowed executor
- If the tag is not registered, falls through to the next options

**Option 2: 32-byte DIRECT_MINTING Payment Reference in Memo**
- Set the XRP memo to a 32-byte value with prefix `0x4642505266410018` followed by 24 bytes encoding the recipient's Flare/Songbird address
- No executor restriction (anyone can execute)

**Option 3: 48-byte DIRECT_MINTING_EX Payment Reference in Memo**
- Set the XRP memo to a 48-byte value: prefix `0x4642505266410021` + 20-byte recipient + 20-byte allowed executor
- Allows specifying both recipient and executor inline

**Fallback: Smart Account Manager**
- If none of the above match, FAssets are minted to the `SmartAccountManager` contract
- The smart account manager receives a callback with the source XRP address, amount, and memo data
- `msg.value` (native FLR/SGB) can be forwarded in this path

#### Payment Destination

The payment on the underlying chain must be sent to the **Core Vault's XRP address**, NOT to an agent's address. You can query this address via:

```solidity
function directMintingPaymentAddress() external view returns (string memory);
```

#### Fee Structure

Direct minting has a completely different fee structure from regular minting:

| Fee | Regular Minting | Direct Minting |
|-----|----------------|----------------|
| Collateral reservation fee | Yes (in NAT, paid upfront) | **None** |
| Agent minting fee | Yes (in underlying, paid with the payment) | **None** (no agent involved) |
| Pool fee | Yes (share of agent fee, minted as FAssets to pool) | **None** |
| System minting fee | No | **Yes** — `max(receivedAmount * mintingFeeBIPS / 10000, minimumMintingFeeAmg)` |
| Executor fee | Optional (in NAT, paid at reservation) | **Yes** — fixed `executorFeeAmg` deducted from minted amount |

**Fee priority:** System fee is always deducted first. If the payment is less than the minimum fee, everything goes to the fee receiver and nothing is minted (see `DirectMintingPaymentTooSmallForFee` event).

**Fee recipient:** System fee goes to `mintingFeeReceiver` (a governance-set address). Executor fee is minted as FAssets to `msg.sender` (the executor).

#### Rate Limiting

Direct minting has a three-tier rate limiting system that does not exist in regular minting:

**1. Hourly Limiter:** Total small mintings within a 1-hour window cannot exceed `directMintingHourlyLimitUBA`.

**2. Daily Limiter:** Total small mintings within a 1-day window cannot exceed `directMintingDailyLimitUBA`.

**3. Large Minting Throttle:** Any single minting above `directMintingLargeMintingThresholdUBA` is delayed by a fixed `directMintingLargeMintingDelaySeconds` (regardless of amount).

When rate limits are exceeded, the minting is delayed (not rejected). The function returns early after emitting a delay event. The executor must call `executeDirectMinting` again after the delay period.

#### Events

**Successful execution to a direct recipient:**
```solidity
event DirectMintingExecuted(
    bytes32 transactionId,     // underlying transaction ID
    address targetAddress,     // recipient of FAssets
    address executor,          // who called executeDirectMinting
    uint256 mintedAmountUBA,   // FAssets minted to recipient
    uint256 mintingFeeUBA,     // system fee
    uint256 executorFeeUBA     // executor fee (also minted as FAssets)
);
```

**Successful execution to smart account:**
```solidity
event DirectMintingExecutedToSmartAccount(
    bytes32 transactionId,
    string sourceAddress,      // XRP source address
    address executor,
    uint256 mintedAmountUBA,   // FAssets sent to smart account manager
    uint256 mintingFeeUBA,     // system fee
    bytes memoData             // memo data passed to smart account manager
);
```

**Payment too small for fee:**
```solidity
event DirectMintingPaymentTooSmallForFee(
    bytes32 transactionId,
    uint256 receivedAmount,    // what was received
    uint256 mintingFeeUBA      // minimum fee required
);
```

**Rate-limited (delayed):**
```solidity
event DirectMintingDelayed(
    bytes32 transactionId,
    uint256 amount,
    uint256 executionAllowedAt  // timestamp when retry is allowed
);

event LargeDirectMintingDelayed(
    bytes32 transactionId,
    uint256 amount,
    uint256 executionAllowedAt
);
```

**Governance unblock:**
```solidity
event DirectMintingsUnblocked(
    uint256 startedUntilTimestamp
);
```

#### Executor Restrictions

- If an `allowedExecutor` is set (via tag registration or DIRECT_MINTING_EX reference), only that address can execute the minting initially
- After `othersCanExecuteAfterSeconds` passes since the payment timestamp (or since delay release), anyone can execute
- For delayed mintings, the exclusive executor window starts from `allowedAt`, not from the original payment time

#### Delay State Querying

Developers can check the delay state of a specific direct minting transaction:

```solidity
function directMintingDelayState(bytes32 _transactionId)
    external view
    returns (DirectMintingDelayState _delayState, uint256 _allowedAt, uint256 _startedAt);
```

Where `DirectMintingDelayState` is: `NotDelayed (0)`, `Delayed (1)`, or `Released (2)`.

#### No Default Mechanism

**Critical difference:** Direct minting has **no default handling**. If a payment is made to the Core Vault but `executeDirectMinting` is never called (or is delayed indefinitely), there is no automatic refund or recovery. The payment sits on the Core Vault. Only governance can unblock delayed mintings via `unblockDirectMintingsUntil()`.

---

### 1.3 Summary: What Developers Must Change for Direct Minting

| Aspect | Regular Minting | Direct Minting |
|--------|----------------|----------------|
| **Steps** | 2 (reserve + execute) | 1 (execute with proof) |
| **Payment destination** | Agent's underlying address | Core Vault's XRP address |
| **Recipient specification** | `msg.sender` of `reserveCollateral` | Encoded in XRP memo/tag |
| **Payment reference** | From `CollateralReserved` event | One of: registered tag, DIRECT_MINTING ref, or DIRECT_MINTING_EX ref |
| **Proof type** | `IPayment.Proof` (generic) | `IXRPPayment.Proof` (XRP-specific) |
| **Fee model** | CRF (NAT) + agent fee (underlying) | System fee + executor fee (both from minted amount) |
| **Collateral backing** | Agent vault + pool | Core Vault |
| **Agent selection** | Required (choose from available agents) | Not applicable |
| **Rate limiting** | None (limited by agent collateral) | Hourly + daily + large minting throttle |
| **Default/recovery** | Agent proves non-payment → gets CRF | **None** — no refund mechanism |
| **Proof for default** | `IReferencedPaymentNonexistence.Proof` | N/A |
| **Minting payment deadline** | `lastUnderlyingBlock` / `lastUnderlyingTimestamp` | No deadline (proof can be submitted anytime) |
| **XRP chain only** | No (supports BTC, DOGE, etc.) | **Yes** (XRP-specific proof type) |

**Key integration changes for developers:**

1. **No reservation step** — remove the `reserveCollateral` call and associated event handling
2. **Different payment destination** — query `directMintingPaymentAddress()` instead of reading from `CollateralReserved` event
3. **Encode recipient in memo/tag** — instead of being the `msg.sender`, the recipient must be encoded in the underlying payment
4. **Different proof type** — use `IXRPPayment.Proof` instead of `IPayment.Proof`
5. **Handle rate-limiting delays** — watch for `DirectMintingDelayed` / `LargeDirectMintingDelayed` events and retry after `executionAllowedAt`
6. **No default handling needed** — remove all `mintingPaymentDefault` and `unstickMinting` logic
7. **Different fee calculation** — fees are deducted from the minted amount, not paid separately
8. **No agent selection** — remove agent browsing and selection logic

---

## Part 2: Redemption Flows

### 2.1 Regular Redemption (`redeem`)

The standard lot-based redemption. The redeemer burns FAssets and receives underlying assets from agents.

#### Request

**Function:** `redeem(uint256 _lots, string memory _redeemerUnderlyingAddressString, address payable _executor)`

**Parameters:**
- `_lots` — number of lots to redeem (each lot = `lotSizeAMG`)
- `_redeemerUnderlyingAddressString` — the underlying chain address where the redeemer wants to receive assets
- `_executor` — optional third-party address to execute defaults (use `address(0)` to handle defaults yourself)

**Value sent:** `msg.value` is the executor fee in NAT (distributed across redemption requests).

**Granularity:** Whole lots only. Amounts are rounded down to lot boundaries when deducting from redemption tickets.

**Event emitted:** `RedemptionRequested` (one per agent, may be multiple for a single `redeem` call)
```solidity
event RedemptionRequested(
    address indexed agentVault,
    address indexed redeemer,
    uint256 indexed requestId,
    string paymentAddress,           // redeemer's underlying address
    uint256 valueUBA,                // total value being redeemed
    uint256 feeUBA,                  // redemption fee
    uint256 firstUnderlyingBlock,
    uint256 lastUnderlyingBlock,
    uint256 lastUnderlyingTimestamp,
    bytes32 paymentReference,        // agent must use this reference when paying
    address executor,
    uint256 executorFeeNatWei
);
```

**Incomplete redemption event:** If not all requested lots can be redeemed (insufficient tickets or ticket limit reached):
```solidity
event RedemptionRequestIncomplete(
    address indexed redeemer,
    uint256 remainingLots           // lots NOT redeemed, returned to redeemer
);
```

**What the agent must pay:** `valueUBA - feeUBA` to the redeemer's underlying address, using the `paymentReference`.

**Payment reference format:** `0x4642505266410002<192-bit request ID>` (prefix `FBPRfA` + type `0002` + request ID).

#### Confirming Payment

**Function:** `confirmRedemptionPayment(IPayment.Proof calldata _payment, uint256 _redemptionRequestId)`

**Who can call:** Agent vault owner, or anyone after `confirmationByOthersAfterSeconds`.

**Proof type:** `IPayment.Proof` (generic FDC payment attestation).

**Proof validation:**
- Payment reference must match `PaymentReference.redemption(requestId)`
- Source address must be the agent's underlying address
- Payment block >= `firstUnderlyingBlock`
- Payment must be within deadline (`blockNumber <= lastUnderlyingBlock` AND `blockTimestamp <= lastUnderlyingTimestamp`)
- Destination must be the redeemer's underlying address
- Amount >= `valueUBA - feeUBA`
- No destination tag validation (tags not supported by `IPayment.Proof`)

**Events emitted based on payment status:**

On success (`PAYMENT_SUCCESS`):
```solidity
event RedemptionPerformed(
    address indexed agentVault,
    address indexed redeemer,
    uint256 indexed requestId,
    bytes32 transactionHash,
    uint256 redemptionAmountUBA,
    int256 spentUnderlyingUBA       // total underlying spent by agent
);
```

On blocked payment (`PAYMENT_BLOCKED` — redeemer's address blocked the payment):
```solidity
event RedemptionPaymentBlocked(
    address indexed agentVault,
    address indexed redeemer,
    uint256 indexed requestId,
    bytes32 transactionHash,
    uint256 redemptionAmountUBA,
    int256 spentUnderlyingUBA
);
```

On failed payment (`PAYMENT_FAILED` — agent error):
```solidity
event RedemptionPaymentFailed(
    address indexed agentVault,
    address indexed redeemer,
    uint256 indexed requestId,
    bytes32 transactionHash,
    int256 spentUnderlyingUBA,
    string failureReason
);
```

On successful confirmation with pool fee:
```solidity
event RedemptionPoolFeeMinted(
    address indexed agentVault,
    uint256 indexed requestId,
    uint256 poolFeeUBA              // fee re-minted as FAssets to pool
);
```

#### Redemption Default (Agent Didn't Pay)

**Function:** `redemptionPaymentDefault(IReferencedPaymentNonexistence.Proof calldata _proof, uint256 _redemptionRequestId)`

**Who can call:** Redeemer, executor, or agent owner.

**Proof type:** `IReferencedPaymentNonexistence.Proof` (generic FDC non-payment attestation).

**Constraints:**
- Request must be `ACTIVE`
- Must NOT be a request with destination tag (`requiresDestinationTag` must be false)
- Attestation request must have `checkSourceAddresses = false`
- Proof window must cover the entire payment period

**Event emitted:**
```solidity
event RedemptionDefault(
    address indexed agentVault,
    address indexed redeemer,
    uint256 indexed requestId,
    uint256 redemptionAmountUBA,
    uint256 redeemedVaultCollateralWei,  // collateral paid from agent vault
    uint256 redeemedPoolCollateralWei    // collateral paid from pool (if vault insufficient)
);
```

**What the redeemer receives on default:**
- Vault collateral: `valueAMG * price * redemptionDefaultFactorVaultCollateralBIPS / 10000` (typically > 100%, compensating for the default)
- If vault collateral insufficient: remaining is paid from pool collateral

---

### 2.2 Redemption with Tag (`redeemWithTag`)

#### Request

**Function:** `redeemWithTag(uint256 _amountUBA, string memory _redeemerUnderlyingAddressString, address payable _executor, uint64 _destinationTag)`

**Parameters:**
- `_amountUBA` — amount in UBA (NOT lots). Minimum: `minimumRedeemAmountAMG()` converted to UBA
- `_redeemerUnderlyingAddressString` — underlying address
- `_executor` — executor address
- `_destinationTag` — XRP destination tag that must be included in the redemption payment

**Availability:** Only on XRP networks. Reverts if `redeemWithTagSupported()` returns false.

**Granularity:** 1 AMG (much finer than `redeem` which uses whole lots).

**Event emitted:** `RedemptionWithTagRequested` (different from standard `RedemptionRequested`)
```solidity
event RedemptionWithTagRequested(
    address indexed agentVault,
    address indexed redeemer,
    uint256 indexed requestId,
    string paymentAddress,
    uint256 valueUBA,
    uint256 feeUBA,
    uint256 firstUnderlyingBlock,
    uint256 lastUnderlyingBlock,
    uint256 lastUnderlyingTimestamp,
    bytes32 paymentReference,
    address executor,
    uint256 executorFeeNatWei,
    uint256 destinationTag          // <-- extra field, not in RedemptionRequested
);
```

**Incomplete redemption event:** `RedemptionAmountIncomplete` (different from `RedemptionRequestIncomplete` used by `redeem`)
```solidity
event RedemptionAmountIncomplete(
    address indexed redeemer,
    uint256 remainingAmountUBA      // remaining UBA, not lots
);
```

#### Confirming Payment

**Function:** `confirmXRPRedemptionPayment(IXRPPayment.Proof calldata _payment, uint256 _redemptionRequestId)`

**Proof type:** `IXRPPayment.Proof` (XRP-specific, NOT `IPayment.Proof`). The standard `confirmRedemptionPayment` with `IPayment.Proof` will revert for tagged redemptions because it doesn't support destination tags.

**Additional validation vs. standard confirmation:**
- Proof owner verification is required
- Payment reference is extracted from XRP memo data (first 32 bytes)
- Destination tag must be present and must match the requested tag
- If tag is required but payment has no tag → treated as invalid payment (FAILED)
- If tag doesn't match → treated as invalid payment (FAILED)

#### Default

**Function:** `xrpRedemptionPaymentDefault(IXRPPaymentNonexistence.Proof calldata _proof, uint256 _redemptionRequestId)`

**Proof type:** `IXRPPaymentNonexistence.Proof` (XRP-specific, NOT `IReferencedPaymentNonexistence.Proof`).

**Key difference from `redemptionPaymentDefault`:** The standard `redemptionPaymentDefault` explicitly rejects requests with `requiresDestinationTag = true`. You **must** use `xrpRedemptionPaymentDefault` for tagged redemptions.

**Proof validation includes:**
- `checkFirstMemoData` must be true, and `firstMemoDataHash` must match `keccak256(abi.encodePacked(PaymentReference.redemption(requestId)))`
- If destination tag is required: `checkDestinationTag` must be true and `destinationTag` must match the request's tag
- If no destination tag required: `checkDestinationTag` must be false
- Proof owner verification is required

---

### 2.3 Redemption by Amount (`redeemAmount`)

#### Request

**Function:** `redeemAmount(uint256 _amountUBA, string memory _redeemerUnderlyingAddressString, address payable _executor)`

**Parameters:**
- `_amountUBA` — arbitrary amount in UBA (minimum: `minimumRedeemAmountAMG()` converted to UBA)
- `_redeemerUnderlyingAddressString` — underlying address
- `_executor` — executor address

**Granularity:** 1 AMG (like `redeemWithTag`, unlike `redeem` which requires whole lots).

**No destination tag.** Like `redeem`, this does not support destination tags.

**Events:** Same as `redeem` — emits `RedemptionRequested` (not `RedemptionWithTagRequested`). For incomplete redemptions emits `RedemptionAmountIncomplete` (with UBA remaining, not lots).

#### Confirming Payment and Handling Defaults

**Confirmation:** Uses `confirmRedemptionPayment(IPayment.Proof, requestId)` — same as standard `redeem`. Can also use `confirmXRPRedemptionPayment` if on XRP chain (since no destination tag is required, both work).

**Default:** Uses `redemptionPaymentDefault(IReferencedPaymentNonexistence.Proof, requestId)` — same as standard `redeem`. Can also use `xrpRedemptionPaymentDefault` on XRP chain (with `checkDestinationTag = false`).

---

### 2.4 Comparison of Redemption Methods

| Aspect | `redeem` | `redeemAmount` | `redeemWithTag` |
|--------|----------|----------------|-----------------|
| **Amount unit** | Lots | UBA | UBA |
| **Granularity** | `lotSizeAMG` | 1 AMG | 1 AMG |
| **Minimum amount** | 1 lot | `minimumRedeemAmountAMG` | `minimumRedeemAmountAMG` |
| **Destination tag** | No | No | Yes (required) |
| **Chain support** | All chains | All chains | XRP only |
| **Request event** | `RedemptionRequested` | `RedemptionRequested` | `RedemptionWithTagRequested` |
| **Incomplete event** | `RedemptionRequestIncomplete` (lots) | `RedemptionAmountIncomplete` (UBA) | `RedemptionAmountIncomplete` (UBA) |
| **Confirmation function** | `confirmRedemptionPayment` | `confirmRedemptionPayment` | `confirmXRPRedemptionPayment` |
| **Confirmation proof** | `IPayment.Proof` | `IPayment.Proof` | `IXRPPayment.Proof` |
| **Default function** | `redemptionPaymentDefault` | `redemptionPaymentDefault` | `xrpRedemptionPaymentDefault` |
| **Default proof** | `IReferencedPaymentNonexistence.Proof` | `IReferencedPaymentNonexistence.Proof` | `IXRPPaymentNonexistence.Proof` |

---

### 2.5 Redemption Request Lifecycle and Status Transitions

```
ACTIVE
  ├── confirmRedemptionPayment (SUCCESS) ──→ SUCCESSFUL (final)
  ├── confirmRedemptionPayment (BLOCKED) ──→ BLOCKED (final)
  ├── confirmRedemptionPayment (FAILED) ───→ FAILED (final)
  ├── redemptionPaymentDefault ────────────→ DEFAULTED
  │     ├── confirmRedemptionPayment (SUCCESS after default) → SUCCESSFUL (final)
  │     └── confirmRedemptionPayment (FAILED after default)  → FAILED (final)
  ├── rejectInvalidRedemption ─────────────→ REJECTED (final)
  └── finishRedemptionWithoutPayment ──────→ DEFAULTED
```

**Important:** After `DEFAULTED`, the agent can still confirm a late payment. The request transitions to `SUCCESSFUL` or `FAILED` but the redeemer has already been paid in collateral.

---

### 2.6 Other Redemption Variants (Not User-Facing)

These are called internally by the collateral pool or agent, not directly by end users:

#### `redeemFromAgent` (Pool Self-Close)
- Called only by the collateral pool during self-close exit
- Creates a redemption request from a specific agent (not from the FIFO queue)
- Sets `poolSelfClose = true` — affects default payment calculation (100% vault collateral, no pool)

#### `redeemFromAgentInCollateral` (Immediate Collateral Payment)
- Called only by the collateral pool
- Immediately pays the redeemer in vault collateral (ERC20 stablecoin)
- No underlying payment or redemption request is created
- Price = FTSO price × `buyFAssetByAgentFactorBIPS`
- Emits `RedeemedInCollateral`

#### `selfClose` (Agent Self-Redemption)
- Called only by agent vault owner
- Burns agent's own FAssets to unlock collateral
- No underlying payment required
- Also burns the redemption pool fee share
- Emits `SelfClose`

---

### 2.7 Redemption Queue Mechanics

All redemptions draw from a global FIFO queue of redemption tickets:

1. Tickets are created when minting is executed (`MintingExecuted` event → ticket created)
2. On redemption, tickets are consumed from the front of the queue
3. Multiple tickets for the same agent within one `redeem` call are combined into a single request
4. If a ticket has less than 1 lot remaining (after a lot size increase), it becomes "dust"
5. Dust can be self-closed or liquidated, and if it accumulates to >= 1 lot, anyone can call `convertDustToTicket`

**Maximum tickets per redemption:** Limited by `maxRedeemedTickets` (governance setting). If more tickets would need to be processed, a partial redemption occurs and an incomplete event is emitted.

---

### 2.8 What Developers Must Change for `redeemWithTag` and `redeemAmount`

#### Switching from `redeem` to `redeemAmount`

**Minimal changes — same confirmation and default flows:**

1. **Request:** Change `redeem(_lots, address, executor)` to `redeemAmount(_amountUBA, address, executor)`
   - Convert lot-based input to UBA: `amountUBA = lots * lotSizeAMG * assetMintingGranularityUBA`
   - Or accept arbitrary UBA amounts (enables sub-lot redemptions)
   - Enforce minimum: `amountUBA >= minimumRedeemAmountAMG * assetMintingGranularityUBA`

2. **Event handling:** Listen for `RedemptionAmountIncomplete` instead of `RedemptionRequestIncomplete`
   - The remaining amount is in UBA, not lots

3. **Confirmation and default:** **No changes needed** — uses the same `confirmRedemptionPayment` and `redemptionPaymentDefault` functions with the same proof types

#### Switching from `redeem` to `redeemWithTag`

**Requires changes to confirmation and default flows:**

1. **Request:** Change to `redeemWithTag(_amountUBA, address, executor, destinationTag)`
   - Amount is in UBA (not lots)
   - Must provide a destination tag (uint64)
   - Only works if `redeemWithTagSupported()` returns true

2. **Event handling:**
   - Listen for `RedemptionWithTagRequested` instead of `RedemptionRequested`
   - Extra field: `destinationTag`
   - Listen for `RedemptionAmountIncomplete` instead of `RedemptionRequestIncomplete`

3. **Confirmation — MUST change:**
   - Use `confirmXRPRedemptionPayment(IXRPPayment.Proof, requestId)` instead of `confirmRedemptionPayment(IPayment.Proof, requestId)`
   - Proof type changes from `IPayment.Proof` to `IXRPPayment.Proof`
   - The XRP proof includes destination tag and memo data fields
   - Proof owner must be verified (`proofOwner` in the request body)

4. **Default — MUST change:**
   - Use `xrpRedemptionPaymentDefault(IXRPPaymentNonexistence.Proof, requestId)` instead of `redemptionPaymentDefault(IReferencedPaymentNonexistence.Proof, requestId)`
   - Proof type changes from `IReferencedPaymentNonexistence.Proof` to `IXRPPaymentNonexistence.Proof`
   - The XRP non-payment proof must include: `checkFirstMemoData = true`, `firstMemoDataHash` matching the payment reference, `checkDestinationTag = true`, and matching `destinationTag`
   - Standard `redemptionPaymentDefault` will explicitly **revert** for tagged redemptions

5. **Agent payment on underlying chain:** Agent must include both the payment reference (as memo) AND the destination tag when making the XRP payment. Missing or wrong tag = payment treated as FAILED.

#### FDC Attestation Request Differences

| Attestation | `redeem` / `redeemAmount` | `redeemWithTag` |
|------------|---------------------------|-----------------|
| **Payment proof** | `IPayment` (generic) | `IXRPPayment` (XRP-specific) |
| **Non-payment proof** | `IReferencedPaymentNonexistence` | `IXRPPaymentNonexistence` |
| **Non-payment request fields** | `checkSourceAddresses = false` | `checkFirstMemoData = true`, `checkDestinationTag = true`, `destinationTag = <tag>`, `firstMemoDataHash = keccak256(paymentReference)` |
| **Proof owner** | Not checked | Must be verified (set `proofOwner` in attestation request) |

---

### 2.9 Finish Redemption Without Payment

For any redemption variant, if the attestation window expires (~14 days) without either payment confirmation or non-payment proof:

**Function:** `finishRedemptionWithoutPayment(IConfirmedBlockHeightExists.Proof calldata _proof, uint256 _redemptionRequestId)`

**Who can call:** Only agent vault owner.

**Effect:** Triggers default payment without non-payment proof. Works for both tagged and non-tagged redemptions. This is the last-resort mechanism for stuck redemptions.

---

### 2.10 Executor Fee Handling in Redemptions

- Executor fee is paid as `msg.value` during the redemption request (`redeem`, `redeemAmount`, or `redeemWithTag`)
- Stored as GWei (divided by 10^9) for storage efficiency
- If multiple redemption requests are created (multiple agents), the fee is split evenly across requests
- Executor receives the fee (in WNat) **only if they are the one who calls the default function**
- If someone else calls default (redeemer, agent), the executor fee is burned
- On payment confirmation (regardless of who confirms), the executor fee is always burned

---

### 2.11 Confirmation by Others

For all redemption types, if the agent doesn't confirm their payment within `confirmationByOthersAfterSeconds`:
- Anyone can call the confirmation function
- The caller receives a reward from the agent's vault (`payForConfirmationByOthers`)
- The executor fee is still burned (not paid to the "other" confirmer)

This applies to both `confirmRedemptionPayment` and `confirmXRPRedemptionPayment`.

---

## Part 3: Frontend Developer Guide — Transaction Data & Querying

This section describes exactly what data a frontend application needs to construct underlying-chain transactions and call smart contract functions for direct minting and the new redemption methods.

---

### 3.1 Direct Minting — Constructing the XRP Transaction

The frontend must build an XRP transaction to the Core Vault address. There are two ways to specify who receives the minted FAssets: **destination tag** or **encoded address in memo**.

#### 3.1.1 Option A: Direct Minting with Destination Tag

This is the recommended approach when the user has a pre-registered tag.

**XRP transaction fields:**

| Field | Value |
|-------|-------|
| **Destination** | Core Vault XRP address (query via `directMintingPaymentAddress()`) |
| **Amount** | Desired FAsset amount + system minting fee + executor fee (all in XRP drops) |
| **DestinationTag** | The user's registered tag (uint32, from `MintingTagManager`) |
| **Memo** | Not required (tag takes priority) |

**Tag registration (one-time setup):**

Tags are ERC-721 NFTs managed by the `MintingTagManager` contract. The frontend must:

1. **Reserve a tag:**
   ```solidity
   // Pays reservationFee() in NAT. Returns the assigned tag number.
   function reserve() external payable returns (uint256 tag);
   ```
   Emits `MintingTagReserved(tag, owner)`.

2. **Set the FAsset recipient for that tag:**
   ```solidity
   function setMintingRecipient(uint256 _mintingTag, address _recipient) external;
   ```
   Only the tag owner can call this. Emits `RecipientChanged(tag, recipient)`.

3. **(Optional) Set an allowed executor:**
   ```solidity
   function setAllowedExecutor(uint256 _mintingTag, address _executor) external;
   ```
   The executor change is time-delayed. Emits `AllowedExecutorChangePending(tag, executor, activeAfterTs)`.

**Querying tag state:**

```solidity
// Check the reservation fee before calling reserve()
function reservationFee() external view returns (uint256);

// Look up what address receives FAssets for a given tag
function mintingRecipient(uint256 _mintingTag) external view returns (address);

// Look up the allowed executor for a given tag
function allowedExecutor(uint256 _mintingTag) external view returns (address);

// Check if an executor change is pending
function pendingAllowedExecutorChange(uint256 _mintingTag)
    external view returns (bool isPending, address executor, uint256 activeAfterTs);

// Get all tags owned by an address
function reservedTagsForOwner(address _owner) external view returns (uint256[] memory);

// Get the next tag number that will be assigned
function nextAvailableTag() external view returns (uint256);
```

#### 3.1.2 Option B: Direct Minting with Encoded Address in Memo

No tag registration required. The recipient address is encoded directly in the XRP memo field.

**Variant 1: DIRECT_MINTING reference (32 bytes) — anyone can execute**

| Field | Value |
|-------|-------|
| **Destination** | Core Vault XRP address |
| **Amount** | Desired FAsset amount + fees (in XRP drops) |
| **DestinationTag** | Not set (or set to an unregistered value) |
| **Memo** | 32-byte hex value (see encoding below) |

**Memo encoding (32 bytes / 64 hex chars):**
```
0x4642505266410018 + 0000000000000000 + <20-byte recipient EVM address>
```
- Bytes 0–7: prefix `0x4642505266410018` (type = `DIRECT_MINTING`)
- Bytes 8–11: zero padding (4 bytes)
- Bytes 12–31: recipient's 20-byte EVM address (e.g., `0xAbCd...1234`)

The recipient address occupies the low 160 bits of the 32-byte value, left-padded with zeros.

**Example:** To mint to `0x1234567890abcdef1234567890abcdef12345678`:
```
0x46425052664100180000000000000000000000001234567890abcdef1234567890abcdef12345678
```

**Variant 2: DIRECT_MINTING_EX reference (48 bytes) — with executor restriction**

| Field | Value |
|-------|-------|
| **Destination** | Core Vault XRP address |
| **Amount** | Desired FAsset amount + fees (in XRP drops) |
| **DestinationTag** | Not set (or set to an unregistered value) |
| **Memo** | 48-byte hex value (see encoding below) |

**Memo encoding (48 bytes / 96 hex chars):**
```
0x4642505266410021 + <20-byte recipient address> + 0000000000000000 + <20-byte allowed executor address>
```
- Bytes 0–7: prefix `0x4642505266410021` (type = `DIRECT_MINTING_EX`)
- Bytes 8–27: recipient's 20-byte EVM address
- Bytes 28–31: zero padding (4 bytes)
- Bytes 32–47: allowed executor's 20-byte EVM address (occupies low 160 bits of the second 24-byte section)

The first address (recipient) is packed into bytes 8–27. The second address (executor) occupies the low 160 bits of bytes 28–47.

**Priority:** If both a registered destination tag and a memo reference are present, the destination tag takes priority.

#### 3.1.3 After the XRP Payment — Executing on Flare

Once the XRP transaction is confirmed, the executor (or anyone, depending on permissions) calls:

```solidity
function executeDirectMinting(IXRPPayment.Proof calldata _payment) external;
```

The proof is obtained from the Flare Data Connector (FDC) using the `IXRPPayment` attestation type.

**Handling delays:** If rate-limited, the call emits `DirectMintingDelayed` or `LargeDirectMintingDelayed` instead of minting. The frontend should:
1. Read `executionAllowedAt` from the event
2. Wait until that timestamp
3. Call `executeDirectMinting` again with the same proof

Query delay state at any time:
```solidity
function directMintingDelayState(bytes32 _transactionId)
    external view
    returns (DirectMintingDelayState _delayState, uint256 _allowedAt, uint256 _startedAt);
// DirectMintingDelayState: NotDelayed (0), Delayed (1), Released (2)
```

---

### 3.2 Direct Minting — Fee Queries

The frontend needs fee data to calculate the correct XRP payment amount and to display fee breakdowns to the user.

**View functions on the AssetManager contract:**

```solidity
// System minting fee percentage (basis points, e.g. 100 = 1%)
function getDirectMintingFeeBIPS() external view returns (uint256);

// Minimum system minting fee in UBA (applied if percentage-based fee is lower)
function getDirectMintingMinimumFeeUBA() external view returns (uint256);

// Fixed executor fee in UBA (deducted from minted amount, paid to executor)
function getDirectMintingExecutorFeeUBA() external view returns (uint256);

// Address that receives the system minting fee (minted as FAssets)
function getDirectMintingFeeReceiver() external view returns (address);
```

**Fee calculation for the frontend:**

Given a desired `mintAmount` (FAssets the user wants to receive):

```
systemFee = max(receivedXRP * feeBIPS / 10000, minimumFeeUBA)
executorFee = executorFeeUBA  (fixed)
totalXRPToSend = mintAmount + systemFee + executorFee
```

If `receivedXRP < minimumFeeUBA`, the entire amount goes to the fee receiver and the user gets nothing. The frontend should warn users about the minimum payment threshold.

**Rate limiting queries:**

```solidity
// Current limits
function getDirectMintingHourlyLimitUBA() external view returns (uint256);
function getDirectMintingDailyLimitUBA() external view returns (uint256);
function getDirectMintingLargeMintingThresholdUBA() external view returns (uint256);
function getDirectMintingLargeMintingDelaySeconds() external view returns (uint256);

// Current limiter state (how much capacity remains)
function getDirectMintingHourlyLimiterState() external view returns (uint256);
function getDirectMintingDailyLimiterState() external view returns (uint256);

// Executor permission window
function getDirectMintingOthersCanExecuteAfterSeconds() external view returns (uint256);
```

---

### 3.3 Redemption by Amount (`redeemAmount`) — Frontend Data

`redeemAmount` allows redeeming an arbitrary UBA amount (not just whole lots). It uses the same confirmation and default proof types as regular `redeem`.

#### What the Frontend Needs to Provide

**Contract call:**
```solidity
function redeemAmount(
    uint256 _amountUBA,              // amount in UBA (not lots)
    string memory _redeemerUnderlyingAddressString,  // user's underlying address
    address payable _executor        // executor address, or address(0)
) external payable returns (uint256 _redeemedAmountUBA);
```

**`msg.value`:** Executor fee in NAT (distributed across resulting redemption requests). Set to 0 if no executor.

**Parameters the frontend must collect from the user:**
1. **Amount in UBA** — The exact amount of FAssets to redeem. Must be >= `minimumRedeemAmountUBA()`.
2. **Underlying address** — The user's XRP/BTC/DOGE address where they want to receive underlying assets.
3. **Executor address** — Optional. If provided, executor fee must be sent as `msg.value`.

#### Querying Limits and Fees

```solidity
// Minimum redemption amount in UBA
function minimumRedeemAmountUBA() external view returns (uint256);

// Lot size in UBA (for reference / UI display)
function lotSize() external view returns (uint256);

// Asset minting granularity (1 AMG in UBA — the effective precision)
function assetMintingGranularityUBA() external view returns (uint256);

// Redemption fee in basis points (deducted from the redeemed amount by the agent)
// Available from getSettings().redemptionFeeBIPS
function getSettings() external view returns (AssetManagerSettings.Data memory);
```

**Amount validation in the frontend:**
```
amountUBA >= minimumRedeemAmountUBA()
amountUBA is rounded down to assetMintingGranularityUBA() boundaries (sub-AMG remainder is truncated)
```

#### Events to Listen For

- **`RedemptionRequested`** — one per agent assigned. Same event as regular `redeem`. Contains `paymentAddress`, `valueUBA`, `feeUBA`, `paymentReference`, deadline info.
- **`RedemptionAmountIncomplete(redeemer, remainingAmountUBA)`** — emitted if not all requested UBA could be redeemed. The `remainingAmountUBA` is returned to the user as FAssets (note: this uses UBA, not lots like `RedemptionRequestIncomplete` from `redeem`).

#### Confirmation and Default

Same as regular `redeem` — no changes needed:
- Confirmation: `confirmRedemptionPayment(IPayment.Proof, requestId)`
- Default: `redemptionPaymentDefault(IReferencedPaymentNonexistence.Proof, requestId)`

---

### 3.4 Redemption with Tag (`redeemWithTag`) — Frontend Data

`redeemWithTag` is XRP-only and requires a destination tag in the redemption payment. It uses XRP-specific proof types for both confirmation and default.

#### Availability Check

The frontend **must** check before showing the redeemWithTag option:
```solidity
function redeemWithTagSupported() external view returns (bool);
```
Returns `true` only on XRP-supporting networks. Reverts with `RedeemWithTagNotSupported` if called on unsupported chains.

#### What the Frontend Needs to Provide

**Contract call:**
```solidity
function redeemWithTag(
    uint256 _amountUBA,              // amount in UBA (not lots)
    string memory _redeemerUnderlyingAddressString,  // user's XRP address
    address payable _executor,       // executor address, or address(0)
    uint64 _destinationTag           // XRP destination tag for the redemption payment
) external payable returns (uint256 _redeemedAmountUBA);
```

**`msg.value`:** Executor fee in NAT.

**Parameters the frontend must collect from the user:**
1. **Amount in UBA** — Must be >= `minimumRedeemAmountUBA()`.
2. **XRP address** — The user's XRP address.
3. **Destination tag** — A `uint64` value. The agent's redemption payment to the user must include this tag, and proof verification will enforce it.
4. **Executor address** — Optional.

#### Querying Limits and Fees

Same view functions as `redeemAmount` (see section 3.3).

#### Events to Listen For

- **`RedemptionWithTagRequested`** — same fields as `RedemptionRequested` plus an additional `destinationTag` field. The frontend must use this event (not `RedemptionRequested`) to track tagged redemptions.
- **`RedemptionAmountIncomplete(redeemer, remainingAmountUBA)`** — if not all UBA could be redeemed.

#### Confirmation and Default — Different from Regular Redemption

**Confirmation** uses XRP-specific proof:
```solidity
function confirmXRPRedemptionPayment(
    IXRPPayment.Proof calldata _payment,
    uint256 _redemptionRequestId
) external;
```
The standard `confirmRedemptionPayment` will **revert** for tagged redemptions.

**Default** uses XRP-specific non-existence proof:
```solidity
function xrpRedemptionPaymentDefault(
    IXRPPaymentNonexistence.Proof calldata _proof,
    uint256 _redemptionRequestId
) external;
```
The standard `redemptionPaymentDefault` will **revert** for tagged redemptions.

**FDC attestation request differences for defaults:**

| Field | `redeemAmount` default | `redeemWithTag` default |
|-------|------------------------|------------------------|
| Attestation type | `IReferencedPaymentNonexistence` | `IXRPPaymentNonexistence` |
| `checkSourceAddresses` | `false` | N/A (not applicable) |
| `checkFirstMemoData` | N/A | `true` |
| `firstMemoDataHash` | N/A | `keccak256(abi.encodePacked(paymentReference))` |
| `checkDestinationTag` | N/A | `true` |
| `destinationTag` | N/A | Must match the request's tag |
| Proof owner | Not checked | Must be set and verified |

---

### 3.5 Summary: View Functions the Frontend Should Call

#### For Direct Minting (on AssetManager)

| Function | Returns | Purpose |
|----------|---------|---------|
| `directMintingPaymentAddress()` | `string` | Core Vault XRP address (payment destination) |
| `getDirectMintingFeeBIPS()` | `uint256` | System fee percentage |
| `getDirectMintingMinimumFeeUBA()` | `uint256` | Minimum system fee |
| `getDirectMintingExecutorFeeUBA()` | `uint256` | Fixed executor fee |
| `getDirectMintingHourlyLimitUBA()` | `uint256` | Hourly rate limit |
| `getDirectMintingDailyLimitUBA()` | `uint256` | Daily rate limit |
| `getDirectMintingLargeMintingThresholdUBA()` | `uint256` | Large minting threshold |
| `getDirectMintingLargeMintingDelaySeconds()` | `uint256` | Delay for large mintings |
| `getDirectMintingOthersCanExecuteAfterSeconds()` | `uint256` | Executor exclusivity window |
| `getDirectMintingFeeReceiver()` | `address` | Fee recipient address |
| `directMintingDelayState(bytes32)` | `(DelayState, uint256, uint256)` | Check if a minting is delayed |

#### For Direct Minting Tags (on MintingTagManager)

| Function | Returns | Purpose |
|----------|---------|---------|
| `reservationFee()` | `uint256` | NAT cost to reserve a new tag |
| `mintingRecipient(uint256)` | `address` | FAsset recipient for a tag |
| `allowedExecutor(uint256)` | `address` | Allowed executor for a tag |
| `reservedTagsForOwner(address)` | `uint256[]` | All tags owned by an address |
| `nextAvailableTag()` | `uint256` | Next tag number to be assigned |

#### For Redemptions (on AssetManager)

| Function | Returns | Purpose |
|----------|---------|---------|
| `minimumRedeemAmountUBA()` | `uint256` | Minimum redemption amount |
| `redeemWithTagSupported()` | `bool` | Whether tagged redemption is available |
| `lotSize()` | `uint256` | Lot size in UBA |
| `assetMintingGranularityUBA()` | `uint256` | AMG precision in UBA |
| `getSettings()` | `AssetManagerSettings.Data` | Full settings (includes `redemptionFeeBIPS`) |



# Changes Report: Direct Minting & Redeem With Tag/Amount Support

## New Endpoints

### GET `/api/tags/:fasset/:address`

Returns all minting tags owned by an EVM address from the MintingTagManager contract.

**Parameters:**

-   `fasset` (path) - FAsset symbol, e.g. `FTestXRP`
-   `address` (path) - EVM address to query tags for

**Response:** `TagInfo[]`

```json
[
    {
        "tagId": "12345",
        "mintingRecipient": "0x1234...",
        "allowedExecutor": "0x5678..."
    }
]
```

---

### GET `/api/directMintingExecutor/:fasset`

Returns the executor address and fee from the MasterAccountController contract.

**Parameters:**

-   `fasset` (path) - FAsset symbol, e.g. `FTestXRP`

**Response:** `DirectMintingExecutorResponse`

```json
{
    "executorAddress": "0x1234...",
    "executorFee": "100000000000000000"
}
```

---

### GET `/api/directMintingInfo/:fasset`

Returns everything needed to construct a direct minting transaction: the Core Vault payment address, minimum minting amount, fee parameters, and executor info.

For the new mint flow, this is the primary initial endpoint. The frontend no longer needs the old regular-minting bootstrap calls such as agent list loading, `maxLots`, collateral reservation setup, or other agent-selection data before the user creates the XRP payment.

**Parameters:**

-   `fasset` (path) - FAsset symbol, e.g. `FTestXRP`

**Response:** `DirectMintingInfoResponse`

```json
{
    "paymentAddress": "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    "minMintingAmount": "1000000",
    "mintingFeeBIPS": "500",
    "minimumMintingFeeUBA": "1000000",
    "executorAddress": "0x1234...",
    "executorFee": "100000000000000000",
    "fassetsExecutorFee": "500000"
}
```

-   `paymentAddress` - Core Vault XRP address the user must pay to
-   `minMintingAmount` - Minimum direct minting amount accepted for this FAsset
-   `mintingFeeBIPS` - Direct minting fee in basis points
-   `minimumMintingFeeUBA` - Minimum direct minting fee in UBA
-   `executorAddress` - Executor address returned from the MasterAccountController flow
-   `executorFee` - Executor fee from MasterAccountController
-   `fassetsExecutorFee` - Executor fee in FAsset UBA (drops) for direct minting, from `assetManager.getDirectMintingExecutorFeeUBA()`

Implementation note:

-   There are currently two executor-fee-related values in the response.
-   `executorFee` comes from the MasterAccountController / smart account flow and may remain present even if the standard direct minting flow does not actively use it.
-   `fassetsExecutorFee` is the important value for direct minting amount calculation because it comes from the AssetManager.

---

### GET `/api/mintingRecipient/:fasset/:tagId`

Returns the EVM recipient address for a given minting tag via the MintingTagManager contract.

**Parameters:**

-   `fasset` (path) - FAsset symbol, e.g. `FTestXRP`
-   `tagId` (path) - Minting tag ID, e.g. `12345`

**Response:** `MintingRecipientResponse`

```json
{
    "recipient": "0x1234..."
}
```

---

### GET `/api/tagReservationFee/:fasset`

Returns the tag reservation fee from the MintingTagManager contract. This is the fee required to reserve a minting tag, returned as a string in native wei.

**Parameters:**

-   `fasset` (path) - FAsset symbol, e.g. `FTestXRP`

**Response:** `TagReservationFeeResponse`

```json
{
    "reservationFee": "100000000000000000"
}
```

---

## Changed Endpoints

### GET `/api/mint/:txhash`

This remains the polling endpoint after the user submits the XRP minting transaction. The `txhash` is the XRP transaction hash.

**New optional fields in `MintingStatus` response:**

-   `delayed?: boolean` — Whether this direct minting is in a delayed state. Only present for DirectMinting lookups.
-   `delayTimestamp?: number` — Unix timestamp (seconds) when a delayed direct minting can be executed. `0` when not delayed.

The endpoint now also tracks **DirectMinting** (Core Vault) lifecycle in addition to traditional agent-based minting. When no traditional `Minting` entity is found for the txhash, the service falls back to looking up a `DirectMinting` entity.

**DirectMinting step mapping:**
| Condition | `status` | `step` | `delayed` | `delayTimestamp` |
|-----------|----------|--------|-----------|-----------------|
| Processed (executed) | `true` | `4` | `false` | `0` |
| Within 90s of creation | `false` | `0` | actual | actual or `0` |
| Delayed (waiting for delay window) | `false` | `0` | `true` | actual or `0` |
| Not delayed, past 90s (execution pending) | `false` | `3` | `false` | `0` |
| Not found | `false` | `0` | — | — |

**Example responses:**

Traditional minting (unchanged):

```json
{ "status": false, "step": 2 }
```

Direct minting (delayed):

```json
{ "status": false, "step": 0, "delayed": true, "delayTimestamp": 1711900800 }
```

Direct minting (processed):

```json
{ "status": true, "step": 4, "delayed": false, "delayTimestamp": 0 }
```

---

### GET `/api/userProgress/:address`

**New optional query parameter:** `xrpAddress` (string)

When provided, the response now includes:

-   **Direct minting entries** (`action: "MINT"`) with:
    -   `directMinting: true`
    -   `directMintingStatus: string` - one of: `INPROGRESS`, `DELAYED`, `EXECUTED`, `EXECUTED_TO_SMART_ACCOUNT`, `MINTING_PAYMENT_TOO_SMALL_FOR_FEE`
    -   `delayTimestamp: number | null` - Unix timestamp (seconds) when a delayed direct minting becomes executable. Non-null only when `directMintingStatus` is `DELAYED`.
-   **Redemption with tag entries** (`action: "REDEEM"`) with:
    -   `redeemWithTag: true`
    -   `redeemStatus: string` - one of: `INPROGRESS`, `FAILED`, `BLOCKED`, `DEFAULTED`, `COMPLETED`
    -   `destinationTag: string`
-   **Amount-based incomplete data:**
    -   `remainingAmount: string` - UBA amount remaining for incomplete redemptions

**Example request:** `GET /api/userProgress/0x1234...?xrpAddress=rXYZ...`

---

### GET `/api/redemptionFee/:fasset`

For the new redeem flow, the frontend supports both:

-   `redeemAmount(_amountUBA, address, executor)`
-   `redeemWithTag(_amountUBA, address, executor, destinationTag)`

The frontend should switch between these two contract methods depending on whether the user entered a destination tag and whether tagged redemption is supported for the asset/network.

Executor address and executor fee for redemption can be fetched from:

-   `GET /api/directMintingExecutor/:fasset`

This endpoint returns the smart-account executor and executor fee in wei.

**New field in response:**

-   `minimumRedeemAmountUBA: string` - Minimum redeem amount in UBA (drops), calculated from `lotSizeAMG * assetMintingGranularityUBA`

**Updated response:**

```json
{
    "redemptionFee": "200",
    "maxRedemptionLots": 123,
    "maxLotsOneRedemption": 212,
    "minimumRedeemAmountUBA": "20000000"
}
```

---

### GET `/api/redemptionQueue/:fasset`

For the new redeem flow, the frontend should use the amount-based fields from this endpoint, not only the lot-based ones. The backend now returns both lots and drops/XRP totals so the UI can determine how much is redeemable in amount mode.

**New fields in response** (amounts in addition to lots):

-   `maxAmountOneRedemptionDrops: string` - Max single redemption amount in drops/satoshis
-   `maxAmountOneRedemptionXRP: string` - Max single redemption amount in XRP (human-readable)
-   `maxAmountDrops: string` - Total max redeemable amount in drops/satoshis
-   `maxAmountXRP: string` - Total max redeemable amount in XRP (human-readable)

**Updated response:**

```json
{
    "maxLotsOneRedemption": 12,
    "maxLots": 55,
    "maxAmountOneRedemptionDrops": "50000000",
    "maxAmountOneRedemptionXRP": "50.000000",
    "maxAmountDrops": "500000000",
    "maxAmountXRP": "500.000000"
}
```

---

### GET `/api/redemptionStatus/:fasset/:txhash`

**Behavioral changes:**

-   Now handles **tag-based redemptions** (`RedemptionWithTagRequested` events) in addition to standard `RedemptionRequested`. When no standard `Redemption` entities exist for the txhash, the service falls back to `RedemptionWithTagRequestedEvent` entities to determine payment status.
-   Now handles **amount-based incomplete** (`RedemptionAmountIncomplete` events). The `incompleteData` field may contain `remainingAmountUBA` instead of (or in addition to) `remainingLots`.
-   **DB-first optimization**: The service now first checks `RedemptionRequestedEntity` and `RedemptionWithTagRequestedEvent` tables before hitting the blockchain for event parsing, reducing RPC calls.
-   Defensively checks `IncompleteRedemption` and `RedemptionAmountIncompleteEvent` DB tables if incomplete data was not found from event parsing.

**Updated `incompleteData` shape:**

```json
{
    "redeemer": "0x...",
    "remainingLots": "30",
    "remainingAmountUBA": "500000"
}
```

Both `remainingLots` and `remainingAmountUBA` are now optional — one or both may be present depending on the type of incomplete event.

Implementation note:

-   Existing `redemptionStatus` and `redemptionDefaultStatus` endpoints remain in use for the new redeem flow.
-   For amount-based redemptions, prefer `remainingAmountUBA` when present.

---

### GET `/api/requestRedemptionDefault/:fasset/:txhash/:amount/:userAddress`

**New optional field in `RequestRedemption` response:**

-   `remainingAmountUBA?: string` — Remaining amount in UBA for amount-based incomplete redemptions (from `RedemptionAmountIncomplete` events)

**Updated response:**

```json
{
    "incomplete": true,
    "remainingLots": "30",
    "remainingAmountUBA": "500000"
}
```

Implementation note:

-   Existing redemption default handling stays in place.
-   For amount-based redemption flows, `amount` and `remainingAmountUBA` are in UBA.

---

### GET `/api/redemptionDefaultStatus/:txhash`

### UBA Units

Where the documentation or API response uses a field name ending with `UBA`, the value is expressed in the underlying asset's smallest unit.

Examples:

-   On XRP, `*UBA` means XRP drops
-   On BTC/DOGE, `*UBA` means the chain's smallest base unit

**Behavioral changes:**

-   Now handles **tag-based redemptions**. When no standard `Redemption` entities exist for the txhash, the service falls back to `RedemptionWithTagRequestedEvent` entities.
-   For tag-based redemptions, checks `processed` status and `status` field (`DEFAULTED` / `COMPLETED`) to calculate collateral payouts and underlying paid amounts.
-   Returns `{ status: false }` if tag-based entities are not yet fully processed.

---

https://docs.google.com/document/d/1akgeN5hW3mfTvn82pG9aELIQLahre10AW3CkC4lQ9O8/edit?tab=t.ncsn79tsvxvf#heading=h.j3q2pzctx3f

---

## HYPE FXRP → XRPL Bridge: Compose Message Encoding (FAssetRedeemComposer)

### Pogodba

`FXRP_COMPOSER_ADDRESS = 0xa10569DFb38FE7Be211aCe4E4A566Cea387023b0`

### Ozadje

Nova pogodba `FAssetRedeemComposer` dekodira bogatejši `RedeemComposeMessage` struct v `lzCompose`. Stara 2-polja enkodiranja `(["address", "string"])` **ni več veljavna** in bo povzročila revert na `require(redeemComposeMessage.redeemer != address(0))`.

### Enkodiranje — tuple s 6 polji

```typescript
import { AbiCoder, ethers } from "ethers";

const abiCoder = AbiCoder.defaultAbiCoder();

const tag = destinationTag && destinationTag.trim() !== '' ? destinationTag.trim() : '0';

const composeMsg = abiCoder.encode(
    ['tuple(address, string, bool, uint256, address, uint256)'],
    [[
        signerAddress,       // redeemer — EVM naslov uporabnika na Flare
        destinationAddress ?? '',  // redeemerUnderlyingAddress — XRP naslov
        tag !== '0',         // redeemWithTag — true če tag podan
        BigInt(tag),         // destinationTag — uint256; 0 če ne rabimo taga
        ethers.ZeroAddress,  // executor — ZeroAddress = defaultExecutor()
        BigInt(executorFee ?? '0'),  // executorFee — iz GET /api/oft/redemptionFees/:srcEid
    ]]
);
```

### Semantika polj (on-chain struct `RedeemComposeMessage`)

| Polje | Tip | Opis |
|-------|-----|------|
| `redeemer` | `address` | EVM naslov uporabnika na Flare. Ne sme biti zero — kontrakt revert z `InvalidAddress()`. |
| `redeemerUnderlyingAddress` | `string` | XRP naslov prejemnika. |
| `redeemWithTag` | `bool` | `true` → kontrakt uporabi tag-variant pot; `destinationTag` se upošteva. `false` → plain redemption; tag se ignorira on-chain. |
| `destinationTag` | `uint256` | XRP destination tag. **Mora biti vedno prisoten v encodingu** — tudi ko se ne uporablja, pošlji `0`. |
| `executor` | `address` | Override za LZ executor. `ZeroAddress` uporabi `defaultExecutor()` pogodbe. |
| `executorFee` | `uint256` | Fee za executorja. Pride iz `GET /api/oft/redemptionFees/:srcEid` → polje `executorFee`. Trenutno `0`. |

### Pravilo za `redeemWithTag`

- `destinationTag` prazen string ali `undefined` → `tag = '0'` → `redeemWithTag = false`
- `destinationTag` podan (npr. `"12345"`) → `tag = '12345'` → `redeemWithTag = true`

### LayerZero opcije (ostanejo enake)

```typescript
options = Options.newOptions()
    .addExecutorLzReceiveOption(400_000, 0)
    .addExecutorComposeOption(0, 5_000_000, executorFee ?? '0');
```

`executorFee` pride iz `GET /api/oft/redemptionFees/:srcEid` → polje `executorFee`.
