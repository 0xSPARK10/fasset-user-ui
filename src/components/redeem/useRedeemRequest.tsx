import {
    Title,
    Text,
    rem,
    Loader,
    Paper,
    Anchor,
} from "@mantine/core";
import {
    IconArrowUpRight,
    IconExclamationCircle
} from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRedemptionStatus, useRedemptionDefaultStatus, useRequestRedemptionDefault } from "@/api/redemption";
import { useAssetManagerAddress, USER_KEY } from "@/api/user";
import { useRedeem, useRedeemWithTagSupported } from "@/hooks/useContracts";
import { modals } from "@mantine/modals";
import { isError } from "ethers";
import { ethers } from "ethers";
import { useInterval, useMediaQuery } from "@mantine/hooks";
import RedeemFinishedModal from "@/components/modals/RedeemFinishedModal";
import { useNativeBalance } from "@/api/balance";
import { ErrorDecoder } from "ethers-decode-error";
import { AssetManagerAbi } from "@/abi";
import { IFAssetCoin } from "@/types";
import { BTC_NAMESPACE } from "@/config/networks";
import { formatNumber, toNumber } from "@/utils";
import { createLogger } from "@/utils/debug";
import { COOKIE_WINDDOWN } from "@/constants";
import { showErrorNotification } from "@/hooks/useNotifications";
import { Cookies } from "react-cookie";
import { useWeb3 } from "@/hooks/useWeb3";
import { useModalGuard } from "@/hooks/useModalGuard";
import { useQueryClient } from "@tanstack/react-query";

const log = createLogger('REDEEM');

export const STEP_WALLET_REDEMPTION = 0;
export const STEP_WALLET_COMPLETED = 1;

const REDEMPTION_DEFAULT_FETCH_INTERVAL = 15000;
const REDEMPTION_STATUS_FETCH_INTERVAL = 15000;

const WAITING_MODAL = 'waiting_modal';
const UNRESPONSIVE_AGENT_MODAL = 'unresponsive_agent_modal';

export interface IRedeemRequestValues {
    amount: number;
    destinationAddress: string;
    destinationTag?: string;
    executorAddress: string;
    executorFee: string;
}

interface IUseRedeemRequest {
    fAssetCoin: IFAssetCoin | undefined;
    // Guards the async request: closing aborts it (useModalGuard)
    opened: boolean;
    // Before the tx is out (tag not supported, rejected, revert) — back to the amount step
    onError: (message?: string) => void;
    // A post-tx modal (waiting / unresponsive agent / finished) was closed — reset and close
    onClose: (fetchProgress: boolean) => void;
}

/**
 * Redeem request + everything after it, moved verbatim out of RedeemModal so the bridge page
 * can open the confirm step without the amount step: guard, request + redemption default,
 * status / default polling, waiting / unresponsive-agent modals and RedeemFinishedModal.
 * The caller renders the confirm UI (wallet stepper, Ledger / WalletConnect cards).
 */
