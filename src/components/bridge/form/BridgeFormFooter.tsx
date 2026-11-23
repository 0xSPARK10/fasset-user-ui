import React from "react";
import { Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import FeeBreakdown from "@/components/elements/FeeBreakdown";
import { FeeItem } from "@/core/fees/feeItem";
import { formatNumber, roundUpToDecimals } from "@/utils";
import FAssetButton from "@/components/elements/FAssetButton";

interface IBridgeFormFooter {
    // The picked route's source wallet is connected (EVM, or XRPL when FROM is XRPL)
    isConnected: boolean;
    canSubmit: boolean;
    // Click path running or the form still settling (typing pause, quote) — spinner, no click
    isSubmitting?: boolean;
    // Ready-to-render fee rows from `hooks/fees/*` (via useBridgeRouteQuote); empty = `--`
    fees: FeeItem[];
    // Both chains picked — before that the CTA reads "Select network" (with or without a wallet)
    hasRoute: boolean;
    onSubmit: () => void;
}

// Fees + CTA, the bottom of both the desktop panel and the mobile card.
export default function BridgeFormFooter({ isConnected, canSubmit, isSubmitting, fees, hasRoute, onSubmit }: IBridgeFormFooter) {
    const { t } = useTranslation();
    const { openConnectWalletModal } = useConnectWalletModal();

    // TEMP: fees up to 6 decimals (at least 2), like the received amount — bridge page only,
    // the old modals keep their formats. Rounded up: a fee shown lower understates the cost.
    const displayFees = fees.map(fee => ({
        ...fee,
        format: (amount: number) => formatNumber(roundUpToDecimals(amount, 6), 6, 'en-US', 2),
    }));

    return (
        <>
            <div className="border-b border-[var(--flr-border-color)] p-6">
                {fees.length > 0
                    ? <FeeBreakdown sections={[{ label: t("bridge_page.fees_label"), items: displayFees }]} />
                    : <>
                        <Text c="var(--flr-gray)" className="text-12 uppercase mb-1">
                            {t("bridge_page.fees_label")}
                        </Text>
                        <Text c="var(--flr-gray)" className="text-14">
                            --
                        </Text>
                    </>
                }
            </div>
            {/* Select network → Connect wallet (the route's source wallet) → Bridge */}
            <div className="p-6">
                {!hasRoute
                    ? <FAssetButton fullWidth disabled>
                        {t("bridge_page.select_network_button")}
                    </FAssetButton>
                    : !isConnected
                        ? <FAssetButton fullWidth onClick={openConnectWalletModal}>
                            {t("bridge_page.connect_wallet_button")}
                        </FAssetButton>
                        : <FAssetButton
                            fullWidth
                            disabled={!canSubmit && !isSubmitting}
                            loading={isSubmitting}
                            onClick={onSubmit}
                        >
                            {t("bridge_page.bridge_button")}
                        </FAssetButton>
                }
            </div>
        </>
    );
}
