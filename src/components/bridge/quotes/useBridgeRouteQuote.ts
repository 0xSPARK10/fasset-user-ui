import { useTranslation } from "react-i18next";
import { FeeItem } from "@/core/fees/feeItem";
import { toAlert } from "@/core/alerts";
import { formatInputAmount } from "@/core/fees/format";
import type { evaluatePauses, OftRateLimits } from "@/core/bridge";
import { IAmountLimit, IRouteValidation, NO_VALIDATION, RouteSubmitExtras } from "@/components/bridge/quotes/types";
import { BRIDGE_ROUTE_ACTION, BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BridgeRouteChain } from "@/types";
import { FASSET_COIN } from "@/config/coin";
import { getBridgeRouteConfig, IBridgeRoute, isHyperCoreTransfer } from "@/config/bridgeRoutes";
import { IBridgeBalances } from "@/components/bridge/state/useBridgeBalances";
import { useBridgeTransferQuote } from "@/components/bridge/quotes/useBridgeTransferQuote";
import { useBridgeToXrplQuote } from "@/components/bridge/quotes/useBridgeToXrplQuote";
import { useRedeemQuote } from "@/components/bridge/quotes/useRedeemQuote";
import { useMintQuote } from "@/components/bridge/quotes/useMintQuote";
import { useDirectMintBridgeQuote } from "@/components/bridge/quotes/useDirectMintBridgeQuote";
import { useHyperCoreTransferQuote } from "@/components/bridge/quotes/useHyperCoreTransferQuote";
import { oftIssueMessage } from "@/components/bridge/quotes/oftIssueMessages";
import { pauseIssueMessage } from "@/components/bridge/quotes/pauseIssueMessages";
import { useOftRateLimits } from "@/components/bridge/quotes/useOftRateLimits";
import { useSystemPauses } from "@/components/bridge/quotes/useSystemPauses";
import { useBridgeRecipientCheck } from "@/components/bridge/quotes/useBridgeRecipientCheck";
import { useRouteWalletBlock } from "@/components/bridge/state/useRouteWalletBlock";

export interface IBridgeRouteQuote {
    fees: FeeItem[];
    // What lands on the destination; undefined = not known yet
    received?: number;
    available?: string;
    // Shown in the FROM row in place of `available` (redeemable / mintable)
    limit?: IAmountLimit;
    maxAmount?: number;
    // Mint takes whole XRP only (MintForm: allowDecimal={false}) — Max floors to an integer
    allowDecimal: boolean;
    isLoading: boolean;
    // `maxAmount` will not drop any more: the flow, the OFT rate limit and the mint cap are loaded
    // (a link's amount is clamped against it once)
    isMaxFinal: boolean;
    validation: IRouteValidation;
    // CTA click: flow-specific submit extras (fresh fee, executor, minting fee)
    submit?: () => Promise<RouteSubmitExtras | undefined>;
    // CTA click: pauses / OFT limits fresh from the backend; undefined = not checked
    checkPauses: () => Promise<ReturnType<typeof evaluatePauses> | undefined>;
    checkOftLimits: () => Promise<OftRateLimits | undefined>;
}

/**
 * Everything the bridge form shows for a picked route and amount — one entry point so the
 * desktop panel and the mobile card render the same numbers. Each flow has its own hook in
 * `quotes/` reusing the existing fee math and `hooks/fees/*`; all of them are called on
 * every render (hooks cannot be conditional) and only the active one is `enabled`.
 */
