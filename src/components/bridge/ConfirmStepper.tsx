import {
    Button,
    Divider,
    lighten,
    Loader,
    rem,
    Stepper,
    Text,
    Title
} from "@mantine/core";
import { ICoin } from "@/types";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck, IconCircleCheck, IconFilePlus, IconSettings } from "@tabler/icons-react";
import { useInterval, useMediaQuery, useMounted } from "@mantine/hooks";
import { CONTRACT_KEY, useBridgeApprove, useBridgeSend } from "@/hooks/useContracts";
import { parseUnits } from "@/utils";
import { isError } from "ethers";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";
import { useMessage } from "@/api/bridge";
import { modals } from "@mantine/modals";
import { useWeb3 } from "@/hooks/useWeb3";
import { BRIDGE_TYPE, LAYER_ZERO_STATUS, WALLET } from "@/constants";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import { useQueryClient } from "@tanstack/react-query";

interface IConfirmStepper {
    token: ICoin;
    formValues: Record<string, any>;
    onError: (error: string) => void;
    onClose: (status: boolean) => void;
    bridgeType: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE];
}

const CHECK_STATUS_INTERVAL = 10000;
const FINISHED_MODAL = 'finished_modal;'
const WAITING_MODAL = 'waiting_modal';

const STEP_APPROVE = 0;
const STEP_BRIDGE = 1;

