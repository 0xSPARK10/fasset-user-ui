import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@mantine/hooks";
import { useWeb3 } from "@/hooks/useWeb3";
import { useDirectMintFee } from "@/api/directMint";
import { buildFeeItem } from "@/core/fees/feeItem";
import { MINT_RULES } from "@/core/mint";
import { FASSET_COIN } from "@/config/coin";
import { directMintDestinationEid, IBridgeRoute } from "@/config/bridgeRoutes";
import { BRIDGE_ROUTE_CHAIN, IS_MAINNET } from "@/constants";
import { parseUnits } from "@/utils";
import { IRouteQuotePart } from "@/components/bridge/quotes/types";
import { useMintQuote } from "@/components/bridge/quotes/useMintQuote";

const FEE_PREVIEW_RECIPIENT = "0x000000000000000000000000000000000000dEaD";

/**
 * XRPL → Ethereum / HyperEVM / Hyperliquid in one XRP payment (direct mint & bridge). The
 * minting rules (minimum, cap, XRP balance) are the XRPL → Flare mint's — same direct
 * minting underneath — so they come from `useMintQuote`; fees and the received amount come
 * from the smart-accounts preview. The authoritative amounts arrive with /direct_mint/request.
 */
export function useDirectMintBridgeQuote({
    route,
    amount,
    balance,
    recipient,
    enabled,
}: {
    route?: IBridgeRoute;
    amount: number;
    // Raw XRP balance of the XRPL account
    balance?: number;
    // The connected EVM address or a custom one (`evm_recipient`, sent by the confirm modal);
    // undefined = none or not valid yet
    recipient?: string;
    enabled: boolean;
}): IRouteQuotePart {
    const { t } = useTranslation();
    const { mainToken, isConnected } = useWeb3();
    // Latest transactions and the Recover notice load the history by the EVM address
    // (`oft/fullHistory/{evmAddress}`) — without it a stuck payment could not be found or recovered
    const hasEvmWallet = !!mainToken?.address;

    const mint = useMintQuote({ amount, balance, enabled });

    const [debouncedAmount] = useDebouncedValue(amount, 500);
    // The hook also runs for every other route (e.g. → XRPL), whose destination has no EID
    const destinationEid = route && enabled ? directMintDestinationEid(route, IS_MAINNET) : undefined;
    const feeParams = {
        destination: route?.to ?? BRIDGE_ROUTE_CHAIN.ETHEREUM,
        destinationEid: destinationEid ?? 0,
        // The fee does not depend on the recipient — a placeholder (same-size address in the compose
        // message; the API rejects the zero address), so a new recipient does not quote again
        evmRecipient: FEE_PREVIEW_RECIPIENT,
    };
    const hasDestination = enabled && destinationEid !== undefined;
    const fee = useDirectMintFee(
        { ...feeParams, amountUba: parseUnits(debouncedAmount || 0, 6).toString() },
        // Below the minting minimum the API answers 400 — the mint rules already say why. The current
        // amount too: right after a route change it is cleared while the debounced one is still the old
        hasDestination && debouncedAmount >= MINT_RULES.MIN_AMOUNT && amount >= MINT_RULES.MIN_AMOUNT
    );

    const isFeeLoading = enabled && amount >= MINT_RULES.MIN_AMOUNT && (fee.isFetching || amount !== debouncedAmount);
    // A disabled query still returns what the cache holds for its key — e.g. this route's quote for
    // the amount before a route change cleared the field. Only a quote for a valid amount counts
    const quote = amount >= MINT_RULES.MIN_AMOUNT ? fee.data : undefined;
    const operatorFee = quote?.breakdown.operator_fee.value;

    // The operator (LayerZero) fee does not depend on the amount — until a quote for the amount has
    // it, it is quoted for the minimum, so Max and a link's amount account for it before anything is typed
    const needsProbe = hasDestination && !quote;
    const maxProbe = useDirectMintFee(
        { ...feeParams, amountUba: parseUnits(MINT_RULES.MIN_AMOUNT, 6).toString() },
        needsProbe
    );

    const fees = [
        buildFeeItem({
            label: t("bridge_page.direct_mint_fee_label"),
            token: FASSET_COIN,
            currencyName: FASSET_COIN.nativeName,
            fee: { amount: quote?.breakdown.minting_fee.value ?? null, isLoading: isFeeLoading },
        }),
        buildFeeItem({
            label: t("bridge_page.direct_mint_layerzero_fee_label"),
            token: FASSET_COIN,
            currencyName: FASSET_COIN.nativeName,
            fee: { amount: operatorFee ?? null, isLoading: isFeeLoading },
        }),
    ];

    // The mint max leaves room for the minting fee only — the executor's (operator) fee is
    // paid from the same XRP, so it comes off the max too
    const maxOperatorFee = operatorFee ?? maxProbe.data?.breakdown.operator_fee.value;
    const maxAmount = mint.maxAmount !== undefined && maxOperatorFee !== undefined
        ? Math.max(Math.floor(mint.maxAmount - maxOperatorFee), 0)
        : mint.maxAmount;

    return {
        fees,
        received: quote?.to_receive.value,
        maxAmount,
        // A link's amount waits for the final max: the mint cap and the operator fee (a failed
        // probe counts as loaded — the max is then the mint max)
        isMaxPending: mint.isMaxPending || (needsProbe && maxProbe.isPending),
        isLoading: mint.isLoading || isFeeLoading,
        // The confirm modal re-quotes with /direct_mint/request and compares it with this preview
        submit: quote
            ? async () => ({
                directMintPreview: {
                    toReceive: quote.to_receive.value,
                    totalFee: quote.payable_fee.value,
                },
            })
            : undefined,
        validation: {
            ...mint.validation,
            alerts: [
                ...mint.validation.alerts,
                // Only once some wallet is connected — without any, the CTA already says "Connect wallet"
                enabled && isConnected && !hasEvmWallet && { msg: t("bridge_page.direct_mint_evm_wallet_required_label"), type: "info" },
                enabled && fee.isError && { msg: t("bridge_page.direct_mint_quote_failed_label"), type: "error" },
            ],
            isBlocked: mint.validation.isBlocked
                || (enabled && (!hasEvmWallet || !recipient || fee.isError || isFeeLoading || (amount > 0 && !quote))),
        },
    };
}
