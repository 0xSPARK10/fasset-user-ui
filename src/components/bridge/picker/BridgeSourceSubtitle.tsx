import React from "react";
import { useTranslation } from "react-i18next";
import type { IAmountLimit } from "@/components/bridge/quotes/types";

interface IBridgeSourceSubtitle {
    hasSourceWallet: boolean;
    available?: string;
    // What the route lets through right now — shown in place of the balance
    limit?: IAmountLimit;
}

// Under the FROM token: the route's limit ("N redeemable", "N mintable") when there is one, else
// "N available"; "--" when no wallet is connected for that chain (Figma — the "Connect wallet"
// link sits on the address line above).
export default function BridgeSourceSubtitle({ hasSourceWallet, available, limit }: IBridgeSourceSubtitle) {
    const { t } = useTranslation();
    if (!hasSourceWallet) return <>--</>;
    return <>{limit
        ? t(`bridge_page.${limit.kind}_label`, { amount: limit.amount })
        : t("bridge_page.available_label", { amount: available ?? "--" })
    }</>;
}
