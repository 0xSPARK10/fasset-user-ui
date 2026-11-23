import React, { ReactNode } from "react";
import { Text } from "@mantine/core";

export interface IRecoveryNoticeItem {
    key: string;
    icon: ReactNode;
    symbol: string;
    amount: string;
    // "Transfer" / "Recover" button, or a status text while it runs
    action: ReactNode;
}

interface IRecoveryNotice {
    // Grey header text
    header: ReactNode;
    items: IRecoveryNoticeItem[];
}

/**
 * Grey header + one box per item (icon, symbol, amount, action), stacked on mobile. Shared by
 * the bridge page's recovery notices (Asset Recovery, stuck direct mint & bridge).
 */
export default function RecoveryNotice({ header, items }: IRecoveryNotice) {
    return (
        // One element — the caller stacks notices with a gap, which must not split header and boxes
        <div>
            {/* Figma: neutrals/fills/lightest — no token for #F6F6F6 yet */}
            <div className="border border-[var(--flr-border-color)] bg-[#F6F6F6] px-6 py-3">
                <Text className="text-14" c="var(--flr-gray)">
                    {header}
                </Text>
            </div>
            {/* Every box draws its own border, so a short last row leaves the rest empty; the first
                box of each desktop row draws the left one */}
            <div className="grid grid-cols-1 md:grid-cols-3">
                {items.map(item =>
                    <div
                        key={item.key}
                        className="flex items-center gap-2.5 p-6 border-x border-b border-[var(--flr-border-color)] md:border-l-0 md:[&:nth-child(3n+1)]:border-l"
                    >
                        <div className="flex items-center gap-[5px] flex-1 min-w-0">
                            {item.icon}
                            <div className="flex flex-col min-w-0">
                                <Text className="text-12" c="var(--flr-gray)">
                                    {item.symbol}
                                </Text>
                                <Text className="text-14" fw={500} c="var(--flr-black)">
                                    {item.amount}
                                </Text>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {item.action}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
