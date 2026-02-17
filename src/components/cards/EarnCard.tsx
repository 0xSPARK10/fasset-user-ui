import { Text, Title, SimpleGrid, Badge, Button, Table } from "@mantine/core";
import Link from "next/link";
import BlazeSwapAltIcon from "@/components/icons/BlazeSwapAltIcon";
import EnosysAltIcon from "@/components/icons/EnosysAltIcon";
import SparkDexIcon from "@/components/icons/SparkDexIcon";
import FirelightIcon from "@/components/icons/FirelightIcon";
import KineticIcon from "@/components/icons/KineticIcon";
import StratexIcon from "@/components/icons/StratexIcon";
import FXrpIcon from "@/components/icons/FXrpIcon";
import Usdt0Icon from "@/components/icons/Usdt0Icon";
import StXrpIcon from "@/components/icons/StXrpIcon";
import MoreMarketsIcon from "@/components/icons/MoreMarketsIcon";
import UpshiftIcon from "@/components/icons/UpshiftIcon";
import { useTranslation } from "react-i18next";
import { IEarn } from "@/types";
import { FXRP, USDT0 } from "@/config/coin";
import MysticIcon from "@/components/icons/MysticIcon";
import HyperliquidIcon from "@/components/icons/HyperliquidIcon";
import UsdcIcon from "@/components/icons/UsdcIcon";
import UsdhIcon from "@/components/icons/UsdhIcon";
import CycloIcon from "@/components/icons/CycloIcon";
import FlamixIcon from "@/components/icons/FlamixIcon";
import IgniteIcon from "@/components/icons/IgniteIcon";
import SpectraIcon from "@/components/icons/SpectraIcon";


interface IEarnCard {
    earn: IEarn;
}

