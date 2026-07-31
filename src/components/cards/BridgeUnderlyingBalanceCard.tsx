import { Button, LoadingOverlay, Paper } from "@mantine/core";
import { useHypeBalance, useHyperEVMBalance } from "@/hooks/useContracts";
import { formatNumber, formatUnit } from "@/utils";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { BRIDGE_FASSET_COIN, BRIDGE_GAS_COIN } from "@/config/coin";
import { isBridgeChainEnabled } from "@/config/bridge";
import BridgeModal from "@/components/modals/BridgeModal";
import React, { useMemo, useState } from "react";
import { BridgeChain, BridgeType, ICoin } from "@/types";
import { useInterval } from "@mantine/hooks";
import { useHyperliquidBalance } from "@/api/bridge";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import { BALANCE_FETCH_INTERVAL, BRIDGE_CHAIN, BRIDGE_TYPE } from "@/constants";
import { formatBalanceAmount } from "@/core/fees/format";
import BalanceRow from "@/components/cards/BalanceRow";
import CardHeader from "@/components/cards/CardHeader";

interface IBridgeUnderlyingBalanceCard {
	className?: string;
	/** Bridge chain whose balances this card shows. Defaults to HyperEVM. */
	chain?: BridgeChain;
}

interface IChainCardConfig {
	titleKey: string;
	gasLabelKey: string;
	fAssetLabelKey: string;
	/** Destinations reachable from this chain. */
	actions: { type: BridgeType; labelKey: string }[];
	/** The Hyperliquid Spot row exists only on HyperEVM. */
	showHyperCoreRow: boolean;
}

const CHAIN_CARD: Record<BridgeChain, IChainCardConfig | undefined> = {
	[BRIDGE_CHAIN.FLARE]: undefined,
	[BRIDGE_CHAIN.HYPER_EVM]: {
		titleKey: "title",
		gasLabelKey: "hype_label",
		fAssetLabelKey: "hyper_evm_label",
		actions: [
			{ type: BRIDGE_TYPE.FLARE, labelKey: "bridge_to_flare_button" },
			{ type: BRIDGE_TYPE.XRPL, labelKey: "bridge_to_xrpl_button" },
		],
		showHyperCoreRow: true,
	},
	[BRIDGE_CHAIN.ETHEREUM]: {
		titleKey: "ethereum_title",
		gasLabelKey: "eth_label",
		fAssetLabelKey: "ethereum_label",
		actions: [
			{ type: BRIDGE_TYPE.FLARE_FROM_ETH, labelKey: "bridge_to_flare_button" },
			{ type: BRIDGE_TYPE.XRPL_FROM_ETH, labelKey: "bridge_to_xrpl_button" },
		],
		showHyperCoreRow: false,
	},
};

