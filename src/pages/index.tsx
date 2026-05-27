import { useState, useEffect } from "react";
import {
	Container,
	Title,
	Grid,
	Flex,
	Box,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useMediaQuery, useMounted } from "@mantine/hooks";
import HomeChartCard from "@/components/cards/HomeChartCard";
import FAssetPositionCard from "@/components/cards/FAssetPositionCard";
import FassetsOverviewCard from "@/components/cards/FassetsOverviewCard";
import LimitCard from "@/components/cards/LimitCard";
import EarnCard from "@/components/cards/EarnCard";
import ProofOfReservesCard from "@/components/cards/ProofOfReservesCard";
import { useEcosystemInfo } from "@/api/minting";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useUserPools } from "@/api/pool";
import { useEarn } from "@/api/earn";
import { COINS } from "@/config/coin";
import { toNumber } from "@/utils";
import classes from "@/styles/pages/Home.module.scss";

export default function Home() {
	const [fetchPools, setFetchPools] = useState<boolean>(false);

	const { t } = useTranslation();
	const { isConnected, mainToken } = useWeb3();
	const isMobile = useMediaQuery("(max-width: 767px)");
	const ecoSystemInfo = useEcosystemInfo();
	const balance = useNativeBalance(
		mainToken?.address!,
		mainToken?.address !== undefined,
	);
	const userPools = useUserPools(
		mainToken?.address!,
		COINS.filter((coin) => coin.isFAssetCoin && coin.enabled).map(
			(coin) => coin.type,
		),
		fetchPools,
	);
	const earn = useEarn();
	const isMounted = useMounted();
	const zeroBalanceAssets = balance.data?.filter(
		(balance) => balance.balance === "0" && "lots" in balance,
	).length;
	const totalLotsAssets = balance.data?.filter(
		(balance) => "lots" in balance,
	).length;
	const hasNoAssets =
		zeroBalanceAssets === totalLotsAssets &&
		userPools?.data !== undefined &&
		userPools.data?.filter((pool) => toNumber(pool.userPoolNatBalance!) > 0)
			.length === 0;

	useEffect(() => {
		if (!isMounted || !isConnected) return;

		if (userPools.data === undefined) {
			setFetchPools(true);
		}
	}, [isMounted, isConnected]);

	return (
		<div>
			<Container fluid p={0} className={`${classes.container} mt-8 mb-1 sm:mb-5`}>
				<Flex
					direction={{ base: "column-reverse", sm: "row" }}
					gap="md"
					justify="space-between"
					align={{ base: "stretch", sm: "center" }}
					px={isMobile ? 0 : 10}
				>
					<Title className="text-32" ml={{ base: 16, sm: 0 }} fw={300}>
						{t("home.title")}
					</Title>
						{isConnected && (
							<Box w={{ base: "100%", sm: 510 }}>
								<FAssetPositionCard
									balance={balance.data}
									isLoading={balance.isPending}
								/>
							</Box>
						)}
				</Flex>
			</Container>
			<Container fluid p={0} className={classes.container}>
				<Grid
					styles={{
						root: {
							"--grid-col-padding": isMobile ? "0px" : "10px",
							"--grid-gutter": 0,
						},
					}}
				>
                    <Grid.Col span={12} className="mt-5 md:mt-0">
						<HomeChartCard
							ecoSystemInfo={ecoSystemInfo.data}
						/>
					</Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }} className="mt-5 md:mt-0">
						<FassetsOverviewCard
							ecoSystemInfo={ecoSystemInfo.data}
						/>
					</Grid.Col>
					
					<Grid.Col span={{ base: 12, md: 6 }} className="mt-5 md:mt-0">
						<LimitCard
							limits={ecoSystemInfo.data?.limits}
							isLoading={ecoSystemInfo.isPending}
						/>
					</Grid.Col>
               	
					<Grid.Col span={12} className="mt-5 md:mt-0">
						<ProofOfReservesCard
							ecoSystemInfo={ecoSystemInfo.data}
						/>
					</Grid.Col>
					{earn.data && Object.keys(earn.data).length > 0 && (
						<Grid.Col span={12} className="mt-5 md:mt-0">
							<EarnCard earn={earn.data} />
						</Grid.Col>
					)}
				</Grid>
			</Container>
		</div>
	);
}
