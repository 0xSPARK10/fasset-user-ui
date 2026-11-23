import React from "react";
import { Text } from "@mantine/core";
import { truncateString } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";

interface IBridgeAddress {
    label: string;
    address?: string;
    action?: React.ReactNode;
    // Shown instead of "--" when there is no address (e.g. "No address" — wallet not connected)
    emptyLabel?: string;
    isCompact?: boolean;
}

// Address + copy — the desktop header row, and the line above the chain heading on mobile.
// 9+8 characters (~150px); `isCompact` cuts it to 6+6 for a narrow column.
export function BridgeWalletAddress({ address, className = "text-14", emptyLabel = "--", isCompact = false }: { address?: string; className?: string; emptyLabel?: string; isCompact?: boolean }) {
    if (!address) return <Text className={className}>{emptyLabel}</Text>;
    return (
        <div className="flex items-center gap-1">
            <Text className={className}>{isCompact ? truncateString(address, 6, 6) : truncateString(address, 9, 8)}</Text>
            <CopyIcon text={address} color="#AFAFAF" />
        </div>
    );
}

// One side of the FROM → TO header: the wallet that signs (FROM) or receives (TO). As wide as
// the address row, so the action ("Change") ends at the address's right edge (Figma).
export default function BridgeAddress({ label, address, action, emptyLabel, isCompact }: IBridgeAddress) {
    return (
        <div className="flex flex-col gap-[5px] w-fit max-w-full min-w-0">
            <div className="flex items-center justify-between gap-4 h-4">
                <Text c="var(--flr-gray)" className="text-12 uppercase">
                    {label}
                </Text>
                {action}
            </div>
            <div className="flex items-center gap-3 h-8">
                <BridgeWalletAddress address={address} emptyLabel={emptyLabel} isCompact={isCompact} />
            </div>
        </div>
    );
}
