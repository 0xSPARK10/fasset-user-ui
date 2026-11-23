import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import ConfirmStepper from "@/components/bridge/ConfirmStepper";
import { BRIDGE_CHAIN } from "@/constants";
import { getBridgeRouteConfig } from "@/config/bridgeRoutes";
import { bridgeDestinationNameKey } from "@/config/bridge";
import { BRIDGE_FASSET_COIN, FASSET_COIN } from "@/config/coin";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";

interface IBridgeConfirmModal {
    payload?: Extract<BridgeSubmitPayload, { kind: "bridge" }>;
    // Pre-broadcast error (rejected, revert) — the page shows it as the top alert
    onError: (message: string) => void;
    // LayerZero delivery failed after broadcast — the page shows a toast
    onDeliveryFailed: (message: string) => void;
    // success = the tx went out and the waiting / finished modal was closed
    onClose: (success: boolean) => void;
}

/**
 * Confirm step of a bridge (plain LayerZero and → XRPL) opened from the bridge page — the
 * page is the amount step.
 */
export default function BridgeConfirmModal({ payload, onError, onDeliveryFailed, onClose }: IBridgeConfirmModal) {
    const { t } = useTranslation();
    const [isBridgeInProgress, setIsBridgeInProgress] = useState<boolean>(false);
    const config = getBridgeRouteConfig(payload?.route);
    const bridgeType = payload?.route.bridgeType;
    // The cards passed the source chain's FAsset coin; the stepper only uses its type
    const sourceChain = config?.source;
    const token = sourceChain && sourceChain !== BRIDGE_CHAIN.FLARE ? BRIDGE_FASSET_COIN[sourceChain] : FASSET_COIN;

    const close = (success: boolean) => {
        setIsBridgeInProgress(false);
        onClose(success);
    };

    return (
        <FAssetModal
            // Hidden while the tx is in progress, the waiting modal takes over
            opened={!!payload && !isBridgeInProgress}
            onClose={() => close(isBridgeInProgress)}
            centered
            size="lg"
            keepMounted={true}
            title={config ? t(`bridge_modal.${config.titleKey}_title`, { fAsset: token?.type, bridgeType: t(bridgeDestinationNameKey(bridgeType)) }) : undefined}
        >
            <FAssetModal.Body>
                {payload && config && (
                    <ConfirmStepper
                        token={token}
                        formValues={{
                            amount: payload.amount,
                            fee: payload.fee,
                            type: payload.route.bridgeType,
                            executorFee: payload.executorFee,
                            composerFeePPM: payload.composerFeePPM,
                            destinationAddress: payload.destinationAddress,
                            destinationTag: payload.destinationTag,
                        }}
                        onError={(error) => {
                            setIsBridgeInProgress(false);
                            onError(error);
                        }}
                        onDeliveryFailed={onDeliveryFailed}
                        onClose={(isInProgress: boolean) => {
                            setIsBridgeInProgress(isInProgress);
                            if (!isInProgress) close(true);
                        }}
                        bridgeConfig={config}
                    />
                )}
            </FAssetModal.Body>
        </FAssetModal>
    );
}
