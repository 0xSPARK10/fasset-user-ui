import React, { useEffect, useState, useRef } from "react";
import {
    Stepper,
    Title,
    Button,
    Text,
    Divider,
    lighten
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMounted } from "@mantine/hooks";
import {
    IconCheck,
    IconCircleCheck,
    IconFilePlus,
    IconSettings
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { isError } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import MintWaitingModal from "@/components/modals/MintWaitingModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import XamanOpenWalletCard from "@/components/cards/XamanOpenWalletCard";
import { IFAssetCoin, ISelectedAgent, INetwork, IUtxo } from "@/types";
import { WALLET } from "@/constants";
import { useAssetManagerAddress, useExecutor } from "@/api/user";
import { AssetManagerAbi } from "@/abi";
import { useReserveCollateral, useSignTransaction } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useCrEvent, useRequestMinting, useUtxosForTransaction } from "@/api/minting";
import { XRP_NAMESPACE } from "@/config/networks";
import { fromLots } from "@/utils";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { useWeb3 } from "@/hooks/useWeb3";
import { isMobile } from 'react-device-detect';

const FINISHED_MODAL = 'finished_modal';

interface IConfirmStepper {
    fAssetCoin: IFAssetCoin;
    formValues: any;
    onError: (error: string) => void;
    onClose: (isWaitingMintModalActive: boolean) => void;
    selectedAgent: ISelectedAgent;
}

const STEP_WALLET_RESERVATION = 0;
const STEP_WALLET_DEPOSIT = 1;
const STEP_WALLET_COMPLETED = 2;

