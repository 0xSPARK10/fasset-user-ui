import AppEth, { ledgerService } from "@ledgerhq/hw-app-eth";
import AppXrp from "@ledgerhq/hw-app-xrp";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import AppBtc from "@ledgerhq/hw-app-btc";
import FlareApp from "@zondax/ledger-flare";
import i18next from "i18next";
import { Client, encode } from "xrpl";
import { ethers, TransactionRequest, JsonRpcProvider, VoidSigner, Transaction as EtherTransaction } from "ethers";
import CryptoJS from "crypto-js";
import * as bitcoin from "bitcoinjs-lib";
import { BIP44_PATH, LEDGER_APP, WALLET } from "@/constants";
import { COINS } from "@/config/coin";
import { useSubmitTx } from "@/api/minting";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useConnectedCoin } from "@/store/coin";
import { BTC_NAMESPACE, NETWORK_BTC, NETWORK_DOGE, XRP_NAMESPACE } from "@/config/networks";
import { ICoin, INetwork } from "@/types";
import { toNumber } from "@/utils";
import { Network } from "bitcoinjs-lib/src/networks";

export interface ILedgerConnector {
    connect: (network: INetwork) => Promise<boolean>;
    disconnect: () => Promise<void>;
    getSigner: (token?: ICoin) => Promise<VoidSigner>;
    request: ({ chainId, method, params }: { chainId: string, method: string, params: any }) => Promise<any>;
}

