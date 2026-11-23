import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Divider, rem, Stepper, Text, Title } from "@mantine/core";
import { IconCheck, IconCircleCheck, IconSettings } from "@tabler/icons-react";
import { isError } from "ethers";
import FAssetModal from "@/components/modals/FAssetModal";
import FAssetButton from "@/components/elements/FAssetButton";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";
import { useEvmToHyperCoreTransfer, useHyperCoreToEvmTransfer } from "@/hooks/useContracts";
import { useHyperCoreFxrpToken } from "@/api/hypercore";
import { useWeb3 } from "@/hooks/useWeb3";
import { BRIDGE_CHAIN, BRIDGE_ROUTE_CHAIN, WALLET } from "@/constants";
import { BRIDGE_FASSET_COIN, FASSET_COIN } from "@/config/coin";
import { devError } from "@/utils/debug";

interface IHyperCoreTransferConfirmModal {
    payload?: Extract<BridgeSubmitPayload, { kind: "hyperCoreTransfer" }>;
    // Rejected / failed before anything was sent — the page shows it as the top alert
    onError: (message: string) => void;
    // success = the transfer went out and the finished view was closed
    onClose: (success: boolean) => void;
}

/**
 * Confirm step of Hyperliquid ↔ HyperEVM: one signature (Hyperliquid → HyperEVM) or one
 * HyperEVM transaction (HyperEVM → Hyperliquid), then the finished view. Starts on open, except
 * with Ledger, which confirms through its card (only HyperEVM → Hyperliquid reaches here).
 */
export default function HyperCoreTransferConfirmModal({ payload: openPayload, onError, onClose }: IHyperCoreTransferConfirmModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    // The last payload stays rendered while the modal fades out — no flash of the other direction
    const lastPayload = useRef(openPayload);
    if (openPayload) lastPayload.current = openPayload;
    const payload = openPayload ?? lastPayload.current;
    const token = useHyperCoreFxrpToken(!!openPayload);
    const toEvm = useHyperCoreToEvmTransfer();
    const toCore = useEvmToHyperCoreTransfer();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    // Sent, but the confirmation could not be read — "check Latest transactions", not a failure
    const [isUnconfirmed, setIsUnconfirmed] = useState<boolean>(false);
    // One transfer per opening, also under Strict Mode's double effect
    const isRequestActive = useRef<boolean>(false);
    // Bumped on every opening / closing — a result from an earlier opening is ignored
    const attemptRef = useRef<number>(0);

    const isToEvm = payload?.route.from === BRIDGE_ROUTE_CHAIN.HYPER_CORE;
    const isLedger = mainToken?.connectedWallet === WALLET.LEDGER;
    const destination = t(`bridge_page.chains.${isToEvm ? 'hyper_evm' : 'hyper_core'}`);
    const fAsset = FASSET_COIN?.type;

    const transferErrorMessage = (error: unknown): string => {
        if (isError(error, 'ACTION_REJECTED')) return t('notifications.request_rejected_by_user_label');
        return error instanceof Error ? error.message : String(error);
    };

    const transfer = async () => {
        if (!openPayload || !payload || !token.data || isRequestActive.current) return;
        isRequestActive.current = true;
        const attempt = attemptRef.current;
        setIsLoading(true);
        try {
            const args = { amount: payload.amount, token: token.data };
            const result = isToEvm ? await toEvm.mutateAsync(args) : await toCore.mutateAsync(args);
            if (attempt !== attemptRef.current) return;
            setIsUnconfirmed(!!result?.unconfirmed);
            setIsFinished(true);
        } catch (error: any) {
            devError('hypercore transfer failed', error);
            if (attempt !== attemptRef.current) return;
            isRequestActive.current = false;
            onError(transferErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Every opening / closing starts a new attempt — a closed modal ignores the earlier result.
    // The finished view resets on opening only, so it stays visible while the modal fades out
    useEffect(() => {
        attemptRef.current += 1;
        isRequestActive.current = false;
        setIsLoading(false);
        if (openPayload) {
            setIsFinished(false);
            setIsUnconfirmed(false);
        }
    }, [openPayload]);

    useEffect(() => {
        if (!openPayload || isLedger || !token.data) return;
        transfer();
    }, [openPayload, token.data]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <FAssetModal
            opened={!!openPayload}
            // Closable at any time, like the other confirm modals — a wallet prompt that never
            // answers must not trap the user; the result of that attempt is then ignored
            onClose={() => onClose(isFinished)}
            centered
            size="lg"
            title={t('bridge_page.hypercore.title', { fAsset, destination })}
        >
            <FAssetModal.Body>
                {isFinished
                    ? <div className="px-0 sm:px-7">
                        <Title className="text-24" fw={300}>
                            {t(isUnconfirmed ? 'bridge_page.hypercore.unconfirmed_title' : 'bridge_page.hypercore.finished_title')}
                        </Title>
                        <div className="flex items-center mt-5">
                            <IconCircleCheck
                                color="var(--flr-black)"
                                className="mr-3 flex-shrink-0"
                                style={{ width: rem(40), height: rem(40) }}
                            />
                            <Text c="var(--flr-black)" className="text-16" fw={400}>
                                {t(isUnconfirmed ? 'bridge_page.hypercore.unconfirmed_description' : 'bridge_page.hypercore.finished_description', { amount: payload?.amount, fAsset, destination })}
                            </Text>
                        </div>
                        <Divider className="mt-8 mb-10" classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }} />
                        <FAssetButton onClick={() => onClose(true)} fullWidth className="hover:text-white mb-1">
                            {t('bridge_modal.finished_modal.confirm_button')}
                        </FAssetButton>
                    </div>
                    : <div>
                        <Stepper active={0} orientation="vertical" size="sm">
                            <Stepper.Step
                                label={
                                    <Text className="text-14" fw={500} c="var(--flr-black)">
                                        {t('bridge_page.hypercore.step_label', { fAsset, destination })}
                                    </Text>
                                }
                                description={
                                    <Text className="text-12" fw={400} c="var(--flr-gray)">
                                        {t(isToEvm ? 'bridge_page.hypercore.step_sign_description' : 'bridge_page.hypercore.step_tx_description', { fAsset })}
                                    </Text>
                                }
                                icon={<IconSettings size={16} />}
                                completedIcon={<IconCheck size={16} color="var(--flr-black)" />}
                                loading={isLoading || token.isLoading}
                            />
                        </Stepper>
                        {mainToken?.connectedWallet === WALLET.WALLET_CONNECT &&
                            <>
                                <Divider className="my-8" classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }} />
                                <WalletConnectOpenWalletCard />
                            </>
                        }
                        {isLedger &&
                            <>
                                <Divider className="my-8" classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }} />
                                <LedgerConfirmTransactionCard
                                    appName={BRIDGE_FASSET_COIN[BRIDGE_CHAIN.HYPER_EVM]?.network?.ledgerApp!}
                                    onClick={transfer}
                                    isLoading={isLoading}
                                    isDisabled={isLoading || !token.data}
                                />
                            </>
                        }
                    </div>
                }
            </FAssetModal.Body>
        </FAssetModal>
    );
}
