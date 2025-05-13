import {
    Title,
    Divider,
    Button,
    rem,
    Text,
    Stepper,
    lighten
} from "@mantine/core";
import { IPool } from "@/types";
import { useTranslation } from "react-i18next";
import React, { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import { IconCheck, IconCircleCheck, IconExclamationCircle, IconFilePlus } from "@tabler/icons-react";
import { parseUnits } from "@/utils";
import { isError } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolAbi } from "@/abi";
import ClaimRewardsFromPoolForm, { FormRef } from "@/components/forms/ClaimRewardsFromPoolForm";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import FAssetModal from "@/components/modals/FAssetModal";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useWithdrawFeesCollateralPool } from "@/hooks/useContracts";
import { toNumber } from "@/utils";
import { WALLET } from "@/constants";
import { showErrorNotification } from "@/hooks/useNotifications";
import { POOL_KEY, useUserPool } from "@/api/pool";
import { COINS } from "@/config/coin";
import { USER_KEY } from "@/api/user";

interface IClaimRewardsFromPoolModal {
    opened: boolean;
    onClose: () => void;
    collateralPool?: IPool;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

const STEP_WALLET_CLAIM_REWARDS = 0;
const STEP_WALLET_COMPLETED = 1;

const MIN_DEPOSIT = 2;

const FINISHED_MODAL = 'finished_modal;'

export default function ClaimRewardsFromPoolModal({ opened, onClose, collateralPool }: IClaimRewardsFromPoolModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [currentWalletStep, setCurrentWalletStep] = useState<number>(STEP_WALLET_CLAIM_REWARDS);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);
    const [formValues, setFormValues] = useState<any>();

    const { t } = useTranslation();
    const formRef = useRef<FormRef>(null);
    const { mainToken } = useWeb3();
    const nativeBalances = useNativeBalance(mainToken?.address!, mainToken !== undefined && opened);
    const claimRewardsCollateralPool = useWithdrawFeesCollateralPool();
    const userPool = useUserPool(collateralPool?.vaultType!, mainToken?.address!, collateralPool?.pool!, false);
    const queryClient = useQueryClient();

    const closeModal = () => {
        setErrorMessage(undefined);
        setCurrentStep(STEP_AMOUNT);
        setCurrentWalletStep(STEP_WALLET_CLAIM_REWARDS);
        onClose();
    }

    const updatePool = async () => {
        const delay = (ms: number) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        await delay(3000);
        const response = await userPool.refetch();
        await queryClient.invalidateQueries({ queryKey: [USER_KEY.LIFETIME_CLAIMED, mainToken?.address] });

        queryClient.setQueriesData({
            queryKey: [POOL_KEY.USER_POOLS, mainToken?.address!, COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type).join()]
        }, (updater: IPool[] | undefined) => {
            return updater?.map(pool => {
                return pool.pool === response?.data?.pool
                    ? response.data
                    : pool
            });
        });
    }

    const requestClaimRewardsCollateralPool = async (values?: any) => {
        try {
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);
            await claimRewardsCollateralPool.mutateAsync({
                userAddress: mainToken?.address!,
                poolAddress: collateralPool?.pool!,
                feeShare: parseUnits(values?.amount || formValues.amount, collateralPool?.vaultType!.toLowerCase().includes('xrp') ? 6 : 8).toString(),
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
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    }

    const onNextStepClick = async() => {
        setErrorMessage(undefined);
        const form = formRef.current?.form();
        const status = form?.validate();

        const nativeBalance = nativeBalances?.data?.find(nativeBalance => 'wrapped' in nativeBalance);
        if (nativeBalance && toNumber(nativeBalance.balance) < MIN_DEPOSIT) {
            setErrorMessage(t('claim_rewards_from_pool_modal.error_not_enough_balance', { tokenName: nativeBalance.symbol }));
            return;
        }
        if (status?.hasErrors || !form) return;

        const values = form.getValues();
        setFormValues(values);
        setCurrentStep(STEP_CONFIRM);

        if (mainToken?.connectedWallet === WALLET.LEDGER) return;

        await requestClaimRewardsCollateralPool(values);
    }

    const openFinishedModal = () => {
        modals.open({
            modalId: FINISHED_MODAL,
            zIndex: 3000,
            size: 500,
            title: t('claim_rewards_from_pool_modal.title'),
            children: (
                <div className="px-0 sm:px-7">
                    <Title
                        className="text-24"
                        fw={300}
                    >
                        {t('claim_rewards_from_pool_modal.finished_modal.title')}
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
                        >
                            {t('claim_rewards_from_pool_modal.finished_modal.description_label')}
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
                        {t('claim_rewards_from_pool_modal.finished_modal.confirm_button')}
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
            size="lg"
            title={t('claim_rewards_from_pool_modal.title')}
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
                                {t('claim_rewards_from_pool_modal.want_to_claim_rewards_title')}
                            </Title>
                            {collateralPool &&
                                <ClaimRewardsFromPoolForm
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
                        >
                            {t('claim_rewards_from_pool_modal.confirm_step_title')}
                        </Title>
                        <Text
                            fw={400}
                            className="text-16 my-5"
                        >
                            {t('claim_rewards_from_pool_modal.confirm_step_description')}
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
                                        {t('claim_rewards_from_pool_modal.withdraw_fees_step_label')}
                                    </Text>
                                }
                                description={
                                    <Text
                                        className="text-12"
                                        fw={400}
                                        c={lighten('var(--flr-gray)', 0.378)}
                                    >
                                        {t('claim_rewards_from_pool_modal.withdraw_fees_step_description')}
                                    </Text>
                                }
                                icon={<IconFilePlus style={{ width: rem(18), height: rem(18) }} />}
                                completedIcon={
                                    <IconCheck
                                        style={{ width: rem(18), height: rem(18) }}
                                        color="var(--mantine-color-black)"
                                    />
                                }
                                loading={currentWalletStep === STEP_WALLET_CLAIM_REWARDS}
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
                            onClick={() => requestClaimRewardsCollateralPool()}
                            isLoading={isLoading}
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
                        className="hover:text-white"
                    >
                        {t('claim_rewards_from_pool_modal.next_button')}
                    </Button>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    )
}