export default function EarnCard({ earn }: IEarnCard) {
    const { t } = useTranslation();

    const getProviderIcon = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'blazeswap':
                return <BlazeSwapAltIcon className="rounded-lg" />;
            case 'enosys':
                return <EnosysAltIcon className="rounded-lg" />;
            case 'sparkdex':
                return <SparkDexIcon className="rounded-lg" />;
            case 'firelight':
                return <FirelightIcon className="rounded-lg" />;
            case 'kinetic':
                return <KineticIcon className="rounded-lg" />;
            case 'stratex':
                return <StratexIcon className="rounded-lg" />;
            case 'moremarkets':
                return <MoreMarketsIcon className="rounded-lg" />;
            case 'upshift':
                return <UpshiftIcon className="rounded-lg" />;
            case 'mystic':
                return <MysticIcon className="rounded-lg" />;
            case 'hyperliquid':
                return <HyperliquidIcon className="rounded-lg" />;
            case 'cyclo':
                return <CycloIcon className="rounded-lg" />;
            case 'flamix':
                return <FlamixIcon className="rounded-lg" />;
            case 'ignite':
                return <IgniteIcon className="rounded-lg" />;
            case 'spectra':
                return <SpectraIcon className="rounded-lg" />;
        }
    }

    const getPairsIcon = (pair: string) => {
        let fassetIcon = null;
        let tokenIcon = null;
        let [fasset, token] = pair.split('/');
        fasset = fasset.toLowerCase();
        token = token?.toLowerCase();

        if (fasset === FXRP.type.toLowerCase()) {
            fassetIcon = FXrpIcon;
        } else if (fasset === 'stxrp') {
            fassetIcon = StXrpIcon;
        } else if (fasset === USDT0.type.toLowerCase()) {
            fassetIcon = Usdt0Icon;
        }

        if (token === USDT0.type.toLowerCase()) {
            tokenIcon = Usdt0Icon;
        } else if (token === 'stxrp') {
            tokenIcon = StXrpIcon;
        } else if (token === 'usdc') {
            tokenIcon = UsdcIcon;
        } else if (token === 'usdh') {
            tokenIcon = UsdhIcon;
        }

        return {
            fassetIcon,
            tokenIcon
        }
    }

    return (
        <div className="flex flex-col bg-[var(--flr-lightest-gray)] relative h-full md:border-t border-l border-[var(--flr-border-color)]">
            <Title
                className="bg-[var(--flr-white)] text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14 leading-[24px] border-r border-[var(--flr-border-color)]"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t('earn_card.title')}
            </Title>
            <div className="border-t border-[var(--flr-border-color)]">
                <div className="block md:hidden">
                    {Object.entries(earn).map(([provider, properties]) => (
                        <div
                            key={provider}
                            className="p-5 border-b border-[var(--flr-border-color)]"
                        >
                            <div className="flex justify-between">
                                <div className="flex items-center">
                                    {getProviderIcon(provider)}
                                    <Text
                                        className="capitalize text-[var(--flr-shark)] text-20 mx-2"
                                        fw={400}
                                    >
                                        {provider}
                                    </Text>
                                </div>
                                <div className="flex">
                                    {properties.yt_url &&
                                        <Button
                                            variant="outline"
                                            color="var(--flr-black)"
                                            component={Link}
                                            href={properties.yt_url}
                                            target="_blank"
                                            size="xs"
                                            radius="xl"
                                            fw={300}
                                            h={36}
                                            className="mr-2"
                                        >
                                            {t('earn_card.watch_tutorial_button')}
                                        </Button>
                                    }
                                    <Button
                                        variant="filled"
                                        color="var(--flr-black)"
                                        component={Link}
                                        href={properties.url}
                                        target="_blank"
                                        size="xs"
                                        radius="xl"
                                        fw={300}
                                        h={36}
                                    >
                                        {t('earn_card.open_app_button')}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center mt-3">
                                <Text
                                    fw={400}
                                    c="var(--flr-shark)"
                                    className="text-16"
                                >
                                    {properties.description}
                                </Text>
                                <Badge
                                    variant="outline"
                                    color="var(--flr-gray)"
                                    size="lg"
                                    radius="xs"
                                    fw={400}
                                    className="ml-5 shrink-0"
                                >
                                    {t(`earn_card.${properties.type}_label`)}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
                <Table
                    verticalSpacing="lg"
                    horizontalSpacing="lg"
                    variant="vertical"
                    className="hidden md:table !border-t-0 !border-b-0 !border-l-0 border-r-0"
                >
                    <Table.Tbody>
                        {Object.entries(earn).map(([provider, properties]) => (
                            <Table.Tr key={provider}>
                                <Table.Td>
                                    <div className="flex items-center">
                                        {getProviderIcon(provider)}
                                        <Text
                                            className="capitalize text-[var(--flr-shark)] text-20 mx-2"
                                            fw={400}
                                        >
                                            {provider}
                                        </Text>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    <div className="flex items-center">
                                        <div className="flex items-center mr-8">
                                            {properties.pairs.map((pair, index) => {
                                                const { fassetIcon: FassetIcon, tokenIcon: TokenIcon } = getPairsIcon(pair);

                                                return (
                                                    <div
                                                        key={pair}
                                                        className={`flex items-center ${TokenIcon && index < properties.pairs.length - 1 ? ' mr-4' : ''}`}
                                                    >
                                                        {FassetIcon &&
                                                            <FassetIcon
                                                                width="36"
                                                                height="36"
                                                                className="mr-1"
                                                            />
                                                        }
                                                        {TokenIcon &&
                                                            <TokenIcon
                                                                width="36"
                                                                height="36"
                                                            />
                                                        }
                                                    </div>
                                                );
                                            })}
                                            <Text
                                                fw={400}
                                                c="var(--flr-shark)"
                                                className="ml-3 text-20"
                                            >
                                                {properties.description}
                                            </Text>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            color="var(--flr-gray)"
                                            size="lg"
                                            radius="xs"
                                            fw={400}
                                            className="shrink-0"
                                        >
                                            {t(`earn_card.${properties.type}_label`)}
                                        </Badge>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    <div className="flex gap-2 justify-end flex-wrap">
                                        {properties.yt_url &&
                                            <Button
                                                variant="outline"
                                                color="var(--flr-black)"
                                                component={Link}
                                                href={properties.yt_url}
                                                target="_blank"
                                                radius="xl"
                                                fw={300}
                                                h={44}
                                            >
                                                {t('earn_card.watch_tutorial_button')}
                                            </Button>
                                        }
                                        <Button
                                            variant="filled"
                                            color="var(--flr-black)"
                                            component={Link}
                                            href={properties.url}
                                            target="_blank"
                                            radius="xl"
                                            fw={300}
                                            h={44}
                                        >
                                            {t('earn_card.open_app_button')}
                                        </Button>
                                    </div>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </div>
        </div>
    )
}