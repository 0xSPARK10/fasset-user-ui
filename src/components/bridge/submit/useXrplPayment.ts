import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useSignTransaction } from "@/hooks/useContracts";
import { XRP_NAMESPACE } from "@/config/networks";
import { ICoin } from "@/types";

export interface IXrplPayment {
    destination: string;
    // Drops as a decimal string
    drops: string;
    // Instruction memo (with or without 0x) — no DestinationTag
    memo: string;
}

/**
 * One XRP Payment with a memo, signed in the connected XRPL wallet (direct mint & bridge and its
 * recovery). Resolves with the tx hash; throws on any failure, including a wallet that returned
 * no hash — a payment without a hash cannot be tracked.
 */
export function useXrplPayment(xrplCoin: ICoin | undefined) {
    const { t } = useTranslation();
    const signTransaction = useSignTransaction(xrplCoin?.address ?? "");

    const pay = async ({ destination, drops, memo }: IXrplPayment): Promise<string> => {
        if (!xrplCoin?.address) throw new Error(t("errors.transaction_failed_label"));

        const response = await signTransaction.mutateAsync({
            network: xrplCoin.network,
            userAddress: xrplCoin.address,
            destination,
            amount: drops,
            paymentReference: memo.startsWith("0x") ? memo : `0x${memo}`,
        });
        const txHash: string | undefined = xrplCoin.network.namespace === XRP_NAMESPACE
            ? response?.tx_json?.hash
            : response?.txid;
        if (!txHash) throw new Error(t("errors.transaction_failed_label"));
        return txHash;
    };

    return { pay, isPending: signTransaction.isPending };
}

/**
 * A failed payment as the modals show it: rejected in the wallet, a Ledger message (a
 * notification — the user can try again on the device) or anything else.
 */
export function xrplPaymentError(error: any, t: TFunction): { kind: "rejected" | "ledger" | "other"; message: string } {
    if (error?.code === 4001) return { kind: "rejected", message: t("notifications.request_rejected_by_user_label") };
    if (error?.cause === "ledger") return { kind: "ledger", message: error.message };
    // Fireblocks errors carry an i18n key
    if (error instanceof Error && error.message.startsWith("fireblocks.")) return { kind: "other", message: t(error.message) };
    return { kind: "other", message: error?.response?.data?.message ?? error?.message ?? t("errors.transaction_failed_label") };
}
