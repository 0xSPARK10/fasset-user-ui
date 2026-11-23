import { useInterval } from "@mantine/hooks";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { useHyperliquidBalance } from "@/api/bridge";
import { useHyperCoreFxrpToken } from "@/api/hypercore";
import { hyperCoreFreeBalance } from "@/core/hypercore";
import { useRemoteFxrpBalances } from "@/hooks/useContracts";
import { BALANCE_FETCH_INTERVAL, BRIDGE_CHAIN, BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BridgeRouteChain, IBridgeAccount } from "@/types";
import { FASSET_COIN } from "@/config/coin";
import { isBridgeChainEnabled, REMOTE_BRIDGE_CHAINS } from "@/config/bridge";
import { formatNumber, formatUnit, toNumber } from "@/utils";

export interface IBridgeBalances {
    // Display-ready, e.g. "28,705.27"; a missing entry renders as `--`
    display: Partial<Record<BridgeRouteChain, string>>;
    // Same balances as numbers — the base for the max amount
    values: Partial<Record<BridgeRouteChain, number>>;
    isLoading: boolean;
    refetch: () => void;
}

/**
 * FXRP (XRP on XRPL) balance on every bridge page chain, from the same queries the old
 * bridge cards use. Remote chains are gated by `isBridgeChainEnabled` so a hidden chain
 * does not poll its RPC.
 */
export function useBridgeBalances(accounts: Record<BridgeRouteChain, IBridgeAccount>): IBridgeBalances {
    const evmAddress = accounts[BRIDGE_ROUTE_CHAIN.FLARE].address;
    const xrplAddress = accounts[BRIDGE_ROUTE_CHAIN.XRPL].address;
    const hyperEvmEnabled = isBridgeChainEnabled(BRIDGE_CHAIN.HYPER_EVM);
    const remoteChains = REMOTE_BRIDGE_CHAINS.filter(isBridgeChainEnabled);

    const xrpl = useUnderlyingBalance(xrplAddress ?? "", FASSET_COIN.type, !!xrplAddress);
    const flare = useNativeBalance(evmAddress ?? "", !!evmAddress);
    const remote = useRemoteFxrpBalances(remoteChains);
    const hyperCore = useHyperliquidBalance(evmAddress ?? "", !!evmAddress && hyperEvmEnabled);
    // FXRP on Core is the token linked to our HyperEVM OFT — found by index, not by name
    const hyperCoreToken = useHyperCoreFxrpToken(!!evmAddress && hyperEvmEnabled);

    const refetch = () => {
        if (xrplAddress) xrpl.refetch();
        if (!evmAddress) return;
        flare.refetch();
        remote.forEach(query => query.refetch());
        if (hyperEvmEnabled) hyperCore.refetch();
    };

    useInterval(
        refetch,
        BALANCE_FETCH_INTERVAL,
        { autoInvoke: true },
    );

    const values: Partial<Record<BridgeRouteChain, number>> = {};

    const xrplBalance = xrpl.data?.balance;
    if (xrplBalance && xrplBalance !== "error") values[BRIDGE_ROUTE_CHAIN.XRPL] = toNumber(xrplBalance);

    const flareBalance = flare.data?.find(item => item.symbol.toLowerCase() === FASSET_COIN.type.toLowerCase())?.balance;
    if (flareBalance !== undefined) values[BRIDGE_ROUTE_CHAIN.FLARE] = toNumber(flareBalance);

    remoteChains.forEach((chain, index) => {
        const balance = remote[index].data;
        if (balance !== undefined) values[chain] = toNumber(formatUnit(balance, 6));
    });

    // Spendable only (total − hold): FXRP in open orders cannot be sent
    const coreBalance = hyperCoreToken.data ? hyperCoreFreeBalance(hyperCore.data?.balances, hyperCoreToken.data.index) : undefined;
    if (coreBalance !== undefined) values[BRIDGE_ROUTE_CHAIN.HYPER_CORE] = coreBalance;

    const display = Object.fromEntries(
        Object.entries(values).map(([chain, value]) => [chain, formatNumber(value)])
    ) as Partial<Record<BridgeRouteChain, string>>;

    return {
        display,
        values,
        refetch,
        isLoading: xrpl.isFetching || flare.isFetching || remote.some(query => query.isFetching) || hyperCore.isFetching,
    };
}
