import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ethers, AbiCoder } from "ethers";
import i18next from "i18next";
import {
    AssetManagerAbi,
    CollateralPoolAbi,
    CollateralPoolTokenAbi,
    IIFAssetAbi,
    FAssetOFTAdapterAbi,
    OFTUpgradeableAbi,
    MintingTagManagerAbi
} from "@/abi";
import { useWeb3 } from "@/hooks/useWeb3";
import { XRP_NAMESPACE } from "@/config/networks";
import { formatUnit } from "@/utils";
import { createLogger } from "@/utils/debug";
import { BridgeChain, BridgeType, ICoin, INetwork, IUtxo } from "@/types";
import {
    WALLET,
    ABI_ERRORS,
    BRIDGE_TYPE,
    BRIDGE_CHAIN,
    BRIDGE_SOURCE_CHAIN,
    BRIDGE_DESTINATION_CHAIN,
    BRIDGE_COMPOSE_KIND
} from "@/constants";
import { POOL_KEY } from "@/api/pool";
import { bridgeChainEid, BRIDGE_SOURCE_OFT } from "@/config/bridge";
import { BRIDGE_FASSET_COIN, BRIDGE_GAS_COIN } from "@/config/coin";
import { Options } from "@layerzerolabs/lz-v2-utilities";

export const CONTRACT_KEY = {
    HYPER_EVM_BALANCE: 'contract.hyperliquid_balance',
    HYPE_BALANCE: 'contract.hype_balance',
    REDEEM_WITH_TAG_SUPPORTED: 'contract.redeem_with_tag_supported'
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
    } else if (error?.message?.includes('no such account')) {
        // ethers, from getSigner() on an empty eth_accounts: the WalletConnect session holds
        // no account for this chain. A session cannot gain chains, so only a new one fixes it.
        throw new Error(i18next.t('errors.wallet_reconnect_required_label'));
    }

    throw error;
}

// Wraps tx.wait() with a fallback for the ethers v6 "could not coalesce error"
// bug, which can occur when the wallet's provider (e.g. WalletConnect relay)
// returns a receipt in a format ethers can't parse — even though the transaction
// actually succeeded on-chain. In that case, we re-fetch the receipt directly
// via JsonRpcProvider bypassing the wallet provider. All other errors pass through.
const waitLogger = createLogger('waitForTransaction');
async function waitForTransaction(tx: any, rpcUrl: string) {
    try {
        return await tx.wait();
    } catch (waitError: any) {
        if (waitError?.message?.includes('could not coalesce error')) {
            waitLogger.log('coalesce error, fetching receipt directly from RPC for', tx.hash);
            try {
                const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
                const receipt = await rpcProvider.waitForTransaction(tx.hash, 1, 10000);
                waitLogger.log('rpc receipt status:', receipt?.status);
                if (receipt?.status === 1) return receipt;
            } catch (rpcError) {
                waitLogger.error('rpc fallback failed:', rpcError);
            }
        }
        throw waitError;
    }
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

            const log = createLogger('RESERVE_COLLATERAL');
            try {
                const signer = await provider?.getSigner();
                const contract = new ethers.Contract(assetManagerAddress ?? '', AssetManagerAbi, signer);
                log.log('params:', { agentVaultAddress, lots, maxMintingFeeBIPS, executorAddress, userAddress, totalNatFee });

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

                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status, 'blockNumber:', receipt.blockNumber);
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
            amountUBA,
            userUnderlyingAddress,
            executorAddress,
            executorFee,
            destinationTag,
        }: {
            assetManagerAddress: string,
            userAddress: string,
            amountUBA: string,
            userUnderlyingAddress: string,
            executorAddress: string,
            executorFee: string,
            destinationTag?: string,
        }) => {
            if (!provider) return;

            const log = createLogger('REDEEM');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(assetManagerAddress ?? '', AssetManagerAbi, signer);
                destinationTag = destinationTag?.trim();
                log.log('params:', { assetManagerAddress, userAddress, amountUBA, userUnderlyingAddress, executorAddress, executorFee, destinationTag });

                const tx = destinationTag
                    ? await contract.redeemWithTag(
                        amountUBA,
                        userUnderlyingAddress,
                        executorAddress,
                        destinationTag,
                        {
                            from: userAddress,
                            value: executorFee
                        }
                    )
                    : await contract.redeemAmount(
                        amountUBA,
                        userUnderlyingAddress,
                        executorAddress,
                        {
                            from: userAddress,
                            value: executorFee
                        }
                    );

                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status, 'blockNumber:', receipt.blockNumber);
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

