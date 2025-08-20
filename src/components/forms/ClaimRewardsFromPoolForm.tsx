import {
    Divider,
    NumberInput,
    Text,
    Loader,
    Button,
    alpha
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState
} from "react";
import {
    useDebouncedCallback,
    useElementSize,
    useMediaQuery
} from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import { formatNumber, truncateString } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import * as yup from "yup";
import { useTranslation, Trans } from "react-i18next";
import { IPool } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { useWithdrawFeesCollateralPool } from "@/hooks/useContracts";
import { parseUnits, formatUnit, toNumber } from "@/utils";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ErrorDecoder } from "ethers-decode-error";
import { CollateralPoolTokenAbi } from "@/abi";

interface IClaimRewardsFromPoolForm {
    collateralPool: IPool
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const ClaimRewardsFromPoolForm = forwardRef<FormRef, IClaimRewardsFromPoolForm>(({ collateralPool }: IClaimRewardsFromPoolForm, ref)  => {
    const [amount, setAmount] = useState<number>();
    const [fee, setFee] = useState<number>();
    const [maxWithdrawal, setMaxWithdrawal] = useState<number>();
    const { t } = useTranslation();
    const mediaQueryMatches = useMediaQuery('(max-width: 40em)');
    const { mainToken, connectedCoins } = useWeb3();
    const claimRewardsCollateralPool = useWithdrawFeesCollateralPool();

    const withdrawLabelSize = useElementSize();
    const feeLabelSize = useElementSize();
    const labelWidth = Math.max(withdrawLabelSize.width, feeLabelSize.width);

    const fAssetCoin = connectedCoins.find(coin => coin.type === collateralPool.vaultType);
    const inputStep = collateralPool.vaultType.toLowerCase().includes('btc') || collateralPool.vaultType.toLowerCase().includes('doge')
        ? 0.00000001
        : 0.001;
    const decimalScale = collateralPool.vaultType.toLowerCase().includes('btc') || collateralPool.vaultType.toLowerCase().includes('doge')
        ? 8
        : 3;

    const schema = yup.object().shape({
        amount: yup.number()
            .required(t('validation.messages.required', { field: t('claim_rewards_from_pool_modal.form.amount_label') }))
            .min(inputStep)
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
        if (!collateralPool) return;
        setMaxWithdrawal(Math.floor(toNumber(collateralPool.userPoolFees!) * Math.pow(10, decimalScale)) / Math.pow(10, decimalScale));
    }, [collateralPool]);

    const debounceSetAmount = useDebouncedCallback(async (value) => {
        if (!value || value === amount) return;

        setAmount(value);
        try {
            const estimatedGas = await claimRewardsCollateralPool.mutateAsync({
                userAddress: mainToken?.address!,
                poolAddress: collateralPool.pool!,
                feeShare: parseUnits(
                    value,
                    collateralPool.vaultType.toLowerCase().includes('btc') || collateralPool.vaultType.toLowerCase().includes('doge')
                        ? 8
                        : 6
                ).toString(),
                getGasFee: true
            });
            setFee(Number(formatUnit(estimatedGas, 9)));
        } catch (error: any) {
            const errorDecoder = ErrorDecoder.create([CollateralPoolTokenAbi]);
            const decodedError = await errorDecoder.decode(error);
            showErrorNotification(decodedError.reason as string);
        }
    }, 500);

    return (
        <>
            <NumberInput
                {...form.getInputProps('amount')}
                key={form.key('amount')}
                min={0}
                max={maxWithdrawal ?? 0}
                inputMode="numeric"
                type="tel"
                size="sm"
                step={inputStep}
                allowNegative={false}
                decimalScale={decimalScale}
                clampBehavior="strict"
                label={
                    <Text
                        className="text-12"
                        fw={400}
                        c="var(--flr-gray)"
                    >
                        {t('claim_rewards_from_pool_modal.form.amount_label')}
                    </Text>
                }
                description={t('claim_rewards_from_pool_modal.form.min_balance_label', { tokenName: mainToken?.type })}
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
                                i18nKey={`claim_rewards_from_pool_modal.form.agent_label`}
                                values={{ agent: collateralPool.agentName }}
                                components={{
                                    bold: <strong />
                                }}
                                parent={Text}
                                fw={400}
                                className="text-18"
                            />
                            <Text className="flex items-center text-14" fw={400}>
                                {truncateString(collateralPool.vault, 5, 5)}
                                <CopyIcon
                                    text={collateralPool.vault}
                                    color={alpha('var(--flr-black)', 0.2)}
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
                        onClick={() => form.setFieldValue('amount', toNumber(collateralPool.userPoolFees!))}
                    >
                        {t('claim_rewards_from_pool_modal.form.max_button')}
                    </Button>
                }
            />
            <div className="flex items-center mt-2 sm:hidden">
                <Trans
                    i18nKey={`claim_rewards_from_pool_modal.form.agent_label`}
                    values={{ agent: collateralPool.agentName }}
                    components={{
                        bold: <strong />
                    }}
                    parent={Text}
                    fw={400}
                    className="text-18"
                />
                <Text className="flex items-center ml-2 text-14" fw={400}>
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
                className="mb-1 uppercase text-12"
            >
                {t('claim_rewards_from_pool_modal.form.you_will_claim_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('claim_rewards_from_pool_modal.form.withdraw_label')}
                </Text>
                <div className="flex">
                    {fAssetCoin && fAssetCoin.icon &&
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
                        ref={withdrawLabelSize.ref}
                        className="text-16"
                        fw={400}
                        c="var(--flr-gray)"
                        style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                    >
                        {collateralPool.vaultType}
                    </Text>
                </div>
            </div>
            <Text
                fw={400}
                c="var(--flr-gray)"
                className="mb-1 mt-5 uppercase text-12"
            >
                {t('claim_rewards_from_pool_modal.form.fees_label')}
            </Text>
            <div className="flex justify-between">
                <Text
                    className="text-16"
                    fw={400}
                    c="var(--flr-black)"
                >
                    {t('claim_rewards_from_pool_modal.form.fee_label')}
                </Text>
                <div className="flex items-center">
                    {mainToken?.icon && mainToken.icon({ width: "18", height: "18" })}
                    <Text
                        className="text-16 mx-2"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {claimRewardsCollateralPool.isPending
                            ? <Loader size={14} />
                            : fee
                                ? formatNumber(fee, decimalScale)
                                : <span>&mdash;</span>
                        }
                    </Text>
                    <Text
                        ref={feeLabelSize.ref}
                        className="text-16"
                        fw={400}
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

ClaimRewardsFromPoolForm.displayName = 'ClaimRewardsFromPoolForm';
export default ClaimRewardsFromPoolForm;
