import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Divider, lighten, Loader, rem, Stepper, Text, Title } from "@mantine/core";
import { IconCheck, IconCircleCheck, IconSettings } from "@tabler/icons-react";
import { isMobile } from "react-device-detect";
import FAssetModal from "@/components/modals/FAssetModal";
import FormAlert from "@/components/elements/FormAlert";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import XamanOpenWalletCard from "@/components/cards/XamanOpenWalletCard";
import { useDirectMintRequest } from "@/api/directMint";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useXrplPayment, xrplPaymentError } from "@/components/bridge/submit/useXrplPayment";
import { useWeb3 } from "@/hooks/useWeb3";
import { directMintDestinationEid } from "@/config/bridgeRoutes";
import { FASSET_COIN } from "@/config/coin";
import { getWalletId, IS_MAINNET, WALLET } from "@/constants";
import { IDirectMintRequestResult, IFAssetCoin } from "@/types";
import { formatNumber, parseUnits } from "@/utils";
import { createLogger } from "@/utils/debug";
import { isDirectMintQuoteWorse } from "@/core/bridge";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";
import { useDirectMintBridgeTracking } from "@/components/bridge/submit/useDirectMintBridgeTracking";
import FAssetButton from "@/components/elements/FAssetButton";

const log = createLogger('DIRECT_MINT_BRIDGE');

interface IDirectMintBridgeConfirmModal {
    payload?: Extract<BridgeSubmitPayload, { kind: "directMintBridge" }>;
    // Before the payment (rejected, API) — the page shows it as the top alert
    onError: (message?: string) => void;
    // LayerZero delivery failed after the executor's send — the page shows a toast
    onDeliveryFailed: (message?: string) => void;
    // success = the XRP payment went out
    onClose: (success: boolean) => void;
}

/**
 * XRPL → Ethereum / HyperEVM / Hyperliquid in one XRP payment (direct mint & bridge). Asks the
 * smart-accounts backend for the payment (/direct_mint/request), lets the user sign it in the
 * XRPL wallet, then waits for the mint and the LayerZero delivery — one modal, as in Figma.
 */
