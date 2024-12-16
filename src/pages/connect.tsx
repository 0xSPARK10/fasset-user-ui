import React, { useState } from "react";
import {
    Accordion,
    Anchor,
    Button,
    Card,
    Container,
    List,
    rem,
    Text,
    Title
} from "@mantine/core";
import { Trans, useTranslation } from "react-i18next";
import { IconArrowUpRight, IconMinus, IconPlus } from "@tabler/icons-react";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { useRouter } from "next/router";
import { useWeb3 } from "@/hooks/useWeb3";
import BlingIcon from "@/components/icons/BlingIcon";
import { COINS } from "@/config/coin";
import { CoinEnum } from "@/types";

export default function Connect() {
    const [isBeforeYouStartOpened, setIsBeforeYourStartOpened] = useState<boolean>(false);
    const router = useRouter();
    const { openConnectWalletModal, closeConnectWalletModal } = useConnectWalletModal();
    const { isConnected, mainToken } = useWeb3();
    const { t } = useTranslation();
    const faucetCoins = COINS.filter(coin => coin.enabled && coin.faucetUrl !== undefined);

    const onConnectClick = async () => {
        if (isConnected) {
            await router.push('/mint');
        } else {
            openConnectWalletModal(async (wallet: string) => {
                if (wallet && router.pathname === '/connect') {
                    closeConnectWalletModal(undefined, false);
                    await router.push('/mint');
                }
            });
        }
    };

    return (
        <div className={mainToken?.network.mainnet ? 'my-auto' : ''}>
            {!mainToken?.network?.mainnet &&
                <Container
                    size="sm"
                    className="mb-24 mt-8"
                >
                    <Accordion
                        radius="xs"
                        chevron={isBeforeYouStartOpened ? <IconMinus /> : <IconPlus />}
                        disableChevronRotation={true}
                        onChange={() => setIsBeforeYourStartOpened(!isBeforeYouStartOpened)}
                        classNames={{
                            control: 'px-6 bg-white hover:bg-white',
                            panel: 'bg-white border-t border-black',
                            content: 'px-6 py-4'
                        }}
                        styles={{
                            root: {
                                boxShadow: '0px 7px 7px -5px rgba(0, 0, 0, 0.0392)'
                            }
                        }}
                    >
                        <Accordion.Item
                            key="BEFORE_YOU_START"
                            value="BEFORE_YOU_START"
                        >
                            <Accordion.Control>
                                <Text
                                    className="text-15"
                                    c="var(--flr-black)"
                                    fw={500}
                                >
                                    {t('connect.before_you_start_card.title')}
                                </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text
                                    className="text-14 mb-4"
                                    c="var(--flr-black)"
                                    fw={400}
                                >
                                    {t('connect.before_you_start_card.support_networks_label')}
                                </Text>
                                <Text
                                    className="text-14"
                                    c="var(--flr-black)"
                                    fw={400}
                                >
                                    {t('connect.before_you_start_card.set_up_bifrost_wallet_label')}
                                </Text>
                                <List
                                    listStyleType="lower-latin"
                                    size="sm"
                                    classNames={{
                                        itemWrapper: 'inline'
                                    }}
                                >
                                    <List.Item className="mt-1">
                                        <Text
                                            c="var(--flr-black)"
                                            fw={400}
                                            className="text-14 inline"
                                        >
                                            {t('connect.before_you_start_card.install_bifrost_wallet_label')}
                                            <Anchor
                                                underline="always"
                                                href="https://bifrostwallet.com/?utm_source=fasset_dapp&utm_medium=dapp&utm_campaign=fasset_open_beta_dapp"
                                                target="_blank"
                                                className="inline-flex items-center ml-1 text-14"
                                                c="var(--flr-black)"
                                                fw={700}
                                            >
                                                {t('connect.before_you_start_card.here_label')}
                                                <IconArrowUpRight
                                                    style={{ width: rem(20), height: rem(20) }}
                                                    className="ml-1"
                                                />
                                            </Anchor>
                                        </Text>
                                    </List.Item>
                                    <List.Item className="mt-1">
                                        <Text
                                            c="var(--flr-black)"
                                            fw={400}
                                            className="text-14 inline"
                                        >
                                            {t('connect.before_you_start_card.enable_developer_mode_label')}
                                            <Anchor
                                                underline="always"
                                                href="https://support.bifrostwallet.com/en/articles/5588934-access-test-networks"
                                                target="_blank"
                                                className="inline-flex items-center ml-1 text-14"
                                                c="var(--flr-black)"
                                                fw={700}
                                            >
                                                {t('connect.before_you_start_card.here_label')}
                                                <IconArrowUpRight
                                                    style={{ width: rem(20), height: rem(20) }}
                                                    className="ml-1"
                                                />
                                            </Anchor>
                                        </Text>
                                    </List.Item>
                                </List>
                                <Text
                                    fw={400}
                                    c="var(--flr-black)"
                                    className="mt-4 text-14"
                                >
                                    {t('connect.before_you_start_card.interact_fasset_sytem_label')}
                                </Text>
                                <List
                                    listStyleType="lower-latin"
                                    size="sm"
                                >
                                    {faucetCoins.map(coin => {
                                        return (
                                            <List.Item
                                                className="mt-1"
                                                key={coin.type}
                                            >
                                                <Text
                                                    fw={400}
                                                    c="var(--flr-black)"
                                                    className="inline text-14"
                                                >
                                                    {t('connect.before_you_start_card.get_test_coin_label', {
                                                        network: coin.type === CoinEnum.CFLR ? '' : t('connect.before_you_start_card.testnet_label'),
                                                        coinName: coin.nativeName
                                                    })}
                                                    {Array.isArray(coin.faucetUrl)
                                                        ? coin.faucetUrl.map((url, index) => (
                                                            <span key={index}>
                                                            <Anchor
                                                                underline="always"
                                                                href={url}
                                                                target="_blank"
                                                                className="inline-flex items-center ml-1 text-14"
                                                                c="var(--flr-black)"
                                                                fw={700}
                                                            >
                                                                {t('connect.before_you_start_card.here_label')}
                                                                <IconArrowUpRight
                                                                    style={{ width: rem(20), height: rem(20) }}
                                                                    className="ml-1"
                                                                />
                                                            </Anchor>
                                                                {coin?.faucetUrl !== undefined && index < coin?.faucetUrl?.length - 1 &&
                                                                    <span className="inline text-14 font-normal">
                                                                        {t('faucet_card.or_label')}
                                                                    </span>
                                                                }
                                                        </span>
                                                        ))
                                                        : <Anchor
                                                            underline="always"
                                                            href={coin.faucetUrl}
                                                            target="_blank"
                                                            className="inline-flex items-center ml-1 text-14"
                                                            c="var(--flr-black)"
                                                            fw={700}
                                                        >
                                                            {t('connect.before_you_start_card.here_label')}
                                                            <IconArrowUpRight
                                                                style={{ width: rem(20), height: rem(20) }}
                                                                className="ml-1"
                                                            />
                                                        </Anchor>
                                                    }
                                                </Text>
                                            </List.Item>
                                        )
                                    })}
                                </List>
                                <Trans
                                    i18nKey={'connect.before_you_start_card.know_more_label'}
                                    components={{
                                        a: <Anchor
                                            underline="always"
                                            href="https://youtu.be/eYxB-epe3fA"
                                            target="_blank"
                                            className="inline-flex ml-1 mt-2 text-14"
                                            c="var(--flr-black)"
                                            fw={700}
                                        />,
                                        icon: <IconArrowUpRight
                                            style={{ width: rem(20), height: rem(20) }}
                                            className="ml-1"
                                        />
                                    }}
                                    parent={Text}
                                    className="mt-3 text-14"
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Container>
            }
            <Container
                size="xs"
                className="flex flex-col items-center text-center"
            >
                <Title
                    fw={500}
                    className="text-32"
                    c="var(--flr-black)"
                >
                    {t('connect.title')}
                </Title>
                <Text
                    c="var(--flr-gray)"
                    className="mt-2 text-16"
                >
                    {t('connect.subtitle')}
                </Text>
                <Card
                    shadow="sm"
                    className="mt-6"
                >
                    <Button
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="lg"
                        onClick={onConnectClick}
                        rightSection={<BlingIcon width="14" height="14" />}
                        className="pl-12 pr-12 font-light hover:text-white"
                    >
                        {t('connect.connect_button')}
                    </Button>
                </Card>
            </Container>
        </div>
    );
}
