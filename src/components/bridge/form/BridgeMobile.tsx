import React, { useState } from "react";
import { ActionIcon, Collapse, Paper, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { getBridgeRouteChain } from "@/config/bridgeRoutes";
import { BridgeRouteChain, IBridgeAccount } from "@/types";
import { FASSET_COIN } from "@/config/coin";
import AmountInput from "@/components/elements/AmountInput";
import BridgeSwapButton from "@/components/bridge/picker/BridgeSwapButton";
import BridgeChainHeading from "@/components/bridge/picker/BridgeChainHeading";
import BridgeSourceSubtitle from "@/components/bridge/picker/BridgeSourceSubtitle";
import BridgeChainList from "@/components/bridge/picker/BridgeChainList";
import BridgeCustomLink from "@/components/bridge/form/BridgeCustomLink";
import BridgeFormFooter from "@/components/bridge/form/BridgeFormFooter";
import BridgeRecipientField from "@/components/bridge/form/BridgeRecipientField";
import BridgeDestinationTagField from "@/components/bridge/form/BridgeDestinationTagField";
import { BridgeWalletAddress } from "@/components/bridge/picker/BridgeAddress";
import { useApplyAmountValidation, useBridgeAmountForm, useBridgeAmountLink } from "@/components/bridge/state/useBridgeAmountForm";
import FormAlert from "@/components/elements/FormAlert";
import { useBridgeRouteQuote } from "@/components/bridge/quotes/useBridgeRouteQuote";
import { useBridgeSubmit } from "@/components/bridge/submit/useBridgeSubmit";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";
import { IBridgePageState } from "@/components/bridge/state/useBridgePageState";
import { formatReceivedAmount } from "@/components/bridge/utils";

interface IBridgeMobile {
    state: IBridgePageState;
    onSubmit: (payload: BridgeSubmitPayload) => void;
    className?: string;
}

interface IChainSection {
    emptyTitle: string;
    chain?: BridgeRouteChain;
    account?: IBridgeAccount;
    subtitle?: React.ReactNode;
    addressAction?: React.ReactNode;
    // Above the heading — the custom recipient field on TO
    topSlot?: React.ReactNode;
    // Under the address / recipient field — the XRPL destination tag
    extraSlot?: React.ReactNode;
    // Right of the heading — amount input on FROM, received amount on TO
    rightSlot?: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    toggleDisabled?: boolean;
    list: React.ReactNode;
    // "No address" line when the chain is picked but its wallet is not connected
    emptyAddressLabel?: string;
    // FROM row: top-aligned — the amount input sits on the token name's line, "N available" below it
    alignTop?: boolean;
}

function ChainSection({
    emptyTitle,
    chain,
    account,
    subtitle,
    addressAction,
    topSlot,
    extraSlot,
    rightSlot,
    isOpen,
    onToggle,
    toggleDisabled,
    list,
    alignTop = false,
    emptyAddressLabel
}: IChainSection) {
    const { t } = useTranslation();
    const routeChain = getBridgeRouteChain(chain);

    return (
        <>
            {chain && !topSlot && (account?.address || emptyAddressLabel) && (
                // mr = chevron (28px) + gap (10px): the link ends where the input / amount ends (Figma)
                <div className="flex items-center justify-between mb-1.5 mr-[38px]">
                    <BridgeWalletAddress
                        address={account?.address}
                        className={account?.address ? "text-12" : "text-14"}
                        emptyLabel={emptyAddressLabel}
                    />
                    {addressAction}
                </div>
            )}
            {topSlot}
            {extraSlot}
            <div className={`flex gap-2.5 ${alignTop ? "items-start" : "items-center"}`}>
                <div className="flex-1 min-w-0">
                    <BridgeChainHeading
                        chain={routeChain}
                        subtitle={subtitle}
                        emptyTitle={emptyTitle}
                        emptySubtitle={t("bridge_page.not_selected_label")}
                    />
                </div>
                {rightSlot}
                <ActionIcon
                    variant="transparent"
                    color="var(--flr-pink)"
                    onClick={onToggle}
                    disabled={toggleDisabled}
                    aria-expanded={isOpen}
                    aria-label={emptyTitle}
                    className={`flex-shrink-0 disabled:bg-transparent ${alignTop ? "mt-1" : ""}`}
                >
                    <IconChevronDown
                        size={16}
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </ActionIcon>
            </div>
            <Collapse in={isOpen}>
                <div className="mt-4">{list}</div>
            </Collapse>
        </>
    );
}

// Mobile bridge card: one column, FROM and TO are dropdowns (closed by default) that
// open the same chain list as the desktop picker. Shares state, the amount form, the
// quote and the footer with the desktop layout.
export default function BridgeMobile({ state, onSubmit, className }: IBridgeMobile) {
    const { t } = useTranslation();
    const { from, to, route } = state;
    const [openSection, setOpenSection] = useState<'from' | 'to' | null>(null);
    const { form, amount, isTyping } = useBridgeAmountForm(from, to, state.amountResetKey);
    const quote = useBridgeRouteQuote({
        from,
        route,
        amount,
        balances: state.balances,
        destinationAddress: state.recipientAddress,
        destinationTag: state.destinationTag,
    });
    useApplyAmountValidation(form, quote.validation.input, amount, isTyping);
    useBridgeAmountLink(form, quote, state, amount);
    const { canSubmit, isSubmitting, isSending, alert, submit } = useBridgeSubmit({ state, quote, amount, isTyping, onSubmit });

    const toggle = (section: 'from' | 'to') => setOpenSection(openSection === section ? null : section);

    return (
        <Paper withBorder radius={2} className={className}>
            <div className="relative border-b border-[var(--flr-border-color)] p-6">
                <FormAlert message={alert?.msg} type={alert?.type} />
                <ChainSection
                    emptyTitle={t("bridge_page.from_label")}
                    alignTop
                    emptyAddressLabel={from && !state.hasSourceWallet ? t("bridge_page.no_address_label") : undefined}
                    chain={from}
                    account={state.fromAccount}
                    subtitle={<BridgeSourceSubtitle hasSourceWallet={state.hasSourceWallet} available={quote.available} limit={quote.limit} />}
                    // Visible whenever a source is picked, also with a dropdown open (Figma)
                    rightSlot={from &&
                        <div className="w-[120px]">
                            <AmountInput
                                form={form}
                                variant="inline"
                                autoFocus={false}
                                fAssetCoin={FASSET_COIN}
                                maxAmount={quote.maxAmount}
                                allowDecimal={quote.allowDecimal}
                                placeholder={quote.validation.input?.placeholder}
                                readOnly={quote.validation.input?.readOnly}
                                disabled={quote.validation.input?.disabled}
                                className=""
                            />
                        </div>
                    }
                    isOpen={openSection === 'from'}
                    onToggle={() => toggle('from')}
                    list={
                        <BridgeChainList
                            value={from}
                            onChange={chain => {
                                state.onFromChange(chain);
                                setOpenSection(null);
                            }}
                            balances={state.balances.display}
                            isPaused={state.isPaused}
                            getBlockReason={state.getFromBlockReason}
                        />
                    }
                />
                <BridgeSwapButton state={state} isSending={isSending} onAfterSwap={() => setOpenSection(null)} />
            </div>
            <div className="border-b border-[var(--flr-border-color)] p-6">
                <ChainSection
                    emptyTitle={t("bridge_page.to_label")}
                    chain={to}
                    account={state.toAccount}
                    addressAction={state.canOpenCustomRecipient && <BridgeCustomLink onClick={state.openCustomRecipient} />}
                    emptyAddressLabel={to && !state.toAccount?.address ? t("bridge_page.no_address_label") : undefined}
                    topSlot={to && state.isRecipientOpen &&
                        <div className="mb-4">
                            {/* Top of the TO block — the whole block moves down, as on desktop */}
                            <BridgeRecipientField
                                key={`recipient-${to}-${state.recipientFieldKey}`}
                                chain={to}
                                initialValue={state.linkPrefill.recipient}
                                onEdit={state.onLinkRecipientEdit}
                                onChange={state.onRecipientChange}
                                onRemove={state.onRecipientRemove}
                                autoFocus={state.isRecipientOpenedByUser}
                            />
                        </div>
                    }
                    extraSlot={to && state.recipientKind === 'xrpl' &&
                        <div className="mb-4">
                            <BridgeDestinationTagField
                                key={`tag-${to}-${state.tagFieldKey}`}
                                initialValue={state.linkPrefill.tag}
                                onEdit={state.onLinkTagEdit}
                                onChange={state.onDestinationTagChange}
                            />
                        </div>
                    }
                    rightSlot={to &&
                        <Text className="text-16" c="var(--flr-shark)">
                            {formatReceivedAmount(quote.received ?? 0)}
                        </Text>
                    }
                    isOpen={openSection === 'to'}
                    onToggle={() => toggle('to')}
                    // TO stays locked until a source is picked, same as the desktop column
                    toggleDisabled={!from}
                    list={
                        <BridgeChainList
                            isDestination
                            sourceChain={from}
                            value={to}
                            onChange={chain => {
                                state.onToChange(chain);
                                setOpenSection(null);
                            }}
                            balances={state.balances.display}
                            isPaused={state.isPaused}
                            getBlockReason={state.getToBlockReason}
                        />
                    }
                />
            </div>
            <BridgeFormFooter
                isConnected={state.hasSourceWallet}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                fees={quote.fees}
                hasRoute={!!route}
                onSubmit={() => form.onSubmit(() => submit())()}
            />
        </Paper>
    );
}
