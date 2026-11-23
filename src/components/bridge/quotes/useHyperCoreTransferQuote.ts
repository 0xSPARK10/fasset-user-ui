import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { useHyperCoreTransferFees } from "@/hooks/useContracts";
import { useHyperliquidBalance } from "@/api/bridge";
import { useHyperCoreAccountExists, useHyperCoreFxrpToken } from "@/api/hypercore";
import { BRIDGE_CHAIN, BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BRIDGE_GAS_COIN } from "@/config/coin";
import { IBridgeRoute } from "@/config/bridgeRoutes";
import { buildFeeItem } from "@/core/fees/feeItem";
import { formatCrossChainFee } from "@/core/fees/format";
import { ICoin } from "@/types";
import { formatUnit, toNumber } from "@/utils";
import { toAlert } from "@/core/alerts";
import { evaluateHyperCoreTransfer, hyperCoreFreeBalance } from "@/core/hypercore";
import { hyperCoreIssueMessage } from "@/components/bridge/quotes/hyperCoreIssueMessages";
import { useGasBalanceCheck } from "@/components/bridge/quotes/useGasBalanceCheck";
import { IRouteQuotePart } from "@/components/bridge/quotes/types";

/**
 * Hyperliquid ↔ HyperEVM through the FXRP system address (not LayerZero) — the full amount
 * arrives on the sender's own address.
 * - Hyperliquid → HyperEVM: an EIP-712 signature, the fee (200k HyperEVM gas) is paid in HYPE on
 *   Hyperliquid. Blocked up front for Ledger (no typed-data signing) and without HYPE on Core.
 * - HyperEVM → Hyperliquid: an ERC-20 transfer, gas in HYPE on HyperEVM.
 */
export function useHyperCoreTransferQuote({
    route,
    amount,
    balance,
    enabled,
}: {
    route?: IBridgeRoute;
    amount: number;
    balance?: number;
    enabled: boolean;
}): IRouteQuotePart {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const address = mainToken?.address ?? "";
    const toEvm = route?.from === BRIDGE_ROUTE_CHAIN.HYPER_CORE;
    const hypeCoin = BRIDGE_GAS_COIN[BRIDGE_CHAIN.HYPER_EVM];

    const token = useHyperCoreFxrpToken(enabled);
    const fees = useHyperCoreTransferFees(enabled);
    // Same query as the bridge page's Hyperliquid balance — HYPE sits next to FXRP on Core
    const coreBalances = useHyperliquidBalance(address, enabled && toEvm && address !== "");
    // HyperEVM → Hyperliquid: Core credits only an address it knows, otherwise the FXRP waits in escrow
    const coreAccount = useHyperCoreAccountExists(address, enabled && !toEvm);

    const feeWei = fees.data ? (toEvm ? fees.data.toEvm : fees.data.toCore) : undefined;
    const fee = feeWei !== undefined ? formatUnit(feeWei, 18) : undefined;
    // The wallet reserves gasLimit × maxFeePerGas (the send adds 50 % to the estimate, maxFeePerGas
    // is ~2× the base fee) — the balance check uses that reserve, the fee row the expected cost
    const gasReserve = feeWei !== undefined && !toEvm ? formatUnit(feeWei * BigInt(3), 18) : undefined;
    const gas = useGasBalanceCheck({ feeChain: BRIDGE_CHAIN.HYPER_EVM, feeCoin: hypeCoin, fee: gasReserve, enabled: enabled && !toEvm });

    const coreHypeIndex = coreBalances.data?.balances.find(item => item.coin.toUpperCase() === "HYPE")?.token;
    const { issues, isBlocked } = evaluateHyperCoreTransfer({
        direction: toEvm ? "to_evm" : "to_core",
        hasWallet: address !== "",
        token: token.isError || token.data === null ? "unavailable" : token.data ? "ok" : "loading",
        // No HYPE entry = 0 HYPE on Hyperliquid
        coreHype: coreBalances.data
            ? (coreHypeIndex === undefined ? 0 : hyperCoreFreeBalance(coreBalances.data.balances, coreHypeIndex))
            : undefined,
        // A failed background refetch keeps the last balance — only an unknown balance is an error
        coreHypeError: coreBalances.isError && !coreBalances.data,
        fee: fee !== undefined ? toNumber(fee) : undefined,
        accountExists: coreAccount.exists,
        accountError: coreAccount.isUnavailable,
    });

    return {
        fees: [
            buildFeeItem({
                label: t(toEvm ? "bridge_page.hypercore.fee_on_core_label" : "bridge_page.hypercore.fee_label"),
                token: hypeCoin as ICoin,
                currencyName: hypeCoin?.type,
                fee: { amount: fee ? toNumber(fee) : null, isLoading: fees.isLoading },
                format: (n) => formatCrossChainFee(n, hypeCoin?.feeDecimals),
            })
        ],
        received: amount > 0 ? amount : undefined,
        maxAmount: balance,
        // The Hyperliquid HYPE balance decides the fee alert — loading, not a dead CTA
        isLoading: enabled && (token.isLoading || (toEvm && address !== "" && coreBalances.isLoading) || (!toEvm && coreAccount.isLoading)),
        submit: async () => (token.data ? {} : undefined),
        validation: {
            alerts: enabled ? [...issues.map(issue => toAlert(issue, hyperCoreIssueMessage(t))), !toEvm && gas.alert] : [],
            isBlocked: enabled && (isBlocked || (!toEvm && gas.isBlocked)),
        },
    };
}
