import { useEffect, useState } from "react";
import type { BridgeRecipientKind } from "@/config/bridgeRoutes";
import { hasTypedRecipient, resolveRecipientAddress } from "@/core/bridge";
import { useMintRecipient } from "@/components/bridge/state/useMintRecipient";

interface IUseBridgeRecipient {
    recipientKind: BridgeRecipientKind;
    // The connected wallet's address on the TO chain
    toWalletAddress?: string;
}

/**
 * Who receives on the destination: the connected wallet, or an address the user typed. Mint
 * keeps the old destination model (address / minting tag + own tag) in its own form.
 */
export function useBridgeRecipient({ recipientKind, toWalletAddress }: IUseBridgeRecipient) {
    const [isCustomRecipient, setIsCustomRecipient] = useState<boolean>(false);
    const [customRecipient, setCustomRecipient] = useState<string>();
    const mintRecipient = useMintRecipient(recipientKind === 'evm_or_tag');

    const canCustomize = recipientKind !== 'none';
    const isTyped = hasTypedRecipient({ recipientKind, mintValues: mintRecipient.values, customRecipient, toWalletAddress });
    // Open when the user asked for it, from the start when no wallet is connected for the
    // destination chain (the address then has to be typed), or while a typed address is kept
    const isRecipientOpen = canCustomize && (isCustomRecipient || !toWalletAddress || isTyped);
    const recipientAddress = resolveRecipientAddress({
        recipientKind,
        isRecipientOpen,
        toWalletAddress,
        mintRecipientAddress: mintRecipient.recipientAddress,
        customRecipient,
    });

    // One source of truth: when the mint editor is not shown (closed, wallet connected, or the
    // route is no longer a mint), the mint destination is the wallet again
    useEffect(() => {
        if (recipientKind !== 'evm_or_tag' || !isRecipientOpen) mintRecipient.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipientKind, isRecipientOpen]);

    return {
        isCustomRecipient,
        isRecipientOpen,
        recipientAddress,
        mintRecipient,
        // "Change" link — only on routes that allow another recipient, while a wallet address is shown
        canOpenCustomRecipient: canCustomize && !!toWalletAddress && !isRecipientOpen,
        // Recipient checks still running (mint: own-tag lookup) — the CTA waits, shown as loading
        isRecipientLoading: recipientKind === 'evm_or_tag' && mintRecipient.isAddressTagLoading,
        // Back to the wallet; `isOpen`: a link's recipient opens the field
        reset: (isOpen = false) => {
            setIsCustomRecipient(isOpen);
            setCustomRecipient(undefined);
            mintRecipient.reset();
        },
        openCustomRecipient: () => setIsCustomRecipient(true),
        // Mint keeps its destination in the mint form (what mint/ConfirmStepper reads)
        onRecipientChange: (address: string | undefined) => recipientKind === 'evm_or_tag'
            ? mintRecipient.form.setFieldValue("destinationAddress", address ?? "")
            : setCustomRecipient(address),
    };
}
