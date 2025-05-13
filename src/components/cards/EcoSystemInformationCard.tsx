import { Divider, Grid, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { formatNumberWithSuffix } from "@/utils";
import {IEcosystemInfo} from "@/types";

interface IEcoSystemInformationCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
}

export default function EcoSystemInformationCard({ ecoSystemInfo }: IEcoSystemInformationCard) {
    const { t } = useTranslation();

    return (
        <Grid
            styles={{
                root: {
                    '--grid-gutter': 0
                }
            }}
        >
            <Grid.Col
                span={{ base: 12, sm: 4 }}
                className="px-[15px] lg:px-3 py-2 border-x-0 border-b-0 md:border-b md:border-x border border-[var(--flr-border-color)]"
            >
                <div className="flex items-center md:block">
                    <Text
                        className="text-12 uppercase basis-9/12"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('home.wallets_holding_fassets_label')}
                    </Text>
                    <Divider
                        orientation="vertical"
                        className="block md:hidden mr-3 -my-2"
                    />
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {formatNumberWithSuffix(ecoSystemInfo?.numHolders ?? 0, 0)}
                    </Text>
                </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }} className="px-[15px] lg:px-3 py-2 border-x-0 md:border-y border-[var(--flr-border-color)]">
                <div className="flex items-center md:block">
                    <Text
                        className="text-12 uppercase basis-9/12"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('home.number_of_mints_label')}
                    </Text>
                    <Divider
                        orientation="vertical"
                        className="block md:hidden mr-3 -my-2"
                    />
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {formatNumberWithSuffix(ecoSystemInfo?.numMints ?? 0, 0)}
                    </Text>
                </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }} className="px-[15px] lg:px-3 py-2 border-x-0 md:border-x border border-[var(--flr-border-color)]">
                <div className="flex items-center md:block">
                    <Text
                        className="text-12 uppercase basis-9/12"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('home.number_of_agents_label')}
                    </Text>
                    <Divider
                        orientation="vertical"
                        className="block md:hidden mr-3 -my-2"
                    />
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {formatNumberWithSuffix(ecoSystemInfo?.numAgents ?? 0, 0)}
                    </Text>
                </div>
            </Grid.Col>
        </Grid>
    );
}
