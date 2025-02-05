import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Text, Checkbox, Button } from "@mantine/core";
import FAssetModal from "@/components/modals/FAssetModal";
import CflrIcon from "@/components/icons/CflrIcon";
import ClockIcon from "@/components/icons/ClockIcon";
import { useDistribution } from "@/hooks/useDistribution";
import { formatNumberWithSuffix } from "@/utils";
import { IReward } from "@/types";

interface ILotteryModal {
    opened: boolean;
    onClose: (setCookie: boolean) => void;
    rewards: IReward | undefined;
}

export default function LotteryModal({ opened, onClose, rewards }: ILotteryModal) {
    const [dontShow, setDontShow] = useState<boolean>(false);
    const { distributionCountdown } = useDistribution();
    const { t } = useTranslation();

    const hasWon = rewards
        ? (rewards?.prevBiweeklyPlace <= 50 ?? false)
        : false;

    const closeModal = async () => {
        const setCookie = dontShow;
        setDontShow(false);

        if (hasWon) {
            window.location.href = 'https://portal.flare.network/';
        }

        onClose(setCookie);
    }

    return (
        <FAssetModal
            opened={opened}
            onClose={() => onClose(false)}
            title={t(`lottery_modal.${hasWon ? 'won' : 'not_won'}_title`)}
            size={750}
            zIndex={9999}
        >
            <FAssetModal.Body>
                <Text
                    className="text-28"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t(`lottery_modal.${hasWon ? 'won' : 'not_won'}_label`, { ordinal: true, count: rewards?.prevBiweeklyPlace })}
                </Text>
                <Text
                    className="block text-16 mb-8"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t(`lottery_modal.${hasWon ? 'won' : 'not_won'}_description_label`)}
                </Text>
                {hasWon
                    ? <div className="flex items-center">
                        <CflrIcon width="85" height="85" />
                        <div className="ml-3">
                            <Text
                                className="text-32"
                                fw={300}
                                c="var(--flr-black)"
                            >
                                {formatNumberWithSuffix(rewards?.prevBiweeklyRflr ?? 0)}
                            </Text>
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                ${formatNumberWithSuffix(rewards?.prevBiweeklyRflrUSD ?? 0)}
                            </Text>
                        </div>
                    </div>
                    : <div className="flex flex-col md:flex-row justify-between max-w-lg">
                        <div className="mb-5 md:mb-0">
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('lottery_modal.next_lottery_prize_pool_label')}
                            </Text>
                            <div className="flex items-center">
                                <Text
                                    className="text-24"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {t('lottery_modal.next_lottery_countdown_value_label')}
                                </Text>
                                <Trans
                                    i18nKey={`lottery_modal.paid_in_label`}
                                    components={{
                                        icon: <CflrIcon width="15" height="15" className="mx-1" />
                                    }}
                                    parent={Text}
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                    className="ml-1 flex items-center text-14"
                                />
                            </div>
                        </div>
                        <div>
                            <Text
                                className="text-12 uppercase"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('lottery_modal.next_lottery_countdown_label')}
                            </Text>
                            <div className="flex items-center mt-1">
                                <ClockIcon
                                    width="20"
                                    height="20"
                                    className="mr-1"
                                />
                                <Text
                                    className="text-24"
                                    fw={300}
                                    c="var(--flr-black)"
                                >
                                    {distributionCountdown}
                                </Text>
                            </div>
                        </div>
                    </div>
                }
                <Checkbox
                    checked={dontShow}
                    onChange={(event) => setDontShow(event.currentTarget.checked)}
                    className="mt-12"
                    label={
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('lottery_modal.dont_show_again_label')}
                        </Text>
                    }
                />
                <Text
                    className="text-14 mt-5"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('lottery_modal.note_label')}
                </Text>
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <Button
                    radius="xl"
                    className="w-full font-normal"
                    color="var(--flr-black)"
                    onClick={closeModal}
                >
                    {t(`lottery_modal.${hasWon ? 'claim' : 'done'}_button`)}
                </Button>
            </FAssetModal.Footer>
        </FAssetModal>
    )
}