export function useRedeemWithTagSupported(assetManagerAddress: string, enabled: boolean = true) {
    const { mainToken } = useWeb3();

    return useQuery({
        queryKey: [CONTRACT_KEY.REDEEM_WITH_TAG_SUPPORTED, assetManagerAddress],
        queryFn: async () => {
            const provider = new ethers.JsonRpcProvider(mainToken?.network?.rpcUrl!);
            const contract = new ethers.Contract(assetManagerAddress, AssetManagerAbi, provider);
            return await contract.redeemWithTagSupported() as boolean;
        },
        enabled: enabled && !!assetManagerAddress && !!mainToken?.network?.rpcUrl,
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
                destinationTag,
                utxos,
                estimatedFee,
                lastUnderlyingBlock,
                expirationMinutes
            }: {
                network: INetwork,
                userAddress: string,
                destination: string,
                amount: string,
                paymentReference?: string,
                destinationTag?: string,
                utxos?: IUtxo[];
                estimatedFee?: number;
                lastUnderlyingBlock?: string;
                expirationMinutes?: string
            }
        ) => {
            if (!provider) return;

            const log = createLogger('MINT:signTransaction');
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
                        ...(paymentReference ? {
                            Memos: [{Memo: {MemoData: paymentReference.substring(2)}}],
                        } : {}),
                        ...(destinationTag ? {
                            DestinationTag: Number(destinationTag),
                        } : {}),
                        ...(lastUnderlyingBlock ? {
                            LastLedgerSequence: Number(lastUnderlyingBlock),
                        } : {}),
                    }
                    : {
                        account: userAddress,
                        recipientAddress: destination,
                        amount: amount,
                        ...(paymentReference ? { memo: paymentReference.substring(2) } : {}),
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

                log.log('request:', {
                    chainId: `${network.namespace}:${network.chainId}`,
                    method,
                    params,
                });

                const result = await provider.request({
                    chainId: `${network.namespace}:${network.chainId}`,
                    method: method,
                    params: params
                });

                log.log('response:', JSON.stringify(result, null, 2));
                return result;
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

            const log = createLogger('POOL_ENTER');
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

                log.log('params:', { poolAddress, userAddress, value });
                const tx = await contract.enter({
                    from: userAddress,
                    value: value,
                    gasLimit: gasLimit,
                    maxFeePerGas: feeData.maxFeePerGas!,
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!
                });

                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status, 'blockNumber:', receipt.blockNumber);
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

           const log = createLogger('POOL_EXIT');
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

               log.log('params:', { poolAddress, userAddress, tokenShare });
               const tx = await contract.exit(tokenShare, {
                   from: userAddress,
                   gasLimit: gasLimit,
                   maxFeePerGas: feeData.maxFeePerGas!,
                   maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!
               });

               log.log('tx hash:', tx.hash);
               const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
               log.log('receipt status:', receipt.status, 'blockNumber:', receipt.blockNumber);
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

                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
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

                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
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
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
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

                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
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

            const log = createLogger('CANCEL_RESERVATION');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(assetManagerAddress!, AssetManagerAbi, signer);

                log.log('params:', { assetManagerAddress, crtId });
                const tx = await contract.cancelCollateralReservation(crtId, { from: mainToken?.address! });
                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status, 'blockNumber:', receipt.blockNumber);

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

            const log = createLogger('SIGN_PSBT');
            try {
                log.log('params:', { chainId: `${network.namespace}:${network.chainId}`, userAddress, utxoCount: utxos.length });
                const result = await provider.request({
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
                log.log('response:', JSON.stringify(result, null, 2));
                return result;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    })
}

/**
 * The coin `provider.getSigner()` uses to pick the chain. `undefined` means mainToken
 * (Flare) — routes originating on Flare are signed there.
 *
 * Resolved through `getBridgeToken` from useWeb3, not by reading `BRIDGE_FASSET_COIN`
 * directly: only the former stamps the user's address onto the OFT coin. Without it
 * `LedgerConnector.getSigner` builds `new VoidSigner(undefined)` — the XRPL routes then
 * throw while ABI-encoding the compose message, the plain ones at `send`.
 *
 * It returns the shared coin object rather than a copy on purpose: `MetaMaskConnector`
 * detects bridge coins with `BRIDGE_COINS.includes(token)`, i.e. reference equality.
 */
function bridgeSignerToken(
    bridgeType: BridgeType,
    getBridgeToken: (chain: BridgeChain) => ICoin | undefined,
): ICoin | undefined {
    const sourceChain = BRIDGE_SOURCE_CHAIN[bridgeType];
    return sourceChain === BRIDGE_CHAIN.FLARE ? undefined : getBridgeToken(sourceChain);
}