export default function BridgeUnderlyingBalanceCard({
	className,
	chain = BRIDGE_CHAIN.HYPER_EVM,
}: IBridgeUnderlyingBalanceCard) {
	const { mainToken } = useWeb3();
	const { t } = useTranslation();
	const [activeModal, setActiveModal] = useState<BridgeType | null>(null);

	const cardConfig = CHAIN_CARD[chain];
	const gasCoin = BRIDGE_GAS_COIN[chain];

	// The card renders nothing for a chain the app does not offer (guard further down), but
	// hooks run before that early return — without gating here, a hidden card keeps polling
	// that chain's public RPC on every interval tick.
	//
	// Gated at the call site rather than inside the hooks on purpose: both bridge forms call
	// `useHypeBalance` with a HyperEVM fallback and disable themselves while its data is
	// undefined, so a hook-level gate would lock the Flare→Ethereum form on a deployment
	// where HyperEVM is switched off.
	const chainEnabled = isBridgeChainEnabled(chain);

	const fAssetBalance = useHyperEVMBalance(chainEnabled, chain);
	const gasBalance = useHypeBalance(chainEnabled && mainToken?.address !== undefined, chain);
	const hyperliquidBalance = useHyperliquidBalance(
		mainToken?.address ?? "",
		mainToken?.address !== undefined && !!cardConfig?.showHyperCoreRow,
	);

	useInterval(
		() => {
			// Repeated here so the tick cannot fetch regardless of how `refetch` treats `enabled`.
			if (!chainEnabled) return;
			fAssetBalance.refetch();
			gasBalance.refetch();
			if (cardConfig?.showHyperCoreRow) hyperliquidBalance.refetch();
		},
		BALANCE_FETCH_INTERVAL,
		{ autoInvoke: true },
	);

	const bridgeToken = useMemo<ICoin>(
		() => ({
			...BRIDGE_FASSET_COIN[chain],
			balance: fAssetBalance.data ? formatUnit(fAssetBalance.data, 6) : "0",
		}),
		[chain, fAssetBalance.data],
	);

	const fAssetHyperliquidBalance =
		hyperliquidBalance.data?.balances.find(
			(b) => b.coin.toLowerCase() === "fxrp",
		)?.total ?? "0.00";

	// The card appears only once the chain is enabled via ENABLED_BRIDGE_CHAINS.
	// See isBridgeChainEnabled — a configured address alone is no proof that the
	// contract is live on that chain and that peers are wired.
	if (!cardConfig || !isBridgeChainEnabled(chain)) return null;

	return (
		<Paper
			className={`min-h-32 relative p-6 sm:p-8 border-primary ${className}`}
			withBorder
		>
			<LoadingOverlay visible={fAssetBalance.isPending} zIndex={2} />
			<CardHeader
				title={t(`bridge_underlying_balance_card.${cardConfig.titleKey}`)}
				address={mainToken?.address}
				explorerHref={`${bridgeToken.network.explorerAddressUrl}/${mainToken?.address}`}
				explorerLabel={t("balance_card.view_on_explorer_button")}
			/>
			<div className="flex flex-col md:items-center">
				<BalanceRow
					className="mt-5"
					icon={gasCoin?.icon && gasCoin.icon({ width: "32", height: "32" })}
					label={t(`bridge_underlying_balance_card.${cardConfig.gasLabelKey}`)}
					value={
						gasBalance.data
							? formatBalanceAmount(
									formatUnit(gasBalance.data, 18),
									gasCoin?.decimals,
								)
							: formatBalanceAmount(0, gasCoin?.decimals)
					}
				/>
				<BalanceRow
					icon={
						bridgeToken?.icon
							? bridgeToken.icon({ width: "32", height: "32" })
							: <FXrpHypeEVMIcon width="32" height="32" />
					}
					label={`${bridgeToken.type} (${t(`bridge_underlying_balance_card.${cardConfig.fAssetLabelKey}`)})`}
					value={
						fAssetBalance.data
							? formatNumber(formatUnit(fAssetBalance.data, 6))
							: "0.00"
					}
					action={cardConfig.actions.map(({ type, labelKey }) => (
						<Button
							key={type}
							variant="gradient"
							size="xs"
							radius="xl"
							fw={400}
							onClick={() => setActiveModal(type)}
						>
							{t(`bridge_underlying_balance_card.${labelKey}`)}
						</Button>
					))}
				/>
				{cardConfig.showHyperCoreRow && (
					<BalanceRow
						icon={<FXrpHypeCoreIcon width="32" height="32" />}
						label={`${bridgeToken.type} (${t("bridge_underlying_balance_card.hyper_core_label")})`}
						value={formatNumber(fAssetHyperliquidBalance)}
					/>
				)}
			</div>
			{cardConfig.actions.map(({ type }) => (
				<BridgeModal
					key={type}
					opened={activeModal === type}
					onClose={() => setActiveModal(null)}
					token={bridgeToken}
					type={type}
				/>
			))}
		</Paper>
	);
}
