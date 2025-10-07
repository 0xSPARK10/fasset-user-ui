import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import i18next from "i18next";
import { AssetManagerAbi, CollateralPoolAbi, CollateralPoolTokenAbi } from "@/abi";
import { useWeb3 } from "@/hooks/useWeb3";
import { XRP_NAMESPACE } from "@/config/networks";
import { formatUnit } from "@/utils";
import { ICoin, INetwork, IUtxo } from "@/types";
import { WALLET, ABI_ERRORS } from "@/constants";
import { POOL_KEY } from "@/api/pool";

function getProvider(address: string) {
    const {
        connectedCoins,
        ledgerConnector,
        walletConnectConnector,
        metaMaskConnector
    } = useWeb3();

    const connectedCoin = connectedCoins.find(coin => coin.address === address);
    if (!connectedCoin) return undefined;

    if (connectedCoin.connectedWallet === WALLET.META_MASK) {
        //@ts-ignore
        return metaMaskConnector;
    } else if (connectedCoin.connectedWallet === WALLET.LEDGER) {
        return ledgerConnector;
    }

    return walletConnectConnector;
}

function handleErrors(error: any) {
    const errorCode = error?.error?.data ?? error?.data ?? error?.error?.error?.data;

    if (errorCode in ABI_ERRORS) {
        throw new Error(i18next.t('errors.abi_custom_error_label', { error: ABI_ERRORS[errorCode] }));
    } else if (error.message.includes('could not coalesce error')) {
        throw new Error(i18next.t('errors.try_reconnecting_label'));
    }

    throw error;
}

async function getFeeData(token: ICoin) {
    const provider = new ethers.JsonRpcProvider(token.network.rpcUrl);
    return await provider.getFeeData();
}

