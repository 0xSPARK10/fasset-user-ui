import {
    Title,
    Divider,
    Button,
    rem,
    Text,
    Stepper, lighten
} from "@mantine/core";
import React from 'react';
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    IconCheck,
    IconCircleCheck,
    IconExclamationCircle,
    IconFilePlus,
    IconSettings
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import PayDebtForm, { FormRef } from "@/components/forms/PayDebtForm";
import FAssetModal from "@/components/modals/FAssetModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { IPool } from "@/types";
import { useFreeCptApprove, useFreeCptPayAssetFeeDebt } from "@/hooks/useContracts";
import { parseUnits } from "@/utils";
import { isError } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolTokenAbi } from "@/abi";
import { useNativeBalance } from "@/api/balance";
import { COINS } from "@/config/coin";
import { useWeb3 } from "@/hooks/useWeb3";
import { showErrorNotification } from "@/hooks/useNotifications";
import  { WALLET } from "@/constants";
import { POOL_KEY, useUserPool } from "@/api/pool";
import { useQueryClient } from "@tanstack/react-query";

interface IPayDebtModal {
    opened: boolean;
    onClose: () => void;
    collateralPool?: IPool
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

const STEP_APPROVAL = 0;
const STEP_TRANSFER_FASSETS = 1;
const STEP_COMPLETED = 2;

const FINISHED_MODAL = 'pay_debt_finished_modal;'

export default function PayDebtModal({ opened, onClose, collateralPool }: IPayDebtModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [confirmationStep, setConfirmationStep] = useState<number>(STEP_APPROVAL);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [formValues, setFormValues] = useState<any>();
    const [isFinishedModalActive, setIsFinishedModalActive] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const formRef = useRef<FormRef>(null);

    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const freeCptApprove = useFreeCptApprove();
    const freeCptPayAssetFeeDebt = useFreeCptPayAssetFeeDebt();
    const queryClient = useQueryClient();
    const nativeBalance = useNativeBalance(mainToken?.address!, opened && mainToken !== undefined);
    const pool = useUserPool(collateralPool?.vaultType!, mainToken?.address!, collateralPool?.pool!, false);

    const fAssetCoin = COINS.find(coin => coin.type === collateralPool?.vaultType);
    const fAssetBalance = nativeBalance?.data?.find(balance => balance.symbol === fAssetCoin?.type);

    const closeModal = async() => {
        setErrorMessage(undefined);
        setCurrentStep(STEP_AMOUNT);
        setConfirmationStep(STEP_APPROVAL);
        setIsLoading(false);
        setIsFinishedModalActive(false);
        onClose();
    }

    const updatePool = async () => {
        const response = await pool.refetch();
        queryClient.setQueriesData({
            queryKey: [POOL_KEY.USER_POOLS, mainToken?.address!, COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type).join()]
        }, updater => {
            return (updater as IPool[]).map((pool: IPool) => {
                return pool.pool === response?.data?.pool ? { ...response.data } : pool
            });
        });
    }

    const requestFreeCptApprove = async (values?: any) => {
        try {
            const amount = parseUnits(values?.debtAmount || formValues.debtAmount, ['DOGE', 'BTC'].includes(fAssetCoin?.nativeName!) ? 8 : 6).toString();
            setIsLoading(true);

            await freeCptApprove.mutateAsync({
                spenderAddress: collateralPool?.pool!,
                coinName: collateralPool?.vaultType!,
                amount: amount
            });

            setConfirmationStep(STEP_TRANSFER_FASSETS);
            setCurrentStep(STEP_CONFIRM);
        } catch (error: any) {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            setCurrentStep(STEP_AMOUNT);
            setConfirmationStep(STEP_APPROVAL);
            if (isError(error, 'ACTION_REJECTED')) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else {
                const errorDecoder = ErrorDecoder.create([CollateralPoolTokenAbi]);
                const decodedError = await errorDecoder.decode(error);
                setErrorMessage(error?.error?.message || decodedError.reason as string);
            }
            modals.closeAll();
        } finally {
            setIsLoading(false);
        }
    }

