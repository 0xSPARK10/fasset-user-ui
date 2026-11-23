import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BridgeRouteChain, IDirectMintFee, IDirectMintRequestResult, IDirectMintStatus } from "@/types";

// Smart-accounts backend — direct mint & bridge (XRP → FXRP on another chain in one XRPL payment)
const smartAccountsApiClient = axios.create({
    baseURL: process.env.SMART_ACCOUNTS_API_URL,
});

export const DIRECT_MINT_KEY = {
    FEE: 'directMint.fee',
    STATUS: 'directMint.status',
};

// Direct mint & bridge routes are offered only when the backend URL is set
export const isSmartAccountsApiConfigured = (): boolean => !!process.env.SMART_ACCOUNTS_API_URL;

// The API takes the destination in upper case (ETHEREUM / HYPER_EVM / HYPER_CORE / BSC / BASE /
// KATANA / MONAD) — the route
// chain values match it otherwise; lower case is rejected with 400
const destinationKind = (destination: BridgeRouteChain) => destination.toUpperCase();

export function useDirectMintFee(
    {
        amountUba,
        destination,
        destinationEid,
        evmRecipient,
    }: {
        // Source FXRP in 6-decimal UBA — "10000000" = 10 FXRP
        amountUba: string;
        destination: BridgeRouteChain;
        destinationEid: number;
        evmRecipient: string;
    },
    enabled: boolean = true
) {
    return useQuery({
        queryKey: [DIRECT_MINT_KEY.FEE, amountUba, destination, destinationEid, evmRecipient],
        queryFn: async () => {
            const response = await smartAccountsApiClient.get('direct_mint/fee', {
                params: {
                    action: 'BRIDGE',
                    amount_action: amountUba,
                    destination_kind: destinationKind(destination),
                    destination_eid: destinationEid,
                    evm_recipient: evmRecipient,
                },
            });
            return response.data as IDirectMintFee;
        },
        // Preview only — nonbinding, /direct_mint/request re-quotes on submit
        enabled: enabled && !!evmRecipient && amountUba !== '0',
    });
}

export function useDirectMintRequest() {
    return useMutation({
        mutationFn: async (body: {
            xrplSourceAddress: string;
            amountUba: string;
            destination: BridgeRouteChain;
            destinationEid: number;
            evmRecipient: string;
            walletId: number;
        }) => {
            const response = await smartAccountsApiClient.post('direct_mint/request', {
                action: 'BRIDGE',
                xrpl_source_address: body.xrplSourceAddress,
                amount_action: body.amountUba,
                destination_kind: destinationKind(body.destination),
                destination_eid: body.destinationEid,
                evm_recipient: body.evmRecipient,
                wallet_id: body.walletId,
            });
            return response.data as IDirectMintRequestResult;
        },
    });
}

export function useDirectMintStatus(
    xrplTxHash: string,
    enabled: boolean = true,
    // Optional polling: ms until the next fetch, false = stop (decided from the last answer)
    refetchInterval?: (data: IDirectMintStatus | null | undefined) => number | false
) {
    return useQuery({
        queryKey: [DIRECT_MINT_KEY.STATUS, xrplTxHash],
        queryFn: async () => {
            try {
                const response = await smartAccountsApiClient.get(`direct_mint/status/${xrplTxHash}`);
                return response.data as IDirectMintStatus;
            } catch (error: any) {
                // Not indexed yet — pending, not an error
                if (error?.response?.status === 404) return null;
                throw error;
            }
        },
        retry: false,
        refetchInterval: refetchInterval ? query => refetchInterval(query.state.data) : undefined,
        enabled: enabled && !!xrplTxHash,
    });
}