export default function DirectMintBridgeConfirmModal({ payload, onError, onDeliveryFailed, onClose }: IDirectMintBridgeConfirmModal) {
    const { t } = useTranslation();
    const { getConnectedCoin } = useWeb3();
    const xrplCoin = getConnectedCoin(FASSET_COIN.type) as IFAssetCoin | undefined;
    const route = payload?.route;

    const request = useDirectMintRequest();
    const { pay } = useXrplPayment(xrplCoin);

    const [quote, setQuote] = useState<IDirectMintRequestResult>();
    // The request differs from what the form showed — sign only after the user confirms again
    const [isQuoteChanged, setIsQuoteChanged] = useState<boolean>(false);
    const [isSigning, setIsSigning] = useState<boolean>(false);
    const [xrplTxHash, setXrplTxHash] = useState<string>();
    const isRequestActive = useRef<boolean>(false);
    // Bumped on reset — a /request still in flight when the modal closed must not go on to signing
    const runId = useRef<number>(0);

    const tracking = useDirectMintBridgeTracking(xrplTxHash, route);
    const destination = route ? t(`bridge_page.chains.${route.to}`) : "";

    const reset = () => {
        setQuote(undefined);
        setIsQuoteChanged(false);
        setIsSigning(false);
        setXrplTxHash(undefined);
        isRequestActive.current = false;
        runId.current += 1;
    };

    const close = () => {
        // Once the XRP is paid the transfer runs on without the modal
        const success = !!xrplTxHash;
        reset();
        onClose(success);
    };

    const fail = (message?: string) => {
        reset();
        onError(message);
    };

    const sign = async (result: IDirectMintRequestResult) => {
        if (isSigning) return;
        setIsSigning(true);
        const run = runId.current;
        try {
            // amount + total_fee in drops — BigInt, the backend may send them as numbers or strings
            const drops = (BigInt(String(result.amount.exact)) + BigInt(String(result.total_fee.exact))).toString();
            log.log('payment:', { destination: result.payment_address, drops, memo: result.memo });
            const txHash = await pay({ destination: result.payment_address, drops, memo: result.memo });
            log.log('xrpl tx hash:', txHash);
            // Closed while the wallet prompt was open: the payment went out, but this modal run is over
            // (the form was reset) — the transfer shows up in Latest transactions instead
            if (run !== runId.current) return;
            setXrplTxHash(txHash);
        } catch (error: any) {
            if (run !== runId.current) return;
            log.error('payment failed:', error);
            const { kind, message } = xrplPaymentError(error, t);
            if (kind === "ledger") {
                showErrorNotification(message);
                setIsSigning(false);
            } else {
                fail(message);
            }
        }
    };

    // On open: the authoritative payment from the backend
    useEffect(() => {
        if (!payload || !route || isRequestActive.current) return;
        isRequestActive.current = true;
        const run = runId.current;

        (async () => {
            try {
                const destinationEid = directMintDestinationEid(route, IS_MAINNET);
                if (!xrplCoin?.address || destinationEid === undefined) throw new Error(t("errors.transaction_failed_label"));
                const result = await request.mutateAsync({
                    xrplSourceAddress: xrplCoin.address,
                    amountUba: parseUnits(payload.amount, 6).toString(),
                    destination: route.to,
                    destinationEid,
                    evmRecipient: payload.evmRecipient,
                    walletId: getWalletId(xrplCoin?.connectedWallet),
                });
                // Closed meanwhile — no quote, no wallet prompt
                if (run !== runId.current) return;
                log.log('request:', result);
                setQuote(result);

                const changed = isDirectMintQuoteWorse(payload.preview, {
                    toReceive: result.to_receive?.value,
                    totalFee: result.total_fee.value,
                });
                setIsQuoteChanged(changed);
                if (changed) {
                    log.log('quote changed — confirm again:', {
                        preview: payload.preview,
                        request: { toReceive: result.to_receive?.value, totalFee: result.total_fee.value },
                    });
                }

                // Same as mint: Ledger and Xaman on mobile start from their own button
                const needsButton = xrplCoin?.connectedWallet === WALLET.LEDGER
                    || (xrplCoin?.connectedWallet === WALLET.XAMAN && isMobile);
                if (!changed && !needsButton) void sign(result);
            } catch (error: any) {
                if (run !== runId.current) return;
                log.error('request failed:', error?.response?.data ?? error);
                fail(error?.response?.data?.error ?? error?.response?.data?.message ?? error?.message);
            }
        })();
    }, [payload]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (tracking.phase === "delivery_failed") {
            reset();
            onDeliveryFailed(tracking.errorMessage);
            onClose(true);
        }
    }, [tracking.phase]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!payload || !route) return null;

    const finishedDescription = t("bridge_modal.finished_modal.description_chain_label", { fAsset: FASSET_COIN.type, bridgeType: destination });

    const stoppedMessage = tracking.phase === "memo_skipped"
        ? t("bridge_modal.direct_mint_memo_skipped_label")
        : tracking.phase === "awaiting_recovery"
            ? t("bridge_modal.direct_mint_recovery_needed_label")
            : tracking.phase === "error"
                ? t("bridge_modal.direct_mint_error_label", { error: tracking.errorMessage ?? "" })
                : undefined;

    const renderConfirm = () => (
        <div>
            <Title className="text-24" fw={300} c="var(--flr-black)">
                {t("bridge_modal.confirm_step_title")}
            </Title>
            {isQuoteChanged && quote &&
                <FormAlert
                    type="warning"
                    message={t("bridge_modal.direct_mint_quote_changed_label", {
                        total: formatNumber(payload.amount + quote.total_fee.value, 6, "en-US", 2),
                        receive: formatNumber(quote.to_receive?.value ?? 0, 6, "en-US", 2),
                    })}
                />
            }
            <Stepper className="mt-5" active={0} iconSize={32} size="sm" orientation="vertical" classNames={{ stepDescription: "max-w-[300px]" }}>
                <Stepper.Step
                    label={<Text className="text-14" fw={500} c="var(--flr-black)">{t("bridge_modal.direct_mint_step_label")}</Text>}
                    description={
                        <Text className="text-12" fw={400} c={lighten("var(--flr-gray)", 0.378)}>
                            {t("bridge_modal.direct_mint_step_description", { destination, fAsset: FASSET_COIN.type })}
                        </Text>
                    }
                    icon={<IconSettings size={16} />}
                    completedIcon={<IconCheck size={16} color="var(--flr-black)" />}
                    loading={!quote || isSigning}
                />
            </Stepper>
            {isQuoteChanged && quote &&
                <FAssetButton
                    onClick={() => { setIsQuoteChanged(false); void sign(quote); }}
                    fullWidth
                    className="mt-5"
                >
                    {t("bridge_modal.direct_mint_confirm_button")}
                </FAssetButton>
            }
            {quote && !isQuoteChanged && xrplCoin?.connectedWallet === WALLET.LEDGER &&
                <>
                    <Divider className="my-8" classNames={{ root: "mx-[-1rem] sm:mx-[-2.7rem]" }} />
                    <LedgerConfirmTransactionCard
                        appName={xrplCoin.network.ledgerApp!}
                        onClick={() => sign(quote)}
                        isLoading={isSigning}
                        isDisabled={isSigning}
                    />
                </>
            }
            {xrplCoin?.connectedWallet === WALLET.WALLET_CONNECT &&
                <>
                    <Divider className="my-8" classNames={{ root: "mx-[-1rem] sm:mx-[-2.7rem]" }} />
                    <WalletConnectOpenWalletCard />
                </>
            }
            {quote && !isQuoteChanged && xrplCoin?.connectedWallet === WALLET.XAMAN &&
                <XamanOpenWalletCard onClick={() => sign(quote)} confirmButton={isMobile} isLoading={isSigning} />
            }
        </div>
    );

    const renderWaiting = () => (
        <div>
            <Title order={4} fw={300}>{t("bridge_modal.waiting_modal.title")}</Title>
            <div className="flex items-center mt-5 pb-5">
                <Loader className="mr-3" />
                <Text size="sm" className="whitespace-pre-line">
                    {t("bridge_modal.waiting_modal.description_xrpl_label")}
                    {tracking.phase === "delayed" && tracking.delayedTo &&
                        `\n${t("bridge_modal.direct_mint_delayed_label", { time: new Date(tracking.delayedTo).toLocaleString() })}`
                    }
                </Text>
            </div>
        </div>
    );

    const renderResult = (text: string, isSuccess: boolean) => (
        <div>
            <Title className="text-24" fw={300}>
                {isSuccess ? t("bridge_modal.finished_modal.title") : t("bridge_modal.direct_mint_step_label")}
            </Title>
            <div className="flex items-center mt-5">
                {isSuccess &&
                    <IconCircleCheck color="var(--flr-black)" className="mr-3 flex-shrink-0" style={{ width: rem(40), height: rem(40) }} />
                }
                <Text c="var(--flr-black)" className="text-16" fw={400}>{text}</Text>
            </div>
            <Divider className="mt-8 mb-10" classNames={{ root: "mx-[-1rem] sm:mx-[-2.7rem]" }} />
            <FAssetButton onClick={close} fullWidth className="mb-1">
                {t("bridge_modal.finished_modal.confirm_button")}
            </FAssetButton>
        </div>
    );

    return (
        <FAssetModal
            opened={!!payload}
            onClose={close}
            centered
            size="lg"
            // While waiting the user may close — the transfer continues without the modal
            closeOnClickOutside={!!xrplTxHash}
            title={t("bridge_modal.direct_mint_title", { destination })}
        >
            <FAssetModal.Body>
                {!xrplTxHash
                    ? renderConfirm()
                    : tracking.phase === "delivered"
                        ? renderResult(finishedDescription, true)
                        : stoppedMessage
                            ? renderResult(stoppedMessage, false)
                            : renderWaiting()
                }
            </FAssetModal.Body>
        </FAssetModal>
    );
}
