import React, { useEffect, useState } from "react";
import { Anchor, Button, LoadingOverlay, Paper, rem, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconArrowUpRight, IconExclamationCircle } from "@tabler/icons-react";
import CryptoJS from "crypto-js";
import CopyIcon from "@/components/icons/CopyIcon";
import { truncateString } from "@/utils";
import { IFAssetCoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { showErrorNotification } from "@/hooks/useNotifications";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { useUnderlyingBalance } from "@/api/balance"
import { WALLET } from "@/constants";
import { BTC_NAMESPACE } from "@/config/networks";
import classes from "@/styles/components/cards/UnderlyingBalanceCard.module.scss";

interface IUnderlyingBalanceCard {
    className?: string;
    fAssetCoin: IFAssetCoin;
}

const UNDERLYING_BALANCE_FETCH_INTERVAL = 60000;

export default function UnderlyingBalanceCard({ className, fAssetCoin }: IUnderlyingBalanceCard) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { connectedCoins } = useWeb3();
    const connectedCoin = connectedCoins.find(coin => coin.type == fAssetCoin.type);
    const underlyingBalance = useUnderlyingBalance(
        connectedCoin && connectedCoin.connectedWallet === WALLET.LEDGER && connectedCoin.xpub !== undefined
            ? CryptoJS.AES.decrypt(connectedCoin.xpub!, process.env.XPUB_SECRET!).toString(CryptoJS.enc.Utf8)
            : fAssetCoin?.address!,
        fAssetCoin.type,
        fAssetCoin?.address !== undefined,
        connectedCoin && connectedCoin.connectedWallet === WALLET.LEDGER && connectedCoin.xpub !== undefined
    );

    const { t } = useTranslation();
    const { walletConnectConnector } = useWeb3();
    const { openConnectWalletModal } = useConnectWalletModal();

    const isBalanceUnavailable = !underlyingBalance.isPending && (underlyingBalance?.data?.balance === 'error' || underlyingBalance?.data?.balance === null || (underlyingBalance?.data !== undefined && Object.keys(underlyingBalance.data).length === 0));
    const notConnected = fAssetCoin?.address === undefined;

    useEffect(() => {
        if (notConnected) return;
        const underlyingBalanceFetchInterval = setInterval(() => {
            underlyingBalance.refetch();
        }, UNDERLYING_BALANCE_FETCH_INTERVAL);

        return () => clearInterval(underlyingBalanceFetchInterval);
    }, [underlyingBalance, notConnected]);

    const fetchBalance = async() => {
        try {
            setIsLoading(true);
            if (fAssetCoin.network.namespace === BTC_NAMESPACE && fAssetCoin.connectedWallet === WALLET.WALLET_CONNECT) {
                await walletConnectConnector.fetchUtxoAddresses(fAssetCoin.network.namespace, fAssetCoin.network.chainId, fAssetCoin.address!);
            }

            await underlyingBalance.refetch();
        } catch (error: any) {
            showErrorNotification(error.message);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <Paper
            className={`min-h-32 p-6 sm:p-8 relative border-primary ${className}`}
            withBorder
        >
            <LoadingOverlay visible={underlyingBalance.isPending && fAssetCoin?.address !== undefined} zIndex={2} />
            <div className="sm:hidden">
                <div className="flex items-center justify-between">
                    <Title fw={500} className="mr-3 text-15">
                        {fAssetCoin.network.mainnet
                            ? t('underlying_balance_card.title', { coinName: fAssetCoin.nativeName })
                            : t('underlying_balance_card.testnet_title', { coinName: fAssetCoin.nativeName })
                        }
                    </Title>
                    {fAssetCoin?.address !== undefined &&
                        <Anchor
                            underline="always"
                            href={`${fAssetCoin.network.explorerAddressUrl}/${fAssetCoin.address}`}
                            target="_blank"
                            className="inline-flex items-center text-12"
                            c="black"
                            fw={700}
                        >
                            {t('underlying_balance_card.view_on_explorer_button')}
                            <IconArrowUpRight
                                size={20}
                                className="ml-1 flex-shrink-0"
                            />
                        </Anchor>
                    }
                    {notConnected &&
                        <Text
                            className="text-15"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {t('underlying_balance_card.not_connected_label')}
                        </Text>
                    }
                </div>
                {fAssetCoin?.address !== undefined &&
                    <div className="flex items-center">
                        <Text
                            className="block text-15"
                            fw={400}
                        >
                            {truncateString(fAssetCoin.address ?? '', 8, 8)}
                        </Text>
                        <CopyIcon
                            text={fAssetCoin.address!}
                            color="#AFAFAF"
                        />
                    </div>
                }
            </div>
            <div className={`hidden sm:flex items-baseline ${notConnected ? '' : 'justify-between'}`}>
                <div className="flex items-center">
                    <Title  className="mr-3 text-15" fw={500}>
                        {fAssetCoin.network.mainnet
                            ? t('underlying_balance_card.title', { coinName: fAssetCoin.nativeName })
                            : t('underlying_balance_card.testnet_title', { coinName: fAssetCoin.nativeName })
                        }
                    </Title>
                    {fAssetCoin?.address !== undefined &&
                        <div className="flex items-center break-all mr-3">
                            <Text
                                className="block text-15"
                                fw={400}
                            >
                                {truncateString(fAssetCoin.address ?? '', 8, 8)}
                            </Text>
                            <CopyIcon
                                text={fAssetCoin.address!}
                                color="#AFAFAF"
                            />
                        </div>
                    }
                </div>
                {fAssetCoin?.address !== undefined &&
                    <Anchor
                        underline="always"
                        href={`${fAssetCoin.network.explorerAddressUrl}/${fAssetCoin.address}`}
                        target="_blank"
                        className="inline-flex items-center ml:0 sm:ml-auto mt-1 sm:mt-0 text-12"
                        c="var(--flr-black)"
                        fw={700}
                    >
                        {t('underlying_balance_card.view_on_explorer_button')}
                        <IconArrowUpRight
                            size={20}
                            className="ml-1 flex-shrink-0"
                        />
                    </Anchor>
                }
                {notConnected &&
                    <Text size="sm">{t('underlying_balance_card.not_connected_label')}</Text>
                }
            </div>
            <div className="flex flex-col md:flex-row md:items-center">
                <div className={`flex items-center border-t pt-2 mt-5 ${!notConnected && !isBalanceUnavailable ? 'md:min-w-52' : 'w-full'}`}>
                    <div className="flex items-center">
                        {fAssetCoin.nativeIcon && fAssetCoin.nativeIcon({
                                width: "32",
                                height: "32"
                        })}
                        <div className="ml-3">
                            <Text
                                    c="var(--flr-gray)"
                                    className="text-12"
                                    fw={400}
                            >
                                {fAssetCoin.nativeName}
                            </Text>
                            <Text
                            	className="text-14"
                                fw={500}
                            >
                                {notConnected || isBalanceUnavailable
                                    ? 'n/a'
                                    : underlyingBalance?.data?.balance
                                }
                            </Text>
                        </div>
                    </div>
                    {!notConnected && isBalanceUnavailable &&
                        <Button
                            onClick={fetchBalance}
                            variant="gradient"
                            size="xs"
                            radius="xl"
                            className="flex-shrink-0 ml-8"
                            fw={400}
                            loading={isLoading}
                        >
                            {t('underlying_balance_card.refresh_button')}
                        </Button>
                    }
                    {notConnected &&
                        <Button
                            variant="gradient"
                            size="xs"
                            radius="xl"
                            fw={400}
                            className="ml-auto"
                            onClick={() => openConnectWalletModal()}
                        >
                            {t('underlying_balance_card.manage_connection_button')}
                        </Button>
                    }
                </div>
                {!notConnected && isBalanceUnavailable &&
                    <Paper
                        radius="lg"
                        className={`relative p-4 md:ml-8 mt-5 ${classes.paperArrow}`}
                        styles={{
                            root: {
                                backgroundColor: 'rgba(230, 30, 87, 0.09)'
                            }
                        }}
                    >
                        <div className="flex items-center">
                            <IconExclamationCircle
                                style={{ width: rem(40), height: rem(40) }}
                                className="flex-shrink-0 mr-3"
                                color="var(--mantine-color-red-6)"
                            />
                            {(underlyingBalance?.data?.balance === 'error' || underlyingBalance?.data === undefined || (Object.keys(underlyingBalance.data).length === 0)) &&
                                <Text className="text-14">
                                    {fAssetCoin.network.mainnet
                                        ? t('underlying_balance_card.balance_unavailable_label', {
                                            coinName: fAssetCoin.nativeName
                                        })
                                        : t('underlying_balance_card.testnet_balance_unavailable_label', {
                                            coinName: fAssetCoin.nativeName
                                        })
                                    }
                                </Text>
                            }
                            {underlyingBalance?.data?.balance === null &&
                                <Text size="sm">
                                    {t('underlying_balance_card.update_balance_label')}
                                </Text>
                            }
                        </div>
                    </Paper>
                }
                {(underlyingBalance.data?.accountInfo?.depositAuth || underlyingBalance.data?.accountInfo?.requireDestTag) &&
                    <Paper
                        radius="lg"
                        className={`relative p-4 md:ml-8 mt-5 ${classes.paperArrow}`}
                        styles={{
                            root: {
                                backgroundColor: 'rgba(230, 30, 87, 0.09)'
                            }
                        }}
                    >
                        <div className="flex items-center">
                            <IconExclamationCircle
                                style={{ width: rem(30), height: rem(30) }}
                                className="flex-shrink-0 mr-3"
                                color="var(--mantine-color-red-6)"
                            />
                            <Text
                                className="text-12"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {underlyingBalance.data?.accountInfo?.depositAuth
                                    ? t('underlying_balance_card.limited_deposit_auth_settings_label')
                                    : t('underlying_balance_card.limited_destination_tags_settings_label')
                                }
                            </Text>
                        </div>
                    </Paper>
                }
            </div>
        </Paper>
    );
}
