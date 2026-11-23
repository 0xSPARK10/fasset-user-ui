import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDirectMintStatus } from "@/api/directMint";
import { OFT_KEY } from "@/api/oft";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useWeb3 } from "@/hooks/useWeb3";
import { useXrplPayment, xrplPaymentError } from "@/components/bridge/submit/useXrplPayment";
import { useDirectMintRecoveryStore } from "@/store/directMintRecovery";
import { DIRECT_MINT_FINAL_STATUSES, deriveRecoveryPhase, recoveryMemoOf } from "@/core/bridge";
import { FASSET_COIN } from "@/config/coin";
import { formatNumber } from "@/utils";
import { createLogger } from "@/utils/debug";

const log = createLogger('DIRECT_MINT_BRIDGE').child('RECOVERY');

const POLL_INTERVAL = 10000;

/**
 * State of one stuck direct mint & bridge's recovery: the smart status polled by the original
 * XRPL hash, the phase it maps to, and `recover()` — the 0xE0 payment from the payload.
 * DirectMintRecoveryModal only renders it.
 */
export function useDirectMintRecovery(xrplTxHash: string, amount?: string) {
    const { t } = useTranslation();
    const { getConnectedCoin } = useWeb3();
    const xrplCoin = getConnectedCoin(FASSET_COIN.type);
    const { pay } = useXrplPayment(xrplCoin);

    const [isSigning, setIsSigning] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    // Survives closing the modal and wallet / network changes — no second payment while the backend
    // has not seen the first
    const recoveryTxHash = useDirectMintRecoveryStore(state => state.sent[xrplTxHash]);
    const markRecoverySent = useDirectMintRecoveryStore(state => state.markSent);

    const status = useDirectMintStatus(xrplTxHash, true, data => {
        log.log('status:', { xrplTxHash, status: data?.status ?? '404', payload: data?.payload?.type });
        return DIRECT_MINT_FINAL_STATUSES.includes(data?.status ?? "") ? false : POLL_INTERVAL;
    });

    const phase = deriveRecoveryPhase(status.data, {
        isFetched: status.isFetched,
        isError: status.isError,
        isRecoverySent: !!recoveryTxHash,
    });
    const recoveryMemo = recoveryMemoOf(status.data);
    const payer = status.data?.payment?.transaction_account;

    // Recovered: refresh the bridge history right away — the stuck row changes or disappears
    const queryClient = useQueryClient();
    useEffect(() => {
        if (phase === "recovered") void queryClient.invalidateQueries({ queryKey: [OFT_KEY.FULL_HISTORY] });
    }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

    const recover = async () => {
        if (!recoveryMemo || isSigning || recoveryTxHash) return;
        setIsSigning(true);
        setErrorMessage(undefined);
        try {
            log.log('recovery payment:', { destination: recoveryMemo.payment_address, drops: recoveryMemo.amount.exact, memo: recoveryMemo.memo });
            // Exactly what the payload says — the memo is not rebuilt, the mint amount not resent
            const txHash = await pay({
                destination: recoveryMemo.payment_address,
                drops: String(recoveryMemo.amount.exact),
                memo: recoveryMemo.memo,
            });
            log.log('recovery tx hash:', txHash);
            markRecoverySent(xrplTxHash, txHash);
        } catch (error: any) {
            log.error('recovery payment failed:', error);
            const { kind, message } = xrplPaymentError(error, t);
            if (kind === "ledger") showErrorNotification(message);
            else setErrorMessage(message);
        } finally {
            setIsSigning(false);
        }
    };

    const mintedAmount = status.data?.action?.amount;

    return {
        phase,
        xrplCoin,
        // Where the FXRP is released (on Flare)
        personalAccount: status.data?.action?.personal_account,
        // XRPL address that paid — the recovery must come from the same wallet
        payer,
        isWrongWallet: !!payer && !!xrplCoin?.address && payer !== xrplCoin.address,
        // XRP the recovery payment costs
        fee: recoveryMemo ? formatNumber(recoveryMemo.amount.value, 6, "en-US", 2) : undefined,
        // The amount the box / row showed (history), else what the backend minted
        displayAmount: amount ?? (mintedAmount ? formatNumber(mintedAmount.value, 6, "en-US", 2) : undefined),
        statusError: status.data?.error ?? "",
        isRecoverySent: !!recoveryTxHash,
        isSigning,
        errorMessage,
        recover,
    };
}