    const requestFreeCptPayAssetFeeDebt = async (values?: any) => {
        try {
            setIsLoading(true);
            const delay = (ms: number) => {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(4000);

            const amount = parseUnits(values?.debtAmount || formValues.debtAmount, ['doge', 'btc'].includes(fAssetCoin?.nativeName?.toLowerCase()!) ? 8 : 6).toString();
            await freeCptPayAssetFeeDebt.mutateAsync({
                poolAddress: collateralPool?.pool!,
                amount: amount
            });

            setConfirmationStep(STEP_COMPLETED);
            await updatePool();
            await closeModal();
            openFinishedModal();
        } catch (error: any) {
            setCurrentStep(STEP_AMOUNT);
            setConfirmationStep(STEP_APPROVAL);

            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            if (isError(error, 'ACTION_REJECTED')) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else {
                const errorDecoder = ErrorDecoder.create([CollateralPoolTokenAbi]);
                const decodedError = await errorDecoder.decode(error);
                setErrorMessage(decodedError.reason as string);
            }
            modals.closeAll();
        } finally {
            setIsLoading(false);
        }
    }

    const onNextStepClick = async () => {
        setErrorMessage(undefined);
        const form = formRef.current?.form();
        const status = form?.validate();

        if (status?.hasErrors || !form) return;

        const values = form.getValues();
        setFormValues(values);
        setCurrentStep(STEP_CONFIRM);
        if (mainToken?.connectedWallet === WALLET.LEDGER) return;

        await requestFreeCptApprove(values);
        await requestFreeCptPayAssetFeeDebt(values);
    }

    const openFinishedModal = () => {
        setIsFinishedModalActive(true);
        modals.open({
            modalId: FINISHED_MODAL,
            zIndex: 4000,
            size: 500,
            title: t('pay_debt_modal.title'),
            children: (
                <div className="px-0 sm:px-7">
                    <Title
                        className="text-24"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {t('pay_debt_modal.finished_modal.title')}
                    </Title>
                    <div className="flex items-center mt-5">
                        <IconCircleCheck
                            color="var(--mantine-color-black)"
                            className="mr-3"
                            style={{ width: rem(40), height: rem(40) }}
                        />
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {t('pay_debt_modal.finished_modal.description_label')}
                        </Text>
                    </div>
                    <Divider
                        className="my-8"
                        styles={{
                            root: {
                                marginLeft: '-2.7rem',
                                marginRight: '-2.7rem'
                            }
                        }}
                    />
                    <Button
                        onClick={() => { modals.close(FINISHED_MODAL) }}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mb-5"
                    >
                        {t('pay_debt_modal.finished_modal.confirm_button')}
                    </Button>
                </div>
            ),
            centered: true,
            onClose: async () => {
                await closeModal();
            }
        });
    }

    return (
        <FAssetModal
            opened={opened && !isFinishedModalActive}
            onClose={() => closeModal()}
            centered
            size={600}
            title={t('pay_debt_modal.title')}
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
                                        className="mr-3"
                                    />
                                    <Text
                                        size="sm"
                                        c="var(--flr-red)"
                                    >
                                        {errorMessage}
                                    </Text>
                                </div>
                            }
                            <Title
                                fw={300}
                                className="text-24 mb-5"
                            >
                                {t('pay_debt_modal.pay_debt_label')}
                            </Title>
                            {collateralPool &&
                                <PayDebtForm
                                    ref={formRef}
                                    collateralPool={collateralPool}
                                />
                            }
                        </div>
                    </Stepper.Step>
                    <Stepper.Step
                        withIcon={false}
                    >
                        <Title
                            className="text-24"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {t('pay_debt_modal.confirm_step_title')}
                        </Title>
                        <Text
                            className="text-16 my-5"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {t('pay_debt_modal.confirm_step_description')}
                        </Text>
                        <Stepper
                            active={confirmationStep}
                            iconSize={30}
                            size="sm"
                            orientation="vertical"
                        >
                            <Stepper.Step
                                label={
                                    <Text
                                        className="text-14"
                                        fw={500}
                                        c="var(--flr-black)"
                                    >
                                        {t('pay_debt_modal.approval_label')}
                                    </Text>
                                }
                                description={
                                    <Text
                                        className="text-12"
                                        fw={400}
                                        c={lighten('var(--flr-gray)', 0.378)}
                                    >
                                        {t('pay_debt_modal.approval_description_label')}
                                    </Text>
                                }
                                icon={<IconFilePlus style={{ width: rem(18), height: rem(18) }} />}
                                completedIcon={
                                    <IconCheck
                                        style={{ width: rem(18), height: rem(18) }}
                                        color="var(--flr-black)"
                                    />
                                }
                                loading={confirmationStep === STEP_APPROVAL}
                            />
                            <Stepper.Step
                                label={
                                    <Text
                                        className="text-14"
                                        fw={500}
                                        c="var(--flr-black)"
                                    >
                                        {t('pay_debt_modal.transfer_label')}
                                    </Text>
                                }
                                description={
                                    <Text
                                        className="text-12"
                                        fw={400}
                                        c={lighten('var(--flr-gray)', 0.378)}
                                    >
                                        {t('pay_debt_modal.transfer_description_label')}
                                    </Text>
                                }
                                icon={<IconSettings style={{ width: rem(18), height: rem(18) }} />}
                                completedIcon={
                                    <IconCheck
                                        style={{ width: rem(18), height: rem(18) }}
                                        color="var(--mantine-color-black)"
                                    />
                                }
                                loading={confirmationStep === STEP_TRANSFER_FASSETS}
                            />
                        </Stepper>
                    </Stepper.Step>
                </Stepper>
                {currentStep === STEP_CONFIRM && mainToken?.connectedWallet === WALLET.LEDGER &&
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
                            onClick={() => confirmationStep === STEP_APPROVAL ? requestFreeCptApprove() : requestFreeCptPayAssetFeeDebt()}
                            isLoading={isLoading}
                        />
                    </>
                }
                {currentStep === STEP_CONFIRM && mainToken?.connectedWallet === WALLET.WALLET_CONNECT &&
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
            {currentStep === STEP_AMOUNT &&
                <FAssetModal.Footer>
                    <Button
                        onClick={onNextStepClick}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        loading={isLoading}
                        disabled={fAssetBalance?.balance === "0"}
                        className="hover:text-white"
                    >
                        {t('pay_debt_modal.next_button')}
                    </Button>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    );
}
