import { Avatar, Grid, rem, Text, Title, Popover, Anchor } from "@mantine/core";
import { IconArrowUpRight, IconInfoHexagon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import CopyIcon from "@/components/icons/CopyIcon";
import { formatNumberWithSuffix, toLots, toNumber, truncateString } from "@/utils";
import { IPool } from "@/types";
import LogoIcon from "@/components/icons/LogoIcon";
import { COINS } from "@/config/coin";

interface IVaultDetailsCard {
    pool: IPool | undefined;    
}

export default function VaultDetailsCard({ pool }: IVaultDetailsCard) {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const totalPortfolioValue = pool
        ? toNumber(pool.poolOnlyCollateralUSD) + toNumber(pool.vaultOnlyCollateralUSD)
        : 0;
    const vaultToken = COINS.find(coin => coin.type.toLowerCase() === pool?.vaultType?.toLowerCase());
    const totalCollateral = pool
        ? toNumber(pool.vaultOnlyCollateralUSD) + toNumber(pool.poolOnlyCollateralUSD)
        : 0;

    let poolUrl = pool ? pool.infoUrl : '';
    if (!/^https?:\/\//i.test(poolUrl)) {
        poolUrl = 'https://' + poolUrl;
    }

    return (
        <div>
            <div className="flex items-center my-8">
                {pool?.url !== undefined && pool?.url?.length > 0 && pool?.url != '-'
                    ? <Avatar
                        radius={100}
                        src={pool?.url}
                        w={120}
                        h={120}
                        classNames={{
                            image: 'object-contain'
                        }}
                        className="mr-6"
                    />
                    : <LogoIcon width="120" height="120" />
                }
                <div>
                    <Title
                        className="text-24 sm:text-32"
                        fw={300}
                    >
                        {pool?.agentName}
                    </Title>
                    <Text
                        className="text-16 mt-3 uppercase"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('agent_details.vault_address_label')}
                    </Text>
                    <div className="flex items-center">
                        <Text
                            className="text-16 mt-1"
                            fw={400}
                        >
                            {truncateString(pool?.vault ?? '', 4, 4)}
                        </Text>
                        <CopyIcon
                            text={pool?.vault ?? ''}
                        />
                    </div>
                </div>
            </div>
            <Grid
                grow
                breakpoints={{xs: '1120px', sm: '1120px', md: '1120px', lg: '1120px', xl: '1450px'}}
                styles={{
                    root: {
                        '--grid-gutter': 0
                    },
                    col: {
                        padding: 0
                    }
                }}
            >
                <Grid.Col span={{base: 12, lg: 4, xl: 6}}>
                    <div className="border-b min-[1120px]:border-r border-[--flr-border-color] p-3 pb-[0.8rem]">
                        <Text
                            className="text-16 uppercase"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('agent_details.total_portfolio_value_label')}
                        </Text>
                        <Text
                            className="text-24 sm:text-80"
                            fw={300}
                        >
                            ${formatNumberWithSuffix(totalPortfolioValue)}
                        </Text>
                    </div>
                    <div className="p-3 min-[1120px]:border-r border-[--flr-border-color]">
                        <Text
                            className="text-16 uppercase mt-6 mb-1"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('agent_details.about_label')}
                        </Text>
                        <Text
                            className="text-16"
                            fw={400}
                        >
                            {pool?.description}
                        </Text>
                        <Text
                            className="text-16 uppercase mt-4 mb-1"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('agent_details.terms_of_use_label')}
                        </Text>
                        {pool && pool?.infoUrl?.replace(/\s/g, '')?.length > 0
                            ? <Anchor
                                underline="always"
                                href={poolUrl}
                                target="_blank"
                                className="inline-flex items-centertext-16"
                                c="var(--flr-black)"
                                fw={500}
                            >
                                {t('agent_details.learn_more_label')}
                                <IconArrowUpRight
                                    size={20}
                                    className="ml-1 flex-shrink-0"
                                />
                            </Anchor>
                            : <Text
                                className="text-16"
                                fw={400}
                            >
                                {t('agent_details.not_available_label')}
                            </Text>
                        }
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 8, xl: 6 }}>
                    <Grid
                        styles={{
                            root: {
                                '--grid-gutter': 0
                            },
                            inner: {
                                margin: 0,
                                width: '100%'
                            },
                            col: {
                                padding: 0
                            }
                        }}
                    >
                        <Grid.Col span={6} className="border-b border-r border-[--flr-border-color]">
                            <div
                                className="p-3"
                                style={{paddingBottom: '1.55rem'}}
                            >
                                <Text
                                    className="text-16 uppercase mb-2"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.token_label')}
                                </Text>
                                <div className="flex items-center">
                                    {vaultToken?.nativeIcon && vaultToken.nativeIcon({
                                        width: isMobile ? "45" : "90",
                                        height: isMobile ? "45" : "90"
                                    })}
                                    <Text
                                        className="text-24 sm:text-48 ml-4 max-[320px]:text-lg"
                                        truncate="end"
                                    >
                                        {vaultToken?.nativeName}
                                    </Text>
                                </div>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={6} className="border-b border-[--flr-border-color]">
                            <div
                                className="p-3"
                                style={{paddingBottom: '1.55rem'}}
                            >
                                <Text
                                    className="text-16 uppercase mb-2"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.fasset_label')}
                                </Text>
                                <div className="flex items-center">
                                    {vaultToken?.icon && vaultToken.icon({
                                        width: isMobile ? "45" : "90",
                                        height: isMobile ? "45" : "90"
                                    })}
                                    <Text className="text-24 sm:text-48 ml-4 max-[320px]:text-lg">{vaultToken?.type}</Text>
                                </div>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, sm: 4}}
                                  className="border-r border-[--flr-border-color]">
                            <div
                                className="p-5"
                            >
                                <div className="flex items-center mb-2">
                                    <Text
                                        className="text-16 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.agent_fee_label')}
                                    </Text>
                                    <Popover withArrow>
                                        <Popover.Target>
                                            <IconInfoHexagon
                                                style={{width: rem(16), height: rem(16)}}
                                                color="var(--mantine-color-gray-6)"
                                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Text className="text-16">{t('agent_details.agent_fee_description_label')}</Text>
                                        </Popover.Dropdown>
                                    </Popover>
                                </div>
                                <Text
                                    className="text-16"
                                    fw={400}
                                >
                                    {pool?.feeShare}%
                                </Text>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, sm: 4}} className="md:border-r border-[--flr-border-color]">
                            <div
                                className="p-5"
                            >
                                <div className="flex items-center mb-2">
                                    <Text
                                        className="text-16 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.minting_fee_label')}
                                    </Text>
                                    <Popover withArrow>
                                        <Popover.Target>
                                            <IconInfoHexagon
                                                style={{width: rem(16), height: rem(16)}}
                                                color="var(--mantine-color-gray-6)"
                                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Text className="text-16">{t('agent_details.minting_fee_description_label')}</Text>
                                        </Popover.Dropdown>
                                    </Popover>
                                </div>
                                <Text
                                    className="text-16"
                                    fw={400}
                                >
                                    {pool?.mintFee}%
                                </Text>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, sm: 4}}
                                  className="border-r border-t md:border-none border-[--flr-border-color]">
                            <div
                                className="p-5"
                            >
                                <div className="flex items-center mb-2">
                                    <Text
                                        className="text-16 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.available_mint_label')}
                                    </Text>
                                    <Popover withArrow>
                                        <Popover.Target>
                                            <IconInfoHexagon
                                                style={{ width: rem(16), height: rem(16) }}
                                                color="var(--mantine-color-gray-6)"
                                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Text className="text-16">{t('agent_details.available_mint_description_label')}</Text>
                                        </Popover.Dropdown>
                                    </Popover>
                                </div>
                                <div className="flex items-center">
                                    {vaultToken?.nativeIcon && vaultToken.nativeIcon({ width: "16", height: "16" })}
                                    <Text
                                        className="text-16 ml-1"
                                        fw={400}
                                    >
                                        {pool?.vaultType.toLowerCase().includes('btc')
                                            ? pool?.remainingAssets
                                            : formatNumberWithSuffix(pool?.remainingAssets ?? 0)
                                        }
                                        {pool &&
                                            <span className="ml-1 text-[var(--flr-dark-gray)]">
                                            ({formatNumberWithSuffix(
                                                toLots(pool?.remainingAssets ? toNumber(pool.remainingAssets) : 0, vaultToken?.lotSize ?? 1)!,
                                                0
                                            )} {t('agent_details.lots_label')})
                                        </span>
                                        }
                                    </Text>
                                </div>
                            </div>
                        </Grid.Col>
                        <Grid.Col 
                            span={{ base: 6, sm: 4 }} 
                            className="md:border-r border-t border-[--flr-border-color]"
                        >
                            <div
                                className="p-5"
                            >
                                <div className="flex items-center mb-2">
                                    <Text
                                        className="text-16 uppercase "
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.mint_count_label')}
                                    </Text>
                                    <Popover withArrow>
                                        <Popover.Target>
                                            <IconInfoHexagon
                                                style={{ width: rem(16), height: rem(16) }}
                                                color="var(--mantine-color-gray-6)"
                                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Text className="text-16">{t('agent_details.mint_count_description_label')}</Text>
                                        </Popover.Dropdown>
                                    </Popover>

                                </div>
                                <Text
                                    className="text-16"
                                    fw={400}
                                >
                                    {formatNumberWithSuffix(pool?.mintCount ?? 0)}
                                </Text>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, sm: 4}} className="border-r border-t border-[--flr-border-color]">
                            <div
                                className="p-5"
                            >
                                <div className="flex items-center mb-2">
                                    <Text
                                        className="text-16 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.total_collateral_label')}
                                    </Text>
                                    <Popover withArrow>
                                        <Popover.Target>
                                            <IconInfoHexagon
                                                style={{width: rem(16), height: rem(16)}}
                                                color="var(--mantine-color-gray-6)"
                                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Text className="text-16">{t('agent_details.total_collateral_description_label')}</Text>
                                        </Popover.Dropdown>
                                    </Popover>
                                </div>
                                <Text
                                    className="text-16"
                                    fw={400}
                                >
                                    ${formatNumberWithSuffix(totalCollateral)}
                                </Text>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={{base: 6, sm: 4}} className="border-t border-[--flr-border-color]">
                            <div
                                className="p-5"
                            >
                                <div className="flex items-center mb-2">
                                    <Text
                                        className="text-16 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('agent_details.past_liquidations_label')}
                                    </Text>
                                    <Popover withArrow>
                                        <Popover.Target>
                                            <IconInfoHexagon
                                                style={{width: rem(16), height: rem(16)}}
                                                color="var(--mantine-color-gray-6)"
                                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Text className="text-16">{t('agent_details.past_liquidations_description_label')}</Text>
                                        </Popover.Dropdown>
                                    </Popover>
                                </div>
                                <Text
                                    className="text-16"
                                    fw={400}
                                >
                                    {pool?.numLiquidations ?? 0}
                                </Text>
                            </div>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
        </div>
    );
}
