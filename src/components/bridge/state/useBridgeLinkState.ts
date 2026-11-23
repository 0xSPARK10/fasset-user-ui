import { useState } from "react";
import type { BridgeDeeplink } from "@/core/bridge";

type LinkPrefill = Pick<BridgeDeeplink, "recipient" | "tag">;

/**
 * What a /bridge link brought into the form (useBridgeDeeplink) and the settled amount written
 * back into the URL.
 */
export function useBridgeLinkState() {
    // A /bridge link's recipient / tag — the fields start with them
    const [linkPrefill, setLinkPrefill] = useState<LinkPrefill>({});
    // A link's amount, until the route's max is there — with a source wallet, its balance (useBridgeAmountLink)
    const [pendingAmount, setPendingAmount] = useState<string>();
    // Settled amount of the form, for the URL
    const [formAmount, setFormAmount] = useState<string>();
    // Bumped to remount the recipient field with a link's address
    const [recipientFieldKey, setRecipientFieldKey] = useState<number>(0);

    return {
        linkPrefill,
        pendingAmount,
        formAmount,
        recipientFieldKey,
        // A new TO: the link's values no longer apply
        reset: () => {
            setLinkPrefill({});
            setPendingAmount(undefined);
        },
        clearPrefill: () => setLinkPrefill({}),
        clearPendingAmount: () => setPendingAmount(undefined),
        // The link's fields start with these values (remounted)
        apply: (prefill: LinkPrefill, amount?: string) => {
            setLinkPrefill(prefill);
            setRecipientFieldKey(key => key + 1);
            setPendingAmount(amount);
        },
        // The user edited the field — a remount (layout switch, route change) starts empty instead
        // of bringing the link's value back over the correction. Same object when already
        // cleared, so typing does not re-render the page
        onLinkRecipientEdit: () => setLinkPrefill(prefill => prefill.recipient === undefined ? prefill : { ...prefill, recipient: undefined }),
        onLinkTagEdit: () => setLinkPrefill(prefill => prefill.tag === undefined ? prefill : { ...prefill, tag: undefined }),
        onFormAmountChange: setFormAmount,
    };
}
