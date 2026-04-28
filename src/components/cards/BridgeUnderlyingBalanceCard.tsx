import {
	Anchor,
	Button,
	LoadingOverlay,
	Paper,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { useHypeBalance, useHyperEVMBalance } from "@/hooks/useContracts";
import { formatNumber, formatUnit, truncateString } from "@/utils";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import CopyIcon from "@/components/icons/CopyIcon";
import { IconArrowUpRight } from "@tabler/icons-react";
import { FTEST_XRP_HYPE, FXRP_HYPE } from "@/config/coin";
import { useNetworks } from "@/hooks/useNetworks";
import BridgeModal from "@/components/modals/BridgeModal";
import React, { useEffect, useState } from "react";
import { BridgeType, ICoin } from "@/types";
import { useInterval } from "@mantine/hooks";
import { useHyperliquidBalance } from "@/api/bridge";
import { useUnderlyingBalance } from "@/api/balance";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import HypeIcon from "@/components/icons/HypeIcon";
import { BALANCE_FETCH_INTERVAL, BRIDGE_TYPE } from "@/constants";
import HoverTooltip from "@/components/elements/HoverTooltip";

interface IBridgeUnderlyingBalanceCard {
	className?: string;
}

export default function BridgeUnderlyingBalanceCard({
	className,
}: IBridgeUnderlyingBalanceCard) {
	const { mainToken, connectedCoins } = useWeb3();
	const { isMainnet } = useNetworks();
	const [isBridgeFlareModalActive, setIsBridgeFlareModalActive] =
		useState<boolean>(false);
	const [isBridgeXrplModalActive, setIsBridgeXrplModalActive] =
		useState<boolean>(false);
	const hyperEVMBalance = useHyperEVMBalance();
	const hyperliquidBalance = useHyperliquidBalance(
		mainToken?.address!,
		mainToken?.address !== undefined,
	);
	const hypeBalance = useHypeBalance(mainToken?.address !== undefined);
	const { t } = useTranslation();
	const [bridgeToken, setBridgeToken] = useState<ICoin>(
		isMainnet ? FXRP_HYPE : FTEST_XRP_HYPE,
	);

	const connectedXrpCoin = connectedCoins.find(
		(coin) => coin.type === bridgeToken.type,
	);
	const underlyingBalance = useUnderlyingBalance(
		connectedXrpCoin?.address ?? "",
		bridgeToken.type,
		connectedXrpCoin?.address !== undefined,
	);
	const hasDepositAuth =
		underlyingBalance.data?.accountInfo?.depositAuth === true;
	const hasRequireDestTag =
		underlyingBalance.data?.accountInfo?.requireDestTag === true;
	const isXrplDisabled = hasDepositAuth || hasRequireDestTag;
	const [fAssetHyperliquidBalance, setFAssetHyperliquidBalance] =
		useState<string>("0.00");

	useEffect(() => {
		if (!hyperEVMBalance.data) return;

		setBridgeToken({
			...bridgeToken,
			balance: formatUnit(hyperEVMBalance.data, 6),
		});
		bridgeBalanceFetchInterval.start();

		return () => {
			bridgeBalanceFetchInterval.stop();
		};
	}, [hyperEVMBalance.data]);

	useEffect(() => {
		if (
			!hyperliquidBalance.data ||
			hyperliquidBalance.data.balances.length === 0
		)
			return;

		let balance = hyperliquidBalance.data.balances.find(
			(balance) => balance.coin.toLowerCase() === "fxrp",
		);
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
					<Title className="mr-3 text-15" fw={500}>
						{t("bridge_underlying_balance_card.title")}
					</Title>
					<div className="flex items-center break-all mr-3">
						<Text className="block text-15" fw={400}>
							{truncateString(mainToken?.address ?? "", 8, 8)}
						</Text>
						<CopyIcon text={mainToken?.address ?? ""} color="#AFAFAF" />
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
					{t("balance_card.view_on_explorer_button")}
					<IconArrowUpRight size={20} className="ml-1 flex-shrink-0" />
				</Anchor>
			</div>
			<div className="flex flex-col md:items-center">
				<div className="flex items-center border-t pt-2 mt-5 w-full">
					<div className="flex items-center">
						{HypeIcon({
							width: "32",
							height: "32",
						})}
						<div className="ml-3">
							<Text c="var(--flr-gray)" className="text-12" fw={400}>
								{t("bridge_underlying_balance_card.hype_label")}
							</Text>
							<Text className="text-14" fw={500}>
								{hypeBalance.data
									? formatNumber(formatUnit(hypeBalance.data, 18))
									: "0.00"}
							</Text>
						</div>
					</div>
				</div>
				<div className="flex items-center border-t pt-2 mt-2 w-full">
					<div className="flex items-center">
						{FXrpHypeEVMIcon({
							width: "32",
							height: "32",
						})}
						<div className="ml-3">
							<Text c="var(--flr-gray)" className="text-12" fw={400}>
								{bridgeToken.type} (
								{t("bridge_underlying_balance_card.hyper_evm_label")})
							</Text>
							<Text className="text-14" fw={500}>
								{hyperEVMBalance.data
									? formatNumber(formatUnit(hyperEVMBalance.data, 6))
									: "0.00"}
							</Text>
						</div>
					</div>
					<div className="ml-auto flex gap-[10px]">
						<Button
							variant="gradient"
							size="xs"
							radius="xl"
							fw={400}
							onClick={() => setIsBridgeFlareModalActive(true)}
						>
							{t("bridge_underlying_balance_card.bridge_to_flare_button")}
						</Button>
							<Button
								variant="gradient"
								size="xs"
								radius="xl"
								fw={400}
								onClick={() => setIsBridgeXrplModalActive(true)}
							>
								{t("bridge_underlying_balance_card.bridge_to_xrpl_button")}
							</Button>
					</div>
				</div>
				<div className="flex items-center border-t pt-2 mt-2 w-full">
					<div className="flex items-center">
						{FXrpHypeCoreIcon({
							width: "32",
							height: "32",
						})}
						<div className="ml-3">
							<Text c="var(--flr-gray)" className="text-12" fw={400}>
								{bridgeToken.type} (
								{t("bridge_underlying_balance_card.hyper_core_label")})
							</Text>
							<Text className="text-14" fw={500}>
								{formatNumber(fAssetHyperliquidBalance)}
							</Text>
						</div>
					</div>
				</div>
			</div>
			<BridgeModal
				opened={isBridgeFlareModalActive}
				onClose={() => setIsBridgeFlareModalActive(false)}
				token={bridgeToken}
				type={BRIDGE_TYPE.FLARE}
			/>
			<BridgeModal
				opened={isBridgeXrplModalActive}
				onClose={() => setIsBridgeXrplModalActive(false)}
				token={bridgeToken}
				type={BRIDGE_TYPE.XRPL}
			/>
		</Paper>
	);
}
