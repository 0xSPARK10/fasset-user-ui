import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import MintWaitingModal from "@/components/modals/MintWaitingModal";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import XamanOpenWalletCard from "@/components/cards/XamanOpenWalletCard";
import { IFAssetCoin } from "@/types";
import { IAlertMessage } from "@/components/elements/FormAlert";
import { WALLET } from "@/constants";
import { useSignTransaction } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useDirectMintingInfo } from "@/api/minting";
import { XRP_NAMESPACE } from "@/config/networks";
import { devLog } from "@/utils/debug";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import { useWeb3 } from "@/hooks/useWeb3";
import { isMobile } from "react-device-detect";
import MintLimitReachedModal from "../modals/MintLimitReachedModal";

const FINISHED_MODAL = "finished_modal";
const STEP_WALLET_PAYMENT = 0;
const STEP_WALLET_COMPLETED = 1;
const DIRECT_MINTING_PREFIX = "4642505266410018";

interface IConfirmStepper {
    fAssetCoin: IFAssetCoin;
    formValues: any;
    onError: (alert?: IAlertMessage) => void;
    onClose: (isWaitingMintModalActive: boolean) => void;
}

function encodeDirectMintingMemo(destinationAddress: string) {
    const normalizedAddress = destinationAddress.toLowerCase().replace(/^0x/, "");
    return `0x${DIRECT_MINTING_PREFIX}${"0".repeat(8)}${normalizedAddress}`.toUpperCase();
}

function calculateDirectMintPaymentAmount(
    amount: number,
    underlyingDecimals: number,
    mintingFeeBIPS: string,
    minimumMintingFeeUBA: string,
    fassetsExecutorFee: string,
) {
    // Direct mint payment amount must be encoded in underlying smallest units
    // (for XRP this is drops = 6 decimals), not UI display precision.
    const mintAmountUba = Math.round(amount * 10 ** underlyingDecimals);
    const feeBIPS = Number(mintingFeeBIPS ?? "0");
    const minimumFee = Number(minimumMintingFeeUBA ?? "0");
    const executorFee = Number(fassetsExecutorFee ?? "0");
    // systemFee = max(receivedXRP * feeBIPS / 10000, minimumFee)
    // receivedXRP = mintAmount + systemFee + executorFee
    // → systemFee = (mintAmount + executorFee) * feeBIPS / (10000 - feeBIPS)
    const percentageFee = Math.round(
        ((mintAmountUba + executorFee) * feeBIPS) / (10000 - feeBIPS),
    );
    const mintingFee = Math.max(percentageFee, minimumFee);

    return (mintAmountUba + mintingFee + executorFee).toString();
}

