import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Grid, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { GetServerSideProps } from "next";
import classes from "@/styles/pages/Mint.module.scss";
import { IS_MAINNET } from "@/constants";
import { CoinEnum } from "@/types";
import BridgeChainPicker from "@/components/bridge/picker/BridgeChainPicker";
import BridgeFormPanel from "@/components/bridge/form/BridgeFormPanel";
import BridgeMobile from "@/components/bridge/form/BridgeMobile";
import { useBridgePageState } from "@/components/bridge/state/useBridgePageState";
import { useBridgeDeeplink } from "@/components/bridge/state/useBridgeDeeplink";
import BridgeTransactionsCard from "@/components/cards/TransactionsCard/BridgeTransactionsCard";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";
import BridgeRecoveryNotice from "@/components/bridge/BridgeRecoveryNotice";
import { BRIDGE_FORM_COL_STYLE, BRIDGE_WIDE_QUERY } from "@/components/bridge/layout";
import BridgeConfirmModal from "@/components/bridge/submit/BridgeConfirmModal";
import MintConfirmModal from "@/components/bridge/submit/MintConfirmModal";
import DirectMintBridgeConfirmModal from "@/components/bridge/submit/DirectMintBridgeConfirmModal";
import RedeemConfirmModal from "@/components/bridge/submit/RedeemConfirmModal";
import HyperCoreTransferConfirmModal from "@/components/bridge/submit/HyperCoreTransferConfirmModal";
import { showErrorNotification } from "@/hooks/useNotifications";
import FAssetButton from "@/components/elements/FAssetButton";

// One page for every way FXRP moves: pick FROM and TO, the pair resolves to a route
// (config/bridgeRoutes.tsx) and the right side runs it. Works without a wallet — the CTA connects.
export default function Bridge() {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isWide = useMediaQuery(BRIDGE_WIDE_QUERY);
    const state = useBridgePageState();
    // Form ↔ URL: a link from another app (e.g. Stargate) opens the page filled in
    useBridgeDeeplink(state);
    const [latestTransactionCardKey, setLatestTransactionCardKey] = useState<number>(0);

    // The CTA's payload opens the route's confirm modal; cleared when that modal is done
    const [payload, setPayload] = useState<BridgeSubmitPayload>();
    const onSubmit = (next: BridgeSubmitPayload) => setPayload(next);

    // Pre-broadcast failure: back to the form with the message on top, amount kept
    const onConfirmError = (message?: string) => {
        setPayload(undefined);
        // Some paths have no message (undecodable revert) — never close without feedback
        state.setSubmitError(message || t("bridge_page.submit_failed_label"));
    };
    const onConfirmClose = (success: boolean) => {
        setPayload(undefined);
        state.resetForm();
        if (!success) return;
        // Amount clears at once (no second submit of the same amount); the refetches wait
        state.onSubmitSuccess();
        setTimeout(() => setLatestTransactionCardKey(key => key + 1), 1000);
    };

    return (
        <Container fluid className={`${classes.container} mt-8`}>
            <Title fw={300} className="text-32 mt-5">
                {t('bridge.title')}
            </Title>
            {/* Funds left on the bridge account by a failed bridge → XRPL — above the whole form */}
            <BridgeRecoveryNotice className="mt-5" />
            {isMobile
                ? <BridgeMobile className="mt-5" state={state} onSubmit={onSubmit} />
                : <Grid gutter="xl" className="mt-5">
                    <Grid.Col span={isWide ? "auto" : 12}>
                        <BridgeChainPicker state={state} />
                    </Grid.Col>
                    <Grid.Col span={isWide ? "content" : 12} style={isWide ? BRIDGE_FORM_COL_STYLE : undefined}>
                        <BridgeFormPanel state={state} onSubmit={onSubmit} stacked={!isWide} />
                    </Grid.Col>
                </Grid>
            }
            <BridgeConfirmModal
                payload={payload?.kind === "bridge" ? payload : undefined}
                onError={onConfirmError}
                onDeliveryFailed={message => showErrorNotification(message || t("bridge_page.delivery_failed_label"))}
                onClose={onConfirmClose}
            />
            <RedeemConfirmModal
                payload={payload?.kind === "redeem" ? payload : undefined}
                onError={onConfirmError}
                onClose={onConfirmClose}
            />
            <MintConfirmModal
                payload={payload?.kind === "mint" ? payload : undefined}
                onError={onConfirmError}
                onClose={onConfirmClose}
            />
            <DirectMintBridgeConfirmModal
                payload={payload?.kind === "directMintBridge" ? payload : undefined}
                onError={onConfirmError}
                onDeliveryFailed={message => showErrorNotification(message || t("bridge_page.delivery_failed_label"))}
                onClose={onConfirmClose}
            />
            <HyperCoreTransferConfirmModal
                payload={payload?.kind === "hyperCoreTransfer" ? payload : undefined}
                onError={onConfirmError}
                onClose={onConfirmClose}
            />
            <Title fw={300} className="mt-10 text-32">
                {t('bridge.latest_transactions_title')}
            </Title>
            <div className="block sm:flex items-center justify-between mb-5 max-w-[1080px]">
                <Title fw={300} className="text-18">
                    {t('bridge.latest_transactions_subtitle')}
                </Title>
                <FAssetButton
                    variant="secondary"
                    onClick={() => setLatestTransactionCardKey(latestTransactionCardKey + 1)}
                    className="mt-2 sm:mt-0"
                >
                    {t('dashboard.refresh_button')}
                </FAssetButton>
            </div>
            <BridgeTransactionsCard refreshKey={latestTransactionCardKey} />
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    if ((process.env.NETWORK === 'testnet' && process.env.TESTNET_CHAIN !== CoinEnum.C2FLR) || (IS_MAINNET && process.env.MAINNET_CHAIN !== CoinEnum.FLR)) {
        return {
            notFound: true,
        };
    }

    return {
        props: {},
    };
};