export default function ConfirmStepper({
   fAssetCoin,
   formValues,
   onError,
   onClose,
   selectedAgent,
} : IConfirmStepper) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_WALLET_RESERVATION);
    const [txHash, setTxHash] = useState<string>();
    const [isMintWaitingModalActive, setIsMintWaitingModalActive] = useState<boolean>(false);
    const [signedTransactionTxHash, setSignedTransactionTxHash] = useState<string>();
    const [transferredAssetAmount, setTransferredAssetAmount] = useState<number>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);
    const isMintRequestActive = useRef<boolean>(false);

    const { t } = useTranslation();
    const { mainToken } = useWeb3();

    const nativeBalances = useNativeBalance(mainToken?.address ?? '', false);
    const underlyingBalance = useUnderlyingBalance(fAssetCoin.address!, fAssetCoin.type, false);

    const assetManagerAddress = useAssetManagerAddress(fAssetCoin.type, false);
    const reserveCollateral = useReserveCollateral();
    const executor = useExecutor(fAssetCoin.type, false);
    const isMounted = useMounted();
    const crEvent = useCrEvent(fAssetCoin.type, txHash!, false);
    const signTransaction = useSignTransaction(fAssetCoin.address!);
    const requestMinting = useRequestMinting();

    useEffect(() => {
        if (!isMounted || reserveCollateral.isPending || (mainToken?.connectedWallet === WALLET.LEDGER && currentStep === STEP_WALLET_RESERVATION)) return;
        reserve();
    }, [isMounted]);

    useEffect(() => {
        if (!txHash || fAssetCoin.connectedWallet === WALLET.LEDGER || (fAssetCoin.connectedWallet === WALLET.XAMAN && isMobile)) return;
       mintRequest();
    }, [txHash]);

    const mintRequest = async () => {
        if (isMintRequestActive.current) return;
        
        try {
            const response = (await crEvent.refetch()).data;
            isMintRequestActive.current = true;
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);

            const signTransactionParams: {
                network: INetwork;
                userAddress: string;
                destination: string;
                amount: string;
                paymentReference: string;
                utxos?: IUtxo[];
                estimatedFee?: number;
                lastUnderlyingBlock: string;
                expirationMinutes?: string;
            } = {
                network: fAssetCoin.network,
                destination: response?.paymentAddress!,
                amount: response?.paymentAmount?.toString()!,
                paymentReference: response?.paymentReference!,
                userAddress: fAssetCoin.address!,
                lastUnderlyingBlock: response?.lastUnderlyingBlock!,
            };

            if (fAssetCoin.connectedWallet === WALLET.XAMAN) {
                signTransactionParams.expirationMinutes = response?.expirationMinutes!;
            }

            const signTransactionResponse = await signTransaction.mutateAsync(signTransactionParams);

            const txId = fAssetCoin.network.namespace === XRP_NAMESPACE
                ? signTransactionResponse?.tx_json?.hash
                : signTransactionResponse.txid;

            const walletId = {
                [WALLET.META_MASK]: 1,
                [WALLET.WALLET_CONNECT]: 2,
                [WALLET.LEDGER]: 3,
                [WALLET.XAMAN]: 4
            };

            await requestMinting.mutateAsync({
                collateralReservationId: response?.collateralReservationId!,
                txHash: txId,
                paymentAddress: response?.paymentAddress!,
                userUnderlyingAddress: fAssetCoin.address!,
                amount: (formValues.lots! * fAssetCoin.lotSize).toFixed(4),
                userAddress: mainToken?.address!,
                fAsset: fAssetCoin.type,
                nativeHash: txHash!,
                vaultAddress: formValues.agentAddress,
                nativeWalletId: (mainToken?.connectedWallet && mainToken.connectedWallet in walletId) ? walletId[mainToken.connectedWallet] : 0,
                underlyingWalletId: (fAssetCoin?.connectedWallet && fAssetCoin.connectedWallet in walletId) ? walletId[fAssetCoin.connectedWallet] : 0
            });
            setCurrentStep(STEP_WALLET_COMPLETED);
            setIsMintWaitingModalActive(true);
            onClose(true);
            setSignedTransactionTxHash(txId);
        } catch (error: any) {
            if (error.code === 4001) {
                onError(t('notifications.request_rejected_by_user_label'));
            } else if (error.cause === 'ledger') {
                showErrorNotification(error.message);
            } else {
                onError(error?.response?.data?.message ?? error.message);
            }
        } finally {
            isMintRequestActive.current = false;
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    }

    const reserve = async () => {
        try {
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);
            setTransferredAssetAmount(fromLots(parseInt(formValues.lots), fAssetCoin.lotSize) as number);
            const executorResponse = await executor.refetch();
            const assetManagerResponse = await assetManagerAddress.refetch();

            const response = await reserveCollateral.mutateAsync({
                assetManagerAddress: assetManagerResponse?.data?.address!,
                agentVaultAddress: formValues.agentAddress,
                lots: formValues.lots,
                maxMintingFeeBIPS: formValues.feeBIPS,
                executorAddress: executorResponse?.data?.executorAddress!,
                userAddress: mainToken?.address!,
                totalNatFee: Number(formValues.collateralReservationFee) + Number(executorResponse?.data?.executorFee),
            });
            setTxHash(response.hash);
            setCurrentStep(STEP_WALLET_DEPOSIT);
        } catch (error: any) {
            if (isError(error, 'ACTION_REJECTED')) {
                onError(t('notifications.request_rejected_by_user_label'));
            } else if (error.cause === 'ledger') {
                showErrorNotification(error.message);
            } else {
                const errorDecoder = ErrorDecoder.create([AssetManagerAbi]);
                const decodedError = await errorDecoder.decode(error);
                onError(decodedError.reason as string);
            }
        } finally {
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    }

    const onCloseMintWaitingModal = (isCompleted: boolean) => {
        setIsMintWaitingModalActive(false);
        onClose(false);
        nativeBalances.refetch();
        underlyingBalance.refetch();

        if (isCompleted) {
            modals.open({
                modalId: FINISHED_MODAL,
                size: 500,
                title: t('mint_modal.title', { coinName: fAssetCoin.type }),
                children: (
                    <div className="px-7">
                        <Text
                            className="text-24"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {t('mint_modal.finished_modal.title')}
                        </Text>
                        <div className="flex items-center mt-5">
                            <IconCircleCheck
                                color="var(--mantine-color-black)"
                                className="mr-3"
                                size={40}
                            />
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {t('mint_modal.finished_modal.description_label')}
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
                            onClick={() => { modals.close(FINISHED_MODAL) }}
                            variant="filled"
                            color="black"
                            radius="xl"
                            size="sm"
                            fullWidth
                            className="hover:text-white font-normal mb-5"
                        >
                            {t('mint_modal.return_to_home_button')}
                        </Button>
                    </div>
                ),
                centered: true
            });
        }
    };

    return (
        <div>
            <Title
                className="text-24"
                fw={300}
                c="var(--flr-black)"
            >
                {currentStep === STEP_WALLET_RESERVATION ? t('mint_modal.confirm_step_title') : t('mint_modal.confirm_second_step_title')}
            </Title>
            <Text
                className="my-5 text-16"
                fw={400}
                c="var(--flr-black)"
            >
                {t('mint_modal.confirm_step_description')}
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
                <Stepper.Step
                    label={
                        <Text
                            className="text-14"
                            fw={500}
                            c="var(--flr-black)"
                        >
                            {t('mint_modal.reservation_step_label', { stepIndex: 1 })}
                        </Text>
                    }
                    description={
                        <Text
                            className="text-12"
                            fw={400}
                            c={lighten('var(--flr-gray)', 0.378)}
                        >
                            {t('mint_modal.reservation_step_description')}
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
                    loading={currentStep === STEP_WALLET_RESERVATION}
                />
                <Stepper.Step
                    label={
                        <Text
                            className="text-14"
                            fw={500}
                            c={currentStep === STEP_WALLET_RESERVATION ? 'var(--flr-light-gray)' : 'var(--flr-black)'}
                        >
                            {t('mint_modal.deposit_step_label', {
                                stepIndex: 2,
                                fAsset: fAssetCoin.nativeName
                            })}
                        </Text>
                    }
                    description={
                        <Text
                            className="text-12"
                            fw={400}
                            c={currentStep === STEP_WALLET_RESERVATION ? 'var(--flr-light-gray)' : lighten('var(--flr-gray)', 0.378)}
                        >
                            {t('mint_modal.deposit_step_description', { fAsset: fAssetCoin.nativeName })}
                        </Text>
                    }
                    icon={
                        <IconSettings
                            size={16}
                            color={currentStep === STEP_WALLET_RESERVATION ? 'var(--flr-light-gray)' : undefined}
                        />
                    }
                    completedIcon={
                        <IconCheck
                            size={16}
                            color="var(--flr-black)"
                        />
                    }
                    loading={currentStep === STEP_WALLET_DEPOSIT}
                />
            </Stepper>
            {((currentStep === STEP_WALLET_RESERVATION && mainToken?.connectedWallet === WALLET.LEDGER)
                || (currentStep === STEP_WALLET_DEPOSIT && fAssetCoin?.connectedWallet === WALLET.LEDGER)) &&
                <>
                    <Divider
                        className="my-8"
                        classNames={{
                            root: 'mx-[-1rem] sm:mx-[-2.7rem]'
                        }}
                    />
                    <LedgerConfirmTransactionCard
                        appName={currentStep === STEP_WALLET_RESERVATION
                            ? mainToken?.network?.ledgerApp!
                            : fAssetCoin?.network?.ledgerApp!}
                        onClick={currentStep === STEP_WALLET_RESERVATION ? reserve : mintRequest}
                        isLoading={isLoading}
                        isDisabled={isLedgerButtonDisabled}
                    />
                </>
            }
            {((currentStep === STEP_WALLET_RESERVATION && mainToken?.connectedWallet === WALLET.WALLET_CONNECT) || (currentStep === STEP_WALLET_DEPOSIT && fAssetCoin?.connectedWallet === WALLET.WALLET_CONNECT)) &&
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
            {currentStep === STEP_WALLET_DEPOSIT && fAssetCoin?.connectedWallet === WALLET.XAMAN &&
                <XamanOpenWalletCard
                    onClick={mintRequest}
                    confirmButton={isMobile}
                    isLoading={isLoading}
                />
            }
            <MintWaitingModal
                opened={isMintWaitingModalActive}
                onClose={(isCompleted) => onCloseMintWaitingModal(isCompleted)}
                txHash={isMintWaitingModalActive ? signedTransactionTxHash! : ''}
                transferredAssetAmount={isMintWaitingModalActive ? transferredAssetAmount! : 0}
                agent={selectedAgent}
                fAssetCoin={fAssetCoin}
            />
        </div>
    );
}
