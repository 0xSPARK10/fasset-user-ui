import React, { useRef, useState } from "react";
import RetryMintModal from "@/components/modals/RetryMintModal";
import { IUnderlyingTransactionData } from "./transactionTypes";

/**
 * "Try again" on a mint whose XRP payment is missing: the RetryMintModal and, per payment
 * reference, whether a retry was just sent (the button hides for 30 s). Shared by the Mint page
 * table and the bridge table.
 */
export function useRetryMint() {
    const [mintingTransaction, setMintingTransaction] = useState<{ [id: string]: boolean }>({});
    const [isRetryMintModalActive, setIsRetryMintModalActive] = useState<boolean>(false);
    const underlyingTransaction = useRef<IUnderlyingTransactionData>();

    const onRetryMintClick = (data: IUnderlyingTransactionData) => {
        underlyingTransaction.current = data;
        setIsRetryMintModalActive(true);
    };

    const retryMintModal = isRetryMintModalActive && underlyingTransaction.current
        ? <RetryMintModal
            opened={isRetryMintModalActive}
            onClose={(isMinting: boolean) => {
                setIsRetryMintModalActive(false);
                const id = underlyingTransaction.current?.paymentReference!;
                if (isMinting && id) {
                    setMintingTransaction(prev => ({ ...prev, [id]: true }));
                    setTimeout(() => {
                        setMintingTransaction(prev => ({ ...prev, [id]: false }));
                    }, 30000);
                }
                underlyingTransaction.current = undefined;
            }}
            underlyingTransaction={underlyingTransaction.current}
        />
        : null;

    return { mintingTransaction, onRetryMintClick, retryMintModal };
}
