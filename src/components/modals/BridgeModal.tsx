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
import { BRIDGE_COMPOSE_KIND, BRIDGE_SOURCE_CHAIN, BRIDGE_TYPE } from "@/constants";
import { bridgeChainEid } from "@/config/bridge";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { useHyperEVMBalance, useRedeemWithTagSupported } from "@/hooks/useContracts";
import { useAssetManagerAddress } from "@/api/user";
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
    // 'native' = mainToken (FLR/C2FLR/SGB) — the route originates on Flare.
    // 'hype' / 'eth' = gas coin of the remote source chain.
    feeTokenKey: 'native' | 'hype' | 'eth';
    finishedDescriptionKey: string;
    ledgerApp: 'source' | 'bridge';
    showSegmentedControl: boolean;
    type: BridgeType;
    // Display name of the source chain. The 'flare' and 'xrpl' routes share i18n keys
    // between the HyperEVM and Ethereum sources, so the name is interpolated rather
    // than the keys being duplicated.
    sourceName: string;
}

const BRIDGE_CONFIG: Record<BridgeType, BridgeConfig> = {
    [BRIDGE_TYPE.HYPER_EVM]: {
        titleKey: 'hyperliquid',
        needsApproval: true,
        feeTokenKey: 'native',
        finishedDescriptionKey: 'hyperliquid',
        ledgerApp: 'source',
        showSegmentedControl: true,
        type: BRIDGE_TYPE.HYPER_EVM,
        sourceName: 'Flare Network'
    },
    [BRIDGE_TYPE.HYPER_CORE]: {
        titleKey: 'hyperliquid',
        needsApproval: true,
        feeTokenKey: 'native',
        finishedDescriptionKey: 'hyperliquid',
        ledgerApp: 'source',
        showSegmentedControl: true,
        type: BRIDGE_TYPE.HYPER_CORE,
        sourceName: 'Flare Network'
    },
    [BRIDGE_TYPE.FLARE]: {
        titleKey: 'flare',
        needsApproval: false,
        feeTokenKey: 'hype',
        finishedDescriptionKey: 'flare',
        ledgerApp: 'bridge',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.FLARE,
        sourceName: 'Hyperliquid'
    },
    [BRIDGE_TYPE.XRPL]: {
        titleKey: 'xrpl',
        needsApproval: false,
        feeTokenKey: 'hype',
        finishedDescriptionKey: 'xrpl',
        ledgerApp: 'bridge',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.XRPL,
        sourceName: 'Hyperliquid'
    },
    [BRIDGE_TYPE.ETHEREUM]: {
        titleKey: 'ethereum',
        needsApproval: true,
        feeTokenKey: 'native',
        finishedDescriptionKey: 'ethereum',
        ledgerApp: 'source',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.ETHEREUM,
        sourceName: 'Flare Network'
    },
    [BRIDGE_TYPE.FLARE_FROM_ETH]: {
        titleKey: 'flare',
        needsApproval: false,
        feeTokenKey: 'eth',
        finishedDescriptionKey: 'flare',
        ledgerApp: 'bridge',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.FLARE_FROM_ETH,
        sourceName: 'Ethereum'
    },
    [BRIDGE_TYPE.XRPL_FROM_ETH]: {
        titleKey: 'xrpl',
        needsApproval: false,
        feeTokenKey: 'eth',
        finishedDescriptionKey: 'xrpl',
        ledgerApp: 'bridge',
        showSegmentedControl: false,
        type: BRIDGE_TYPE.XRPL_FROM_ETH,
        sourceName: 'Ethereum'
    },
};

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

export default function BridgeModal({ opened, onClose, token, type }: IBridgeModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const config = BRIDGE_CONFIG[type];
    // Covers both XRPL and XRPL_FROM_ETH — each goes through the redeem composer on Flare.
    const isXrplRoute = BRIDGE_COMPOSE_KIND[type] === 'xrpl';
    // The source chain determines the srcEid used to query redemption/executor fees.
    const srcEid = bridgeChainEid(
        BRIDGE_SOURCE_CHAIN[type],
        !!mainToken?.network?.mainnet
    );
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

    const assetManagerAddress = useAssetManagerAddress(token?.type ?? '', isXrplRoute && opened);
    const redeemWithTagSupported = useRedeemWithTagSupported(
        assetManagerAddress?.data?.address ?? '',
        isXrplRoute && opened && !!assetManagerAddress?.data?.address
    );

    const underlyingBalance = useUnderlyingBalance(
        xrplDestAddress,
        token?.type ?? '',
        isXrplRoute && xrplDestAddress.length > 0
    );

    const accountError =
        isXrplRoute && underlyingBalance.data?.accountInfo?.depositAuth
            ? t('bridge_modal.limited_deposit_auth_settings_label')
            : undefined;

    const destinationTagError =
        isXrplRoute && showDestTagWarning
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
            isXrplRoute &&
            !!underlyingBalance.data?.accountInfo?.requireDestTag &&
            String(destinationTag ?? '').trim() === ''
        ) {
            setShowDestTagWarning(true);
            return;
        }

        // A tag was entered but the asset manager does not support tag redemptions. Block
        // while `data` is still undefined too — that covers pending, errors, and older
        // contracts where `redeemWithTagSupported()` reverts. Without this the payment
        // would go out untagged and be lost on an account that requires a tag.
        if (
            isXrplRoute &&
            String(destinationTag ?? '').trim() !== '' &&
            !redeemWithTagSupported.data
        ) {
            setErrorMessage(t('redeem_modal.form.destination_tag_not_supported_error'));
            return;
        }

        formValues.current = form?.getValues();
        setCurrentStep(STEP_CONFIRM);
    }, [accountError, type, isXrplRoute, underlyingBalance.data, destinationTag, redeemWithTagSupported.data, t]);

    const closeModal = (refetch: boolean = false) => {
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
        setTimeout(() => setCurrentStep(STEP_AMOUNT), 300);
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
                            {isXrplRoute ? (
                                <BridgeXrplForm
                                    srcEid={srcEid}
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
