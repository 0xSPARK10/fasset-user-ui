import React from "react";
import {
    Divider,
    NumberInput,
    Text,
    Loader,
    Button
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useDebouncedCallback, useMediaQuery, useElementSize } from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import CopyIcon from "@/components/icons/CopyIcon";
import { useTranslation, Trans } from "react-i18next";
import { IPool } from "@/types";
import { useFreeCptApprove } from "@/hooks/useContracts";
import { parseUnits, formatUnit } from "@/utils";
import { useWeb3 } from "@/hooks/useWeb3";
import { useNativeBalance } from "@/api/balance";
import { COINS } from "@/config/coin";
import { formatNumber, toNumber, truncateString } from "@/utils";

interface IPayDebtForm {
    collateralPool: IPool;
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const PayDebtForm = forwardRef<FormRef, IPayDebtForm>(({ collateralPool }: IPayDebtForm, ref) => {
    const [amount, setAmount] = useState<number>();
    const [fee, setFee] = useState<number>();
    const [maxTransferableTokens, setMaxTransferableTokens] = useState<number>();
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 40rem)');

    const { mainToken } = useWeb3();
    const freeCptApprove = useFreeCptApprove();

    const transferLabelSize = useElementSize();
    const gasFeeLabelSize = useElementSize();

    const fAssetCoin = COINS.find(coin => coin.type === collateralPool.vaultType);
    const nativeBalance = useNativeBalance(mainToken?.address!, mainToken !== undefined);
    const fAssetBalance = nativeBalance?.data?.find(balance => balance.symbol === fAssetCoin?.type);

    const inputStep = ['DOGE', 'BTC'].includes(fAssetCoin?.nativeName!) ? 0.00000001 : 0.000001;
    const decimalScale = ['DOGE', 'BTC'].includes(fAssetCoin?.nativeName!) ? 8 : 6;

    const schema = yup.object().shape({
        debtAmount: yup.number()
            .required(t('validation.messages.required', { field: t('pay_debt_modal.form.amount_label') }))
            .min(inputStep)
            .max(maxTransferableTokens ? maxTransferableTokens : 0)

    });

    const labelWidth = transferLabelSize.width > gasFeeLabelSize.width ? transferLabelSize.width : gasFeeLabelSize.width;

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            debtAmount: undefined,
        },
        validate: yupResolver(schema)
    });

    form.watch('debtAmount', ({ value }) => {
        debounceSetAmount(value);
    });

    useImperativeHandle(ref, () => ({
        form: () => {
            return form;
        }
    }));

    useEffect(() => {
        if (!collateralPool || !fAssetBalance) return;
        setMaxTransferableTokens(Math.min(toNumber(collateralPool.fassetDebt), toNumber(fAssetBalance.balance)));
    }, [collateralPool, fAssetBalance]);

    const debounceSetAmount = useDebouncedCallback(async (value) => {
        if (value === amount) return;
        setAmount(value);
        getFee(value);
    }, 500);


    const getFee = async (amount: number | undefined) => {
        if (amount === undefined || !form.isValid()) {
            setFee(undefined);
            return;
        }

        const estimatedGas = await freeCptApprove.mutateAsync({
            spenderAddress: collateralPool?.tokenAddress!,
            coinName: collateralPool?.vaultType!,
            amount: parseUnits(amount, decimalScale).toString(),
            getGasFee: true
        });
        setFee(Number(formatUnit(estimatedGas, 9)));
    }

    return (
        <>
            <NumberInput
                {...form.getInputProps('debtAmount')}
                key={form.key('debtAmount')}
                size="sm"
                inputMode="numeric"
                type="tel"
                allowNegative={false}
                max={maxTransferableTokens ?? 0}
                step={inputStep}
                decimalScale={decimalScale}
                clampBehavior="strict"
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('pay_debt_modal.form.amount_label')}
                    </Text>
                }
                description={t('pay_debt_modal.form.min_balance_label', {
                    amount: collateralPool.fassetDebt,
                    fassetBalance: fAssetBalance?.balance,
                    coinName: collateralPool.vaultType,
                    mainTokenName: mainToken?.type
                })}
                inputContainer={children => (
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                        {children}
                        <Text
                            c="var(--flr-gray)"
                            className="sm:hidden ml-3"
                        >
                            {collateralPool.vaultType}
                        </Text>
                        <div className="sm:ml-8 ml-3 hidden sm:flex flex-col items-center">
                            <Trans
                                i18nKey={`pay_debt_modal.form.agent_label`}
                                values={{ agent: collateralPool.agentName }}
                                components={{
                                    bold: <strong />
                                }}
                                parent={Text}
                            />
                            <Text className="flex items-center">
                                {truncateString(collateralPool.vault, 5, 5)}
                                <CopyIcon
                                    text={collateralPool.vault}
                                    color="var(--flr-gray)"
                                />
                            </Text>
                        </div>
                    </div>
                )}
                className="mr-0 sm:mr-8"
                classNames={{
                    wrapper: 'flex-shrink-0 basis-3/5'
                }}
                rightSection={
                    <Button
                        size="sm"
                        variant="transparent"
                        color="var(--mantine-color-gray-6)"
                        fw={400}
                        className="pr-6 mr-2 mt-1 shrink-0"
                        onClick={ () => form.setFieldValue('debtAmount', maxTransferableTokens as any)}
                    >
                        {t('pay_debt_modal.form.max_button')}
                    </Button>
                }
            />
            <div className="flex items-center mt-2 sm:hidden">
                <Trans
                    i18nKey={`pay_debt_modal.form.agent_label`}
                    values={{ agent: collateralPool.agentName }}
                    components={{
                        bold: <strong />
                    }}
                    parent={Text}
                />
                <Text className="flex items-center ml-2">
                    {truncateString(collateralPool.vault, 5, 5)}
                    <CopyIcon
                        text={collateralPool.vault}
                        color="var(--mantine-color-gray-6)"
                    />
                </Text>
            </div>
            <Divider
                className="my-8"
                styles={{
                    root: {
                        marginLeft: mediaQueryMatches ? '-1rem' : '-2.75rem',
                        marginRight: mediaQueryMatches ? '-1rem' : '-2.75rem'
                    }
                }}
            />
            <Text
                fw={400}
                c="var(--flr-gray)"
                className="text-12 mb-1 uppercase"
            >
                {t('pay_debt_modal.form.you_will_send_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('pay_debt_modal.form.transfer_label')}
                </Text>
                {fAssetCoin &&
                    <div className="flex items-center">
                        {fAssetCoin.icon &&
                            fAssetCoin.icon({
                                width: "18",
                                height: "18"
                            })
                        }
                        <Text
                            className="text-16 mx-2"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {amount
                                ? formatNumber(amount, decimalScale)
                                : <span>&mdash;</span>
                            }
                        </Text>
                        <Text
                            ref={transferLabelSize.ref}
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                            style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                        >
                            {collateralPool.vaultType}
                        </Text>
                    </div>
                }
            </div>
            <Text
                fw={400}
                c="var(--flr-gray)"
                className="text-12 mb-1 mt-5 uppercase"
            >
                {t('pay_debt_modal.form.fees_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    c="var(--flr-black)"
                    fw={400}
                >
                    {t('pay_debt_modal.form.fee_label')}
                </Text>
                <div className="flex">
                    {mainToken?.icon && mainToken.icon({ width: '18', height: '18' })}
                    <Text
                        size="sm"
                        className="mx-2"
                    >
                        {freeCptApprove.isPending
                            ? <Loader size={14} />
                            : fee
                                ? formatNumber(fee, decimalScale)
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        ref={gasFeeLabelSize.ref}
                        className="text-16"
                        c="var(--flr-gray)"
                        style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                    >
                        {mainToken?.type}
                    </Text>
                </div>
            </div>
        </>
    );
});

PayDebtForm.displayName = 'PayDebtForm';
export default PayDebtForm;
