import {
    Title,
    Button,
    Text,
    rem,
    Divider
} from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import { IFAssetCoin, IRedemptionDefaultStatus } from "@/types";
import { fromLots, toNumber } from "@/utils";
import { COINS } from "@/config/coin";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance, useUnderlyingBalance } from "@/api/balance";

interface IRedeemFinishedModal {
    opened: boolean;
    onClose: () => void;
    fAssetCoin: IFAssetCoin;
    redemptionDefaultResponse?: IRedemptionDefaultStatus|undefined;
    totalLots: number;
    redeemedLots: number;
}

export default function RedeemFinishedModal({
    opened,
    onClose,
    fAssetCoin,
    redemptionDefaultResponse,
    redeemedLots,
    totalLots
}: IRedeemFinishedModal) {
    const { t } = useTranslation();
    const { mainToken } = useWeb3();

    const nativeBalances = useNativeBalance(mainToken?.address ?? '', opened);
    const underlyingBalance = useUnderlyingBalance(fAssetCoin.address!, fAssetCoin.type, opened);

    const isPartialRedeem = redeemedLots !== totalLots;
    let vaultCollateralsPaid: any[] = [];
    if (opened && redemptionDefaultResponse?.status && redemptionDefaultResponse?.vaultCollateralPaid) {
        vaultCollateralsPaid = redemptionDefaultResponse.vaultCollateralPaid.map(vaultCollateral => {
            const collateralCoin = COINS.find(coin => coin.type.toLowerCase() === vaultCollateral.token.toLowerCase());
            return {
                ...vaultCollateral,
                icon: collateralCoin?.icon && collateralCoin.icon({ width: "18", height: "18" })
            }
        });

        let labelWidth = 0;
        const labels = Array.from(document.getElementsByClassName('fa-token-type'));
        for (const label of labels) {
            const width = label.getBoundingClientRect().width;
            if (width > labelWidth) {
                labelWidth = width;
            }
        }

        for (const label of labels) {
            (label as HTMLElement).style.width = `${labelWidth}px`;
        }
    }

    return (
        <FAssetModal
            opened={opened}
            onClose={onClose}
            size={500}
            zIndex={3000}
            centered
            title={t('redeem_modal.title', { coinName: fAssetCoin?.type })}
        >
            <FAssetModal.Body>
                <Title
                    className="text-24"
                    fw={300}
                    c="var(--flr-black)"
                >
                    {isPartialRedeem
                        ? t('redeem_finished_modal.title_partial_redemption')
                        : t('redeem_finished_modal.title')
                    }
                </Title>
                <div className="flex items-center mt-5">
                    <IconCircleCheck
                        color="var(--flr-black)"
                        className="mr-3 flex-shrink-0"
                        style={{width: rem(40), height: rem(40)}}
                    />
                    <div>
                        <Text
                            className="text-16"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {t('redeem_finished_modal.description_label')}
                        </Text>
                        {isPartialRedeem &&
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {t('redeem_finished_modal.partial_redemption_label', {
                                    coinName: fAssetCoin?.type!,
                                    totalAmount: fromLots(totalLots, fAssetCoin.lotSize, fAssetCoin.decimals, true),
                                    redeemedAmount: fromLots(redeemedLots, fAssetCoin.lotSize, fAssetCoin.decimals, true)
                                })}
                            </Text>
                        }
                    </div>
                </div>
                {redemptionDefaultResponse?.status &&
                    <>
                        <Divider
                            className="my-8"
                            styles={{
                                root: {
                                    marginLeft: '-2.7rem',
                                    marginRight: '-2.7rem'
                                }
                            }}
                        />
                        <Text
                            fw={400}
                            c="var(--flr-gray)"
                            className="mb-1 mt-5 uppercase text-12"
                        >
                            {t('redeem_finished_modal.redemption_label')}
                        </Text>
                        <div className="flex justify-between items-center mb-2">
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {t('redeem_finished_modal.amount_label')}
                            </Text>
                            <div className="flex items-center">
                                {fAssetCoin.icon({ width: "18", height: "18" })}
                                <Text
                                    fw={400}
                                    c="var(--flr-black)"
                                    className="text-16 mx-2"
                                >
                                    {fromLots(redeemedLots, fAssetCoin.lotSize, fAssetCoin.decimals, true)}
                                </Text>
                                <Text
                                    c="var(--flr-gray)"
                                    fw={400}
                                    className="text-16 fa-token-type"
                                >
                                    {fAssetCoin.type}
                                </Text>
                            </div>
                        </div>
                        <Text
                            fw={400}
                            c="var(--flr-gray)"
                            className="text-12 mb-1 mt-4 uppercase"
                        >
                            {t('redeem_finished_modal.deposit_label')}
                        </Text>
                        <div className="flex justify-between items-center mb-2">
                            <Text
                                className="text-16"
                                fw={400}
                                c="var(--flr-black)"
                            >
                                {t('redeem_finished_modal.deposit_from_underlying_chain_label')}
                            </Text>
                            <div className="flex items-center">
                                {fAssetCoin?.nativeIcon && fAssetCoin.nativeIcon({ width: "18", height: "18" })}
                                <Text
                                    fw={400}
                                    c="var(--flr-black)"
                                    className="text-16 mx-2"
                                >
                                    {redemptionDefaultResponse?.underlyingPaid}
                                </Text>
                                <Text
                                    c="var(--flr-gray)"
                                    fw={400}
                                    className="text-16 fa-token-type"
                                >
                                    {fAssetCoin.nativeName}
                                </Text>
                            </div>
                        </div>
                        {vaultCollateralsPaid.map((vaultCollateral, index) => (
                            <div
                                key={vaultCollateral.token}
                                className={`flex ${index === 0 ? 'justify-between' : 'justify-end'} mb-1`}
                            >
                                <Text
                                    fw={400}
                                    className={index !== 0 ? 'hidden w-100 text-16' : 'text-16'}
                                    c="var(--flr-black)"
                                >
                                    {t('redeem_finished_modal.deposit_from_vault_collateral_label')}
                                </Text>
                                <div className="flex items-center mb-1">
                                    {vaultCollateral.icon}
                                    <Text
                                        fw={400}
                                        className="text-16 mx-2"
                                        c="var(--flr-black)"
                                    >
                                        {vaultCollateral.value}
                                    </Text>
                                    <Text
                                        c="var(--flr-gray)"
                                        fw={400}
                                        className="text-16 fa-token-type"
                                    >
                                        {vaultCollateral.token}
                                    </Text>
                                </div>
                            </div>
                        ))}
                        {redemptionDefaultResponse?.poolCollateralPaid && toNumber(redemptionDefaultResponse?.poolCollateralPaid) > 0 &&
                            <div className="flex justify-between items-center">
                                <Text
                                    className="text-16"
                                    fw={400}
                                    c="var(--flr-black)"
                                >
                                    {t('redeem_finished_modal.deposit_from_pool_collateral_label')}
                                </Text>
                                <div className="flex items-center">
                                    {mainToken?.icon && mainToken.icon({ width: '18', height: '18', className: 'flex-shrink-0' })}
                                    <Text
                                        className="text-16 mx-2"
                                        fw={400}
                                        c="var(--flr-black)"
                                    >
                                        {redemptionDefaultResponse?.poolCollateralPaid}
                                    </Text>
                                    <Text
                                        c="var(--flr-gray)"
                                        fw={400}
                                        className="text-16 fa-token-type"
                                    >
                                        {redemptionDefaultResponse?.vaultCollateral}
                                    </Text>
                                </div>
                            </div>
                        }
                    </>
                }
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <Button
                    onClick={onClose}
                    variant="filled"
                    color="black"
                    radius="xl"
                    size="sm"
                    fullWidth
                    className="hover:text-white font-normal mb-5"
                >
                    {t('redeem_finished_modal.return_to_home_button')}
                </Button>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
