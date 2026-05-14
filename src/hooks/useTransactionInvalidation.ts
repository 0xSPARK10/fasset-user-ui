import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BALANCE_KEY } from "@/api/balance";
import { BRIDGE_KEY } from "@/api/bridge";
import { CONTRACT_KEY } from "@/hooks/useContracts";
import { devLog } from "@/utils/debug";

const MINT_KEYS = [
    BALANCE_KEY.NATIVE_BALANCE,
    BALANCE_KEY.UNDERLYING_BALANCE,
] as const;

const BRIDGE_KEYS = [
    ...MINT_KEYS,
    CONTRACT_KEY.HYPE_BALANCE,
    CONTRACT_KEY.HYPER_EVM_BALANCE,
    BRIDGE_KEY.BALANCE,
] as const;

type SignatureItem = { txhash: string; status: boolean };

export function useTransactionInvalidation(opts: {
    type: "mint" | "bridge";
    address: string | undefined;
    data: SignatureItem[] | undefined;
}) {
    const { type, address, data } = opts;
    const queryClient = useQueryClient();
    const seenFinishedRef = useRef<Set<string>>(new Set());
    const baselineSetRef = useRef<boolean>(false);

    // Reset baseline on wallet switch so the first poll on a new address doesn't
    // treat existing finished txs as newly finished.
    useEffect(() => {
        seenFinishedRef.current = new Set();
        baselineSetRef.current = false;
    }, [address]);

    useEffect(() => {
        if (!data) return;

        const finishedTxhashes = data
            .filter(t => t.status === true)
            .map(t => t.txhash);

        if (!baselineSetRef.current) {
            finishedTxhashes.forEach(h => seenFinishedRef.current.add(h));
            baselineSetRef.current = true;
            return;
        }

        const newlyFinished = finishedTxhashes.filter(
            h => !seenFinishedRef.current.has(h)
        );
        if (newlyFinished.length === 0) return;

        newlyFinished.forEach(h => seenFinishedRef.current.add(h));

        const keys = type === "bridge" ? BRIDGE_KEYS : MINT_KEYS;
        devLog(
            `[txInvalidation] ${newlyFinished.length} new finished ${type} tx → invalidating ${keys.length} balance queries`
        );
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
    }, [data, type, queryClient]);
}
