import {
    Anchor,
    Button,
    LoadingOverlay,
    Paper,
    Text,
    Title
} from "@mantine/core";
import { useHypeBalance, useHyperEVMBalance } from "@/hooks/useContracts";
import { formatNumber, formatUnit, truncateString } from "@/utils";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import CopyIcon from "@/components/icons/CopyIcon";
import { IconArrowUpRight } from "@tabler/icons-react";
import { FTEST_XRP_HYPE, FXRP_HYPE } from "@/config/coin";
import BridgeModal from "@/components/modals/BridgeModal";
import React, { useEffect, useState } from "react";
import { ICoin } from "@/types";
import { useInterval } from "@mantine/hooks";
import { useHyperliquidBalance } from "@/api/bridge";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import HypeIcon from "@/components/icons/HypeIcon";

interface IBridgeUnderlyingBalanceCard {
    className?: string;
}

const BALANCE_FETCH_INTERVAL = 60000;

export default function BridgeUnderlyingBalanceCard({ className }: IBridgeUnderlyingBalanceCard) {
    const { mainToken } = useWeb3();
    const [isBridgeModalActive, setIsBridgeModalActive] = useState<boolean>(false);
    const hyperEVMBalance = useHyperEVMBalance();
    const hyperliquidBalance = useHyperliquidBalance(mainToken?.address!, mainToken?.address !== undefined);
    const hypeBalance = useHypeBalance(mainToken?.address !== undefined);
    const { t } = useTranslation();
    const [bridgeToken, setBridgeToken] = useState<ICoin>(mainToken?.network?.mainnet ? FXRP_HYPE : FTEST_XRP_HYPE);
    const [fAssetHyperliquidBalance, setFAssetHyperliquidBalance] = useState<string>('0.00');

    const closeModal = () => {
        setIsBridgeModalActive(false);
    }

    useEffect(() => {
        if (!hyperEVMBalance.data) return;

        setBridgeToken({
            ...bridgeToken,
            balance: formatUnit(hyperEVMBalance.data, 6)
        });
        bridgeBalanceFetchInterval.start();

        return () => {
            bridgeBalanceFetchInterval.stop()
        }
    }, [hyperEVMBalance.data]);

    useEffect(() => {
        if (!hyperliquidBalance.data || hyperliquidBalance.data.balances.length === 0) return;

        let balance = hyperliquidBalance.data.balances.find(balance => balance.coin.toLowerCase() === 'fxrp');
        if (balance) {
            setFAssetHyperliquidBalance(balance.total);
        }
    }, [hyperliquidBalance.data]);

    const bridgeBalanceFetchInterval = useInterval(() => {
        hyperEVMBalance.refetch();
    }, BALANCE_FETCH_INTERVAL);

    return (
        <Paper
            className={`min-h-32 relative p-6 sm:p-8 border-primary ${className}`}
            withBorder
        >
            <LoadingOverlay visible={hyperEVMBalance.isPending} zIndex={2} />
            <div className="flex justify-between items-baseline">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <Title  className="mr-3 text-15" fw={500}>
                        {t('bridge_underlying_balance_card.title')}
                    </Title>
                    <div className="flex items-center break-all mr-3">
                        <Text
                            className="block text-15"
                            fw={400}
                        >
                            {truncateString(mainToken?.address ?? '', 8, 8)}
                        </Text>
                        <CopyIcon
                            text={mainToken?.address ?? ''}
                            color="#AFAFAF"
                        />
                    </div>
                </div>
                <Anchor
                    underline="always"
                    href={`${bridgeToken?.network.explorerAddressUrl}/${mainToken?.address}`}
                    target="_blank"
                    className="inline-flex items-center text-12"
                    c="var(--flr-black)"
                    fw={500}
                >
                    {t('balance_card.view_on_explorer_button')}
                    <IconArrowUpRight
                        size={20}
                        className="ml-1 flex-shrink-0"
                    />
                </Anchor>
            </div>
            <div className="flex flex-col md:items-center">
                <div className="flex items-center border-t pt-2 mt-5 w-full">
                    <div className="flex items-center">
                        {HypeIcon({
                            width: "32",
                            height: "32"
                        })}
                        <div className="ml-3">
                            <Text
                                c="var(--flr-gray)"
                                className="text-12"
                                fw={400}
                            >
                                {t('bridge_underlying_balance_card.hype_label')}
                            </Text>
                            <Text
                                className="text-14"
                                fw={500}
                            >
                                {hypeBalance.data ? formatNumber(formatUnit(hypeBalance.data, 18)) : '0.00'}
                            </Text>
                        </div>
                    </div>
                </div>
                <div className="flex items-center border-t pt-2 mt-2 w-full">
                    <div className="flex items-center">
                        {FXrpHypeEVMIcon({
                            width: "32",
                            height: "32"
                        })}
                        <div className="ml-3">
                            <Text
                                c="var(--flr-gray)"
                                className="text-12"
                                fw={400}
                            >
                                {bridgeToken.type} ({t('bridge_underlying_balance_card.hyper_evm_label')})
                            </Text>
                            <Text
                                className="text-14"
                                fw={500}
                            >
                                {hyperEVMBalance.data ? formatNumber(formatUnit(hyperEVMBalance.data, 6)) : '0.00'}
                            </Text>
                        </div>
                    </div>
                    <Button
                        variant="gradient"
                        size="xs"
                        radius="xl"
                        fw={400}
                        className="ml-auto"
                        onClick={() => setIsBridgeModalActive(true)}
                    >
                        {t('bridge_underlying_balance_card.bridge_to_flare_button')}
                    </Button>
                </div>
                <div className="flex items-center border-t pt-2 mt-2 w-full">
                    <div className="flex items-center">
                        {FXrpHypeCoreIcon({
                            width: "32",
                            height: "32"
                        })}
                        <div className="ml-3">
                            <Text
                                c="var(--flr-gray)"
                                className="text-12"
                                fw={400}
                            >
                                {bridgeToken.type} ({t('bridge_underlying_balance_card.hyper_core_label')})
                            </Text>
                            <Text
                                className="text-14"
                                fw={500}
                            >
                                {formatNumber(fAssetHyperliquidBalance)}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
            <BridgeModal
                opened={isBridgeModalActive}
                onClose={closeModal}
                token={bridgeToken}
                type="flare"
            />
        </Paper>
    )
}