import {
    Divider,
    NumberInput,
    Text,
    Loader,
    Button,
    lighten
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState
} from "react";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import {formatNumber, formatUnit, parseUnits, truncateString} from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import * as yup from "yup";
import { useTranslation, Trans } from "react-i18next";
import { IPool } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMaxCptWithdraw, useMaxWithdraw } from "@/api/pool";
import { AxiosError } from "axios";
import { showErrorNotification } from "@/hooks/useNotifications";
import { toNumber } from "@/utils";
import { useExitCollateralPool } from "@/hooks/useContracts";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolAbi } from "@/abi";
import { COINS } from "@/config/coin";

interface IWithdrawalFromPoolForm {
    collateralPool: IPool;
    isFormDisabled?: (status: boolean) => void;
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const WithdrawalFromPoolForm = forwardRef<FormRef, IWithdrawalFromPoolForm>(({ collateralPool, isFormDisabled }: IWithdrawalFromPoolForm, ref)  => {
    const [amount, setAmount] = useState<number>();
    const [maxWithdrawal, setMaxWithdrawal] = useState<number>();
    const [fee, setFee] = useState<number>();
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 40em)');
    const { mainToken } = useWeb3();
    const maxWithdraw = useMaxWithdraw(collateralPool?.vaultType!, collateralPool?.pool!, mainToken?.address!, amount!, false);
    const maxCptWithdraw = useMaxCptWithdraw(collateralPool?.vaultType!, collateralPool?.pool!);
    const exitCollateralPool = useExitCollateralPool();

    const collateralToken = COINS.find(coin => coin.type === collateralPool?.vaultType)

    const schema = yup.object().shape({
        amount: yup.number()
            .required(t('validation.messages.required', { field: t('withdrawal_from_pool_modal.form.amount_label') }))
            .min(maxWithdrawal !== undefined && maxWithdrawal < 1 ? maxWithdrawal : 1)
    });

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            amount: undefined,
            natReturn: ''
        },
        validate: yupResolver(schema),
        onValuesChange: (values: any) => {
            if (values?.amount?.length === 0) {
                form.setFieldValue('amount', undefined);
            }
        }
    });

    form.watch('amount', ({ value }) => {
        debounceSetAmount(value);
    });

    useImperativeHandle(ref, () => ({
        form: () => {
            return form;
        }
    }));

    useEffect(() => {
        if (!collateralPool || !maxCptWithdraw.data) return;
        setMaxWithdrawal(Math.min(toNumber(maxCptWithdraw.data.maxWithdraw), toNumber(collateralPool.nonTimeLocked!)));
    }, [collateralPool, maxCptWithdraw]);

    useEffect(() => {
        if (!amount) return;

        const fetch = async() => {
            if (isFormDisabled) {
                isFormDisabled(true);
            }

            const response = await maxWithdraw.refetch();
            if (response.isError) {
                const error = response.error as AxiosError;

                if (error?.response?.status === 400) {
                    if (isFormDisabled) {
                        isFormDisabled(true);
                    }
                    //@ts-ignore
                    form.setFieldError('amount', error?.response?.data?.message);
                } else {
                    //@ts-ignore
                    showErrorNotification(error?.response?.data?.message);
                }

                return;
            }
            if (response?.data?.natReturn) {
                form.setFieldValue('natReturn', response.data.natReturn);
            }

            if (isFormDisabled) {
                isFormDisabled(false);
            }
        }

        fetch();
    }, [amount]);

    const debounceSetAmount = useDebouncedCallback(async (value) => {
        if (value === amount || value.length === 0) return;

        setAmount(value);
        try {
            const estimatedGas = await exitCollateralPool.mutateAsync({
                userAddress: mainToken?.address!,
                poolAddress: collateralPool?.pool!,
                tokenShare: parseUnits(value, 18).toString(),
                exitType: 0,
                getGasFee: true
            });

            setFee(Number(formatUnit(estimatedGas, 9)));
        } catch (error) {
            const errorDecoder = ErrorDecoder.create([CollateralPoolAbi]);
            const decodedError = await errorDecoder.decode(error);
            showErrorNotification(decodedError.reason as string);
        }
    }, 500);

    return (
        <>
            <NumberInput
                {...form.getInputProps('amount')}
                key={form.key('amount')}
                min={maxWithdrawal ? (maxWithdrawal < 1 ? maxWithdrawal : 1) : 0}
                size="sm"
                inputMode="numeric"
                type="tel"
                allowNegative={false}
                decimalScale={3}
                max={maxWithdrawal ?? 0}
                clampBehavior="strict"
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('withdrawal_from_pool_modal.form.amount_label')}
                    </Text>
                }
                description={t('withdrawal_from_pool_modal.form.min_balance_label', {
                    amount: maxWithdrawal,
                    tokenName: mainToken?.type
                })}
                classNames={{
                    wrapper: 'flex-shrink-0 basis-full sm:basis-3/5',
                    section: 'w-auto'
                }}
                inputContainer={children => (
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                        {children}
                        <div className="sm:ml-8 ml-3 hidden sm:flex flex-col items-center">
                            <Trans
                                i18nKey={`withdrawal_from_pool_modal.form.agent_label`}
                                values={{agent: collateralPool.agentName}}
                                components={{
                                    bold: <strong/>
                                }}
                                parent={Text}
                            />
                            <Text className="flex items-center">
                                {truncateString(collateralPool.vault, 5, 5)}
                                <CopyIcon
                                    text={collateralPool.vault}
                                    color={lighten('var(--flr-black)', 0.8)}
                                />
                            </Text>
                        </div>
                    </div>
                )}
                rightSection={
                    <Button
                        variant="transparent"
                        size="sm"
                        color="var(--flr-gray)"
                        fw={400}
                        className="pr-2 mt-1"
                        //@ts-ignore
                        onClick={() => form.setFieldValue('amount', maxWithdrawal)}
                    >
                        {t('claim_rewards_from_pool_modal.form.max_button')}
                    </Button>
                }
            />
            <div className="flex items-center mt-2 sm:hidden">
                <Trans
                    i18nKey={`withdrawal_from_pool_modal.form.agent_label`}
                    values={{agent: collateralPool.agentName}}
                    components={{
                        bold: <strong/>
                    }}
                    parent={Text}
                />
                <Text className="flex items-center ml-2">
                    {truncateString(collateralPool.vault, 5, 5)}
                    <CopyIcon
                        text={collateralPool.vault}
                        color={lighten('var(--flr-black)', 0.8)}
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
                {t('withdrawal_from_pool_modal.form.you_will_receive_label')}
            </Text>
            <div className="flex justify-between mt-2">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('withdrawal_from_pool_modal.form.native_tokens_label')}
                </Text>
                <div className="flex items-center">
                    {mainToken?.icon && mainToken.icon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {amount && maxWithdraw.isPending
                            ? <Loader size={14}/>
                            : maxWithdraw?.data?.natReturn
                                ? maxWithdraw.data.natReturn
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        c="var(--flr-gray)"
                        fw={400}
                        className="text-16 w-12"
                    >
                        {mainToken?.type}
                    </Text>
                </div>
            </div>
            <div className="flex justify-between mt-2">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('withdrawal_from_pool_modal.form.rewards_label')}
                </Text>
                <div className="flex items-center">
                    {collateralToken && collateralToken.icon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {amount && maxWithdraw.isPending
                            ? <Loader size={14}/>
                            : maxWithdraw?.data?.fees
                                ? maxWithdraw.data.fees
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        c="var(--flr-gray)"
                        fw={400}
                        className="text-16 w-12"
                    >
                        {collateralPool.vaultType}
                    </Text>
                </div>
            </div>
            <Text
                fw={400}
                c="var(--flr-gray)"
                className="text-12 mb-1 mt-5 uppercase"
            >
                {t('withdrawal_from_pool_modal.form.fees_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('withdrawal_from_pool_modal.form.fee_label')}
                </Text>
                <div className="flex items-center">
                    {mainToken?.icon && mainToken.icon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {exitCollateralPool.isPending
                            ? <Loader size={14}/>
                            : amount && fee
                                ? formatNumber(fee, 4)
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        c="var(--flr-gray)"
                        fw={400}
                        className="text-16 w-12"
                    >
                        {mainToken?.type}
                    </Text>
                </div>
            </div>
        </>
    );
});

WithdrawalFromPoolForm.displayName = 'WithdrawalFromPoolForm';
export default WithdrawalFromPoolForm;
