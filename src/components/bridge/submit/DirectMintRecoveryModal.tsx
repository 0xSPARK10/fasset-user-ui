import React from "react";
import Link from "next/link";
import { Trans, useTranslation } from "react-i18next";
import { lighten, Loader, rem, Stepper, Text, Title } from "@mantine/core";
import { IconArrowUpRight, IconCircleCheck, IconSettings } from "@tabler/icons-react";
import FAssetModal from "@/components/modals/FAssetModal";
import FormAlert from "@/components/elements/FormAlert";
import ModalDivider from "@/components/elements/ModalDivider";
import WalletConnectOpenWalletCard from "@/components/cards/WalletConnectOpenWalletCard";
import XamanOpenWalletCard from "@/components/cards/XamanOpenWalletCard";
import FXrpFlareIcon from "@/components/icons/FXrpFlareIcon";
import { useDirectMintRecovery } from "@/components/bridge/submit/useDirectMintRecovery";
import { useWeb3 } from "@/hooks/useWeb3";
import { FASSET_COIN } from "@/config/coin";
import { SMART_ACCOUNTS_WEBSITE_URL, WALLET } from "@/constants";
import { truncateString } from "@/utils";
import FAssetButton from "@/components/elements/FAssetButton";

interface IDirectMintRecoveryModal {
    // The original (stuck) XRP payment — status is always polled with this hash
    xrplTxHash: string;
    // FXRP amount from the history row (display string); falls back to the backend's minted amount
    amount?: string;
    onClose: (isRecovering: boolean) => void;
}

/**
 * Releases the FXRP of a stuck direct mint & bridge: a second XRP payment with the backend's
 * recovery memo (0xE0). The FXRP goes to the Personal Account on Flare — no XRP refund, no
 * bridge retry. Logic in useDirectMintRecovery; this renders its phase (Figma): Review (amount,
 * Smart Account, fee) → Next signs → Confirm in your wallet → Recovering (a few minutes) →
 * Finished with a link to the FSA app.
 */
