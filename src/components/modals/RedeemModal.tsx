import {
    Stepper,
    Title,
    Button,
    Text,
    rem,
    Loader,
    Paper,
    Anchor,
    Divider, lighten
} from "@mantine/core";
import {
    IconFilePlus,
    IconCheck,
    IconArrowUpRight,
    IconExclamationCircle
} from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRedemptionStatus, useRedemptionDefaultStatus, useRequestRedemptionDefault } from "@/api/redemption";
import { useAssetManagerAddress } from "@/api/user";
import { useRedeem } from "@/hooks/useContracts";
import { modals } from "@mantine/modals";
import { isError } from "ethers";
import RedeemForm, { FormRef } from "@/components/forms/RedeemForm";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { useInterval } from "@mantine/hooks";
import FAssetModal from "@/components/modals/FAssetModal";
import RedeemFinishedModal from "@/components/modals/RedeemFinishedModal";
import { useNativeBalance } from "@/api/balance";
import { ErrorDecoder } from "ethers-decode-error";
import { AssetManagerAbi } from "@/abi";
import { ICoin, IFAssetCoin } from "@/types";
import { BTC_NAMESPACE } from "@/config/networks";
import { fromLots, toNumber, toLots } from "@/utils";
import { WALLET } from "@/constants";
import { showErrorNotification } from "@/hooks/useNotifications";

interface IRedeemModal {
    opened: boolean;
    onClose: (fetchProgress: boolean) => void;
    fAssetCoin: IFAssetCoin;
    flareCoin: ICoin;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

const STEP_WALLET_REDEMPTION = 0;
const STEP_WALLET_COMPLETED = 1;

const REDEMPTION_DEFAULT_FETCH_INTERVAL = 15000;
const REDEMPTION_STATUS_FETCH_INTERVAL = 15000;

const WAITING_MODAL = 'waiting_modal';
const UNRESPONSIVE_AGENT_MODAL = 'unresponsive_agent_modal';

export default function RedeemModal({ opened, onClose, fAssetCoin, flareCoin }: IRedeemModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [currentWalletStep, setCurrentWalletStep] = useState<number>(STEP_WALLET_REDEMPTION);
    const [isWaitingModalActive, setIsWaitingModalActive] = useState<boolean>(false);
    const [isFinishedModalActive, setIsFinishedModalActive] = useState<boolean>(false);
    const [isUnresponsiveAgentModalActive, setIsUnresponsiveAgentModalActive] = useState<boolean>(false);
    const [redeemLots, setRedeemLots] = useState<number>();
    const [txHash, setTxHash] = useState<string>();
    const formRef = useRef<FormRef>(null);
    const closeModal = useRef<boolean>(true);
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [formValues, setFormValues] = useState<any>();
    const [redeemedLots, setRedeemedLots] = useState<number>();
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);

    const assetManagerAddress = useAssetManagerAddress(fAssetCoin.type, opened);
    const redeem = useRedeem();
    const nativeBalance = useNativeBalance(flareCoin.address!);
    const requestRedemptionDefault = useRequestRedemptionDefault();
    const redemptionStatus = useRedemptionStatus(fAssetCoin.type, txHash!, false);
    const redemptionDefaultStatus = useRedemptionDefaultStatus(txHash!, false);

    const redemptionStatusFetchInterval = useInterval(async () => {
        const response = await redemptionStatus.refetch();
        if (response?.data?.status === 'SUCCESS') {
            closeModal.current = false;
            modals.close(WAITING_MODAL);
            const redeemedLots = response?.data?.incomplete
                ? redeemLots! - toNumber(response?.data?.incompleteData?.remainingLots!)
                : redeemLots!;

            setRedeemedLots(redeemedLots);
            setIsFinishedModalActive(true);
        } else if (response?.data?.status === 'DEFAULT') {
            closeModal.current = false;
            modals.close(WAITING_MODAL);
            const redeemedLots = response?.data?.incomplete
                ? redeemLots! - toNumber(response?.data?.incompleteData?.remainingLots!)
                : redeemLots!;

            setRedeemedLots(redeemedLots);
            setTimeout(() => {
                openUnresponsiveAgentModal();
            }, 300);
        }
    }, REDEMPTION_STATUS_FETCH_INTERVAL);
    const redemptionDefaultStatusFetchInterval = useInterval(async () => {
        const response = await redemptionDefaultStatus.refetch();
        if (response?.data?.status) {
            redemptionDefaultStatusFetchInterval.stop();
            closeModal.current = false;
            modals.close(UNRESPONSIVE_AGENT_MODAL);
            setIsFinishedModalActive(true);
        }
    }, REDEMPTION_DEFAULT_FETCH_INTERVAL);

