import {
    createContext,
    ReactNode,
    useEffect,
    useMemo,
    useContext
} from "react";
import { ICoin, INetwork } from "@/types";
import { useRouter } from "next/router";
import { COINS } from "@/config/coin";
import { WALLET } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectedCoin } from "@/store/coin";
import { uniq } from "lodash-es";
import WalletConnectConnector, { IWalletConnectConnector } from "@/connectors/WalletConnectConnector";
import MetaMaskConnector, { IMetaMaskConnector } from "@/connectors/MetaMaskConnector";
import LedgerConnector, { ILedgerConnector } from "@/connectors/LedgerConnector";
import XamanConnector, { IXamanConnector } from "@/connectors/XamanConnector";

interface IWeb3Context {
    connect: (wallet: string, networks: INetwork[]) => Promise<boolean>;
    disconnect: (wallet: string, redirect?: boolean) => Promise<void>;
    connectedCoins: ICoin[];
    connectedWallets: string[];
    isConnected: boolean;
    mainToken: ICoin | undefined;
    ledgerConnector: ILedgerConnector;
    walletConnectConnector: IWalletConnectConnector;
    metaMaskConnector: IMetaMaskConnector;
    xamanConnector: IXamanConnector;
}

export const Web3Context = createContext<IWeb3Context>({} as IWeb3Context);

export function Web3Provider({ children }: { children: ReactNode | ReactNode[] }) {
    const { localConnectedCoins } = useConnectedCoin();
    const router = useRouter();
    const queryClient = useQueryClient();
    const ledgerConnector = LedgerConnector();
    const walletConnectConnector = WalletConnectConnector();
    const metaMaskConnector = MetaMaskConnector();
    const xamanConnector = XamanConnector();

    // Computed values
    const connectedCoins: ICoin[] = localConnectedCoins
        .map(connectedCoin => {
            const coin = COINS.find(coin => coin.enabled && coin.type === connectedCoin.type);
            return coin !== undefined
                ? {
                    ...coin,
                    address: connectedCoin.address,
                    connectedWallet: connectedCoin.connectedWallet,
                    accountAddresses: connectedCoin.accountAddresses,
                    xpub: connectedCoin.xpub
                } as ICoin
                : undefined;
        })
        .filter((coin): coin is ICoin => coin !== undefined);

    const connectedWallets = localConnectedCoins.length > 0
        ? uniq(connectedCoins.map(coin => coin.connectedWallet!))
        : [];

    const isConnected = connectedWallets.length > 0;

    const resetApp = async (redirect: boolean = true) => {
        await queryClient.invalidateQueries();

        if (redirect && useConnectedCoin.getState().localConnectedCoins.length === 0) {
            queryClient.clear();
            await router.push('/');
        }
    };

    const disconnect = async (wallet: string, redirect: boolean = true) => {
        if (wallet === WALLET.LEDGER) {
            await ledgerConnector.disconnect();
        } else if (wallet === WALLET.WALLET_CONNECT) {
            await walletConnectConnector.disconnect(redirect);
        } else if (wallet === WALLET.META_MASK) {
            await metaMaskConnector.disconnect();
        } else if (wallet === WALLET.XAMAN) {
            await xamanConnector.disconnect();
        }

        await resetApp(redirect);
    };

    const connect = async (wallet: string, networks: INetwork[] = []) => {
        if (wallet === WALLET.META_MASK) {
            return await metaMaskConnector.connect();
        } else if (wallet === WALLET.LEDGER) {
            return await ledgerConnector.connect(networks[0]);
        } else if (wallet === WALLET.WALLET_CONNECT) {
            return await walletConnectConnector.connect(networks);
        } else {
            return await xamanConnector.connect();
        }
    };

    const mainToken = isConnected
        ? connectedCoins.find(coin => !coin.isFAssetCoin && !coin.isStableCoin && coin.enabled && coin.isMainToken)
        : COINS.find(coin => !coin.isFAssetCoin && !coin.isStableCoin && coin.enabled && coin.isMainToken);

    useEffect(() => {
        if (!walletConnectConnector.universalProvider) {
            walletConnectConnector.init();
        }
        if (!xamanConnector.client) {
            xamanConnector.init();
        }
    }, []);

    const value = useMemo(
        () => ({
            connectedCoins,
            disconnect,
            connect,
            isConnected,
            connectedWallets,
            mainToken,
            ledgerConnector,
            walletConnectConnector,
            metaMaskConnector,
            xamanConnector
        }),
        [
            connectedCoins,
            disconnect,
            connect,
            isConnected,
            connectedWallets,
            mainToken,
            ledgerConnector,
            walletConnectConnector,
            metaMaskConnector,
            xamanConnector
        ],
    );

    return (
        <Web3Context.Provider
            value={{
                ...value,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}

export function useWeb3() {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error("useWalletConnectClient must be used within a ClientContextProvider");
    }
    return context;
}
