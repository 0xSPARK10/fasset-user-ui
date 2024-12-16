import React, { Dispatch, SetStateAction, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
    Divider,
    NumberInput,
    Text,
    Loader,
    TextInput,
    Title,
    Button,
    Anchor,
    rem,
    lighten
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { isAddress } from "ethers";
import { IconArrowUpRight } from "@tabler/icons-react";
import { ErrorDecoder } from "ethers-decode-error";
import { useTranslation, Trans } from "react-i18next";
import CopyIcon from "@/components/icons/CopyIcon";
import { useTransferCollateralPoolToken } from "@/hooks/useContracts";
import { parseUnits, formatUnit, toNumber } from "@/utils";
import { CollateralPoolTokenAbi } from "@/abi";
import { showErrorNotification } from "@/hooks/useNotifications";
import { formatNumber, truncateString } from "@/utils";
import { IPool } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";

interface ISendCPTForm {
    collateralPool: IPool
    isFormDisabled: boolean;
    payDebtClicked: () => void;
    setIsFormDisabled: Dispatch<SetStateAction<boolean>>;
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const SendCPTForm = forwardRef<FormRef, ISendCPTForm>(({ collateralPool, payDebtClicked }: ISendCPTForm, ref) => {
    const [account, setAccount] = useState<string>("");
    const [amount, setAmount] = useState<number>();
    const [fee, setFee] = useState<number>();
    const [maxTransferableTokens, setMaxTransferableTokens] = useState<number>();
    const { t } = useTranslation();
    const { mainToken } = useWeb3();
    const mediaQueryMatches = useMediaQuery('(max-width: 40em)');
    const transfer = useTransferCollateralPoolToken();

    const schema = yup.object().shape({
        amount: yup.number()
            .required(t('validation.messages.required', { field: t('send_cpt_modal.form.amount_label') }))
            .min(0.001),
        account: yup
            .string()
            .required(t('validation.messages.required', { field: t('send_cpt_modal.form.address_label') }))
            .test(
                'invalid_address',
                t('validation.messages.invalid_address',
                {
                    field: t('send_cpt_modal.form.address_label')
                }),
                (val: any) => isAddress(val))

    });

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            amount: undefined,
            account: ""
        },
        validate: yupResolver(schema)
    });

    form.watch('amount', ({ value }) => {
        debounceSetAmount(value);
    });

    form.watch('account', ({ value }) => {
        debounceSetAccount(value);
    });

    useImperativeHandle(ref, () => ({
        form: () => {
            return form;
        }
    }));

    useEffect(() => {
        if (!collateralPool) return;
        setMaxTransferableTokens(toNumber(collateralPool.transferableTokens!));
    }, [collateralPool]);

    const debounceSetAmount = useDebouncedCallback(async (value) => {
        if (value === amount) return;
        setAmount(value);
        getFee(value, account);
    }, 500);

    const debounceSetAccount = useDebouncedCallback(async (value) => {
        if (value === account) return;
        setAccount(value);
        getFee(amount, value);
    }, 500);

    const getFee = async (amount: number | undefined, account: string) => {
        if (amount === undefined || account === undefined || !form.isValid()) {
            setFee(undefined);
            return;
        }

        try {
            const estimatedGas = await transfer.mutateAsync({
                userAddress: account,
                poolAddress: collateralPool?.tokenAddress!,
                amount: parseUnits(amount, 18).toString(),
                getGasFee: true
            });

            setFee(Number(formatUnit(estimatedGas, 9)));
        } catch (error: any) {
            const errorDecoder = ErrorDecoder.create([CollateralPoolTokenAbi]);
            const decodedError = await errorDecoder.decode(error);
            showErrorNotification(decodedError.reason as string);
        }
    }

    return (
        <>
            <TextInput
                {...form.getInputProps('account')}
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('send_cpt_modal.form.address_label')}
                    </Text>
                }
                className="mb-4 mr-0 sm:mr-8"
                classNames={{
                    wrapper: 'flex-shrink-0 basis-full sm:basis-3/5'
                }}
            />
            <NumberInput
                {...form.getInputProps('amount')}
                key={form.key('amount')}
                inputMode="numeric"
                type="tel"
                size="sm"
                allowNegative={false}
                min={maxTransferableTokens ? 0.001 : 0}
                max={maxTransferableTokens ?? 0}
                step={0.001}
                decimalScale={3}
                clampBehavior="strict"
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('send_cpt_modal.form.amount_label')}
                    </Text>
                }
                description={
                    <Trans
                        i18nKey={`send_cpt_modal.form.min_balance_label`}
                        values={{
                            amount: maxTransferableTokens,
                            outOfAmount: collateralPool?.userPoolBalance,
                            tokenName: mainToken?.type
                        }}
                        components={{
                            bold: <strong />
                        }}
                        parent={'span'}
                    />
                }
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
                                i18nKey={`send_cpt_modal.form.agent_label`}
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
                        color="var(--mantine-color-gray-6)"
                        fw={400}
                        className="pr-2 mt-1"
                        //@ts-ignore
                        onClick={() => form.setFieldValue('amount', toNumber(collateralPool?.transferableTokens))}
                    >
                        {t('claim_rewards_from_pool_modal.form.max_button')}
                    </Button>
                }
            />
            <div className="flex items-center mt-2 sm:hidden">
                <Trans
                    i18nKey={`send_cpt_modal.form.agent_label`}
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
            <Title
                fw={300}
                className="text-24 mb-5"
                c="var(--flr-black)"
            >
                {t('send_cpt_modal.pay_debt_title')}
            </Title>
            <div className="flex justify-between items-center">
                <div>
                    <Text
                        c="var(--flr-gray)"
                        className="text-12 mb-1 mt-2 whitespace-break-spaces"
                        fw={400}
                    >
                        {t('send_cpt_modal.pay_debt_description_label')}
                    </Text>
                    <Trans
                        i18nKey={'send_cpt_modal.pay_debt_learn_more'}
                        components={{
                            a: <Anchor
                                underline="always"
                                href="https://docs.flare.network/tech/fassets/collateral/#fasset-minting-fees-and-debt"
                                target="_blank"
                                className="inline-flex ml-1 mt-2"
                                c="black"
                                fw={700}
                            />,
                            icon: <IconArrowUpRight
                                style={{ width: rem(20), height: rem(20) }}
                                className="ml-1"
                            />
                        }}
                        parent={Text}
                        c="var(--flr-gray)"
                        className="text-12"
                        fw={400}
                    />
                </div>
                <Button
                    variant="gradient"
                    radius="xl"
                    size="sm"
                    fw={400}
                    className="ml-2 shrink-0"
                    disabled={collateralPool.fassetDebt === "0"}
                    onClick={payDebtClicked}
                >
                    {t('agents.table.pay_debt_button')}
                </Button>
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
                className="mb-1 mt-5 uppercase text-12"
            >
                {t('send_cpt_modal.form.fees_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    c="var(--flr-black)"
                    fw={400}
                >
                    {t('send_cpt_modal.form.fee_label')}
                </Text>
                <div className="flex items-center">
                    {mainToken?.icon && mainToken.icon({ width: '18', height: '18' })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                    >
                        {transfer.isPending
                            ? <Loader size={14} />
                            : fee
                                ? formatNumber(fee, 4)
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        c="var(--flr-gray)"
                        className="text-16 w-12"
                    >
                        {mainToken?.type}
                    </Text>
                </div>
            </div>
        </>
    );
});

SendCPTForm.displayName = 'SendCPTForm';
export default SendCPTForm;
