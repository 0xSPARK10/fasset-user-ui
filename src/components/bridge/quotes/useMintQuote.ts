import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMintFees } from "@/hooks/fees/useMintFees";
import { useDirectMintingInfo, useMintingCapInfo } from "@/api/minting";
import { useFassetPrice } from "@/api/user";
import { formatInputAmount } from "@/core/fees";
import { toAlert } from "@/core/alerts";
import { evaluateMint, MINT_RULES, MintCalculator, MintCapMapper, MintingInfoMapper, XamanFee } from "@/core/mint";
import { FASSET_COIN } from "@/config/coin";
import { WALLET } from "@/constants";
import { IFAssetCoin } from "@/types";
import { IRouteQuotePart } from "@/components/bridge/quotes/types";
import { mintIssueMessage } from "@/components/bridge/quotes/mintIssueMessages";

/**
 * XRPL → Flare: direct mint. Fetches the minting data and hands it to `core/mint`
 * (MintCalculator for amounts, evaluateMint for the MintForm + MintModal rules); this hook
 * only adds loading / enabled and turns issues into alerts. The HighMintingFeeModal gate
 * runs at submit.
 */
export function useMintQuote({
    amount,
    balance,
    enabled,
}: {
    amount: number;
    // Raw XRP balance of the XRPL account
    balance?: number;
    enabled: boolean;
}): IRouteQuotePart {
    const { t } = useTranslation();
    const { getConnectedCoin } = useWeb3();
    const isXaman = getConnectedCoin(FASSET_COIN.type)?.connectedWallet === WALLET.XAMAN;

    const mintingData = useDirectMintingInfo(FASSET_COIN.type, enabled);
    const mintingCapInfo = useMintingCapInfo(FASSET_COIN.type, enabled);
    // MintForm refetches the price on demand; a query enabled only for Xaman is equivalent
    const fAssetPrice = useFassetPrice(FASSET_COIN.type, enabled && isXaman);

    const calc = mintingData.data
        ? new MintCalculator(MintingInfoMapper.toParams(mintingData.data), FASSET_COIN.minWalletBalance ?? 0)
        : undefined;
    // MintForm:403-418 skips the cap check while the cap info is loading
    const capRemaining = mintingCapInfo.isLoading ? Infinity : MintCapMapper.remaining(mintingCapInfo.data);

    const xamanPrice = isXaman ? fAssetPrice.data?.price : undefined;
    // Xaman adds its own fee on top of the payment — Max leaves room for it
    const maxBalance = calc && balance !== undefined && xamanPrice
        ? XamanFee.maxSpendable(balance - calc.reserve, xamanPrice) + calc.reserve
        : balance;

    const issues = enabled
        ? evaluateMint({
            amount,
            balance,
            calc,
            capRemaining,
            xamanPrice,
        })
        : [];
    const has = (code: (typeof issues)[number]["code"]) => issues.some(issue => issue.code === code);
    const isCapReached = has("cap_reached");

    const fees = useMintFees({
        fAssetCoin: FASSET_COIN as IFAssetCoin,
        totalFees: calc && amount > 0 ? calc.totalFees(amount) : undefined,
        isLoading: enabled && mintingData.isPending,
    });

    // Xaman: no Max until the price is known — without it Max would leave no room for Xaman's fee
    const maxAmount = isCapReached
        ? 0
        : calc && maxBalance !== undefined && (!isXaman || xamanPrice) ? calc.maxAmount(maxBalance, MINT_RULES.MIN_AMOUNT, capRemaining) : undefined;

    return {
        fees,
        // The user enters the FXRP amount to mint — it arrives in full, fees are on the XRP side
        received: amount > 0 ? amount : undefined,
        maxAmount,
        // Until the cap is in, `maxAmount` counts it as unlimited
        isMaxPending: enabled && mintingCapInfo.isLoading,
        // XRP balance minus fees and the reserve, capped by the minting cap
        limit: maxAmount !== undefined ? { amount: formatInputAmount(maxAmount, 0), kind: "mintable" } : undefined,
        isLoading: enabled && mintingData.isPending,
        // MintModal:59-62 — the high-fee modal comes before the confirm step; set only when high
        submit: async () => ({ highMintingFee: calc && has("high_fee") ? calc.fee(amount) : undefined }),
        validation: {
            alerts: issues.map(issue => toAlert(issue, mintIssueMessage(t))),
            isBlocked: enabled && (
                mintingData.isPending
                // No balance → no max, the input is not clamped
                || balance === undefined
                || issues.some(issue => issue.blocking)
            ),
            input: {
                // TEMP hidden — how to show the minimum on the bridge page is open (TODO, Mitja);
                // the old MintForm used the placeholder `min is ${MINT_RULES.MIN_AMOUNT}`
                placeholder: undefined,
                // A FAsset / OFT pause locks it too — evaluatePauses in useBridgeRouteQuote
                readOnly: isCapReached,
            },
        },
    };
}
