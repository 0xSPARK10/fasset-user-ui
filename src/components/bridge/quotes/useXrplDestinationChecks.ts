import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUnderlyingBalance } from "@/api/balance";
import { useAssetManagerAddress } from "@/api/user";
import { useRedeemWithTagSupported } from "@/hooks/useContracts";
import { IAlertMessage } from "@/components/elements/FormAlert";
import { FASSET_COIN } from "@/config/coin";
import { WALLET } from "@/constants";
import { toAlert } from "@/core/alerts";
import { evaluateXrplDestination, XrplDestinationIssueCode } from "@/core/xrpl";
import { xrplDestinationIssueMessage } from "@/components/bridge/quotes/xrplDestinationIssueMessages";

interface IXrplDestinationChecks {
    // Destination account; only a valid classic address is checked (invalid → no query)
    address?: string;
    // "" = no tag; "0" is a tag (string test, as the old modals)
    tag: string;
    enabled: boolean;
    // i18n namespace of the flow the messages come from
    keys: "redeem_modal" | "bridge_modal";
}

/**
 * Account-flag and tag checks for an XRPL destination, shared by redeem and the bridge +
 * redeem routes (same rules as RedeemModal). In priority order:
 * depositAuth → requireDestTag without a tag → tag entered but not supported by the
 * AssetManager (fails closed: unknown support blocks too).
 *
 * The old modals checked requireDestTag and tag support on the Next click; here they block
 * live — same condition, same message, same result.
 */
export function useXrplDestinationChecks({ address, tag, enabled, keys }: IXrplDestinationChecks) {
    const { t } = useTranslation();
    const { getConnectedCoin } = useWeb3();
    const connectedCoin = getConnectedCoin(FASSET_COIN.type);

    const accountInfo = useUnderlyingBalance(
        address ?? "",
        FASSET_COIN.type,
        enabled && !!address,
        // Redeem queries a Ledger account through its xpub endpoint (RedeemModal:104-109)
        keys === "redeem_modal" && connectedCoin?.connectedWallet === WALLET.LEDGER,
    );
    const assetManagerAddress = useAssetManagerAddress(FASSET_COIN.type, enabled);
    const redeemWithTagSupported = useRedeemWithTagSupported(
        assetManagerAddress.data?.address ?? "",
        enabled && !!assetManagerAddress.data?.address,
    );

    const { issues, isBlocked } = evaluateXrplDestination({
        flags: enabled ? accountInfo.data?.accountInfo : undefined,
        tag: enabled ? tag : "",
        tagSupported: redeemWithTagSupported.data,
        tagSupportLoading: assetManagerAddress.isPending || redeemWithTagSupported.isPending,
    });
    // Flags of a newly entered address are not known yet — do not let it through meanwhile
    const isAccountLoading = enabled && !!address && accountInfo.isPending;
    const message = xrplDestinationIssueMessage(t, keys);
    const alert = (code: XrplDestinationIssueCode): IAlertMessage | undefined => {
        const issue = issues.find(item => item.code === code);
        return issue && toAlert(issue, message);
    };

    return {
        depositAuth: alert("deposit_auth"),
        requireDestTag: alert("dest_tag_required"),
        tagNotSupported: alert("tag_not_supported"),
        isBlocked: isBlocked || isAccountLoading,
    };
}
