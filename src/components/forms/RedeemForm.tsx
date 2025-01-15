import {
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect
} from "react";
import {
    UseFormReturnType,
    useForm
} from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { useDebouncedCallback, useElementSize, useMediaQuery } from "@mantine/hooks";
import { NumberInput, Text, Divider } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useRedemptionFee} from "@/api/redemption";
import { useNativeBalance } from "@/api/balance";
import { useExecutor } from "@/api/user";
import { toNumber, fromLots, toLots, formatNumber } from "@/utils";
import { ICoin, IFAssetCoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import classes from "@/styles/components/forms/RedeemForm.module.scss";

interface IMintForm {
    fAssetCoin: IFAssetCoin;
    flareCoin: ICoin;
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const RedeemForm = forwardRef<FormRef, IMintForm>(({ fAssetCoin, flareCoin }: IMintForm, ref) => {
    const [lots, setLots] = useState<number>();
    const [maxLots, setMaxLots] = useState<number>();
    const [redeemingFee, setRedeemingFee] = useState<number>();
    const [deposit, setDeposit] = useState<number>();
    const [inputDescription, setInputDescription] = useState<string>();

    const { mainToken } = useWeb3();
    const { t } = useTranslation();
    const depositLabelSize = useElementSize();
    const redeemingFeeLabelSize = useElementSize();
    const executorFeeLabelSize = useElementSize();
    const mediaQueryMatches = useMediaQuery('(max-width: 40em)');
    const redemptionFee = useRedemptionFee(fAssetCoin.type);
    const executor = useExecutor(fAssetCoin.type);
    const nativeBalance = useNativeBalance(flareCoin.address!);
    const schema = yup.object().shape({
        lots: yup.number()
            .required(t('validation.messages.required', { field: t('redeem_modal.form.lots_label') }))
            .min(1)
    });
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            lots: undefined,
            executorAddress: '',
            executorFee: '',
            redemptionFee: ''
        },
        validate: yupResolver(schema)
    });
    form.watch('lots', ({ value }) => {
        debounceSetLots(value);
    });

    const labelWidth = Math.max(depositLabelSize.width, redeemingFeeLabelSize.width, executorFeeLabelSize.width);

    useImperativeHandle(ref, () => ({
        form: () => {
            return form;
        }
    }));

    useEffect(() => {
        if (!nativeBalance.data) return;
        const balance = nativeBalance.data.find(balance => balance.symbol.toLowerCase() === fAssetCoin.type.toLowerCase());
        if (balance) {
            const max = toLots(toNumber(balance.balance), fAssetCoin.lotSize) as number;
            setInputDescription(t('redeem_modal.form.lots_limit_label', { lots: max }));
            setMaxLots(max);
        }

    }, [nativeBalance.data]);

    useEffect(() => {
        if (!executor.data) return;

        form.setValues({
            executorAddress: executor?.data?.executorAddress,
            executorFee: executor?.data?.executorFee,
            redemptionFee: executor?.data?.redemptionFee,
        })
    }, [executor.data]);

    const debounceSetLots = useDebouncedCallback(async (value) => {
        setLots(value);
        const redeemingFee = fromLots(value, fAssetCoin.lotSize) as number * ((redemptionFee?.data?.redemptionFee ?? 0) / 10000);
        setRedeemingFee(redeemingFee);
        setDeposit(fromLots(value, fAssetCoin.lotSize) as number - redeemingFee);
    }, 500);

    return (
        <>
            <NumberInput
                {...form.getInputProps('lots')}
                key={form.key('lots')}
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('redeem_modal.form.lots_label')}
                    </Text>
                }
                description={inputDescription}
                inputWrapperOrder={['label', 'input', 'error', 'description']}
                size="sm"
                inputMode="numeric"
                type="tel"
                step={1}
                min={maxLots !== undefined && maxLots > 0 ? 1 : 0}
                max={maxLots}
                allowDecimal={false}
                clampBehavior="strict"
                className="mr-0 sm:mr-8 mt-3"
                classNames={{
                    label: 'uppercase',
                    input: classes.lotsInput,
                    wrapper: 'flex-shrink-0 basis-full sm:basis-2/5'
                }}
                styles={{
                    input: {
                        color: 'var(--flr-gray)'
                    },
                    label: {
                        color: 'var(--flr-gray)'
                    },
                    description: {
                        whiteSpace: 'pre-line'
                    }
                }}
                inputContainer={children => (
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                        {children}
                        <div className="sm:ml-8 hidden sm:flex items-center ml-3">
                            {fAssetCoin.icon({ width: "24", height: "24" })}
                            <Text
                                fw={500}
                                className="text-18 mx-2"
                            >
                                {fromLots(lots, fAssetCoin.lotSize, fAssetCoin.decimals, true)}
                            </Text>
                            <Text
                                c="var(--flr-gray)"
                                fw={400}
                                className="text-18"
                            >
                                {fAssetCoin.type}
                            </Text>
                        </div>
                    </div>
                )}
            />
            <div className="flex items-center mt-2 sm:hidden">
                {fAssetCoin.icon({ width: "24", height: "24" })}
                <Text
                    fw={500}
                    className="text-18 mx-2"
                >
                    {fromLots(lots, fAssetCoin.lotSize, fAssetCoin.decimals,  true)}
                </Text>
                <Text
                    c="var(--flr-gray)"
                    fw={400}
                    className="text-18"
                >
                    {fAssetCoin.type}
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
            <div className="mt-2">
                <Text
                    fw={400}
                    c="var(--flr-gray)"
                    className="mb-1 text-12 uppercase"
                >
                    {t('redeem_modal.form.you_will_receive_label')}
                </Text>
                <div className="flex justify-between">
                    <Text
                        className="text-16"
                        fw={400}
                    >
                        {t('redeem_modal.form.deposit_label')}
                    </Text>
                    <div className="flex items-center">
                        {fAssetCoin.nativeIcon && fAssetCoin.nativeIcon({ width: "16", height: "16" })}
                        <Text
                            className="mx-2 text-16"
                            fw={400}
                        >
                            {deposit
                                ? formatNumber(deposit, fAssetCoin.type.toLowerCase().includes('btc') ? 8 : 2)
                                : <span>&mdash;</span>
                            }
                        </Text>
                        <Text
                            ref={depositLabelSize.ref}
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                            style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                        >
                            {fAssetCoin.nativeName}
                        </Text>
                    </div>
                </div>
                <Text
                    fw={400}
                    c="var(--flr-gray)"
                    className="mb-1 mt-5 uppercase text-12"
                >
                    {t('redeem_modal.form.fees_label')}
                </Text>
                <div className="flex justify-between">
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('redeem_modal.form.redeeming_fee_label')}
                    </Text>
                    <div className="flex items-center">
                        {fAssetCoin.nativeIcon && fAssetCoin.nativeIcon({ width: "16", height: "16" })}
                        <Text
                            className="mx-2 text-16"
                            fw={400}
                        >
                            {redeemingFee
                                ? formatNumber(redeemingFee, fAssetCoin.decimals)
                                : <span>&mdash;</span>
                            }
                        </Text>
                        <Text
                            ref={redeemingFeeLabelSize.ref}
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                            style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                        >
                            {fAssetCoin.nativeName}
                        </Text>
                    </div>
                </div>
                <div className="flex justify-between mt-2">
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('redeem_modal.form.executor_fee_label')}
                    </Text>
                    <div className="flex items-center">
                        {mainToken?.icon !== undefined && mainToken?.icon({ width: "16", height: "16" })}
                        <Text
                            className="mx-2 text-16"
                            fw={400}
                        >
                            {lots && executor.data
                                ? (Number(executor?.data?.executorFee) / 1000000000000000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : <span>&mdash;</span>
                            }
                        </Text>
                        <Text
                            ref={executorFeeLabelSize.ref}
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                            style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                        >
                            {mainToken?.type}
                        </Text>
                    </div>
                </div>
            </div>
        </>
    );
});

RedeemForm.displayName = 'RedeemForm';
export default RedeemForm;
