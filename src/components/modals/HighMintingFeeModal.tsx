import React, { useEffect, useState } from "react";
import { Button, Checkbox, Text, TextInput } from "@mantine/core";
import { useTranslation, Trans } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import { useFassetPrice } from "@/api/user";
import { IFAssetCoin } from "@/types";
import { formatNumber, fromLots } from "@/utils";

interface IHighMintingFeeModal {
    opened: boolean;
    onClose: (proceed: boolean) => void;
    fAssetCoin: IFAssetCoin;
    mintingFee: number;
    lots: number | undefined;
}

export default function HighMintingFeeModal({ opened, onClose, fAssetCoin, mintingFee, lots }: IHighMintingFeeModal) {
    const [text, setText] = useState<string>();
    const [isProceedWithMintingChecked, setIsProceedWithMintingChecked] = useState<boolean>(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
    const { t } = useTranslation();
    const fassetPrice = useFassetPrice(fAssetCoin.type, opened);

    const transfer = (lots ? fromLots(lots, fAssetCoin.lotSize) : 0) as number;
    const percentage = transfer ? (mintingFee / transfer) * 100 : 0
    const isMintingFeeAbove50 = percentage >= 50;
    const mintingFeeUsd = fassetPrice.data ? fassetPrice.data.price * mintingFee : 0;

    useEffect(() => {
        if (isMintingFeeAbove50) {
            setIsButtonDisabled(text?.toLowerCase() !== 'i understand' || !isProceedWithMintingChecked);
        } else {
            setIsButtonDisabled(!isProceedWithMintingChecked);
        }
    }, [text, isProceedWithMintingChecked, isMintingFeeAbove50]);

    useEffect(() => {
        setText('');
    }, [opened]);

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
                {isMintingFeeAbove50 &&
                    <TextInput
                        value={text}
                        onChange={(event) => setText(event.currentTarget.value)}
                        label={<Trans
                            i18nKey="high_minting_fee_modal.type_understand_label"
                            components={{
                                span: <span className="text-[var(--flr-red)]"/>
                            }}
                            parent={Text}
                            className="text-12"
                            fw={400}
                        />}
                        className="mb-5 md:max-w-56"
                    />
                }
                <Checkbox
                    checked={isProceedWithMintingChecked}
                    onChange={event => { setIsProceedWithMintingChecked(event.currentTarget.checked); }}
                    variant="outline"
                    label={<Trans
                        i18nKey="high_minting_fee_modal.understand_label"
                        components={{
                            span: <span className={`${isMintingFeeAbove50 ? 'text-[var(--flr-red)]' : ''}`}/>
                        }}
                        values={{
                            tokenName: fAssetCoin?.nativeName,
                            fee: formatNumber(mintingFee, fAssetCoin.decimals),
                            feeUsd: formatNumber(mintingFeeUsd, 2),
                            percentage: percentage
                        }}
                        parent={Text}
                        className="text-16"
                        fw={400}
                    />}
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
                        color={isMintingFeeAbove50 ? 'var(--flr-red)' : 'var(--flr-black)'}
                        disabled={isButtonDisabled}
                        onClick={() => closeModal(true)}
                        classNames={{
                            root: isMintingFeeAbove50 && isButtonDisabled
                                ? 'bg-[#F5ECEF] text-[var(--flr-red)] hover:!text-[var(--flr-red)]'
                                : ''
                        }}
                    >
                        {t('high_minting_fee_modal.confirm_button')}
                    </Button>
                </div>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
