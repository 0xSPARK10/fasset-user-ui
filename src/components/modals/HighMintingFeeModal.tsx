import { useState } from "react";
import { Button, Checkbox, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import { IFAssetCoin } from "@/types";
import { formatNumber } from "@/utils";

interface IHighMintingFeeModal {
    opened: boolean;
    onClose: (proceed: boolean) => void;
    fAssetCoin: IFAssetCoin;
    mintingFee: number;
}

export default function HighMintingFeeModal({ opened, onClose, fAssetCoin, mintingFee }: IHighMintingFeeModal) {
    const [isProceedWithMintingChecked, setIsProceedWithMintingChecked] = useState<boolean>(false);
    const { t } = useTranslation();

    const closeModal = (proceed: boolean) => {
        setIsProceedWithMintingChecked(false);
        onClose(proceed);
    }

    return (
        <FAssetModal
            opened={opened}
            onClose={() => closeModal(false)}
            title={t('high_minting_fee_modal.title')}
            size={600}
            centered
        >
            <FAssetModal.Body>
                <Text
                    className="text-24 mb-5"
                    fw={300}
                    c="var(--flr-black)"
                >
                    {t('high_minting_fee_modal.description_label')}
                </Text>
                <Checkbox
                    checked={isProceedWithMintingChecked}
                    onChange={event => { setIsProceedWithMintingChecked(event.currentTarget.checked); }}
                    variant="outline"
                    label={t('high_minting_fee_modal.understand_label', {
                        tokenName: fAssetCoin?.nativeName,
                        fee: formatNumber(mintingFee, fAssetCoin.decimals)
                    })}
                />
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <div className="flex flex-col md:flex-row justify-between">
                    <Button
                        variant="outline"
                        color="var(--flr-black)"
                        radius="xl"
                        className="w-full font-normal mb-3 md:mb-0 md:mr-3"
                        onClick={() => closeModal(false)}
                    >
                        {t('high_minting_fee_modal.cancel_button')}
                    </Button>
                    <Button
                        radius="xl"
                        className="w-full font-normal"
                        color="var(--flr-black)"
                        disabled={!isProceedWithMintingChecked}
                        onClick={() => closeModal(true)}
                    >
                        {t('high_minting_fee_modal.confirm_button')}
                    </Button>
                </div>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
