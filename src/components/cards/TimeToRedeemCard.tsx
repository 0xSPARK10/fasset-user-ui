import React from "react";
import { useRouter } from "next/router";
import {
    Title,
    Text,
    Button,
    SimpleGrid,
    Anchor,
    Divider,
    Table,
    Container,
    Grid
} from "@mantine/core";
import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";
import { modals } from "@mantine/modals";
import { toNumber } from "@/utils";
import { IEcoSystemInfoSupplyByFasset } from "@/types";
import { COINS } from "@/config/coin";
import homeClasses from "@/styles/pages/Home.module.scss";
import classes from "@/styles/components/cards/TimeToRedeemCard.module.scss";

interface ITimeToRedeemCard {
    tokens: IEcoSystemInfoSupplyByFasset[] | undefined;
}

export default function TimeToRedeemCard({ tokens }: ITimeToRedeemCard) {
    const { t } = useTranslation();

    const localTokens: (IEcoSystemInfoSupplyByFasset & { icon: any; percentageMinted: number })[] = (tokens || [])?.map(token => {
        const coin = COINS.find(coin => coin.type.toLowerCase() === token?.fasset.toLowerCase());
        const percentageMinted = 100 - toNumber(token?.mintedPercentage ?? "0");

        return {
            icon: coin?.icon,
            percentageMinted: percentageMinted,
            ...token
        }
    })

    const router = useRouter();

    const redirectTo = async (url: string) => {
        modals.closeAll();
        await router.push(url);
    }

    const openModal = () => {
        modals.open({
            zIndex: 3000,
            size: 950,
            title: <Text className="text-32" fw={300} c="var(--flr-black)">
                {t('time_to_redeem_card.incentives_modal.title')}
            </Text>,
            children: (
                <div className="px-0 sm:px-10">
                    <Text
                        className="text-28 mb-4"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('time_to_redeem_card.incentives_modal.total_incentives_awarded_label')}
                    </Text>
                    <Trans
                        i18nKey="time_to_redeem_card.incentives_modal.description_label"
                        parent={Text}
                        fw={400}
                        c="var(--flr-dark-gray)"
                        className="text-16 whitespace-break-spaces"
                        components={{
                            a1: <Anchor
                                underline="always"
                                href="https://flare.network/a-guide-to-rflr-rewards/"
                                target="_blank"
                                className="inline-flex"
                                c="var(--flr-dark-gray)"
                                fw={500}
                            />,
                            a2: <Anchor
                                underline="always"
                                href="https://flare.network/incentives-for-fassets-on-songbird/"
                                target="_blank"
                                className="inline-flex"
                                c="var(--flr-dark-gray)"
                                fw={500}
                            />,
                        }}
                    />
                    <Divider
                        c="var(--flr-border-color)"
                        className="my-10"
                    />
                    <div className="flex items-center flex-wrap md:flex-nowrap">
                        <Title
                            className="text-24 mr-4"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            <span className="mr-2">1 .</span>
                            {t('time_to_redeem_card.incentives_modal.earn_rewards_via_redeeming_title')}
                        </Title>
                        <Button
                            variant="gradient"
                            onClick={() => redirectTo('/mint')}
                            radius="xl"
                            size="sm"
                            fw={400}
                        >
                            {t('time_to_redeem_card.incentives_modal.redeem_button')}
                        </Button>
                    </div>
                    <Grid
                        className="mt-6"
                    >
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Trans
                                i18nKey="time_to_redeem_card.incentives_modal.earn_rewards_via_redeeming_description_label"
                                parent={Text}
                                className="text-16 whitespace-break-spaces"
                                fw={400}
                                c="var(--flr-dark-gray)"
                                components={{
                                    strong: <strong />
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Text
                                className="text-16"
                                fw={500}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.exponential_redemption_awards_label')}
                            </Text>
                            <Table
                                withColumnBorders
                                className="mt-3"
                                classNames={{
                                    th: '!bg-[var(--flr-lightest-gray)]'
                                }}
                                styles={{
                                    table: {
                                        '--table-border-color': 'var(--flr-border-color)'
                                    }
                                }}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th className="w-1/2">
                                            <Text
                                                className="text-12 uppercase"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                {t('time_to_redeem_card.incentives_modal.fassets_table.mint_utilization_label')}
                                            </Text>
                                        </Table.Th>
                                        <Table.Th className="w-1/2">
                                            <Text
                                                className="text-12 uppercase"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                {t('time_to_redeem_card.incentives_modal.fassets_table.rewards_multiplier_label')}
                                            </Text>
                                        </Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td className="flex items-center">
                                            <div className={`${classes.smallDonutChart} mr-2`}
                                                 style={{
                                                     //@ts-ignore
                                                     '--percentage': 100,
                                                 }}
                                            />
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                95% - 100%
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                20x
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td className="flex items-center">
                                            <div className={`${classes.smallDonutChart} mr-2`}
                                                 style={{
                                                     //@ts-ignore
                                                     '--percentage': 95,
                                                 }}
                                            />
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                90% - 95%
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                10x
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td className="flex items-center">
                                            <div className={`${classes.smallDonutChart} mr-2`}
                                                 style={{
                                                     //@ts-ignore
                                                     '--percentage': 90,
                                                 }}
                                            />
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                85% - 90%
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                5x
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td className="flex items-center">
                                            <div className={`${classes.smallDonutChart} mr-2`}
                                                 style={{
                                                     //@ts-ignore
                                                     '--percentage': 85,
                                                 }}
                                            />
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                80% - 85%
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                2x
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td className="flex items-center">
                                            <div className={`${classes.smallDonutChart} mr-2`}
                                                 style={{
                                                     //@ts-ignore
                                                     '--percentage': 80,
                                                 }}
                                            />
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                75% - 80%
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text
                                                className="text-16"
                                                fw={400}
                                                c="var(--flr-dark-gray)"
                                            >
                                                1x
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Text
                                className="text-16 whitespace-break-spaces"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.earn_rewards_via_redeeming_table_description_label')}
                            </Text>
                        </Grid.Col>
                    </Grid>
                    <div className="flex items-center flex-wrap md:flex-nowrap mt-10">
                        <Title
                            className="text-24 mr-4"
                            fw={300}
                            c="var(--flr-black)"
                        >
                            <span className="mr-2">2 .</span>
                            {t('time_to_redeem_card.incentives_modal.earn_rewards_via_pools_title')}
                        </Title>
                        <Button
                            variant="gradient"
                            onClick={() => redirectTo('/pools')}
                            radius="xl"
                            size="sm"
                            fw={400}
                        >
                            {t('time_to_redeem_card.incentives_modal.view_pools_button')}
                        </Button>
                    </div>
                    <SimpleGrid
                        cols={{base: 1, md: 2}}
                        verticalSpacing="xl"
                        spacing="xl"
                        className="mt-6"
                    >
                        <div>
                            <Text
                                className="text-16 whitespace-break-spaces"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.earn_rewards_via_pools_description_label')}
                            </Text>
                        </div>
                        <div>
                            <Text
                                className="text-16 whitespace-break-spaces"
                                fw={400}
                                c="var(--flr-dark-gray)"
                            >
                                {t('time_to_redeem_card.incentives_modal.each_distribution_period_description_label')}
                            </Text>
                        </div>
                    </SimpleGrid>
                    <Divider
                        c="var(--flr-border-color)"
                        className="my-10 -mx-4 sm:-mx-14"
                    />
                    <Text
                        className="text-14"
                        fw={400}
                        c="var(--flr-dark-gray)"
                    >
                        {t('time_to_redeem_card.incentives_modal.sponsored_description_label')}
                    </Text>
                    <Divider
                        c="var(--flr-border-color)"
                        className="my-10 -mx-4 sm:-mx-14"
                    />
                    <Button
                        onClick={() => {
                            modals.closeAll()
                        }}
                        variant="filled"
                        color="black"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="hover:text-white font-normal mb-5"
                    >
                        {t('time_to_redeem_card.incentives_modal.done_button')}
                    </Button>
                </div>
            )
        })
    }

    return (
        <div className="min-[767px]:border-t border-b border-[var(--flr-border-color)] bg-[var(--flr-lightest-gray)]">
            <Container fluid className={`${homeClasses.container}`}>
                <div className={`flex flex-row justify-between flex-col lg:flex-row lg:items-center py-6 px-[10px]`}>
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
                    {localTokens?.map((token, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-center flex-wrap ${index < localTokens.length - 1 ? 'mb-5 md:mb-0' : ''}`}
                        >
                            <Button
                                variant="outline"
                                component={Link}
                                href="/mint"
                                color="var(--flr-pink)"
                                h={72}
                                rightSection={token?.icon && token.icon({width: '40', height: '40'})}
                                fw={400}
                                classNames={{
                                    root: 'rounded-[48px] px-[14px] hover-gradient',
                                    label: 'text-20',
                                    section: 'ml-5'
                                }}
                                className="m-3"
                            >
                                {t('time_to_redeem_card.redeem_button', {fAsset: token.fasset})}
                            </Button>
                            <div className={`${classes.donutChart} m-3`}
                                 style={{
                                     //@ts-ignore
                                     '--percentage': token.percentageMinted,
                                 }}
                            >
                                <div className="flex flex-col items-center">
                                    <Text
                                        className="text-48 -mb-2"
                                        fw={300}
                                        c="var(--flr-black)"
                                    >
                                        {token.percentageMinted.toFixed(0)}%
                                    </Text>
                                    <div className="flex items-center">
                                        {token?.icon && token.icon({
                                            width: '20',
                                            height: '20',
                                            className: 'flex-shrink-0 mr-2'
                                        })}
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
                    ))}
                </div>
            </Container>
        </div>
    );
}
