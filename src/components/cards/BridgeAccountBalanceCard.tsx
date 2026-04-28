import {
	Anchor,
	Button,
	LoadingOverlay,
	Paper,
	Text,
	Title,
} from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTranslation } from "react-i18next";
import { truncateString, toNumber } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useRedeemerAccount, IRedeemerBalance } from "@/api/oft";
import RedeemerWithdrawModal from "@/components/modals/RedeemerWithdrawModal";
import { useInterval } from "@mantine/hooks";
import { COINS } from "@/config/coin";
import { BALANCE_FETCH_INTERVAL } from "@/constants";

interface IBridgeAccountBalanceCard {
	className?: string;
}
const MIN_DISPLAY_BALANCE = 0.01;

export default function BridgeAccountBalanceCard({
	className,
}: IBridgeAccountBalanceCard) {
	const { mainToken } = useWeb3();
	const { t } = useTranslation();
	const [isModalActive, setIsModalActive] = useState<boolean>(false);
	const activeToken = useRef<IRedeemerBalance>();

	const redeemerAccount = useRedeemerAccount(
		mainToken?.address ?? "",
		mainToken !== undefined,
	);

	const balanceFetchInterval = useInterval(() => {
		redeemerAccount.refetch();
	}, BALANCE_FETCH_INTERVAL);

	useEffect(() => {
		if (!redeemerAccount.data) return;
		balanceFetchInterval.start();

		return () => {
			balanceFetchInterval.stop();
		};
	}, [redeemerAccount.data]);

	const closeModal = () => {
		activeToken.current = undefined;
		setIsModalActive(false);
	};


	const redeemerAddress = redeemerAccount.data?.address ?? "";
	const balances = redeemerAccount.data?.balances ?? [];
	const activeBalances = balances.filter(b => toNumber(b.balance) >= MIN_DISPLAY_BALANCE);

	if (activeBalances.length === 0) return null;

	return (
		<Paper
			className={`min-h-32 relative p-6 sm:p-8 border-primary ${className}`}
			withBorder
		>
			<LoadingOverlay
				visible={mainToken !== undefined && redeemerAccount.isPending}
				zIndex={2}
			/>
			<div className="flex justify-between items-baseline mb-5">
				<div className="flex flex-col sm:flex-row sm:items-center">
					<Title fw={500} className="text-15 mr-3">
						{mainToken?.nativeName?.toLowerCase()?.includes("sgb")
							? t('bridge_account_balance_card.sgb_bridge_account')
							: t('bridge_account_balance_card.flr_bridge_account')}
					</Title>
					{redeemerAddress && (
						<div className="flex items-center break-all mr-3">
							<Text fw={400} className="text-15 block">
								{truncateString(redeemerAddress, 8, 8)}
							</Text>
							<CopyIcon text={redeemerAddress} color="#AFAFAF" />
						</div>
					)}
				</div>
				{redeemerAddress && (
					<Anchor
						underline="always"
						href={`${mainToken?.network.explorerAddressUrl}/${redeemerAddress}`}
						target="_blank"
						className="inline-flex items-center text-12"
						c="var(--flr-black)"
						fw={500}
					>
						{t("bridge_balance_card.view_on_explorer_button")}
						<IconArrowUpRight size={20} className="ml-1 flex-shrink-0" />
					</Anchor>
				)}
			</div>
			{activeBalances.map((balance) => {
				const coin = COINS.find(c => c.type === balance.symbol);
				return (
				<div
					key={balance.symbol}
					className="flex max-[360px]:flex-col justify-between border-t mt-2 pt-2"
				>
					<div className="flex items-center">
						{coin?.icon != null && coin.icon()}
						<div className="ml-3">
							<Text c="var(--flr-gray)" className="text-12" fw={400}>
								{balance.symbol}
							</Text>
							<Text className="text-14" fw={500}>
								{balance.balance}
							</Text>
						</div>
					</div>
					{toNumber(balance.balance) > 0 && (
						<Button
							variant="gradient"
							size="xs"
							className="mr-3"
							radius="xl"
							fw={400}
							onClick={() => {
								activeToken.current = balance;
								setIsModalActive(true);
							}}
						>
							{t("bridge_account_balance_card.transfer_button")}
						</Button>
					)}
				</div>
			)})}
			<div className="border-t mt-2 pt-2">
				<Text className="text-14">
					<span className="font-bold">{t("bridge_account_balance_card.asset_recovery")}</span>
					{' '}
					{t("bridge_account_balance_card.asset_recovery_description")}
				</Text>
			</div>
			<RedeemerWithdrawModal
				opened={isModalActive}
				onClose={closeModal}
				token={activeToken.current}
				redeemerAddress={redeemerAddress}
			/>
		</Paper>
	);
}
