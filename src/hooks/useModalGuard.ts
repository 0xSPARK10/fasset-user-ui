import { useCallback, useEffect, useRef } from "react";

/**
 * Guards async operations in a modal against stale state updates after the modal closes.
 * Creates a new session on each open; aborts the session when closed or unmounted.
 *
 * API:
 *   assertOpen()  — throws AbortError if the modal is closed; call after each await
 *                   to bail out without updating state.
 *   run(fn)       — wraps an async operation: AbortError from assertOpen() is swallowed,
 *                   real errors are re-thrown to the caller's .catch().
 *   cancel()      — call in onClose to abort the current session immediately.
 *
 * Usage:
 *   const { run, cancel } = useModalGuard(opened);
 *
 *   const handleRequest = async () => {
 *     await run(async (assertOpen) => {
 *       await someAsync();
 *       assertOpen();
 *       setState(...);
 *     }).catch((error) => {
 *       setErrorMessage(error.message);
 *     });
 *     isRequestActive.current = false; // always runs: success, error, or abort
 *   };
 *
 * IMPORTANT: always use the assertOpen passed by run(), not the one from destructuring.
 * run() captures the session controller at call time — so assertOpen() from a session-1
 * run() will correctly throw even if session 2 has since opened a new controller.
 *
 * Notes:
 *   - For globally-relevant side effects (cookies, query invalidation, toasts),
 *     place them BEFORE assertOpen() so they run regardless of modal state.
 *   - isRequestActive.current should be reset after run() resolves — it always
 *     resolves (never rejects), whether the operation succeeded, errored, or aborted.
 */
export function useModalGuard(opened: boolean): {
    run: <T>(fn: (assertOpen: () => void) => Promise<T>) => Promise<T | void>;
    cancel: () => void;
} {
    const ref = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
        ref.current?.abort();
        ref.current = null;
    }, []);

    useEffect(() => {
        if (!opened) {
            cancel();
            return;
        }
        const controller = new AbortController();
        ref.current = controller;
        return () => {
            controller.abort();
            if (ref.current === controller) ref.current = null;
        };
    }, [cancel, opened]);

    const run = useCallback(<T>(fn: (assertOpen: () => void) => Promise<T>): Promise<T | void> => {
        const captured = ref.current;
        const assertOpen = () => {
            if (!captured || captured.signal.aborted) {
                throw new DOMException('Modal closed', 'AbortError');
            }
        };
        return fn(assertOpen).catch((e) => {
            if (isAbortError(e)) return;
            throw e;
        });
    }, []);

    return { run, cancel };
}

export function isAbortError(e: unknown): boolean {
    return e instanceof DOMException && e.name === 'AbortError';
}
