import React, { useEffect, useState } from "react";
import { Button, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Cookies } from "react-cookie";
import FAssetModal from "@/components/modals/FAssetModal";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { formatNumberWithSuffix } from "@/utils";
import { COINS } from "@/config/coin";

interface IFAssetWindDownModal {
    opened: boolean;
    onClose: () => void;
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

    const cookies = new Cookies();
    const { t } = useTranslation();
    const { isConnected, mainToken } = useWeb3();
    const nativeBalance = useNativeBalance(mainToken?.address ?? '', mainToken !== undefined && opened);

    useEffect(() => {
        if (!nativeBalance.data) return;

        setDisabledFassets(fAssets
            .map(fAsset => {
                const coin = COINS.find(coin => coin.type.toLowerCase() === fAsset.toLowerCase());
                const balance = nativeBalance.data.find(balance => balance.symbol === fAsset);

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

    const closeModal = async () => {
        cookies.set('winddown', true, {
            maxAge: 24 * 60 * 60 * 365
        });

        onClose();
    }

    return (
        <FAssetModal
            opened={opened}
            onClose={closeModal}
            title={t('fasset_wind_down_modal.title', { fAssets: fAssets.join(', ') })}
            size={750}
            zIndex={9999}
        >
            <FAssetModal.Body>
                <Text
                    className="text-24 mb-3"
                    fw={300}
                    c="var(--flr-dark-gray)"
                >
                    {t('fasset_wind_down_modal.subtitle', { fAssets: fAssets.join(', ') })}
                </Text>
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('fasset_wind_down_modal.description_label', {
                        pools: fAssets.join(', ') ,
                        fAssets: fAssets.map(fAsset => `${fAsset}s`)
                    })}
                </Text>
                <Text
                    className="text-16 mt-2"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('fasset_wind_down_modal.minting_note_label', { fAssets: fAssets.join(', ') })}
                </Text>
                {isConnected && disabledFassets.length > 0 &&
                    <div
                        className="my-10 flex items-center flex-wrap -mx-4"
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
                <Text
                    className="text-14 mt-5"
                    fw={400}
                    c="var(--flr-dark-gray)"
                >
                    {t('fasset_wind_down_modal.note_label')}
                </Text>
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <Button
                    variant="filled"
                    color="black"
                    radius="xl"
                    size="sm"
                    fullWidth
                    className="hover:text-white font-normal"
                    onClick={closeModal}
                >
                    {t('fasset_wind_down_modal.submit_button')}
                </Button>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
