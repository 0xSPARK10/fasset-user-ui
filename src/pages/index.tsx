import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Tabs,
    Container,
    Title,
    Button,
    Grid,
    Text
} from "@mantine/core";
import { Cookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useMediaQuery, useMounted }  from "@mantine/hooks";
import BlingIcon from "@/components/icons/BlingIcon";
import CollateralPoolsCard from "@/components/cards/CollateralPoolsCard";
import MintRedeemChartCard from "@/components/cards/MintRedeemChartCard";
import FAssetPositionCard from "@/components/cards/FAssetPositionCard";
import MyPoolsPositionCard from "@/components/cards/MyPoolsPositionCard";
import EcoSystemInformationCard from "@/components/cards/EcoSystemInformationCard";
import FAssetWindDownModal from "@/components/modals/FAssetWindDownModal";
import FassetsOverviewCard from "@/components/cards/FassetsOverviewCard";
import CollateralCard from "@/components/cards/CollateralCard";
import CoreVaultCard from "@/components/cards/CoreVaultCard";
import { useEcosystemInfo, useMintEnabled } from "@/api/minting";
import { useTimeData } from "@/api/user";
import { FILTERS, COOKIE_WINDDOWN } from "@/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { useUserPools } from "@/api/pool";
import { COINS } from "@/config/coin";
import { toNumber } from "@/utils";
import { useRouter } from "next/router";
import classes from "@/styles/pages/Home.module.scss";

