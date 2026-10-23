import {
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
import { useDebouncedCallback } from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import { formatUnit, parseUnits, truncateString, ALLOWED_DECIMAL_SEPARATORS } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import * as yup from "yup";
import { useTranslation, Trans } from "react-i18next";
import { IPool } from "@/types";
import FeeBreakdown from "@/components/elements/FeeBreakdown";
import { useNativeFee } from "@/hooks/fees/useNativeFee";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMaxCptWithdraw, useMaxWithdraw } from "@/api/pool";
import { AxiosError } from "axios";
import { showErrorNotification } from "@/hooks/useNotifications";
import { toNumber } from "@/utils";
import { useExitCollateralPool } from "@/hooks/useContracts";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolAbi } from "@/abi";
import ModalDivider from "../elements/ModalDivider";

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
    const { mainToken } = useWeb3();
    const maxWithdraw = useMaxWithdraw(collateralPool?.vaultType!, collateralPool?.pool!, mainToken?.address!, amount!, false);
    const maxCptWithdraw = useMaxCptWithdraw(collateralPool?.vaultType!, collateralPool?.pool!);
    const exitCollateralPool = useExitCollateralPool();

    const schema = yup.object().shape({
        amount: yup.number()
            .transform((value) => (Number.isNaN(value) ? undefined : value))
            .required(t('validation.messages.required', { field: t('withdrawal_from_pool_modal.form.amount_label') }))
            .min(maxWithdrawal !== undefined && maxWithdrawal < 1 ? maxWithdrawal : 1)
    });

    const form = useForm({
        mode: 'controlled',
        initialValues: {
            amount: undefined,
            natReturn: '',
            isMaxAmount: false
        },
        validate: yupResolver(schema)
    });

    form.watch('amount', ({ value }) => {
        const isEmpty = value === undefined || value === '' || Number.isNaN(Number(value));
        if (isEmpty && isFormDisabled) isFormDisabled(true);
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
        if (!amount) {
            if (isFormDisabled) isFormDisabled(true);
            return;
        }

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
                    if (isFormDisabled) {
                        isFormDisabled(true);
                    }
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
        if (value === undefined || value === '' || Number.isNaN(Number(value))) {
            setAmount(undefined);
            if (isFormDisabled) isFormDisabled(true);
            return;
        }
        if (value === amount) {
            if (isFormDisabled) isFormDisabled(false);
            return;
        }

        setAmount(value);
        try {
            const estimatedGas = await exitCollateralPool.mutateAsync({
                userAddress: mainToken?.address!,
                poolAddress: collateralPool?.pool!,
                tokenShare: value === maxWithdrawal ? collateralPool.userPoolTokensFull! : parseUnits(value, 18).toString(),
                getGasFee: true
            });

            setFee(Number(formatUnit(estimatedGas, 9)));
            form.setFieldValue('isMaxAmount', value === maxWithdrawal);
        } catch (error) {
            const errorDecoder = ErrorDecoder.create([CollateralPoolAbi]);
            const decodedError = await errorDecoder.decode(error);
            showErrorNotification(decodedError.reason as string);
            if (isFormDisabled) isFormDisabled(true);
        }
    }, 500);

    const feeItems = useNativeFee({
        labelKey: 'withdrawal_from_pool_modal.form.fee_label',
        mainToken,
        fee,
        amount,
        requireAmount: true,
        isLoading: exitCollateralPool.isPending,
    });

    return (
        <>
	            <NumberInput
	                {...form.getInputProps('amount')}
	                min={maxWithdrawal ? (maxWithdrawal < 1 ? maxWithdrawal : 1) : 0}
                size="sm"
                inputMode="decimal"
                allowNegative={false}
                decimalScale={3}
                allowedDecimalSeparators={ALLOWED_DECIMAL_SEPARATORS}
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
            <ModalDivider />
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
            <FeeBreakdown
                feesLabel={t('withdrawal_from_pool_modal.form.fees_label')}
                iconSize={18}
                items={feeItems}
            />
        </>
    );
});

WithdrawalFromPoolForm.displayName = 'WithdrawalFromPoolForm';
export default WithdrawalFromPoolForm;
