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
import CryptoJS from "crypto-js";
import MintWaitingModal from "@/components/modals/MintWaitingModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import { IFAssetCoin, ISelectedAgent, INetwork, IUtxo } from "@/types";
import { WALLET } from "@/constants";
import { useAssetManagerAddress, useExecutor } from "@/api/user";
import { AssetManagerAbi } from "@/abi";
import { useReserveCollateral, useSignPsbt, useSignTransaction } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useCrEvent, usePrepareUtxos, useRequestMinting, useUtxosForTransaction } from "@/api/minting";
import { BTC_NAMESPACE, XRP_NAMESPACE } from "@/config/networks";
import { fromLots, toNumber, toSatoshi } from "@/utils";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { useWeb3 } from "@/hooks/useWeb3";

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
    const signPsbt = useSignPsbt(fAssetCoin.address!);
    const requestMinting = useRequestMinting();
    const prepareUtxos = usePrepareUtxos();
    const utxosForTransaction = useUtxosForTransaction();

    useEffect(() => {
        if (!isMounted || reserveCollateral.isPending || (mainToken?.connectedWallet === WALLET.LEDGER && currentStep === STEP_WALLET_RESERVATION)) return;
        reserve();
    }, [isMounted]);

    useEffect(() => {
        if (!txHash || fAssetCoin.connectedWallet === WALLET.LEDGER) return;
        mintRequest();
    }, [txHash]);

    const mintRequest = async () => {
        if (isMintRequestActive.current) return;
        
        try {
            const response = (await crEvent.refetch()).data;
            isMintRequestActive.current = true;
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);

            let signTransactionResponse: any;
            if (fAssetCoin.network.namespace === BTC_NAMESPACE && fAssetCoin.connectedWallet !== WALLET.LEDGER) {
                const utxosResponse = await prepareUtxos.mutateAsync({
                    fAsset: fAssetCoin.type,
                    amount: toNumber(response?.paymentAmount!),
                    fee: formValues.estimatedFee,
                    recipient: selectedAgent.underlyingAddress,
                    changeAddresses: formValues.minterUnderlyingAddresses,
                    memo: response?.paymentReference?.substring(2)!,
                    utxos: formValues.utxos
                });

                signTransactionResponse = await signPsbt.mutateAsync({
                    network: fAssetCoin.network,
                    userAddress: fAssetCoin.address!,
                    psbt: utxosResponse?.psbt!,
                    utxos: utxosResponse?.selectedUtxos!
                });
            } else {
                const signTransactionParams: {
                    network: INetwork;
                    userAddress: string;
                    destination: string;
                    amount: string;
                    paymentReference: string;
                    utxos?: IUtxo[];
                    estimatedFee?: number;
                } = {
                    network: fAssetCoin.network,
                    destination: response?.paymentAddress!,
                    amount: response?.paymentAmount?.toString()!,
                    paymentReference: response?.paymentReference!,
                    userAddress: fAssetCoin.address!
                };

                let utxso = utxosForTransaction.data?.selectedUtxos ? utxosForTransaction.data?.selectedUtxos : [];
                let estimatedFee = utxosForTransaction.data?.estimatedFee ? utxosForTransaction.data?.estimatedFee : 0;

                if (utxso.length === 0 && fAssetCoin.network.namespace === BTC_NAMESPACE && fAssetCoin.connectedWallet === WALLET.LEDGER) {
                    const utxosForTransactionResponse = await utxosForTransaction.mutateAsync({
                        fAsset: fAssetCoin?.type!,
                        xpub: CryptoJS.AES.decrypt(fAssetCoin?.xpub!, process.env.XPUB_SECRET!).toString(CryptoJS.enc.Utf8),
                        amount: toNumber(response?.paymentAmount!)
                    });

                    utxso = utxosForTransactionResponse.selectedUtxos;
                    estimatedFee = utxosForTransactionResponse.estimatedFee;
                }

                if (utxso.length > 0) {
                    signTransactionParams.utxos = utxso;
                }
                if (estimatedFee !== 0) {
                    signTransactionParams.estimatedFee = estimatedFee;
                }

                signTransactionResponse = await signTransaction.mutateAsync(signTransactionParams);
            }

            const txId = fAssetCoin.network.namespace === XRP_NAMESPACE
                ? signTransactionResponse?.tx_json?.hash
                : signTransactionResponse.txid;

            await requestMinting.mutateAsync({
                collateralReservationId: response?.collateralReservationId!,
                txHash: txId,
                paymentAddress: response?.paymentAddress!,
                userUnderlyingAddress: fAssetCoin.address!,
                amount: (formValues.lots! * fAssetCoin.lotSize).toFixed(4),
                userAddress: mainToken?.address!,
                fAsset: fAssetCoin.type,
                nativeHash: txHash!,
                vaultAddress: formValues.agentAddress
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
            let minterUnderlyingAddresses = formValues.minterUnderlyingAddresses;

            if (fAssetCoin.network.namespace === BTC_NAMESPACE && fAssetCoin.connectedWallet === WALLET.LEDGER) {
                let amount = fromLots(formValues.lots, fAssetCoin.lotSize) as number;
                amount += (amount * (toNumber(formValues.feeBIPS)) / 10000);
                const utxosForTransactionResponse = await utxosForTransaction.mutateAsync({
                    fAsset: fAssetCoin?.type!,
                    xpub: CryptoJS.AES.decrypt(fAssetCoin?.xpub!, process.env.XPUB_SECRET!).toString(CryptoJS.enc.Utf8),
                    amount: toSatoshi(amount)
                });
                minterUnderlyingAddresses = utxosForTransactionResponse.returnAddresses;
            }

            const response = await reserveCollateral.mutateAsync({
                assetManagerAddress: assetManagerResponse?.data?.address!,
                agentVaultAddress: formValues.agentAddress,
                lots: formValues.lots,
                maxMintingFeeBIPS: formValues.feeBIPS,
                executorAddress: executorResponse?.data?.executorAddress!,
                userAddress: mainToken?.address!,
                totalNatFee: Number(formValues.collateralReservationFee) + Number(executorResponse?.data?.executorFee)
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
                        styles={{
                            root: {
                                marginLeft: '-2.7rem',
                                marginRight: '-2.7rem'
                            }
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
