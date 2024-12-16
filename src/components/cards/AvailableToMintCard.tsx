import { Text, RingProgress } from "@mantine/core";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { IEcosystemInfo } from "@/types";
import { COINS } from "@/config/coin";
import { toNumber, formatNumber } from "@/utils";

interface IAvailableToMintCard {
    ecoSystemInfo: IEcosystemInfo | undefined;
}

export default function AvailableToMintCard({ ecoSystemInfo }: IAvailableToMintCard) {
    const { t } = useTranslation();

    const fAssetTokens = ecoSystemInfo?.supplyByFasset?.map(supply => {
        return {
            ...supply,
            token: COINS.find(coin => coin.type.toLowerCase() === supply.fasset.toLowerCase()),
        };
    });

    return (
        <div className="flex flex-col h-full max-[768px]:border-t-0 border-x-0 md:border-x border border-[var(--flr-border-color)]">
            <Text
                className="text-16 uppercase px-[15px] lg:px-6 py-4 min-h-14"
                fw={400}
                c="var(--flr-dark-gray)"
            >
                {t('available_to_mint_card.title')}
            </Text>
            <div className="flex max-[1119px]:flex-wrap min-[1200px]:flex-col h-full border-t border-[var(--flr-border-color)]">
                {fAssetTokens?.map((fAsset, index) => (
                    <div
                        className={`flex items-center basis-full min-[350px]:basis-6/12 px-[15px] lg:px-6 py-2 grow ${index < fAssetTokens?.length - 1 ? 'min-[1119px]:border-r min-[1200px]:border-r-0 min-[1200px]:border-b' : ''} border-[var(--flr-border-color)]`}
                        key={index}
                    >
                        <RingProgress
                            size={125}
                            thickness={13}
                            rootColor="#E62058"
                            label={fAsset.token?.icon({ width: "60", height: "60" })}
                            sections={[
                                { value: toNumber(fAsset.mintedPercentage), color: 'transparent' }
                            ]}
                            styles={{
                                root: {
                                    transform: 'translateX(-10px)'
                                },
                                label: {
                                    transform: 'translateY(-50%) translateX(6px)'
                                }
                            }}
                        />
                        <div>
                            <Text className="text-24" fw={300}>{fAsset.mintedPercentage}%</Text>
                            <Text className="text-16" fw={400}>
                                ${formatNumber(fAsset.availableToMintUSD)} ({fAsset.availableToMintLots} {t('available_to_mint_card.lots_label')})
                            </Text>
                            {fAsset.availableToMintLots > 0 &&
                                <Link
                                    href="/mint"
                                    className="flex items-center underline text-16 mt-1"
                                >
                                    <span>{t('available_to_mint_card.mint_label', { fAsset: fAsset.fasset })}</span>
                                    <IconArrowRight size={16} className="ml-1" />
                                </Link>
                            }
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
