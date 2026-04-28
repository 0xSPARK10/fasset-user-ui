import { BridgeType, ICoin } from "@/types";
import FAssetModal from "@/components/modals/FAssetModal";
import { useTranslation } from "react-i18next";
import { Button, rem, Stepper, Text } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import BridgeForm from "@/components/forms/BridgeForm";
import BridgeXrplForm from "@/components/forms/BridgeXrplForm";
import { FormRef } from "@/components/forms/BridgeForm";
import ConfirmStepper from "@/components/bridge/ConfirmStepper";
import { IconExclamationCircle } from "@tabler/icons-react";
import { BRIDGE_TYPE } from "@/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { useHyperEVMBalance } from "@/hooks/useContracts";
import { useHyperliquidBalance } from "@/api/bridge";
import { useRedeemerAccount, useUserHistory } from "@/api/oft";
import FormAlert, { IAlertMessage } from "../elements/FormAlert";

interface IBridgeModal {
    opened: boolean;
    onClose: () => void;
    token: ICoin | undefined;
    type: BridgeType;
}

export interface BridgeConfig {
    titleKey: string;
    needsApproval: boolean;
    feeTokenKey: 'native' | 'hype';
    finishedDescriptionKey: string;
    ledgerApp: 'source' | 'bridge';
    showSegmentedControl: boolean;
    type: BridgeType;
}

const BRIDGE_CONFIG: Record<BridgeType, BridgeConfig> = {
    [BRIDGE_TYPE.HYPER_EVM]: {
        titleKey: 'hyperliquid',
        needsApproval: true,
        feeTokenKey: 'native',
        finishedDescriptionKey: 'hyperliquid',
        ledgerApp: 'source',
        showSegmentedControl: true,
        type: BRIDGE_TYPE.HYPER_EVM
    },
    [BRIDGE_TYPE.HYPER_CORE]: {
        titleKey: 'hyperliquid',
        needsApproval: true,
        feeTokenKey: 'native',
        finishedDescriptionKey: 'hyperliquid',
        ledgerApp: 'source',
        showSegmentedControl: true,
        type: BRIDGE_TYPE.HYPER_CORE
    },
    [BRIDGE_TYPE.FLARE]: {
        titleKey: 'flare',
        needsApproval: false,
        feeTokenKey: 'hype',
        finishedDescriptionKey: 'flare',
        ledgerApp: 'bridge',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.FLARE
    },
    [BRIDGE_TYPE.XRPL]: {
        titleKey: 'xrpl',
        needsApproval: false,
        feeTokenKey: 'hype',
        finishedDescriptionKey: 'xrpl',
        ledgerApp: 'bridge',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.XRPL
    },
};

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

