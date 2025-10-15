import WalletConnectIcon from '@/components/icons/WalletConnectIcon';
import MetaMaskIcon from "@/components/icons/MetaMaskIcon";
import LedgerIcon from "@/components/icons/LedgerIcon";
import XamanIcon from "@/components/icons/XamanIcon";
import { WALLET } from "@/constants";

export type SupportedWallets = 'walletConnect' | 'metaMask' | 'ledger' | 'xaman';

export interface IIconProps {
    width?: string;
    height?: string;
    className?: string;
}
export interface IWallet {
    id: string;
    name: string;
    icon: (props: IIconProps) => JSX.Element;
    enabled: boolean;
}

const isEnabled = (wallet: string) => {
    const enabledWallets = process.env.ENABLED_WALLETS !== undefined
        ? process.env.ENABLED_WALLETS.split(',').map(wallet => wallet.toLowerCase())
        : [];
    return enabledWallets.includes(wallet.toLowerCase());
}

export const wallets: { [wallet in SupportedWallets]: IWallet; } = {
    walletConnect: {
        id: WALLET.WALLET_CONNECT,
        name: 'Wallet Connect',
        icon: WalletConnectIcon,
        enabled: isEnabled(WALLET.WALLET_CONNECT)
    },
    metaMask: {
        id: WALLET.META_MASK,
        name: 'MetaMask',
        icon: MetaMaskIcon,
        enabled: isEnabled(WALLET.META_MASK)
    },
    ledger: {
        id: WALLET.LEDGER,
        name: 'Ledger',
        icon: LedgerIcon,
        enabled: isEnabled(WALLET.LEDGER)
    },
    xaman: {
        id: WALLET.XAMAN,
        name: 'Xaman Wallet',
        icon: XamanIcon,
        enabled: isEnabled(WALLET.XAMAN)
    }
}
