import React, { useState, useRef, useCallback } from "react";
import {
    Stepper,
    Button,
    Text,
} from "@mantine/core";
import ConfirmStepper from "@/components/mint/ConfirmStepper";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import MintForm, { FormRef } from "@/components/forms/MintForm";
import FAssetModal from "@/components/modals/FAssetModal";
import HighMintingFeeModal from "@/components/modals/HighMintingFeeModal";
import { IFAssetCoin } from "@/types";
import FormAlert, { IAlertMessage } from "@/components/elements/FormAlert";
import { useWeb3 } from "@/hooks/useWeb3";
import { MINTING_KEY } from "@/api/minting";

interface IMintModal {
    opened: boolean;
    onClose: (fetchProgress: boolean) => void;
    fAssetCoin: IFAssetCoin;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

export default function MintModal({ opened, onClose, fAssetCoin }: IMintModal) {
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState<boolean>(true);
    const [formValues, setFormValues] = useState<any>();
    const [isRefreshButtonLoading, setIsRefreshButtonIsLoading] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [errorMessage, setErrorMessage] = useState<IAlertMessage>();
    const [isRefreshButtonVisible, setIsRefreshButtonVisible] = useState<boolean>(false);
    const [isMintWaitingModalActive, setIsMintWaitingModalActive] = useState<boolean>(false);
    const [mintTransfer, setMintTransfer] = useState<number>(0);
    const [isHighMintingFeeModalActive, setIsHighMintingFeeModalActive] = useState<boolean>(false);
    const [highMintingFee, setHighMintingFee] = useState<number>();

    const { walletConnectConnector } = useWeb3();
    const formRef = useRef<FormRef>(null);
    const stepperErrorRef = useRef<IAlertMessage>();
    const { t } = useTranslation();
    const queryClient = useQueryClient();


    const onNextStepClick = useCallback(async () => {
        const form = formRef.current?.form();
        const values = form?.getValues();
        setErrorMessage(undefined);

        const status = form?.validate();
        if (status?.hasErrors || !form) return;

        if (highMintingFee !== undefined) {
            setIsHighMintingFeeModalActive(true);
            return;
        }

        stepperErrorRef.current = undefined;
        setFormValues(values);
        setCurrentStep(STEP_CONFIRM);
    }, [formRef, highMintingFee]);

    const refreshBalance = () => {
        setIsNextButtonDisabled(true);
        setErrorMessage({ msg: `${t('notifications.request_rejected_by_user_label')} ${t('underlying_balance_card.update_balance_label')}` });
        setIsRefreshButtonVisible(true);
    }

    const fetchBalance = async() => {
        try {
            setIsRefreshButtonIsLoading(true);
            await walletConnectConnector.fetchUtxoAddresses(fAssetCoin.network.namespace, fAssetCoin.network.chainId, fAssetCoin.address!);
            setIsNextButtonDisabled(false);
        } catch (error: any) {
            if (error.code === 4001) {
                setErrorMessage({ msg: t('notifications.request_rejected_by_user_label') });
            } else {
                setErrorMessage({ msg: error.message });
            }
        } finally {
            setIsRefreshButtonIsLoading(false);
        }
    }

    const closeModal = async () => {
        queryClient.invalidateQueries({
            queryKey: [MINTING_KEY.MAX_LOTS, fAssetCoin.type],
            exact: true,
            refetchType: 'all'
        });
        queryClient.resetQueries({
            queryKey: [MINTING_KEY.MAX_LOTS, fAssetCoin.type],
            exact: true,
        });
        onClose(true);
    }

    const onCloseHighMintingFeeModal = (proceed: boolean) => {
        setIsHighMintingFeeModalActive(false);
        if (proceed) {
            const form = formRef.current?.form();
            const values = form?.getValues();

            setFormValues(values);
            setCurrentStep(STEP_CONFIRM);
        }
    }

    return (
        <>
            <FAssetModal
                opened={opened && !isMintWaitingModalActive}
                onClose={closeModal}
                closeOnEscape={currentStep === STEP_AMOUNT}
                centered
                size="lg"
                keepMounted={true}
                title={t('mint_modal.title', { coinName: fAssetCoin.type })}
            >
                <FAssetModal.Body>
                    <Stepper
                        active={currentStep}
                        size="xs"
                        classNames={{
                            content: 'pt-0',
                            separator: 'hidden'
                        }}
                    >
                        <Stepper.Step
                            withIcon={false}
                        >
                            <div>
                                <FormAlert message={errorMessage?.msg} type={errorMessage?.type} />
                                {isRefreshButtonVisible &&
                                    <Button
                                        onClick={fetchBalance}
                                        variant="gradient"
                                        size="xs"
                                        radius="xl"
                                        className="flex-shrink-0 mb-3"
                                        fw={400}
                                        loading={isRefreshButtonLoading}
                                    >
                                        {t('underlying_balance_card.refresh_button')}
                                    </Button>
                                }
                                <Text
                                    className="text-24"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {t('mint_modal.amount_step_title')}
                                </Text>
                                {opened &&
                                    <MintForm
                                        ref={formRef}
                                        fAssetCoin={fAssetCoin}
                                        isFormDisabled={(status) => setIsNextButtonDisabled(status)}
                                        refreshBalance={refreshBalance}
                                        setHighMintingFee={(mintingFee, transfer) => {
                                            if (mintingFee !== undefined) {
                                                setErrorMessage({ msg: t('mint_modal.minting_fee_high_warning_label'), type: 'warning' });
                                                setMintTransfer(transfer ?? 0);
                                            } else {
                                                setErrorMessage(prev => prev?.msg === t('mint_modal.minting_fee_high_warning_label') ? undefined : prev);
                                            }
                                            setHighMintingFee(mintingFee);
                                        }}
                                        onError={(alert) => {
                                            if (!alert && stepperErrorRef.current) return;
                                            setErrorMessage(alert);
                                        }}
                                    />
                                }
                            </div>
                        </Stepper.Step>
                        <Stepper.Step
                            withIcon={false}
                        >
                            <ConfirmStepper
                                fAssetCoin={fAssetCoin}
                                formValues={formValues}
                                onError={(alert) => { stepperErrorRef.current = alert; setErrorMessage(alert); setCurrentStep(STEP_AMOUNT); }}
                                onClose={(status) => {
                                    if (status) {
                                        setIsMintWaitingModalActive(true);
                                    } else {
                                        setIsMintWaitingModalActive(false);
                                        onClose(true);
                                    }
                                }}
                            />
                        </Stepper.Step>
                    </Stepper>
                </FAssetModal.Body>
                {currentStep == STEP_AMOUNT &&
                    <FAssetModal.Footer>
                        <Button
                            onClick={onNextStepClick}
                            variant="filled"
                            color="var(--mantine-color-black)"
                            radius="xl"
                            size="sm"
                            fullWidth
                            className="hover:text-white"
                            disabled={isNextButtonDisabled}
                        >
                            {t('mint_modal.next_button')}
                        </Button>
                    </FAssetModal.Footer>
                }
            </FAssetModal>
            <HighMintingFeeModal
                opened={isHighMintingFeeModalActive}
                onClose={onCloseHighMintingFeeModal}
                fAssetCoin={fAssetCoin}
                mintingFee={highMintingFee ?? 0}
                transfer={mintTransfer}
            />
        </>
    );
}
