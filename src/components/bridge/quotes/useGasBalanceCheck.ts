import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInterval } from "@mantine/hooks";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useHypeBalance } from "@/hooks/useContracts";
import { toAlert } from "@/core/alerts";
import { evaluateGas } from "@/core/bridge";
import { gasIssueMessage } from "@/components/bridge/quotes/gasIssueMessages";
import { BALANCE_FETCH_INTERVAL, BRIDGE_CHAIN } from "@/constants";
import { BridgeChain, ICoin } from "@/types";
import { formatUnit, toNumber } from "@/utils";

const GAS_BALANCE_TIMEOUT_MS = 8000;

/**
 * Is there enough gas coin to pay the LayerZero nativeFee. `feeChain` undefined = the route
 * starts on Flare and the fee is paid in mainToken; otherwise that chain's gas coin (HYPE / ETH / BNB / MON).
 * While the gas balance is unknown the CTA is blocked; if it stays unknown (error, missing
 * entry, > 8 s) a warning says so — the old forms blocked silently.
 */
export function useGasBalanceCheck({
    feeChain,
    feeCoin,
    fee,
    enabled,
}: {
    feeChain?: BridgeChain;
    feeCoin?: ICoin;
    // Formatted 18-decimal nativeFee from useLayerZeroFee
    fee?: string;
    enabled: boolean;
}) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const nativeBalance = useNativeBalance(mainToken?.address ?? "", enabled && feeChain === undefined && !!mainToken?.address);
    const remoteBalance = useHypeBalance(enabled && feeChain !== undefined, feeChain ?? BRIDGE_CHAIN.HYPER_EVM);

    // The old bridge card refetched the gas balance on an interval — without it a top-up
    // never clears the "insufficient" alert until a reload
    useInterval(
        () => {
            // refetch() ignores `enabled` — without a wallet the remote query would answer 0
            if (!enabled || !mainToken?.address) return;
            if (feeChain === undefined) nativeBalance.refetch();
            else remoteBalance.refetch();
        },
        BALANCE_FETCH_INTERVAL,
        { autoInvoke: true },
    );

    // No wallet = no balance (a cached or refetched 0 must not read as "not enough")
    const gasBalance = !mainToken?.address
        ? undefined
        : feeChain === undefined
        ? nativeBalance.data?.find(item => item.symbol.toLowerCase() === mainToken?.type?.toLowerCase())?.balance
        : remoteBalance.data !== undefined ? formatUnit(remoteBalance.data, 18) : undefined;

    // Without a wallet the fee is quoted but there is no balance to load — not "unavailable"
    // (the CTA is "Connect wallet" then anyway)
    const isLoading = enabled && !!mainToken?.address && fee != null && gasBalance === undefined;
    // Still unknown after a while, or the query settled without a value (RPC error, no entry in
    // the native balance list) — say so instead of a disabled CTA without a reason
    const query = feeChain === undefined ? nativeBalance : remoteBalance;
    const hasSettledWithoutValue = isLoading && (query.isError || query.isSuccess);
    const [isSlow, setIsSlow] = useState(false);
    useEffect(() => {
        setIsSlow(false);
        if (!isLoading) return;
        const timer = setTimeout(() => setIsSlow(true), GAS_BALANCE_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [isLoading, feeChain]);
    const { issues, isBlocked } = evaluateGas({
        fee: enabled && fee != null ? toNumber(fee) : undefined,
        gasBalance: gasBalance !== undefined ? toNumber(gasBalance) : undefined,
        isWaiting: isLoading,
        isUnavailable: hasSettledWithoutValue || isSlow,
    });
    const issue = issues[0];

    // One slot for the caller: too little gas, or gas balance unknown
    return {
        alert: issue && toAlert(issue, gasIssueMessage(t, feeCoin?.type)),
        isBlocked,
    };
}
