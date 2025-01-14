import { Button, Divider, lighten, rem, Stepper, Text, Title } from "@mantine/core";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck, IconCircleCheck, IconExclamationCircle, IconFilePlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import DepositToPoolForm, { FormRef } from "@/components/forms/DepositToPoolForm";
import FAssetModal from "@/components/modals/FAssetModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { IPool } from "@/types";
import { useNativeBalance } from "@/api/balance";
import { useWeb3 } from "@/hooks/useWeb3"
import { useEnterCollateralPool } from "@/hooks/useContracts";
import { parseUnits, toNumber } from "@/utils";
import { isError } from "ethers";
import { CollateralPoolAbi } from "@/abi";
import { ErrorDecoder } from "ethers-decode-error";
import { showErrorNotification } from "@/hooks/useNotifications";
import { WALLET } from "@/constants";
import { POOL_KEY, useUserPool } from "@/api/pool";
import { COINS } from "@/config/coin";

interface IDepositToPoolModal {
    opened: boolean;
    onClose: () => void;
    collateralPool?: IPool
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

const STEP_WALLET_DEPOSIT = 0;
const STEP_WALLET_COMPLETED = 1;

const MIN_DEPOSIT = 2;

const FINISHED_MODAL = 'finished_modal;'

export default function DepositToPoolModal({ opened, onClose, collateralPool }: IDepositToPoolModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [currentWalletStep, setCurrentWalletStep] = useState<number>(STEP_WALLET_DEPOSIT);
    const [errorMessage, setErrorMessage] = useState<string>();
    const { t } = useTranslation();
    const formRef = useRef<FormRef>(null);
    const { mainToken } = useWeb3();
    const nativeBalances = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined && opened);
    const enterCollateralPool = useEnterCollateralPool();
    const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
    const [formValues, setFormValues] = useState<any>();
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);

    const userPool = useUserPool(collateralPool?.vaultType!, mainToken?.address!, collateralPool?.pool!, false);
    const queryClient = useQueryClient();

    const closeModal = () => {
        setErrorMessage(undefined);
        setCurrentStep(STEP_AMOUNT);
        setCurrentWalletStep(STEP_WALLET_DEPOSIT);
        onClose();
    }

    const updatePool = async () => {
        const delay = (ms: number) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        await delay(3000);
        const response = await userPool.refetch();
        queryClient.setQueriesData({
            queryKey: [POOL_KEY.USER_POOLS, mainToken?.address!, COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type).join()]
        }, (updater: IPool[] | undefined) => {
            return updater?.map((pool: IPool) => {
                return pool.pool === response?.data?.pool ? { ...response.data } : pool
            });
        });
    }

    const requestEnterCollateral = async (values?: any) => {
        try {
            setIsLedgerButtonDisabled(true);
            await enterCollateralPool.mutateAsync({
                userAddress: mainToken?.address!,
                poolAddress: collateralPool?.pool!,
                fAssets: 0,
                enterWithFullAssets: false,
                value: parseUnits(values?.amount || formValues.amount, 18).toString()
            });
            setCurrentWalletStep(STEP_WALLET_COMPLETED);
            nativeBalances.refetch();
            await updatePool();
            closeModal();
            openFinishedModal();
        } catch (error: any) {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            setCurrentStep(STEP_AMOUNT);
            if (isError(error, 'ACTION_REJECTED')) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else {
                const errorDecoder = ErrorDecoder.create([CollateralPoolAbi]);
                const decodedError = await errorDecoder.decode(error);
                setErrorMessage(error?.error?.message || decodedError.reason as string);
            }
            modals.closeAll();
        } finally {
            setIsLedgerButtonDisabled(false);
        }
    }

    const onNextStepClick = async() => {
        setErrorMessage(undefined);
        const form = formRef.current?.form();
        const status = form?.validate();

        if (status?.hasErrors || !form) return;

        const nativeBalance = nativeBalances?.data?.find(nativeBalance => 'wrapped' in nativeBalance);
        if (nativeBalance && toNumber(nativeBalance.balance) < MIN_DEPOSIT) {
            setErrorMessage(t('deposit_to_pool_modal.error_not_enough_balance', { tokenName: nativeBalance.symbol }));
            return;
        }

        setCurrentStep(STEP_CONFIRM);
        const values = form.getValues();
        setFormValues(values);
        if (mainToken?.connectedWallet === WALLET.LEDGER) return;

        await requestEnterCollateral(values);
    }

    const openFinishedModal = () => {
        modals.open({
            modalId: FINISHED_MODAL,
            zIndex: 3000,
            size: 500,
            title: t('deposit_to_pool_modal.title'),
            children: (
                <div className="px-0 sm:px-7">
                    <Title
                        className="text-24"
                        fw={300}
                    >
                        {t('deposit_to_pool_modal.finished_modal.title')}
                    </Title>
                    <div className="flex items-center mt-5">
                        <IconCircleCheck
                            color="var(--flr-black)"
                            className="mr-3"
                            style={{ width: rem(40), height: rem(40) }}
                        />
                        <Text
                            c="var(--flr-black)"
                            className="text-16"
                            fw={400}
                        >
                            {t('deposit_to_pool_modal.finished_modal.description_label')}
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
                        onClick={() => { modals.closeAll() }}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mb-5"
                    >
                        {t('deposit_to_pool_modal.finished_modal.confirm_button')}
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
        <FAssetModal
            opened={opened}
            onClose={closeModal}
            centered
            size={600}
            title={t('deposit_to_pool_modal.title')}
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
                                c="var(--flr-black)"
                            >
                                {t('deposit_to_pool_modal.want_to_deposit_title')}
                            </Title>
                            {collateralPool &&
                                <DepositToPoolForm
                                    ref={formRef}
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
                            {t('deposit_to_pool_modal.confirm_step_title')}
                        </Title>
                        <Text
                            c="var(--flr-black)"
                            fw={400}
                            className="text-16 my-5"
                        >
                            {t('deposit_to_pool_modal.confirm_step_description')}
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
                                        {t('deposit_to_pool_modal.enter_collateral_pool_step_label')}
                                    </Text>
                                }
                                description={
                                    <Text
                                        className="text-12"
                                        fw={400}
                                        c={lighten('var(--flr-gray)', 0.378)}
                                    >
                                        {t('deposit_to_pool_modal.enter_collateral_pool_step_description')}
                                    </Text>
                                }
                                icon={<IconFilePlus style={{ width: rem(18), height: rem(18) }} />}
                                completedIcon={
                                    <IconCheck
                                        style={{ width: rem(18), height: rem(18) }}
                                        color="var(--flr-black)"
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
                            onClick={() => requestEnterCollateral()}
                            isLoading={enterCollateralPool.isPending}
                            isDisabled={isLedgerButtonDisabled}
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
                        {t('deposit_to_pool_modal.next_button')}
                    </Button>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    );
}
