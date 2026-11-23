import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { BridgeRouteChain } from "@/types";
import { BRIDGE_ROUTES, findBridgeRoute, getBridgeRouteChain, getBridgeRouteRecipient } from "@/config/bridgeRoutes";
import { isRecipientValid, type BridgeDeeplink } from "@/core/bridge";
import { useBridgeAccounts } from "@/components/bridge/state/useBridgeAccounts";
import { useBridgeBalances } from "@/components/bridge/state/useBridgeBalances";
import { useBridgeRouteSelection } from "@/components/bridge/state/useBridgeRouteSelection";
import { useBridgeRecipient } from "@/components/bridge/state/useBridgeRecipient";
import { useBridgeDestinationTag } from "@/components/bridge/state/useBridgeDestinationTag";
import { useBridgeLinkState } from "@/components/bridge/state/useBridgeLinkState";
import { useSystemPauses } from "@/components/bridge/quotes/useSystemPauses";
import { useRouteWalletBlock } from "@/components/bridge/state/useRouteWalletBlock";

/**
 * Route selection + recipient state of the bridge page, shared by the desktop layout and
 * the mobile card. Components take the whole object instead of a dozen props each.
 * Composes the per-concern hooks; the handlers here are the ones that reset several of them.
 */
export function useBridgePageState() {
    const { isConnected } = useWeb3();
    // Pre-broadcast submit failure (rejected in the wallet, revert, API) — first alert of the form
    const [submitError, setSubmitError] = useState<string>();
    // Bumped after a successful submit to clear the amount
    const [amountResetKey, setAmountResetKey] = useState<number>(0);

    // While paused nothing on the bridge page can be picked (UX decision) — the form alert stays as
    // the fallback for a pause that comes after the pick. Same queries as the form, no extra requests
    const { pauses } = useSystemPauses(true);
    const isPaused = !!pauses?.isPaused;

    const accounts = useBridgeAccounts();
    const balances = useBridgeBalances(accounts);
    const selection = useBridgeRouteSelection(isPaused);
    const { from, to, route, recipientKind } = selection;
    const toWalletAddress = to ? accounts[to].address : undefined;
    // Hook order = effect order: the mint reset (recipient) runs before the tag clear (tag)
    const recipient = useBridgeRecipient({ recipientKind, toWalletAddress });
    const tag = useBridgeDestinationTag(recipient.isRecipientOpen);
    const link = useBridgeLinkState();
    const { recipientAddress } = recipient;
    const getWalletBlock = useRouteWalletBlock();

    // A FROM row is off only when the wallet can sign none of its routes (XRPL → Flare still works
    // with Fireblocks while Mint & Bridge does not)
    const getFromBlockReason = (chain: BridgeRouteChain) => {
        const reasons = BRIDGE_ROUTES.filter(route => route.from === chain).map(getWalletBlock);
        return reasons.length > 0 && reasons.every(Boolean) ? reasons[0] : undefined;
    };
    const getToBlockReason = (chain: BridgeRouteChain) => getWalletBlock(findBridgeRoute(from, chain));
    const swapBlockReason = getWalletBlock(findBridgeRoute(to, from));

    // A typed address / tag belongs to one destination chain — a new TO starts over, and a
    // link's values no longer apply
    const onToChange = (chain?: BridgeRouteChain) => {
        // The chain list fires onChange also for the picked chain. Clearing would leave the
        // recipient and tag fields showing values the state no longer has (same key, no remount).
        if (chain !== undefined && chain === to) return;
        selection.setTo(chain);
        recipient.reset();
        tag.reset({ remount: false });
        link.reset();
    };

    const onFromChange = (chain: BridgeRouteChain) => {
        selection.setFrom(chain);
        link.clearPendingAmount();
        // Drop a destination the new source cannot reach
        if (!findBridgeRoute(chain, to)) onToChange(undefined);
    };

    // The new TO starts over like a picked one (recipient, tag, link values)
    const onSwap = () => {
        selection.setFrom(to);
        onToChange(from);
    };

    // The failed attempt was for another route / recipient (the amount clears it in useBridgeSubmit)
    useEffect(() => {
        setSubmitError(undefined);
    }, [from, to, recipientAddress, tag.destinationTag]);

    const closeCustomRecipient = () => {
        link.clearPrefill();
        recipient.reset();
    };

    // Recipient written into the URL — a typed one that differs from the connected wallet
    const linkRecipient = recipientAddress !== toWalletAddress ? recipientAddress : undefined;
    // Tag written into the URL — an invalid one from a link stays until the field is edited, so a
    // reload or a shared URL still blocks instead of opening without the tag
    const linkTag = tag.isDestinationTagValid ? tag.destinationTag : link.linkPrefill.tag;

    // URL → form. Replaces the whole form (a link without `to` clears TO); a chain that is not
    // enabled or not reachable, and a recipient / tag the route does not take, are dropped
    const applyLink = (deeplink: BridgeDeeplink) => {
        const linkFrom = getBridgeRouteChain(deeplink.from) ? deeplink.from : undefined;
        const linkRoute = findBridgeRoute(linkFrom, deeplink.to);
        const linkRecipientKind = getBridgeRouteRecipient(linkRoute);
        const linkRecipientAddress = linkRecipientKind !== 'none' ? deeplink.recipient : undefined;
        // A tag goes with the custom address or the user's own XRPL wallet (the field takes both)
        const linkTagValue = linkRecipientKind === 'xrpl' ? deeplink.tag : undefined;

        selection.setFrom(linkFrom);
        selection.setTo(linkRoute ? deeplink.to : undefined);
        recipient.reset(!!linkRecipientAddress);
        tag.reset({ remount: true });
        link.apply({ recipient: linkRecipientAddress, tag: linkTagValue }, linkFrom ? deeplink.amount : undefined);
    };

    // After the confirm modal closes (success or ×): no chains picked — the amount and the
    // recipient / tag clear with them
    const resetForm = () => {
        selection.setFrom(undefined);
        onToChange(undefined);
    };

    return {
        from,
        to,
        route,
        resetForm,
        applyLink,
        // Form → URL (useBridgeDeeplink): only a custom recipient, never the connected wallet's
        // address (the mint editor starts with it); the link's amount until it is in the form
        linkValues: {
            from,
            to,
            amount: link.pendingAmount ?? link.formAmount,
            recipient: linkRecipient,
            tag: recipientKind === 'xrpl' ? linkTag : undefined,
        } satisfies BridgeDeeplink,
        linkPrefill: link.linkPrefill,
        recipientFieldKey: link.recipientFieldKey,
        pendingAmount: link.pendingAmount,
        // The link's amount is in the form (or dropped — nothing can be sent)
        onLinkAmountApplied: link.clearPendingAmount,
        onLinkRecipientEdit: link.onLinkRecipientEdit,
        onLinkTagEdit: link.onLinkTagEdit,
        onFormAmountChange: link.onFormAmountChange,
        isConnected,
        fromAccount: from ? accounts[from] : undefined,
        // The FROM chain's wallet is connected — XRPL needs the XRPL wallet, the rest the EVM one
        hasSourceWallet: isConnected && (!from || !!accounts[from].address),
        toAccount: to ? accounts[to] : undefined,
        balances,
        onFromChange,
        onToChange,
        canSwap: selection.canSwap && !swapBlockReason,
        isSwapUnsupported: selection.isSwapUnsupported,
        swapBlockReason,
        getFromBlockReason,
        getToBlockReason,
        onSwap,
        isPaused,
        recipientKind,
        canOpenCustomRecipient: recipient.canOpenCustomRecipient,
        isRecipientOpen: recipient.isRecipientOpen,
        tagFieldKey: tag.tagFieldKey,
        // Address that receives on the destination; undefined = missing or not valid yet
        recipientAddress,
        // XRPL destinations only; "" = no tag
        // An invalid tag is not passed on — its field error blocks, the account checks ignore it
        destinationTag: recipientKind === 'xrpl' && tag.isDestinationTagValid ? tag.destinationTag : "",
        isRecipientValid: isRecipientValid({
            recipientKind,
            isRecipientOpen: recipient.isRecipientOpen,
            recipientAddress,
            toWalletAddress,
            isDestinationTagValid: tag.isDestinationTagValid,
            mint: recipient.mintRecipient,
        }),
        isRecipientLoading: recipient.isRecipientLoading,
        // Mint: the old destination fields, exactly what mint/ConfirmStepper reads
        mintRecipient: recipient.mintRecipient,
        // "Use my wallet" above the open input — back to the wallet's address; none without a wallet
        onRecipientRemove: toWalletAddress ? closeCustomRecipient : undefined,
        // Focus the input only when the user opened it, not when it is open from the start or
        // from a link
        isRecipientOpenedByUser: recipient.isCustomRecipient && !link.linkPrefill.recipient,
        openCustomRecipient: recipient.openCustomRecipient,
        onRecipientChange: recipient.onRecipientChange,
        submitError,
        setSubmitError,
        amountResetKey,
        // A confirm modal finished: fresh balances, empty amount
        onSubmitSuccess: () => {
            setAmountResetKey(key => key + 1);
            // Give the chains a moment before refetching
            setTimeout(balances.refetch, 1000);
        },
        onDestinationTagChange: tag.onDestinationTagChange,
    };
}

export type IBridgePageState = ReturnType<typeof useBridgePageState>;
