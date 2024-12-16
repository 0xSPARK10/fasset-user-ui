
import Link from "next/link";
import { Title, Text, Button, SimpleGrid } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { modals } from "@mantine/modals";
import { IEcoSystemInfoSupplyByFasset } from "@/types";
import { COINS } from "@/config/coin";
import { toNumber } from "@/utils";
import classes from "@/styles/components/cards/TimeToRedeemCard.module.scss";
import React from "react";

interface ITimeToRedeemCard {
    supplyToken: IEcoSystemInfoSupplyByFasset | undefined;
}

export default function TimeToRedeemCard({ supplyToken }: ITimeToRedeemCard) {
    const { t } = useTranslation();
    const token = COINS.find(coin => coin.type.toLowerCase() === supplyToken?.fasset.toLowerCase());
    const percentageMinted = 100 - toNumber(supplyToken?.mintedPercentage ?? "0");

    const openModal = () => {
        modals.open({
            zIndex: 3000,
            size: 950,
            title: t('time_to_redeem_card.incentives_modal.title'),
            children: (
                <div className="px-0 sm:px-7">
                    <Text
                        className="text-20 md:text-24"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {t('time_to_redeem_card.incentives_modal.description_label')}
                    </Text>
                    <Title
                        className="text-28 mt-6"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('time_to_redeem_card.incentives_modal.your_incentives_title')}
                    </Title>
                    <SimpleGrid
                        cols={{ base: 1, md: 2 }}
                        verticalSpacing="xl"
                        spacing="xl"
                        className="mt-4"
                    >
                        <div>
                            <Title
                                className="text-16"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                {t('time_to_redeem_card.incentives_modal.pending_rewards_title')}
                            </Title>
                            <Text
                                className="text-16 mt-1"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.pending_rewards_description_label')}
                            </Text>
                        </div>
                        <div>
                            <Title
                                className="text-16"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                {t('time_to_redeem_card.incentives_modal.available_rewards_title')}
                            </Title>
                            <Text
                                className="text-16 mt-1"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.available_rewards_label')}
                            </Text>
                        </div>
                    </SimpleGrid>
                    <Title
                        className="text-28 mt-10"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('time_to_redeem_card.incentives_modal.how_to_claim_title')}
                    </Title>
                    <SimpleGrid
                        cols={{ base: 1, md: 2 }}
                        verticalSpacing="xl"
                        spacing="xl"
                        className="mt-4"
                    >
                        <div>
                            <Title
                                className="flex items-center text-16"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                <span
                                    className="block w-[22px] h-[22px] text-center text-16 font-normal text-[var(--flr-white)] bg-[var(--flr-black)] rounded-full mr-1"
                                >
                                    1
                                </span>
                                {t('time_to_redeem_card.incentives_modal.go_to_flare_portal_label')}
                            </Title>
                            <Link
                                className="block text-16 mt-1 underline font-normal text-[var(--flr-dark-gray)]"
                                href="https://portal.flare.network/"
                                target="_blank"
                            >
                                {t('time_to_redeem_card.incentives_modal.link_here_label')}
                            </Link>
                        </div>
                        <div>
                            <Title
                                className="flex items-center text-16"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                <span
                                    className="block w-[22px] h-[22px] text-center text-16 font-normal text-[var(--flr-white)] bg-[var(--flr-black)] rounded-full mr-1"
                                >
                                    2
                                </span>
                                {t('time_to_redeem_card.incentives_modal.find_fassets_title')}
                            </Title>
                            <Text
                                className="text-16 mt-1"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.find_fassets_description_label')}
                            </Text>
                        </div>
                        <div>
                            <Title
                                className="flex items-center text-16"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                <span
                                    className="block w-[22px] h-[22px] text-center text-16 font-normal text-[var(--flr-white)] bg-[var(--flr-black)] rounded-full mr-1"
                                >
                                    3
                                </span>
                                {t('time_to_redeem_card.incentives_modal.decide_rewards_to_claim_title')}
                            </Title>
                            <Text
                                className="text-16 mt-1"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.decide_rewards_to_claim_description_label')}
                            </Text>
                        </div>
                        <div>
                            <Title
                                className="flex items-center text-16"
                                fw={500}
                                c="var(--flr-black)"
                            >
                                <span
                                    className="block w-[22px] h-[22px] text-center text-16 font-normal text-[var(--flr-white)] bg-[var(--flr-black)] rounded-full mr-1"
                                >
                                    4
                                </span>
                                {t('time_to_redeem_card.incentives_modal.claim_rewards_title')}
                            </Title>
                            <Text
                                className="text-16 mt-1"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.claim_rewards_description_label')}
                            </Text>
                        </div>
                    </SimpleGrid>
                    <Button
                        onClick={() => { modals.closeAll() }}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mt-16"
                    >
                        {t('time_to_redeem_card.incentives_modal.done_button')}
                    </Button>
                </div>
            )
        })
    }

    return (
        <div
            className="flex flex-col md:flex-row items-center justify-between py-6 px-[15px] lg:pr-[10px]">
            <div className="flex items-center">
                {token?.icon && token.icon({width: '88', height: '88', className: 'flex-shrink-0 mr-4'})}
                <div>
                    <Title
                        className="text-28 mb-1"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('time_to_redeem_card.title')}
                    </Title>
                    <Text
                        className="text-18 underline cursor-pointer"
                        fw={400}
                        c="var(--flr-black)"
                        onClick={openModal}
                    >
                        {t('time_to_redeem_card.how_it_works_label')}
                    </Text>
                </div>
                <Button
                    variant="outline"
                    component={Link}
                    href="/mint"
                    color="var(--flr-pink)"
                    h={72}
                    rightSection={token?.icon && token.icon({width: '44', height: '44', className: 'ml-2'})}
                    className="hidden lg:block ml-5"
                    fw={400}
                    classNames={{
                        root: 'rounded-[48px] px-[14px] hover-gradient',
                        label: 'text-20',
                        section: 'ml-5'
                    }}
                >
                    {t('time_to_redeem_card.redeem_button')}
                </Button>
            </div>
            <div className={`${classes.donutChart} mt-6 md:mt-0`}
                 style={{
                     //@ts-ignore
                     '--percentage': percentageMinted,
                 }}
            >
                <div className="flex flex-col items-center">
                    <Text
                        className="text-48 -mb-2"
                        fw={300}
                        c="var(--flr-black)"
                    >
                        {percentageMinted.toFixed(0)}%
                    </Text>
                    <div className="flex items-center">
                        {token?.icon && token.icon({width: '20', height: '20', className: 'flex-shrink-0 mr-2' })}
                        <Text
                            className="text-16 uppercase"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        >
                            {t('time_to_redeem_card.minted_label')}
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
}
