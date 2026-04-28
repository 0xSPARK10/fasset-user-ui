import { IRedeemerBalance } from "@/api/oft";
import FAssetModal from "@/components/modals/FAssetModal";
import { useTranslation } from "react-i18next";
import {
    Button,
    Divider,
    lighten,
    rem,
    Stepper,
    Text,
    Title
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import AmountInput from "@/components/elements/AmountInput";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTransferFrom } from "@/hooks/useContracts";
import { isError } from "ethers";
import { showErrorNotification } from "@/hooks/useNotifications";
import { IconCheck, IconCircleCheck, IconSettings } from "@tabler/icons-react";
import { WALLET } from "@/constants";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import { parseUnits, toNumber } from "@/utils";
import { COINS } from "@/config/coin";
import { BALANCE_KEY } from "@/api/balance";
import { useQueryClient } from "@tanstack/react-query";
import { OFT_KEY } from "@/api/oft";
import ModalDivider from "../elements/ModalDivider";

interface IRedeemerWithdrawModal {
    opened: boolean;
    onClose: () => void;
    token: IRedeemerBalance | undefined;
    redeemerAddress: string;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;
const STEP_FINISHED = 2;

export default function RedeemerWithdrawModal({ opened, onClose, token, redeemerAddress }: IRedeemerWithdrawModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const queryClient = useQueryClient();

    const transferFrom = useTransferFrom();

    const maxAmount = token ? toNumber(token.balance) : 0;
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);

    const coin = COINS.find(c => c.type === token?.symbol);

    const form = useForm({
        mode: "controlled",
        initialValues: { amount: maxAmount as number | undefined },
    });

