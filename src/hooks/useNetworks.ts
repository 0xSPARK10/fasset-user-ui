import { useWeb3 } from "@/hooks/useWeb3";
import {
    NETWORK_XRPL,
    NETWORK_XRPL_TESTNET,
    HYPERLIQUID_EVM,
    HYPERLIQUID_EVM_TESTNET,
} from "@/config/networks";

export function useNetworks() {
    const { mainToken } = useWeb3();
    const isMainnet = mainToken?.network?.mainnet ?? false;

    return {
        isMainnet,
        xrpl: isMainnet ? NETWORK_XRPL : NETWORK_XRPL_TESTNET,
        hyperEvm: isMainnet ? HYPERLIQUID_EVM : HYPERLIQUID_EVM_TESTNET,
    };
}
