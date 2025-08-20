import {useCallback, useEffect, useState} from "react";
import {
    Container,
    LoadingOverlay,
    Loader,
    Title,
    Text
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { orderBy } from "lodash-es";
import PoolsPositionCard from "@/components/cards/PoolsPositionCard";
import PoolsTable from "@/components/pools/PoolsTable";
import { useWeb3 } from "@/hooks/useWeb3";
import { usePools, useUserPools } from "@/api/pool";
import { showErrorNotification } from "@/hooks/useNotifications";
import { COINS } from "@/config/coin";
import { IPool } from "@/types";
import classes from "@/styles/pages/Agents.module.scss";

export default function Agents() {
    const [allPools, setAllPools] = useState<IPool[]>([]);
    const [activePools, setActivePools] = useState<IPool[]>([]);
    const [otherPools, setOtherPools] = useState<IPool[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const { t } = useTranslation();
    const { walletConnectConnector, isConnected, mainToken } = useWeb3();

    const pools = usePools(COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type), false);
    const userPools = useUserPools(
        mainToken?.address!,
        COINS.filter(coin => coin.isFAssetCoin && coin.enabled).map(coin => coin.type),
        false
    );

    useEffect(() => {
        if (walletConnectConnector.isInitializing || !walletConnectConnector.hasCheckedPersistedSession) return;
        fetchPools();
    }, [walletConnectConnector, isConnected]);

    useEffect(() => {
        if (isConnected) {
            setPools(userPools.data ?? allPools);
        } else {
            setPools(pools.data ?? allPools);
        }
    }, [userPools.data, pools.data, allPools]);


    const fetchPools = useCallback(async () => {
        try {
            setIsLoading(true);

            let response;
            if (isConnected) {
                if (userPools.data) {
                    response = userPools;
                } else {
                    await queryClient.invalidateQueries();
                    response = await userPools.refetch();
                }
            } else {
                if (pools.data) {
                    response = pools;
                } else {
                    await queryClient.invalidateQueries();
                    response = await pools.refetch();
                }
            }

            if (response?.data) {
                setAllPools(response.data!);
            }
        } catch (error: any) {
            error = error as AxiosError;
            showErrorNotification(error?.response?.data?.message);
        } finally {
            setIsLoading(false);
        }
    }, [userPools, pools, isConnected]);

    const setPools = (pools: IPool[]) => {
        let activePools: IPool[] = [];
        let otherPools: IPool[] = [];
        pools.forEach(pool => {
            if (
                (pool.userPoolBalance && Number(pool.userPoolBalance) !== 0) ||
                (pool.userPoolNatBalance && Number(pool.userPoolNatBalance) !== 0) ||
                (pool.userPoolFees && Number(pool.userPoolFees) >= 0.01)) {
                activePools.push(pool);
            } else {
                otherPools.push(pool);
            }
        });

        activePools = orderBy(activePools, ['health', 'status'], ['asc', 'desc']);
        otherPools = orderBy(otherPools, ['health', 'status'], ['asc', 'desc']);

        setOtherPools(otherPools);
        setActivePools(activePools);
    }

    return (
        <Container fluid className={`${classes.container} relative mt-10`}>
            <LoadingOverlay
                visible={isLoading}
                loaderProps={{
                    children:
                        <div className="flex items-center">
                            <Loader className="mr-3" style={{zIndex: 2}}/>
                            <Text>{t('agents.loading_label')}</Text>
                        </div>
                }}
            />
            <Title
                fw={300}
                className="text-32 mb-3 px-[15px] md:px-0"
            >
                {t('agents.title')}
            </Title>
            <PoolsPositionCard pools={activePools} className="px-[15px] md:px-0" />
            <PoolsTable
                pools={activePools}
                type="active"
                className="mt-5"
            />
            <PoolsTable
                pools={otherPools}
                type="others"
                className="mt-5"
                style={{ maxWidth: '1100px' }}
                showAll={true}
            />
        </Container>
    )
}