export default function LedgerConnector(): ILedgerConnector {
    const { addConnectedCoin, localConnectedCoins, removeConnectedCoin } = useConnectedCoin();
    const mainToken = COINS.find(coin => !coin.isFAssetCoin && !coin.isStableCoin && coin.enabled && coin.isMainToken);
    const submitTx = useSubmitTx();

    const isAppOpened = async (transport: Transport, appName: string) => {
        try {
            const app = new FlareApp(transport);
            const appInfo = await app.appInfo();
            return appInfo?.appName === appName;
        } catch (error) {
            return false;
        }
    }

    const execute = async<T> (callback: (transport: Transport) => Promise<T>, appName: string) => {
        const transport = await TransportWebHID.create();
        const isOpened = await isAppOpened(transport, appName);

        if (!isOpened) {
            transport?.close();
            throw new Error(i18next.t(`ledger.errors.${appName.toLowerCase().replace(' ', '_')}_app_not_running_error`), { cause: 'ledger' });
        }

        let response;
        try {
            response = await callback(transport);
        } catch (error: any) {
            if (error.message.includes('UNKNOWN_ERROR')) {
                error.message = i18next.t('errors.ledger_error_label');
            }

            throw error;
        } finally {
            transport?.close();
        }

        return response;
    }

    const connect = async(network: INetwork) => {
        const coin = COINS.find(coin => coin.bipPath && coin.network.name === network.name && coin.network.chainId === network.chainId);

        try {
            if (network.ledgerApp === LEDGER_APP.FLARE) {
                const address = await execute(async (transport: Transport) => {
                    const eth = new AppEth(transport);
                    const { address } = await eth.getAddress(coin?.bipPath!);
                    return address;
                }, network.ledgerApp)

                addConnectedCoin({
                    type: coin?.type!,
                    address: ethers.getAddress(address),
                    connectedWallet: WALLET.LEDGER
                });
                return true;
            } else if (network.ledgerApp === LEDGER_APP.ETH) {
                const address = await execute(async (transport: Transport) => {
                    const eth = new AppEth(transport);
                    const { address } = await eth.getAddress(coin?.bipPath!);
                    return address;
                }, network.ledgerApp)

                addConnectedCoin({
                    type: coin?.type!,
                    address: ethers.getAddress(address),
                    connectedWallet: WALLET.LEDGER
                });
                return true;
            } else if (network.ledgerApp === LEDGER_APP.XRP) {
                const address = await execute(async (transport: Transport) => {
                    const xrp = new AppXrp(transport);
                    const { address } = await xrp!.getAddress(coin?.bipPath!);
                    return address;
                }, network.ledgerApp);

                addConnectedCoin({
                    type: coin?.type!,
                    address: address,
                    connectedWallet: WALLET.LEDGER
                });
                return true;
            } else if ([LEDGER_APP.BTC_TEST, LEDGER_APP.BTC, LEDGER_APP.DOGE].includes(network.ledgerApp!)) {
                const { bitcoinAddress, xpub } = await execute(async (transport: Transport) => {
                    const btc = new AppBtc({ transport: transport });
                    const { bitcoinAddress } = await btc!.getWalletPublicKey(coin?.bipPath!, { verify: false });
                    const xpubVersion = coin?.network.mainnet
                        ? 0x0488b21e
                        : 0x043587cf;
                    const xpub = await btc!.getWalletXpub({ path: coin!.bipPath!.substring(0, 11), xpubVersion: xpubVersion });

                    return { bitcoinAddress, xpub };
                }, network.ledgerApp!);

                addConnectedCoin({
                    type: coin?.type!,
                    xpub: CryptoJS.AES.encrypt(xpub, process.env.XPUB_SECRET!).toString(),
                    address: bitcoinAddress,
                    connectedWallet: WALLET.LEDGER
                });
                return true;
            }

            return false;
        } catch (error: any) {
            showErrorNotification(error?.message);
            return false;
        }
    }

    const disconnect = async() => {
        localConnectedCoins
            .filter(coin => coin.connectedWallet === WALLET.LEDGER)
            .forEach(coin => removeConnectedCoin(coin.address!));
    }

    const getSigner = async(token?: ICoin) => {
        if (!token) {
            token = mainToken;
            const connectedCoin = localConnectedCoins.find(coin => coin.type === token?.type);
            if (connectedCoin && token) {
                token.address = connectedCoin.address;
            }
        }
        const address = token?.address;
        const provider = new JsonRpcProvider(token?.network.rpcUrl!);
        const signer = new VoidSigner(address!, provider);

        signer.signTransaction = async(transaction: TransactionRequest) => {
            const unsignedTx = await signer.populateTransaction(transaction);
            delete unsignedTx.from;

            const serializedTx = EtherTransaction.from(unsignedTx).unsignedSerialized.slice(2);
            const resolution = await ledgerService.resolveTransaction(serializedTx, {}, {});

            const signature: any = await execute(async (transport: Transport) => {
                const eth = new AppEth(transport);
                return eth!.signTransaction(token?.bipPath!, serializedTx, resolution);
            }, token?.network.ledgerApp!);

            signature.r = "0x" + signature.r;
            signature.s = "0x" + signature.s;
            signature.v = parseInt("0x" + signature.v);
            signature.from = address!;
            unsignedTx.signature = signature;

            return EtherTransaction.from(unsignedTx).serialized;
        }

        return signer;
    }

    const xrpRequest = async(params: any)=>  {
        const connectedCoin = localConnectedCoins.find(localCoin => localCoin.address === params.Account);
        const coin = COINS.find(coin => coin.type === connectedCoin?.type!);

        const server = coin?.network?.mainnet
            ? 'wss://s1.ripple.com'
            : 'wss://s.altnet.rippletest.net:51233';
        const client = new Client(server);
        await client.connect();

        const addressInfo = await execute(async (transport: Transport) => {
            const xrp = new AppXrp(transport);
            return xrp.getAddress(coin?.bipPath!);
        }, coin?.network.ledgerApp!);
        const accountInfo = await client.request({
            command: 'account_info',
            account: params.Account
        });
        params.Sequence = accountInfo.result.account_data.Sequence;
        params.Flags = 2147483648;
        params.SigningPubKey = addressInfo.publicKey.toUpperCase();

        const preparedTx = await client.autofill(params);
        const serializedTx = encode(preparedTx);
        preparedTx.TxnSignature = await execute(async (transport: Transport) => {
            const xrp = new AppXrp(transport);
            return xrp.signTransaction(coin?.bipPath!, serializedTx);

        }, coin?.network.ledgerApp!);

        const result = await client.submit(preparedTx);
        return result.result;
    }

    const btcRequest = async (params: any) => {
        return await execute(async (transport: Transport) => {
            const btc = new AppBtc({ transport: transport });
            const connectedCoin = localConnectedCoins.find(coin => coin.address === params.account);
            const coin = COINS.find(coin => coin.type === connectedCoin?.type!);

            const recipientAddress = params.recipientAddress;
            const senderAddress = params.account;
            const amountToSend = toNumber(params.amount);
            const utxos = params.utxos;
            const estimatedFee = params.estimatedFee;

            let network;
            try {
                const decoded = bitcoin.address.fromBase58Check(senderAddress);
                const prefix = decoded.version;

                if (prefix === bitcoin.networks.bitcoin.pubKeyHash || prefix === bitcoin.networks.bitcoin.scriptHash) {
                    network = bitcoin.networks.bitcoin;
                } else if (prefix === bitcoin.networks.testnet.pubKeyHash || prefix === bitcoin.networks.testnet.scriptHash) {
                    network = bitcoin.networks.testnet;
                }
            } catch (error: any) {
                try {
                    const decoded = bitcoin.address.fromBech32(senderAddress);
                    if (decoded.prefix === 'bc') {
                        network = bitcoin.networks.bitcoin;
                    } else if (decoded.prefix === 'tb') {
                        network = bitcoin.networks.testnet;
                    }
                } catch (error: any) {
                }
            }

            const psbt = new bitcoin.Psbt({ network: network });
            psbt.setMaximumFeeRate(100);

            try {
                let totalAmountAvailable = 0;
                const inputs: any[] = [];
                for (const utxo of utxos) {
                    const isSegwit = utxo.utxoAddress.startsWith('bc1') || utxo.utxoAddress.startsWith('tb1');
                    totalAmountAvailable += toNumber(utxo.value);
                    const tx = bitcoin.Transaction.fromHex(utxo.hexTx);
                    const ledgerTx = btc.splitTransaction(utxo.hexTx, tx.hasWitnesses());

                    if (isSegwit) {
                        psbt.addInput({
                            hash: utxo.txid,
                            index: utxo.vout,
                            witnessUtxo: {
                                value: Number(utxo.value),
                                script: bitcoin.address.toOutputScript(utxo.utxoAddress, network),
                            },
                        });
                    } else {
                        psbt.addInput({
                            hash: utxo.txid,
                            index: utxo.vout,
                            nonWitnessUtxo: Buffer.from(utxo.hexTx, 'hex'),
                        });
                    }

                    inputs.push({ utxo, ledgerTx });
                }

                psbt.addOutput({
                    address: recipientAddress,
                    value: amountToSend,
                });

                const embedMemo = bitcoin.payments.embed({
                    data: [Buffer.from(params.memo, 'hex')],
                    network: network
                });
                psbt.addOutput({
                    script: embedMemo.output!,
                    value: 0
                });

                const change = totalAmountAvailable - amountToSend - estimatedFee;
                if (change > 0) {
                    psbt.addOutput({
                        address: senderAddress,
                        value: change,
                    });
                }

                //@ts-ignore
                const newTx = psbt.__CACHE.__TX;

                const outLedgerTx = btc.splitTransaction(newTx.toHex(), true);
                const outputScript = btc.serializeTransactionOutputs(outLedgerTx);

                const signedTxHex = await btc.createPaymentTransaction({
                    inputs: inputs.map(input => {
                        const { utxo, ledgerTx } = input;

                        return  [
                            ledgerTx,
                            utxo.vout,
                            null,
                            null
                        ]
                    }),
                    changePath: coin?.network?.mainnet ? BIP44_PATH.MAINNET.BTC : BIP44_PATH.TESTNET.BTC,
                    associatedKeysets: inputs.map(input => input.utxo.path),
                    outputScriptHex: outputScript.toString('hex'),
                    additionals: []
                })

                const response = await submitTx.mutateAsync({ fAsset: coin?.type!, hex: signedTxHex });
                return {
                    txid: response?.hash
                };
            } catch (error: any) {
                throw error;
            }
        }, LEDGER_APP.BTC);
    }

    const dogeRequest = async(params: any) => {
        return await execute(async (transport: Transport) => {
            const btc = new AppBtc({ transport: transport });
            const connectedCoin = localConnectedCoins.find(coin => coin.address === params.account);
            const coin = COINS.find(coin => coin.type === connectedCoin?.type!);

            const recipientAddress = params.recipientAddress;
            const senderAddress = params.account;
            const amountToSend = toNumber(params.amount);
            const utxos = params.utxos;
            const estimatedFee = params.estimatedFee;

            const network: Network = {
                messagePrefix: '\x19Dogecoin Signed Message:\n',
                bech32: 'doge',
                bip32: {
                    public: 0x02facafd,
                    private: 0x02fac398
                },
                pubKeyHash: 0x1e,
                scriptHash: 0x16,
                wif: 0x9e
            };

            const psbt = new bitcoin.Psbt({ network: network });
            psbt.setMaximumFeeRate(100);

            try {
                let totalAmountAvailable = 0;
                const inputs: any[] = [];
                for (const utxo of utxos) {
                    totalAmountAvailable += toNumber(utxo.value);
                    const ledgerTx = btc.splitTransaction(utxo.hexTx, false);

                    psbt.addInput({
                        hash: utxo.txid,
                        index: utxo.vout,
                        nonWitnessUtxo: Buffer.from(utxo.hexTx, 'hex'),
                    });
                    inputs.push({ utxo, ledgerTx });
                }

                psbt.addOutput({
                    address: recipientAddress,
                    value: amountToSend,
                });

                const embedMemo = bitcoin.payments.embed({
                    data: [Buffer.from(params.memo, 'hex')],
                    network: network
                });
                psbt.addOutput({
                    script: embedMemo.output!,
                    value: 0
                });

                const change = totalAmountAvailable - amountToSend - estimatedFee;
                if (change > 0) {
                    psbt.addOutput({
                        address: senderAddress,
                        value: change,
                    });
                }

                //@ts-ignore
                const newTx = psbt.__CACHE.__TX;

                const outLedgerTx = btc.splitTransaction(newTx.toHex(), true);
                const outputScript = btc.serializeTransactionOutputs(outLedgerTx);

                const signedTxHex = await btc.createPaymentTransaction({
                    inputs: inputs.map(input => {
                        const { utxo, ledgerTx } = input;

                        return  [
                            ledgerTx,
                            utxo.vout,
                            null,
                            null
                        ]
                    }),
                    associatedKeysets: inputs.map(input => input.utxo.path),
                    outputScriptHex: outputScript.toString('hex'),
                    additionals: []
                })

                const response = await submitTx.mutateAsync({ fAsset: coin?.type!, hex: signedTxHex });
                return {
                    txid: response?.hash
                };
            } catch (error: any) {
                throw error;
            }
        }, LEDGER_APP.DOGE);
    }

    const request = async({ chainId, method, params }: { chainId: string, method: string, params: any }) => {
        const [namespace, id] = chainId.split(':');

        if (namespace === XRP_NAMESPACE) {
            return await xrpRequest(params);
        } else if (namespace === BTC_NAMESPACE && id === NETWORK_BTC.chainId) {
            return await btcRequest(params);
        } else if (namespace === BTC_NAMESPACE && id === NETWORK_DOGE.chainId) {
            return await dogeRequest(params);
        }

        throw Error("Unsupported");
    }

    return {
        connect: connect,
        disconnect: disconnect,
        getSigner: getSigner,
        request: request
    }
}
