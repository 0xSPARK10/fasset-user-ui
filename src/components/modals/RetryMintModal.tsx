import FAssetModal from "@/components/modals/FAssetModal";
import { useTranslation } from "react-i18next";
import { Button, Divider, lighten, Paper, rem, Stepper, Text } from "@mantine/core";
import { IconCheck, IconCircleCheck, IconExclamationCircle, IconSettings } from "@tabler/icons-react";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import React, { useRef, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { WALLET } from "@/constants";
import { useUnderlyingStatus, useUserProgress } from "@/api/user";
import XrpIcon from "@/components/icons/XrpIcon";
import { formatNumber, toNumber } from "@/utils";
import { XRP_NAMESPACE } from "@/config/networks";
import { INetwork, IUtxo } from "@/types";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useSignTransaction } from "@/hooks/useContracts";
import { isError } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { AssetManagerAbi } from "@/abi";
import MintWaitingModal from "@/components/modals/MintWaitingModal";
import { modals } from "@mantine/modals";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";

interface IRetryMintModal {
    opened: boolean;
    onClose: (isMinting: boolean) => void;
    underlyingTransaction: {
        fAsset: string;
        fAssetAmount: string;
        amount: string;
        destinationAddress: string;
        paymentReference: string;
        agentName: string;
    };
}

const FINISHED_MODAL = 'finished_modal';

