import WalletConnectIcon from '@/components/icons/WalletConnectIcon';
import MetaMaskIcon from "@/components/icons/MetaMaskIcon";
import LedgerIcon from "@/components/icons/LedgerIcon";
import XamanIcon from "@/components/icons/XamanIcon";
import FireblocksIcon from "@/components/icons/FireblocksIcon";
import { WALLET } from "@/constants";
import { isWalletEnabled } from "@/config/enabledWallets";

export type SupportedWallets = 'walletConnect' | 'metaMask' | 'ledger' | 'xaman' | 'fireblocks';

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

export const wallets: { [wallet in SupportedWallets]: IWallet; } = {
    walletConnect: {
        id: WALLET.WALLET_CONNECT,
        name: 'Wallet Connect',
        icon: WalletConnectIcon,
        enabled: isWalletEnabled(WALLET.WALLET_CONNECT)
    },
    metaMask: {
        id: WALLET.META_MASK,
        name: 'MetaMask',
        icon: MetaMaskIcon,
        enabled: isWalletEnabled(WALLET.META_MASK)
    },
    ledger: {
        id: WALLET.LEDGER,
        name: 'Ledger',
        icon: LedgerIcon,
        enabled: isWalletEnabled(WALLET.LEDGER)
    },
    xaman: {
        id: WALLET.XAMAN,
        name: 'Xaman Wallet',
        icon: XamanIcon,
        enabled: isWalletEnabled(WALLET.XAMAN)
    },
    fireblocks: {
        id: WALLET.FIREBLOCKS,
        name: 'Fireblocks',
        icon: FireblocksIcon,
        enabled: isWalletEnabled(WALLET.FIREBLOCKS)
    }
}
