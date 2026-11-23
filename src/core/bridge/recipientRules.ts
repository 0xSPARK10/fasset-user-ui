import type { BridgeRecipientKind } from "@/config/bridgeRoutes";
import type { IMintRecipientValues } from "./types";

// Recipient of the bridge page — who receives on the destination chain. Pure functions, the
// page state (useBridgeRecipient / useBridgePageState) feeds them.

interface ITypedRecipientInput {
    recipientKind: BridgeRecipientKind;
    mintValues: Pick<IMintRecipientValues, "destinationAddress">;
    customRecipient?: string;
    toWalletAddress?: string;
}

// An address the user typed while no wallet was connected — connecting one later must not
// silently replace it (the old forms only auto-filled an empty field)
export function hasTypedRecipient({ recipientKind, mintValues, customRecipient, toWalletAddress }: ITypedRecipientInput): boolean {
    if (recipientKind !== "evm_or_tag") return customRecipient !== undefined;
    return mintValues.destinationAddress !== "" && mintValues.destinationAddress !== toWalletAddress;
}

interface IRecipientAddressInput {
    recipientKind: BridgeRecipientKind;
    isRecipientOpen: boolean;
    toWalletAddress?: string;
    mintRecipientAddress?: string;
    customRecipient?: string;
}

// Address that receives on the destination; undefined = missing or not valid yet
export function resolveRecipientAddress({ recipientKind, isRecipientOpen, toWalletAddress, mintRecipientAddress, customRecipient }: IRecipientAddressInput): string | undefined {
    if (!isRecipientOpen) return toWalletAddress;
    // Mint keeps its destination in the mint form (what mint/ConfirmStepper reads)
    if (recipientKind === "evm_or_tag") return mintRecipientAddress;
    return customRecipient;
}

interface IRecipientValidInput {
    recipientKind: BridgeRecipientKind;
    isRecipientOpen: boolean;
    recipientAddress?: string;
    toWalletAddress?: string;
    isDestinationTagValid: boolean;
    mint: { isValid: boolean; isAddressTagLoading: boolean };
}

export function isRecipientValid({ recipientKind, isRecipientOpen, recipientAddress, toWalletAddress, isDestinationTagValid, mint }: IRecipientValidInput): boolean {
    if (recipientKind === "none") return true;
    if (recipientKind !== "evm_or_tag") return !!recipientAddress && isDestinationTagValid;
    // MintForm blocks while the own-tag lookup runs, and on an invalid address
    if (isRecipientOpen) return mint.isValid;
    return !!toWalletAddress && !mint.isAddressTagLoading;
}
