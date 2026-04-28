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
import { useAssetManagerAddress, USER_KEY } from "@/api/user";
import { useRedeem, useRedeemWithTagSupported } from "@/hooks/useContracts";
import { modals } from "@mantine/modals";
import { isError } from "ethers";
import { ethers } from "ethers";
import RedeemForm, { FormRef } from "@/components/forms/RedeemForm";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import FAssetModal from "@/components/modals/FAssetModal";
import RedeemFinishedModal from "@/components/modals/RedeemFinishedModal";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { ErrorDecoder } from "ethers-decode-error";
import { AssetManagerAbi } from "@/abi";
import { IFAssetCoin } from "@/types";
import { BTC_NAMESPACE } from "@/config/networks";
import { formatNumber, toNumber } from "@/utils";
import { devLog } from "@/utils/debug";
import { COOKIE_WINDDOWN, WALLET } from "@/constants";
import { showErrorNotification } from "@/hooks/useNotifications";
import { Cookies } from "react-cookie";
import { useWeb3 } from "@/hooks/useWeb3";
import FormAlert, { IAlertMessage } from "@/components/elements/FormAlert";
import { useQueryClient } from "@tanstack/react-query";

interface IRedeemModal {
    opened: boolean;
    onClose: (fetchProgress: boolean) => void;
    fAssetCoin: IFAssetCoin | undefined;
}

const STEP_AMOUNT = 0;
const STEP_CONFIRM = 1;

const STEP_WALLET_REDEMPTION = 0;
const STEP_WALLET_COMPLETED = 1;

const REDEMPTION_DEFAULT_FETCH_INTERVAL = 15000;
const REDEMPTION_STATUS_FETCH_INTERVAL = 15000;

const WAITING_MODAL = 'waiting_modal';
const UNRESPONSIVE_AGENT_MODAL = 'unresponsive_agent_modal';

