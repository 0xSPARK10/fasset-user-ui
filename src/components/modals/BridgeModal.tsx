import { ICoin } from "@/types";
import FAssetModal from "@/components/modals/FAssetModal";
import { useTranslation } from "react-i18next";
import { Button, rem, Stepper, Text } from "@mantine/core";
import React, { useRef, useState } from "react";
import BridgeForm from "@/components/forms/BridgeForm";
import { FormRef } from "@/components/forms/BridgeForm";
import ConfirmStepper from "@/components/bridge/ConfirmStepper";
import { IconExclamationCircle } from "@tabler/icons-react";
import { BRIDGE_TYPE } from "@/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useHyperEVMBalance } from "@/hooks/useContracts";
import { useHyperliquidBalance } from "@/api/bridge";
import { useUserHistory } from "@/api/oft";

interface IBridgeModal {
    opened: boolean;
    onClose: () => void;
    token: ICoin | undefined;
    type: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE];
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

export default function BridgeModal({ opened, onClose, token, type }: IBridgeModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const nativeBalance = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined);
    const hypeEVMBalance = useHyperEVMBalance();
    const hyperliquidBalance = useHyperliquidBalance(mainToken?.address ?? '', false);
    const oftUserHistory = useUserHistory(mainToken?.address ?? '', false);

    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [isBridgeInProgress, setIsBridgeInProgress] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const formRef = useRef<FormRef>(null);
    const formValues = useRef<Record<string, any>>();

    const onNextStepClick = () => {
        const form = formRef.current?.form();
        const status = form?.validate();
        if (status?.hasErrors || !form) return;

        formValues.current = form?.getValues();
        setCurrentStep(STEP_CONFIRM);
    }

    const closeModal = (refetch: boolean = false) => {
        setCurrentStep(STEP_AMOUNT);
        setErrorMessage(undefined);

        if (refetch) {
            setTimeout(() => {
                nativeBalance.refetch();
                hypeEVMBalance.refetch();
                hyperliquidBalance.refetch();
                oftUserHistory.refetch();
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
            title={t(`bridge_modal.${type !== BRIDGE_TYPE.FLARE ? 'hyperliquid' : 'flare'}_title`, { fAsset: token?.type })}
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
                            <BridgeForm
                                ref={formRef}
                                token={token!}
                                type={type}
                                onError={(error) => { setErrorMessage(error); }}
                            />
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
                                bridgeType={type}
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
                        disabled={errorMessage !== undefined}
                        className="hover:text-white"
                    >
                        {t('bridge_modal.next_button')}
                    </Button>
                </FAssetModal.Footer>
            }
        </FAssetModal>
    )
}