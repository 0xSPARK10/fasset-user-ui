import { useTranslation } from "react-i18next";
import { Title, Text, Grid, rem, Divider, Button, Stack } from "@mantine/core";
import { IEcosystemInfo } from "@/types";
import { formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";
import { IconInfoHexagon, IconInfinity } from "@tabler/icons-react";
import XrpIcon from "@/components/icons/XrpIcon";
import React from "react";
import { modals } from "@mantine/modals";
import { useMediaQuery } from "@mantine/hooks";

interface IFassetsOverviewCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
}

interface IOverviewSectionProps {
    label: string;
    borderClassName?: string;
    onInfoClick?: () => void;
    children: React.ReactNode;
}

function OverviewSection({ label, borderClassName = "", onInfoClick, children }: IOverviewSectionProps) {
    return (
        <div
            className={`flex flex-1 flex-col justify-center max-md:items-center border-[var(--flr-border-color)] px-[25px] sm:px-6 py-3 sm:py-8 ${borderClassName}`}
        >
            <div>
                <div className="flex items-center">
                    <Text
                        className="text-16 uppercase"
                        fw={300}
                        c="var(--flr-gray)"
                    >
                        {label}
                    </Text>
                    {onInfoClick && (
                        <IconInfoHexagon
                            style={{ width: rem(16), height: rem(16) }}
                            color="var(--mantine-color-gray-6)"
                            className="ml-2 flex-shrink-0 cursor-pointer hover:stroke-gray-600"
                            onClick={onInfoClick}
                        />
                    )}
                </div>
                <div className="flex items-center mt-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function FassetsOverviewCard({ ecoSystemInfo } : IFassetsOverviewCard) {
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 640px)');

    const xrpFasset = ecoSystemInfo?.supplyByFasset
        ?.map(supply => {
            return {
                ...supply,
                token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
            };
        })
        ?.find(supply => supply.fasset.toLowerCase().includes('xrp'));

      const openModal = () => {
          modals.open({
              zIndex: 3000,
              size: 800,
              fullScreen: mediaQueryMatches,
              title: <Text className="text-32" fw={300} c="var(--flr-black)">
                  {t('core_vault_card.modal.title')}
              </Text>,
              children: (
                  <div>
                      <div className="py-2 px-0 sm:px-8">
                          <Title
                              className="text-24 mb-3"
                              fw={300}
                              c="var(--flr-dark-gray)"
                          >
                              {t('core_vault_card.modal.why_core_vault_title')}
                          </Title>
                          <Text
                              className="text-16 whitespace-pre-line"
                              fw={400}
                              c="var(--flr-dark-gray)"
                          >
                              {t('core_vault_card.modal.why_core_vault_description_label')}
                          </Text>
                          <Title
                              className="text-24 mb-3 mt-10"
                              fw={300}
                              c="var(--flr-dark-gray)"
                          >
                              {t('core_vault_card.modal.what_is_core_vault_title')}
                          </Title>
                          <Text
                              className="text-16"
                              fw={400}
                              c="var(--flr-dark-gray)"
                          >
                              {t('core_vault_card.modal.what_is_core_vault_description_label')}
                          </Text>
                      </div>
                      <Divider
                          c="var(--flr-border-color)"
                          className="my-10 -mx-4"
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
                          {t('core_vault_card.modal.confirm_button')}
                      </Button>
                  </div>
              )
          })
      }

    return (
        <div className="flex flex-col border border-[var(--flr-border-color)] h-full relative">
            <div className="flex items-center justify-between px-[15px] lg:px-6 py-4 min-h-14 border-b border-[var(--flr-border-color)]">
                <Title
                    className="text-16 uppercase"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('fassets_overview_card.title')}
                </Title>
            </div>
            <Grid
                className="flex items-center bg-[var(--flr-lightest-gray)] md:h-full"
                classNames={{
                    root: 'md:h-full',
                    inner: 'md:h-full w-full'
                }}
                styles={{
                    root: {
                        '--grid-gutter': 0
                    },
                }}
            >
                <Grid.Col
                    span={{ base: 12, sm: 8 }}
                    className="max-md:pt-[15px] pl-[15px] lg:pl-6"
                >
                    <div className="flex items-center md:border-r border-[var(--flr-border-color)] md:h-full py-3">
                        {xrpFasset?.token?.icon({ width: "122", height: "122" })}
                        <Stack gap={0} className="ml-5">
                            <Text
                                className="text-16 uppercase"
                                fw={300}
                                c="var(--flr-dark-gray)"
                            >
                                {t('fassets_overview_card.circulating_supply_label')}
                            </Text>
                            <Text
                                className="text-32 leading-none"
                                fw={300}
                                lh={"sm"}
                                c="var(--flr-black)"
                            >
                                {formatNumberWithSuffix(xrpFasset?.supply ?? 0)}
                            </Text>
                        </Stack>
                    </div>
                </Grid.Col>
                <Grid.Col
                    span={{ base: 12, sm: 4 }}
                    className="p-0 flex md:flex-col md:h-full w-full"
                >
                    <OverviewSection
                        label={t('fassets_overview_card.minting_cap_label')}
                        borderClassName="max-md:border-t max-md:border-r md:border-b"
                    >
                        {xrpFasset?.token?.icon({ width: "24", height: "24" })}
                        {xrpFasset?.mintingCap === '0' ? (
                            <>
                                <IconInfinity
                                    size={28}
                                    stroke={1.25}
                                    color="var(--flr-dark-gray)"
                                    className="ml-2 flex-shrink-0"
                                />
                                <Text
                                    className="text-16 ml-2"
                                    fw={400}
                                    c="var(--flr-dark-gray)"
                                >
                                    {t('fassets_overview_card.cap_removed_label')}
                                </Text>
                            </>
                        ) : (
                            <Text
                                className="text-24 ml-2 leading-none"
                                fw={300}
                                c="var(--flr-dark-gray)"
                            >
                                {formatNumberWithSuffix(xrpFasset?.mintingCap ?? 0)}
                            </Text>
                        )}
                    </OverviewSection>
                    <OverviewSection
                        label={t('fassets_overview_card.core_vault_label')}
                        borderClassName="max-md:border-t"
                        onInfoClick={openModal}
                    >
                        <XrpIcon width="24" height="24" className="flex-shrink-0" />
                        <Text
                            className="text-24 ml-2 leading-none"
                            fw={300}
                            c="var(--flr-dark-gray)"
                        >
                            {formatNumberWithSuffix(ecoSystemInfo?.coreVaultSupply ?? 0)}
                        </Text>
                    </OverviewSection>
                </Grid.Col>
            </Grid>
        </div>
    );
}