export function useRedeemRequest({ fAssetCoin, opened, onError, onClose }: IUseRedeemRequest) {
    const [currentWalletStep, setCurrentWalletStep] = useState<number>(STEP_WALLET_REDEMPTION);
    const [isWaitingModalActive, setIsWaitingModalActive] = useState<boolean>(false);
    const [isFinishedModalActive, setIsFinishedModalActive] = useState<boolean>(false);
    const [isUnresponsiveAgentModalActive, setIsUnresponsiveAgentModalActive] = useState<boolean>(false);
    const [requestedAmount, setRequestedAmount] = useState<number>();
    const [txHash, setTxHash] = useState<string>();
    const closeModal = useRef<boolean>(true);
    const { t } = useTranslation();
    const [redeemedAmount, setRedeemedAmount] = useState<number>();
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const { run, cancel } = useModalGuard(opened);
    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');
    const { mainToken, getConnectedCoin } = useWeb3();
    const connectedCoin = fAssetCoin ? getConnectedCoin(fAssetCoin.type) : undefined;
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

    const redemptionStatusFetchInterval = useInterval(() => run(async (assertOpen) => {
        const response = await redemptionStatus.refetch();
        assertOpen();
        log.log('redemptionStatus poll:', { txHash, status: response?.data?.status, data: response?.data });
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
            });
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
    }), REDEMPTION_STATUS_FETCH_INTERVAL);

    const redemptionDefaultStatusFetchInterval = useInterval(() => run(async (assertOpen) => {
        const response = await redemptionDefaultStatus.refetch();
        assertOpen();
        if (response?.data?.status) {
            redemptionDefaultStatusFetchInterval.stop();
            closeModal.current = false;
            modals.close(UNRESPONSIVE_AGENT_MODAL);
            setIsFinishedModalActive(true);
        }
    }), REDEMPTION_DEFAULT_FETCH_INTERVAL);

    const requestRedeem = async (values: IRedeemRequestValues) => {
        setIsLedgerButtonDisabled(true);

        await run(async (assertOpen) => {
            const amount = values.amount;
            const destinationTag =
                String(values.destinationTag ?? '').trim() ||
                undefined;

            if (destinationTag && !redeemWithTagSupported.data) {
                onError(t('redeem_modal.form.destination_tag_not_supported_error'));
                return;
            }

            const amountUBA = ethers.parseUnits(
                String(amount),
                fAssetCoin?.contractDecimals ?? 6,
            ).toString();
            setRequestedAmount(amount);

            log.log('requestRedeem params:', {
                assetManagerAddress: assetManagerAddress?.data?.address,
                userAddress: mainToken?.address,
                amountUBA,
                destinationAddress: values.destinationAddress,
                executorAddress: values.executorAddress,
                executorFee: values.executorFee,
                destinationTag,
            });

            const response = await redeem.mutateAsync({
                assetManagerAddress: assetManagerAddress?.data?.address!,
                userAddress: mainToken?.address!,
                amountUBA,
                userUnderlyingAddress: values.destinationAddress,
                executorAddress: values.executorAddress,
                executorFee: values.executorFee,
                destinationTag,
            });
            assertOpen();

            log.log('redeem tx hash:', response.hash);

            const redeemResponse = await requestRedemptionDefault.mutateAsync({
                txHash: response.hash,
                fAsset: fAssetCoin?.type!,
                amount: amountUBA,
                userAddress: mainToken?.address!
            });
            assertOpen();

            log.log('redemptionDefault response:', redeemResponse);

            const resolvedRedeemedAmount = redeemResponse.incomplete
                ? calculateRedeemedAmount(amount, {
                    remainingLots: redeemResponse.remainingLots,
                    remainingAmountUBA: redeemResponse.remainingAmountUBA,
                })
                : amount;

            setCurrentWalletStep(STEP_WALLET_COMPLETED);
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

            assertOpen();
            await new Promise(resolve => setTimeout(resolve, 1000));
            openWaitingModal(resolvedRedeemedAmount, amount, redeemResponse.incomplete);
        }).catch(async (error: any) => {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            if (isError(error, 'ACTION_REJECTED')) {
                onError(t('notifications.request_rejected_by_user_label'));
            } else {
                const errorDecoder = ErrorDecoder.create([AssetManagerAbi]);
                const decodedError = await errorDecoder.decode(error);
                onError(error?.error?.message || decodedError.reason as string);
            }
            modals.closeAll();
        });

        setIsLedgerButtonDisabled(false);
    }

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

    // The hook's part of RedeemModal.onCloseModal
    const reset = () => {
        cancel();
        if (redemptionStatusFetchInterval.active) {
            redemptionStatusFetchInterval.stop();
        }
        if (redemptionDefaultStatusFetchInterval.active) {
            redemptionDefaultStatusFetchInterval.stop();
        }

        modals.closeAll();
        closeModal.current = true;
        setCurrentWalletStep(STEP_WALLET_REDEMPTION);
        setRequestedAmount(undefined);
        setTxHash(undefined);
        setRedeemedAmount(undefined);
        setIsWaitingModalActive(false);
        setIsUnresponsiveAgentModalActive(false);
        setIsFinishedModalActive(false);
    };

    // RedeemModal.onCloseModal — the caller resets (reset() + its own state) and closes
    const onCloseModal = (fetchProgress: boolean) => onClose(fetchProgress);

    useEffect(() => {
        if (!txHash) return;
        redemptionStatusFetchInterval.start();
        return redemptionStatusFetchInterval.stop;
    }, [txHash]);

    return {
        requestRedeem,
        reset,
        currentWalletStep,
        isLedgerButtonDisabled,
        isRedeemPending: redeem.isPending,
        // The confirm modal hides while one of these is open
        isPostTxModalActive: isWaitingModalActive || isFinishedModalActive || isUnresponsiveAgentModalActive,
        finishedModal: fAssetCoin &&
            <RedeemFinishedModal
                opened={isFinishedModalActive}
                onClose={() => {
                    onCloseModal(true);
                }}
                fAssetCoin={fAssetCoin}
                totalAmount={requestedAmount ?? 0}
                redeemedAmount={redeemedAmount ?? 0}
                redemptionDefaultResponse={redemptionDefaultStatus.data}
            />,
    };
}