/**
 * The contract `quoteSend` / `send` is called on, chosen by the route's source chain.
 */
function bridgeSourceContract(bridgeType: BridgeType, signer: any) {
    const { address, abi } = BRIDGE_SOURCE_OFT[BRIDGE_SOURCE_CHAIN[bridgeType]];

    if (!address || !abi) {
        throw new Error(i18next.t('errors.transaction_failed_label'));
    }

    return new ethers.Contract(address, abi, signer);
}

interface BridgeSendParamsArgs {
    bridgeType: BridgeType;
    amount: string;
    signerAddress?: string;
    recipient: string;
    mainnet: boolean;
    executorFee?: string;
    composerFeePPM?: string;
    destinationAddress?: string;
    destinationTag?: number;
    log?: ReturnType<typeof createLogger>;
}

/**
 * Builds the LayerZero `SendParam` for a bridge route. Shared by `useBridgeQouteSend`
 * and `useBridgeSend`, which each used to build the same parameters independently —
 * every new route previously had to be added in both places.
 */
function buildBridgeSendParams({
    bridgeType,
    amount,
    signerAddress,
    recipient,
    mainnet,
    executorFee,
    composerFeePPM,
    destinationAddress,
    destinationTag,
    log
}: BridgeSendParamsArgs) {
    const abiCoder = AbiCoder.defaultAbiCoder();
    const PPM_DENOMINATOR = BigInt(1_000_000);

    let options = Options.newOptions().addExecutorLzReceiveOption(200_000, 0);
    let composeMsg = '0x';
    let to = ethers.zeroPadValue(recipient, 32);
    let amountToSend = amount;

    const composeKind = BRIDGE_COMPOSE_KIND[bridgeType];

    if (composeKind === 'hyper_core') {
        composeMsg = abiCoder.encode(['uint256', 'address'], ['0', signerAddress]);
        to = ethers.zeroPadValue(process.env.HYPERLIQUID_COMPOSER_ADDRESS!, 32);
        options.addExecutorComposeOption(0, 200_000, '0');
    } else if (composeKind === 'xrpl') {
        // Gross-up: user enters net amount, total = net / (1 - composerFeePPM/1M)
        const feePPM = BigInt(composerFeePPM ?? '0');
        const amountBig = BigInt(amount);
        amountToSend = ((amountBig * PPM_DENOMINATOR) / (PPM_DENOMINATOR - feePPM)).toString();
        const tag = destinationTag ?? 0;
        log?.log('compose params:', {
            redeemer: signerAddress,
            underlyingAddress: destinationAddress ?? '',
            redeemWithTag: tag !== 0,
            destinationTag: tag,
            executor: ethers.ZeroAddress,
            executorFee: executorFee ?? '0',
            composerAddress: process.env.FXRP_COMPOSER_ADDRESS,
        });
        composeMsg = abiCoder.encode(
            ['tuple(address, string, bool, uint256, address, uint256)'],
            [[
                signerAddress,
                destinationAddress ?? '',
                tag !== 0,
                BigInt(tag),
                ethers.ZeroAddress,
                BigInt(executorFee ?? '0'),
            ]]
        );
        log?.log('composeMsg encoded:', composeMsg);
        // The redeem composer always lives on Flare and supports every source chain —
        // this address is unchanged for XRPL_FROM_ETH.
        to = ethers.zeroPadValue(process.env.FXRP_COMPOSER_ADDRESS!, 32);
        // executorFee from /api/oft/redemptionFees — required for executor to process the redemption
        options = Options.newOptions().addExecutorLzReceiveOption(400_000, 0).addExecutorComposeOption(0, 5_000_000, executorFee ?? '0');
    }

    return {
        dstEid: bridgeChainEid(BRIDGE_DESTINATION_CHAIN[bridgeType], mainnet),
        to: to,
        amountLD: amountToSend,
        minAmountLD: amountToSend,
        extraOptions: options.toHex(),
        composeMsg: composeMsg,
        oftCmd: '0x'
    };
}