export default function RetryMintModal({ opened, onClose, underlyingTransaction }: IRetryMintModal) {
    const { t } = useTranslation();
    const { mainToken, connectedCoins } = useWeb3();
    const isMintRequestActive = useRef<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLedgerButtonDisabled, setIsLedgerButtonDisabled] = useState<boolean>(false);
    const [signedTransactionTxHash, setSignedTransactionTxHash] = useState<string>();
    const [isMintWaitingModalActive, setIsMintWaitingModalActive] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const fAssetCoin = connectedCoins.find(coin => coin.type === underlyingTransaction.fAsset);

    const nativeBalances = useNativeBalance(mainToken?.address ?? '', false);
    const underlyingBalance = useUnderlyingBalance(mainToken?.address!, underlyingTransaction.fAsset, false);
    const underlyingStatus = useUnderlyingStatus(underlyingTransaction.fAsset, underlyingTransaction.paymentReference, opened);
    const signTransaction = useSignTransaction(fAssetCoin?.address!);
    const userProgress = useUserProgress(mainToken?.address ?? '', false);

    const mintRequest = async () => {
        if (isMintRequestActive.current) return;

        try {
            isMintRequestActive.current = true;
            setIsLoading(true);
            setIsLedgerButtonDisabled(true);
            setErrorMessage(undefined);

            let signTransactionResponse: any;
            const signTransactionParams: {
                network: INetwork;
                userAddress: string;
                destination: string;
                amount: string;
                paymentReference: string;
                utxos?: IUtxo[];
                estimatedFee?: number;
            } = {
                network: fAssetCoin?.network!,
                destination: underlyingTransaction.destinationAddress,
                amount: underlyingTransaction.amount,
                paymentReference: underlyingTransaction.paymentReference,
                userAddress: fAssetCoin?.address!
            };

            signTransactionResponse = await signTransaction.mutateAsync(signTransactionParams);

            const txId = fAssetCoin?.network?.namespace === XRP_NAMESPACE
                ? signTransactionResponse?.tx_json?.hash
                : signTransactionResponse.txid;

            setIsMintWaitingModalActive(true);
            setSignedTransactionTxHash(txId);
            setTimeout(() => {
                userProgress.refetch();
            }, 1000);
        } catch (error: any) {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
                return;
            }

            if (isError(error, 'ACTION_REJECTED')) {
                setErrorMessage(t('notifications.request_rejected_by_user_label'));
            } else {
                const errorDecoder = ErrorDecoder.create([AssetManagerAbi]);
                const decodedError = await errorDecoder.decode(error);
                setErrorMessage(error?.error?.message || decodedError.reason as string);
            }
        } finally {
            isMintRequestActive.current = false;
            setIsLoading(false);
            setIsLedgerButtonDisabled(false);
        }
    }

    const onCloseMintWaitingModal = (isCompleted: boolean) => {
        setIsMintWaitingModalActive(false);
        onClose(true);
        nativeBalances.refetch();
        underlyingBalance.refetch();
        userProgress.refetch();

        if (isCompleted) {
            modals.open({
                modalId: FINISHED_MODAL,
                size: 500,
                title: t('mint_modal.title', { coinName: underlyingTransaction.fAsset }),
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
        <>
            <FAssetModal
                opened={opened && !isMintWaitingModalActive && underlyingStatus.data !== undefined}
                onClose={() => onClose(false)}
                closeOnEscape={false}
                centered
                size="lg"
                keepMounted={true}
                title={t('retry_mint_modal.title', { coinName: underlyingTransaction.fAsset })}
            >
                <FAssetModal.Body>
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
                        fw={300}
                        c="var(--flr-black)"
                        className="text-24 mb-4"
                    >
                        {underlyingStatus.data === false
                            ? t('retry_mint_modal.retry_title')
                            : t('retry_mint_modal.mint_defaulted_title')
                        }
                    </Text>
                    <Text
                        fw={400}
                        c="var(--flr-black)"
                        className="text-16 whitespace-pre-line mb-5"
                    >
                        {underlyingStatus.data === false
                            ? t('retry_mint_modal.description_label')
                            : t('retry_mint_modal.mint_defaulted_description_label')
                        }
                    </Text>
                    {underlyingStatus.data === false &&
                        <>
                            <Text
                                fw={400}
                                c="var(--flr-gray)"
                                className="text-12 mb-2 uppercase"
                            >
                                {t('retry_mint_modal.sum_label')}
                            </Text>
                            <div className="flex items-center mb-5">
                                <XrpIcon width="22" height="22" />
                                <Text
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                    className="text-16 ml-1"
                                >
                                    {formatNumber(underlyingTransaction.fAssetAmount, 2)}
                                </Text>
                            </div>
                            <Stepper
                                active={0}
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
                                            {t('retry_mint_modal.xrp_deposit_label')}
                                        </Text>
                                    }
                                    description={
                                        <Text
                                            className="text-12"
                                            fw={400}
                                            c={lighten('var(--flr-gray)', 0.378)}
                                        >
                                            {t('retry_mint_modal.confirm_label')}
                                        </Text>
                                    }
                                    icon={<IconSettings style={{ width: rem(18), height: rem(18) }} />}
                                    completedIcon={
                                        <IconCheck
                                            style={{ width: rem(18), height: rem(18) }}
                                            color="var(--flr-black)"
                                        />
                                    }
                                    loading={isLoading}
                                />
                            </Stepper>
                        </>
                    }
                </FAssetModal.Body>
                {underlyingStatus.data === false &&
                    <FAssetModal.Footer>
                        <Paper
                            radius="lg"
                            className="p-8"
                            styles={{
                                root: {
                                    backgroundColor: '#FCEBE2'
                                }
                            }}
                        >
                            <div className="flex items-center">
                                <IconExclamationCircle
                                    style={{ width: rem(25), height: rem(25) }}
                                    color="var(--flr-orange)"
                                    className="mr-3 flex-shrink-0"
                                />
                                <Text
                                    fw={400}
                                    c="var(--flr-orange)"
                                    className="text-16"
                                >
                                    {t('retry_mint_modal.new_transfer_label')}
                                </Text>
                            </div>
                        </Paper>
                        {fAssetCoin?.connectedWallet === WALLET.WALLET_CONNECT && (
                            isLoading ? (
                                <WalletConnectOpenWalletCard />
                            ) : (
                                <Button
                                    variant="filled"
                                    color="black"
                                    radius="xl"
                                    size="sm"
                                    fullWidth
                                    onClick={mintRequest}
                                    className="hover:text-white mt-8"
                                >
                                    {t('retry_mint_modal.continue_button')}
                                </Button>
                            )
                        )}
                        {fAssetCoin?.connectedWallet === WALLET.LEDGER &&
                            <LedgerConfirmTransactionCard
                                appName={fAssetCoin?.network?.ledgerApp!}
                                onClick={mintRequest}
                                isLoading={isLoading}
                                isDisabled={isLedgerButtonDisabled}
                                confirmLabel={t('retry_mint_modal.continue_button')}
                                className="!mt-3"
                            />
                        }
                    </FAssetModal.Footer>
                }
            </FAssetModal>
            {fAssetCoin &&
                <MintWaitingModal
                    opened={isMintWaitingModalActive}
                    onClose={(isCompleted) => onCloseMintWaitingModal(isCompleted)}
                    txHash={isMintWaitingModalActive ? signedTransactionTxHash! : ''}
                    transferredAssetAmount={isMintWaitingModalActive ? toNumber(underlyingTransaction.fAssetAmount) : 0}
                    agent={{
                        name: underlyingTransaction.agentName,
                        address: '',
                        feeBIPS: '',
                        underlyingAddress: '',
                        infoUrl: ''
                    }}
                    fAssetCoin={fAssetCoin}
                />
            }
        </>
    );
}