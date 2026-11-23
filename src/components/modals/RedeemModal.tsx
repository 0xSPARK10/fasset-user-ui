import {
    Stepper,
    Title,
    Text,
    rem,
    Divider, lighten
} from "@mantine/core";
import {
    IconFilePlus,
    IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef, useCallback } from "react";
import RedeemForm, { FormRef } from "@/components/forms/RedeemForm";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import FAssetModal from "@/components/modals/FAssetModal";
import { useUnderlyingBalance } from "@/api/balance";
import { IFAssetCoin } from "@/types";
import { WALLET } from "@/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import FormAlert, { IAlertMessage } from "@/components/elements/FormAlert";
import { STEP_WALLET_REDEMPTION, useRedeemRequest } from "@/components/redeem/useRedeemRequest";
import FAssetButton from "@/components/elements/FAssetButton";

interface IRedeemModal {
    opened: boolean;
    onClose: (fetchProgress: boolean) => void;
    fAssetCoin: IFAssetCoin | undefined;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;


export default function RedeemModal({ opened, onClose, fAssetCoin }: IRedeemModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const formRef = useRef<FormRef>(null);
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [coreVaultErrorMessage, setCoreVaultErrorMessage] = useState<string>('');
    const [formValues, setFormValues] = useState<any>();
    const [destinationTag, setDestinationTag] = useState<string>('');
    const [xrplDestAddress, setXrplDestAddress] = useState<string>(fAssetCoin?.address ?? '');
    const [formAlert, setFormAlert] = useState<IAlertMessage | undefined>();
    const [hasValidAmount, setHasValidAmount] = useState<boolean>(false);

    const { mainToken, getConnectedCoin } = useWeb3();
    const connectedCoin = fAssetCoin ? getConnectedCoin(fAssetCoin.type) : undefined;
    const redeemRequest = useRedeemRequest({
        fAssetCoin,
        opened,
        onError: (message) => {
            setCurrentStep(STEP_AMOUNT);
            setErrorMessage(message);
        },
        onClose: (fetchProgress) => onCloseModal(fetchProgress),
    });
    const { currentWalletStep, isLedgerButtonDisabled } = redeemRequest;
    const underlyingBalance = useUnderlyingBalance(
        xrplDestAddress,
        fAssetCoin?.type ?? '',
        opened && xrplDestAddress.length > 0,
        connectedCoin && connectedCoin.connectedWallet === WALLET.LEDGER
    );

    const isDepositAuthBlocking = !!underlyingBalance.data?.accountInfo?.depositAuth;
    const isRequireDestTagBlocking = !!underlyingBalance.data?.accountInfo?.requireDestTag && String(destinationTag ?? '').trim() === '';
    const hasInsufficientBalance = formAlert?.type === 'info';
    const isNextButtonDisabled = !hasValidAmount || coreVaultErrorMessage.length > 0 || isDepositAuthBlocking || isRequireDestTagBlocking || hasInsufficientBalance;

    const onNextStepClick = useCallback(async () => {
        setErrorMessage(undefined);
        const form = formRef.current?.form();
        const status = form?.validate();
        if (status?.hasErrors || !form) return;

        setCurrentStep(STEP_CONFIRM);
        const values = form.getValues();
        setFormValues(values);
        if (mainToken?.connectedWallet === WALLET.LEDGER) return;

        await redeemRequest.requestRedeem(values);
    }, [formRef, redeemRequest, fAssetCoin]);

    const onCloseModal = (fetchProgress: boolean) => {
        redeemRequest.reset();
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);
        setFormAlert(undefined);
        setHasValidAmount(false);
        setDestinationTag('');
        setXrplDestAddress(fAssetCoin?.address ?? '');
        onClose(fetchProgress);
    }

    useEffect(() => {
        if (opened && fAssetCoin?.address) {
            setXrplDestAddress(fAssetCoin.address);
        }
    }, [opened, fAssetCoin?.address]);

    return (
        <>
            <FAssetModal
                opened={opened && !redeemRequest.isPostTxModalActive}
                onClose={() => {
                    onCloseModal(false);
                }}
                closeOnEscape={currentStep === STEP_AMOUNT}
                size="lg"
                centered
                title={t('redeem_modal.title', { coinName: fAssetCoin?.type })}
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
                                <FormAlert message={coreVaultErrorMessage || undefined} type="warning" />
                                <FormAlert
                                    message={isDepositAuthBlocking
                                        ? t('redeem_modal.limited_deposit_auth_settings_label')
                                        : undefined
                                    }
                                    type="error"
                                />
                                <FormAlert
                                    message={isRequireDestTagBlocking
                                        ? t('redeem_modal.limited_destination_tags_settings_label')
                                        : undefined
                                    }
                                    type="error"
                                />
                                <FormAlert message={formAlert?.msg} type={formAlert?.type} />
                                <FormAlert message={errorMessage} type="error" />
                                <Text
                                    className="text-24"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {t('redeem_modal.amount_step_title')}
                                </Text>
                                {opened && fAssetCoin &&
                                    <RedeemForm
                                        ref={formRef}
                                        fAssetCoin={fAssetCoin}
                                        setErrorMessage={(message: string) => {
                                            setCoreVaultErrorMessage(message);
                                        }}
                                        onDestinationAddressChange={(address) => setXrplDestAddress(address)}
                                        onDestinationTagChange={(tag) => setDestinationTag(tag)}
                                        onFormAlert={(alert) => setFormAlert(alert)}
                                        isFormDisabled={(status) => setHasValidAmount(!status)}
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
                                {t('redeem_modal.confirm_step_title')}
                            </Title>
                            <Text
                                className="text-16 my-5"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {t('redeem_modal.confirm_step_description')}
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
                                            {t('redeem_modal.payment_redemption_step_label')}
                                        </Text>
                                    }
                                    description={
                                        <Text
                                            className="text-12"
                                            fw={400}
                                            c={lighten('var(--flr-gray)', 0.378)}
                                        >
                                            {t('redeem_modal.payment_redemption_step_description')}
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
                                onClick={() => redeemRequest.requestRedeem(formValues)}
                                isLoading={redeemRequest.isRedeemPending}
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
                {currentStep == STEP_AMOUNT &&
                    <FAssetModal.Footer>
                        <FAssetButton
                            onClick={onNextStepClick}
                            fullWidth
                            disabled={isNextButtonDisabled}
                            className="hover:text-white"
                        >
                            {t('redeem_modal.next_button')}
                        </FAssetButton>
                    </FAssetModal.Footer>
                }
            </FAssetModal>
            {redeemRequest.finishedModal}
        </>
    );
}
