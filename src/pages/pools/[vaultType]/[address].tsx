import React, { useEffect } from "react";
import {
    Container,
    Loader,
    LoadingOverlay,
    Text,
    Title,
    Grid,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/elements/BackButton";
import VaultDetailsCard from "@/components/cards/VaultDetailsCard";
import VaultCapacityCard from "@/components/cards/VaultCapacityCard";
import VaultCollateralCard from "@/components/cards/VaultCollateralCard";
import PoolCollateralCard from "@/components/cards/PoolCollateralCard";
import { useUserPool, usePool } from "@/api/pool";
import { useWeb3 } from "@/hooks/useWeb3";
import classes from "@/styles/pages/Agents.module.scss";

export default function AgentDetails() {
    const router = useRouter();
    const { mainToken, isConnected } = useWeb3();
    const { t } = useTranslation();

    const vaultType = router.query.vaultType as string;
    const poolAddress = router.query.address as string;

    const userPool = useUserPool(
        vaultType,
        mainToken?.address ?? '',
        poolAddress,
        vaultType?.length > 0 && poolAddress?.length > 0 && mainToken !== undefined && isConnected
    );
    const guestPool = usePool(
        vaultType,
        poolAddress,
        vaultType?.length > 0 && poolAddress?.length > 0 && !isConnected
    );

    const pool = isConnected
        ? userPool
        : guestPool;

    useEffect(() => {
        if (!pool.isPending && String(pool.data) === '') {
             router.push('/404');
        }
    }, [pool.data]);

    return (
        <Container fluid className={`${classes.container} mt-8`}>
            <LoadingOverlay
                visible={pool.isPending}
                loaderProps={{
                    children: <div className="flex items-center">
                        <Loader className="mr-3" style={{ zIndex: 1000 }} />
                        <Text>{t('agent_details.loading_label')}</Text>
                    </div>
                }}
            />
            <BackButton
                href="/pools"
                text={t('agent_details.back_button')}
                className="hidden md:inline-block mt-3"
            />
            <Title
                fw={300}
                className="text-32 px-[10px] md:px-0"
            >
                {t('agent_details.title')}
            </Title>
            <VaultDetailsCard pool={pool?.data} />
            <Grid className="mt-12">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <VaultCapacityCard pool={pool.data} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <VaultCollateralCard pool={pool.data} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }} style={{ marginTop: '3.2rem' }}>
                    <PoolCollateralCard pool={pool.data} />
                </Grid.Col>
            </Grid>
        </Container>
);
}