export function useReserveCollateral() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async (
            {
                assetManagerAddress,
                agentVaultAddress,
                lots,
                maxMintingFeeBIPS,
                executorAddress,
                userAddress,
                totalNatFee
            }: {
                assetManagerAddress: string,
                agentVaultAddress: string,
                lots: number,
                maxMintingFeeBIPS: number,
                executorAddress: string,
                userAddress: string,
                totalNatFee: number
            }
        ) => {
            if (!provider) return;

            try {
                const signer = await provider?.getSigner(userAddress);
                const contract = new ethers.Contract(assetManagerAddress ?? '', AssetManagerAbi, signer);
                const tx = await contract.reserveCollateral(
                    agentVaultAddress,
                    lots,
                    maxMintingFeeBIPS,
                    executorAddress,
                    {
                        from: userAddress,
                        value: totalNatFee.toLocaleString('fullwide', { useGrouping: false })
                    }
                );

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useRedeem() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            assetManagerAddress,
            userAddress,
            lots,
            userUnderlyingAddress,
            executorAddress,
            executorFee
        }: {
            assetManagerAddress: string,
            userAddress: string,
            lots: number,
            userUnderlyingAddress: string,
            executorAddress: string,
            executorFee: string
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(userAddress);
                const contract = new ethers.Contract(assetManagerAddress ?? '', AssetManagerAbi, signer);

                const tx = await contract.redeem(
                    lots,
                    userUnderlyingAddress,
                    executorAddress,
                    {
                        from: userAddress,
                        value: executorFee
                    }
                );

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;

            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useSignTransaction(address: string) {
    const provider = getProvider(address);

    return useMutation({
        mutationFn: async (
            {
                network,
                userAddress,
                destination,
                amount,
                paymentReference,
                utxos,
                estimatedFee
            }: {
                network: INetwork,
                userAddress: string,
                destination: string,
                amount: string,
                paymentReference: string,
                utxos?: IUtxo[];
                estimatedFee?: number;
            }
        ) => {
            if (!provider) return;

            try {
                const method = network.namespace === XRP_NAMESPACE
                    ? 'xrpl_signTransaction'
                    : 'sendTransfer';

                const params = network.namespace === XRP_NAMESPACE
                    ? {
                        TransactionType: 'Payment',
                        Account: userAddress,
                        Amount: amount,
                        Destination: destination,
                        Memos: [{Memo: {MemoData: paymentReference?.substring(2)}}],
                    }
                    : {
                        account: userAddress,
                        recipientAddress: destination,
                        amount: amount,
                        memo: paymentReference?.substring(2),
                    } as { [key: string]: any };

                if (utxos) {
                    params.utxos = utxos;
                }
                if (estimatedFee) {
                    params.estimatedFee = estimatedFee;
                }

                return provider.request({
                    chainId: `${network.namespace}:${network.chainId}`,
                    method: method,
                    params: params
                })
            } catch (error: any) {
                handleErrors(error);
            }
        }
    })
}

export function useEnterCollateralPool() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            userAddress,
            poolAddress,
            value,
            getGasFee = false
        }: {
            userAddress: string,
            poolAddress: string,
            value: string,
            getGasFee?: boolean
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(userAddress);
                const contract = new ethers.Contract(poolAddress, CollateralPoolAbi, signer);

                const feeData = await getFeeData(mainToken!);
                let gasLimit = await contract.enter.estimateGas({
                    from: userAddress,
                    value: ethers.toBigInt(value)
                });
                gasLimit = (gasLimit * BigInt(150)) / BigInt(100);

                if (getGasFee) {
                    return feeData.gasPrice
                        ? Number(formatUnit(feeData.gasPrice, 9)) * Number(gasLimit)
                        : undefined;
                }

                const tx = await contract.enter({
                    from: userAddress,
                    value: value,
                    gasLimit: gasLimit,
                    maxFeePerGas: feeData.maxFeePerGas!,
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!
                });

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useExitCollateralPool() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);
    const queryClient = useQueryClient();

    return useMutation({
       mutationFn: async ({
            userAddress,
            poolAddress,
            tokenShare,
            getGasFee = false
       }: {
            userAddress: string,
            poolAddress: string,
            tokenShare: string,
            getGasFee?: boolean
       }) => {
           if (!provider) return;

           try {
               const signer = await provider.getSigner(userAddress);
               const contract = new ethers.Contract(poolAddress, CollateralPoolAbi, signer);

               const feeData = await getFeeData(mainToken!);
               let gasLimit = await contract.exit.estimateGas(tokenShare, {
                   from: userAddress
               });
               gasLimit = (gasLimit * BigInt(150)) / BigInt(100);

               if (getGasFee) {
                   return feeData.gasPrice
                       ? Number(formatUnit(feeData.gasPrice, 9)) * Number(gasLimit)
                       : undefined;
               }

               const tx = await contract.exit(tokenShare, {
                   from: userAddress,
                   gasLimit: gasLimit,
                   maxFeePerGas: feeData.maxFeePerGas!,
                   maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!
               });

               const receipt = await tx.wait();
               if (receipt.status === 0) {
                   throw new Error(i18next.t('errors.transaction_failed_label'));
               }

               return tx;
           } catch (error: any) {
               handleErrors(error);
           }
        },
        onSuccess: (data, variables, context) => {
           queryClient.invalidateQueries({
               queryKey: [POOL_KEY.USER_POOLS, variables.userAddress],
               exact: true,
               refetchType: 'all'
           });
            queryClient.resetQueries({
                queryKey: [POOL_KEY.USER_POOLS, variables.userAddress],
                exact: true,
            });
        }
    });
}

