import React, {useEffect, useState} from "react";
import { Accordion, Anchor, List, rem, Text } from "@mantine/core";
import { IconArrowUpRight, IconMinus, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import CryptoJS from "crypto-js";
import { CoinEnum } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance, useUnderlyingBalances } from "@/api/balance";
import { WALLET } from "@/constants";

interface IFaucetCard {
    className?: string;
}

export default function FaucetCard({ className }: IFaucetCard) {
    const [isOpened, setIsOpened] = useState<boolean>(false);
    const { connectedCoins, mainToken } = useWeb3();
    const { t } = useTranslation();

    const faucetCoins = connectedCoins.filter(coin => !!coin.faucetUrl);
    const nativeBalances = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined);
    const underlyingBalances = useUnderlyingBalances(
        connectedCoins
            .filter(c => c.address && c.isFAssetCoin)
            .map(coin => {
                return {
                    address: coin.connectedWallet === WALLET.LEDGER && coin.xpub !== undefined
                        ? CryptoJS.AES.decrypt(coin.xpub!, process.env.XPUB_SECRET!).toString(CryptoJS.enc.Utf8)
                        : coin.address!,
                    fAsset: coin.type,
                    isXpub: coin.connectedWallet === WALLET.LEDGER && coin.xpub !== undefined
                }
            }),
        connectedCoins.filter(c => c.address && c.isFAssetCoin).length > 0
    );

    useEffect(() => {
        if (underlyingBalances.isPending || !underlyingBalances.data || nativeBalances.isPending || !nativeBalances.data) return;

        const cflrBalance = nativeBalances.data.find(balance => balance.symbol === mainToken?.type);
        const underlyingBalancesStatus = underlyingBalances.data.every(result => {
            return (result?.balance || "0") === "0";
        });
        if (underlyingBalancesStatus || (cflrBalance?.balance === "0")) {
            setIsOpened(true);
        }

    }, [underlyingBalances.data, nativeBalances.data]);

    return (
        <Accordion
            radius="xs"
            chevron={isOpened ? <IconMinus /> : <IconPlus />}
            disableChevronRotation={true}
            onChange={() => setIsOpened(!isOpened)}
            className={`${className} mb-14 border border-[var(--flr-border-color)]`}
            value={isOpened ? 'ADDITIONAL_ASSETS_NEEDED' : null}
            classNames={{
                control: 'px-6 bg-white hover:bg-white',
                panel: 'bg-white border-t border-black',
                content: 'px-6 py-4',
                item: '!border-b-0'
            }}
            styles={{
                root: {
                    boxShadow: '0px 7px 7px -5px rgba(0, 0, 0, 0.0392)'
                }
            }}
        >
            <Accordion.Item
                key="ADDITIONAL_ASSETS_NEEDED"
                value="ADDITIONAL_ASSETS_NEEDED"
            >
                <Accordion.Control>
                    <Text className="text-15" fw={500}>{t('faucet_card.title')}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                    <div className="flex flex-col md:flex-row pl-0 w-full">
                        <div className="pr-0 md:pr-3">
                            <List
                                withPadding
                                className="pl-0 sm:pl-4"
                                type="unordered"
                                size="sm"
                                classNames={{
                                    itemWrapper: 'inline'
                                }}
                                styles={{
                                    root: {
                                        listStylePosition: 'outside'
                                    }
                                }}
                            >
                                {faucetCoins.map(coin => {
                                    return (
                                        <List.Item className="mt-1" key={coin.type + '_additional_asset'}>
                                            <Text fw={400} className="inline text-14">
                                                {t('faucet_card.get_test_coin_label', {
                                                    network: coin.type === CoinEnum.CFLR ? '' : t('faucet_card.testnet_label'),
                                                    coinName: coin.nativeName
                                                })}
                                                {Array.isArray(coin.faucetUrl)
                                                    ? coin.faucetUrl.map((url, index) => (
                                                        <span key={index}>
                                                            <Anchor
                                                                underline="always"
                                                                href={url}
                                                                target="_blank"
                                                                className="inline-flex items-center ml-1"
                                                                c="black"
                                                                fw={500}
                                                                size="sm"
                                                            >
                                                                {t('faucet_card.here_label')}
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
                                                        className="inline-flex items-center ml-1"
                                                        c="black"
                                                        fw={500}
                                                        size="sm"
                                                    >
                                                        {t('faucet_card.here_label')}
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
                        </div>
                    </div>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}
