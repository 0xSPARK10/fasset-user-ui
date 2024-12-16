import { Button, ActionIcon } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { useWeb3 } from "@/hooks/useWeb3";
import BlingIcon from "@/components/icons/BlingIcon";
import { useRouter } from "next/router";
import { truncateString } from "@/utils";
import { useMediaQuery } from "@mantine/hooks";

export default function ConnectWalletButton() {
    const { t } = useTranslation();
    const { isConnected, mainToken } = useWeb3();
    const isDesktop = useMediaQuery('(min-width: 640px)');
    const isSmallMobile = useMediaQuery('(max-width: 375px)');
    const { openConnectWalletModal } = useConnectWalletModal();
    const router = useRouter();

    const onClick = () => {
        openConnectWalletModal(async (wallet: string) => {
            if (wallet && router.pathname === '/connect') {
                await router.push('/mint');
            }
        });
    }

    return (
        <>
            {isConnected && mainToken
                ? isSmallMobile
                    ? <ActionIcon
                        variant="transparent"
                        size="lg"
                        onClick={onClick}
                    >
                        {mainToken.icon({
                            width: '30',
                            height: '30',
                            className: 'p-1 border border-[var(--flr-border-color)] rounded-full'
                        })}
                    </ActionIcon>
                    : <Button
                        variant="outline"
                        radius="xl"
                        size="md"
                        onClick={onClick}
                        rightSection={mainToken.icon({ width: isDesktop ? '30' : '20', height: isDesktop ? '30' : '20' })}
                        className="h-auto text-black border-gray-200 pr-1 hover:bg-transparent"
                        classNames={{
                            section: 'my-1 border-l border-gray-200 pl-3'
                        }}
                        fw={400}
                    >
                        {truncateString(mainToken.address!)}
                    </Button>
                : <Button
                    color="black"
                    radius="xl"
                    size="md"
                    rightSection={isSmallMobile ? '' : <BlingIcon width="14" height="14" />}
                    onClick={onClick}
                    fw={400}
                    className="hover:text-white"
                >
                    {t(isSmallMobile ? 'connect_wallet_button.title_small' : 'connect_wallet_button.title')}
                </Button>
            }
        </>
    );
}
