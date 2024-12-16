import { useEffect } from "react";
import { rem, RingProgress, Text, Title, Popover } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconInfoHexagon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { formatNumberWithSuffix, toLots, toNumber } from "@/utils";
import { IPool } from "@/types";
import { COINS } from "@/config/coin";

interface IVaultCapacityCard {
    pool: IPool | undefined;
}

export default function VaultCapacityCard({ pool }: IVaultCapacityCard) {
    const { t } = useTranslation();
    const isMounted = useMounted();

    const vaultToken = COINS.find(coin => coin.type.toLowerCase() === pool?.vaultType?.toLowerCase());
    const percentageMinted = pool && pool.allLots > 0
        ? (1 - (toNumber(pool.freeLots) / pool.allLots)) * 100
        : 0;

    useEffect(() => {
        if (!isMounted) return;

        const svg = document.getElementsByClassName('mantine-RingProgress-svg');
        if (svg.length > 0) {
            const circles = svg[0].getElementsByTagName('circle');
            if (circles.length > 0) {
                let circle = circles[0].cloneNode(true) as SVGElement;
                circle.setAttribute('r', (parseInt(circle.getAttribute('r')!) + 7).toString());
                circle.setAttribute('stroke-width', '1');
                circle.style.setProperty('--curve-color', '#000');
                svg[0].appendChild(circle);

                circle = circles[0].cloneNode(true) as SVGElement;
                circle.setAttribute('r', (parseInt(circle.getAttribute('r')!) - 7).toString());
                circle.setAttribute('stroke-width', '1');
                circle.style.setProperty('--curve-color', '#000');
                svg[0].appendChild(circle);
            }
        }
    }, [isMounted]);

    return (
        <div>
            <Title className="text-24 mb-4" fw={300}>{t('agent_details.fassets_label')}</Title>
            <div className="p-4 pr-0 border border-[--flr-border-color] bg-[var(--flr-lightest-gray)]">
                <div className="flex items-center">
                    <Title
                        className="text-28"
                        fw={400}
                    >
                        {t('agent_details.vault_capacity_label')}
                    </Title>
                    <Popover withArrow>
                        <Popover.Target>
                            <IconInfoHexagon
                                style={{ width: rem(16), height: rem(16) }}
                                color="var(--mantine-color-gray-6)"
                                className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                            />
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text className="text-16">{t('agent_details.vault_capacity_description_label')}</Text>
                        </Popover.Dropdown>
                    </Popover>
                </div>
                <div className="flex items-center">
                    <RingProgress
                        size={200}
                        thickness={14}
                        rootColor="var(--flr-white)"
                        label={
                            <div className="flex flex-col items-center">
                                <Text
                                    className="text-12 uppercase"
                                    c="var(--flr-dark-gray)"
                                    fw={400}
                                >
                                    {t('agent_details.percentage_minted_label')}
                                </Text>
                                <Text className="text-32" fw={300}>{percentageMinted.toFixed(0)}%</Text>
                                <Text
                                    className="text-14"
                                    fw={400}
                                >
                                    {t('agent_details.limit_label', {amount: formatNumberWithSuffix(pool?.limitUSD ?? 0)})}
                                </Text>
                            </div>
                        }
                        sections={[
                            {value: toNumber(percentageMinted.toFixed(0)), color: 'var(--flr-pink)'}
                        ]}
                        className="-translate-x-4"
                    />
                    <div className="w-full -translate-x-4 -mr-4">
                        <div className="border-b border-[--flr-border-color] pb-5 mb-5">
                            <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-[--flr-pink] rounded-sm" />
                                <Text
                                    className="ml-1 text-12 uppercase"
                                    fw={400}
                                    c="var(--flr-gray)"
                                >
                                    {t('agent_details.minted_label')}
                                </Text>
                            </div>
                            <div className="flex items-center">
                                {vaultToken?.icon && vaultToken.icon({width: "40", height: "40"})}
                                <div className="ml-2">
                                    <Text
                                        className="text-16"
                                        fw={400}
                                    >
                                        {formatNumberWithSuffix(pool?.mintedAssets ?? 0)}
                                        {pool &&
                                            <span className="ml-1 text-[var(--flr-dark-gray)]">
                                                ({formatNumberWithSuffix(
                                                    toLots(pool?.mintedAssets ? toNumber(pool.mintedAssets) : 0, vaultToken?.lotSize ?? 1)!,
                                                    0
                                                )} {t('agent_details.lots_label')})
                                            </span>
                                        }
                                    </Text>
                                    <Text className="text-12" fw={400}>${formatNumberWithSuffix(pool?.mintedUSD ?? 0)}</Text>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center mb-2">
                            <div className="w-3 h-3 rounded-sm border border-[#242425]"/>
                            <Text
                                className="ml-1 text-12 uppercase"
                                fw={400}
                                c="var(--flr-gray)"
                            >
                                {t('agent_details.remaining_label')}
                            </Text>
                        </div>
                        <div className="flex items-center">
                            {vaultToken?.nativeIcon && vaultToken.nativeIcon({width: "40", height: "40"})}
                            <div className="ml-2">
                                <Text
                                    className="text-16"
                                    fw={400}
                                >
                                    {formatNumberWithSuffix(pool?.remainingAssets ?? 0)}
                                    {pool &&
                                        <span className="ml-1 text-[var(--flr-dark-gray)]">
                                            ({formatNumberWithSuffix(
                                                toLots(pool?.remainingAssets ? toNumber(pool.remainingAssets) : 0, vaultToken?.lotSize ?? 1)!,
                                                0
                                            )} {t('agent_details.lots_label')})
                                        </span>
                                    }
                                </Text>
                                <Text
                                    className="text-12"
                                    fw={400}
                                >
                                    ${formatNumberWithSuffix(pool?.remainingUSD ?? 0)}
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