export function useWithdrawFeesCollateralPool() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            userAddress,
            poolAddress,
            feeShare,
            getGasFee = false
        }: {
            userAddress: string,
            poolAddress: string,
            feeShare: string,
            getGasFee?: boolean
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(userAddress);
                const contract = new ethers.Contract(poolAddress, CollateralPoolAbi, signer);

                if (getGasFee) {
                    const gasPrice = (await getFeeData(mainToken!)).gasPrice;
                    const gasLimit = await contract.withdrawFees.estimateGas(feeShare, {
                        from: userAddress
                    });

                    if (gasPrice) {
                        return Number(formatUnit(gasPrice, 9)) * Number(gasLimit);
                    }

                    return undefined;
                }

                const tx = await contract.withdrawFees(feeShare, {
                    from: userAddress
                });

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}


export function useTransferCollateralPoolToken() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            userAddress,
            poolAddress,
            amount,
            getGasFee = false
        }: {
            userAddress: string,
            poolAddress: string,
            amount: string,
            getGasFee?: boolean
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(mainToken?.address!);
                const contract = new ethers.Contract(poolAddress, CollateralPoolTokenAbi, signer);

                if (getGasFee) {
                    const gasPrice = (await getFeeData(mainToken!)).gasPrice;
                    const gasLimit = await contract.transfer.estimateGas(userAddress, amount);

                    if (gasPrice) {
                        return Number(formatUnit(gasPrice, 9)) * Number(gasLimit);
                    }

                    return undefined;
                }

                const tx = await contract.transfer(userAddress, amount);

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useFreeCptApprove() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            coinName,
            spenderAddress,
            amount,
            getGasFee = false
        }: {
            coinName: string,
            spenderAddress: string,
            amount: string,
            getGasFee?: boolean
        }) => {
            const contractAddresses = {
                xrp:  process.env.FREE_CPT_XRP_CONTRACT_ADDRESS,
                btc: process.env.FREE_CPT_BTC_CONTRACT_ADDRESS,
                doge: process.env.FREE_CPT_DOGE_CONTRACT_ADDRESS
            };
            const token = coinName.match(/(xrp|btc|doge)/i);

            if (!provider || !token) return;

            try {
                const signer = await provider.getSigner(mainToken?.address!);

                const tokenKey = token[0]?.toLowerCase() as keyof typeof contractAddresses;
                const contract = new ethers.Contract(contractAddresses[tokenKey]!, CollateralPoolTokenAbi, signer);

                if (getGasFee) {
                    const gasPrice = (await getFeeData(mainToken!)).gasPrice;
                    const gasLimit = await contract.approve.estimateGas(spenderAddress, amount);

                    if (gasPrice) {
                        return Number(formatUnit(gasPrice, 9)) * Number(gasLimit);
                    }

                    return undefined;
                }

                const tx = await contract.approve(spenderAddress, amount);
                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useFreeCptPayAssetFeeDebt() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            poolAddress,
            amount
        }: {
            poolAddress: string,
            amount: string
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(mainToken?.address!);
                const contract = new ethers.Contract(poolAddress, CollateralPoolAbi, signer);

                const tx = await contract.payFAssetFeeDebt(amount);

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useCancelCollateralReservation() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ assetManagerAddress, crtId }: { assetManagerAddress: string, crtId: number }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(mainToken?.address!);
                const contract = new ethers.Contract(assetManagerAddress!, AssetManagerAbi, signer);

                const tx = await contract.cancelCollateralReservation(crtId, { from: mainToken?.address! });

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    })
}

export function useSignPsbt(address: string) {
    const provider = getProvider(address);

    return useMutation({
        mutationFn: async (
            {
                network,
                userAddress,
                psbt,
                utxos
            }: {
                network: INetwork,
                userAddress: string,
                psbt: string,
                utxos: any
            }) => {
            if (!provider) return;

            try {
                return provider.request({
                    chainId: `${network.namespace}:${network.chainId}`,
                    method: 'signPsbt',
                    params: {
                        account: userAddress,
                        psbt: psbt,
                        signInputs: utxos.map((utxo: any) => ({
                            address: utxo.address,
                            index: utxo.index,

                        })),
                        broadcast: true
                    }
                });
            } catch (error: any) {
                handleErrors(error);
            }
        }
    })
}