export function useBridgeQouteSend() {
    const { mainToken, getBridgeToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ amount, bridgeType, executorFee, composerFeePPM, destinationAddress, destinationTag }: {
            amount: string;
            bridgeType: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE];
            executorFee?: string;
            composerFeePPM?: string;
            destinationAddress?: string;
            destinationTag?: number;
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner(bridgeSignerToken(bridgeType, getBridgeToken));
                const signerAddress = await signer?.getAddress();

                const sendParams = buildBridgeSendParams({
                    bridgeType,
                    amount,
                    signerAddress,
                    recipient: mainToken?.address!,
                    mainnet: !!mainToken?.network?.mainnet,
                    executorFee,
                    composerFeePPM,
                    destinationAddress,
                    destinationTag
                });

                const contract = bridgeSourceContract(bridgeType, signer);
                const result = await contract.quoteSend(sendParams, false);
                return result.nativeFee;
            } catch (error: any) {
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

            const log = createLogger('BRIDGE_APPROVE');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(process.env.BRIDGE_FXRP_ADDRESS!, IIFAssetAbi, signer);
                log.log('amount:', amount, 'spender:', process.env.BRIDGE_FXRP_OFT_ADAPTER_ADDRESS);
                const tx = await contract.approve(process.env.BRIDGE_FXRP_OFT_ADAPTER_ADDRESS!, amount);
                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status);

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
    const { mainToken, getBridgeToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ amount, fee, bridgeType, executorFee, composerFeePPM, destinationAddress, destinationTag }: {
            amount: string,
            fee: bigint,
            bridgeType: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE],
            executorFee?: string,
            composerFeePPM?: string,
            destinationAddress?: string,
            destinationTag?: number,
        }) => {
            if (!provider) return;

            const log = createLogger('BRIDGE_SEND');
            try {
                const signer = await provider.getSigner(bridgeSignerToken(bridgeType, getBridgeToken));
                const signerAddress = await signer?.getAddress();

                const sendParams = buildBridgeSendParams({
                    bridgeType,
                    amount,
                    signerAddress,
                    recipient: mainToken?.address!,
                    mainnet: !!mainToken?.network?.mainnet,
                    executorFee,
                    composerFeePPM,
                    destinationAddress,
                    destinationTag,
                    log
                });

                const contract = bridgeSourceContract(bridgeType, signer);
                log.log('params:', {
                    bridgeType,
                    sourceChain: BRIDGE_SOURCE_CHAIN[bridgeType],
                    ...sendParams,
                    fee: fee?.toString(),
                    signerAddress
                });

                // Estimate at submit time and add headroom, same as POOL_ENTER / POOL_EXIT.
                // Without an explicit gasLimit ethers estimates and submits the bare figure,
                // leaving no margin — and an OFT send's cost can rise between the estimate and
                // inclusion when LayerZero endpoint or DVN state changes.
                let gasLimit = await contract.send.estimateGas(
                    sendParams,
                    { nativeFee: fee, lzTokenFee: '0' },
                    signerAddress,
                    {
                        value: fee
                    }
                );
                gasLimit = (gasLimit * BigInt(150)) / BigInt(100);
                log.log('gas limit (estimate +50%):', gasLimit.toString());

                const tx = await contract.send(
                    sendParams,
                    { nativeFee: fee, lzTokenFee: '0' },
                    signerAddress,
                    {
                        value: fee,
                        gasLimit: gasLimit
                    }
                );

                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status, 'blockNumber:', receipt.blockNumber);
                if (receipt.status === 0) {
                    // Carry the hash in the message: it is the only channel that reaches the
                    // UI, and a reverted send is untraceable without it.
                    throw new Error(i18next.t('errors.transaction_failed_with_hash_label', { hash: tx.hash }));
                }
                return tx.hash;
            } catch (error: any) {
                handleErrors(error);
            }
        }
    });
}

export function useTransferFrom() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({
            tokenAddress,
            from,
            to,
            amount
        }: {
            tokenAddress: string,
            from: string,
            to: string,
            amount: string
        }) => {
            if (!provider) return;

            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(tokenAddress, IIFAssetAbi, signer);
                const tx = await contract.transferFrom(from, to, amount);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);

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

// Read-only balance queries use a direct JsonRpcProvider against the bridge chain RPC.
// Going through the wallet signer mutates universalProvider.defaultChain and races
// with concurrent operations on Flare, producing ethers "network changed" errors.
//
// `chain` defaults to HYPER_EVM so existing callers stay unchanged.
export function useHyperEVMBalance(enabled: boolean = true, chain: BridgeChain = BRIDGE_CHAIN.HYPER_EVM) {
    const { mainToken } = useWeb3();
    const rpcUrl = BRIDGE_FASSET_COIN[chain]?.network?.rpcUrl;
    const oftAddress = BRIDGE_SOURCE_OFT[chain]?.address;

    return useQuery({
        queryKey: [CONTRACT_KEY.HYPER_EVM_BALANCE, mainToken?.address!, chain],
        queryFn: async () => {
            if (!mainToken?.address || !rpcUrl || !oftAddress) return 0;

            try {
                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const contract = new ethers.Contract(oftAddress, IIFAssetAbi, provider);
                const balance = await contract.balanceOf(mainToken.address);
                return balance;
            } catch (error: any) {
                handleErrors(error);
            }
        },
        enabled: enabled && !!mainToken?.address && !!rpcUrl && !!oftAddress,
        staleTime: 10000
    })
}

