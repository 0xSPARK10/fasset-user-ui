import { IRedeemerBalance } from "@/api/oft";
import FAssetModal from "@/components/modals/FAssetModal";
import { useTranslation } from "react-i18next";
import {
    Divider,
    lighten,
    rem,
    Stepper,
    Text,
    Title
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTransferFrom } from "@/hooks/useContracts";
import { isError } from "ethers";
import { showErrorNotification } from "@/hooks/useNotifications";
import { IconCheck, IconCircleCheck, IconSettings } from "@tabler/icons-react";
import { WALLET } from "@/constants";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import { toNumber } from "@/utils";
import { COINS } from "@/config/coin";
import { BALANCE_KEY } from "@/api/balance";
import { useQueryClient } from "@tanstack/react-query";
import { OFT_KEY } from "@/api/oft";
import ModalDivider from "@/components/elements/ModalDivider";
import FXrpFlareIcon from "@/components/icons/FXrpFlareIcon";
import FAssetButton from "@/components/elements/FAssetButton";

interface IRedeemerWithdrawModal {
    opened: boolean;
    onClose: () => void;
    token: IRedeemerBalance | undefined;
    redeemerAddress: string;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;
const STEP_FINISHED = 2;

// Asset Recovery "Transfer" on the bridge page: the whole balance left on the redeemer (bridge)
// account goes back to the connected wallet — no amount input, review → confirm → finished.
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

    useEffect(() => {
        if (!opened) return;
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);
    }, [opened]);

    const closeModal = () => {
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);
        onClose();
    };

    const onNextStepClick = () => {
        setErrorMessage(undefined);
        if (maxAmount <= 0) return;

        setCurrentStep(STEP_CONFIRM);

        if (mainToken?.connectedWallet !== WALLET.LEDGER) {
            executeTransfer();
        }
    };

    const executeTransfer = async () => {
        if (!token || !mainToken?.address || BigInt(token.exact || "0") === BigInt(0)) return;

        try {
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);

            // `exact` = the on-chain balance in base units; `balance` is rounded for display
            await transferFrom.mutateAsync({
                tokenAddress: token.address,
                from: redeemerAddress,
                to: mainToken.address,
                amount: token.exact
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
            title={t('redeemer_withdraw_modal.title', { symbol: token?.symbol })}
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
                            {/* 40px above and below each section (Figma): header margin 32 + pt-2 above,
                                pb-2 + divider margin 32 below */}
                            <div className="pt-2 pb-2">
                                <Text c="var(--flr-gray)" fw={400} className="text-12 uppercase">
                                    {t('redeemer_withdraw_modal.form.amount_label')}
                                </Text>
                                <div className="flex items-center gap-2">
                                    <Text className="text-32" fw={300} c="var(--flr-black)">
                                        {token?.balance}
                                    </Text>
                                    {/* The FAsset sits on Flare here — the icon with the Flare badge, as in the notice */}
                                    {coin?.isFAssetCoin
                                        ? <FXrpFlareIcon width="24" height="24" className="flex-shrink-0" />
                                        : coin?.icon?.({ width: "24", height: "24" })
                                    }
                                    <Text className="text-16" c="var(--flr-gray)">
                                        {token?.symbol}
                                    </Text>
                                </div>
                            </div>

                        <ModalDivider />
                        
                        {/* Divider margin 32 + pt-2 above; below, the body's pb-5 + the footer divider's
                            32 make 52, so -mb-3 takes it back to 40 */}
                        <div className="flex flex-col pt-2 -mb-3">
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
                                {t('bridge_modal.confirm_step_title')}
                            </Title>
                            <Stepper
                                className="mt-5"
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
                                            {t('redeemer_withdraw_modal.confirm.transfer_step_label', { symbol: token?.symbol })}
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
                                className="mt-8 mb-10"
                                classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
                            />
                            <FAssetButton
                                onClick={closeModal}
                                fullWidth
                                className="hover:text-white mb-1"
                            >
                                {t('redeemer_withdraw_modal.finished.confirm_button')}
                            </FAssetButton>
                        </Stepper.Step>
                    </Stepper>
                }
            </FAssetModal.Body>
            {currentStep === STEP_AMOUNT &&
                <FAssetModal.Footer>
                    <FAssetButton
                        onClick={onNextStepClick}
                        fullWidth
                        disabled={maxAmount <= 0}
                        className="hover:text-white"
                    >
                        {t('redeemer_withdraw_modal.form.next_button')}
                    </FAssetButton>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    );
}