    useEffect(() => {
        if (!nativeBalance.data) return;
        const balance = nativeBalance.data.find(balance => balance.symbol.toLowerCase() === fAssetCoin.type.toLowerCase());

        if (balance) {
            const max = toLots(toNumber(balance.balance), fAssetCoin.lotSize) as number;
            setIsNextButtonDisabled(max === 0);
        }

    }, [nativeBalance]);

    const requestRedeem = async (values?: any) => {
        try {
            setIsLedgerButtonDisabled(true);
            const lots = values?.lots || formValues.lots;
            setRedeemLots(lots);

            const response = await redeem.mutateAsync({
                assetManagerAddress: assetManagerAddress?.data?.address!,
                userAddress: flareCoin.address!,
                lots: lots,
                userUnderlyingAddress: fAssetCoin.address!,
                executorAddress: values?.executorAddress || formValues.executorAddress,
                executorFee: values?.executorFee || formValues.executorFee
            });

            const redeemResponse = await requestRedemptionDefault.mutateAsync({
                txHash: response.hash,
                fAsset: fAssetCoin.type,
                amount: (lots) * fAssetCoin.lotSize,
                userAddress: flareCoin.address!
            });

            const redeemedLots = redeemResponse.incomplete
                ? lots - toNumber(redeemResponse?.remainingLots!)
                : lots;

            setCurrentWalletStep(STEP_WALLET_COMPLETED);
            openWaitingModal(redeemedLots, lots, redeemResponse.incomplete);
            setTxHash(response.hash);
        } catch (error: any) {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            setCurrentStep(STEP_AMOUNT);
            if (isError(error, 'ACTION_REJECTED')) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else {
                const errorDecoder = ErrorDecoder.create([AssetManagerAbi]);
                const decodedError = await errorDecoder.decode(error);
                setErrorMessage(error?.error?.message || decodedError.reason as string);
            }
            modals.closeAll();
        } finally {
            setIsLedgerButtonDisabled(false);
        }
    }

    const onNextStepClick = useCallback(async () => {
        setErrorMessage(undefined);
        const form = formRef.current?.form();
        const status = form?.validate();
        if (status?.hasErrors || !form) return;

        setCurrentStep(STEP_CONFIRM);
        const values = form.getValues();
        setFormValues(values);
        if (flareCoin.connectedWallet === WALLET.LEDGER) return;

        await requestRedeem(values);
    }, [formRef, redeem, requestRedemptionDefault, assetManagerAddress, fAssetCoin]);

    const openWaitingModal = useCallback((redeemedLots: number, totalLots: number, isPartial: boolean = false) => {
        setIsWaitingModalActive(true);

        modals.open({
            modalId: WAITING_MODAL,
            title: t('redeem_modal.title', { coinName: fAssetCoin?.type }),
            closeOnClickOutside: false,
            closeOnEscape: false,
            centered: true,
            size: 550,
            children: (
                <div className="px-0 sm:px-7">
                    <Title order={4} fw={300}>
                        {isPartial
                            ? t('redeem_modal.waiting_modal.title_partial_redemption')
                            : t('redeem_modal.waiting_modal.title')
                        }
                    </Title>
                    <div className="flex items-center mt-5">
                        <Loader className="mr-3" />
                        <div>
                            {isPartial &&
                                <Text
                                    size="sm"
                                    className="whitespace-pre-line mb-1"
                                >
                                    {t('redeem_modal.waiting_modal.action_partial_redemption_label', {
                                        redeemedAmount: (fromLots(redeemedLots, fAssetCoin.lotSize, fAssetCoin.decimals, true) as string)?.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1'),
                                        coinName: fAssetCoin?.type!,
                                        totalAmount: (fromLots(totalLots, fAssetCoin.lotSize, fAssetCoin.decimals, true) as string)?.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1')
                                    })}
                                </Text>
                            }
                            <Text
                                size="sm"
                                className="whitespace-pre-line"
                            >
                            {t(fAssetCoin.network.namespace === BTC_NAMESPACE
                                    ? 'redeem_modal.waiting_modal.btc_network_action_label'
                                    : 'redeem_modal.waiting_modal.action_label')
                                }
                            </Text>
                        </div>
                    </div>
                    <Paper
                        radius="md"
                        className="p-6 mt-8 mb-4"
                        styles={{
                            root: {
                                backgroundColor: 'rgba(223, 233, 253, 1)'
                            }
                        }}
                    >
                        <Trans
                            i18nKey={fAssetCoin.network.namespace === BTC_NAMESPACE
                                ? `redeem_modal.waiting_modal.btc_network_description_label`
                                : `redeem_modal.waiting_modal.description_label`
                        }
                            components={{
                                a: <Anchor
                                    underline="always"
                                    href="https://dev.flare.network/fassets/redemption#redemption-payment-failure"
                                    target="_blank"
                                    className="inline-flex"
                                    c="black"
                                    fw={700}
                                />,
                                icon: <IconArrowUpRight
                                    style={{ width: rem(20), height: rem(20) }}
                                    className="ml-1"
                                />
                            }}
                            parent={Text}
                            size="sm"
                        />
                    </Paper>
                </div>
            ),
            onClose: () => {
                if (redemptionStatusFetchInterval.active) {
                    redemptionStatusFetchInterval.stop();
                }

                if (closeModal.current) {
                    setTimeout(() => {
                        onClose(true);
                    }, 300);
                }
            }
        });
    }, [fAssetCoin, isWaitingModalActive]);

