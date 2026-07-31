import { Button, LoadingOverlay, Paper } from "@mantine/core";
import React, { useMemo, useRef, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useTranslation } from "react-i18next";
import { BridgeType, IFAssetCoin } from "@/types";
import { COINS } from "@/config/coin";
import BridgeModal from "@/components/modals/BridgeModal";
import { useInterval } from "@mantine/hooks";
import { BALANCE_FETCH_INTERVAL, BRIDGE_DESTINATION_CHAIN, BRIDGE_TYPE } from "@/constants";
import { isBridgeChainEnabled } from "@/config/bridge";
import BalanceRow from "@/components/cards/BalanceRow";
import CardHeader from "@/components/cards/CardHeader";

interface IHyperLiquidBalanceCard {
    className?: string;
}

// Destinations reachable from Flare. HYPER_CORE opens a modal with a SegmentedControl
// (HyperEVM vs Hyperliquid Spot); Ethereum is a single route.
//
// A route stays hidden until its destination chain is enabled — without a wired peer
// `quoteSend` would revert and the user would get nothing but an error.
const BRIDGE_ACTIONS: { type: BridgeType; labelKey: string }[] = [
    { type: BRIDGE_TYPE.ETHEREUM, labelKey: 'bridge_to_ethereum_button' },
    { type: BRIDGE_TYPE.HYPER_CORE, labelKey: 'bridge_to_hype_button' },
].filter(action => isBridgeChainEnabled(BRIDGE_DESTINATION_CHAIN[action.type]));

export default function BridgeBalanceCard({ className }: IHyperLiquidBalanceCard) {
    const { mainToken } = useWeb3();
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState<BridgeType | null>(null);
    const activeToken = useRef<IFAssetCoin>();
    const nativeBalance = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined);

    useInterval(
        () => {
            nativeBalance.refetch();
        },
        BALANCE_FETCH_INTERVAL,
        { autoInvoke: true },
    );

    const tokens = useMemo<IFAssetCoin[]>(() => {
        if (!nativeBalance.data) return [];
        return nativeBalance.data
            .filter(item => COINS.find(coin => coin.enabled && coin.type === item.symbol))
            .map(balance => {
                const coin = COINS.find(coin => coin.enabled && coin.type === balance.symbol);
                return {
                    ...coin!,
                    ...balance,
                };
            })
            .filter(coin => coin?.balance !== undefined);
    }, [nativeBalance.data]);

    const closeModal = () => {
        activeToken.current = undefined;
        setActiveModal(null);
    }


    return (
        <Paper
            className={`min-h-32 relative p-6 sm:p-8 border-primary ${className}`}
            withBorder
        >
            <LoadingOverlay visible={mainToken !== undefined && nativeBalance.isPending} zIndex={2} />
            <CardHeader
                className="mb-5"
                title={mainToken?.nativeName?.toLowerCase()?.includes('sgb')
                    ? t('bridge_balance_card.sgb_address_label')
                    : t('bridge_balance_card.flr_address_label')}
                address={mainToken?.address}
                explorerHref={`${mainToken?.network.explorerAddressUrl}/${mainToken?.address}`}
                explorerLabel={t('bridge_balance_card.view_on_explorer_button')}
            />
            {tokens.map(token => (
                <BalanceRow
                    key={token.symbol}
                    icon={token?.icon !== null && token.icon()}
                    label={token?.symbol}
                    value={token?.balance}
                    action={token?.isFAssetCoin && BRIDGE_ACTIONS.map(({ type, labelKey }) => (
                        <Button
                            key={type}
                            variant="gradient"
                            size="xs"
                            radius="xl"
                            fw={400}
                            onClick={() => {
                                activeToken.current = token;
                                setActiveModal(type);
                            }}
                        >
                            {t(`bridge_balance_card.${labelKey}`)}
                        </Button>
                    ))}
                />
            ))}
            {BRIDGE_ACTIONS.map(({ type }) => (
                <BridgeModal
                    key={type}
                    opened={activeModal === type}
                    onClose={closeModal}
                    token={activeToken.current}
                    type={type}
                />
            ))}
        </Paper>
    )
}
