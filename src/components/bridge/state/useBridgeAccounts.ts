import { useWeb3 } from "@/hooks/useWeb3";
import { BRIDGE_ROUTE_CHAIN } from "@/constants";
import { BridgeRouteChain, IBridgeAccount } from "@/types";
import { FASSET_COIN } from "@/config/coin";

/**
 * The wallet behind every bridge page chain. XRPL is signed by the XRPL wallet (Xaman,
 * Ledger, WalletConnect …); every other chain is EVM and shares the main wallet's address.
 */
export function useBridgeAccounts(): Record<BridgeRouteChain, IBridgeAccount> {
    const { mainToken, getConnectedCoin } = useWeb3();
    const xrplCoin = getConnectedCoin(FASSET_COIN.type);

    const xrpl: IBridgeAccount = { address: xrplCoin?.address };
    const evm: IBridgeAccount = { address: mainToken?.address };

    return Object.fromEntries(
        Object.values(BRIDGE_ROUTE_CHAIN).map(chain => [chain, chain === BRIDGE_ROUTE_CHAIN.XRPL ? xrpl : evm])
    ) as Record<BridgeRouteChain, IBridgeAccount>;
}