export default function ConfirmStepper({
    fAssetCoin,
    formValues,
    onError,
    onClose,
}: IConfirmStepper) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_WALLET_PAYMENT);
    const [isMintWaitingModalActive, setIsMintWaitingModalActive] = useState<boolean>(false);
    const [delayTimestamp, setDelayTimestamp] = useState<number | null>(null);
    const [signedTransactionTxHash, setSignedTransactionTxHash] = useState<string>();
    const [transferredAssetAmount, setTransferredAssetAmount] = useState<number>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);
    const isMintRequestActive = useRef<boolean>(false);

    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const isMounted = useMounted();

    const nativeBalances = useNativeBalance(mainToken?.address ?? "", false);
    const underlyingBalance = useUnderlyingBalance(fAssetCoin.address!, fAssetCoin.type, false);
    const signTransaction = useSignTransaction(fAssetCoin.address!);
    const directMintingInfo = useDirectMintingInfo(fAssetCoin.type, false);

    const paymentAmount = useMemo(() => {
        if (!formValues?.amount || !directMintingInfo.data) return "";

        return calculateDirectMintPaymentAmount(
            Number(formValues.amount),
            fAssetCoin.contractDecimals ?? 6,
            directMintingInfo.data.mintingFeeBIPS,
            directMintingInfo.data.minimumMintingFeeUBA,
            directMintingInfo.data.fassetsExecutorFee,
        );
    }, [directMintingInfo.data, fAssetCoin.contractDecimals, formValues?.amount]);

    useEffect(() => {
        if (
            !isMounted ||
            mainToken?.connectedWallet === WALLET.LEDGER ||
            (fAssetCoin.connectedWallet === WALLET.XAMAN && isMobile)
        ) {
            return;
        }

        void submitDirectMintPayment();
    }, [isMounted]); // eslint-disable-line react-hooks/exhaustive-deps

    const submitDirectMintPayment = async () => {
        if (isMintRequestActive.current) return;

        try {
            isMintRequestActive.current = true;
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);
            setTransferredAssetAmount(Number(formValues.amount));

            const directMintingResponse =
                directMintingInfo.data ?? (await directMintingInfo.refetch()).data;

            if (!directMintingResponse?.paymentAddress) {
                throw new Error(t("errors.try_reconnecting_label"));
            }

            const isTagMode = formValues.destinationMode === "tag";
            const tagToSend = isTagMode
                ? (formValues.destinationTag as string)
                : (formValues.addressTag as string);
            const useTag = !!tagToSend;
            const paymentReference = !useTag && formValues.destinationAddress
                ? encodeDirectMintingMemo(formValues.destinationAddress)
                : undefined;

            devLog('[MINT] tag resolution:', {
                mode: isTagMode ? 'tag-mode (user entered)' : (tagToSend ? 'address-mode (auto addressTag)' : 'address-mode (memo fallback)'),
                tagToSend: tagToSend || '(none)',
                useTag,
                paymentReference: paymentReference ?? '(none)',
            });
            devLog('[MINT] submitDirectMintPayment params:', {
                network: fAssetCoin.network.namespace,
                destination: directMintingResponse.paymentAddress,
                amount: paymentAmount,
                paymentReference,
                destinationTag: useTag ? tagToSend : undefined,
                userAddress: fAssetCoin.address,
                isTagMode,
                formAmount: formValues.amount,
            });

            const signTransactionResponse = await signTransaction.mutateAsync({
                network: fAssetCoin.network,
                destination: directMintingResponse.paymentAddress,
                amount: paymentAmount,
                paymentReference: paymentReference,
                destinationTag: useTag ? tagToSend : undefined,
                userAddress: fAssetCoin.address!,
            });

            devLog('[MINT] signTransaction raw response:', JSON.stringify(signTransactionResponse, null, 2));

            const txId = fAssetCoin.network.namespace === XRP_NAMESPACE
                ? signTransactionResponse?.tx_json?.hash
                : signTransactionResponse.txid;

            devLog('[MINT] extracted txId:', txId, '| namespace:', fAssetCoin.network.namespace);

            setCurrentStep(STEP_WALLET_COMPLETED);
            setIsMintWaitingModalActive(true);
            onClose(true);
            setSignedTransactionTxHash(txId);
        } catch (error: any) {
            if (error.code === 4001) {
                onError({ msg: t("notifications.request_rejected_by_user_label") });
            } else if (error.cause === "ledger") {
                showErrorNotification(error.message);
            } else {
                onError({ msg: error?.response?.data?.message ?? error.message });
            }
        } finally {
            isMintRequestActive.current = false;
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    };

    const onCloseMintWaitingModal = (isCompleted: boolean) => {
        setIsMintWaitingModalActive(false);
        onClose(false);
        nativeBalances.refetch();
        underlyingBalance.refetch();

        if (isCompleted) {
            modals.open({
                modalId: FINISHED_MODAL,
                size: 500,
                title: t("mint_modal.title", { coinName: fAssetCoin.type }),
                children: (
                    <div className="px-7">
                        <Text
                            className="text-24"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            {t("mint_modal.finished_modal.title")}
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
                                {t("mint_modal.finished_modal.description_label")}
                            </Text>
                        </div>
                        <Divider
                            className="my-8"
                            styles={{
                                root: {
                                    marginLeft: "-2.7rem",
                                    marginRight: "-2.7rem"
                                }
                            }}
                        />
                        <Button
                            onClick={() => { modals.close(FINISHED_MODAL); }}
                            variant="filled"
                            color="black"
                            radius="xl"
                            size="sm"
                            fullWidth
                            className="hover:text-white font-normal mb-5"
                        >
                            {t("mint_modal.return_to_home_button")}
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
                {currentStep === STEP_WALLET_PAYMENT
                    ? t("mint_modal.confirm_step_title")
                    : t("mint_modal.confirm_second_step_title")}
            </Title>
            <Text
                className="my-5 text-16"
                fw={400}
                c="var(--flr-black)"
            >
                {t("mint_modal.confirm_step_description")}
            </Text>
            <Stepper
                active={currentStep}
                iconSize={32}
                size="sm"
                orientation="vertical"
                classNames={{
                    stepDescription: "max-w-[300px]"
                }}
            >
                <Stepper.Step
                    label={
                        <Text
                            className="text-14"
                            fw={500}
                            c="var(--flr-black)"
                        >
                            {t("mint_modal.title", { coinName: fAssetCoin.type })}
                        </Text>
                    }
                    description={
                        <Text
                            className="text-12"
                            fw={400}
                            c={lighten("var(--flr-gray)", 0.378)}
                        >
                            {t("mint_modal.confirm_deposit_label", { tokenName: fAssetCoin.nativeName })}
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
                    loading={currentStep === STEP_WALLET_PAYMENT}
                />
            </Stepper>
            {currentStep === STEP_WALLET_PAYMENT && mainToken?.connectedWallet === WALLET.LEDGER &&
                <>
                    <Divider
                        className="my-8"
                        classNames={{
                            root: "mx-[-1rem] sm:mx-[-2.7rem]"
                        }}
                    />
                    <LedgerConfirmTransactionCard
                        appName={fAssetCoin?.network?.ledgerApp!}
                        onClick={submitDirectMintPayment}
                        isLoading={isLoading}
                        isDisabled={isLedgerButtonDisabled}
                    />
                </>
            }
            {currentStep === STEP_WALLET_PAYMENT && fAssetCoin?.connectedWallet === WALLET.WALLET_CONNECT &&
                <>
                    <Divider
                        className="my-8"
                        classNames={{
                            root: "mx-[-1rem] sm:mx-[-2.7rem]"
                        }}
                    />
                    <WalletConnectOpenWalletCard />
                </>
            }
            {currentStep === STEP_WALLET_PAYMENT && fAssetCoin?.connectedWallet === WALLET.XAMAN &&
                <XamanOpenWalletCard
                    onClick={submitDirectMintPayment}
                    confirmButton={isMobile}
                    isLoading={isLoading}
                />
            }
            <MintWaitingModal
                opened={isMintWaitingModalActive}
                onClose={(isCompleted) => onCloseMintWaitingModal(isCompleted)}
                onDelayed={(timestamp) => { setIsMintWaitingModalActive(false); setDelayTimestamp(timestamp); }}
                txHash={isMintWaitingModalActive ? signedTransactionTxHash! : ""}
                transferredAssetAmount={isMintWaitingModalActive ? transferredAssetAmount! : 0}
                fAssetCoin={fAssetCoin}
            />
            <MintLimitReachedModal
                opened={delayTimestamp !== null}
                onClose={() => {
                    setDelayTimestamp(null);
                    onClose(false);
                }}
                resumedTimestamp={delayTimestamp ?? 0}
            />
        </div>
    );
}