export default function Home() {
    const [activeFilter, setActiveFilter] = useState<string | null>(FILTERS.LAST_WEEK);
    const [fetchPools, setFetchPools] = useState<boolean>(false);
    const [isFAssetWindDownModalActive, setIsFAssetWindDownModalActive] = useState<boolean>(false);
    const [disabledFassets, setDisabledFAssets] = useState<string[]>([]);

    const { t } = useTranslation();
    const { isConnected, mainToken } = useWeb3();
    const isMobile = useMediaQuery('(max-width: 767px)');
    const ecoSystemInfo = useEcosystemInfo();
    const timeData = useTimeData(activeFilter as string);
    const balance = useNativeBalance(mainToken?.address!, mainToken?.address !== undefined);
    const userPools = useUserPools(mainToken?.address!, COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type), fetchPools);
    const mintEnabled = useMintEnabled();
    const isMounted = useMounted();
    const cookies = new Cookies();
    const router = useRouter();

    const zeroBalanceAssets = balance.data?.filter(balance => balance.balance === '0' && 'lots' in balance).length;
    const totalLotsAssets = balance.data?.filter(balance => 'lots' in balance).length;
    const hasNoAssets = zeroBalanceAssets === totalLotsAssets
        && userPools?.data !== undefined && userPools.data?.filter(pool => toNumber(pool.userPoolNatBalance!) > 0).length === 0;
    const isSingleFassetEnabled = COINS.filter(coin => coin.isFAssetCoin && coin.enabled).length === 1;

    useEffect(() => {
        if (!isMounted || !isConnected) return;

        if (userPools.data === undefined) {
            setFetchPools(true);
        }
    }, [isMounted, isConnected]);

    useEffect(() => {
        if (!mintEnabled.data) return;

        const cookieFassets = cookies.get(COOKIE_WINDDOWN) ? Object.keys(cookies.get(COOKIE_WINDDOWN)).map(key => key) : [];
        const fAssets = mintEnabled.data.filter(item => !item.status && !cookieFassets.includes(item.fasset)).map(item => item.fasset);
        setDisabledFAssets(fAssets);

        if (fAssets.length > 0) {
            setIsFAssetWindDownModalActive(true);
        }
    }, [mintEnabled.data]);

    const onFAssetWindDownModalClose = async (redirect: boolean) => {
        setIsFAssetWindDownModalActive(false);

        if (redirect) {
            await router.push('/mint');
        }
    }

    return (
        <div>
            <div className={`flex items-end bg-[var(--flr-lightest-gray)] border-b border-[--flr-border-color] min-h-11 overflow-x-auto ${classes.filters}`}>
                <Container fluid className={`${classes.container} md:!pr-2.5`}>
                    <Tabs
                        value={activeFilter}
                        onChange={setActiveFilter}
                        classNames={{
                            root: 'flex',
                            list: 'ml-auto flex-nowrap',
                            tab: `text-[--flr-gray] ${classes.tab}`
                        }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value={FILTERS.LAST_24_HOURS}>{t('home.filters.last_24_hours_label')}</Tabs.Tab>
                            <Tabs.Tab value={FILTERS.LAST_WEEK}>{t('home.filters.last_week_label')}</Tabs.Tab>
                            <Tabs.Tab value={FILTERS.LAST_MONTH}>{t('home.filters.last_month_label')}</Tabs.Tab>
                            <Tabs.Tab value={FILTERS.YEAR_TO_DATE}>{t('home.filters.year_to_date_label')}</Tabs.Tab>
                            <Tabs.Tab value={FILTERS.LAST_YEAR}>{t('home.filters.last_year_label')}</Tabs.Tab>
                            <Tabs.Tab value={FILTERS.ALL_TIME}>{t('home.filters.all_time_label')}</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </Container>
            </div>
            <Container fluid className={`${classes.container} mt-8`}>
                <Grid
                    styles={{
                        root: {
                            '--grid-col-padding': isMobile ? '0px' : '10px',
                            '--grid-gutter': 0
                        }
                    }}
                >
                    <Grid.Col span={{ base: 12, md: 5 }} className="flex items-center px-[10px] mb-3 md:mb-0">
                        <div className="flex w-full items-center">
                            <Title className="text-26 mr-auto md:mr-10" fw={300}>{t('home.title')}</Title>
                            <Button
                                variant="filled"
                                color="var(--flr-black)"
                                component={Link}
                                href="/mint"
                                radius="xl"
                                fw={400}
                                size={isMobile ? 'xs' : 'sm'}
                                h={isMobile ? 34 : 44}
                                rightSection={<BlingIcon width="14" height="14" />}
                                className="mr-3"
                            >
                                {t('home.mint_fassets_button')}
                            </Button>
                            <Button
                                variant="gradient"
                                component={Link}
                                href="/pools"
                                radius="xl"
                                h={isMobile ? 34 : 44}
                                p="11px"
                                size={isMobile ? 'xs' : 'sm'}
                                fw={400}
                            >
                                {t('home.view_pools_button')}
                            </Button>
                        </div>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <EcoSystemInformationCard ecoSystemInfo={ecoSystemInfo.data} />
                    </Grid.Col>
                </Grid>
            </Container>
            <Container fluid className={classes.container}>
                <Grid
                    styles={{
                        root: {
                            '--grid-col-padding': isMobile ? '0px' : '10px',
                            '--grid-gutter': 0
                        }
                    }}
                >
                    {isConnected &&
                        <Grid.Col span={12} className="pb-0">
                            <Grid
                                styles={{
                                    root: {
                                        '--grid-col-padding': isMobile ? '0px' : '10px',
                                        '--grid-gutter': 0
                                    }
                                }}
                            >
                                {(!hasNoAssets || isMobile) &&
                                    <>
                                        <Grid.Col span={{ base: 12, lg: isSingleFassetEnabled ? 4 : 6 }} className="px-0 min-[1200px]:pr-[10px] mt-5 md:mt-0 pl-0">
                                            <FAssetPositionCard
                                                balance={balance.data}
                                                isLoading={balance.isPending}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, lg: isSingleFassetEnabled ? 8 : 6 }} className="px-0 min-[1200px]:pl-[10px] mt-5 md:mt-0">
                                            <MyPoolsPositionCard
                                                pools={userPools.data}
                                                isLoading={userPools.isPending}
                                            />
                                        </Grid.Col>
                                    </>
                                }
                                {hasNoAssets && !isMobile && !userPools.isPending && !balance.isPending &&
                                    <Grid.Col
                                        span={12}
                                        className="bg-[var(--flr-lightest-gray)] border border-[var(--flr-border-color)] px-[15px] lg:px-6 py-4 mt-5"
                                    >
                                        <Text className="text-14" fw={400}>{t('home.no_assets_label')}</Text>
                                    </Grid.Col>
                                }
                            </Grid>
                        </Grid.Col>
                    }
                    <Grid.Col span={{ base: 12, lg: 6 }} className="mt-5 md:mt-0">
                        <FassetsOverviewCard
                            ecoSystemInfo={ecoSystemInfo.data}
                            timeData={timeData.data}
                            mintEnabled={mintEnabled.data}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }} className="mt-5 md:mt-0">
                        <CollateralCard
                            ecoSystemInfo={ecoSystemInfo.data}
                            timeData={timeData.data}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }} className="mt-5 md:mt-0">
                        <CoreVaultCard
                            ecoSystemInfo={ecoSystemInfo.data}
                            timeData={timeData.data}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 6 }} className="mt-5 md:mt-0">
                        <CollateralPoolsCard
                            ecoSystemInfo={ecoSystemInfo.data}
                            timeData={timeData.data}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 6 }} className="mt-5 md:mt-0">
                        <MintRedeemChartCard
                            timeData={timeData.data}
                            ecoSystemInfo={ecoSystemInfo.data}
                            filter={activeFilter}
                        />
                    </Grid.Col>
                </Grid>
            </Container>
            {disabledFassets.length > 0 &&
                <FAssetWindDownModal
                    opened={isFAssetWindDownModalActive}
                    onClose={onFAssetWindDownModalClose}
                    fAssets={disabledFassets}
                />
            }
        </div>
    );
}
