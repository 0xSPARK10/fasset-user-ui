import React from "react";
import { Paper } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import BridgeAddress from "@/components/bridge/picker/BridgeAddress";
import BridgeChainList from "@/components/bridge/picker/BridgeChainList";
import BridgeCustomLink from "@/components/bridge/form/BridgeCustomLink";
import BridgeRecipientField from "@/components/bridge/form/BridgeRecipientField";
import BridgeDestinationTagField from "@/components/bridge/form/BridgeDestinationTagField";
import { IBridgePageState } from "@/components/bridge/state/useBridgePageState";

// TO column content width (px) from which the destination tag sits next to the address / input
const TAG_INLINE_MIN_WIDTH = 265;
// Column content width (px) below which the 9+8 address + copy icon no longer fits → 6+6
const ADDRESS_FULL_MIN_WIDTH = 180;

interface IBridgeChainPicker {
    state: IBridgePageState;
    className?: string;
}

// Desktop left side. FROM is picked first; the TO column stays locked until then and only
// offers the chains `BRIDGE_ROUTES` can reach from the picked source. "Custom" swaps the
// TO address for the recipient input, "Remove" swaps it back.
export default function BridgeChainPicker({ state, className }: IBridgeChainPicker) {
    const { t } = useTranslation();
    const { from, to, fromAccount, toAccount, balances } = state;
    // XRPL destination tag next to the address / input (Figma) while the TO column fits both
    // (recipient input + gap + 80px tag); a narrower column puts it below. 0 = not measured yet.
    const { ref: toColumnRef, width: toColumnWidth } = useElementSize();
    const isTagInline = toColumnWidth === 0 || toColumnWidth >= TAG_INLINE_MIN_WIDTH;
    // FROM and TO columns are equally wide, so the TO measurement serves both addresses
    const isAddressCompact = toColumnWidth > 0 && toColumnWidth < ADDRESS_FULL_MIN_WIDTH;
    const tagField = to && state.recipientKind === 'xrpl' &&
        <BridgeDestinationTagField
            key={`tag-${to}-${state.tagFieldKey}`}
            initialValue={state.linkPrefill.tag}
            onEdit={state.onLinkTagEdit}
            className={isTagInline ? "w-20 flex-shrink-0" : "mt-3"}
            onChange={state.onDestinationTagChange}
        />;

    return (
        <Paper withBorder radius={2} className={className}>
            <div className="border-b border-[var(--flr-border-color)]">
                {/* Two equal columns like the lists below, so FROM / TO line up with their rows */}
                <div className="relative grid grid-cols-2">
                    <div className="min-w-0 p-6">
                        <BridgeAddress
                            label={t('bridge_page.from_label')}
                            address={fromAccount?.address}
                            isCompact={isAddressCompact}
                            // A picked source without its wallet → "No address" (the CTA connects it)
                            emptyLabel={from && !state.hasSourceWallet ? t('bridge_page.no_address_label') : undefined}
                        />
                    </div>
                    {/* Offset = top padding + label row + gap, so the arrow sits on the address /
                        input line even when a validation error grows the TO column */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-[45px] h-8 flex items-center">
                        <ArrowRightIcon />
                    </div>
                    <div ref={toColumnRef} className="min-w-0 p-6">
                        <div className={isTagInline ? "flex gap-2 items-start justify-between" : undefined}>
                            {to && state.isRecipientOpen
                                ? <BridgeRecipientField
                                    key={`recipient-${to}-${state.recipientFieldKey}`}
                                    chain={to}
                                    initialValue={state.linkPrefill.recipient}
                                    onEdit={state.onLinkRecipientEdit}
                                    onChange={state.onRecipientChange}
                                    onRemove={state.onRecipientRemove}
                                    autoFocus={state.isRecipientOpenedByUser}
                                />
                                : <BridgeAddress
                                    label={t('bridge_page.to_label')}
                                    address={toAccount?.address}
                                    isCompact={isAddressCompact}
                                    // Same wallet as FROM on these routes — one "Connect wallet" (FROM) is enough
                                    emptyLabel={to && !toAccount?.address ? t('bridge_page.no_address_label') : undefined}
                                    action={state.canOpenCustomRecipient && <BridgeCustomLink onClick={state.openCustomRecipient} />}
                                />
                            }
                            {isTagInline && tagField}
                        </div>
                        {!isTagInline && tagField}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="py-3 px-6">
                    <BridgeChainList
                        value={from}
                        onChange={state.onFromChange}
                        balances={balances.display}
                        isPaused={state.isPaused}
                        getBlockReason={state.getFromBlockReason}
                    />
                </div>
                <div className="py-3 px-6">
                    <BridgeChainList
                        isDestination
                        sourceChain={from}
                        value={to}
                        onChange={state.onToChange}
                        balances={balances.display}
                        isPaused={state.isPaused}
                        getBlockReason={state.getToBlockReason}
                    />
                </div>
            </div>
        </Paper>
    );
}
