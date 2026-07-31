import { Button, LoadingOverlay, Paper, Text } from "@mantine/core";
import React, { useRef, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTranslation } from "react-i18next";
import { toNumber } from "@/utils";
import { useRedeemerAccount, IRedeemerBalance } from "@/api/oft";
import RedeemerWithdrawModal from "@/components/modals/RedeemerWithdrawModal";
import { useInterval } from "@mantine/hooks";
import { COINS } from "@/config/coin";
import { BALANCE_FETCH_INTERVAL } from "@/constants";
import BalanceRow from "@/components/cards/BalanceRow";
import CardHeader from "@/components/cards/CardHeader";

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

	useInterval(
		() => {
			redeemerAccount.refetch();
		},
		BALANCE_FETCH_INTERVAL,
		{ autoInvoke: true },
	);

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
			<CardHeader
				className="mb-5"
				title={mainToken?.nativeName?.toLowerCase()?.includes("sgb")
					? t('bridge_account_balance_card.sgb_bridge_account')
					: t('bridge_account_balance_card.flr_bridge_account')}
				address={redeemerAddress || undefined}
				explorerHref={`${mainToken?.network.explorerAddressUrl}/${redeemerAddress}`}
				explorerLabel={t("bridge_balance_card.view_on_explorer_button")}
			/>
			{activeBalances.map((balance) => {
				const coin = COINS.find(c => c.type === balance.symbol);
				return (
					<BalanceRow
						key={balance.symbol}
						icon={coin?.icon != null && coin.icon()}
						label={balance.symbol}
						value={balance.balance}
						action={toNumber(balance.balance) > 0 && (
							<Button
								variant="gradient"
								size="xs"
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
					/>
				);
			})}
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
