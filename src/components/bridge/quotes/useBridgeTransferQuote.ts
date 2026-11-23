import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeFees } from "@/hooks/fees/useBridgeFees";
import { BridgeConfig } from "@/config/bridge";
import { BRIDGE_GAS_COIN } from "@/config/coin";
import { BridgeType } from "@/types";
import { useLayerZeroFee } from "@/components/bridge/quotes/useLayerZeroFee";
import { useGasBalanceCheck } from "@/components/bridge/quotes/useGasBalanceCheck";
import { IRouteQuotePart } from "@/components/bridge/quotes/types";

/**
 * Bridge where FXRP stays FXRP — it only changes chain (Flare ↔ HyperEVM / Hyperliquid /
 * Ethereum). The LayerZero nativeFee is paid in the source chain's gas coin, so the full
 * amount arrives. Counterpart: useBridgeToXrplQuote, where FXRP ends up as XRP.
 */
export function useBridgeTransferQuote({
    bridgeType,
    config,
    amount,
    balance,
    enabled,
}: {
    bridgeType?: BridgeType;
    config?: BridgeConfig;
    amount: number;
    balance?: number;
    enabled: boolean;
}): IRouteQuotePart {
    const { mainToken } = useWeb3();
    const { fee, isLoading, requote } = useLayerZeroFee({ bridgeType, amount, enabled });

    // The chain the LayerZero nativeFee is paid on; undefined = mainToken
    const feeChain = config?.feeChain;
    const feeCoin = feeChain ? BRIDGE_GAS_COIN[feeChain] : mainToken;
    const fees = useBridgeFees({ feeCoin, fee, isLoading });
    const gas = useGasBalanceCheck({ feeChain, feeCoin, fee, enabled });

    return {
        fees,
        received: amount > 0 ? amount : undefined,
        maxAmount: balance,
        isLoading,
        submit: async () => {
            const fresh = await requote();
            return fresh !== undefined ? { fee: fresh } : undefined;
        },
        validation: {
            alerts: [gas.alert],
            // The CTA stays disabled until the latest quote succeeded (fee is only set on
            // success) and while the gas balance is unknown or too low
            isBlocked: enabled && (amount > 0 && (fee == null || isLoading) || gas.isBlocked),
        },
    };
}
