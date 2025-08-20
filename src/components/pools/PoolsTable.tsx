import React, { useState, useRef, useMemo, useCallback } from "react";
import {
    Title,
    Popover,
    ActionIcon,
    Switch,
    rem,
    Table,
    Text,
    Badge,
    Menu,
    Button,
    Drawer,
    ScrollArea,
    Avatar,
    Divider,
    Chip
} from "@mantine/core";
import {
    IconFilterFilled,
    IconFilter,
    IconDotsVertical,
    IconGift,
    IconDots,
    IconChevronRight
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import Link from 'next/link'
import FAssetTable from "@/components/elements/FAssetTable";
import XrpIcon from "@/components/icons/XrpIcon";
import DogeIcon from "@/components/icons/DogeIcon";
import BtcIcon from "@/components/icons/BtcIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import FXrpIcon from "@/components/icons/FXrpIcon";
import FBtcIcon from "@/components/icons/FBtcIcon";
import FDogeIcon from "@/components/icons/FDogeIcon";
import FlrAltIcon from "@/components/icons/FlrAltIcon";
import LogoIcon from "@/components/icons/LogoIcon";
import SgbIcon from "@/components/icons/SgbIcon";
import DepositToPoolModal from "@/components/modals/DepositToPoolModal";
import WithdrawalFromPoolModal from "@/components/modals/WithdrawalFromPoolModal";
import ClaimRewardsFromPoolModal from "@/components/modals/ClaimRewardsFromPoolModal";
import type { IFAssetColumn } from "@/components/elements/FAssetTable";
import { IPool, ITableRowAction } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { truncateString, formatNumber, isMaxCRValue, toNumber, formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";
import classes from "@/styles/pages/Agents.module.scss";

const TYPE_ACTIVE_POOLS = 'active';
const TYPE_OTHER_POOLS = 'others';

interface IPoolsTable {
    pools: IPool[];
    className?: string;
    style?: React.CSSProperties;
    type: typeof TYPE_ACTIVE_POOLS | typeof TYPE_OTHER_POOLS;
    showAll?: boolean;
}

export default function PoolsTable({ pools, className, style, type, showAll }: IPoolsTable) {
    const [isDepositToPoolModalActive, setIsDepositToPoolModalActive] = useState<boolean>(false);
    const [isWithdrawalFromPoolModalActive, setIsWithdrawalFromPoolModalActive] = useState<boolean>(false);
    const [isClaimRewardsFromPoolModalActive, setIsClaimRewardsPoolModalActive] = useState<boolean>(false);
    const [isDrawerActive, setIsDrawerActive] = useState<boolean>(false);
    const [isShowAllActive, setIsShowAllActive] = useState<boolean>(false);
    const [isMenuOpened, setIsMenuOpened] = useState<Record<string, boolean>>({});
    const [selectedPool, setSelectedPool] = useState<IPool>();
    const isMenuOpenedRef = useRef<Record<string, boolean>>({});
    const [remainingPoolsFilters, setRemainingPoolsFilters] = useState<string[]>([]);

    const [showOnlyHealthyPools, setShowOnlyHealthyPools] = useState<boolean>(false);
    const [showOnlyLivePools, setShowOnlyLivePools] = useState<boolean>(false);
    const [selectedCollateralPool, setSelectedCollateralPool] = useState<IPool>();

    const { t } = useTranslation();
    const { isConnected, mainToken } = useWeb3();

    const tokenFilters = COINS.filter(coin => coin.isFAssetCoin && coin.enabled);

    const filteredPools = useMemo(() => {
        let data = pools;

        if (showOnlyHealthyPools) {
            data = data.filter(pool => pool.health === 0);
        }
        if (showOnlyLivePools) {
            data = data.filter(pool => pool.status);
        }
        if (remainingPoolsFilters.length > 0) {
            data = data.filter(pool => remainingPoolsFilters.includes(pool.vaultType));
        }
        if (showAll === true && !isShowAllActive) {
            data = data.slice(0, 10);
        }

        return data;
    }, [pools, showOnlyHealthyPools, showOnlyLivePools, isShowAllActive, showAll, remainingPoolsFilters]);

    const actions: ITableRowAction<IPool>[] = type === TYPE_ACTIVE_POOLS
        ? [
            {
                name: t('agents.table.deposit_button'),
                click: (row) => onDeposit(row),
                disabled: (pool) => pool.health !== 0
            },
            {
                name: t('agents.table.withdraw_button'),
                click: (pool) => onWithdrawal(pool),
                disabled: (pool) => toNumber(pool.nonTimeLocked!) <= 0 || toNumber(pool.poolExitCR) > toNumber(pool.poolCR)
            },
            {
                name: t('agents.table.claim_button'),
                click: (pool) => onClaimRewards(pool),
                disabled: (pool) => toNumber(pool.userPoolFeesUSD!) < 0.01 && toNumber(pool.userPoolFees!) < 0.01,
                rightSection: <IconGift style={{ width: rem(20), height: rem(20) }} />
            },
        ]
        : [
            {
                name: t('agents.table.deposit_button'),
                click: (row) => onDeposit(row),
                disabled: (pool) => pool.health !== 0
            }
        ];

    const handleMenuToggle = (vaultId: string) => {
        setIsMenuOpened((prevState) => {
            const newState = { ...prevState, [vaultId]: !prevState[vaultId] };
            isMenuOpenedRef.current = newState;
            return newState;
        });
    };

    const renderAgentName = useCallback((
        pool: IPool,
        className: string = '',
        truncateCount: number = 5,
        largeIcons: boolean = true,
        isDrawer: boolean = false
    ) => {
        return (
            <div className="flex items-center">
                <div className="flex items-baseline">
                    {pool.vaultType.toLowerCase().includes('xrp') &&
                        <XrpIcon
                            width={largeIcons ? '32' : '24'}
                            height={largeIcons ? '32' : '24'}
                            className="flex-shrink-0"
                            style={{
                                zIndex: 2
                            }}
                        />
                    }
                    {pool.vaultType.toLowerCase().includes('btc') &&
                        <BtcIcon
                            width={largeIcons ? '32' : '24'}
                            height={largeIcons ? '32' : '24'}
                            className="flex-shrink-0"
                            style={{
                                zIndex: 2
                            }}
                        />
                    }
                    {pool.vaultType.toLowerCase().includes('doge') &&
                        <DogeIcon
                            width={largeIcons ? '32' : '24'}
                            height={largeIcons ? '32' : '24'}
                            className="flex-shrink-0"
                            style={{
                                zIndex: 2
                            }}
                        />
                    }
                    {pool.url.length > 0 && pool.url != '-'
                        ? <Avatar
                            src={pool.url}
                            size={largeIcons ? 32 : 24}
                            style={{
                                borderRadius: '50%',
                                transform: largeIcons ? 'translateX(-10px)' : 'translateX(-6px)',
                                zIndex: 1
                            }}
                        />
                        : <LogoIcon
                            width={largeIcons ? '32' : '24'}
                            height={largeIcons ? '32' : '24'}
                            style={{
                                transform: largeIcons ? 'translateX(-10px)' : 'translateX(-6px)',
                                zIndex: 1
                            }}
                        />
                    }
                </div>
                <div>
                    <div className="flex items-center">
                        <Link
                            className={`text-14 underline ${classes.agentNameTr} ${className} ${[2, 3].includes(pool.health) ? 'text-[var(--flr-red)]' : 'text-[var(--flr-black)]'}`}
                            href={`/pools/${pool.vaultType}/${pool.pool}`}
                        >
                            {pool.agentName}
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <Text
                            className="text-12"
                            fw={400}
                            c={!isDrawer && [2, 3].includes(pool.health) ? 'var(--flr-red)' : 'var(--flr-black)'}
                        >
                            {truncateString(pool.vault, truncateCount, truncateCount)}
                        </Text>
                        <CopyIcon text={pool.vault} color="var(--mantine-color-gray-4)" />
                    </div>
                </div>
            </div>
        );
    }, []);

    const renderHealthStatus = useCallback((pool: IPool) => {
        const status: { [key: number]: string } = {
            0: t('agents.table.health_status_healthy_label'),
            1: t('agents.table.health_status_ccb_label'),
            2: t('agents.table.health_status_in_liquidation_label'),
            3: t('agents.table.health_status_in_full_liquidation_label'),
            4: t('agents.table.health_status_closing_label'),
        };

        let textColor = 'var(--mantine-color-gray-7)';
        let badgeColor = '#2424250F';

        if (pool.health === 0) {
            textColor = 'var(--flr-green)';
            badgeColor = 'var(--flr-lightest-green)';
        } else if ([2, 3].includes(pool.health)) {
            textColor = 'var(--flr-red)';
            badgeColor = 'var(--flr-lightest-red)';
        } else if (pool.health === 1) {
            textColor = 'var(--flr-orange)';
            badgeColor = '#FCEBE2';
        }

        let textColorStatus = 'var(--flr-red)';
        if (pool.status) {
            textColorStatus = 'var(--flr-green)';
        }

        return (
            <div>
                <div className="flex items-center flex-wrap">
                    <Badge
                        variant="outline"
                        color={badgeColor}
                        radius="xs"
                        className="mr-1 font-normal mb-1"
                    >
                        <div className="flex items-center">
                            <span className="status-dot mr-1 shrink-0" style={{ backgroundColor: textColor }}></span>
                            <span style={{ color: textColor }}>{status[pool.health]}</span>
                        </div>
                    </Badge>
                    <Badge
                        variant="outline"
                        color={pool.status ? 'var(--flr-lightest-green)' : 'var(--flr-lightest-red)'}
                        radius="xs"
                        className="font-normal mb-1"
                    >
                        <div className="flex items-center">
                            <span className="status-dot mr-1 shrink-0" style={{ backgroundColor: textColorStatus }}></span>
                            <span style={{ color: textColorStatus }}>
                                {t(`agents.table.status_${pool.status ? 'live' : 'offline'}_label`)}
                            </span>
                        </div>
                    </Badge>
                </div>
                <Badge
                    variant="outline"
                    color="var(--flr-black)"
                    radius="xs"
                    className="mr-1 font-normal"
                    styles={{
                        root: {
                            borderColor: '#eee'
                        }
                    }}
                >
                    {pool.numLiquidations} {t('agents.table.past_liq_label')}
                </Badge>
            </div>
        );
    }, []);

    const renderTvlMint = useCallback((pool: IPool) => {
       return (
            <div>
                <Text
                    size="sm"
                >
                    ${formatNumberWithSuffix(pool.poolCollateralUSD)}
                </Text>
                <Text className="text-12">{pool.mintCount.toLocaleString('en-US')}</Text>
            </div>
        );
    }, []);

    const renderFreeLots = useCallback((pool: IPool) => {
        return (
            <div>
                <Text
                    size="sm"
                >
                    {pool.freeLots}/{pool.allLots}
                </Text>
                <Text className="text-12" c="var(--flr-dark-gray)">{pool.feeShare}%</Text>
            </div>
        );
    }, []);

    const renderVaultCollateral = useCallback((pool: IPool) => {
        let vaultCr = pool.vaultCR;

        if (isMaxCRValue(vaultCr)) {
            vaultCr = '∞'
        } else {
            vaultCr = toNumber(vaultCr).toPrecision(3);
        }

        const collateralToken = COINS.find(coin => coin.type.toLowerCase() === pool.collateralToken.toLowerCase());

        return (
            <div className="flex items-center mr-6 w-32">
                {collateralToken && collateralToken.icon({ width: "32", height: "32" })}
                <div className="ml-2">
                    <Text className="text-14" fw={400}>
                        ${formatNumberWithSuffix(pool.vaultOnlyCollateralUSD)}
                    </Text>
                    <Text
                        c="var(--flr-dark-gray)"
                        className="text-12"
                        fw={400}
                    >
                        {vaultCr}
                    </Text>
                </div>
            </div>
        );
    }, []);

    const renderPoolCollateral = useCallback((pool: IPool) => {
        let poolCr = pool.poolCR;
        let poolColor: string = 'var(--flr-dark-gray)';

        if (isMaxCRValue(poolCr)) {
            poolCr = '∞'
        } else {
            poolCr = toNumber(poolCr).toPrecision(3);
        }

        if (toNumber(poolCr) < toNumber(pool.poolExitCR)) {
            poolColor = 'var(--flr-red)';
        }

        return (
            <div className="flex items-center w-32">
                {mainToken && mainToken.icon({ width: '32', height: '32' })}
                <div className="ml-2">
                    <Text className="text-14" fw={400}>
                        ${formatNumberWithSuffix(pool.poolOnlyCollateralUSD)}
                    </Text>
                    <Text
                        className="text-12"
                        fw={400}
                        c={poolColor}
                    >
                        {poolCr}
                    </Text>
                </div>
            </div>
        )
    }, [mainToken]);

    const renderMyPosition = useCallback((pool: IPool) => {
        return (
            <div>
                <div className="flex items-center">
                    {mainToken?.network.mainnet
                        ? <SgbIcon width="15" height="15" />
                        : <FlrAltIcon width="15" height="15" />
                    }
                    <Text className="text-14 ml-1 whitespace-nowrap" fw={400}>
                        {formatNumberWithSuffix(pool.userPoolNatBalance!)} (${formatNumberWithSuffix(pool.userPoolNatBalanceInUSD!)})
                    </Text>
                </div>
                <Text
                    c="var(--flr-dark-gray)"
                    className="text-12"
                    fw={400}
                >
                    {pool.userPoolShare}%
                </Text>
            </div>
        );
    }, []);

    const renderClaimableRewards = useCallback((pool: IPool) => {
        const totalRewards = toNumber(pool.userPoolFees ?? '0') + toNumber(pool.lifetimeClaimedPoolFormatted ?? '0');
        const totalRewardsUSD = toNumber(pool.userPoolFeesUSD ?? '0') + toNumber(pool.lifetimeClaimedPoolUSDFormatted ?? '0');

        return (
            <div>
                <div className="flex items-center mb-1">
                    {pool.vaultType.toLowerCase().includes('xrp') &&
                        <FXrpIcon
                            width="15"
                            height="15"
                            className="flex-shrink-0"
                        />
                    }
                    {pool.vaultType.toLowerCase().includes('btc') &&
                        <FBtcIcon
                            width="15"
                            height="15"
                            className="flex-shrink-0"
                        />
                    }
                    {pool.vaultType.toLowerCase().includes('doge') &&
                        <FDogeIcon
                            width="15"
                            height="15"
                            className="flex-shrink-0"
                        />
                    }
                    <Text className="text-14 ml-1">
                        {formatNumberWithSuffix(pool.userPoolFees ?? 0)} (${formatNumberWithSuffix(pool.userPoolFeesUSD ?? 0)})
                    </Text>
                </div>
                <Text
                    c="var(--flr-dark-gray)"
                    className="text-12"
                    fw={400}
                >
                    {formatNumberWithSuffix(totalRewards)} (${formatNumberWithSuffix(totalRewardsUSD)})
                </Text>
            </div>
        );
    }, []);

    let drawerColumns: IFAssetColumn[] = [
        {
            id: 'agentName',
            label: t('agents.table.agent_label'),
            render: (pool: IPool) => {
                return renderAgentName(pool, '!w-40 text-ellipsis overflow-hidden text-nowrap !text-[var(--flr-black)]', 5, true, true)
            }
        },
        {
            id: 'health',
            label: t('agents.table.health_status_label'),
            render: (pool: IPool) => {
                return renderHealthStatus(pool);
            }
        },
        {
            id: 'totalPoolCollateral',
            label: t('agents.table.tvl_mint_label'),
            thClass: 'w-24',
            render: (pool: IPool) => {
                return renderTvlMint(pool);
            }
        },
        {
            id: 'freeLots',
            label: t('agents.table.free_lots_pool_fee_label'),
            render: (pool: IPool) => {
                return renderFreeLots(pool);
            }
        },
        {
            id: 'vaultCR',
            label: t('agents.table.vault_collateral_label'),
            render: (pool: IPool) => {
                return (
                    <div className="flex items-center">
                    {renderVaultCollateral(pool)}
                    </div>
                )
            }
        },
        {
            id: 'poolCR',
            label: t('agents.table.pool_collateral_label'),
            render: (pool: IPool) => {
                return (
                    <div className="flex items-center">
                        {renderPoolCollateral(pool)}
                    </div>
                )
            }
        }
    ];

    const mobileColumns: IFAssetColumn[] = [
        {
            id: 'agentName',
            label: <Text className="text-11" fw={400}>{t('agents.table.agent_label')}</Text>,
            sorted: true,
            thClass: '!pl-3',
            tdClass: '!pl-3',
            sortColumns: [
                {field: 'agentName', direction: 'desc', label: t('agents.table.agent_name_label')},
                {field: 'agentName', direction: 'asc', label: t('agents.table.agent_name_label')},
                {field: 'vaultType', direction: 'desc', label: t('agents.table.vault_type_label')},
                {field: 'vaultType', direction: 'asc', label: t('agents.table.vault_type_label') }
            ],
            render: (pool: IPool) => {
                return renderAgentName(pool, 'text-ellipsis overflow-hidden text-nowrap', 3, false);
            }
        },
        {
            id: type === TYPE_ACTIVE_POOLS ? 'positionRewards' : 'totalPoolCollateral',
            label: <Text className="text-11" fw={400}>
                {t(`agents.table.${type === TYPE_ACTIVE_POOLS ? 'position_rewards_label' : 'tvl_mint_label'}`)}
            </Text>,
            sorted: true,
            sortColumns: type === TYPE_ACTIVE_POOLS
                ? [
                    {field: 'userPoolNatBalance', direction: 'desc', label: t('agents.table.position_label')},
                    {field: 'userPoolNatBalance', direction: 'asc', label: t('agents.table.position_label')},
                    {field: 'userPoolFees', direction: 'desc', label: t('agents.table.rewards_label')},
                    {field: 'userPoolFees', direction: 'asc', label: t('agents.table.rewards_label') }
                ]
                : [
                    { field: 'poolCollateralUSD', direction: 'desc', label: t('agents.table.total_value_locked_label') },
                    { field: 'poolCollateralUSD', direction: 'asc', label: t('agents.table.total_value_locked_label') },
                    { field: 'mintCount', direction: 'desc', label: t('agents.table.mint_count_label') },
                    { field: 'mintCount', direction: 'asc', label: t('agents.table.mint_count_label') }
                ]
            ,
            thInnerClass: 'w-20',
            tdInnerClass: 'w-20',
            render: (pool: IPool) => {
                return type === TYPE_ACTIVE_POOLS
                    ? <div>
                        <div className="flex items-center">
                            {mainToken?.network.mainnet
                                ? <SgbIcon width="15" height="15" />
                                : <FlrAltIcon width="15" height="15" />
                            }
                            <Text size="sm" className="ml-1 whitespace-nowrap">
                                {formatNumberWithSuffix(pool.userPoolNatBalance ?? 0)} (${formatNumber(pool.userPoolNatBalanceInUSD ?? 0)})
                            </Text>
                        </div>
                        <div className="flex items-center mt-1">
                            {pool.vaultType.toLowerCase().includes('xrp') &&
                                <FXrpIcon
                                    width="15"
                                    height="15"
                                    className="flex-shrink-0"
                                />
                            }
                            {pool.vaultType.toLowerCase().includes('btc') &&
                                <FBtcIcon
                                    width="15"
                                    height="15"
                                    className="flex-shrink-0"
                                />
                            }
                            {pool.vaultType.toLowerCase().includes('doge') &&
                                <FDogeIcon
                                    width="15"
                                    height="15"
                                    className="flex-shrink-0"
                                />
                            }
                            <div className="ml-1">
                                <Text className="grow-0 shrink-0 text-12">
                                    ${pool.userPoolFeesUSD}
                                </Text>
                            </div>
                        </div>
                    </div>
                    : renderTvlMint(pool)
                ;
            }
        },
        {
            id: 'actionMenu',
            label: '',
            tdClass: 'cursor-pointer',
            onTdClick: (pool: IPool) => setIsMenuOpened((prevState) => {
                handleMenuToggle(pool.vault)
                return { ...prevState, [pool.vault]: (pool.vault in prevState ? !prevState[pool.vault] : true) };
            }),
            render: (pool: IPool) => {
                return (
                    <Menu
                        opened={isMenuOpenedRef.current[pool.vault] || false}
                        onChange={() => handleMenuToggle(pool.vault)}
                    >
                        <Menu.Target>
                            <ActionIcon
                                variant="gradient"
                                radius="xl"
                                size="md"
                            >
                                <IconDots
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-black)"
                                />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown variant="gradient">
                            {actions.map(action =>
                                <Menu.Item
                                    key={action.name}
                                    fw={400}
                                    disabled={action.disabled ? action.disabled(pool) : undefined}
                                    onClick={() => action.click ? action.click(pool) : undefined}
                                    rightSection={action.rightSection}
                                    leftSection={action.leftSection}
                                >
                                    {action.name}
                                </Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                );
            }
        },
        {
            id: 'actionDrawer',
            label: '',
            onTdClick: (pool: IPool) => { setSelectedPool(pool); setIsDrawerActive(true) },
            tdClass: 'cursor-pointer',
            render: (pool: IPool) => {
                return (
                    <ActionIcon
                        size="xl"
                        variant="transparent"
                    >
                        <IconChevronRight
                            style={{ width: rem(20), height: rem(20) }}
                            color="var(--mantine-color-black)"
                        />
                    </ActionIcon>
                );
            }
        }
    ];

    let columns: IFAssetColumn[] = [
        {
            id: 'agentName',
            label: <Text className="text-11">{t('agents.table.agent_label')}</Text>,
            sorted: true,
            sortColumns: [
                {field: 'agentName', direction: 'desc', label: t('agents.table.agent_name_label')},
                {field: 'agentName', direction: 'asc', label: t('agents.table.agent_name_label')},
                {field: 'vaultType', direction: 'desc', label: t('agents.table.vault_type_label')},
                {field: 'vaultType', direction: 'asc', label: t('agents.table.vault_type_label')}
            ],
            render: (pool: IPool) => {
                return renderAgentName(pool, 'text-ellipsis overflow-hidden text-nowrap', 5)
            }
        },
        {
            id: 'health',
            label: <Text className="text-11">{t('agents.table.health_status_label')}</Text>,
            sorted: true,
            thInnerClass: 'w-40',
            sortColumns: [
                { field: 'health', direction: 'desc', label: t('agents.table.health_label') },
                { field: 'health', direction: 'asc', label: t('agents.table.health_label') },
                { field: 'status', direction: 'desc', label: t('agents.table.status_label') },
                { field: 'status', direction: 'asc', label: t('agents.table.status_label') },
                { field: 'numLiquidations', direction: 'desc', label: t('agents.table.past_liq_label') },
                { field: 'numLiquidations', direction: 'asc', label: t('agents.table.past_liq_label') },
            ],
            render: (pool: IPool) => {
                return renderHealthStatus(pool);
            }
        },
        {
            id: 'totalPoolCollateral',
            label: <Text className="text-11">{t('agents.table.tvl_mint_label')}</Text>,
            sorted: true,
            sortColumns: [
                { field: 'poolCollateralUSD', direction: 'desc', label: t('agents.table.total_value_locked_label') },
                { field: 'poolCollateralUSD', direction: 'asc', label: t('agents.table.total_value_locked_label') },
                { field: 'mintCount', direction: 'desc', label: t('agents.table.mint_count_label') },
                { field: 'mintCount', direction: 'asc', label: t('agents.table.mint_count_label') }
            ],
            thInnerClass: 'w-24',
            render: (pool: IPool) => {
                return renderTvlMint(pool);
            }
        },
        {
            id: 'freeLots',
            label: <Text className="text-11">{t('agents.table.free_lots_pool_fee_label')}</Text>,
            sorted: true,
            sortColumns: [
                { field: 'freeLots', direction: 'desc', label: t('agents.table.free_lots_label') },
                { field: 'freeLots', direction: 'asc', label: t('agents.table.free_lots_label') },
                { field: 'feeShare', direction: 'desc', label: t('agents.table.fee_share_label') },
                { field: 'feeShare', direction: 'asc', label: t('agents.table.fee_share_label') },
            ],
            thInnerClass: 'w-28',
            render: (pool: IPool) => {
                return renderFreeLots(pool);
            }
        },
        {
            id: 'vaultCR',
            label: <Text className="text-11">{t('agents.table.cr_label')}</Text>,
            sorted: true,
            thInnerClass: 'w-44',
            sortColumns: [
                { field: 'vaultCR', direction: 'desc', label: t('agents.table.vault_cr_label') },
                { field: 'vaultCR', direction: 'asc', label: t('agents.table.vault_cr_label') },
                { field: 'poolCR', direction: 'desc', label: t('agents.table.pool_cr_label') },
                { field: 'poolCR', direction: 'asc', label: t('agents.table.pool_cr_label') },
            ],
            render: (pool: IPool) => {
                return (
                    <div className="flex items-center">
                        {renderVaultCollateral(pool)}
                        {renderPoolCollateral(pool)}
                    </div>
                )
            }
        }
    ];

    if (isConnected) {
        if (type === TYPE_ACTIVE_POOLS) {
            columns = columns.concat([
                {
                    id: 'userPoolNatBalance',
                    label: <Text className="text-11">{t('agents.table.my_position_label')}</Text>,
                    sorted: true,
                    sortColumns: [
                        { field: 'userPoolNatBalance', direction: 'desc', label: t('agents.table.position_label') },
                        { field: 'userPoolNatBalance', direction: 'asc', label: t('agents.table.position_label') },
                        { field: 'userPoolShare', direction: 'desc', label: t('agents.table.share_label') },
                        { field: 'userPoolShare', direction: 'asc', label: t('agents.table.share_label') },
                    ],
                    thInnerClass: 'w-36',
                    render: (pool: IPool) => {
                        return renderMyPosition(pool);
                    }
                },
                {
                    id: 'userPoolFees',
                    label: <Text className="text-11">{t('agents.table.claimable_reward_label')}</Text>,
                    sorted: true,
                    sortColumns: [
                        { field: 'lifetimeClaimedPoolFormatted', direction: 'desc', label: t('agents.table.claimable_rewards_label') },
                        { field: 'lifetimeClaimedPoolFormatted', direction: 'asc', label: t('agents.table.claimable_rewards_label') },
                        { field: 'userPoolFees', direction: 'desc', label: t('agents.table.total_rewards_label') },
                        { field: 'userPoolFees', direction: 'asc', label: t('agents.table.total_rewards_label') },
                    ],
                    thInnerClass: 'w-36',
                    render: (pool: IPool) => {
                        return renderClaimableRewards(pool);
                    }
                },
            ]);

            drawerColumns = drawerColumns.concat([
                {
                    id: 'userPoolNatBalance',
                    label: <Text className="text-11">{t('agents.table.my_position_label')}</Text>,
                    render: (pool: IPool) => {
                        return renderMyPosition(pool);
                    }
                },
                {
                    id: 'userPoolFees',
                    label: <Text className="text-11">{t('agents.table.claimable_reward_label')}</Text>,
                    render: (pool: IPool) => {
                        return renderClaimableRewards(pool);
                    }
                },
            ]);
        }

        columns = columns.concat([
            {
                id: 'actions',
                label: '',
                thInnerClass: 'w-6',
                thClass: classes.stickyRight,
                tdClass: 'relative',
                render: (pool: IPool) => {
                    return (
                        <div className="flex justify-end">
                            <div className="fau-hover-mobile-content">
                                <Menu>
                                    <Menu.Target>
                                        <ActionIcon
                                            variant="transparent"
                                        >
                                            <IconDotsVertical
                                                style={{ width: rem(20), height: rem(20) }}
                                                color="var(--mantine-color-black)"
                                            />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown variant="gradient">
                                        {actions.map(action =>
                                            <Menu.Item
                                                key={action.name}
                                                fw={400}
                                                disabled={action.disabled ? action.disabled(pool) : undefined}
                                                onClick={() => action.click ? action.click(pool) : undefined}
                                                rightSection={action.rightSection}
                                                leftSection={action.leftSection}
                                            >
                                                {action.name}
                                            </Menu.Item>
                                        )}
                                    </Menu.Dropdown>
                                </Menu>
                            </div>
                            <div className="fau-hover-content">
                                {actions.map(action =>
                                    <Button
                                        key={action.name}
                                        variant="gradient"
                                        radius="xl"
                                        size="sm"
                                        fw={400}
                                        className="mr-2"
                                        disabled={action.disabled ? action.disabled(pool) : undefined}
                                        onClick={() => action.click ? action.click(pool) : undefined}
                                        rightSection={action.rightSection}
                                        leftSection={action.leftSection}
                                    >
                                        {action.name}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                }
            }
        ]);
    }

    const onDeposit = (pool: IPool) => {
        setIsDepositToPoolModalActive(true);
        setSelectedCollateralPool(pool);
    }

    const onCloseDepositToPoolModal = async () => {
        setIsDepositToPoolModalActive(false);
        setSelectedCollateralPool(undefined);
    }

    const onWithdrawal = (pool: IPool) => {
        setIsWithdrawalFromPoolModalActive(true);
        setSelectedCollateralPool(pool);
    }

    const onCloseWithdrawalFromPoolModal = async () => {
        setIsWithdrawalFromPoolModalActive(false);
        setSelectedCollateralPool(undefined);
    }

    const onClaimRewards = (pool: IPool) => {
        setIsClaimRewardsPoolModalActive(true);
        setSelectedCollateralPool(pool);
    }

    const onCloseClaimRewards = async () => {
        setIsClaimRewardsPoolModalActive(false);
        setSelectedCollateralPool(undefined);
    }

    return (
        <div className={className} style={style}>
            <Drawer
                opened={isDrawerActive}
                position="top"
                onClose={() => setIsDrawerActive(false)}
                title={<Text size="md" fw={400}>{t('agents.vault_details_label')}</Text>}
                scrollAreaComponent={ScrollArea.Autosize}
                styles={{
                    body: {
                        padding: 0
                    },
                    content: {
                        overflowY: 'initial'
                    }
                }}
                classNames={{
                    inner: classes.drawer
                }}
            >
                <FAssetTable
                    items={[selectedPool]}
                    columns={drawerColumns}
                    mobileBreakPoint={768}
                />
            </Drawer>
            <div className="flex items-baseline md:items-center justify-between mb-3 px-[15px] md:px-0">
                <div className="flex flex-col md:flex-row md:items-center">
                    <Title
                        fw={300}
                        className="text-28 md:text-32 shrink-0 mr-8"
                    >
                        {type === TYPE_ACTIVE_POOLS ? t('agents.active_pools_title') : t('agents.remaining_pools_title')}
                    </Title>
                    {type === TYPE_OTHER_POOLS &&
                        <div className="flex items-center mt-1 md:mt-0">
                            <Chip.Group
                                multiple
                                value={remainingPoolsFilters}
                                onChange={setRemainingPoolsFilters}
                            >
                                {tokenFilters?.map(token => (
                                    <Chip
                                        key={token.type}
                                        className="mr-2"
                                        value={token.type}
                                        radius="xs"
                                        classNames={{
                                            label: `px-2 !border !border-[var(--flr-black)] !bg-transparent ${classes.remainingFilters}`,
                                            checkIcon: 'text-[var(--flr-black)]'
                                        }}
                                    >
                                        {token.nativeIcon && token.nativeIcon({ width: "20", height: "20" })}
                                    </Chip>
                                ))}
                            </Chip.Group>
                        </div>
                    }
                </div>
                {type === TYPE_OTHER_POOLS &&
                    <div className="flex flex-col">
                        <Popover
                            position="bottom-end"
                            width="auto"
                        >
                            <div className="flex items-center justify-end">
                                <Popover.Target>
                                    <div className="flex items-center cursor-pointer">
                                        <ActionIcon
                                            variant="transparent"
                                        >
                                            {(showOnlyHealthyPools || showOnlyLivePools) &&
                                                <IconFilterFilled
                                                    style={{width: rem(20), height: rem(20)}}
                                                    color="var(--mantine-color-black)"
                                                />
                                            }
                                            {!showOnlyHealthyPools && !showOnlyLivePools &&
                                                <IconFilter
                                                    style={{width: rem(20), height: rem(20)}}
                                                    color="var(--mantine-color-black)"
                                                />
                                            }
                                        </ActionIcon>
                                        {t('agents.filter_label')}
                                    </div>
                                </Popover.Target>
                            </div>
                            <Popover.Dropdown className="p-4">
                                <Switch
                                    checked={showOnlyHealthyPools}
                                    onChange={(event) => setShowOnlyHealthyPools(event.currentTarget.checked)}
                                    label={t('agents.table.show_only_healthy_pools_label')}
                                    className="mb-3"
                                />
                                <Switch
                                    checked={showOnlyLivePools}
                                    onChange={(event) => setShowOnlyLivePools(event.currentTarget.checked)}
                                    label={t('agents.table.show_only_live_pools_label')}
                                />
                            </Popover.Dropdown>
                        </Popover>
                    </div>
                }
            </div>
            <FAssetTable
                className="block md:hidden fau-hover-row-table"
                columns={mobileColumns}
                items={filteredPools}
                emptyLabel={type === TYPE_ACTIVE_POOLS ? t('agents.table.empty_label') : t('agents.table.other_empty_label')}
                classNames={{
                    table: '!border-x-0'
                }}
                styles={{
                    th: {
                        padding: '1rem 0.25rem',
                    },
                    td: {
                        padding: '1rem 0.25rem'
                    }
                }}
            />
            <Table.ScrollContainer minWidth={500}>
                <FAssetTable
                    className="hidden md:block fau-hover-row-table"
                    columns={columns}
                    items={filteredPools}
                    emptyLabel={type === TYPE_ACTIVE_POOLS ? t('agents.table.empty_label') : t('agents.table.other_empty_label')}
                />
            </Table.ScrollContainer>
            {showAll && !isShowAllActive && pools?.length > 10 &&
                <div className="flex justify-center mt-5">
                    <Divider
                        color="var(--flr-light-gray)"
                        label={
                            <Button
                                variant="gradient"
                                radius="xl"
                                size="xs"
                                fw={400}
                                onClick={() => setIsShowAllActive(true)}
                            >
                                {t('agents.load_all_button')}
                            </Button>
                        }
                        className="w-full max-w-md"
                        classNames={{
                            label: classes.loadAll
                        }}
                    />
                </div>
            }
            <DepositToPoolModal
                opened={isDepositToPoolModalActive}
                collateralPool={selectedCollateralPool}
                onClose={onCloseDepositToPoolModal}
            />
            <WithdrawalFromPoolModal
                opened={isWithdrawalFromPoolModalActive}
                collateralPool={selectedCollateralPool}
                onClose={onCloseWithdrawalFromPoolModal}
            />
            <ClaimRewardsFromPoolModal
                opened={isClaimRewardsFromPoolModalActive}
                collateralPool={selectedCollateralPool}
                onClose={onCloseClaimRewards}
            />
        </div>
    );
}
