import React, { useEffect, useState } from "react";
import { Paper, Progress, Text, Button, lighten } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useInterval } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useCrEvent, useCrStatus } from "@/api/minting";
import { useCancelCollateralReservation } from "@/hooks/useContracts";
import { toNumber } from "@/utils";
import { ICrStatus, IFAssetCoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { WALLET } from "@/constants";
import { showErrorNotification } from "@/hooks/useNotifications";

interface IHandshakeCard {
    fAssetCoin: IFAssetCoin;
    txHash: string;
    assetManagerAddress: string;
    onClose: () => void;
    accepted: (crStatus: ICrStatus) => void;
    onRejected: () => void;
}

const CR_STATUS_FETCH_INTERVAL = 5000; // 5s
const CR_STATUS_FETCH_INTERVAL_TTL = 60000; // 1min

export default function HandshakeCard({ fAssetCoin, txHash, assetManagerAddress, onClose, accepted, onRejected } : IHandshakeCard) {
    const [collateralReservationId, setCollateralReservationId] = useState<string>();
    const [crStatusProgress, setCrStatusProgress] = useState<number>(0);
    const [hasNoResponse, setHasNoResponse] = useState<boolean>(false);
    const [isRejected, setIsRejected] = useState<boolean>(false);

    const crEvent = useCrEvent(fAssetCoin.type, txHash);
    const crStatus = useCrStatus(collateralReservationId ?? '', false);
    const cancelCollateralReservation = useCancelCollateralReservation();
    const { t } = useTranslation();
    const { mainToken, walletConnectConnector } = useWeb3();

    const crStatusInterval = useInterval(async () => {
        const response = await crStatus.refetch();
        setCrStatusProgress((seconds) => seconds + CR_STATUS_FETCH_INTERVAL);
        if (cancelCollateralReservation.isPending || !response?.data || !('accepted' in response.data)) return;

        if (response.data?.accepted) {
            accepted(response.data as ICrStatus);
        } else {
            setIsRejected(true);
        }
    }, CR_STATUS_FETCH_INTERVAL);


    useEffect(() => {
        if (isRejected) {
            onRejected();
            crStatusInterval.stop();
        }
    }, [isRejected]);

    useEffect(() => {
        if (!crEvent.data) return;
        setCollateralReservationId(crEvent.data.collateralReservationId!);
    }, [crEvent.data]);

    useEffect(() => {
        if (!collateralReservationId) return;
        crStatusInterval.start();

        return crStatusInterval.stop;
    }, [collateralReservationId]);

    useEffect(() => {
        if (!hasNoResponse && crStatusProgress > CR_STATUS_FETCH_INTERVAL_TTL) {
            setHasNoResponse(true);
        }
    }, [crStatusProgress]);

    const onRejectCollateralReservation = async () => {
        try {
            await cancelCollateralReservation.mutateAsync({
                assetManagerAddress: assetManagerAddress,
                crtId: toNumber(collateralReservationId!)
            });
            crStatusInterval.stop();
            onClose();
        } catch (error: any) {
            if (error.cause === 'ledger') {
                showErrorNotification(error.message);
            }
        }
    }

    return (
        <Paper
            radius="lg"
            className="p-8 mt-8 mb-4"
            styles={{
                root: {
                    backgroundColor: isRejected ? 'var(--flr-lightest-orange)' : 'var(--flr-lightest-blue)'
                }
            }}
        >
            {!isRejected &&
                <>
                    {!cancelCollateralReservation.isPending &&
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {!hasNoResponse
                                ? t('handshake_card.request_under_review_label')
                                : t('handshake_card.request_no_response_label')
                            }
                        </Text>
                    }
                    {mainToken?.connectedWallet === WALLET.LEDGER && hasNoResponse &&
                        <>
                            {cancelCollateralReservation.isPending
                                ? <Text
                                    className="text-16"
                                    fw={400}
                                    c="var(--flr-black)"
                                >
                                    {t('handshake_card.ledger_confirm_transaction_label', {appName: mainToken?.network?.ledgerApp})}
                                </Text>
                                : <>
                                    <br/>
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-black)"
                                    >
                                        {t('handshake_card.launch_ledger_app_label', {appName: mainToken?.network?.ledgerApp})}
                                    </Text>
                                </>
                            }
                        </>
                    }
                </>
            }
            {!isRejected && cancelCollateralReservation.isPending && mainToken?.connectedWallet === WALLET.WALLET_CONNECT &&
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('handshake_card.confirm_cancel_label', { wallet: walletConnectConnector.connectedWallet })}
                </Text>
            }
            {!isRejected && !hasNoResponse &&
                <Progress
                    className="mt-6"
                    radius="xl"
                    size="xl"
                    striped
                    animated
                    color="var(--mantine-color-black)"
                    value={(crStatusProgress / CR_STATUS_FETCH_INTERVAL_TTL) * 100}
                    styles={{
                        root: {
                            backgroundColor: lighten('var(--flr-gray)', 0.3)
                        }
                    }}
                />
            }
            {!isRejected && hasNoResponse &&
                <Button
                    variant="filled"
                    color="black"
                    radius="xl"
                    size="sm"
                    fullWidth
                    className="hover:text-white font-normal mt-5"
                    onClick={onRejectCollateralReservation}
                    loading={cancelCollateralReservation.isPending}
                >
                    {t('handshake_card.cancel_button')}
                </Button>
            }
            {isRejected &&
                <div>
                    <div className="flex items-center">
                        <IconExclamationCircle
                            size={25}
                            color="var(--flr-orange)"
                            className="mr-3 flex-shrink-0"
                        />
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-orange)"
                        >
                            {t('handshake_card.request_agent_rejected_transaction_label')}
                        </Text>
                    </div>
                    <Button
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mt-5"
                        onClick={onClose}
                    >
                        {t('handshake_card.ok_button')}
                    </Button>
                </div>
            }
        </Paper>
    );
}
