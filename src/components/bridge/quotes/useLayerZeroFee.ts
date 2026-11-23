import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeQuoteSendReadOnly } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { BridgeType } from "@/types";
import { formatUnit, parseDestinationTag, parseUnits } from "@/utils";
import { devError } from "@/utils/debug";
import { useTranslation } from "react-i18next";

interface ILayerZeroFeeParams {
    bridgeType?: BridgeType;
    amount: number;
    enabled: boolean;
    // XRPL routes only — the composer needs them in the compose message
    executorFee?: string;
    composerFeePPM?: string;
    destinationAddress?: string;
    destinationTag?: string;
}

/**
 * LayerZero nativeFee for a bridge route: `quoteSend`, debounced 500ms like the bridge
 * forms. Returns the fee as a formatted 18-decimal string (what `useBridgeFees` /
 * `useBridgeXrplFees` take). Works without a wallet (zero-address sender); the call goes
 * through the source chain's RPC, not the wallet.
 */
export function useLayerZeroFee({
    bridgeType,
    amount,
    enabled,
    executorFee,
    composerFeePPM,
    destinationAddress,
    destinationTag,
}: ILayerZeroFeeParams) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    // Read-only: quoting must not make the wallet switch chain (see the hook)
    const quoteSend = useBridgeQuoteSendReadOnly();
    const [fee, setFee] = useState<string>();
    const [debouncedAmount] = useDebouncedValue(amount, 500);
    // The address / tag are typed too — quote once typing pauses, not per keystroke
    const [debouncedAddress] = useDebouncedValue(destinationAddress, 500);
    const [debouncedTag] = useDebouncedValue(destinationTag, 500);
    // The field right now — a route change clears it while the debounced amount is still the old one.
    // A dependency, so the same amount coming back within the debounce (Max, a link) quotes again
    const hasAmount = amount > 0;

    useEffect(() => {
        setFee(undefined);
        if (!enabled || !bridgeType || debouncedAmount <= 0 || !hasAmount) return;

        let cancelled = false;
        quoteSend
            .mutateAsync({
                amount: parseUnits(debouncedAmount, 6).toString(),
                bridgeType,
                executorFee,
                composerFeePPM,
                destinationAddress: debouncedAddress,
                destinationTag: parseDestinationTag(debouncedTag),
            })
            .then(nativeFee => {
                if (!cancelled && nativeFee !== undefined) setFee(formatUnit(nativeFee, 18));
            })
            .catch(async (error: any) => {
                if (cancelled) return;
                devError('bridge: quoteSend failed', error);
                const decodedError = await ErrorDecoder.create([FAssetOFTAdapterAbi]).decode(error);
                // The source OFT has no peer for the destination (testnet: Base Sepolia ↔ BNB testnet)
                if (decodedError.name === 'NoPeer') {
                    showErrorNotification(t("bridge_page.route_unavailable_label"));
                    return;
                }
                showErrorNotification(error?.error?.message || decodedError.reason || (error as Error)?.message);
            });

        return () => {
            cancelled = true;
        };
        // quoteSend is a fresh object every render — depending on it would re-quote in a loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, bridgeType, debouncedAmount, hasAmount, mainToken?.address, executorFee, composerFeePPM, debouncedAddress, debouncedTag]);

    // Submit: a fresh quote with the current (not debounced) params — the fee may have risen
    // since the last quote, and the send must carry exactly what this returns
    const requote = async (): Promise<bigint | undefined> => {
        if (!enabled || !bridgeType || amount <= 0) return undefined;
        const nativeFee = await quoteSend.mutateAsync({
            amount: parseUnits(amount, 6).toString(),
            bridgeType,
            executorFee,
            composerFeePPM,
            destinationAddress,
            destinationTag: parseDestinationTag(destinationTag),
        });
        if (nativeFee !== undefined) setFee(formatUnit(nativeFee, 18));
        return nativeFee;
    };

    return {
        // An empty field shows no fee — right after a route change the debounced amount is still the
        // old one for 500 ms and would quote it
        fee: amount > 0 ? fee : undefined,
        requote,
        // Also "loading" while the typed amount waits for the debounce
        isLoading: enabled && (
            quoteSend.isPending
            || (amount > 0 && amount !== debouncedAmount)
            // A fee quoted for the previous recipient / tag must not count as ready
            || destinationAddress !== debouncedAddress
            || destinationTag !== debouncedTag
        ),
    };
}
