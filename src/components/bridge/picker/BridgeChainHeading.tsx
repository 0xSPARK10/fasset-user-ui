import React from "react";
import { Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IBridgeRouteChain } from "@/config/bridgeRoutes";

interface IBridgeChainHeading {
    chain?: IBridgeRouteChain;
    subtitle?: React.ReactNode;
    // Shown while no chain is picked — desktop: "Not selected", mobile: "From" + "Not selected"
    emptyTitle?: string;
    emptySubtitle?: string;
}

// Figma: icon + text column side by side, gap 3n (6px); the subtitle sits under the
// token name, not under the icon.
export default function BridgeChainHeading({ chain, subtitle, emptyTitle, emptySubtitle }: IBridgeChainHeading) {
    const { t } = useTranslation();

    if (!chain) {
        return (
            <div className="flex items-center gap-1.5">
                <span className="block flex-shrink-0 w-8 h-8 rounded-full bg-[var(--flr-border-color)]" />
                <div className="flex flex-col min-w-0">
                    <Text className="text-14" fw={300}>
                        {emptyTitle ?? t("bridge_page.not_selected_label")}
                    </Text>
                    {emptySubtitle && (
                        <Text c="var(--flr-gray)" className="text-10">
                            {emptySubtitle}
                        </Text>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <span className="flex-shrink-0">{chain.icon({ width: "32", height: "32" })}</span>
            <div className="flex flex-col min-w-0">
                <Text className="text-16 truncate" c="var(--flr-shark)">
                    {chain.tokenSymbol}
                    <Text span c="var(--flr-gray)" fw={300} className="text-16 ml-1">
                        {t("bridge_page.on_chain_label", {
                            chain: t(`bridge_page.chains.${chain.labelKey}`),
                        })}
                    </Text>
                </Text>
                {subtitle && (
                    <Text c="var(--flr-gray)" className="text-10">
                        {subtitle}
                    </Text>
                )}
            </div>
        </div>
    );
}
