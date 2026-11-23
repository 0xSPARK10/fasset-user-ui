import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { FASSET_COIN } from "@/config/coin";
import { getBridgeRouteChain, IBridgeRoute } from "@/config/bridgeRoutes";
import { getRouteBlockReason, getRouteRequirements } from "@/core/bridge";
import { getEvmAssetId } from "@/core/fireblocks";
import { getWalletCapabilities } from "@/core/wallet/walletCapabilities";

/**
 * Why the connected wallet cannot run a route (translated), or undefined. Checks the wallet that
 * signs on the route's source side — the XRPL wallet for XRPL, the EVM wallet for the rest — so a
 * Fireblocks XRPL wallet next to a MetaMask Flare wallet blocks only what Fireblocks has to sign.
 * Nothing is blocked before a wallet is connected.
 */
export function useRouteWalletBlock(): (route?: IBridgeRoute) => string | undefined {
    const { t } = useTranslation();
    const { mainToken, getConnectedCoin } = useWeb3();
    const xrplWallet = getConnectedCoin(FASSET_COIN.type)?.connectedWallet;
    const evmWallet = mainToken?.connectedWallet;
    const hasFireblocksEvmAsset = !!mainToken && getEvmAssetId(mainToken.type) !== undefined;

    return (route) => {
        if (!route) return undefined;
        const requirements = getRouteRequirements(route);
        const wallet = requirements.signOn === "xrpl" ? xrplWallet : evmWallet;
        if (!wallet) return undefined;

        const reason = getRouteBlockReason(requirements, getWalletCapabilities(wallet, hasFireblocksEvmAsset));
        if (!reason) return undefined;
        if (reason.kind === "evm_chain") {
            const chain = getBridgeRouteChain(reason.chain);
            return t("bridge_page.wallet_block.evm_chain", {
                wallet,
                chain: chain ? t(`bridge_page.chains.${chain.labelKey}`) : reason.chain,
            });
        }
        return t(`bridge_page.wallet_block.${reason.kind}`, { wallet });
    };
}
