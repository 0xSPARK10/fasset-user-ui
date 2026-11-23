import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Divider, lighten, rem, Stepper, Text, Title } from "@mantine/core";
import { IconCheck, IconFilePlus } from "@tabler/icons-react";
import FAssetModal from "@/components/modals/FAssetModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { STEP_WALLET_REDEMPTION, useRedeemRequest } from "@/components/redeem/useRedeemRequest";
import { FASSET_COIN } from "@/config/coin";
import { WALLET } from "@/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import { IFAssetCoin } from "@/types";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";

interface IRedeemConfirmModal {
    payload?: Extract<BridgeSubmitPayload, { kind: "redeem" }>;
    // Pre-broadcast error (tag not supported, rejected, revert) — the page shows it on top
    onError: (message?: string) => void;
    // fetchProgress = a post-tx modal was closed (as RedeemModal.onClose)
    onClose: (success: boolean) => void;
}

/**
 * Confirm step of a redeem opened from the bridge page — the page is the amount step. Same
 * request, post-tx modals and confirm UI as RedeemModal (shared via useRedeemRequest).
 */
export default function RedeemConfirmModal({ payload, onError, onClose }: IRedeemConfirmModal) {
    const { t } = useTranslation();
    const { mainToken, getConnectedCoin } = useWeb3();
    // Redeem may go to a typed address, so the XRPL wallet is optional — only its type /
    // decimals / network are used
    const fAssetCoin = (getConnectedCoin(FASSET_COIN.type) ?? FASSET_COIN) as IFAssetCoin;
    const opened = !!payload;

    const redeemRequest = useRedeemRequest({
        fAssetCoin,
        opened,
        onError: (message) => {
            redeemRequest.reset();
            onError(message);
        },
        onClose: (fetchProgress) => {
            redeemRequest.reset();
            onClose(fetchProgress);
        },
    });
    const { currentWalletStep, isLedgerButtonDisabled } = redeemRequest;

    const values = payload && {
        amount: payload.amount,
        destinationAddress: payload.destinationAddress,
        destinationTag: payload.destinationTag,
        executorAddress: payload.executorAddress,
        executorFee: payload.executorFee,
    };

    // RedeemModal.onNextStepClick: start right away, except Ledger (confirm card below).
    // Deferred + cancelled in cleanup: Strict Mode's mount → unmount → mount then starts once,
    // after useModalGuard's controller of the second mount exists (the first one is aborted)
    useEffect(() => {
        if (!values || mainToken?.connectedWallet === WALLET.LEDGER) return;
        const timer = setTimeout(() => void redeemRequest.requestRedeem(values));
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload]);

    return (
        <>
            <FAssetModal
                opened={opened && !redeemRequest.isPostTxModalActive}
                onClose={() => {
                    redeemRequest.reset();
                    onClose(false);
                }}
                closeOnEscape={false}
                size="lg"
                centered
                title={t('redeem_modal.title', { coinName: fAssetCoin.type })}
            >
                <FAssetModal.Body>
                    <Title
                        className="text-24"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {t('bridge_modal.confirm_step_title')}
                    </Title>
                    <Stepper
                        className="mt-5"
                        active={currentWalletStep}
                        iconSize={30}
                        size="sm"
                        orientation="vertical"
                        classNames={{
                            step: 'min-h-0'
                        }}
                    >
                        <Stepper.Step
                            label={
                                <Text
                                    className="text-14"
                                    fw={500}
                                    c="var(--flr-black)"
                                >
                                    {t('bridge_modal.redeem_step_label', { fAsset: fAssetCoin.type })}
                                </Text>
                            }
                            description={
                                <Text
                                    className="text-12"
                                    fw={400}
                                    c={lighten('var(--flr-gray)', 0.378)}
                                >
                                    {t('bridge_modal.redeem_step_description', { fAsset: fAssetCoin.type })}
                                </Text>
                            }
                            icon={<IconFilePlus style={{ width: rem(18), height: rem(18) }} />}
                            completedIcon={
                                <IconCheck
                                    style={{ width: rem(18), height: rem(18) }}
                                    color="var(--flr-black)"
                                />
                            }
                            loading={currentWalletStep === STEP_WALLET_REDEMPTION}
                        />
                    </Stepper>
                    {mainToken?.connectedWallet === WALLET.LEDGER && values &&
                        <>
                            <Divider
                                className="my-8"
                                styles={{
                                    root: {
                                        marginLeft: '-2.7rem',
                                        marginRight: '-2.7rem'
                                    }
                                }}
                            />
                            <LedgerConfirmTransactionCard
                                appName={mainToken?.network?.ledgerApp!}
                                onClick={() => redeemRequest.requestRedeem(values)}
                                isLoading={redeemRequest.isRedeemPending}
                                isDisabled={isLedgerButtonDisabled}
                            />
                        </>
                    }
                    {mainToken?.connectedWallet === WALLET.WALLET_CONNECT &&
                        <>
                            <Divider
                                className="my-8"
                                styles={{
                                    root: {
                                        marginLeft: '-2.7rem',
                                        marginRight: '-2.7rem'
                                    }
                                }}
                            />
                            <WalletConnectOpenWalletCard />
                        </>
                    }
                </FAssetModal.Body>
            </FAssetModal>
            {redeemRequest.finishedModal}
        </>
    );
}
