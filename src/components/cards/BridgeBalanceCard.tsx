import {
    Anchor,
    Button,
    LoadingOverlay,
    Paper,
    Text,
    Title
} from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useTranslation } from "react-i18next";
import { truncateString } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import { IconArrowUpRight } from "@tabler/icons-react";
import { IFAssetCoin } from "@/types";
import { COINS } from "@/config/coin";
import BridgeModal from "@/components/modals/BridgeModal";
import { useInterval } from "@mantine/hooks";
import { BRIDGE_TYPE } from "@/constants";

interface IHyperLiquidBalanceCard {
    className?: string;
}

const BALANCE_FETCH_INTERVAL = 60000;

export default function BridgeBalanceCard({ className }: IHyperLiquidBalanceCard) {
    const { mainToken } = useWeb3();
    const { t } = useTranslation();
    const [tokens, setTokens] = useState<IFAssetCoin[]>([]);
    const [isBridgeModalActive, setIsBridgeModalActive] = useState<boolean>(false);
    const activeToken = useRef<IFAssetCoin>();
    const nativeBalance = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined);

    useEffect(() => {
        if (!nativeBalance.data) return;

        const matchedCoins: IFAssetCoin[] = nativeBalance.data
            .filter(item => COINS.find(coin => coin.enabled && coin.type === item.symbol))
            .map(balance => {
                const coin = COINS.find(coin => coin.enabled && coin.type === balance.symbol);

                return {
                    ...coin!,
                    ...balance
                }
            })
            .filter(coin => coin?.balance !== undefined);

        setTokens(matchedCoins);
        nativeBalanceFetchInterval.start();

        return () => {
            nativeBalanceFetchInterval.stop();
        }
    }, [nativeBalance.data]);

    const nativeBalanceFetchInterval = useInterval(() => {
        nativeBalance.refetch();
    }, BALANCE_FETCH_INTERVAL);

    const closeModal = () => {
        activeToken.current = undefined;
        setIsBridgeModalActive(false);
    }


    return (
        <Paper
            className={`min-h-32 relative p-6 sm:p-8 border-primary ${className}`}
            withBorder
        >
            <LoadingOverlay visible={mainToken !== undefined && nativeBalance.isPending} zIndex={2} />
            <div className="flex justify-between items-baseline mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <Title fw={500} className="text-15 mr-3">
                        {mainToken?.nativeName?.toLowerCase()?.includes('sgb')
                            ? t('bridge_balance_card.sgb_address_label')
                            : t('bridge_balance_card.flr_address_label')
                        }
                    </Title>
                    {mainToken &&
                        <div className="flex items-center break-all mr-3">
                            <Text
                                fw={400}
                                className="text-15 block"
                            >
                                {truncateString(mainToken?.address ?? '', 8, 8)}
                            </Text>
                            <CopyIcon
                                text={mainToken?.address ?? ''}
                                color="#AFAFAF"
                            />
                        </div>
                    }
                </div>
                <Anchor
                    underline="always"
                    href={`${mainToken?.network.explorerAddressUrl}/${mainToken?.address}`}
                    target="_blank"
                    className="inline-flex items-center text-12"
                    c="var(--flr-black)"
                    fw={500}
                >
                    {t('bridge_balance_card.view_on_explorer_button')}
                    <IconArrowUpRight
                        size={20}
                        className="ml-1 flex-shrink-0"
                    />
                </Anchor>
            </div>
            {tokens?.map(token => (
                <div
                    key={token.symbol}
                    className="flex max-[360px]:flex-col justify-between border-t mt-2 pt-2"
                >
                    <div className="flex items-center">
                        {token?.icon !== null && token.icon()}
                        <div className="ml-3">
                            <Text
                                c="var(--flr-gray)"
                                className="text-12"
                                fw={400}
                            >
                                {token?.symbol}
                            </Text>
                            <Text
                                className="text-14"
                                fw={500}
                            >
                                {token?.balance}
                            </Text>
                        </div>
                    </div>
                    {token?.isFAssetCoin &&
                        <Button
                            variant="gradient"
                            size="xs"
                            className="mr-3"
                            radius="xl"
                            fw={400}
                            onClick={() => {
                                activeToken.current = token;
                                setIsBridgeModalActive(true);
                            }}
                        >
                            {t('bridge_balance_card.bridge_to_hype_button')}
                        </Button>
                    }
                </div>
            ))}
            <BridgeModal
                opened={isBridgeModalActive}
                onClose={closeModal}
                token={activeToken.current}
                type={BRIDGE_TYPE.HYPER_CORE}
            />
        </Paper>
    )
}