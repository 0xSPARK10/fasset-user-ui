import {
    Divider,
    NumberInput,
    Text,
    Loader,
    Button,
    lighten
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import React, { Dispatch, forwardRef, SetStateAction, useEffect, useImperativeHandle, useState } from "react";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import { formatNumber, toNumber, truncateString } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import * as yup from "yup";
import { useTranslation, Trans } from "react-i18next";
import { IPool } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { useEnterCollateralPool } from "@/hooks/useContracts";
import { parseUnits, formatUnit } from "@/utils";
import { useNativeBalance } from "@/api/balance";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolAbi } from "@/abi";
import { showErrorNotification } from "@/hooks/useNotifications";

interface IDepositToPoolForm {
    collateralPool: IPool;
    isFormDisabled: boolean;
    setIsFormDisabled: Dispatch<SetStateAction<boolean>>;
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const DepositToPoolForm = forwardRef<FormRef, IDepositToPoolForm>(({ collateralPool, setIsFormDisabled }: IDepositToPoolForm, ref) => {
    const [amount, setAmount] = useState<number>();
    const [fee, setFee] = useState<number>();
    const [maxDeposit, setMaxDeposit] = useState<number>();
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 40em)');

    const { mainToken } = useWeb3();
    const enterCollateralPool = useEnterCollateralPool();
    const nativeBalances = useNativeBalance(mainToken?.address!, mainToken !== undefined);

    const schema = yup.object().shape({
        amount: yup.number()
            .required(t('validation.messages.required', { field: t('deposit_to_pool_modal.form.amount_label') }))
            .min(1)
    });

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            amount: undefined
        },
        validate: yupResolver(schema)
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
        if (!nativeBalances.data) return;

        const nativeBalance = nativeBalances?.data?.find(nativeBalance => 'wrapped' in nativeBalance);
        if (nativeBalance) {
            const max = Math.floor(toNumber(nativeBalance.balance)) - 2;
            setMaxDeposit(max > 0 ? max : 0);
        }
    }, [nativeBalances.data]);
    useEffect(() => {
        if (!enterCollateralPool.isPending) {
            setIsFormDisabled(false);
        }
        else {
            setIsFormDisabled(true);
        }
    }, [enterCollateralPool.isPending]);

    const debounceSetAmount = useDebouncedCallback(async (value) => {
        if (value === amount) return;

        setAmount(value);
        if (!value || value === amount) return;
        try {
            const estimatedGas = await enterCollateralPool.mutateAsync({
            userAddress: mainToken?.address!,
                poolAddress: collateralPool?.pool!,
                value: parseUnits(value, 18).toString(),
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
                min={1}
                size="sm"
                inputMode="numeric"
                type="tel"
                allowNegative={false}
                decimalScale={2}
                max={maxDeposit ?? 0}
                disabled={nativeBalances.isPending}
                clampBehavior="strict"
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('deposit_to_pool_modal.form.amount_label')}
                    </Text>
                }
                description={t('deposit_to_pool_modal.form.min_balance_label', {
                    max: formatNumber(maxDeposit ?? 0),
                    tokenName: mainToken?.type
                })}
                className="mr-0 sm:mr-8"
                classNames={{
                    wrapper: 'flex-shrink-0 basis-full sm:basis-3/5',
                    section: 'w-auto'
                }}
                inputContainer={children => (
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                        {children}
                        <div className="sm:ml-8 ml-3 hidden sm:flex flex-col items-center">
                            <Trans
                                i18nKey={`deposit_to_pool_modal.form.agent_label`}
                                values={{ agent: collateralPool.agentName }}
                                components={{
                                    bold: <strong />
                                }}
                                parent={Text}
                            />
                            <Text className="flex items-center">
                                {truncateString(collateralPool.pool, 5, 5)}
                                <CopyIcon
                                    text={collateralPool.pool}
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
                        onClick={() => form.setFieldValue('amount', maxDeposit)}
                    >
                        {t('claim_rewards_from_pool_modal.form.max_button')}
                    </Button>
                }
            />
            <div className="flex items-center mt-2 sm:hidden">
                <Trans
                    i18nKey={`deposit_to_pool_modal.form.agent_label`}
                    values={{ agent: collateralPool.agentName }}
                    components={{
                        bold: <strong />
                    }}
                    parent={Text}
                />
                <Text className="flex items-center ml-2">
                    {truncateString(collateralPool.pool, 5, 5)}
                    <CopyIcon
                        text={collateralPool.pool}
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
                {t('deposit_to_pool_modal.form.you_will_deposit_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('deposit_to_pool_modal.form.transfer_label')}
                </Text>
                <div className="flex items-center">
                    {mainToken?.icon && mainToken.icon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {amount
                            ? formatNumber(amount, 2)
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
            <Text
                fw={400}
                c="var(--flr-gray)"
                className="text-12 mb-1 mt-5 uppercase"
            >
                {t('deposit_to_pool_modal.form.fees_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('deposit_to_pool_modal.form.fee_label')}
                </Text>
                <div className="flex items-center">
                    {mainToken?.icon && mainToken.icon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {enterCollateralPool.isPending
                            ? <Loader size={14} />
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

DepositToPoolForm.displayName = 'DepositToPoolForm';
export default DepositToPoolForm;
