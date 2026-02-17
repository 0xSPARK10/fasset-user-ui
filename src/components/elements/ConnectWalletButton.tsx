import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { useWeb3 } from "@/hooks/useWeb3";
import BlingIcon from "@/components/icons/BlingIcon";
import { useRouter } from "next/router";
import { truncateString } from "@/utils";
import { useMediaQuery } from "@mantine/hooks";
import MetaMaskIcon from "@/components/icons/MetaMaskIcon";
import WalletConnectIcon from "@/components/icons/WalletConnectIcon";
import LedgerIcon from "@/components/icons/LedgerIcon";
import { WALLET } from "@/constants";

export default function ConnectWalletButton() {
    const { t } = useTranslation();
    const { isConnected, mainToken } = useWeb3();
    const isSmallMobile = useMediaQuery('(max-width: 420px)');
    const { openConnectWalletModal } = useConnectWalletModal();

    const onClick = () => {
        openConnectWalletModal();
    }

    return (
        <>
            {isConnected && mainToken
                ? <Button
                    variant="outline"
                    radius="xl"
                    size="md"
                    onClick={onClick}
                    rightSection={mainToken.icon({ width: '30', height: '30' })}
                    className="h-[40px] text-black border-gray-200 pr-1 hover:bg-transparent pl-2 sm:pl-[22px]"
                    classNames={{
                        section: 'my-1 border-l border-gray-200 pl-3'
                    }}
                    fw={400}
                >
                        <span className="block min-[800px]:hidden">
                            {mainToken.connectedWallet === WALLET.META_MASK &&
                                <MetaMaskIcon width="30" height="30" />
                            }
                            {mainToken.connectedWallet === WALLET.WALLET_CONNECT &&
                                <WalletConnectIcon width="30" height="30" />
                            }
                            {mainToken.connectedWallet === WALLET.LEDGER &&
                                <LedgerIcon width="30" height="30" />
                            }
                        </span>
                    <span className="hidden min-[800px]:block">{truncateString(mainToken.address!)}</span>
                </Button>
                : <Button
                    color="black"
                    radius="xl"
                    size="md"
                    rightSection={isSmallMobile ? '' : <BlingIcon width="14" height="14" />}
                    onClick={onClick}
                    fw={400}
                    className="h-[40px] hover:text-white"
                >
                    {t(isSmallMobile ? 'connect_wallet_button.title_small' : 'connect_wallet_button.title')}
                </Button>
            }
        </>
    );
}