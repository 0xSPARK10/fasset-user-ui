FAsset v1.3
Overview
Direct Minting
Minting Options
Minting Tag Manager
Executors
Rate Limits and Security
Redemption
Redemption Flow
New options



Overview
FAsset v1.3 is an intermediate version between the existing FAsset System v1.2 — which relies heavily on agents — and FAsset System v2.0, where TEEs will replace agents entirely. Version 1.3 already brings some of the key advantages originally planned for v2.0:
Capacity — Solves the liquidity bottlenecks of agents, offering practically infinite minting capacity.
UX — Simplifies the user journey by removing the need to choose an agent during the minting process.
In previous versions, minting required the user to mint against an agent — the agent reserved collateral, received the underlying asset, and the system minted FAssets in return. This process involved multiple steps and was constrained by agent capacity and collateral availability.
In v1.3, users can now mint directly to the core vault, bypassing agents entirely for the minting process. The user sends a transaction on the underlying chain (XRPL) to the core vault address, and an executor relays the proof to Flare, triggering the mint. This is a one-transaction operation on the underlying chain with no prior announcement on Flare required.
Agents remain essential for redemption, where they act as the payout layer — receiving underlying assets from the core vault and fulfilling redemption requests to users. The collateralized security model for redemption remains unchanged.
On the redemption side, v1.3 adds the ability to redeem any amount (not just whole lots), introduces redeem with destination tag (for direct redemption to exchanges), and adds a minimum redemption amount setting to prevent dust issues.
Rate limiting is introduced for minting to maintain security — hourly, daily, and large minting thresholds with automatic delays, plus governance override capability.



Direct Minting
Direct minting allows users to mint FAssets by simply sending a transaction on the underlying chain (currently XRP on XRPL) to the core vault. No collateral reservation or agent interaction is needed on the minting side.
The transaction must contain either a destination tag or a memo field to identify the recipient on Flare. If neither is provided, the minted FAssets are sent to the source address's smart account.
Minting Options
There are several ways to specify the minting target:
Reserved tag, no memo — FAssets are minted to the Flare address registered for that tag. This is the simplest option for repeated use: one-time tag reservation on Flare, then all future mints are plain transactions with a tag (supported by all XRPL wallets and exchanges).
No tag, special memo — A memo field with the prefix 0x4642505266410012 followed by the recipient's Flare address mints directly to that address.
No tag, no memo — FAssets are minted to the sender's smart account on Flare.
Custom memo — All other memo formats are routed to the smart account manager, which interprets the instruction or sends it to the donation account.
Minting Tag Manager
Since destination tags are a limited resource on XRPL, users must reserve a tag by paying a reservation fee in native currency (FLR/SGB). The fee is fixed and can be changed by governance. Reserved tags cannot be returned for a refund.
The tag manager implements the ERC-721 (NFT) interface, meaning reserved tags can be transferred or resold. Each tag has an owner and a minting recipient — on reservation or transfer, the recipient is automatically set to the new owner.
The owner can configure:
Minting recipient — the Flare address that receives the minted FAssets.
Allowed executor — restricts who can trigger the minting execution. If set to zero address (default), anyone can execute.
Flare reserves the first tags (e.g. first 20) for special system purposes, such as donations to the core vault.
Executors
Once a minting transaction appears on the underlying chain, an executor relays the proof to Flare by calling executeDirectMinting. The executor is a trustless role — anyone can participate and is compensated with an executor fee upon successful execution.
The executor can be restricted by the minter in three ways:
Tag-based minting — the tag owner sets the allowed executor via the tag manager.
Memo-based minting — a 48-byte memo format encodes both the recipient and the allowed executor address.
Smart account minting — the smart account manager may restrict which executors are accepted.
If the preferred executor does not execute within a configurable time (othersCanExecuteAfterSeconds), anyone can step in and execute the minting.
Executor fees:
For minting to an address (via tag or memo), the fee is a fixed amount defined by the system (directMintingExecutorFeeUBA).
For minting to a smart account, the fee is calculated and charged by the smart account manager.
Rate Limits and Security
To protect the system in case of compromise (e.g. of FDC), direct minting is subject to rate limits:
Hourly limit (directMintingHourlyLimitUBA) — caps the total minted amount per hour.
Daily limit (directMintingDailyLimitUBA) — caps the total minted amount per day.
Large minting threshold (directMintingLargeMintingThresholdUBA) — mintings above this amount are not counted toward hourly/daily quotas. Instead, each large minting receives an automatic delay (directMintingLargeMintingDelaySeconds), with delays being cumulative for multiple large mintings.
When a limit is reached, mintings are delayed, never blocked permanently. A DirectMintingDelayed event is emitted with an executionAllowedAt timestamp. Once that time is reached, the executor can call executeDirectMinting again and it will succeed.
Governance override: governance can call unblockDirectMintingsUntil to release all delayed mintings that were initiated before a given timestamp (must be in the past, assuming manual review has occurred).
There is no minimum minting amount, but a minimum minting fee ensures that very small mintings are effectively covered by fees.


Redemption
The redemption process in v1.3 remains largely the same as previous versions — the user burns FAssets and receives the underlying asset from an agent. The key changes are around flexibility of redemption amounts and support for destination tags.
Redemption Flow
The redeemer initiates a redemption by calling redeem, redeemAmount, or redeemWithTag.
The system selects redemption tickets from the front of the FIFO queue (capped per request to limit gas).
FAssets are burned from the redeemer's account.
For each participating agent, a RedemptionRequested event is emitted with payment details (underlying address, amount, payment reference, deadline, optional executor).
Each agent pays the redeemer on the underlying chain with the correct payment reference.
The agent proves the payment via FDC, freeing their collateral.
New options
Redeem Any Amount
The new redeemAmount method allows redeeming any amount of FAssets, not only whole lots. This solves the common problem where users end up with small balances (e.g. 9 FXRP) that fall below the lot size and cannot be redeemed.
A minimum redemption amount (minimumRedeemAmountUBA) setting is introduced to prevent very small redemptions that would cost agents more in fees than they receive. Lot sizes remain unchanged for the standard redeem method to preserve redemption queue ticket sizing (the queue is capped at 20 tickets per redemption, and smaller lots would reduce the maximum redeemable amount per call).
Redeem with Tag
The redeemWithTag method allows the redeemer to request that a destination tag is added to the underlying payment. This enables direct redemption to exchanges and custodians that use tag-based addressing.
Like redeemAmount, it also supports any redemption amount (not just whole lots). It uses a new FDC proof type that supports destination tags, with dedicated methods (confirmXRPRedemptionPayment, xrpRedemptionPaymentDefault) and a new event (RedemptionWithTagRequested). This feature is XRPL-specific and gated by the redeemWithTagSupported flag.
Redemption Fee
The redemption fee is the portion of the underlying asset not returned to the redeemer. Part is retained by the agent, while the rest is minted into FAssets and deposited into the pool (same percentage split as during minting). This fee creates a margin that allows agents to cover transaction costs on the underlying chain.
Redemption Time Extension
To prevent DDoS attacks where many simultaneous redemption requests could overwhelm an agent (forcing payment defaults and collateral loss), a time extension mechanism is applied. Each concurrent redemption request adds redemptionPaymentExtensionSeconds to the agent's payment deadline, using a leaky bucket algorithm that gradually returns to the default as request pressure decreases.