export function useBridgeRouteQuote({
    from,
    route,
    amount,
    balances,
    destinationAddress,
    destinationTag,
}: {
    from?: BridgeRouteChain;
    route?: IBridgeRoute;
    amount: number;
    balances: IBridgeBalances;
    // The recipient: XRPL for the bridge + redeem routes, EVM for the others (custom or the wallet);
    // undefined = missing or not a valid address yet
    destinationAddress?: string;
    // XRPL destination tag ("" = none)
    destinationTag: string;
}): IBridgeRouteQuote {
    const { t } = useTranslation();
    const getWalletBlock = useRouteWalletBlock();
    const config = getBridgeRouteConfig(route);
    const bridgeType = route?.bridgeType;
    const isBridge = route?.action === BRIDGE_ROUTE_ACTION.BRIDGE && bridgeType !== undefined;
    // FXRP ends up as XRP (redeem composer on Flare) vs. just changes chain
    const isToXrpl = isBridge && config?.compose === 'xrpl';

    const balance = from ? balances.values[from] : undefined;

    // choose the correct fees -> enabled param
    const transfer = useBridgeTransferQuote({ bridgeType, config, amount, balance, enabled: isBridge && !isToXrpl });
    const toXrpl = useBridgeToXrplQuote({ bridgeType, config, amount, balance, destinationAddress, destinationTag, enabled: isToXrpl });
    const redeem = useRedeemQuote({ amount, balance, destinationAddress, destinationTag, enabled: route?.action === BRIDGE_ROUTE_ACTION.REDEEM });
    const mint = useMintQuote({ amount, balance, enabled: route?.action === BRIDGE_ROUTE_ACTION.MINT });
    const directMintBridge = useDirectMintBridgeQuote({ route, amount, balance, recipient: destinationAddress, enabled: route?.action === BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE });
    const isCoreTransfer = isHyperCoreTransfer(route);
    const hyperCoreTransfer = useHyperCoreTransferQuote({ route, amount, balance, enabled: isCoreTransfer });

    const active = !route
        ? undefined
        : route.action === BRIDGE_ROUTE_ACTION.MINT
            ? mint
            : route.action === BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE
                ? directMintBridge
            : isCoreTransfer
                ? hyperCoreTransfer
            : route.action === BRIDGE_ROUTE_ACTION.REDEEM
                ? redeem
                : isToXrpl ? toXrpl : transfer;

    // Before a TO is picked there is no route, but the FROM balance is already known
    const fallbackMax = balance !== undefined && from === BRIDGE_ROUTE_CHAIN.XRPL
        ? Math.max(balance - (FASSET_COIN.minWalletBalance ?? 0), 0)
        : balance;

    // FAsset / OFT pauses and the OFT rate limit; not loaded = not checked. Hyperliquid ↔ HyperEVM
    // passes neither the FAsset nor the OFT adapter — neither applies
    const checksPauses = !!route && !isCoreTransfer;
    const { pauses: loadedPauses, fetchFresh: fetchPauses } = useSystemPauses(checksPauses);
    const { limits: loadedLimits, isLoading: areLimitsLoading, fetchFresh: fetchOftLimits } = useOftRateLimits(checksPauses);
    const pauses = checksPauses ? loadedPauses : undefined;
    const limits = checksPauses ? loadedLimits : undefined;
    const checkPauses = async () => (checksPauses ? fetchPauses() : undefined);
    const checkOftLimits = async () => (checksPauses ? fetchOftLimits() : undefined);
    const limitCheck = route && limits?.evaluate(route, amount);
    const recipientCheck = useBridgeRecipientCheck({ route, recipient: destinationAddress });

    const routeMax = active ? active.maxAmount : fallbackMax;
    const maxAmount = route && limits && routeMax !== undefined ? limits.maxAmount(route, routeMax) : routeMax;
    const validation = active?.validation ?? NO_VALIDATION;
    // The OFT rate limit can cap the route below its own limit — the FROM row shows what Max allows
    const limit: IAmountLimit | undefined = active?.limit && maxAmount !== undefined && routeMax !== undefined && maxAmount < routeMax
        ? { ...active.limit, amount: formatInputAmount(maxAmount, active.limit.kind === "mintable" ? 0 : FASSET_COIN.decimals ?? 2) }
        : active?.limit;

    const walletBlock = getWalletBlock(route);

    return {
        fees: active?.fees ?? [],
        received: active?.received,
        available: from ? balances.display[from] : undefined,
        limit,
        maxAmount,
        // Direct mint & bridge mints too — whole XRP, like the mint route
        allowDecimal: route?.action !== BRIDGE_ROUTE_ACTION.MINT && route?.action !== BRIDGE_ROUTE_ACTION.DIRECT_MINT_BRIDGE,
        isLoading: (active?.isLoading ?? false) || recipientCheck.isLoading,
        isMaxFinal: !active?.isLoading && !active?.isMaxPending && !areLimitsLoading,
        submit: active?.submit,
        checkPauses,
        checkOftLimits,
        validation: {
            ...validation,
            // A pause outranks everything (nothing goes through anyway), then the limit, then the flow
            alerts: [
                ...(pauses?.issues.map(issue => toAlert(issue, pauseIssueMessage(t))) ?? []),
                ...(limitCheck?.issues.map(issue => toAlert(issue, oftIssueMessage(t))) ?? []),
                // A route from a link, or one picked before the wallet connected, can be one the wallet cannot sign
                !!walletBlock && { msg: walletBlock, type: "error" },
                ...validation.alerts,
                recipientCheck.alert,
            ],
            // Empty balance, or a cap / queue at 0 — nothing to type; unknown balance stays open.
            // Paused: the amount is locked, like the mint pause
            input: { ...validation.input, disabled: maxAmount === 0, readOnly: validation.input?.readOnly || !!pauses?.isPaused },
            // The input clamps while typing, but a max that arrives or drops later (balance
            // loaded, queue / cap changed) does not touch an amount already there
            isBlocked: validation.isBlocked
                || !!pauses?.isPaused
                || !!walletBlock
                || !!limitCheck?.isBlocked
                || recipientCheck.isBlocked
                || (maxAmount !== undefined && amount > maxAmount)
                // Unknown source balance = no max, no clamp (the old cards used "0" → max 0)
                || (!!active && balance === undefined),
        },
    };
}
