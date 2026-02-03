import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
    useCallback,
    useRef
} from "react";
import {
    Button,
    Divider,
    Loader,
    LoadingOverlay,
    NumberInput,
    Popover,
    Text,
    FocusTrap,
    SimpleGrid
} from "@mantine/core";
import CryptoJS from "crypto-js";
import { useForm, UseFormReturnType } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useDebouncedCallback, useElementSize, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import CopyIcon from "@/components/icons/CopyIcon";
import AgentsList from "@/components/mint/AgentsList";
import { showErrorNotification } from "@/hooks/useNotifications";
import { truncateString, fromLots, toLots, toNumber, formatNumber, toSatoshi, parseUnits } from "@/utils";
import { IAgent, IFAssetCoin, ISelectedAgent } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMaxLots, useReturnAddresses } from "@/api/minting";
import { useUnderlyingBalance, useNativeBalance } from "@/api/balance";
import { useBestAgent, useAllAgents, useFassetPrice } from "@/api/user";
import { WALLET } from "@/constants";
import classes from "@/styles/components/forms/MintForm.module.scss";

interface IMintForm {
    isFormDisabled?: (status: boolean) => void;
    setSelectedAgent: (agent: ISelectedAgent) => void;
    selectedAgent: ISelectedAgent | undefined;
    setLots: (lots: number | undefined) => void;
    lots: number | undefined;
    fAssetCoin: IFAssetCoin;
    refreshBalance: () => void;
    setHighMintingFee: (fee: number | undefined) => void;
    onError: (error: string) => void;
}

export type FormRef = {
    form: () => UseFormReturnType<any>;
}

const MINTING_FEE_LIMIT = 2;

