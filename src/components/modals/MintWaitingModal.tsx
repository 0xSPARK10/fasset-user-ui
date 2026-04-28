import React, { useEffect, useState } from "react";
import {
    Text,
    Progress,
    Anchor,
    Paper,
    rem
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation, Trans } from "react-i18next";
import { IconArrowUpRight, IconExclamationCircle } from "@tabler/icons-react";
import { MINTING_KEY, useMintingStatus } from "@/api/minting";
import FAssetModal from "@/components/modals/FAssetModal";
import { AxiosError } from "axios";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ICoin, ISelectedAgent } from "@/types";
import { devLog } from "@/utils/debug";
import { formatNumber } from "@/utils";
import { BTC_NAMESPACE } from "@/config/networks";
import { WALLET } from "@/constants";
import { USER_KEY } from "@/api/user";
import { useWeb3 } from "@/hooks/useWeb3";

interface IMintWaitingModal {
    opened: boolean;
    onClose: (isCompleted: boolean) => void;
    onDelayed?: (timestamp: number) => void;
    txHash: string;
    transferredAssetAmount: number;
    agent?: ISelectedAgent;
    fAssetCoin: ICoin;
}

const MINTING_STATUS_FETCH_INTERVAL = 10000;

export default function MintWaitingModal({ opened, onClose, onDelayed, txHash, transferredAssetAmount, fAssetCoin }: IMintWaitingModal) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const mintingStatus = useMintingStatus(txHash ?? '', false);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const externalLinks: { [key: string]: string } = {
        1: 'https://dev.flare.network/fdc/overview/',
        2: `${process.env.APP_URL}/`,
        3: 'https://dev.flare.network/fassets/overview',
        4: 'https://dev.flare.network/fassets/overview'
    };

    const { connectedCoins, mainToken } = useWeb3();
    const connectedCoin = connectedCoins.find(coin => coin.type == fAssetCoin?.type);

    useEffect(() => {
        if (!opened || !txHash) return;

        devLog('[MINT] MintWaitingModal opened, polling txHash:', txHash);

        try {
            const interval = setInterval(async () => {
                const response = await mintingStatus.refetch();

                devLog('[MINT] mintingStatus poll response:', { txHash, data: response?.data, error: response?.error });

                if (response?.data?.delayed && response.data.delayTimestamp) {
                    devLog('[MINT] minting delayed, timestamp:', response.data.delayTimestamp);
                    clearInterval(interval);
                    setCurrentStep(1);
                    onDelayed?.(response.data.delayTimestamp);
                    return;
                }

                if (response?.data !== undefined && response?.data?.step !== 4) {
                    setCurrentStep(response.data?.step + 1);
                }

                if (response?.data?.step === 4) {
                    devLog('[MINT] minting completed (step 4)');
                    setTimeout(() => {
                        closeModal(true);
                    }, 1000);
                }
            }, MINTING_STATUS_FETCH_INTERVAL);

            return () => {
                clearInterval(interval);
            }
        } catch (error: any) {
            error = error as AxiosError;
            showErrorNotification(error?.response?.data?.message);
        }
    }, [txHash, opened]);

    const closeModal = (isCompleted: boolean = false) => {
        setCurrentStep(1);
        queryClient.invalidateQueries({
            queryKey: [MINTING_KEY.MAX_LOTS, fAssetCoin.type],
            exact: true,
            refetchType: 'all'
        });
        queryClient.invalidateQueries({
            queryKey: [USER_KEY.USER_PROGRESS, mainToken?.address, connectedCoin?.address],
            exact: true,
            refetchType: 'all'
        });
        onClose(isCompleted);
    }

    return (
        <FAssetModal
            opened={opened}
            onClose={closeModal}
            closeOnClickOutside={false}
            centered
            size={650}
            title={t('mint_waiting_modal.title', { coinName: fAssetCoin.type })}
        >
            <FAssetModal.Body>
                <div>
                    <Text
                        className="text-32"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {t('mint_waiting_modal.step_title', { currentStep: currentStep < 2 ? currentStep : 2 })}
                    </Text>
                    <Text
                        className="text-16 mt-4"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t(`mint_waiting_modal.additional_info`, {
                            mintAmount: formatNumber(transferredAssetAmount!, fAssetCoin.decimals),
                            coinName: fAssetCoin.type
                        })}
                    </Text>
                    <Text
                        className="text-16 mt-4"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t(fAssetCoin.network.namespace === BTC_NAMESPACE && currentStep === 1
                            ? 'mint_waiting_modal.step_1_btc_title'
                            : `mint_waiting_modal.step_${currentStep}_title`, { coinName: fAssetCoin.type })
                        }
                    </Text>
                    <Progress
                        className="my-6"
                        radius="xl"
                        size="xl"
                        striped
                        animated
                        color="var(--mantine-color-black)"
                        value={currentStep * 50}
                    />
                    <Paper
                        radius="md"
                        className="p-5 mt-8 mb-4"
                        styles={{
                            root: {
                                backgroundColor: 'var(--flr-lightest-blue)'
                            }
                        }}
                    >
                        <Trans
                            i18nKey={`mint_waiting_modal.step_${currentStep}_description_label`}
                                values={{
                                value: formatNumber(transferredAssetAmount!, fAssetCoin.decimals),
                                    coinName: currentStep === 3  ? fAssetCoin.type : fAssetCoin.nativeName,
                                    amount: transferredAssetAmount
                                }}
                            components={{
                                bold: <strong />,
                                a: <Anchor
                                    underline="always"
                                    href={currentStep in externalLinks ? externalLinks[currentStep] : '#'}
                                    target="_blank"
                                    className="inline-flex"
                                    c="black"
                                    fw={500}
                                />,
                                icon: <IconArrowUpRight
                                    style={{ width: rem(20), height: rem(20) }}
                                    className="ml-1"
                                />
                            }}
                            parent={Text}
                            className="text-16"
                            fw={400}
                        />
                    </Paper>
                    {fAssetCoin.type.toLowerCase().includes('btc') && !fAssetCoin.network.mainnet &&
                        <Paper
                            radius="md"
                            className="flex items-center p-5 mt-8 my-4 bg-[var(--flr-lightest-orange)] whitespace-pre-line"
                        >
                            <IconExclamationCircle
                                size={25}
                                color="var(--flr-orange)"
                                className="mr-3 flex-shrink-0"
                            />
                            <div>
                                <Text
                                    className="text-16"
                                    c="var(--flr-orange)"
                                >
                                    {t('mint_waiting_modal.btc_confirmation_label')}
                                </Text>
                                {fAssetCoin.connectedWallet === WALLET.WALLET_CONNECT &&
                                    <Trans
                                        i18nKey="mint_waiting_modal.bifrost_note_label"
                                        components={{
                                            icon: <IconArrowUpRight
                                                style={{ width: rem(20), height: rem(20) }}
                                                color="var(--flr-orange)"
                                            />,
                                            a: <Anchor
                                                underline="always"
                                                href="https://support.bifrostwallet.com/en/articles/9814053-how-to-speed-up-or-cancel-transactions"
                                                target="_blank"
                                                className="inline-flex ml-1 text-amber-600"
                                                fw={700}
                                                c="var(--flr-orange)"
                                            />
                                        }}
                                        parent={Text}
                                        c="var(--flr-orange)"
                                        className="text-16 mt-3"
                                    />
                                }
                            </div>
                        </Paper>
                    }
                </div>
            </FAssetModal.Body>
        </FAssetModal>
    );
}
