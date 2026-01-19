import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ethers, AbiCoder } from "ethers";
import i18next from "i18next";
import {
    AssetManagerAbi,
    CollateralPoolAbi,
    CollateralPoolTokenAbi,
    IIFAssetAbi,
    FAssetOFTAdapterAbi, OFTUpgradeableAbi
} from "@/abi";
import { useWeb3 } from "@/hooks/useWeb3";
import { XRP_NAMESPACE } from "@/config/networks";
import { formatUnit } from "@/utils";
import { ICoin, INetwork, IUtxo } from "@/types";
import { WALLET, ABI_ERRORS, BRIDGE_TYPE } from "@/constants";
import { POOL_KEY } from "@/api/pool";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { Options } from "@layerzerolabs/lz-v2-utilities";

export const CONTRACT_KEY = {
    HYPER_EVM_BALANCE: 'contract.hyperliquid_balance',
    HYPE_BALANCE: 'contract.hype_balance'
}

function getProvider(address: string) {
    const {
        connectedCoins,
        ledgerConnector,
        walletConnectConnector,
        metaMaskConnector,
        xamanConnector
    } = useWeb3();

    const connectedCoin = connectedCoins.find(coin => coin.address === address);
    if (!connectedCoin) return undefined;

    if (connectedCoin.connectedWallet === WALLET.META_MASK) {
        //@ts-ignore
        return metaMaskConnector;
    } else if (connectedCoin.connectedWallet === WALLET.LEDGER) {
        return ledgerConnector;
    } else if (connectedCoin.connectedWallet === WALLET.XAMAN) {
        return xamanConnector;
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
                const signer = await provider?.getSigner();
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
                const signer = await provider.getSigner();
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
                estimatedFee,
                lastUnderlyingBlock,
                expirationMinutes
            }: {
                network: INetwork,
                userAddress: string,
                destination: string,
                amount: string,
                paymentReference: string,
                utxos?: IUtxo[];
                estimatedFee?: number;
                lastUnderlyingBlock: string;
                expirationMinutes?: string
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
                        LastLedgerSequence: Number(lastUnderlyingBlock),
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

                if (expirationMinutes) {
                    params.expirationMinutes = expirationMinutes;
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
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(poolAddress, CollateralPoolAbi, signer);

                const feeProvider = new ethers.JsonRpcProvider(mainToken?.network?.rpcUrl!);
                const feeData = await getFeeData(mainToken!);
                //@ts-ignore
                let gasLimit = await contract.connect(feeProvider).enter.estimateGas({
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
               const signer = await provider.getSigner();
               const contract = new ethers.Contract(poolAddress, CollateralPoolAbi, signer);

               const feeProvider = new ethers.JsonRpcProvider(mainToken?.network?.rpcUrl!);
               const feeData = await getFeeData(mainToken!);
               //@ts-ignore
               let gasLimit = await contract.connect(feeProvider).exit.estimateGas(tokenShare, {
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
                const signer = await provider.getSigner();
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
                const signer = await provider.getSigner();
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
                const signer = await provider.getSigner();

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
                const signer = await provider.getSigner();
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
                const signer = await provider.getSigner();
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

export function useBridgeQouteSend() {
    const { mainToken, bridgeToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ amount, bridgeType }: { amount: string; bridgeType: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE] }) => {
            if (!provider) return;

            try {
                const options = Options.newOptions().addExecutorLzReceiveOption(200_000, 0);
                const abiCoder = AbiCoder.defaultAbiCoder();
                const signer = await provider.getSigner(bridgeType === BRIDGE_TYPE.FLARE
                    ? bridgeToken
                    : undefined
                );
                const signerAddress = await signer?.getAddress();
                const composeMsg = bridgeType === BRIDGE_TYPE.FLARE || bridgeType === BRIDGE_TYPE.HYPER_EVM
                    ? '0x'
                    : abiCoder.encode(['uint256', 'address'], ['0', signerAddress]);
                const to = bridgeType === BRIDGE_TYPE.FLARE || bridgeType === BRIDGE_TYPE.HYPER_EVM
                    ? ethers.zeroPadValue(mainToken?.address!, 32)
                    : ethers.zeroPadValue(process.env.HYPERLIQUID_COMPOSER_ADDRESS!, 32);

                if (bridgeType === BRIDGE_TYPE.HYPER_CORE) {
                    options.addExecutorComposeOption(0, 200000, '0');
                }

                let address: string | undefined = undefined;
                let abi: any | undefined = undefined;

                if (bridgeType === BRIDGE_TYPE.FLARE) {
                    address = process.env.BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS!;
                    abi = OFTUpgradeableAbi;
                } else {
                    address = process.env.BRIDGE_FXRP_OFT_ADAPTER_ADDRESS!;
                    abi = FAssetOFTAdapterAbi;
                }

                if (!address || !abi) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                const contract = new ethers.Contract(address!, abi, signer);
                const result = await contract.quoteSend({
                    dstEid: bridgeType === BRIDGE_TYPE.FLARE
                        ? mainToken?.network?.mainnet
                            ? EndpointId.FLARE_V2_MAINNET
                            : EndpointId.FLARE_V2_TESTNET
                        : mainToken?.network?.mainnet
                            ? EndpointId.HYPERLIQUID_V2_MAINNET
                            : EndpointId.HYPERLIQUID_V2_TESTNET,
                    to: to,
                    amountLD: amount,
                    minAmountLD: amount,
                    extraOptions: options.toHex(),
                    composeMsg: composeMsg,
                    oftCmd: '0x'
                }, false);

                return result.nativeFee;
            } catch (error: any) {
                console.log()
                handleErrors(error);
            }
        }
    })
}

export function useBridgeApprove() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async (amount: string) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(process.env.BRIDGE_FXRP_ADDRESS!, IIFAssetAbi, signer);
                const tx = await contract.approve(process.env.BRIDGE_FXRP_OFT_ADAPTER_ADDRESS!, amount);
                const receipt = await tx.wait();

                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useBridgeSend() {
    const { mainToken, bridgeToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ amount, fee, bridgeType }: { amount: string, fee: bigint, bridgeType: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE] }) => {
            if (!provider) return;

            try {
                const options = Options.newOptions().addExecutorLzReceiveOption(200_000, 0);
                const abiCoder = AbiCoder.defaultAbiCoder();
                const signer = await provider.getSigner(bridgeType === BRIDGE_TYPE.FLARE
                    ? bridgeToken
                    : undefined
                );
                const signerAddress = await signer?.getAddress();
                const composeMsg = bridgeType === BRIDGE_TYPE.FLARE || bridgeType === BRIDGE_TYPE.HYPER_EVM
                    ? '0x'
                    : abiCoder.encode(['uint256', 'address'], ['0', signerAddress]);
                const to = bridgeType === BRIDGE_TYPE.FLARE || bridgeType === BRIDGE_TYPE.HYPER_EVM
                    ? ethers.zeroPadValue(mainToken?.address!, 32)
                    : ethers.zeroPadValue(process.env.HYPERLIQUID_COMPOSER_ADDRESS!, 32);

                if (bridgeType === BRIDGE_TYPE.HYPER_CORE) {
                    options.addExecutorComposeOption(0, 200000, '0');
                }

                let address: string | undefined = undefined;
                let abi: any | undefined = undefined;

                if (bridgeType === BRIDGE_TYPE.FLARE) {
                    address = process.env.BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS!;
                    abi = OFTUpgradeableAbi;
                } else {
                    address = process.env.BRIDGE_FXRP_OFT_ADAPTER_ADDRESS!;
                    abi = FAssetOFTAdapterAbi;
                }

                if (!address || !abi) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                const contract = new ethers.Contract(address!, abi, signer);
                const tx = await contract.send(
                    {
                        dstEid: bridgeType === BRIDGE_TYPE.FLARE
                            ? mainToken?.network?.mainnet
                                ? EndpointId.FLARE_V2_MAINNET
                                : EndpointId.FLARE_V2_TESTNET
                            : mainToken?.network?.mainnet
                                ? EndpointId.HYPERLIQUID_V2_MAINNET
                                : EndpointId.HYPERLIQUID_V2_TESTNET,
                        to: to,
                        amountLD: amount,
                        minAmountLD: amount,
                        extraOptions: options.toHex(),
                        composeMsg: composeMsg,
                        oftCmd: '0x'
                    },
                    { nativeFee: fee, lzTokenFee: '0' },
                    signerAddress,
                    {
                        value: fee
                    }
                );

                const receipt = await tx.wait();
                if (receipt.status === 0) {
                    throw new Error(i18next.t('errors.transaction_failed_label'));
                }

                return tx.hash;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useHyperEVMBalance(enabled: boolean = true) {
    const { mainToken, bridgeToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useQuery({
        queryKey: [CONTRACT_KEY.HYPER_EVM_BALANCE, mainToken?.address!],
        queryFn: async () => {
            if (!provider) return 0;

            try {
                const signer = await provider.getSigner(bridgeToken);
                const contract = new ethers.Contract(process.env.BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS!, IIFAssetAbi, signer);
                return await contract.balanceOf(mainToken?.address!);
            } catch (error: any) {
                handleErrors(error);
            }
        },
        enabled: enabled
    })
}

export function useHypeBalance(enabled: boolean = true) {
    const { mainToken, bridgeToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useQuery({
        queryKey: [CONTRACT_KEY.HYPE_BALANCE, mainToken?.address!],
        queryFn: async () => {
            if (!provider) return 0;

            try {
                const signer = await provider.getSigner(bridgeToken);
                return await signer?.provider?.getBalance(mainToken?.address!);
            } catch (error: any) {
                handleErrors(error);
            }
        },
        enabled: enabled
    })
}