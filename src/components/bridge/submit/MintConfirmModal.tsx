import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import FAssetModal from "@/components/modals/FAssetModal";
import HighMintingFeeModal from "@/components/modals/HighMintingFeeModal";
import ConfirmStepper from "@/components/mint/ConfirmStepper";
import { MINTING_KEY } from "@/api/minting";
import { FASSET_COIN } from "@/config/coin";
import { useWeb3 } from "@/hooks/useWeb3";
import { IFAssetCoin } from "@/types";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";

interface IMintConfirmModal {
    payload?: Extract<BridgeSubmitPayload, { kind: "mint" }>;
    // Pre-broadcast error (rejected, API) — the page shows it as the top alert
    onError: (message?: string) => void;
    // success = the payment went out and the waiting / limit modal was closed
    onClose: (success: boolean) => void;
}

/**
 * Confirm step of a mint opened from the bridge page — the page is the amount step. Same
 * high-fee gate, stepper and waiting modals as MintModal.
 */
export default function MintConfirmModal({ payload, onError, onClose }: IMintConfirmModal) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { getConnectedCoin } = useWeb3();
    const fAssetCoin = getConnectedCoin(FASSET_COIN.type) as IFAssetCoin | undefined;
    const [isMintWaitingModalActive, setIsMintWaitingModalActive] = useState<boolean>(false);
    // High fee → ask first (MintModal:59-62); confirmed = the stepper may start
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

    useEffect(() => {
        setIsConfirmed(!!payload && payload.highMintingFee === undefined);
    }, [payload]);

    const opened = !!payload && isConfirmed;

    // MintModal.closeModal — the max lots changed (or may have)
    const close = (success: boolean) => {
        queryClient.invalidateQueries({
            queryKey: [MINTING_KEY.MAX_LOTS, FASSET_COIN.type],
            exact: true,
            refetchType: "all",
        });
        queryClient.resetQueries({
            queryKey: [MINTING_KEY.MAX_LOTS, FASSET_COIN.type],
            exact: true,
        });
        setIsMintWaitingModalActive(false);
        setIsConfirmed(false);
        onClose(success);
    };

    if (!fAssetCoin) return null;

    return (
        <>
            <FAssetModal
                opened={opened && !isMintWaitingModalActive}
                onClose={() => close(false)}
                closeOnEscape={false}
                centered
                size="lg"
                // The waiting / limit modals live inside the stepper — keep it after hiding
                keepMounted={true}
                title={t("mint_modal.title", { coinName: fAssetCoin.type })}
            >
                <FAssetModal.Body>
                    {opened && (
                        <ConfirmStepper
                            opened={opened && !isMintWaitingModalActive}
                            fAssetCoin={fAssetCoin}
                            formValues={{ amount: payload.amount, ...payload.mint }}
                            isBridgePage
                            onError={(alert) => {
                                setIsConfirmed(false);
                                onError(alert?.msg);
                            }}
                            onClose={(status) => {
                                if (status) {
                                    setIsMintWaitingModalActive(true);
                                } else {
                                    close(true);
                                }
                            }}
                        />
                    )}
                </FAssetModal.Body>
            </FAssetModal>
            <HighMintingFeeModal
                opened={!!payload && !isConfirmed && payload.highMintingFee !== undefined}
                onClose={(proceed) => proceed ? setIsConfirmed(true) : close(false)}
                fAssetCoin={fAssetCoin}
                mintingFee={payload?.highMintingFee ?? 0}
                transfer={payload?.amount ?? 0}
            />
        </>
    );
}