// Gas balance on the bridge chain (HYPE or ETH) — pays the LayerZero nativeFee.
export function useHypeBalance(enabled: boolean = true, chain: BridgeChain = BRIDGE_CHAIN.HYPER_EVM) {
    const { mainToken } = useWeb3();
    const rpcUrl = BRIDGE_GAS_COIN[chain]?.network?.rpcUrl;

    return useQuery({
        queryKey: [CONTRACT_KEY.HYPE_BALANCE, mainToken?.address!, chain],
        queryFn: async () => {
            if (!mainToken?.address || !rpcUrl) return 0;

            try {
                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const balance = await provider.getBalance(mainToken.address);
                return balance;
            } catch (error: any) {
                handleErrors(error);
            }
        },
        enabled: enabled && !!mainToken?.address && !!rpcUrl,
        staleTime: 10000
    })
}

export function useReserveTag() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ reservationFee }: { reservationFee: bigint }) => {
            if (!provider) throw new Error('No provider');

            const log = createLogger('TAG_RESERVE');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(
                    process.env.MINTING_TAG_MANAGER_ADDRESS!,
                    MintingTagManagerAbi,
                    signer
                );

                log.log('reservationFee:', reservationFee.toString());
                const tx = await contract.reserve({ value: reservationFee });
                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status);

                const event = receipt.logs
                    .map((entry: any) => {
                        try { return contract.interface.parseLog(entry); } catch { return null; }
                    })
                    .find((e: any) => e?.name === 'MintingTagReserved');

                if (!event) throw new Error('MintingTagReserved event not found');
                log.log('success - tag:', Number(event.args.tag), 'owner:', event.args.owner);
                return { tag: Number(event.args.tag), owner: event.args.owner as string };
            } catch (error) {
                log.error('error:', error);
                handleErrors(error);
            }
        }
    });
}

export function useTransferTag() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ tagId, to }: { tagId: number; to: string }) => {
            if (!provider) throw new Error('No provider');

            const log = createLogger('TAG_TRANSFER');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(
                    process.env.MINTING_TAG_MANAGER_ADDRESS!,
                    MintingTagManagerAbi,
                    signer
                );

                log.log('tagId:', tagId, 'to:', to);
                const tx = await contract.transfer(to, tagId);
                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt?.status);
                return receipt;
            } catch (error) {
                log.error('error:', error);
                handleErrors(error);
            }
        }
    });
}

export function useSetMintingRecipient() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ tagId, mintingRecipient }: { tagId: number; mintingRecipient: string }) => {
            if (!provider) throw new Error('No provider');

            const log = createLogger('TAG_SET_RECIPIENT');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(
                    process.env.MINTING_TAG_MANAGER_ADDRESS!,
                    MintingTagManagerAbi,
                    signer
                );

                log.log('tagId:', tagId, 'mintingRecipient:', mintingRecipient);
                const tx = await contract.setMintingRecipient(tagId, mintingRecipient);
                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status);
                return receipt;
            } catch (error) {
                log.error('error:', error);
                handleErrors(error);
            }
        }
    });
}

export function useSetAllowedExecutor() {
    const { mainToken } = useWeb3();
    const provider = getProvider(mainToken?.address!);

    return useMutation({
        mutationFn: async ({ tagId, executor }: { tagId: number; executor: string }) => {
            if (!provider) throw new Error('No provider');

            const log = createLogger('TAG_SET_EXECUTOR');
            try {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(
                    process.env.MINTING_TAG_MANAGER_ADDRESS!,
                    MintingTagManagerAbi,
                    signer
                );

                log.log('tagId:', tagId, 'executor:', executor);
                const tx = await contract.setAllowedExecutor(tagId, executor);
                log.log('tx hash:', tx.hash);
                const receipt = await waitForTransaction(tx, mainToken?.network?.rpcUrl!);
                log.log('receipt status:', receipt.status);
                return receipt;
            } catch (error) {
                log.error('error:', error);
                handleErrors(error);
            }
        }
    });
}
