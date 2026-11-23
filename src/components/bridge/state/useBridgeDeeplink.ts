import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useDebouncedValue } from "@mantine/hooks";
import { buildBridgeDeeplinkQuery, parseBridgeDeeplink } from "@/core/bridge";
import { IBridgePageState } from "@/components/bridge/state/useBridgePageState";

// Form changes reach the URL once they settle — not on every keystroke
const URL_WRITE_DEBOUNCE_MS = 500;

/**
 * Keeps the bridge form and `/bridge?srcChain=…&dstChain=…&amount=…&recipient=…&tag=…` in sync.
 * URL → form on load and whenever the URL changes from outside (a link from another app, back / forward);
 * form → URL with a shallow `replace`. Both sides are compared as normalized query strings, so the
 * echo of our own write is not taken for a new link (no loop, typing is never overwritten).
 */
export function useBridgeDeeplink(state: IBridgePageState): void {
    const router = useRouter();
    // Query string the form and the URL last agreed on
    const syncedQueryRef = useRef<string>();
    // The form's query at the moment a link was applied — the form has not caught up with the
    // link yet (debounce, fields reporting on mount), so writing it would wipe the link
    const staleFormQueryRef = useRef<string>();

    // Next's query is empty until the router is ready
    const urlQuery = router.isReady ? buildBridgeDeeplinkQuery(parseBridgeDeeplink(router.query)) : undefined;
    const [formQuery] = useDebouncedValue(buildBridgeDeeplinkQuery(state.linkValues), URL_WRITE_DEBOUNCE_MS);

    useEffect(() => {
        if (urlQuery === undefined || urlQuery === syncedQueryRef.current) return;
        syncedQueryRef.current = urlQuery;
        staleFormQueryRef.current = formQuery;
        state.applyLink(parseBridgeDeeplink(router.query));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlQuery]);

    useEffect(() => {
        if (urlQuery === undefined || formQuery === staleFormQueryRef.current) return;
        // Any other value = the form has moved on since the link
        staleFormQueryRef.current = undefined;
        // Normalized like the URL side, so whatever the parser drops cannot read back as a new link
        const writtenQuery = buildBridgeDeeplinkQuery(parseBridgeDeeplink(Object.fromEntries(new URLSearchParams(formQuery))));
        if (writtenQuery === syncedQueryRef.current) return;
        syncedQueryRef.current = writtenQuery;
        router.replace(
            { pathname: router.pathname, query: Object.fromEntries(new URLSearchParams(writtenQuery)) },
            undefined,
            { shallow: true },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formQuery]);
}
