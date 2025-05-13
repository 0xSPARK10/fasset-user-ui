import React, { useEffect, useState } from "react";
import { Anchor, Button, rem, Text } from "@mantine/core";
import { Trans, useTranslation } from "react-i18next";
import { Cookies } from "react-cookie";
import { IconArrowUpRight } from "@tabler/icons-react";
import FAssetModal from "@/components/modals/FAssetModal";
import BlazeSwapIcon from "@/components/icons/BlazeSwapIcon";
import EnosysIcon from "@/components/icons/EnosysIcon";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { formatNumberWithSuffix, toNumber } from "@/utils";
import { COINS } from "@/config/coin";
import { COOKIE_WINDDOWN } from "@/constants";

interface IFAssetWindDownModal {
    opened: boolean;
    onClose: (redirect: boolean) => void;
    fAssets: string[];
}

interface IDisabledFAsset {
    fAsset: string,
    balance: string;
    usdBalance: string;
    icon: React.ReactNode | undefined;
}

export default function FAssetWindDownModal({ opened, onClose, fAssets }: IFAssetWindDownModal) {
    const [disabledFassets, setDisabledFassets] = useState<IDisabledFAsset[]>([]);
    const [cantRedeem, setCantRedeem] = useState<boolean>(false);

    const cookies = new Cookies();
    const { t } = useTranslation();
    const { isConnected, mainToken } = useWeb3();
    const nativeBalance = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined && opened);

    let windDownDate = '';
    if (process.env.WIND_DOWN_DATE) {
        windDownDate = new Date(process.env.WIND_DOWN_DATE).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
        });
    }

    useEffect(() => {
        if (!nativeBalance.data) return;

        setDisabledFassets(fAssets
            .map(fAsset => {
                const coin = COINS.find(coin => coin.type.toLowerCase() === fAsset.toLowerCase());
                const balance = nativeBalance.data.find(balance => balance.symbol === fAsset);

                if (coin && balance?.balance && toNumber(balance.balance) < coin.lotSize) {
                     setCantRedeem(true);
                }

                return {
                    fAsset: fAsset,
                    balance: balance?.balance ?? '0',
                    usdBalance: balance?.valueUSD ?? '0',
                    icon: coin?.icon({ width: '85', height: '85', className: 'flex-shrink-0' }) ?? undefined
                }
            })
            .filter(fAsset => fAsset.balance !== "0")
        );
    }, [nativeBalance.data]);

    const closeModal = async (redirect: boolean = false) => {
        const cookieFassets = cookies.get(COOKIE_WINDDOWN);
        let setCookies = fAssets.reduce<Record<string, boolean>>((acc, item) => {
                acc[item] = true;
                return acc;
            }, {});

        if (cookieFassets) {
            setCookies = {
                ...cookieFassets,
                ...setCookies
            }
        }

        cookies.set(COOKIE_WINDDOWN, setCookies, {
            maxAge: 24 * 60 * 60 * 365
        });

        onClose(redirect);
    }

    return (
        <FAssetModal
            opened={opened}
            onClose={closeModal}
            title={t(`fasset_wind_down_modal.${cantRedeem ? 'title_partial' : 'title'}`, {
                fAssets: fAssets.join(', '),
                date: windDownDate
            })}
            size={750}
            zIndex={9999}
        >
            <FAssetModal.Body>
                <Text
                    className="text-24 mb-3"
                    fw={300}
                    c="var(--flr-dark-gray)"
                >
                    {
                        cantRedeem
                        ? t('fasset_wind_down_modal.subtitle_partial_lots')
                        : t('fasset_wind_down_modal.subtitle', { fAssets: fAssets.join(', ') })
                    }
                </Text>
                <Trans
                    i18nKey={cantRedeem ? 'fasset_wind_down_modal.description_partial_lots_label' : 'fasset_wind_down_modal.description_label'}
                    parent={Text}
                    className="text-16 whitespace-break-spaces"
                    fw={400}
                    c="var(--flr-dark-gray)"
                    components={{
                        strong: <strong />,
                        a: <Anchor
                            underline="always"
                            href={process.env.WIND_DOWN_BLOG_URL}
                            target="_blank"
                            className="inline-flex ml-1"
                            fw={400}
                            c="var(--flr-dark-gray)"
                        />,
                        icon: <IconArrowUpRight
                            style={{ width: rem(20), height: rem(20) }}
                            color="var(--flr-black)"
                        />
                    }}
                    values={{
                        pools: fAssets.join(', ') ,
                        fAssets: fAssets.map(fAsset => `${fAsset}`),
                        date: windDownDate
                    }}
                />
                {isConnected && disabledFassets.length > 0 &&
                    <div
                        className="my-8 flex items-center flex-wrap -mx-4"
                    >
                        {disabledFassets.map((fAsset, index) => (
                            <div
                                className={`flex items-center p-4`}
                                key={index}
                            >
                                {fAsset.icon}
                                <div className="ml-3">
                                    <Text
                                        className="text-12 uppercase"
                                        fw={400}
                                        c="var(--flr-gray)"
                                    >
                                        {t('fasset_wind_down_modal.balance_label')}
                                    </Text>
                                    <Text
                                        className="text-32"
                                        fw={300}
                                        c="var(--flr-black)"
                                    >
                                        {formatNumberWithSuffix(fAsset.balance)}
                                    </Text>
                                    <Text
                                        className="text-16"
                                        fw={400}
                                        c="var(--flr-black)"
                                    >
                                        ${formatNumberWithSuffix(fAsset.usdBalance)}
                                    </Text>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </FAssetModal.Body>
            <FAssetModal.Footer>
                {nativeBalance.data &&
                    <div className="flex">
                        {cantRedeem
                            ? <div className="flex flex-col sm:flex-row w-full">
                                <Button
                                    variant="outline"
                                    color="var(--flr-black)"
                                    size="lg"
                                    radius="xl"
                                    fullWidth
                                    component="a"
                                    href="https://app.blazeswap.xyz/swap/"
                                    target="_blank"
                                    className="font-normal mb-3 sm:mb-0 sm:mr-3"
                                    classNames={{
                                        inner: 'w-full',
                                        label: 'w-full',
                                    }}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <BlazeSwapIcon width="200"/>
                                        <IconArrowUpRight size={26} className="ml-1"/>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    color="var(--flr-black)"
                                    size="lg"
                                    radius="xl"
                                    fullWidth
                                    component="a"
                                    href="https://v3.dex.enosys.global/"
                                    target="_blank"
                                    className="font-normal mb-3"
                                    classNames={{
                                        inner: 'w-full',
                                        label: 'w-full',
                                    }}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <EnosysIcon width="160" />
                                        <IconArrowUpRight size={26} className="ml-1" />
                                    </div>
                                </Button>
                            </div>
                            : <div className="flex flex-col sm:flex-row w-full">
                                <Button
                                    variant="outline"
                                    color="var(--flr-black)"
                                    size="md"
                                    radius="xl"
                                    fullWidth
                                    component="a"
                                    href={process.env.WIND_DOWN_BLOG_URL}
                                    target="_blank"
                                    className="flex items-center justify-center font-normal mb-3 sm:mb-0 sm:mr-3"
                                >
                                    {t('fasset_wind_down_modal.details_button')}
                                    <IconArrowUpRight size={18} className="ml-1"/>
                                </Button>
                                <Button
                                    variant="filled"
                                    color="black"
                                    radius="xl"
                                    size="md"
                                    fullWidth
                                    className="hover:text-white font-normal"
                                    onClick={() => closeModal(isConnected && disabledFassets.length > 0)}
                                >
                                    {isConnected && disabledFassets.length > 0
                                        ? t('fasset_wind_down_modal.redeem_button', {fAssets: fAssets.join(', ')})
                                        : t('fasset_wind_down_modal.understand_button')
                                    }
                                </Button>
                            </div>
                        }
                    </div>
                }
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
