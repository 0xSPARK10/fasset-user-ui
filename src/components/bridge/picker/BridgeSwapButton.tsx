import React from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { getBridgeRouteChain } from "@/config/bridgeRoutes";
import SwapVerticalIcon from "@/components/icons/SwapVerticalIcon";
import { IBridgePageState } from "@/components/bridge/state/useBridgePageState";

interface IBridgeSwapButton {
    state: IBridgePageState;
    // The submit closure already holds the route and amount — a swap now would open the confirm
    // modal for a route the form no longer shows
    isSending: boolean;
    // The mobile card closes its open chain list
    onAfterSwap?: () => void;
}

// FROM ↔ TO button on the divider between the two rows; the white box hides the line behind it.
// The parent row must be `relative`.
export default function BridgeSwapButton({ state, isSending, onAfterSwap }: IBridgeSwapButton) {
    const { t } = useTranslation();
    const fromChain = getBridgeRouteChain(state.from);
    const toChain = getBridgeRouteChain(state.to);
    const isEnabled = state.canSwap && !isSending;

    const swap = () => {
        // data-disabled (not `disabled`) keeps hover events for the tooltip, so the click is guarded here
        if (!isEnabled) return;
        state.onSwap();
        onAfterSwap?.();
    };

    // Left edge on the token label's left edge (row padding 24 + token icon 32 + gap 6), which puts
    // the arrow under the start of the label
    return (
        <div className="absolute left-[62px] -bottom-[17px] w-[34px] h-[34px] flex items-center justify-center bg-white z-[1]">
            <Tooltip
                label={state.swapBlockReason ?? t("bridge_page.swap_unsupported_label", {
                    // The reverse direction: TO becomes the source
                    from: toChain ? t(`bridge_page.chains.${toChain.labelKey}`) : "",
                    to: fromChain ? t(`bridge_page.chains.${fromChain.labelKey}`) : "",
                })}
                disabled={!state.isSwapUnsupported && !state.swapBlockReason}
                multiline
                w={260}
                events={{ hover: true, focus: true, touch: true }}
                withArrow
            >
                <ActionIcon
                    variant="transparent"
                    size={34}
                    aria-label={t("bridge_page.swap_button")}
                    data-disabled={!isEnabled || undefined}
                    aria-disabled={!isEnabled}
                    onClick={swap}
                    styles={{ root: { backgroundColor: "transparent" } }}
                    className="group"
                >
                    <SwapVerticalIcon
                        className={isEnabled
                            ? "text-[var(--flr-gray)] group-hover:text-[var(--flr-pink)]"
                            : "text-[var(--flr-gray)] opacity-40"}
                    />
                </ActionIcon>
            </Tooltip>
        </div>
    );
}
