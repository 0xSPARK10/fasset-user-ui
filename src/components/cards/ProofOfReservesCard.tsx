import { useTranslation } from "react-i18next";
import { SimpleGrid, Text, Title } from "@mantine/core";
import { IEcosystemInfo, ITimeData } from "@/types";
import FXrpIcon from "@/components/icons/FXrpIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import moment from "moment/moment";
import { FILTERS } from "@/constants";
import { LineChart } from "@mantine/charts";

interface IProofOfReservesCard {
    timeData: ITimeData | undefined;
    ecoSystemInfo: IEcosystemInfo | undefined;
    filter: string | null;
}

interface IProofOfReservesGraph {
    date: string;
    xLabel: string;
    value: number;
}

export default function ProofOfReservesCard({ timeData, filter, ecoSystemInfo }: IProofOfReservesCard) {
    const { t } = useTranslation();
    const proofOfReservesGraph: IProofOfReservesGraph[] = [];

    const formatLabel = () => {
        if (!filter) return '';
        if (filter === FILTERS.LAST_24_HOURS) {
            return 'HH:mm'
        } else if (filter === FILTERS.LAST_WEEK) {
            return 'MMM DD';
        } else if (filter === FILTERS.LAST_MONTH) {
            return 'MMM DD';
        } else if (filter === FILTERS.YEAR_TO_DATE) {
            return 'MMM';
        } else if (filter === FILTERS.LAST_YEAR) {
            return 'MMM';
        } else if (filter === FILTERS.ALL_TIME) {
            return 'MMM';
        }
    }

    timeData?.proofOfReserve.forEach(proofOfReserve => {
        proofOfReservesGraph.push({
            date: moment.unix(proofOfReserve.timestamp).format(),
            xLabel: moment.unix(proofOfReserve.timestamp).format(formatLabel()),
            value: toNumber(proofOfReserve.value)
        });
    });

    return (
        <div className="flex flex-col relative h-full border-l border-r border-[var(--flr-border-color)]">
            <Title
                className="bg-[var(--flr-white)] text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14 leading-[24px]  md:border-t border-[var(--flr-border-color)]"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t('proof_of_reserves_card.title')}
            </Title>
            <div className="border-t border-b border-[var(--flr-border-color)]">
                <SimpleGrid
                    cols={{ base: 1, xs: 3 }}
                    styles={{
                        root: {
                            '--sg-spacing-x': 0,
                            '--sg-spacing-y': 0
                        }
                    }}
                    className="items-center"
                >
                    <div className="p-[15px] lg:p-6 h-full">
                        <Title
                            fw={400}
                            c="var(--flr-dark-gray)"
                            className="text-16 uppercase"
                        >
                            {t('proof_of_reserves_card.total_label', {
                                fasset: process.env.NETWORK === 'mainnet' ? 'FXRP' : 'FTestXRP'
                            })}
                        </Title>
                        <div className="flex items-center mt-2">
                            <FXrpIcon
                                width="24"
                                height="24"
                                className="flex-shrink-0 mr-2"
                            />
                            <Text
                                fw={300}
                                c="var(--flr-black)"
                                className="text-24"
                            >
                                {formatNumberWithSuffix(ecoSystemInfo?.proofOfReserve?.total ?? 0)}
                            </Text>
                            <Text
                                fw={400}
                                c="var(--flr-dark-gray)"
                                className="text-16 ml-3"
                            >
                                ${formatNumberWithSuffix(ecoSystemInfo?.proofOfReserve?.totalUSD ?? 0)}
                            </Text>
                        </div>
                    </div>
                    <div className="p-[15px] lg:p-6 max-[576px]:border-y min-[576px]:border-x border-[var(--flr-border-color)] h-full">
                        <Title
                            fw={400}
                            c="var(--flr-dark-gray)"
                            className="text-16 uppercase"
                        >
                            {t('proof_of_reserves_card.xrp_reserve_label')}
                        </Title>
                        <div className="flex items-center mt-2">
                            <XrpIcon
                                width="24"
                                height="24"
                                className="flex-shrink-0 mr-2"
                            />
                            <Text
                                fw={300}
                                c="var(--flr-black)"
                                className="text-24"
                            >
                                {formatNumberWithSuffix(ecoSystemInfo?.proofOfReserve?.reserve ?? 0)}
                            </Text>
                            <Text
                                fw={400}
                                c="var(--flr-dark-gray)"
                                className="text-16 ml-3"
                            >
                                ${formatNumberWithSuffix(ecoSystemInfo?.proofOfReserve?.reserveUSD ?? 0)}
                            </Text>
                        </div>
                    </div>
                    <div className="p-[15px] lg:p-6 h-full">
                        <Text
                            fw={400}
                            c="var(--flr-dark-gray)"
                            className="text-16 uppercase"
                        >
                            {t('proof_of_reserves_card.ratio_label')}
                        </Text>
                        <Text
                            fw={300}
                            c="var(--flr-black)"
                            className="text-24 mt-2"
                        >
                            {ecoSystemInfo?.proofOfReserve?.ratio}%
                        </Text>
                    </div>
                </SimpleGrid>
            </div>
        </div>
    )
}