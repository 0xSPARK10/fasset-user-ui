import { Burger, Container, Drawer, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ChainSwitcher from "@/components/elements/ChainSwitcher";
import ConnectWalletButton from "@/components/elements/ConnectWalletButton";
import FlareIcon from "@/components/icons/FlareIcon";
import LogoIcon from "@/components/icons/LogoIcon";
import SgbAltIcon from "@/components/icons/SgbAltIcon";
import { useNetworks } from "@/hooks/useNetworks";
import { useWeb3 } from "@/hooks/useWeb3";
import { CoinEnum } from "@/types";

interface NavLink {
    href: string;
    labelKey: string;
    matchPathname: (pathname: string) => boolean;
}

const BASE_NAV_LINKS: NavLink[] = [
    { href: '/', labelKey: 'layout.header.home_label', matchPathname: p => p === '/' },
    { href: '/mint', labelKey: 'layout.header.mint_label', matchPathname: p => p === '/mint' },
    { href: '/tags', labelKey: 'layout.header.my_tags_label', matchPathname: p => p === '/tags' },
    { href: '/pools', labelKey: 'layout.header.agents_label', matchPathname: p => p.includes('pools') },
];

const BRIDGE_NAV_LINK: NavLink = {
    href: '/bridge',
    labelKey: 'layout.header.bridge_label',
    matchPathname: p => p.includes('bridge'),
};

export default function Header() {
    const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);

    const { t } = useTranslation();
    const router = useRouter();
    const { mainToken, isBridgeEnabled } = useWeb3();
    const { isMainnet } = useNetworks();

    const navLinks = isBridgeEnabled ? [...BASE_NAV_LINKS, BRIDGE_NAV_LINK] : BASE_NAV_LINKS;

    return (
        <>
            <Container
                fluid
                className="flex justify-between p-2 bg-white px-[10px] md:px-[26px] w-full items-center border-b  border-[--flr-border-color]"
            >
                <div className="flex items-center">
                    <Link href="/">
                        <LogoIcon width="44" height="44" />
                    </Link>
                    <div className="ml-1">
                        <Title className="text-14" fw={300}>
                            {t('layout.header.title')}
                        </Title>
                        <div className="flex items-center">
                            {mainToken?.type === CoinEnum.SGB
                                ? <SgbAltIcon width="18" height="18" />
                                : <FlareIcon width="10" height="10" />
                            }
                            <Text
                                className="ml-1 text-10"
                                fw={300}
                                c="var(--flr-dark-gray)"
                            >
                                {isMainnet
                                    ? (mainToken?.type === CoinEnum.SGB
                                        ? t('layout.header.songbird_label')
                                        : t('layout.header.flare_label')
                                    )
                                    : t('layout.header.beta_label')
                                }
                            </Text>
                        </div>
                    </div>
                </div>
                <div className="hidden min-[845px]:flex items-center">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-14 font-light mr-8 ${link.matchPathname(router.pathname) ? 'underline underline-offset-4' : ''}`}
                        >
                            {t(link.labelKey)}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center">
                    <ChainSwitcher className="mr-2 sm:mr-5" />
                    <ConnectWalletButton />
                    <Burger
                        opened={isMenuOpened}
                        onClick={() => setIsMenuOpened(!isMenuOpened)}
                        size={25}
                        className="block min-[845px]:hidden ml-4"
                    />
                </div>
            </Container>
            <Drawer
                opened={isMenuOpened}
                onClose={() => setIsMenuOpened(false)}
                size="100%"
                position="right"
                styles={{
                    close: {
                        transform: 'scale(1.5)'
                    },
                    content: {
                        overflowY: 'unset',
                        height: '100%'
                    },
                    body: {
                        height: '100%'
                    }
                }}
            >
                <div className="flex flex-col items-center justify-center h-full">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`font-light text-32 mb-8 ${link.matchPathname(router.pathname) ? 'underline underline-offset-4' : ''}`}
                            onClick={() => setIsMenuOpened(false)}
                        >
                            {t(link.labelKey)}
                        </Link>
                    ))}
                </div>
            </Drawer>
        </>
    );
}
