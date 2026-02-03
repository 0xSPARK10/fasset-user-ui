import React, { useState, useRef, useCallback } from "react";
import {
    Stepper,
    Button,
    Text,
    rem,
    Anchor,
} from "@mantine/core";
import { IconExclamationCircle, IconArrowUpRight } from "@tabler/icons-react";
import ConfirmStepper from "@/components/mint/ConfirmStepper";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation, Trans } from "react-i18next";
import { useEstimateFee } from "@/api/minting";
import { useNativeBalance } from "@/api/balance";
import MintForm, { FormRef } from "@/components/forms/MintForm";
import FAssetModal from "@/components/modals/FAssetModal";
import HighMintingFeeModal from "@/components/modals/HighMintingFeeModal";
import { parseUnits } from "@/utils";
import { IFAssetCoin, ISelectedAgent } from "@/types";
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
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isRefreshButtonVisible, setIsRefreshButtonVisible] = useState<boolean>(false);
    const [isMintWaitingModalActive, setIsMintWaitingModalActive] = useState<boolean>(false);
    const [selectedAgent, setSelectedAgent] = useState<ISelectedAgent>();
    const [lots, setLots] = useState<number>();
    const [isHighMintingFeeModalActive, setIsHighMintingFeeModalActive] = useState<boolean>(false);
    const [highMintingFee, setHighMintingFee] = useState<number>();

    const { walletConnectConnector, mainToken } = useWeb3();
    const formRef = useRef<FormRef>(null);
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const nativeBalances = useNativeBalance(mainToken?.address ?? '', false);
    const estimatedFee = useEstimateFee(fAssetCoin.type);

    const onNextStepClick = useCallback(async () => {
        const form = formRef.current?.form();
        const values = form?.getValues();
        setErrorMessage(undefined);

        const status = form?.validate();
        if (status?.hasErrors || !form) return;

        const nativeBalance = nativeBalances.data && nativeBalances.data.find(nativeBalance => nativeBalance.symbol.toLowerCase() === mainToken?.type.toLowerCase());
        const minFee = BigInt(values.collateralReservationFee) + parseUnits(mainToken?.minWalletBalance!, 18);

        if (nativeBalance && parseUnits(nativeBalance.balance.replace(/,/g, ''), 18) < minFee) {
            setErrorMessage(t('mint_modal.form.error_insufficient_balance_label', { tokenName: mainToken?.type }));
            return;
        }

        if (highMintingFee !== undefined) {
            setIsHighMintingFeeModalActive(true);
            return;
        }

        setFormValues(values);
        setCurrentStep(STEP_CONFIRM);
    }, [formRef, nativeBalances, mainToken?.address]);

    const refreshBalance = () => {
        setIsNextButtonDisabled(true);
        setErrorMessage(`${t('notifications.request_rejected_by_user_label')} ${t('underlying_balance_card.update_balance_label')}`);
        setIsRefreshButtonVisible(true);
    }

    const fetchBalance = async() => {
        try {
            setIsRefreshButtonIsLoading(true);
            await walletConnectConnector.fetchUtxoAddresses(fAssetCoin.network.namespace, fAssetCoin.network.chainId, fAssetCoin.address!);
            setIsNextButtonDisabled(false);
        } catch (error: any) {
            if (error.code === 4001) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else {
                setErrorMessage(error.message);
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
                                {errorMessage &&
                                    <div className="flex items-center mb-5 border border-red-700 p-3 bg-red-100">
                                        <IconExclamationCircle
                                            style={{ width: rem(25), height: rem(25) }}
                                            color="var(--flr-red)"
                                            className="mr-3 flex-shrink-0"
                                        />
                                        <Text
                                            className="text-16"
                                            fw={400}
                                            c="var(--flr-red)"
                                        >
                                            {errorMessage}
                                        </Text>
                                    </div>
                                }
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
                                        selectedAgent={selectedAgent}
                                        setSelectedAgent={setSelectedAgent}
                                        lots={lots}
                                        setLots={setLots}
                                        fAssetCoin={fAssetCoin}
                                        isFormDisabled={(status) => setIsNextButtonDisabled(status)}
                                        refreshBalance={refreshBalance}
                                        setHighMintingFee={(mintingFee) => {
                                            if (mintingFee !== undefined) {
                                                setErrorMessage(t('mint_modal.minting_fee_high_warning_label'));
                                            } else {
                                                setErrorMessage('');
                                            }
                                            setHighMintingFee(mintingFee);
                                        }}
                                        onError={(error) => { setErrorMessage(error); }}
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
                                onError={(error) => { setErrorMessage(error); setCurrentStep(STEP_AMOUNT) }}
                                onClose={(status) => {
                                    if (status) {
                                        setIsMintWaitingModalActive(true);
                                    } else {
                                        setIsMintWaitingModalActive(false);
                                        onClose(true);
                                    }
                                }}
                                selectedAgent={selectedAgent!}
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
                lots={lots}
            />
        </>
    );
}