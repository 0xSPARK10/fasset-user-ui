import { Text, Title, SimpleGrid, Badge, Button } from "@mantine/core";
import BlazeSwapAltIcon from "@/components/icons/BlazeSwapAltIcon";
import EnosysAltIcon from "@/components/icons/EnosysAltIcon";
import SparkDexIcon from "@/components/icons/SparkDexIcon";
import FirelightIcon from "@/components/icons/FirelightIcon";
import KineticIcon from "@/components/icons/KineticIcon";
import StratexIcon from "@/components/icons/StratexIcon";
import FXrpIcon from "@/components/icons/FXrpIcon";
import Usdt0Icon from "@/components/icons/Usdt0Icon";
import StXrpIcon from "@/components/icons/StXrpIcon";
import { useTranslation } from "react-i18next";
import { IEarn } from "@/types";
import { FXRP, USDT0 } from "@/config/coin";
import Link from "next/link";

interface IEarnCard {
    earn: IEarn;
}

export default function EarnCard({ earn }: IEarnCard) {
    const { t } = useTranslation();

    const getProviderIcon = (provider: string) => {
        if (provider === 'blazeswap') {
            return <BlazeSwapAltIcon className="rounded-lg" />;
        } else if (provider === 'enosys') {
            return <EnosysAltIcon className="rounded-lg" />;
        } else if (provider === 'sparkdex') {
            return <SparkDexIcon className="rounded-lg" />;
        } else if (provider === 'firelight') {
            return <FirelightIcon className="rounded-lg" />;
        } else if (provider === 'kinetic') {
            return <KineticIcon className="rounded-lg" />;
        } else if (provider === 'stratex') {
            return <StratexIcon className="rounded-lg" />;
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
                <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 3 }}
                    styles={{
                        root: {
                            '--sg-spacing-x': 0,
                            '--sg-spacing-y': 0
                        }
                    }}
                >
                    {Object.entries(earn).map(([provider, properties]) => (
                        <div
                            key={provider}
                            className={`border-r border-b border-[var(--flr-border-color)]`}
                        >
                            <div className="flex justify-between px-4 pt-6">
                                <div className="flex items-center mr-2">
                                    {getProviderIcon(provider)}
                                    <Text
                                        className="capitalize text-[var(--flr-shark)] text-20 mx-2"
                                        fw={400}
                                    >
                                        {provider}
                                    </Text>
                                    <Badge
                                        variant="outline"
                                        size="xl"
                                        radius="xs"
                                        color="var(--flr-star-dust)"
                                        classNames={{
                                            label: 'text-16 font-normal text-[var(--flr-gray)]'
                                        }}
                                        className="px-2"
                                    >
                                        {t(`earn_card.${properties.type}_label`)}
                                    </Badge>
                                </div>
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
                            <div className="mt-5 border-t border-[var(--flr-border-color)] pt-4">
                                <Text
                                    c="var(--flr-gray)"
                                    fw={400}
                                    className="text-14 px-4 mb-1"
                                >
                                    {properties.coin_type === 'pairs'
                                        ? t('earn_card.pools_pair_label')
                                        : t('earn_card.eligible_assets_label')
                                    }
                                </Text>
                                <div className="flex">
                                    {properties.pairs.map((pair, index) => {
                                        const { fassetIcon: FassetIcon, tokenIcon: TokenIcon } = getPairsIcon(pair);
                                        const [fasset, token] = pair.split('/');

                                        return (
                                            <div
                                                key={pair}
                                                className={`
                                                    flex items-center 
                                                    ${properties.coin_type === 'pairs' && index === 0 ? 'border-r' : ''} border-[var(--flr-border-color)] 
                                                    pb-4 px-4
                                                    ${properties.coin_type === 'pairs' ? 'grow' : ''}
                                                `}
                                            >
                                                {FassetIcon &&
                                                    <div className="flex flex-col items-center">
                                                        <FassetIcon
                                                            width="50"
                                                            height="50"
                                                            className="mr-1"
                                                        />
                                                        <Text
                                                            c="var(--flr-dark-gray)"
                                                            fw={400}
                                                            className="text-14 mt-1"
                                                        >
                                                            {t(`earn_card.${fasset}_label`)}
                                                        </Text>
                                                    </div>
                                                }
                                                {TokenIcon &&
                                                    <div className="flex flex-col items-center">
                                                        <TokenIcon
                                                            width="50"
                                                            height="50"
                                                        />
                                                        <Text
                                                            c="var(--flr-dark-gray)"
                                                            fw={400}
                                                            className="text-14 mt-1"
                                                        >
                                                            {t(`earn_card.${token}_label`)}
                                                        </Text>
                                                    </div>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </SimpleGrid>
            </div>
        </div>
    )
}