export default function RedeemModal({ opened, onClose, fAssetCoin }: IRedeemModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_AMOUNT);
    const [currentWalletStep, setCurrentWalletStep] = useState<number>(STEP_WALLET_REDEMPTION);
    const [isWaitingModalActive, setIsWaitingModalActive] = useState<boolean>(false);
    const [isFinishedModalActive, setIsFinishedModalActive] = useState<boolean>(false);
    const [isUnresponsiveAgentModalActive, setIsUnresponsiveAgentModalActive] = useState<boolean>(false);
    const [requestedAmount, setRequestedAmount] = useState<number>();
    const [txHash, setTxHash] = useState<string>();
    const formRef = useRef<FormRef>(null);
    const closeModal = useRef<boolean>(true);
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [coreVaultErrorMessage, setCoreVaultErrorMessage] = useState<string>('');
    const [formValues, setFormValues] = useState<any>();
    const [redeemedAmount, setRedeemedAmount] = useState<number>();
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);
    const [destinationTag, setDestinationTag] = useState<string>('');
    const [xrplDestAddress, setXrplDestAddress] = useState<string>(fAssetCoin?.address ?? '');
    const [formAlert, setFormAlert] = useState<IAlertMessage | undefined>();
    const [hasValidAmount, setHasValidAmount] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');
    const { connectedCoins, mainToken } = useWeb3();
    const connectedCoin = connectedCoins.find(coin => coin.type == fAssetCoin?.type);
    const cookies = new Cookies();
    const assetManagerAddress = useAssetManagerAddress(fAssetCoin?.type ?? '', fAssetCoin !== undefined && opened);
    const redeemWithTagSupported = useRedeemWithTagSupported(
        assetManagerAddress?.data?.address ?? '',
        opened && !!assetManagerAddress?.data?.address,
    );
    const redeem = useRedeem();
    const nativeBalance = useNativeBalance(mainToken?.address!);
    const requestRedemptionDefault = useRequestRedemptionDefault();
    const redemptionStatus = useRedemptionStatus(fAssetCoin?.type ?? '', txHash!, false);
    const redemptionDefaultStatus = useRedemptionDefaultStatus(txHash!, false);
    const underlyingBalance = useUnderlyingBalance(
        xrplDestAddress,
        fAssetCoin?.type ?? '',
        xrplDestAddress.length > 0,
        connectedCoin && connectedCoin.connectedWallet === WALLET.LEDGER
    );

    const isDepositAuthBlocking = !!underlyingBalance.data?.accountInfo?.depositAuth;
    const isRequireDestTagBlocking = !!underlyingBalance.data?.accountInfo?.requireDestTag && String(destinationTag ?? '').trim() === '';
    const hasInsufficientBalance = formAlert?.type === 'info';
    const isNextButtonDisabled = !hasValidAmount || coreVaultErrorMessage.length > 0 || isDepositAuthBlocking || isRequireDestTagBlocking || hasInsufficientBalance;

    const parseAmountFromUBA = useCallback((amountUBA?: string) => {
        if (!amountUBA || !fAssetCoin) return undefined;
        return Number(
            ethers.formatUnits(amountUBA, fAssetCoin.contractDecimals ?? 6),
        );
    }, [fAssetCoin]);

    const calculateRedeemedAmount = useCallback((
        totalAmount: number,
        incompleteData?: { remainingLots?: string; remainingAmountUBA?: string } | null,
    ) => {
        if (!fAssetCoin || !incompleteData) return totalAmount;

        if (incompleteData.remainingAmountUBA !== undefined) {
            const remainingAmount = parseAmountFromUBA(incompleteData.remainingAmountUBA);
            return remainingAmount !== undefined
                ? Math.max(totalAmount - remainingAmount, 0)
                : totalAmount;
        }

        if (incompleteData.remainingLots !== undefined) {
            return Math.max(
                totalAmount - (toNumber(incompleteData.remainingLots) * fAssetCoin.lotSize),
                0,
            );
        }

        return totalAmount;
    }, [fAssetCoin, parseAmountFromUBA]);

    const redemptionStatusFetchInterval = useInterval(async () => {
        const response = await redemptionStatus.refetch();
        devLog('[REDEEM] redemptionStatus poll:', { txHash, status: response?.data?.status, data: response?.data });
        if (response?.data?.status === 'SUCCESS') {
            closeModal.current = false;
            modals.close(WAITING_MODAL);
            const resolvedRedeemedAmount = calculateRedeemedAmount(
                requestedAmount ?? 0,
                response?.data?.incomplete ? response.data.incompleteData : null,
            );
             queryClient.invalidateQueries({
                queryKey: [USER_KEY.USER_PROGRESS, mainToken?.address, connectedCoin?.address],
                exact: true,
                refetchType: "all"
            })
            setRedeemedAmount(resolvedRedeemedAmount);
            setIsFinishedModalActive(true);
        } else if (response?.data?.status === 'DEFAULT') {
            closeModal.current = false;
            modals.close(WAITING_MODAL);
            const resolvedRedeemedAmount = calculateRedeemedAmount(
                requestedAmount ?? 0,
                response?.data?.incomplete ? response.data.incompleteData : null,
            );

            setRedeemedAmount(resolvedRedeemedAmount);
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

    const requestRedeem = async (values?: any) => {
        try {
            setIsLedgerButtonDisabled(true);
            const amount = values?.amount || formValues.amount;
            const destinationTag =
                String(values?.destinationTag ?? '').trim() ||
                String(formValues?.destinationTag ?? '').trim() ||
                undefined;

            if (destinationTag && !redeemWithTagSupported.data) {
                setErrorMessage(t('redeem_modal.form.destination_tag_not_supported_error'));
                setCurrentStep(STEP_AMOUNT);
                return;
            }

            const amountUBA = ethers.parseUnits(
                String(amount),
                fAssetCoin?.contractDecimals ?? 6,
            ).toString();
            setRequestedAmount(amount);

            devLog('[REDEEM] requestRedeem params:', {
                assetManagerAddress: assetManagerAddress?.data?.address,
                userAddress: mainToken?.address,
                amountUBA,
                destinationAddress: values?.destinationAddress || formValues?.destinationAddress,
                executorAddress: values?.executorAddress || formValues.executorAddress,
                executorFee: values?.executorFee || formValues.executorFee,
                destinationTag,
            });

            const response = await redeem.mutateAsync({
                assetManagerAddress: assetManagerAddress?.data?.address!,
                userAddress: mainToken?.address!,
                amountUBA,
                userUnderlyingAddress: values?.destinationAddress || formValues?.destinationAddress,
                executorAddress: values?.executorAddress || formValues.executorAddress,
                executorFee: values?.executorFee || formValues.executorFee,
                destinationTag,
            });

            devLog('[REDEEM] redeem tx hash:', response.hash);

            const redeemResponse = await requestRedemptionDefault.mutateAsync({
                txHash: response.hash,
                fAsset: fAssetCoin?.type!,
                amount: amountUBA,
                userAddress: mainToken?.address!
            });

            devLog('[REDEEM] redemptionDefault response:', redeemResponse);

            const resolvedRedeemedAmount = redeemResponse.incomplete
                ? calculateRedeemedAmount(amount, {
                    remainingLots: redeemResponse.remainingLots,
                    remainingAmountUBA: redeemResponse.remainingAmountUBA,
                })
                : amount;

            setCurrentWalletStep(STEP_WALLET_COMPLETED);
            openWaitingModal(resolvedRedeemedAmount, amount, redeemResponse.incomplete);
            setTxHash(response.hash);

            const balanceResponse = await nativeBalance.refetch();
            const balance = balanceResponse.data?.find(balance => balance.symbol.toLowerCase() === fAssetCoin?.type?.toLowerCase());
            const cookieFassets = cookies.get(COOKIE_WINDDOWN) ? Object.keys(cookies.get(COOKIE_WINDDOWN)).map(key => key) : [];

            if (balance?.balance && toNumber(balance.balance) > 0 && cookieFassets.includes(fAssetCoin?.type!)) {
                const setCookies = cookies.get(COOKIE_WINDDOWN);
                delete setCookies[fAssetCoin?.type!];

                cookies.set(COOKIE_WINDDOWN, setCookies, {
                    maxAge: 24 * 60 * 60 * 365
                });
            }
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
        if (mainToken?.connectedWallet === WALLET.LEDGER) return;

        await requestRedeem(values);
    }, [formRef, redeem, requestRedemptionDefault, assetManagerAddress, fAssetCoin, calculateRedeemedAmount]);

    const openWaitingModal = useCallback((redeemedAmount: number, totalAmount: number, isPartial: boolean = false) => {
        setIsWaitingModalActive(true);

        modals.open({
            modalId: WAITING_MODAL,
            title: t('redeem_modal.title', { coinName: fAssetCoin?.type }),
            closeOnClickOutside: false,
            closeOnEscape: false,
            centered: true,
            fullScreen: mediaQueryMatches,
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
                                        redeemedAmount: formatNumber(redeemedAmount, fAssetCoin?.decimals!),
                                        coinName: fAssetCoin?.type!,
                                        totalAmount: formatNumber(totalAmount, fAssetCoin?.decimals!)
                                    })}
                                </Text>
                            }
                            <Text
                                size="sm"
                                className="whitespace-pre-line"
                            >
                                {t(fAssetCoin?.network?.namespace === BTC_NAMESPACE
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
                            i18nKey={fAssetCoin?.network?.namespace === BTC_NAMESPACE
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
                if (closeModal.current) {
                    setTimeout(() => {
                        onCloseModal(true);
                    }, 300);
                }
            }
        });
    }, [fAssetCoin, isWaitingModalActive, mediaQueryMatches]);

    const openUnresponsiveAgentModal = useCallback(() => {
        closeModal.current = true;
        setIsUnresponsiveAgentModalActive(true);
        redemptionStatusFetchInterval.stop();

        modals.open({
            modalId: UNRESPONSIVE_AGENT_MODAL,
            size: 500,
            fullScreen: mediaQueryMatches,
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
                            {fAssetCoin?.network?.namespace === BTC_NAMESPACE
                                ? t('redeem_modal.unresponsive_agent_modal.btc_network_description_label', { tokenName: mainToken?.type })
                                : t('redeem_modal.unresponsive_agent_modal.description_label', { tokenName: mainToken?.type })
                            }
                        </Text>
                    </div>
                </div>
            ),
            onClose: () => {
                if (closeModal.current) {
                    setTimeout(() => {
                        onCloseModal(true);
                    }, 300);
                }
            }
        });

        redemptionDefaultStatusFetchInterval.start();
    }, [redemptionDefaultStatus, t, redemptionStatusFetchInterval, redemptionDefaultStatusFetchInterval, mediaQueryMatches]);

    const onCloseModal = (fetchProgress: boolean) => {
        if (redemptionStatusFetchInterval.active) {
            redemptionStatusFetchInterval.stop();
        }
        if (redemptionDefaultStatusFetchInterval.active) {
            redemptionDefaultStatusFetchInterval.stop();
        }

        modals.closeAll();
        closeModal.current = true;
        setCurrentStep(STEP_AMOUNT);
        setCurrentWalletStep(STEP_WALLET_REDEMPTION);
        setErrorMessage(undefined);
        setFormAlert(undefined);
        setHasValidAmount(false);
        setDestinationTag('');
        setXrplDestAddress(fAssetCoin?.address ?? '');
        setRequestedAmount(undefined);
        setRedeemedAmount(undefined);
        setIsWaitingModalActive(false);
        setIsUnresponsiveAgentModalActive(false);
        setIsFinishedModalActive(false);
        onClose(fetchProgress);
    }

    useEffect(() => {
        if (opened && fAssetCoin?.address) {
            setXrplDestAddress(fAssetCoin.address);
        }
    }, [opened, fAssetCoin?.address]);

    useEffect(() => {
        if (!txHash) return;
        redemptionStatusFetchInterval.start();
        return redemptionStatusFetchInterval.stop;
    }, [txHash]);

    return (
        <>
            <FAssetModal
                opened={opened && !isWaitingModalActive && !isFinishedModalActive && !isUnresponsiveAgentModalActive}
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
                                        supportsDestinationTag={!!redeemWithTagSupported.data}
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
                                onClick={() => requestRedeem()}
                                isLoading={redeem.isPending}
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
            {fAssetCoin &&
                <RedeemFinishedModal
                    opened={isFinishedModalActive}
                    onClose={() => {
                        onCloseModal(true);
                    }}
                    fAssetCoin={fAssetCoin}
                    totalAmount={requestedAmount ?? 0}
                    redeemedAmount={redeemedAmount ?? 0}
                    redemptionDefaultResponse={redemptionDefaultStatus.data}
                />
            }
        </>
    );
}
