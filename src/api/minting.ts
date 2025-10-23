import qs from "qs";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import {
    ICrEvent,
    ISubmitTx,
    IEcosystemInfo,
    IEstimateFee,
    IMaxLots,
    IMintStatus,
    IUtxoForTransaction,
    ICrStatus,
    IReturnAddress,
    IPrepareUtxo,
    IUtxo,
    IMintEnabled
} from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";

export const MINTING_KEY = {
    MAX_LOTS: 'minting.maxLots',
    CR_EVENT: 'minting.crEvent',
    MINTING_STATUS: 'minting.mintingStatus',
    ESTIMATE_FEE: 'minting.estimateFee',
    ECOSYSTEM_INFO: 'minting.ecosystemInfo',
    CR_STATUS: 'minting.crStatus',
    RETURN_ADDRESSES: 'minting.returnAddresses',
    MINT_ENABLED: 'minting.mintEnabled'
}

export function useMaxLots(fAsset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [MINTING_KEY.MAX_LOTS, fAsset],
        queryFn: async () => {
            const response = await apiClient.get(`maxLots/${fAsset}`);
            return response.data as IMaxLots;
        },
        enabled: enabled
    });
}

export function useCrEvent(fAsset: string, txHash: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [MINTING_KEY.CR_EVENT, fAsset, txHash],
        queryFn: async () => {
            const response = await apiClient.get(`getCrEvent/${fAsset}/${txHash}`);
            return response.data as ICrEvent;
        },
        enabled: enabled
    });
}

export function useRequestMinting() {
    return useMutation({
        mutationFn: async (
            {
                collateralReservationId,
                txHash,
                paymentAddress,
                userUnderlyingAddress,
                userAddress,
                amount,
                fAsset,
                nativeHash,
                vaultAddress,
                nativeWalletId,
                underlyingWalletId
            }: {
                collateralReservationId: string,
                txHash: string,
                paymentAddress: string,
                userUnderlyingAddress: string,
                userAddress: string,
                amount: string,
                fAsset: string,
                nativeHash: string,
                vaultAddress: string,
                nativeWalletId: number,
                underlyingWalletId: number
            }
        ) => {
            const response = await apiClient.post('mint', {
                fasset: fAsset,
                collateralReservationId: collateralReservationId,
                txhash: txHash,
                paymentAddress: paymentAddress,
                userUnderlyingAddress: userUnderlyingAddress,
                userAddress: userAddress,
                amount: amount,
                nativeHash: nativeHash,
                vaultAddress: vaultAddress,
                nativeWalletId: nativeWalletId,
                underlyingWalletId: underlyingWalletId,
            });
            return response.data;
        }
    });
}

export function useMintingStatus(txHash: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [MINTING_KEY.MINTING_STATUS, txHash],
        queryFn: async () => {
            const response = await apiClient.get(`mint/${txHash}`);
            return response.data as IMintStatus;
        },
        enabled: enabled
    });
}

export function useEstimateFee(fAsset: string, enabled: boolean = true) {
    return useQuery({
       queryKey: [MINTING_KEY.ESTIMATE_FEE, fAsset],
       queryFn: async () => {
            const response = await apiClient.get(`estimateFee/${fAsset}`);
            return response.data as IEstimateFee;
       },
        enabled: enabled
    });
}

export function useEcosystemInfo(enabled: boolean = true) {
    return useQuery({
        queryKey: [MINTING_KEY.ECOSYSTEM_INFO],
        queryFn: async () => {
            const response = await apiClient.get('ecosystemInfo');
            return response.data as IEcosystemInfo;
        },
        enabled: enabled
    });
}

export function useUtxosForTransaction() {
    return useMutation({
        mutationFn: async (
            {
                fAsset,
                xpub,
                amount
            }: {
                fAsset: string,
                xpub: string,
                amount: number
            }) => {
            const response = await apiClient.get(`getUtxosForTransaction/${fAsset}/${xpub}/${amount}`);
            return response.data as IUtxoForTransaction;
        }
    });
}

export function useSubmitTx() {
    return useMutation({
        mutationFn: async ({ fAsset, hex }: { fAsset: string, hex: string}) => {
            const response = await apiClient.get(`submitTx/${fAsset}/${hex}`);
            return response.data as ISubmitTx;
        }
    });
}

export function useCrStatus(crId: string, enabled: boolean = true) {
    return useQuery({
       queryKey: [MINTING_KEY.CR_STATUS, crId],
       queryFn: async () => {
           const response = await apiClient.get(`getCrStatus/${crId}`);
           return response.data as ICrStatus;
       },
        enabled: enabled
    });
}

export function useReturnAddresses(
    fAsset: string,
    amount: number,
    enabled: boolean = true
) {
    const { connectedCoins } = useWeb3();
    const connectedCoin = connectedCoins.find(coin => coin.type.toLowerCase() === fAsset.toLowerCase());
    let config: any = {};
    if (connectedCoin) {
        config = {
            params: {
                receiveAddresses: connectedCoin?.accountAddresses?.receiveAddresses.join(','),
                changeAddresses: connectedCoin?.accountAddresses?.changeAddresses.join(','),
            },
            paramsSerializer: (params: any) => {
                return qs.stringify(params);
            }
        }
    }

    return useQuery({
        queryKey: [MINTING_KEY.RETURN_ADDRESSES, fAsset, amount, connectedCoin?.address, config?.params?.changeAddresses, config?.params?.receiveAddresses],
        queryFn: async () => {
            const response = await apiClient.get(`returnAddresses/${fAsset}/${amount}/${connectedCoin?.address}`, config);
            return response.data as IReturnAddress;
        },
        enabled: enabled
    })
}

export function usePrepareUtxos() {
    return useMutation({
        mutationFn: async (
            {
                fAsset,
                amount,
                fee,
                recipient,
                changeAddresses,
                memo,
                utxos
            }: {
                fAsset: string,
                amount: number,
                fee: number,
                recipient: string,
                changeAddresses: string[],
                memo: string,
                utxos: IUtxo[]
            }) => {

            const config = {
                params: {
                    changeAddresses: changeAddresses.join(','),
                },
                paramsSerializer: (params: any) => {
                    return qs.stringify(params);
                }
            };

            const response = await apiClient.post(`prepareUtxos/${fAsset}/${amount}/${recipient}/${memo}/${fee}`, utxos, config);
            return response.data as IPrepareUtxo;
        }
    })
}

export function useMintEnabled(enabled: boolean = true) {
    return useQuery({
        queryKey: [MINTING_KEY.MINT_ENABLED],
        queryFn: async () => {
            const response = await apiClient.get('mintEnabled');
            return response.data as IMintEnabled[];
        },
        enabled: enabled
    });
}
