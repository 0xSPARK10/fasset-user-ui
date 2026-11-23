import React from "react";
import { Radio, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { BRIDGE_ROUTE_CHAINS, findBridgeRoute } from "@/config/bridgeRoutes";
import { BridgeRouteChain } from "@/types";
import classes from "@/styles/components/bridge/BridgeChainPicker.module.scss";

interface IBridgeChainList {
    value?: BridgeRouteChain;
    onChange: (chain: BridgeRouteChain) => void;
    // TO column: only chains reachable from `sourceChain` are enabled — all of them
    // stay locked until a source is picked. FROM column: always fully selectable.
    isDestination?: boolean;
    sourceChain?: BridgeRouteChain;
    // Display-ready balance per chain; a missing entry renders as `--`.
    balances?: Partial<Record<BridgeRouteChain, string>>;
    // System pause (FAsset or OFT) — every chain is locked
    isPaused?: boolean;
    // Why the connected wallet cannot use this row — the row is off and the reason shows on hover / tap
    getBlockReason?: (chain: BridgeRouteChain) => string | undefined;
}

export default function BridgeChainList({ value, onChange, isDestination, sourceChain, balances, isPaused, getBlockReason }: IBridgeChainList) {
    const { t } = useTranslation();

    const isDisabled = (chain: BridgeRouteChain) => !!isPaused || (!!isDestination && !findBridgeRoute(sourceChain, chain));

    return (
        <Radio.Group
            name={isDestination ? 'bridge-to' : 'bridge-from'}
            value={value ?? null}
            onChange={chain => onChange(chain as BridgeRouteChain)}
        >
            <div className="flex flex-col gap-1.5">
                {BRIDGE_ROUTE_CHAINS.map(item => {
                    const blockReason = getBlockReason?.(item.chain);
                    const disabled = isDisabled(item.chain) || !!blockReason;

                    return (
                        // A disabled card gets no pointer events — the wrapper carries the tooltip
                        <Tooltip
                            key={item.chain}
                            label={blockReason}
                            disabled={!blockReason}
                            events={{ hover: true, focus: true, touch: true }}
                            multiline
                            w={260}
                            withArrow
                        >
                            <div>
                                <Radio.Card
                                    value={item.chain}
                                    disabled={disabled}
                                    withBorder={false}
                                    radius={4}
                                    className={classes.row}
                                    data-disabled={disabled || undefined}
                                >
                                    <div className="flex items-center px-3 py-1.5">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="flex-shrink-0">{item.icon({ width: '36', height: '36' })}</span>
                                            <div className="flex flex-col">
                                                <Text className="text-16 leading-6" c="var(--flr-shark)">
                                                    {item.tokenSymbol}
                                                </Text>
                                                <Text className="text-10" c="var(--flr-gray)">
                                                    {t(`bridge_page.chains.${item.labelKey}`)}
                                                </Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <Text className="text-14 w-20 text-right" c="var(--flr-shark)">
                                                {balances?.[item.chain] ?? '--'}
                                            </Text>
                                            <Radio.Indicator
                                                size="md"
                                                variant="outline"
                                                color="black"
                                                disabled={disabled}
                                                className={classes.indicator}
                                            />
                                        </div>
                                    </div>
                                </Radio.Card>
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </Radio.Group>
    );
}
