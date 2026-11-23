# Bridge scenarios — index

One folder = one `scenario_group` (QA convention), so the scenarios are grouped by **id prefix**
instead of subfolders. Start with the routes: they replace the QA repo's old bridge specs, which
describe the card-based page that the redesign removes.

Testnet: Mint & Bridge completes only to Ethereum (Sepolia); LayerZero Scan does not index
Coston2, so Scan-based statuses are mainnet only; Base Sepolia is peered only with Coston2.

## Routes — the normal transfer on each route type

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-route-flare-to-remote`](bridge-route-flare-to-remote.md) | Flare to a remote chain | P1 | ui | all |
| [`bridge-route-flare-to-xrpl`](bridge-route-flare-to-xrpl.md) | Flare to XRPL (redeem) | P1 | ui | all |
| [`bridge-route-hyperevm-hyperliquid`](bridge-route-hyperevm-hyperliquid.md) | HyperEVM and Hyperliquid, both directions | P2 | ui | all |
| [`bridge-route-remote-to-flare`](bridge-route-remote-to-flare.md) | Remote chain to Flare | P1 | ui | all |
| [`bridge-route-remote-to-remote`](bridge-route-remote-to-remote.md) | Between two remote chains | P2 | ui | all |
| [`bridge-route-remote-to-xrpl`](bridge-route-remote-to-xrpl.md) | Remote chain to XRPL (bridge + redeem) | P1 | ui | all |
| [`bridge-route-xrpl-to-flare`](bridge-route-xrpl-to-flare.md) | XRPL to Flare (mint) | P1 | ui | all |

## Mint & Bridge (XRP → FXRP on a remote chain in one payment)

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-mint-and-bridge-delayed`](bridge-mint-and-bridge-delayed.md) | Minting delayed by the rate limit | P2 | harness | all |
| [`bridge-mint-and-bridge-fee-changed`](bridge-mint-and-bridge-fee-changed.md) | Fee changed between preview and request | P2 | harness | all |
| [`bridge-mint-and-bridge-happy-path`](bridge-mint-and-bridge-happy-path.md) | XRPL to Ethereum in one XRP payment | P1 | ui | coston2 |
| [`bridge-mint-and-bridge-custom-recipient`](bridge-mint-and-bridge-custom-recipient.md) | Mint & Bridge to another EVM address; EVM wallet still required | P1 | ui | coston2 |
| [`bridge-mint-and-bridge-payment-too-small`](bridge-mint-and-bridge-payment-too-small.md) | Payment too small for the fee | P2 | harness | coston2 |

## Mint & Bridge recovery

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-recovery-already-executed`](bridge-recovery-already-executed.md) | Bridge executed after all | P2 | harness | all |
| [`bridge-recovery-happy-path`](bridge-recovery-happy-path.md) | Recover to the Personal Account | P1 | ui | coston2 |
| [`bridge-recovery-no-double-payment`](bridge-recovery-no-double-payment.md) | No second payment while processing | P1 | ui | coston2 |
| [`bridge-recovery-trigger-awaiting`](bridge-recovery-trigger-awaiting.md) | Put a payment into awaiting recovery | P1 | harness | coston2 |
| [`bridge-recovery-wrong-xrpl-wallet`](bridge-recovery-wrong-xrpl-wallet.md) | Different XRPL wallet connected | P2 | ui | all |

## Asset Recovery (redeemer account)

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-asset-recovery-transfer`](bridge-asset-recovery-transfer.md) | Transfer the redeemer account balance | P1 | harness | coston2 |

## Guards — pauses, limits, account checks

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-guard-hyperliquid-custom-recipient`](bridge-guard-hyperliquid-custom-recipient.md) | To Hyperliquid with a custom recipient, active and inactive | P1 | ui | all |
| [`bridge-guard-hyperliquid-inactive-account`](bridge-guard-hyperliquid-inactive-account.md) | To Hyperliquid with an inactive account or a failing account check | P1 | ui | all |
| [`bridge-guard-hyperliquid-to-hyperevm`](bridge-guard-hyperliquid-to-hyperevm.md) | Hyperliquid to HyperEVM guards | P3 | ui | all |
| [`bridge-guard-wallet-capabilities`](bridge-guard-wallet-capabilities.md) | Routes the connected wallet cannot sign are disabled with a reason | P2 | ui | all |
| [`bridge-guard-oft-rate-limit`](bridge-guard-oft-rate-limit.md) | OFT rate limit caps the amount | P2 | harness | all |
| [`bridge-guard-system-pause`](bridge-guard-system-pause.md) | FAsset or OFT pause locks the page | P1 | harness | all |
| [`bridge-guard-to-xrpl-limits-and-account-checks`](bridge-guard-to-xrpl-limits-and-account-checks.md) | Limits, account flags and destination tag | P1 | ui | all |

## Latest transactions

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-history-mint-and-bridge-statuses`](bridge-history-mint-and-bridge-statuses.md) | Row status from LayerZero delivery | P2 | harness | flare |
| [`bridge-history-remote-to-flare-in-flight`](bridge-history-remote-to-flare-in-flight.md) | In-flight remote to Flare transfer in Latest transactions | P2 | ui | flare |

## Form and wallet prompts

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-ui-cta-states`](bridge-ui-cta-states.md) | CTA label and form resets | P3 | ui | all |
| [`bridge-ui-swap-direction`](bridge-ui-swap-direction.md) | Swap FROM and TO; recipient and amount reset | P2 | ui | all |
| [`bridge-ui-swap-unsupported`](bridge-ui-swap-unsupported.md) | Swap off where the reverse is not supported | P3 | ui | all |
| [`bridge-ui-wallet-reject`](bridge-ui-wallet-reject.md) | Rejected signature on every wallet prompt | P2 | ui | all |

## Deep link (`/bridge?srcChain=…&dstChain=…&amount=…&recipient=…&tag=…`)

| Scenario | What | Priority | Trigger | Networks |
|---|---|---|---|---|
| [`bridge-deeplink-amount-clamp`](bridge-deeplink-amount-clamp.md) | Amount above the balance set to the maximum | P1 | ui | all |
| [`bridge-deeplink-recipient-and-tag`](bridge-deeplink-recipient-and-tag.md) | Recipient and destination tag from the URL | P1 | ui | all |
| [`bridge-deeplink-prefill`](bridge-deeplink-prefill.md) | Route and amount filled in from the URL | P2 | ui | all |
| [`bridge-deeplink-invalid-values`](bridge-deeplink-invalid-values.md) | Invalid, unknown and unsupported values ignored | P2 | ui | all |
| [`bridge-deeplink-url-sync`](bridge-deeplink-url-sync.md) | Form changes written back into the URL | P3 | ui | all |
