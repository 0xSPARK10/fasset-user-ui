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
    IconFilePlus
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import SendCPTForm, { FormRef } from "@/components/forms/SendCPTForm";
import FAssetModal from "@/components/modals/FAssetModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import { IPool } from "@/types";
import { useTransferCollateralPoolToken } from "@/hooks/useContracts";
import { parseUnits } from "@/utils";
import PayDebtModal from "@/components/modals/PayDebtModal";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { isError } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolTokenAbi } from "@/abi";
import { useWeb3 } from "@/hooks/useWeb3";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { showErrorNotification } from "@/hooks/useNotifications";
import { POOL_KEY, useUserPool } from "@/api/pool";
import { WALLET } from "@/constants";
import { COINS } from "@/config/coin";
import { useQueryClient } from "@tanstack/react-query";

interface ISendCPTsModal {
    opened: boolean;
    collateralPool?: IPool;
    onClose: () => void;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

const STEP_WALLET_DEPOSIT = 0;
const STEP_WALLET_COMPLETED = 1;

const FINISHED_MODAL = 'send_cpt_finished_modal;'

export default function SendCPTsModal({ opened, onClose, collateralPool }: ISendCPTsModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [currentWalletStep, setCurrentWalletStep] = useState<number>(STEP_WALLET_DEPOSIT);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isPayDebtModalActive, setIsPayDebtModalActive] = useState<boolean>(false);
    const formRef = useRef<FormRef>(null);
    const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
    const [formValues, setFormValues] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const transferCollateralPoolToken = useTransferCollateralPoolToken();
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const queryClient = useQueryClient();
    const pool = useUserPool(collateralPool?.vaultType!, mainToken?.address!, collateralPool?.pool!, false);

    const closeModal = () => {
        setErrorMessage(undefined);
        setCurrentStep(STEP_AMOUNT);
        setCurrentWalletStep(STEP_WALLET_DEPOSIT);
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

    const requestTransferCollateralPoolToken = async (values?: any) => {
        try {
            setIsLoading(true);
            await transferCollateralPoolToken.mutateAsync({
                userAddress: values?.account || formValues.account,
                poolAddress: collateralPool?.tokenAddress!,
                amount: parseUnits(values?.amount || formValues.amount, 18).toString()
            });
            setCurrentWalletStep(STEP_WALLET_COMPLETED);
            await updatePool();
            closeModal();
            openFinishedModal(values?.account || formValues.account, values?.amount || formValues.amount);
        } catch (error: any) {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            setCurrentStep(STEP_AMOUNT);
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

    const onNextStepClick = async () => {
        setErrorMessage(undefined);
        const form = formRef.current?.form();
        const status = form?.validate();

        if (status?.hasErrors || !form) return;

        const values = form.getValues();
        setFormValues(values);
        setCurrentStep(STEP_CONFIRM);
        if (mainToken?.connectedWallet === WALLET.LEDGER) return;

        await requestTransferCollateralPoolToken(values);
    }

    const onClosePayDeptModal = async () => {
        setIsPayDebtModalActive(false);
    }

    const openFinishedModal = (address: string, amount: number) => {
        modals.open({
            modalId: FINISHED_MODAL,
            zIndex: 3000,
            size: 500,
            title: t('send_cpt_modal.title'),
            children: (
                <div className="px-0 sm:px-7">
                    <Title
                        className="text-24"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {t('send_cpt_modal.finished_modal.title')}
                    </Title>
                    <div className="flex items-center mt-5">
                        <IconCircleCheck
                            color="var(--flr-black)"
                            className="mr-3"
                            style={{width: rem(40), height: rem(40)}}
                        />
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {t('send_cpt_modal.finished_modal.description_label', {
                                address: address,
                                amount: amount
                            })}
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
                        onClick={() => {
                            modals.closeAll()
                        }}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mb-5"
                    >
                        {t('send_cpt_modal.finished_modal.confirm_button')}
                    </Button>
                </div>
            ),
            centered: true,
            onClose: () => {
                modals.closeAll();
            }
        });
    }

    return (
        <>
            <FAssetModal
                opened={opened && !isPayDebtModalActive}
                onClose={closeModal}
                closeOnEscape={!isPayDebtModalActive}
                keepMounted={true}
                centered
                size={600}
                title={t('send_cpt_modal.title')}
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
                                            className="text-16"
                                            fw={400}
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
                                    {t('send_cpt_modal.want_to_transfer')}
                                </Title>
                                {collateralPool &&
                                    <SendCPTForm
                                        ref={formRef}
                                        payDebtClicked={() => setIsPayDebtModalActive(true)}
                                        collateralPool={collateralPool}
                                        isFormDisabled={isFormDisabled}
                                        setIsFormDisabled={setIsFormDisabled}
                                    />
                                }
                            </div>
                        </Stepper.Step>
                        <Stepper.Step
                            withIcon={false}
                        >
                            <Title
                                className="text-24"
                                c="var(--flr-black)"
                                fw={300}
                            >
                                {t('send_cpt_modal.confirm_step_title')}
                            </Title>
                            <Text
                                c="var(--flr-black)"
                                fw={400}
                                className="text-16 my-5"
                            >
                                {t('send_cpt_modal.confirm_step_description')}
                            </Text>
                            <Stepper
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
                                            {t('send_cpt_modal.transfer_collateral_pool_step_label')}
                                        </Text>
                                    }
                                    description={
                                        <Text
                                            className="text-12"
                                            fw={400}
                                            c={lighten('var(--flr-gray)', 0.378)}
                                        >
                                            {t('send_cpt_modal.transfer_collateral_pool_step_description')}
                                        </Text>
                                    }
                                    icon={<IconFilePlus style={{ width: rem(18), height: rem(18) }} />}
                                    completedIcon={
                                        <IconCheck
                                            style={{ width: rem(18), height: rem(18) }}
                                            color="var(--mantine-color-black)"
                                        />
                                    }
                                    loading={currentWalletStep === STEP_WALLET_DEPOSIT}
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
                                onClick={() => requestTransferCollateralPoolToken()}
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
                            disabled={isFormDisabled}
                            loading={isFormDisabled}
                            className="hover:text-white"
                        >
                            {t('send_cpt_modal.next_button')}
                        </Button>
                    </FAssetModal.Footer>
                }
            </FAssetModal>
            <PayDebtModal
                opened={isPayDebtModalActive}
                collateralPool={collateralPool}
                onClose={onClosePayDeptModal}
            />
        </>
    );
}
