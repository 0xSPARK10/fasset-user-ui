import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useForm, UseFormReturnType } from "@mantine/form";
import { CoinEnum, ICoin } from "@/types";
import { Button, Divider, Loader, NumberInput, Text, SegmentedControl } from "@mantine/core";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { formatNumber, formatUnit, parseUnits, toLots, toNumber } from "@/utils";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import FXrpHypeCoreIcon from "@/components/icons/FXrpHypeCoreIcon";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeQouteSend, useHypeBalance } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";
import { BRIDGE_TYPE } from "@/constants";
import FXrpIcon from "@/components/icons/FXrpIcon";
import classes from "@/styles/components/forms/BridgeForm.module.scss";
import FXrpHypeEVMIcon from "@/components/icons/FXrpHypeEVMIcon";
import { useNativeBalance } from "@/api/balance";
import { useHyperliquidBalance } from "@/api/bridge";
import { HYPE } from "@/config/coin";

interface IBridgeForm {
    token: ICoin;
    type: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE];
    onError: (error: string | undefined) => void;
}
export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const BridgeForm = forwardRef<FormRef, IBridgeForm>(({ token, type, onError }: IBridgeForm, ref) => {
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 40em)');
    const { mainToken, bridgeToken } = useWeb3();

    const [amount, setAmount] = useState<number>();
    const [fee, setFee] = useState<string>();
    const [bridgeType, setBridgeType] = useState<typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE]>(type);
    const qouteSend = useBridgeQouteSend();
    const nativeBalance = useNativeBalance(mainToken?.address!, type !== BRIDGE_TYPE.FLARE);
    const hypeBalance = useHypeBalance(type === BRIDGE_TYPE.FLARE);

    const schema = yup.object().shape({
        amount: yup.number()
            .required(t('validation.messages.required', { field: t('bridge_modal.form.amount_label') }))
            .min(0)
    });
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            amount: undefined,
            fee: undefined,
            type: type
        },
        validate: yupResolver(schema)
    });

    form.watch('amount', ({ value }) => {
        debounceSetAmount(value);
    });
    form.watch('type', ({ value }) => {
        debounceSetType(value);
    })

    useImperativeHandle(ref, () => ({
        form: () => {
            return form;
        }
    }));

    useEffect(() => {
        if (!fee) return;

        if (type !== BRIDGE_TYPE.FLARE) {
            if (!nativeBalance.data) return;

            const balance = nativeBalance.data.find(balance => balance.symbol.toLowerCase() === mainToken?.type?.toLowerCase());
            if (balance && toNumber(balance?.balance!) < toNumber(fee)) {
                onError(t('bridge_modal.error_insufficient_balance_label', { tokenName: mainToken?.type }))
            }
        } else {
            if (!hypeBalance.data) return;
            const balance = formatUnit(hypeBalance.data, 18);
            if (toNumber(balance) < toNumber(fee)) {
                onError(t('bridge_modal.error_insufficient_balance_label', { tokenName: CoinEnum.HYPE }))
            }
        }
    }, [fee, nativeBalance, hypeBalance]);

    const debounceSetType = useDebouncedCallback(async (value: typeof BRIDGE_TYPE[keyof typeof BRIDGE_TYPE]) => {
        try {
            onError(undefined);
            setBridgeType(value);
            if (!amount) return;

            const fee = await qouteSend.mutateAsync({
                amount: parseUnits(amount!, 6).toString(),
                bridgeType: value
            });

            form.setFieldValue('fee', fee);
            setFee(formatUnit(fee, 18));
        } catch (error) {
            const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
            const decodedError = await errorDecoder.decode(error);
            showErrorNotification(decodedError.reason as string);
        }
    }, 500);

    const debounceSetAmount = useDebouncedCallback(async (value) => {
        if (value === amount) return;

        onError(undefined);
        setAmount(value);
        if (!value) return;

        try {
            const fee = await qouteSend.mutateAsync({
                amount: parseUnits(value, 6).toString(),
                bridgeType: bridgeType
            });

            setFee(formatUnit(fee, 18));
            form.setFieldValue('fee', fee);
        } catch (error) {
            const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
            const decodedError = await errorDecoder.decode(error);
            showErrorNotification(decodedError.reason as string);
        }

    }, 500);

    return (
        <div>
            <Text
                className="text-24 mb-5"
                fw={300}
                c="var(--flr-black)"
            >
                {t('bridge_modal.form.amount_step_title')}
            </Text>
            <NumberInput
                {...form.getInputProps('amount')}
                key={form.key('amount')}
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('bridge_modal.form.amount_label')}
                    </Text>
                }
                inputWrapperOrder={['label', 'input', 'error', 'description']}
                inputMode="numeric"
                size="sm"
                step={1}
                max={token?.balance ? Number(token?.balance) : 0}
                clampBehavior="strict"
                allowLeadingZeros={false}
                rightSection={
                    <Button
                        size="sm"
                        variant="transparent"
                        color="var(--flr-gray)"
                        fw={400}
                        className="pr-2 mt-1"
                        onClick={ () => form.setFieldValue('amount', token?.balance as any)}
                    >
                        {t('bridge_modal.form.max_button')}
                    </Button>
                }
                inputContainer={children => (
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                        {children}
                        <div className="sm:ml-5 mt-2 sm:mt-0 flex items-center">
                            {token?.icon && token.icon({ width: "24", height: "24" })}
                            <Text
                                c="var(--flr-gray)"
                                className="text-14 ml-2"
                                fw={500}
                            >
                                {t('bridge_modal.form.available_label', {
                                    amount: formatNumber(token?.balance ?? 0)
                                })}
                            </Text>
                        </div>
                    </div>
                )}
                classNames={{
                    wrapper: 'flex-shrink-0 w-full sm:w-2/4',
                    section: 'w-auto'
                }}
            />
            {type !== BRIDGE_TYPE.FLARE &&
                <div className="flex items-center mt-5">
                    <Text
                        fw={500}
                        c="var(--flr-gray)"
                        className="text-16 mr-2"
                    >
                        {t('bridge_modal.form.to_label')}
                    </Text>
                    <SegmentedControl
                        {...form.getInputProps('type')}
                        radius="xl"
                        size="xs"
                        data={[
                            { label: t('bridge_modal.form.hyper_core_label'), value: BRIDGE_TYPE.HYPER_CORE },
                            { label: t('bridge_modal.form.hyper_evm_label'), value: BRIDGE_TYPE.HYPER_EVM }
                        ]}
                        color="var(--flr-black)"
                        classNames={{
                            root: 'bg-[var(--flr-white)] border border-[var(--flr-black)]',
                            label: classes.segmentedControlLabel
                        }}
                    />
                </div>
            }
            <div className="flex items-center justify-between mt-5 sm:w-[80%]">
                <div className="flex items-center">
                    {token?.icon && token.icon({ width: "32", height: "32" })}
                    <Text
                        fw={500}
                        c="var(--flr-black)"
                        className="text-18 mx-2"
                    >
                        {formatNumber(amount ?? 0)}
                    </Text>
                    <Text
                        fw={400}
                        c="var(--flr-gray)"
                        className="text-18"
                    >
                        {token?.type}
                    </Text>
                </div>
                <IconArrowNarrowRight size={20} />
                <div className="flex items-center">
                    {bridgeType === BRIDGE_TYPE.HYPER_CORE &&
                        <FXrpHypeCoreIcon width="32" height="32" />
                    }
                    {bridgeType === BRIDGE_TYPE.HYPER_EVM &&
                        <FXrpHypeEVMIcon width="32" height="32" />
                    }
                    {bridgeType === BRIDGE_TYPE.FLARE &&
                        <FXrpIcon width="32" height="32" />
                    }
                    <Text
                        fw={500}
                        c="var(--flr-black)"
                        className="text-18 mx-2"
                    >
                        {formatNumber(amount ?? 0)}
                    </Text>
                    <Text
                        fw={400}
                        c="var(--flr-gray)"
                        className="text-18"
                    >
                        {token?.type}
                    </Text>
                </div>
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
                {t('bridge_modal.form.fees_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('bridge_modal.form.cross_chain_fee_label')}
                </Text>
                <div className="flex items-center">
                    {type !== BRIDGE_TYPE.FLARE && mainToken?.icon && mainToken.icon({ width: "18", height: "18" })}
                    {type === BRIDGE_TYPE.FLARE && bridgeToken?.nativeIcon && bridgeToken.nativeIcon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {qouteSend.isPending
                            ? <Loader size={14} />
                            : fee
                                ? formatNumber(fee, 4)
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        c="var(--flr-gray)"
                        fw={400}
                        className="text-16 w-12"
                    >
                        {type !== BRIDGE_TYPE.FLARE && mainToken?.type}
                        {type === BRIDGE_TYPE.FLARE && HYPE.type}
                    </Text>
                </div>
            </div>
        </div>
    );
})

BridgeForm.displayName = 'BridgeForm';
export default BridgeForm;