export default function DirectMintRecoveryModal({ xrplTxHash, amount, onClose }: IDirectMintRecoveryModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const {
        phase,
        xrplCoin,
        personalAccount,
        payer,
        isWrongWallet,
        fee,
        displayAmount,
        statusError,
        isRecoverySent,
        isSigning,
        errorMessage,
        recover,
    } = useDirectMintRecovery(xrplTxHash, amount);
    const fAssetType = FASSET_COIN.type;
    const close = () => onClose(isRecoverySent);

    const renderReview = () => (
        <div>
            <Title className="text-24 mb-3" fw={300} c="var(--flr-black)">
                {t("direct_mint_recovery_modal.review_title")}
            </Title>
            <Text className="text-14" fw={400} c="var(--flr-gray)">
                <Trans
                    i18nKey="direct_mint_recovery_modal.review_description"
                    values={{ amount: displayAmount ?? "", fAsset: fAssetType }}
                    components={{
                        fsa: <Link href={SMART_ACCOUNTS_WEBSITE_URL} target="_blank" className="inline-flex items-center underline" />,
                        icon: <IconArrowUpRight size={14} className="ml-0.5 flex-shrink-0" />,
                    }}
                />
            </Text>
            {displayAmount &&
                <>
                    <Text className="text-12 uppercase mt-5" c="var(--flr-gray)">
                        {t("direct_mint_recovery_modal.amount_label")}
                    </Text>
                    <div className="flex items-center gap-2">
                        <Text className="text-32" fw={300} c="var(--flr-black)">{displayAmount}</Text>
                        <FXrpFlareIcon width="24" height="24" className="flex-shrink-0" />
                        <Text className="text-16" c="var(--flr-gray)">{fAssetType}</Text>
                    </div>
                </>
            }
            {/* The user pays this — not in the design, but they sign an XRP payment */}
            <Text className="text-12 uppercase mt-5" c="var(--flr-gray)">
                {t("direct_mint_recovery_modal.payment_label")}
            </Text>
            <Text className="text-14" fw={400} c="var(--flr-black)">
                {fee} {FASSET_COIN.nativeName}
            </Text>
            <ModalDivider mb={personalAccount || isWrongWallet || errorMessage ? undefined : 40} />
            {personalAccount &&
                <>
                    <Text className="text-12 uppercase" c="var(--flr-gray)">
                        {t("direct_mint_recovery_modal.personal_account_label")}
                    </Text>
                    <Text className="text-14 break-all" fw={400} c="var(--flr-black)">
                        {personalAccount}
                    </Text>
                </>
            }
            {isWrongWallet &&
                <FormAlert
                    type="warning"
                    className="mt-5"
                    message={t("direct_mint_recovery_modal.wrong_wallet_label", { address: truncateString(payer ?? "", 6, 6) })}
                />
            }
            {errorMessage &&
                <FormAlert type="error" className="mt-5" message={errorMessage} />
            }
            {/* Only with something between the two lines — two dividers in a row leave an empty band */}
            {(personalAccount || isWrongWallet || errorMessage) && <ModalDivider mb={40} />}
            <FAssetButton
                onClick={recover}
                disabled={!xrplCoin?.address || isWrongWallet}
                fullWidth
                className="mb-1"
            >
                {t("direct_mint_recovery_modal.next_button")}
            </FAssetButton>
        </div>
    );

    const renderConfirm = () => (
        <div>
            <Title className="text-24" fw={300} c="var(--flr-black)">
                {t("bridge_modal.confirm_step_title")}
            </Title>
            <Stepper className="mt-5" active={0} iconSize={32} size="sm" orientation="vertical" classNames={{ stepDescription: "max-w-[300px]" }}>
                <Stepper.Step
                    label={<Text className="text-14" fw={500} c="var(--flr-black)">{t("direct_mint_recovery_modal.title", { fAsset: fAssetType })}</Text>}
                    description={
                        <Text className="text-12" fw={400} c={lighten("var(--flr-gray)", 0.378)}>
                            {t("direct_mint_recovery_modal.confirm_step_description", { fAsset: fAssetType })}
                        </Text>
                    }
                    icon={<IconSettings size={16} />}
                    loading
                />
            </Stepper>
            {xrplCoin?.connectedWallet === WALLET.WALLET_CONNECT &&
                <>
                    <ModalDivider />
                    <WalletConnectOpenWalletCard />
                </>
            }
            {xrplCoin?.connectedWallet === WALLET.XAMAN &&
                <XamanOpenWalletCard />
            }
        </div>
    );

    const renderWaiting = (title: string, text: string) => (
        <div>
            <Title className="text-24 mb-5" fw={300} c="var(--flr-black)">{title}</Title>
            <div className="flex items-center pb-5">
                <Loader className="mr-3 flex-shrink-0" />
                <Text size="sm" c="var(--flr-black)">{text}</Text>
            </div>
        </div>
    );

    const renderFinished = () => (
        <div>
            <Title className="text-24 mb-5" fw={300} c="var(--flr-black)">
                {t("bridge_modal.finished_modal.title")}
            </Title>
            <div className="flex items-center">
                <IconCircleCheck color="var(--flr-black)" className="mr-3 flex-shrink-0" style={{ width: rem(40), height: rem(40) }} />
                <Text c="var(--flr-black)" className="text-16" fw={400}>
                    <Trans
                        i18nKey="direct_mint_recovery_modal.recovered_label"
                        values={{ fAsset: fAssetType }}
                        components={{
                            account: personalAccount
                                ? <Link href={`${mainToken?.network?.explorerAddressUrl}/${personalAccount}`} target="_blank" className="inline-flex items-center underline" />
                                : <span />,
                            icon: personalAccount ? <IconArrowUpRight size={14} className="ml-0.5 flex-shrink-0" /> : <></>,
                        }}
                    />
                </Text>
            </div>
            <ModalDivider mb={40} />
            <FAssetButton
                component="a"
                href={SMART_ACCOUNTS_WEBSITE_URL}
                target="_blank"
                onClick={close}
                fullWidth
                className="mb-1"
            >
                {t("direct_mint_recovery_modal.open_fsa_button")}
            </FAssetButton>
        </div>
    );

    // Nothing to recover (bridged after all, failed, or no status) — text + OK
    const renderResult = (text: string) => (
        <div>
            <Text c="var(--flr-black)" className="text-16" fw={400}>{text}</Text>
            <ModalDivider mb={40} />
            <FAssetButton onClick={close} fullWidth className="mb-1">
                {t("bridge_modal.finished_modal.confirm_button")}
            </FAssetButton>
        </div>
    );

    return (
        <FAssetModal
            opened
            onClose={close}
            centered
            size="lg"
            title={t("direct_mint_recovery_modal.title", { fAsset: fAssetType })}
        >
            <FAssetModal.Body>
                {phase === "loading" && renderWaiting(t("direct_mint_recovery_modal.review_title"), t("direct_mint_recovery_modal.loading_label"))}
                {phase === "recoverable" && (isSigning ? renderConfirm() : renderReview())}
                {phase === "processing" && renderWaiting(t("direct_mint_recovery_modal.processing_title"), t("direct_mint_recovery_modal.processing_label"))}
                {phase === "recovered" && renderFinished()}
                {phase === "executed" && renderResult(t("direct_mint_recovery_modal.executed_label"))}
                {phase === "error" && renderResult(t("bridge_modal.direct_mint_error_label", { error: statusError }))}
                {phase === "unavailable" && renderResult(t("direct_mint_recovery_modal.unavailable_label"))}
            </FAssetModal.Body>
        </FAssetModal>
    );
}