    const openUnresponsiveAgentModal = useCallback(() => {
        closeModal.current = true;
        setIsUnresponsiveAgentModalActive(true);
        redemptionStatusFetchInterval.stop();

        modals.open({
            modalId: UNRESPONSIVE_AGENT_MODAL,
            size: 500,
            title: t('redeem_modal.title', { coinName: fAssetCoin?.type }),
            closeOnClickOutside: false,
            closeOnEscape: false,
            centered: true,
            children: (
                <div className="px-0 sm:px-7">
                    <Title order={4} fw={300}>{t('redeem_modal.unresponsive_agent_modal.title')}</Title>
                    <div className="flex items-center mt-5">
                        <IconExclamationCircle
                            className="mr-3"
                            color="var(--mantine-color-black)"
                            style={{ width: rem(40), height: rem(40) }}
                        />
                        <Text
                            size="sm"
                            className="whitespace-pre-line"
                        >
                            {fAssetCoin.network.namespace === BTC_NAMESPACE
                                ? t('redeem_modal.unresponsive_agent_modal.btc_network_description_label', { tokenName: flareCoin?.type })
                                : t('redeem_modal.unresponsive_agent_modal.description_label', { tokenName: flareCoin?.type })
                            }
                        </Text>
                    </div>
                </div>
            ),
            onClose: () => {
                if (closeModal.current) {
                    setTimeout(() => {
                        onClose(true);
                    }, 300);
                }
            }
        });

        redemptionDefaultStatusFetchInterval.start();
    }, [redemptionDefaultStatus, t, redemptionStatusFetchInterval, redemptionDefaultStatusFetchInterval]);

    useEffect(() => {
        if (!txHash) return;
        redemptionStatusFetchInterval.start();
        return redemptionStatusFetchInterval.stop;
    }, [txHash]);

    return (
        <>
            <FAssetModal
                opened={opened && !isWaitingModalActive && !isFinishedModalActive && !isUnresponsiveAgentModalActive}
                onClose={() => { closeModal.current = true; onClose(false) }}
                closeOnEscape={currentStep === STEP_AMOUNT}
                size="lg"
                centered
                title={t('redeem_modal.title', { coinName: fAssetCoin.type })}
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
                                <Text
                                    className="text-24"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {t('redeem_modal.amount_step_title')}
                                </Text>
                                {opened &&
                                    <RedeemForm
                                        ref={formRef}
                                        flareCoin={flareCoin}
                                        fAssetCoin={fAssetCoin}
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
                    {currentStep === STEP_CONFIRM && flareCoin.connectedWallet === WALLET.LEDGER &&
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
                                appName={flareCoin?.network?.ledgerApp!}
                                onClick={() => requestRedeem()}
                                isLoading={redeem.isPending}
                                isDisabled={isLedgerButtonDisabled}
                            />
                        </>
                    }
                    {currentStep === STEP_CONFIRM && flareCoin.connectedWallet === WALLET.WALLET_CONNECT &&
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
                        <Button
                            onClick={onNextStepClick}
                            variant="filled"
                            color="black"
                            radius="xl"
                            size="sm"
                            fullWidth
                        disabled={isNextButtonDisabled}
                            className="hover:text-white"
                        >
                            {t('redeem_modal.next_button')}
                        </Button>
                    </FAssetModal.Footer>
                }
            </FAssetModal>
            <RedeemFinishedModal
                opened={isFinishedModalActive}
                onClose={() => {
                    setIsFinishedModalActive(false);
                    closeModal.current = true;
                    onClose(true);
                }}
                fAssetCoin={fAssetCoin}
                totalLots={redeemLots ?? 0}
                redeemedLots={redeemedLots ?? 0}
                redemptionDefaultResponse={redemptionDefaultStatus.data}
            />
        </>
    );
}
