import { useTranslation } from "react-i18next";
import { SimpleGrid, Text, Title } from "@mantine/core";
import { IEcosystemInfo } from "@/types";
import FXrpIcon from "@/components/icons/FXrpIcon";
import XrpIcon from "@/components/icons/XrpIcon";
import { formatNumberWithSuffix } from "@/utils";
import { IS_MAINNET } from "@/constants";

interface IProofOfReservesCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
}

export default function ProofOfReservesCard({ ecoSystemInfo }: IProofOfReservesCard) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col relative h-full border border-[var(--flr-border-color)] bg-[var(--flr-lightest-gray)]">
            <Title
                className="bg-[var(--flr-white)] text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14 leading-[24px] border-[var(--flr-border-color)]"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t('proof_of_reserves_card.title')}
            </Title>
            <div className="border-t border-[var(--flr-border-color)]">
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
                            fw={300}
                            c="var(--flr-dark-gray)"
                            className="text-16 uppercase"
                        >
                            {t('proof_of_reserves_card.total_label')}
                        </Title>
                        <div className="flex items-center mt-1">
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
                        </div>
                    </div>
                    <div className="p-[15px] lg:p-6 max-[576px]:border-y min-[576px]:border-x border-[var(--flr-border-color)] h-full">
                        <Title
                            fw={300}
                            c="var(--flr-dark-gray)"
                            className="text-16 uppercase"
                        >
                            {t('proof_of_reserves_card.in_reserve_label')}
                        </Title>
                        <div className="flex items-center mt-1">
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
                        </div>
                    </div>
                    <div className="p-[15px] lg:p-6 h-full">
                        <Text
                            fw={300}
                            c="var(--flr-dark-gray)"
                            className="text-16 uppercase"
                        >
                            {t('proof_of_reserves_card.ratio_label')}
                        </Text>
                        <Text
                            fw={300}
                            c="var(--flr-black)"
                            className="text-24 mt-1"
                        >
                            {ecoSystemInfo?.proofOfReserve?.ratio}%
                        </Text>
                    </div>
                </SimpleGrid>
            </div>
        </div>
    )
}