    useEffect(() => {
        if (!opened) return;
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);
        form.setValues({ amount: maxAmount });
    }, [opened, maxAmount]);

    const closeModal = () => {
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);
        onClose();
    };

    const onNextStepClick = () => {
        setErrorMessage(undefined);
        const amount = form.values.amount;

        if (!amount || amount <= 0) {
            setErrorMessage(t('validation.messages.required', { field: t('redeemer_withdraw_modal.form.amount_label') }));
            return;
        }

        if (amount > maxAmount) {
            setErrorMessage(t('redeemer_withdraw_modal.error_insufficient_balance'));
            return;
        }

        setCurrentStep(STEP_CONFIRM);

        if (mainToken?.connectedWallet !== WALLET.LEDGER) {
            executeTransfer();
        }
    };

    const executeTransfer = async () => {
        const amount = form.values.amount;
        if (!token || !mainToken?.address || !amount) return;

        try {
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);

            // Use on-chain decimals: 18 for wnat (WC2FLR, WFLR), 6 for fasset/collateral
            const decimals = coin?.contractDecimals ?? 6;

            await transferFrom.mutateAsync({
                tokenAddress: token.address,
                from: redeemerAddress,
                to: mainToken.address,
                amount: parseUnits(amount, decimals).toString()
            });

            queryClient.invalidateQueries({ queryKey: [BALANCE_KEY.NATIVE_BALANCE, mainToken?.address], exact: true, refetchType: 'all' });
            queryClient.invalidateQueries({ queryKey: [OFT_KEY.REDEEMER_ACCOUNT] });

            setCurrentStep(STEP_FINISHED);
        } catch (error: any) {
            if (isError(error, 'ACTION_REJECTED')) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else if (error.cause === 'ledger') {
                showErrorNotification(error.message);
            } else {
                setErrorMessage(error.message ?? t('errors.transaction_failed_label'));
            }
            setCurrentStep(STEP_AMOUNT);
        } finally {
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    };

    return (
        <FAssetModal
            opened={opened}
            onClose={closeModal}
            centered
            size="lg"
            title={t('redeemer_withdraw_modal.title')}
        >
            <FAssetModal.Body>
                {opened &&
                    <Stepper
                        active={currentStep}
                        size="xs"
                        classNames={{
                            content: 'pt-0',
                            separator: 'hidden'
                        }}
                    >
                        {/* Step 0: Amount form */}
                        <Stepper.Step withIcon={false}>
                            {errorMessage &&
                                <div className="flex items-center mb-5 border border-red-700 p-3 bg-red-100">
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-red)"
                                    >
                                        {errorMessage}
                                    </Text>
                                </div>
                            }
                            <Text
                                className="text-24 mb-5"
                                fw={300}
                                c="var(--flr-black)"
                            >
                                {t('redeemer_withdraw_modal.form.step_title')}
                            </Text>
                            {coin &&
                                <AmountInput
                                    form={form}
                                    fAssetCoin={coin}
                                    maxAmount={maxAmount}
                                    label={t('redeemer_withdraw_modal.form.amount_label')}
                                    description={t('redeemer_withdraw_modal.form.balance_label', {
                                        balance: maxAmount,
                                        token: token?.symbol
                                    })}
                                    className="mb-10"
                                />
                            }

                        <ModalDivider />
                        
                        <div className="flex flex-col mt-10 mb-10">
                            <Text c="var(--flr-gray)" fw={400} className="text-12 uppercase">
                                {t('redeemer_withdraw_modal.form.destination_address_label')}
                            </Text>
                            <Text c="var(--flr-black)" fw={400} className="text-14 mt-1">
                                {mainToken?.address}
                            </Text>
                        </div>
                        

                        </Stepper.Step>

                        {/* Step 1: Confirm / Transfer in progress */}
                        <Stepper.Step withIcon={false}>
                            <Title
                                className="text-24"
                                fw={300}
                                c="var(--flr-black)"
                            >
                                {t('redeemer_withdraw_modal.confirm.title')}
                            </Title>
                            <Text
                                className="my-5 text-16"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {t('redeemer_withdraw_modal.confirm.description')}
                            </Text>
                            <Stepper
                                active={0}
                                iconSize={32}
                                size="sm"
                                orientation="vertical"
                                classNames={{
                                    stepDescription: 'max-w-[300px]'
                                }}
                            >
                                <Stepper.Step
                                    label={
                                        <Text
                                            className="text-14"
                                            fw={500}
                                            c="var(--flr-black)"
                                        >
                                            {t('redeemer_withdraw_modal.confirm.transfer_step_label')}
                                        </Text>
                                    }
                                    description={
                                        <Text
                                            className="text-12"
                                            fw={400}
                                            c={lighten('var(--flr-gray)', 0.378)}
                                        >
                                            {t('redeemer_withdraw_modal.confirm.transfer_step_description', { symbol: token?.symbol })}
                                        </Text>
                                    }
                                    icon={<IconSettings size={16} />}
                                    completedIcon={<IconCheck size={16} color="var(--flr-black)" />}
                                    loading={isLoading}
                                    step={0}
                                />
                            </Stepper>
                            {mainToken?.connectedWallet === WALLET.WALLET_CONNECT &&
                                <>
                                    <Divider
                                        className="my-8"
                                        classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
                                    />
                                    <WalletConnectOpenWalletCard />
                                </>
                            }
                            {mainToken?.connectedWallet === WALLET.LEDGER &&
                                <>
                                    <Divider
                                        className="my-8"
                                        classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
                                    />
                                    <LedgerConfirmTransactionCard
                                        appName={mainToken?.network?.ledgerApp!}
                                        onClick={executeTransfer}
                                        isLoading={isLoading}
                                        isDisabled={isLedgerButtonDisabled}
                                    />
                                </>
                            }
                        </Stepper.Step>

                        {/* Step 2: Finished */}
                        <Stepper.Step withIcon={false}>
                            <Title
                                className="text-24"
                                fw={300}
                            >
                                {t('redeemer_withdraw_modal.finished.title')}
                            </Title>
                            <div className="flex items-center mt-5">
                                <IconCircleCheck
                                    color="var(--flr-black)"
                                    className="mr-3 flex-shrink-0"
                                    style={{ width: rem(40), height: rem(40) }}
                                />
                                <Text
                                    c="var(--flr-black)"
                                    className="text-16"
                                    fw={400}
                                >
                                    {t('redeemer_withdraw_modal.finished.description', { symbol: token?.symbol })}
                                </Text>
                            </div>
                            <Divider
                                className="my-8"
                                classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
                            />
                            <Button
                                onClick={closeModal}
                                variant="filled"
                                color="black"
                                radius="xl"
                                size="sm"
                                fullWidth
                                className="hover:text-white font-normal mb-5"
                            >
                                {t('redeemer_withdraw_modal.finished.confirm_button')}
                            </Button>
                        </Stepper.Step>
                    </Stepper>
                }
            </FAssetModal.Body>
            {currentStep === STEP_AMOUNT &&
                <FAssetModal.Footer>
                    <Button
                        onClick={onNextStepClick}
                        variant="filled"
                        color="var(--flr-black)"
                        radius="xl"
                        size="sm"
                        fullWidth
                        disabled={!form.values.amount || form.values.amount <= 0}
                        className="hover:text-white"
                    >
                        {t('redeemer_withdraw_modal.form.next_button')}
                    </Button>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    );
}