export default function BridgeModal({ opened, onClose, token, type }: IBridgeModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const config = BRIDGE_CONFIG[type];
    const nativeBalance = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined);
    const hypeEVMBalance = useHyperEVMBalance();
    const hyperliquidBalance = useHyperliquidBalance(mainToken?.address ?? '', false);
    const oftUserHistory = useUserHistory(mainToken?.address ?? '', false);
    const redeemerAccount = useRedeemerAccount(mainToken?.address ?? '', false);

    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [isBridgeInProgress, setIsBridgeInProgress] = useState<boolean>(false);
    const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [formAlert, setFormAlert] = useState<IAlertMessage | undefined>();
    const [coreVaultErrorMessage, setCoreVaultErrorMessage] = useState<string>("");
    const [xrplDestAddress, setXrplDestAddress] = useState<string>('');
    const [destinationTag, setDestinationTag] = useState<string>('');
    const [showDestTagWarning, setShowDestTagWarning] = useState<boolean>(false);
    const formRef = useRef<FormRef>(null);
    const formValues = useRef<Record<string, any>>();

    const underlyingBalance = useUnderlyingBalance(
        xrplDestAddress,
        token?.type ?? '',
        type === BRIDGE_TYPE.XRPL && xrplDestAddress.length > 0
    );

    const accountError =
        type === BRIDGE_TYPE.XRPL && underlyingBalance.data?.accountInfo?.depositAuth
            ? t('bridge_modal.limited_deposit_auth_settings_label')
            : undefined;

    const destinationTagError =
        type === BRIDGE_TYPE.XRPL && showDestTagWarning
            ? t('bridge_modal.limited_destination_tags_settings_label')
            : undefined;

    useEffect(() => {
        if (String(destinationTag ?? '').trim() !== '') {
            setErrorMessage(undefined);
            setShowDestTagWarning(false);
        }
    }, [destinationTag]);

    const onNextStepClick = useCallback(() => {
        setErrorMessage(undefined);
        setCoreVaultErrorMessage("");
        const form = formRef.current?.form();
        if (!form) return;
        const status = form.validate();

        if (status.hasErrors) {
            const firstError = Object.values(status.errors).find(
                (error) => typeof error === 'string' && error.length > 0,
            ) as string | undefined;

            setErrorMessage(firstError);
            return;
        }

        if (accountError) {
            return;
        }

        if (
            type === BRIDGE_TYPE.XRPL &&
            !!underlyingBalance.data?.accountInfo?.requireDestTag &&
            String(destinationTag ?? '').trim() === ''
        ) {
            setShowDestTagWarning(true);
            return;
        }

        formValues.current = form?.getValues();
        setCurrentStep(STEP_CONFIRM);
    }, [accountError, type, underlyingBalance.data, destinationTag]);

    const closeModal = (refetch: boolean = false) => {
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);
        setCoreVaultErrorMessage("");
        setShowDestTagWarning(false);
        setFormAlert(undefined);

        if (refetch) {
            setTimeout(() => {
                nativeBalance.refetch();
                hypeEVMBalance.refetch();
                hyperliquidBalance.refetch();
                oftUserHistory.refetch();
                redeemerAccount.refetch();
            }, 1000);
        }

        onClose();
    }

    return (
        <FAssetModal
            opened={opened && !isBridgeInProgress}
            onClose={() => closeModal(isBridgeInProgress)}
            centered
            size="lg"
            keepMounted={true}
            title={t(`bridge_modal.${config.titleKey}_title`, { fAsset: token?.type })}
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
                        <Stepper.Step
                            withIcon={false}
                        >
                            {coreVaultErrorMessage &&
                                <div className="flex items-center mb-5 border border-[var(--flr-orange)] p-3 bg-[var(--flr-lightest-orange)]">
                                    <IconExclamationCircle
                                        style={{ width: rem(25), height: rem(25) }}
                                        color="var(--flr-orange)"
                                        className="mr-3 flex-shrink-0"
                                    />
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-black)"
                                    >
                                        {coreVaultErrorMessage}
                                    </Text>
                                </div>
                            }
                            {(accountError || destinationTagError) &&
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
                                        {accountError ?? destinationTagError}
                                    </Text>
                                </div>
                            }
                            <FormAlert message={formAlert?.msg} type={formAlert?.type} />
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
                            {type === BRIDGE_TYPE.XRPL ? (
                                <BridgeXrplForm
                                    onFormAlert={(alert) => setFormAlert(alert)}
                                    ref={formRef}
                                    token={token!}
                                    bridgeConfig={config}
                                    onError={(error) => { setErrorMessage(error); }}
                                    onCoreVaultError={(error) => { setCoreVaultErrorMessage(error); }}
                                    onDestinationAddressChange={setXrplDestAddress}
                                    onDestinationTagChange={setDestinationTag}
                                    isFormDisabled={setIsNextDisabled}
                                />
                            ) : (
                                <BridgeForm
                                    ref={formRef}
                                    token={token!}
                                    type={type}
                                    bridgeConfig={config}
                                    onError={(error) => { setErrorMessage(error); }}
                                    isFormDisabled={setIsNextDisabled}
                                />
                            )}
                        </Stepper.Step>
                        <Stepper.Step
                            withIcon={false}
                        >
                            <ConfirmStepper
                                token={token!}
                                formValues={formValues.current!}
                                onError={(error) => { setErrorMessage(error); setCurrentStep(STEP_AMOUNT) }}
                                onClose={(isInProgress: boolean) => {
                                    setIsBridgeInProgress(isInProgress);

                                    if (!isInProgress) {
                                        closeModal(true);
                                    }
                                }}
                                bridgeConfig={config}
                                key={opened.toString()}
                            />
                        </Stepper.Step>
                    </Stepper>
                }
            </FAssetModal.Body>
            {currentStep == STEP_AMOUNT &&
                <FAssetModal.Footer>
                    <Button
                        onClick={onNextStepClick}
                        variant="filled"
                        color="var(--flr-black)"
                        radius="xl"
                        size="sm"
                        fullWidth
                        disabled={isNextDisabled || errorMessage !== undefined || accountError !== undefined || coreVaultErrorMessage.length > 0}
                        className="hover:text-white"
                    >
                        {t('bridge_modal.next_button')}
                    </Button>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    )
}