export default function ConfirmStepper({ token, formValues, onError, onClose, bridgeType }: IConfirmStepper) {
    const { t } = useTranslation();
    const isMounted = useMounted();
    const { mainToken, bridgeToken } = useWeb3();
    const queryClient = useQueryClient();
    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');

    const bridgeApprove = useBridgeApprove();
    const bridgeSend = useBridgeSend();

    const [txHash, setTxHash] = useState<string>();
    const getMessage = useMessage(txHash ?? '', false);

    const [currentStep, setCurrentStep] = useState<number>(bridgeType !== BRIDGE_TYPE.FLARE ? STEP_APPROVE : STEP_BRIDGE);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);

    const checkStatusInterval = useInterval(async () => {
        const response = await getMessage.refetch();
        if (response.isSuccess) {
            const data = response.data?.[0];
            if (data?.status?.name === LAYER_ZERO_STATUS.DELIVERED) {
                modals.close(WAITING_MODAL);
                openFinishedModal();
                checkStatusInterval.stop();
                setIsLedgerButtonDisabled(false);
                queryClient.invalidateQueries({
                    queryKey: [CONTRACT_KEY.HYPER_EVM_BALANCE, mainToken?.address],
                    exact: true,
                    refetchType: 'all'
                });
                queryClient.resetQueries({
                    queryKey: [CONTRACT_KEY.HYPE_BALANCE, mainToken?.address],
                    exact: true,
                });
            } else if ([LAYER_ZERO_STATUS.FAILED, LAYER_ZERO_STATUS.BLOCKED, LAYER_ZERO_STATUS.PAYLOAD_STORED].includes(data?.status?.name)) {
                onError(data?.status?.message);
                checkStatusInterval.stop();
                setIsLedgerButtonDisabled(false);
            }
        }
    }, CHECK_STATUS_INTERVAL);

    useEffect(() => {
        if (!isMounted || mainToken?.connectedWallet === WALLET.LEDGER) return;

        if (bridgeType !== BRIDGE_TYPE.FLARE) {
            approve();
        } else {
            send();
        }

    }, [isMounted]);

    useEffect(() => {
        if (!txHash) return;
        checkStatusInterval.start();
        onClose(true);
        openWaitingModal();
    }, [txHash]);

    const approve = async () => {
        try {
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);
            await bridgeApprove.mutateAsync(parseUnits(formValues.amount, 6).toString());
            setCurrentStep(STEP_BRIDGE);

            if (mainToken?.connectedWallet !== WALLET.LEDGER) {
                await send();
            }
        } catch (error: any) {
            if (isError(error, 'ACTION_REJECTED')) {
                onError(t('notifications.request_rejected_by_user_label'));
            } else if (error.cause === 'ledger') {
                showErrorNotification(error.message);
            } else {
                const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
                const decodedError = await errorDecoder.decode(error);
                onError(decodedError.reason as string);
            }
        } finally {
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    }

    const send = async () => {
        try {
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);

            const hash = await bridgeSend.mutateAsync({
                amount: parseUnits(formValues.amount, 6).toString(),
                fee: formValues.fee,
                bridgeType: formValues.type
            });
            setTxHash(hash);
        } catch (error: any) {
            if (isError(error, 'ACTION_REJECTED')) {
                onError(t('notifications.request_rejected_by_user_label'));
            } else if (error.cause === 'ledger') {
                showErrorNotification(error.message);
            } else {
                const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
                const decodedError = await errorDecoder.decode(error);
                onError(decodedError.reason as string);
            }
        } finally {
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    }

    const openWaitingModal = () => {
        modals.open({
            modalId: WAITING_MODAL,
            title: t(`bridge_modal.${bridgeType !== BRIDGE_TYPE.FLARE ? 'hyperliquid' : 'flare'}_title`, { fAsset: token?.type }),
            closeOnClickOutside: false,
            closeOnEscape: false,
            centered: true,
            fullScreen: mediaQueryMatches,
            size: 600,
            children: (
                <div className="px-0 sm:px-7">
                    <Title
                        order={4}
                        fw={300}
                    >
                        {t('bridge_modal.waiting_modal.title')}
                    </Title>
                    <div className="flex items-center mt-5 pb-5">
                        <Loader className="mr-3" />
                        <Text
                            size="sm"
                            className="whitespace-pre-line"
                        >
                            {t('bridge_modal.waiting_modal.description_label')}
                        </Text>
                    </div>
                </div>
            ),
            onClose: () => {
                setTimeout(() => {
                    checkStatusInterval.stop();
                    onClose(false);
                }, 300);
            }
        })
    }

    const openFinishedModal = () => {
        modals.open({
            modalId: FINISHED_MODAL,
            zIndex: 3000,
            size: 600,
            fullScreen: mediaQueryMatches,
            title: t(`bridge_modal.${bridgeType !== BRIDGE_TYPE.FLARE ? 'hyperliquid' : 'flare'}_title`, { fAsset: token?.type }),
            children: (
                <div className="px-0 sm:px-7">
                    <Title
                        className="text-24"
                        fw={300}
                    >
                        {t('bridge_modal.finished_modal.title')}
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
                            {t(`bridge_modal.finished_modal.description_${bridgeType !== BRIDGE_TYPE.FLARE ? 'hyperliquid' : 'flare'}_label`, {
                                fAsset: token?.type,
                                bridgeType: formValues?.type === BRIDGE_TYPE.HYPER_CORE ? 'Hyperliquid' : 'HyperEVM'
                            })}
                        </Text>
                    </div>
                    <Divider
                        className="my-8"
                        classNames={{
                            root: 'mx-[-1rem] sm:mx-[-2.7rem]'
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
                        {t('bridge_modal.finished_modal.confirm_button')}
                    </Button>
                </div>
            ),
            centered: true,
            onClose: () => {
                modals.closeAll();
                setTimeout(() => {
                    onClose(false);
                }, 300);
            }
        });
    }

    return (
        <div>
            <Title
                className="text-24"
                fw={300}
                c="var(--flr-black)"
            >
                {t('bridge_modal.confirm_step_title')}
            </Title>
            <Text
                className="my-5 text-16"
                fw={400}
                c="var(--flr-black)"
            >
                {bridgeType !== BRIDGE_TYPE.FLARE
                    ? t('mint_modal.confirm_step_description')
                    : t('bridge_modal.confirm_step_description')
                }
            </Text>
            <Stepper
                active={currentStep}
                iconSize={32}
                size="sm"
                orientation="vertical"
                classNames={{
                    stepDescription: 'max-w-[300px]'
                }}
            >
                {bridgeType !== BRIDGE_TYPE.FLARE &&
                    <Stepper.Step
                        label={
                            <Text
                                className="text-14"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                {t('bridge_modal.approve_step_label')}
                            </Text>
                        }
                        description={
                            <Text
                                className="text-12"
                                fw={400}
                                c={lighten('var(--flr-gray)', 0.378)}
                            >
                                {t('bridge_modal.approve_step_description')}
                            </Text>
                        }
                        icon={
                            <IconFilePlus size={16} />
                        }
                        completedIcon={
                            <IconCheck
                                size={16}
                                color="var(--flr-black)"
                            />
                        }
                        loading={currentStep === STEP_APPROVE}
                        step={STEP_APPROVE}
                    />
                }
                <Stepper.Step
                    label={
                        <Text
                            className="text-14"
                            fw={500}
                            c={currentStep === STEP_APPROVE ? 'var(--flr-light-gray)' : 'var(--flr-black)'}
                        >
                            {t(`bridge_modal.bridge_${bridgeType !== BRIDGE_TYPE.FLARE ? 'hyperliquid' : 'flare'}_step_label`, {
                                fAsset: token?.type
                            })}
                        </Text>
                    }
                    description={
                        <Text
                            className="text-12"
                            fw={400}
                            c={currentStep === STEP_APPROVE ? 'var(--flr-light-gray)' : lighten('var(--flr-gray)', 0.378)}
                        >
                            {t(`bridge_modal.bridge_${bridgeType !== BRIDGE_TYPE.FLARE ? 'hyperliquid' : 'flare'}_step_description`, { fAsset: token?.type })}
                        </Text>
                    }
                    icon={
                        <IconSettings
                            size={16}
                            color={currentStep === STEP_APPROVE ? 'var(--flr-light-gray)' : undefined}
                        />
                    }
                    completedIcon={
                        <IconCheck
                            size={16}
                            color="var(--flr-black)"
                        />
                    }
                    loading={currentStep === STEP_BRIDGE}
                    step={STEP_BRIDGE}
                />
            </Stepper>
            {mainToken?.connectedWallet === WALLET.WALLET_CONNECT &&
                <>
                    <Divider
                        className="my-8"
                        classNames={{
                            root: 'mx-[-1rem] sm:mx-[-2.7rem]'
                        }}
                    />
                    <WalletConnectOpenWalletCard />
                </>
            }
            {mainToken?.connectedWallet === WALLET.LEDGER &&
                <>
                    <Divider
                        className="my-8"
                        classNames={{
                            root: 'mx-[-1rem] sm:mx-[-2.7rem]'
                        }}
                    />
                    <LedgerConfirmTransactionCard
                        appName={bridgeType !== BRIDGE_TYPE.FLARE
                            ? mainToken?.network?.ledgerApp!
                            : bridgeToken?.network?.ledgerApp!
                        }
                        onClick={currentStep === STEP_APPROVE ? approve : send}
                        isLoading={isLoading}
                        isDisabled={isLedgerButtonDisabled}
                    />
                </>
            }
        </div>
    );
}