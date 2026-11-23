# Changelog

All notable changes to FAsset User UI are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

## [1.5.0] — 2026-11-23

- Fireblocks: the `/fireblocks-proxy` relay answers 404 on deploys where Fireblocks is not in `ENABLED_WALLETS`, so it is not an open relay to the Fireblocks API
- Bridge: routes the connected wallet cannot sign are off in the FROM / TO list, with the reason on hover or tap (e.g. "Fireblocks can't sign on HyperEVM. Connect another wallet to bridge from HyperEVM.", "Fireblocks can't add a memo to XRP payments, so this route isn't available. Mint to Flare first, then bridge."); the swap button and routes from a link show the same reason and Bridge stays disabled. Before, such a route failed only after Bridge was clicked
- Fireblocks: on Flare and Songbird one Fireblocks connect also connects the Flare side (the vault's FLR / SGB address) — tags, redeem, pools and bridge from Flare are signed in the Fireblocks mobile app as contract calls, no MetaMask or WalletConnect needed. Needs a Contract call policy rule with a human signer in the workspace. Other chains and testnet (Fireblocks has no Coston2) keep using another wallet for the EVM side
- Fireblocks: connecting failed with 404 on deploys where every `/api/*` request goes to the backend; the browser now calls the Fireblocks relay on `/fireblocks-proxy/…`, which Next maps to its own API route
- Bridge: Flare → XRPL let Bridge be clicked without enough FLR for the executor fee and then failed with a raw wallet error ("insufficient funds for gas * price + value"); Bridge now stays disabled. On every bridge route the message names the amount, e.g. "Not enough FLR to cover the fees. You need about 10 FLR plus a small amount for gas, but you have 2.61 FLR." (both amounts with the same decimals) (was "Not enough native token for LayerZero cross-chain fee."); when the balance can't be loaded it reads "…balance for the fees" (was "…for the cross-chain fee")
- Bridge: Hyperliquid → HyperEVM failed for Hyperliquid accounts in Unified account mode (the mode Hyperliquid recommends) with "Action disabled when unified account is active"; the transfer now uses Hyperliquid's `sendAsset` (was `spotSend`) and works in every account mode
- Bridge: amounts below 1 (e.g. 0.5) could not be typed on routes that take decimals; Mint still takes whole XRP
- Latest transactions (Bridge and Mint pages): every amount shows two decimals, cut and never rounded up (e.g. 5 → 5.00, 9.94801 XRP → 9.94) — bridge, Hyperliquid and Mint & Bridge rows and the XRP of redemption tickets were shown as received
- Pages without a connected wallet no longer request `/api/balance/native/undefined`
- Bridge: clicking the already picked TO chain cleared the recipient and destination tag behind the scenes while the fields still showed them — after correcting the address, a transfer to XRPL went without the tag shown; the click now changes nothing
- Bridge: XRPL → Flare with a destination address typed before connecting the EVM wallet minted the FXRP to the wallet, not the typed address, when the wallet had a minting tag (the payment carried the wallet's tag); the typed address now goes in the payment memo
- Bridge: the arrow between FROM and TO is a swap button — it switches the two chains (e.g. Flare → HyperEVM becomes HyperEVM → Flare); the amount, a custom recipient and the destination tag clear as with any chain change. It is off until both chains are picked, during a pause, and where the reverse direction is not supported (anything → Hyperliquid except from HyperEVM; XRPL → other chains when Mint & Bridge is not offered) — hovering or tapping it then explains why (e.g. "Bridging from Hyperliquid to Flare isn't supported"). It is also off while a Bridge click is being sent (not while fees load)
- Bridge: changing a chain no longer flashes an error for the old amount on the new route (e.g. "Not enough native token for LayerZero cross-chain fee." for a moment after Ethereum → BNB became BNB → Ethereum)
- Bridge → Hyperliquid (from HyperEVM, Flare, other chains or XRPL): when the Hyperliquid account check fails, Bridge stays disabled with "Couldn't load your Hyperliquid account. Try again later." (own account) or "Couldn't check the destination address on Hyperliquid. Try again later." (custom recipient) — before, the transfer was allowed and an inactive account's FXRP could end up in escrow or on HyperEVM. The check is retried once (was three times) before the message shows, and runs again every 10 s while it fails or the account is not active — Bridge unblocks by itself once Hyperliquid answers or the account is activated in another tab; while it runs the button shows loading
- Bridge: XRP → FXRP on another chain (Mint & Bridge) offers "Custom" — the FXRP can go to any EVM address (was always the connected EVM wallet); to Hyperliquid the address must have an active Hyperliquid account. An EVM wallet stays required — Latest transactions and the recovery of a stuck transfer are found by it; without one the notice reads "Connect an EVM wallet. Latest transactions and recovery of a stuck transfer need it." (was "Connect an EVM wallet to receive the FXRP.")
- Bridge: Mint & Bridge on mainnet without a connected EVM wallet quoted the fee and tracked the delivery with the testnet LayerZero endpoint ID; the network now comes from the app's configuration
- Bridge: Flare and other chains → Hyperliquid offer "Custom" — the FXRP can go to another address's Hyperliquid account (was always the sender's). An address without an active Hyperliquid account shows "The destination address has no active Hyperliquid account. Activate it on Hyperliquid first, or the FXRP arrives on HyperEVM instead." and Bridge stays disabled
- Bridge: Hyperliquid → HyperEVM with a WalletConnect wallet failed with "Could not coalesce error" (the session did not allow typed-data signing); reconnect the wallet once to get the new permission
- Bridge: XRP → FXRP on another chain (Mint & Bridge) — Max and a /bridge link's amount include the LayerZero fee from the start; before, a link could set 1 XRP above the max (the LayerZero fee was known only after an amount was entered) and leave Bridge disabled without a message
- Bridge: a route whose LayerZero contract has no peer for the destination (e.g. Base Sepolia ↔ BNB testnet) shows the error "This route is not available yet." instead of the raw "NoPeer" error
- Bridge: the amount can be entered before a wallet is connected — fees and the received amount show what the transfer would cost (Max stays off, the button reads "Connect wallet"); a /bridge link's amount fills in right away. After connecting, an amount above the balance is set to the balance
- Bridge: the gas token on Base and Katana shows the ETH icon with a Base / Katana badge; the FXRP on Ethereum icon is redrawn from the design library, and the Ethereum and Base badges have a solid outline (was dotted at small sizes)
- Bridge: Latest transactions — a bridge from another chain to XRPL (or Flare) shows one row once it reaches Flare; the LayerZero row is matched to the backend row by its LayerZero `guid` (it stayed as a second "In progress" row on testnet)
- Bridge → XRPL (from Flare and from other chains): when the redemption queue can take less than the balance, a blue notice reads "Current max redeemable: N FXRP." (FROM still shows "N redeemable"); an amount above it shows the "above max" warning instead
- Bridge: too little gas for the LayerZero fee reads "Not enough native token for LayerZero cross-chain fee." (was "Insufficient {{token}} for LayerZero cross-chain fee")
- Bridge: XRP → FXRP (Mint & Bridge) asks to confirm a changed fee ("The fee changed: …") only when the new quote is worse by more than 1 XRP — before, any change of 1 drop showed it, i.e. almost every time; smaller changes sign right away with the new quote
- Bridge → XRPL: the composer fee is its own row "Composer fee" in FXRP (shown only when it is not 0 — testnet today); "Redemption fee" in XRP is the redemption cut alone (both were one "Redemption fee"). "N available" under the source token is what Max sends (balance less the composer fee), not the full balance
- Bridge: Ethereum, BNB Chain, Base, Katana and Monad → Hyperliquid in one transaction — LayerZero to HyperEVM, the Hyperliquid composer moves the FXRP to the recipient's Hyperliquid account; Latest transactions shows these with the Hyperliquid icon
- Bridge: Hyperliquid ↔ HyperEVM modals read "Bridge {{fAsset}} to …", "Finished" and "Bridge fee" (were "Transfer …", "Transfer sent", "Transfer fee")
- Wallet (MetaMask): when MetaMask does not switch to the transaction's network (switch rejected, another request pending, or the added network not switched to), the action stops with MetaMask's error or "MetaMask did not switch to {{network}}. Approve the network switch in MetaMask and try again." — before, it went on and failed with "The network could not process the transaction right now"; MetaMask mobile's wrapped "unknown network" error now adds the network too
- Bridge: Latest transactions — mint and redeem amounts show two decimals (e.g. "6.00", was "6"), like the other rows
- Bridge and /mint: Latest transactions — the redemption ticket ID of a Flare → XRP redeem links to the FAssets explorer, like on bridge → XRPL rows
- Bridge: a deep link with a malformed destination tag (e.g. `tag=-1`, `tag=1.5`) no longer drops the tag silently — the tag field stays empty with "Destination tag must be a whole number between 0 and 4294967295" and Bridge is blocked until the tag is corrected, so a payment cannot go out without the tag by mistake
- Bridge: Hyperliquid → HyperEVM works with Ledger — the transfer is signed in the Ethereum app (fields shown on the device; a Ledger without EIP-712 clear signing, e.g. Nano S or an old Ethereum app, signs the hashes and needs Blind signing, otherwise "Enable Blind signing in the Ethereum app settings on your Ledger, then try again.")
- Bridge: deep links — `/bridge?srcChain=…&dstChain=…&amount=…&recipient=…&tag=…` opens the page with the route, amount, recipient and destination tag filled in (chain keys as in Stargate links, plus `xrpl`); changes in the form are written back into the URL. An amount above what can be sent is set to the maximum; a recipient from a link is marked "From the link. Check that this is the right address."; invalid values are ignored
- Bridge: the destination tag input is 14 px on desktop (was 16 px); phones and tablets keep 16 px
- Contract calls: when the RPC cannot be reached, times out or answers with a server error, the modals say "The network could not process the transaction right now. Please try again in a few minutes." instead of the raw ethers error
- Bridge: the destination address and destination tag inputs are 14 px on desktop (were 16 px); phones and tablets keep 16 px
- Bridge: Latest transactions — hovering the gray circle of a Mint & Bridge row whose destination is not known yet reads "Destination not available yet"
- Bridge: Latest transactions — a Mint & Bridge whose recovery is paid shows one "Recovering" status badge (was "Needs recovery" + "Recovering…")
- Bridge: Latest transactions show amounts without "≈"
- Bridge: a Mint & Bridge whose recovery is paid shows "Recovering…" instead of Recover in the notice and in Latest transactions, also after a page reload — from the backend's new `RECOVERY_PENDING` status (before, a reload offered Recover again and the recovery could be paid twice)
- Bridge: Latest transactions — a Mint & Bridge row in "Needs recovery" shows its amount without "≈", and Recover / Open FSA app sit right next to the status badge
- Mint (bridge page and /mint) with Xaman: Max leaves room for Xaman's own fee (0.1% from $50k, 0.07% from $100k), so it no longer shows an error; the error reads "Insufficient XRP balance (Xaman fee included)" instead of "Insufficient XRP for reservation fee"
- Bridge: the Asset Recovery notice reads "Recovery needed: Your previous bridge transaction didn’t complete, but your funds are safe – they’re held in a recovery account. Transfer them back to your wallet."; the Hyperliquid → HyperEVM fee row reads "Transfer fee" (was "Transfer fee (paid on Hyperliquid)")
- Bridge: Mint & Bridge Recover modal — the recovery fee sits under the amount, the review text is no longer bold, and the space under the buttons matches the space above them
- Wallet confirm notices read "Open Xaman Wallet, check under Events -> Requests and confirm the transaction.", "Launch {{appName}} in Ledger before confirming the transaction." and "Open {{wallet}} and confirm the transaction." — without "Please" / "your", on every page (WalletConnect had this wording on the bridge page only)
- Bridge: the Asset Recovery Transfer modal stays open on "Finished" after the transfer — it closed by itself a second later, because the emptied redeemer account hid the notice the modal lived in
- Bridge: the Asset Recovery Transfer modal has 40 px above and below the amount and the destination address (Figma) — there was extra space under the address
- Bridge: the Asset Recovery notice appears without a reload after a bridge → XRPL whose redeem failed — the redeemer account balance refreshes every 45 s and as soon as Latest transactions shows the transfer finished (before, it loaded only once with the page)
- Inputs in desktop Safari are 14 px like in other browsers (were 16 px — the iOS anti-zoom rule also matched macOS Safari); iPhone / iPad keep 16 px
- Bridge: the destination address and destination tag inputs show their text in the same black as the shown address (was gray); "Change", "Use my wallet" and "Remove" are 12 px like the labels next to them
- Bridge: the FROM / TO addresses no longer show a wallet icon (or the gray placeholder circle) in front of them
- Contract calls: when the network cannot estimate or simulate a transaction ("missing revert data" — RPC unavailable or a revert without a reason), the modals say "The network could not process the transaction right now. Please try again in a few minutes." instead of the raw ethers error
- Wallet: when MetaMask blocks the site's requests after several rejections in a row (spam filter, code 4100), bridge, redeem, mint and pool actions say "Your wallet blocked the request after several rejections. Wait a minute or reload the page, then try again." instead of "Could not coalesce error - Try reconnecting your wallet."
- Bridge: XRP → FXRP (Mint & Bridge) rows in Latest transactions read "Finished" once LayerZero delivers the transfer (they stayed "In progress" forever), "Delayed" when it is still not delivered after 15 minutes and "Failed" when LayerZero cannot deliver it — mainnet only: testnet LayerZero Scan does not index Coston2
- Bridge: choosing XRPL as the destination (e.g. FXRP → XRP) no longer crashes the bridge page with "Cannot read properties of undefined (reading 'testnet')"
- Bridge: HyperEVM → Hyperliquid to an account that is not active on Hyperliquid yet is blocked, with a blue notice "Your Hyperliquid account isn’t active yet — visit Hyperliquid to activate it." (was a red warning that still allowed the transfer, leaving the FXRP held on Hyperliquid)
- Bridge: Base, Katana and Monad as bridge chains — Flare ↔ chain, chain → XRPL, transfers between any two non-Flare chains and XRP → FXRP (Mint & Bridge) to them; each shown only when listed in `ENABLED_BRIDGE_CHAINS` with its OFT address (`BRIDGE_BASE_FXRP_OFT_ADDRESS`, `BRIDGE_KATANA_FXRP_OFT_ADDRESS`, `BRIDGE_MONAD_FXRP_OFT_ADDRESS`). Testnet has only Base Sepolia, peered with Coston2 alone — its transfers to other non-Flare chains fail at the fee quote until those peers are set. Mint & Bridge to BNB Chain is offered too. WalletConnect sessions made before this release must reconnect to sign on the new chains
- Bridge modals: a transfer from HyperEVM names its source "HyperEVM" instead of "Hyperliquid"
- Bridge: move FXRP between Hyperliquid and HyperEVM (both directions) — one signature (Hyperliquid → HyperEVM, fee in HYPE on Hyperliquid) or one HyperEVM transaction; listed in Latest transactions. Hyperliquid → HyperEVM is not available with Ledger yet
- Bridge redesign (temporary `/bridge-new`): FROM → TO chain picker with a route registry, amount + fee panel, custom destination address, separate mobile layout; live balances, fees, received amount and max for every route (mint, redeem, LayerZero bridge, bridge + redeem to XRPL), the same live validation as the old mint / redeem / bridge forms, custom destination only where the old flows allow it (XRPL address + destination tag, mint address — one address field for every route, no minting tag). The CTA opens the existing confirm step of each flow (bridge, mint with the high-fee check, redeem) with a fresh LayerZero fee; errors before sending show on the page, a failed LayerZero delivery shows a toast. Asset Recovery: funds left on the bridge account after a failed transfer to XRPL show as one box per token (3 per row, stacked on mobile, chain-picker width) with "Transfer" (opens the existing withdraw modal)
- Bridge redesign: the CTA reads "Bridge" on every route (mint / redeem too) and "Select network" until FROM and TO are picked; the chain picker has no "Connect wallet" links (the CTA connects); the amount field is disabled without a source wallet or when nothing can be sent (max 0); "Remove" on the custom address no longer flashes the "required" error
- Bridge: latest transactions no longer request `oft/userHistory/` without a wallet address (404) — the "No transactions available" label stopped flickering on refresh
- Bridge modals: the title and the bridge step name the actual destination — HyperEVM or Hyperliquid — instead of always "Hyperliquid"
- Bridge redesign: closing the confirm modal (after a bridge or with ×) clears the picked networks as well as the amount
- Bridge redesign: the amount field reads like on every other amount input — value on the left, "Max" on the right
- Bridge: Latest transactions columns are 154 / 456 / 114 / 154 / 232 px wide (Figma, with 40 px moved from Type to Status so "Needs recovery" + Recover and "Recovered" + "Open FSA app" fit) and read "Transaction hash" / "Type"; mint and redeem rows in the bridge table have no left indent in the Type column
- Bridge: Latest transactions show a transfer from HyperEVM / Ethereum / BNB Chain to Flare (also bridge + redeem to XRPL) as "In progress" right after it is sent — before, it appeared only once LayerZero delivered it
- Bridge / Mint: hovering a token icon in "Latest transactions" names its network (XRPL, Flare, HyperEVM, Ethereum, BNB Chain, Hyperliquid) — the badged FXRP icons differ only slightly
- Bridge redesign: the selected network's radio dot is no longer cut off on the right
- Bridge: an XRP → FXRP (Mint & Bridge) row still "In progress" no longer shows the Flare FXRP icon as its destination — a neutral circle until the backend matches the transfer to its chain
- Bridge redesign: "Change" / "Use my wallet" are the same gray as the TO / Destination address label
- Bridge redesign: bridge / redeem to XRPL with too little FXRP says "Insufficient balance (min 5 FXRP)" instead of just "Insufficient balance"
- Bridge redesign: the received amount and the fees show up to 6 decimals instead of 2, so an amount like 122.211111 no longer looks cut to 122.21 (fees: temporary)
- Wallet: connecting a Ledger no longer redirects to `/mint` — like the other wallets, it redirects only from the `/connect` page
- Wallet: `?redirect=` after connecting accepts only a path on this site — a link with an external URL (e.g. `/connect?redirect=https://…`) now lands on `/mint` instead of leaving the app
- Bridge redesign: BNB Chain as a bridge chain (Flare ↔ BNB Chain, BNB Chain → XRPL, behind `ENABLED_BRIDGE_CHAINS=…,bsc` + `BRIDGE_BSC_FXRP_OFT_ADDRESS`) and direct transfers between HyperEVM, Ethereum and BNB Chain without going through Flare — bridge page only (WalletConnect sessions made before this release must reconnect to sign on BNB Chain)
- Bridge: "Latest transactions" also lists transfers between two non-Flare chains (e.g. Ethereum → HyperEVM), read from LayerZero Scan with the amount decoded from the message — the backend history only sees transfers through Flare
- Bridge: a send from HyperEVM, Ethereum or BNB Chain no longer fails on a slow wallet receipt — the fallback receipt lookup now asks the chain the transaction was sent on instead of Flare
- Bridge: the redesigned page replaces `/bridge` — works without a wallet (the CTA connects); `/bridge-new` and the "Bridge (new)" menu item are gone, and the old card page (balance cards, bridge modal and forms, Hyperliquid trading link) is removed
- Redeem / Bridge: the XRPL destination tag field no longer cuts a pasted value to 10 digits — `18446744073709551616` used to become `1844674407` and go out as a valid but wrong tag; a tag above 4294967295 now shows the validation error
- Bridge: XRP → FXRP on Ethereum, HyperEVM or Hyperliquid in one XRPL payment (direct mint & bridge), offered when `SMART_ACCOUNTS_API_URL` is set — no EVM signature or gas coin needed
- Bridge: during a system pause (FAsset or bridge) nothing on the bridge page can be picked and a red banner shows; the amount is capped by the current bridge limit of the route
- Bridge: a direct mint & bridge stuck in "Needs recovery" gets a **Recover** button in "Latest transactions" — one small XRP payment releases the FXRP to the Personal Account on Flare — afterwards the row shows "Recovered" with "Open FSA app", where the FXRP is
- Bridge: "Latest transactions" lists direct mint & bridge payments when an XRPL wallet is connected too — status "In progress", "Delayed", "Finished", "Needs recovery" or "Payment too small"
- Bridge: on desktop the network lists line up with the FROM / TO headers above them — the TO list sat further left than the FROM list
- Wallet: connecting with WalletConnect no longer redirects to `/mint` (e.g. from the Bridge page) — it redirects only from the `/connect` page, like the other wallets
- Fees: a longer currency name (e.g. C2FLR after XRP) no longer sticks out of the fee box — the currency column now follows the current labels
- Bridge: "Latest transactions" also lists mints and redeems (with "Try again", tickets and partial redeems, like the Mint page) — all from one backend call (`oft/fullHistory`)
- Bridge: "Custom" destination address on plain transfers between Flare, HyperEVM, Ethereum and BNB Chain — FXRP can go to any EVM address, not only your own (Hyperliquid and XRP → FXRP routes still go to your own address)
- Bridge: from a 1250px wide window the amount panel sits next to the network lists at ~40% of the width, never under 510px (narrower window: below them), so the token name and the amount field fit side by side without "…"; with the panel below the lists the amount field keeps that width instead of stretching; on mobile it is 120px wide
- Bridge page confirm modals (bridge, bridge + redeem, redeem, mint, direct mint & bridge): one wording for every route — title "Confirm in your wallet", no "Please open your wallet app…" sentence, steps read "Confirm the transaction to move your … from … to …" (redeem step: "Redeem FXRP"), WalletConnect card "Open {wallet} and confirm the transaction." — the Mint page keeps its texts
- Bridge: a stuck Mint & Bridge shows a "Recovery needed" box above the form (one per stuck XRP payment, below Asset Recovery) with **Recover** — the modal reviews the amount, the Flare Smart Account and the 0.1 XRP recovery fee, then confirm, wait, and "Open FSA app"
- Bridge: Asset Recovery "Transfer" moves the whole balance (no amount input) — the modal shows the amount and the destination address, then "Confirm in your wallet" and "Finished" — the exact on-chain amount, so nothing is left behind (the shown balance is rounded)
- One button style across the app (`FAssetButton`): black buttons (Next, OK, Confirm, the Bridge CTA) and the small outline ones (Mint, Redeem, Refresh, Recover) look the same everywhere; the black buttons' text is lighter (regular instead of semibold)
- Bridge: when the redemption queue allows less than your balance (redeem, bridge to XRPL), the FROM row shows "N redeemable" instead of "N available"; nothing is written under the amount input anymore — above the redemption queue the field only turns red and the reason stays in the alert box
- Redeem (Mint and Bridge page): an amount above the single-request limit but within the redemption queue is no longer blocked — it redeems partially and the rest stays in your wallet; Max and a typed amount now follow the same limit
- Bridge: XRP → Flare shows "N mintable" in the FROM row (your XRP minus fees and the reserve, within the minting cap) — the "Mint up to …" text under the amount input is gone
- Bridge: a completed Mint & Bridge shows "Finished" in Latest transactions (like other bridge transfers) instead of "Sent"; while the FXRP is still on its way it shows "In progress"
- Bridge → XRPL: Max and "N redeemable" stay within one redemption request (`maxAmountOneRedemptionXRP`), so a partially redeemed rest no longer lands on the bridge account for Asset Recovery
- Bridge: the TO side reads "Change" / "Use my wallet" / "Destination address" / "Dest. tag"; the XRPL destination tag sits next to your wallet address too (below it on 1250–1439px wide windows, where the column is narrow)
- Bridge: "Connect wallet" uses the same black button as the Bridge CTA; the recovery notices are exactly as wide as the network lists; Try again on a bridge-page mint refreshes the row at once; "N redeemable" / "N mintable" never shows more than the bridge rate limit lets through
- Bridge: the CTA reads "Select network" until both networks are picked — also without a wallet — then "Connect wallet" (the source wallet of that route), then "Bridge"

## [1.4.2] — 2026-10-22

- Repo: internal docs (business rules, product notes, AI tooling) are no longer published; MRs now run a gitleaks secret scan

## [1.4.1] — 2026-10-22

- Runtime: Docker image and CI moved from Node 20 (EOL) to Node 22.23.4 — picks up the October 2026 Node.js security release (Brotli RCE, TLS hostname bypasses)

## [1.4.0] — 2026-10-20

- Home: `FAssetPositionCard` is hidden when no Flare (EVM) account is connected — an XRPL-only WalletConnect session (no `eip155` namespace) left `mainToken` undefined and the card showed an endless loader
- Release tooling: `/release` skill, `just bump patch|minor|major` and `just release` (tags `songbird-release` with `vX.Y.Z`); deployers now check out tags. First tag `v1.3.16` marks the previous live state
- Bridge: OFT `send()` gas is now estimated explicitly and submitted with a 1.5x buffer (same as pool enter/exit) — an under-provisioned send burned the LayerZero fee before reverting
- Bridge: a reverted send (status-0 receipt) now shows the transaction hash in the error message, so it can be looked up and reported
- Bridge / XRPL bridge: emptying the amount field clears the stale cross-chain fee and disables Next immediately
- Pools (deposit, withdraw, claim rewards): Next is disabled while the amount field is empty; withdraw also disables Next on non-400 fetch errors
- `BalanceRow`: action buttons wrap to their own line instead of overlapping the label
- Alerts: code-review fixes — XRPL submit alert clears when the destination address changes; dead `coreVault` alert channel removed from `BridgeModal`
- Removed unreachable `SendCPTsModal` / `PayDebtModal`, their forms, the `useTransferCollateralPoolToken` / `useFreeCptApprove` / `useFreeCptPayAssetFeeDebt` hooks and their `en.json` sections (~1500 LOC)
- Fee logic centralized into `core/fees/`: `Fees` class (PPM/BIPS gross-up math for bridge, redeem and mint), `buildFeeItem` helper, `FeeItem` / `FeeValue` types, barrel `index.ts`
- Per-flow fee hooks added under `hooks/fees/` — `useNativeFee`, `useBridgeFees`, `useBridgeXrplFees`, `useMintFees`, `useRedeemFees`, `useReserveMintingTagFees` — each returning ready-to-render fee items
- `FeeBreakdown` shared component added — renders fee-item rows (label, token amount, currency) with aligned currency labels, loading spinner and missing-fee dash
- Inline fee math replaced with the `Fees` class in `useContracts` (XRPL bridge gross-up) and the bridge/mint `ConfirmStepper`s (`Fees.totalToBridgeRaw`, `Fees.mintPaymentRaw`) — on-chain amounts unchanged
- Forms and `ReserveMintingTagModal` migrated to the fee hooks + `FeeBreakdown`, removing per-form fee calculation and fee-display markup (~600 LOC removed)
- `FeeBreakdown` icon render guarded against an undefined `mainToken` (prevents crash on disconnected render)
- `ModalDivider` default vertical margin set to `my=32`; redundant `my="8"` override dropped in `ModalConfirmStep`
- Element imports in `BridgeModal`, `EditExecutorModal`, `RecipientTagModal`, `TransferTagModal`, `RedeemerWithdrawModal` normalized to the `@/components/elements/...` alias
- `FeeBreakdown` `sections` API — several labeled groups share one currency column; `RedeemForm` "you will receive" row now aligns with the fee rows
- `BridgeXrplForm` split into `BridgeXrplForm/` (view + `useBridgeXrplForm` hook); uses `Fees.affordableNet` / `totalToBridge` / `redeemingFee`; queue cap read from `redemptionQueue.maxAmountXRP`
- XRPL bridge: destination tag validated as uint32; Next blocked when a tag is entered but `redeemWithTagSupported()` is false (mirrors `RedeemModal`)
- Form alerts: channel-based `useFormAlerts` hook + `resolveAlert` priority resolver; `MintModal`, `BridgeModal` and pool modals migrated. Balance alert now clears on successful refetch and all alerts reset on modal close
- Inline error boxes in pool modals, `RetryMintModal` and `BridgeModal` replaced with `FormAlert`

## [1.3.17] — 2026-08-31

- Address validation: new `isValidEvmAddress()` guard in `utils/guards.ts` requires the `0x` prefix on top of ethers' `isAddress()` — ethers accepts bare 40-char hex in validation but treats it as an ENS name during contract-call address resolution, which fails on networks without ENS. Adopted in `MintForm` (destination address + tag lookup + submit guard), `SendCPTForm`, `EditExecutorModal`, `RecipientTagModal` and `TransferTagModal`, so bad input is caught at form level instead of surfacing as an ENS error at submit time
- Bridge to XRPL finished step: title changed from "Initiated" to "Finished" and the description now reads "Bridge completed. Your {{underlying}} is now available on XRPL." — the route redeems the FAsset, so `ConfirmStepper` passes `FASSET_COIN.nativeName` as the `underlying` interpolation (XRP on mainnet, testXRP on testnet) instead of the previously hardcoded "XRP"
- Connect wallet modal: removed a double space in `wallet_description_label`

## [1.3.16] — 2026-07-17

- Direct minting: custom executor support — `ConfirmStepper` now packs the allowed executor into the XRP payment memo using the new `DIRECT_MINTING_EX` reference type (prefix `0x4642505266410021`; 48-byte layout: prefix(8B) + recipient(20B) + executor(20B), no padding). Executor is read from `directMintingInfo.executorAddress`; no API interface change required. Applies to address (memo) mode only — tag mode unchanged. Guards against a malformed memo by throwing when recipient/executor is not a valid 20-byte EVM address

## [1.3.15] — 2026-05-29

- `LatestTransactionsCard` split into `MintTransactionsCard` + `BridgeTransactionsCard` under `components/cards/TransactionsCard/` — type-narrowed (`ITransaction` / `IBridgeTransaction`, no `as` casts), with colocated `useMintTransactionTable` / `useBridgeTransactionTable` hooks (cell renderers + column defs) and a shared `transactionTypes.ts` (action constants + interfaces); bridge variant no longer evaluates mint-only branches
- Mobile: amount column in mint/bridge transaction tables now left-aligned to match the rest of the two-column layout (desktop right-alignment preserved)
- Shared `BalanceRow` (icon + label + value + optional action) and `CardHeader` (title + address + explorer link) components extracted with responsive `flex-col` stacking on <360px screens; `BridgeUnderlyingBalanceCard`, `BridgeBalanceCard`, `BridgeAccountBalanceCard` headers and balance rows migrated to them, plus `BalanceCard` fAsset/stablecoin rows (`BalanceCard` header stays inline — mobile/desktop layout flip and "not connected" fallback don't fit the shared shape)
- `BridgeUnderlyingBalanceCard` cleanup: removed dead XRPL-disable code (`Tooltip` / `HoverTooltip` imports, `isXrplDisabled`, `useUnderlyingBalance` call) — the real `depositAuth` / `requireDestTag` check lives in `BridgeModal` against the user-entered destination address
- `BridgeUnderlyingBalanceCard` simplification: dropped two `useState`s mirroring react-query data, derived `bridgeToken` via `useMemo` and `fAssetHyperliquidBalance` inline; switched `useInterval` to `autoInvoke`; collapsed two bridge buttons + two modals via a `BRIDGE_ACTIONS` config

## [1.3.14] — 2026-05-27

- Bridge: prevent `"network changed: 14 => 999"` ethers error on repeat Hyperliquid bridge — `useHyperEVMBalance` / `useHypeBalance` now read via direct `JsonRpcProvider` so background polls no longer mutate the shared WalletConnect `defaultChain`
- Latest transactions: bridge-to-XRPL redeem rows now link to `FASSETS_EXPLORER_URL` (Flare-side redemption tx is EVM, not XRPL) — fixes `/undefined/<hash>` broken link when `fAssetCoin` was not passed from the bridge page

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