const MintForm = forwardRef<FormRef, IMintForm>(
    ({
        isFormDisabled,
        setSelectedAgent,
        selectedAgent,
        lots,
        setLots,
        fAssetCoin,
        refreshBalance,
        setHighMintingFee,
        onError
    }: IMintForm, ref) => {
    const [maxLots, setMaxLots] = useState<number>();
    const [transfer, setTransfer] = useState<number>();
    const [mintingFee, setMintingFee] = useState<number>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [areLotsLimited, setAreLotsLimited] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [isAgentPopoverActive, setIsAgentPopoverActive] = useState<boolean>(false);
    const [isManualSelectedAgent, setIsManualSelectedAgent] = useState<boolean>(false);
    const hasRun = useRef(false);
    const hasXamanInsufficientFunds = useRef(false);

    const { walletConnectConnector, connectedCoins, mainToken } = useWeb3();
    const popoverSize = useElementSize();
    const transferLabelSize = useElementSize();
    const mintingFeeLabelSize = useElementSize();
    const reservationLabelSize = useElementSize();
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 640px)');
    const bestAgent = useBestAgent();
    const fetchMaxLots = useMaxLots(fAssetCoin.type, false);
    const agents = useAllAgents(fAssetCoin.type);
    const returnAddresses = useReturnAddresses(
        fAssetCoin.type,
        transfer && mintingFee ? toSatoshi(transfer + mintingFee) : 0,
        false
    );
    const fAssetPrice = useFassetPrice(fAssetCoin.type, false);

    const mintFeePercentage = mintingFee !== undefined && transfer !== undefined && transfer !== 0
        ? (mintingFee / transfer) * 100
        : 0;
    const isMintingFeeHigh = mintFeePercentage > MINTING_FEE_LIMIT;

    const connectedCoin = connectedCoins.find(coin => coin.type == fAssetCoin.type);
    const underlyingBalance = useUnderlyingBalance(
        connectedCoin && connectedCoin.connectedWallet === WALLET.LEDGER && connectedCoin.xpub !== undefined
            ? CryptoJS.AES.decrypt(connectedCoin.xpub!, process.env.XPUB_SECRET!).toString(CryptoJS.enc.Utf8)
            : fAssetCoin?.address!,
        fAssetCoin.type,
        fAssetCoin?.address !== undefined,
        connectedCoin && connectedCoin.connectedWallet === WALLET.LEDGER && connectedCoin.xpub !== undefined
    );

    const nativeBalances = useNativeBalance(mainToken?.address ?? '', mainToken?.address !== undefined);
    const schema = yup.object().shape({
        lots: yup.number()
            .required(t('validation.messages.required', { field: t('mint_modal.form.lots_label') }))
            .min(1)
    });
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            lots: undefined,
            agentAddress: '',
            collateralReservationFee: '',
            feeBIPS: '',
            estimatedFee: undefined,
            minterUnderlyingAddresses: [],
            utxos: []
        },
        validate: yupResolver(schema),
        onValuesChange: (values: any) => {
            if (values?.lots?.length === 0) {
                form.setFieldValue('lots', undefined);
            }
        }
    });

    const inputDescription = `${t('mint_modal.form.lots_limit_label', {
        nativeName: fAssetCoin.nativeName,
        lots: maxLots,
        lotSize: fAssetCoin.lotSize
    })}\n ${areLotsLimited ? t('mint_modal.form.maximum_number_of_lots_label') + "\n" : ''} ${t('mint_modal.form.amounted_based_label', { nativeName: fAssetCoin.nativeName })}`;
    const labelWidth = Math.max(transferLabelSize.width, mintingFeeLabelSize.width, reservationLabelSize.width);

    const reservationFee = lots && bestAgent?.data?.collateralReservationFee
        ? BigInt(bestAgent?.data?.collateralReservationFee) + parseUnits(mainToken?.minWalletBalance!, 18)
        : undefined;

    const refetchBestAgent = useCallback(async (setAgent: boolean = true) => {
        try {
            if (isFormDisabled) {
                isFormDisabled(true);
            }

            const response = await bestAgent.mutateAsync({
                fAsset: fAssetCoin.type,
                lots: lots as number
            });

            if (setAgent) {
                const fee = (transfer ?? 0) * ((Number(response?.feeBIPS) ?? 0) / 10000);
                setMintingFee(fee);

                setSelectedAgent({
                    name: response?.agentName,
                    address: response?.agentAddress,
                    feeBIPS: response?.feeBIPS,
                    underlyingAddress: response?.underlyingAddress,
                    infoUrl: response?.infoUrl
                });
                form.setValues((prev) => ({
                    ...prev,
                    agentAddress: response?.agentAddress,
                    collateralReservationFee: response?.collateralReservationFee,
                    feeBIPS: response?.feeBIPS
                }));
            } else {
                form.setFieldValue('collateralReservationFee', response?.collateralReservationFee);
            }
        } catch (error: any) {
            error = error as AxiosError;
            if (error.response.status === 400) {
                setIsDisabled(true);
                if (isFormDisabled) {
                    isFormDisabled(true);
                }

                form.setFieldError(
                    'lots',
                    !isManualSelectedAgent
                        ? error?.response?.data?.message
                        : t('mint_modal.form.error_agent_no_lots_available')
                );
            } else {
                showErrorNotification(error?.response?.data?.message);
            }
        } finally {
            if (isFormDisabled && !hasXamanInsufficientFunds.current) {
                isFormDisabled(false);
            }
        }
    }, [bestAgent, form]);

    const debounceSetLots = useDebouncedCallback(async (value) => {
        setLots(value);
        setTransfer(fromLots(value, fAssetCoin.lotSize) as number);
        if (value && selectedAgent !== undefined) {
            const fee = fromLots(value, fAssetCoin.lotSize) as number * ((Number(selectedAgent.feeBIPS) ?? 0) / 10000);
            setMintingFee(fee);
        }
    }, 500);

    const setAgent = (event: React.MouseEvent<HTMLDivElement>, agent: IAgent) => {
        if (event.target instanceof SVGElement) {
            return;
        }

        setIsManualSelectedAgent(true);

        setSelectedAgent({
            name: agent.agentName,
            address: agent.vault,
            feeBIPS: agent.feeBIPS,
            underlyingAddress: agent.underlyingAddress,
            infoUrl: agent.url,
        });
        setIsAgentPopoverActive(false);

        let balance = toNumber(underlyingBalance?.data?.balance!);
        const fee = transfer! * ((Number(agent.feeBIPS) ?? 0) / 10000);
        setMintingFee(fee);
        // substract fee from balance and recalculate max lots to mint
        balance -= fee;
        // wallet needs to have minimal 10 coins
        balance -= fAssetCoin.minWalletBalance;

        if (balance < 0) {
            balance = 0;
        }

        const balanceLots = toLots(balance, fAssetCoin.lotSize) as number;
        setMaxLots(Math.min(balanceLots, Number(agent.freeLots)));

        const values = form.getValues();
        form.setValues((prev) => ({
            ...prev,
            agentAddress: agent.vault,
            feeBIPS: agent.feeBIPS,
            lots: values.lots > Number(agent.freeLots) ? Number(agent.freeLots) : lots
        }));

        if (values.lots) {
            refetchBestAgent(false);
        }
    }

    useEffect(() => {
        return () => {
            setLots(undefined)
        }
    }, []);

    useEffect(() => {
        if (!mintingFee || !selectedAgent || fAssetCoin.type.toLowerCase().includes('xrp')) {
            form.setFieldValue(
                'minterUnderlyingAddresses',
                fAssetCoin.type.toLowerCase().includes('xrp') ? [fAssetCoin.address!] : []
            );
            return;
        }

        const fetch = async () => {
            const response = await returnAddresses.refetch();
            form.setValues((prev) => ({
                ...prev,
                minterUnderlyingAddresses: response.data?.addresses!,
                utxos: response.data?.utxos!,
                estimatedFee: response.data?.estimatedFee
            }));
        }

        fetch();
    }, [mintingFee, selectedAgent]);

    const checkXamanBalance = async () => {
        const response = await fAssetPrice.refetch();
        hasXamanInsufficientFunds.current = false;
        onError('');

        if (response.data?.price && lots) {
            const balance = toNumber(underlyingBalance.data?.balance!);
            let totalUsd = response.data.price * ((fromLots(lots, fAssetCoin.lotSize) as number) + (mintingFee ?? 0));
            let xamanFee = 0;

            if (totalUsd > 50000 && totalUsd <= 100000) {
                xamanFee = (totalUsd * 0.001); // 0.1%
            } else if (totalUsd > 100000) {
                xamanFee = (totalUsd * 0.0007); // 0.07%
            }

            totalUsd += xamanFee;
            const totalXrp = totalUsd / response.data.price;

            if (isFormDisabled && (totalXrp > (balance - fAssetCoin.minWalletBalance))) {
                isFormDisabled(true);
                hasXamanInsufficientFunds.current = true;
                onError(t('mint_modal.form.error_insufficient_balance_label', { tokenName: 'XRP' }))
            }
        }
    }

    useEffect(() => {
        if (!mintingFee) return;
        if (isMintingFeeHigh) {
            setHighMintingFee(mintingFee);
        } else {
            setHighMintingFee(undefined);
        }

        if (fAssetCoin?.connectedWallet === WALLET.XAMAN) {
            checkXamanBalance();
        }
    }, [mintingFee, isMintingFeeHigh]);

    useEffect(() => {
        if (lots) {
            refetchBestAgent(!isManualSelectedAgent);
        } else {
            setMintingFee(undefined);
        }
    }, [lots]);

    useEffect(() => {
        if (!underlyingBalance.data || !nativeBalances.data || hasRun.current) return;

        const fetch = async () => {
            try {
                setIsDisabled(false);
                if (isFormDisabled && !hasXamanInsufficientFunds.current) {
                    isFormDisabled(false);
                }

                setIsLoading(true);

                if (underlyingBalance.data.balance === null) {
                    await walletConnectConnector.fetchUtxoAddresses(fAssetCoin.network.namespace, fAssetCoin.network.chainId, fAssetCoin.address!);
                    return;
                }

                const maxLotsResponse = await fetchMaxLots.refetch({ throwOnError: true });
                setAreLotsLimited(maxLotsResponse.data?.lotsLimited ?? false);

                const agentMaxLots = Number(maxLotsResponse.data?.maxLots!);
                let balanceLots = Math.floor((toNumber(underlyingBalance.data.balance!) - fAssetCoin.minWalletBalance) / fAssetCoin.lotSize);
                if (balanceLots < 0) {
                    balanceLots = 0;
                }

                hasRun.current = true;
                // get fee for max lots to mint
                const response = await bestAgent.mutateAsync({
                    fAsset: fAssetCoin.type,
                    lots: Math.min(balanceLots, agentMaxLots)
                });

                let balance = toNumber(underlyingBalance.data.balance!);
                const fee = (transfer ?? balance) * ((Number(response.feeBIPS) ?? 0) / 10000);
                // substract fee from coin balance and recalculate max lots to mint
                balance -= fee;
                // wallet needs to have minimal X coins
                balance -= fAssetCoin.minWalletBalance;
                if (balance < 0) {
                    balance = 0;
                }

                balanceLots = toLots(balance, fAssetCoin.lotSize) as number;
                setMaxLots(Math.min(balanceLots, agentMaxLots));
            } catch (error: any) {
                if (error.code === 4001) {
                    refreshBalance();
                } else {
                    error = error as AxiosError;
                    if (error?.response?.status === 400) {
                        if (error?.response?.data?.message.toLowerCase().includes('cannot mint more than')) {
                            await fetchMaxLots.refetch();
                            return;
                        }

                        setIsDisabled(true);
                        if (isFormDisabled) {
                            isFormDisabled(true);
                        }
                        form.setFieldError('lots', error?.response?.data?.message);
                    } else {
                        showErrorNotification(error?.response?.data?.message);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetch();
    }, [underlyingBalance.data, nativeBalances.data]);

    useEffect(() => {
        if (!fetchMaxLots.isError) return;

        const error: any = fetchMaxLots?.error;
        if (error?.response?.status === 400) {
            setIsDisabled(true);
            if (isFormDisabled) {
                isFormDisabled(true);
            }
            form.setFieldError('lots', error?.response?.data?.message);
        } else {
            showErrorNotification(error?.response?.data?.message);
        }
    }, [fetchMaxLots.isError]);

    useImperativeHandle(ref, () => ({
        form: () => {
            return form;
        }
    }));

    form.watch('lots', ({ value }) => {
        debounceSetLots(value);
    });

    return (
        <div ref={popoverSize.ref}>
            <LoadingOverlay visible={isLoading || underlyingBalance.isPending} />
            <FocusTrap active={true}>
                <NumberInput
                    {...form.getInputProps('lots')}
                    key={form.key('lots')}
                    label={
                        <Text
                            className="text-12"
                            fw={400}
                            c="var(--flr-gray)"
                        >
                            {t('mint_modal.form.lots_label')}
                        </Text>
                    }
                    description={
                        underlyingBalance.isPending || isLoading
                            ? t('mint_modal.form.lots_waiting_balance_label', {coin: fAssetCoin.nativeName})
                            : isDisabled
                                ? ''
                                : inputDescription
                    }
                    inputWrapperOrder={['label', 'input', 'error', 'description']}
                    inputMode="numeric"
                    type="tel"
                    size="sm"
                    step={1}
                    min={maxLots !== undefined && maxLots > 0 ? 1 : 0}
                    max={maxLots}
                    allowDecimal={false}
                    disabled={isDisabled}
                    clampBehavior="strict"
                    className="mt-3"
                    classNames={{
                        label: 'uppercase',
                        input: classes.lotsInput,
                        wrapper: 'flex-shrink-0 w-full sm:w-2/4'
                    }}
                    inputContainer={children => (
                        <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
                            {children}
                            <div className="sm:ml-8 mb-1 hidden sm:flex items-center">
                                {fAssetCoin.icon({ width: "24", height: "24" })}
                                <Text
                                    fw={500}
                                    c="var(--flr-black)"
                                    className="text-18 mx-2"
                                >
                                    {
                                        fromLots(
                                            typeof lots === 'number'
                                                ? lots
                                                : (lots !== undefined && (lots as string).length > 0 ? lots : undefined),
                                            fAssetCoin.lotSize,
                                            fAssetCoin.decimals,
                                            true
                                        )
                                    }
                                </Text>
                                <Text
                                    c="var(--flr-gray)"
                                    className="text-18"
                                    fw={400}
                                >
                                    {fAssetCoin.type}
                                </Text>
                            </div>
                        </div>
                    )}
                />
            </FocusTrap>
            <div className="flex items-center mt-2 sm:hidden">
                {fAssetCoin.icon({ width: "30", height: "30" })}
                <Text
                    fw={500}
                    className="text-18 mx-2"
                >
                    {fromLots(lots, fAssetCoin.lotSize, fAssetCoin.decimals,true)}
                </Text>
                <Text
                    c="var(--flr-gray)"
                    fw={400}
                    className="text-18"
                >
                    {fAssetCoin.symbol}
                </Text>
            </div>
            <Divider
                className="my-8"
                styles={{
                    root: {
                        marginLeft: isMobile ? '-1rem' : '-2.75rem',
                        marginRight: isMobile ? '-1rem' : '-2.75rem'
                    }
                }}
            />
            <SimpleGrid
                cols={{base: 1, xs: 3 }}
            >
                <div>
                    <Text
                        c="var(--flr-gray)"
                        className="text-12 uppercase"
                    >
                        {t('mint_modal.form.name_label')}
                    </Text>
                    <Text
                        c="var(--flr-black)"
                        className="text-16"
                    >
                        {!isManualSelectedAgent && bestAgent.isPending
                            ? <Loader size={14}/>
                            : (
                                (lots || isManualSelectedAgent) && selectedAgent?.name
                                    ? selectedAgent?.name
                                    : <span>&mdash;</span>
                            )
                        }
                    </Text>
                </div>
                <div>
                    <Text
                        c="var(--flr-gray)"
                        className="text-12 uppercase"
                    >
                        {t('mint_modal.form.address_label')}
                    </Text>
                    <div className="flex items-center">
                        <Text
                            c="var(--flr-black)"
                            className="text-16"
                        >
                            {!isManualSelectedAgent && bestAgent.isPending
                                ? <Loader size={14} />
                                : (
                                    (lots || isManualSelectedAgent) && selectedAgent?.address
                                        ? truncateString(selectedAgent?.address, 5, 5)
                                        : <span>&mdash;</span>
                                )
                            }
                        </Text>
                        {(isManualSelectedAgent || lots) && selectedAgent?.address &&
                            <CopyIcon
                                text={selectedAgent.address}
                                color="var(--flr-black)"
                            />
                        }
                    </div>
                </div>
                <div className="max-[576px]:order-2">
                    <Popover
                        width={popoverSize.width + 15}
                        opened={isAgentPopoverActive}
                        onChange={() => setIsAgentPopoverActive(!isAgentPopoverActive)}
                        position={isMobile ? 'bottom' : 'bottom-end'}
                    >
                        <Popover.Target>
                            <Button
                                variant="gradient"
                                radius="xl"
                                onClick={() => setIsAgentPopoverActive(!isAgentPopoverActive)}
                                disabled={(!isManualSelectedAgent && !lots) || isDisabled}
                                className="max-[576px]:w-full"
                            >
                                {t('mint_modal.form.change_agent_button')}
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown className="p-2 md:p-3">
                            <AgentsList
                                agents={agents}
                                setAgent={setAgent}
                                lots={lots}
                            />
                        </Popover.Dropdown>
                    </Popover>
                </div>
                <div>
                    <Text
                        c={isMintingFeeHigh ? 'var(--flr-red)' : 'var(--flr-gray)'}
                        className="text-12 uppercase"
                    >
                        {t('mint_modal.form.minting_fee_label')}
                    </Text>
                    <Text
                        c={isMintingFeeHigh ? 'var(--flr-red)' : 'var(--flr-black)'}
                        className="text-16"
                    >
                        {bestAgent.isPending
                            ? <Loader size={14} />
                            : (
                                lots
                                    ? `${formatNumber(mintFeePercentage, 2)}%`
                                    : <span>&mdash;</span>
                            )
                        }
                    </Text>
                </div>
            </SimpleGrid>
            <Divider
                className="my-8"
                styles={{
                    root: {
                        marginLeft: isMobile ? '-1rem' : '-2.75rem',
                        marginRight: isMobile ? '-1rem' : '-2.75rem'
                    }
                }}
            />
            <div className="mt-2">
                <Text
                    fw={400}
                    c="var(--flr-gray)"
                    className="mb-1 text-12 uppercase"
                >
                    {t('mint_modal.form.you_will_send_label')}
                </Text>
                <div className="flex justify-between">
                    <Text
                        className="text-16"
                        fw={400}
                    >
                        {t('mint_modal.form.transfer_label')}
                    </Text>
                    <div className="flex items-center">
                        {fAssetCoin.nativeIcon && fAssetCoin.nativeIcon({ width: "16", height: "16" })}
                        <Text
                            className="mx-2 text-16"
                            fw={400}
                        >
                            {transfer
                                ? formatNumber(transfer, fAssetCoin.decimals)
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
                            {fAssetCoin.nativeName}
                        </Text>
                    </div>
                </div>
                <Text
                    fw={400}
                    c="var(--flr-gray)"
                    className="mb-1 mt-5 uppercase text-12"
                >
                    {t('mint_modal.form.fees_label')}
                </Text>
                <div className="flex justify-between items-center">
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('mint_modal.form.minting_fee_label')}
                    </Text>
                    <div className="flex items-center">
                        {fAssetCoin.nativeIcon && fAssetCoin.nativeIcon({ width: "16", height: "16" })}
                        <Text
                            className="mx-2 text-16"
                            fw={400}
                        >
                            {bestAgent.isPending
                                ? <Loader size={14} />
                                : (mintingFee
                                    ? formatNumber(mintingFee, fAssetCoin.decimals)
                                    : <span>&mdash;</span>)
                            }
                        </Text>
                        <Text
                            ref={mintingFeeLabelSize.ref}
                            className="text-16"
                            fw={400}
                            c="var(--flr-gray)"
                            style={{ width: labelWidth > 0 ? `${labelWidth}px` : 'auto' }}
                        >
                            {fAssetCoin.nativeName}
                        </Text>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <Text
                        className="text-16"
                        fw={400}
                        c="var(--flr-black)"
                    >
                        {t('mint_modal.form.reservation_fee_label')}
                    </Text>
                    <div className="flex items-center">
                        {mainToken?.icon !== undefined && mainToken?.icon({ width: "16", height: "16" })}
                        <Text
                            className="mx-2 text-16"
                            fw={400}
                        >
                            {bestAgent.isPending
                                ? <Loader size={14} />
                                : (reservationFee
                                    ? Number(Number(reservationFee) / 1e18).toLocaleString('en-US', { maximumFractionDigits: 2 })
                                    : <span>&mdash;</span>)
                            }
                        </Text>
                        <Text
                            ref={reservationLabelSize.ref}
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
        </div>
    );
});

MintForm.displayName = 'MintForm';
export default MintForm;
