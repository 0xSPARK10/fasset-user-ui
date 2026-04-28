import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { useForm, UseFormReturnType } from "@mantine/form";
import { CoinEnum, ICoin } from "@/types";
import {
	Divider,
	Loader,
	LoadingOverlay,

	Text,
} from "@mantine/core";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import {
	formatNumber,
	formatUnit,
	parseUnits,
	roundDownToDecimals,
	toNumber,
} from "@/utils";
import { formatInputAmount } from "@/core/fees/format";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeQouteSend, useHypeBalance } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";
import { BRIDGE_TYPE } from "@/constants";
import { BridgeConfig } from "@/components/modals/BridgeModal";
import XrpIcon from "@/components/icons/XrpIcon";
import { useRedemptionFees } from "@/api/oft";
import { useRedemptionFee, useRedemptionQueue } from "@/api/redemption";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { HYPE } from "@/config/coin";
import { isValidClassicAddress } from "xrpl";
import DestinationAddressField from "@/components/elements/DestinationAddressField";
import AmountInput from "../elements/AmountInput";
import ModalDivider from "../elements/ModalDivider";
import { IAlertMessage } from "../elements/FormAlert";

interface IBridgeXrplForm {
	token: ICoin;
	bridgeConfig: BridgeConfig;
	onError: (error: string | undefined) => void;
	onFormAlert: (alert?: IAlertMessage) => void;
	onCoreVaultError: (error: string) => void;
	onDestinationAddressChange?: (address: string) => void;
	onDestinationTagChange?: (tag: string) => void;
	isFormDisabled?: (status: boolean) => void;
}

export type FormRef = {
	form: () => UseFormReturnType<any>;
};

const PPM_DENOMINATOR = 1_000_000;

// User enters net amount (desired receive). Gross = net / (1 - composerFeePPM/1M) — covers the composer's cut.
function calcTotalToBridge(amount: number, composerFeePPM: number): number {
	if (composerFeePPM <= 0) return amount;
	return (amount * PPM_DENOMINATOR) / (PPM_DENOMINATOR - composerFeePPM);
}


function calcRedeemingFee(amount: number, redemptionFeeBips: number): number {
	return amount * (redemptionFeeBips / 10_000);
}

function calcAffordableBalance(balance: number, composerFeePPM: number): number {
	if (composerFeePPM <= 0) return balance;
	const affordableBalance = (balance * (PPM_DENOMINATOR - composerFeePPM)) / PPM_DENOMINATOR;
	return roundDownToDecimals(affordableBalance, 2);
}

const BridgeXrplForm = forwardRef<FormRef, IBridgeXrplForm>(
	(
		{
			token,
			onError,
			onFormAlert,
			onDestinationAddressChange,
			onDestinationTagChange,
			isFormDisabled,
		}: IBridgeXrplForm,
		ref,
	) => {
		const { t } = useTranslation();
		const mediaQueryMatches = useMediaQuery("(max-width: 40em)");
		const { mainToken, bridgeToken, connectedCoins } = useWeb3();

		const qouteSend = useBridgeQouteSend();
		const hypeBalance = useHypeBalance(true);
		const srcEid = mainToken?.network?.mainnet
			? EndpointId.HYPERLIQUID_V2_MAINNET
			: EndpointId.HYPERLIQUID_V2_TESTNET;
		const redemptionFees = useRedemptionFees(srcEid, true);
		const redemptionFee = useRedemptionFee(token.type, true);
		const redemptionQueue = useRedemptionQueue(token.type, true);

		const [amount, setAmount] = useState<number>();
		const [fee, setFee] = useState<string>();
		const destinationAddressRef = useRef<string>("");
		const hasMinAmountError = useRef(false);
		const hasInsufficientBalance = useRef(false);

		const connectedXrplCoin = connectedCoins.find(
			(coin) => coin.type === token.type,
		);
		const hasXrplAddress = !!connectedXrplCoin?.address;
		const [editAddress, setEditAddress] = useState<boolean>(!hasXrplAddress);

		const composerFeePPM = Number(redemptionFees.data?.composerFeePPM ?? "0");
		const redemptionFeeBips = toNumber(
			redemptionFee?.data?.redemptionFee ?? "0",
		);

		const balance = toNumber(token?.balance ?? "0");
		// User enters net amount (desired receive). Gross = net / (1 - composerFeePPM/1M).
		const affordableBalance = calcAffordableBalance(balance, composerFeePPM);

		const queueMaxAmount = redemptionQueue.data?.maxAmountXRP != null
			? Number(redemptionQueue.data.maxAmountXRP)
			: undefined;

		const effectiveMax =
			queueMaxAmount !== undefined
				? Math.min(affordableBalance, queueMaxAmount)
				: affordableBalance;

		const inputDescription =
			queueMaxAmount !== undefined && queueMaxAmount < affordableBalance
				? t("redeem_modal.form.current_max_redeemable_label", {
						amount: formatInputAmount(queueMaxAmount, token.decimals ?? 2),
						token: token.type,
					})
				: t("redeem_modal.form.balance_amount_label", {
						balance: formatNumber(
							Math.floor(toNumber(token?.balance ?? "0") * 100) / 100,
						),
						token: token.type,
					});
		const totalToBridge = amount ? calcTotalToBridge(amount, composerFeePPM) : undefined;
		const redeemingFeeAmount = amount ? calcRedeemingFee(amount, redemptionFeeBips) : undefined;

		const receivedAmount =
			amount && redeemingFeeAmount !== undefined
				? amount - redeemingFeeAmount
				: undefined;

		// Total FXRP fee = composer fee + redemption fee
		const totalFeeAmount =
			totalToBridge !== undefined && receivedAmount !== undefined
				? totalToBridge - receivedAmount
				: undefined;

		// TODO: replace with redemptionFee.data.minimumRedeemAmountUBA once confirmed by backend
		const MIN_BRIDGE_AMOUNT = 5;

		const schema = yup.object().shape({
			amount: yup
				.number()
				.required(
					t("validation.messages.required", {
						field: t("bridge_modal.form.amount_label"),
					}),
				)
				.min(1),
			destinationAddress: yup
				.string()
				.trim()
				.required(
					t("validation.messages.required", { field: "Destination Address" }),
				)
				.test(
					"is-valid-address",
					"You need to enter valid XRPL destination address.",
					(value) => {
						if (!value) return true;
						return isValidClassicAddress(value);
					},
				),
		});

		const form = useForm({
			mode: "controlled",
			initialValues: {
				amount: undefined,
				fee: undefined,
				type: BRIDGE_TYPE.XRPL,
				destinationAddress: "",
				destinationTag: "" as string | number,
				executorFee: undefined,
				composerFeePPM: undefined,
			},
			validate: yupResolver(schema),
			onValuesChange: (values: any) => {
				// if (values?.lots?.length === 0) {
				// 	form.setFieldValue("lots", undefined);
				// }
			},
		});

		form.watch("amount", ({ value }) => {
			debounceSetAmount(value as number | undefined);
		});
		form.watch("destinationAddress", ({ value }) => {
			const address = value as string;
			destinationAddressRef.current = address;
			if (onDestinationAddressChange) {
				if(address && isValidClassicAddress(address)){
				onDestinationAddressChange(address);} 
				else {
				onDestinationAddressChange('')
			}
			} 
		});
		form.watch("destinationTag", ({ value }) => {
			if (onDestinationTagChange) {
				onDestinationTagChange(value != null && value !== "" ? String(value): "");
			}
		});

		useImperativeHandle(ref, () => ({ form: () => form }));

		useEffect(() => {
			if (isFormDisabled) isFormDisabled(true);
		}, []);

		useEffect(() => {
			if (!redemptionFees.data) return;
			form.setFieldValue("executorFee", redemptionFees.data.executorFee);
			form.setFieldValue("composerFeePPM", redemptionFees.data.composerFeePPM);
		}, [redemptionFees.data]);

		useEffect(() => {
			if (!connectedXrplCoin?.address) return;
			const currentAddress = form.getValues().destinationAddress;
			if (!currentAddress) {
				form.setFieldValue("destinationAddress", connectedXrplCoin.address);
				destinationAddressRef.current = connectedXrplCoin.address;
				if (
					onDestinationAddressChange &&
					isValidClassicAddress(connectedXrplCoin.address)
				) {
					onDestinationAddressChange(connectedXrplCoin.address);
				}
			}
		}, [connectedXrplCoin?.address]);

		useEffect(() => {
			if (!fee || !hypeBalance.data) return;
			const hypeBalanceFormatted = formatUnit(hypeBalance.data, 18);
			if (toNumber(hypeBalanceFormatted) < toNumber(fee)) {
				onError(
					t("bridge_modal.error_insufficient_balance_label", {
						tokenName: CoinEnum.HYPE,
					}),
				);
				if (isFormDisabled) isFormDisabled(true);
			} else {
				onError(undefined);
			}
		}, [fee, hypeBalance]);

		useEffect(() => {
			if (!redemptionFees.data) return;
			// User must have enough to cover minimum net amount after composer fee deduction
			const insufficient = affordableBalance < MIN_BRIDGE_AMOUNT;
			hasInsufficientBalance.current = insufficient;
			onFormAlert(
				insufficient
					? {
						msg: t("redeem_modal.form.insufficient_balance_label"),
						type: "info",
					}
					: undefined,
			);
			if (insufficient && isFormDisabled) isFormDisabled(true);
		}, [redemptionFees.data, balance]);

		const debounceSetAmount = useDebouncedCallback(async (value) => {
			setAmount(value);

			if (!value || typeof value !== "number" || isNaN(value)) {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					if (!hasInsufficientBalance.current) onFormAlert(undefined);
				}
				if (isFormDisabled) isFormDisabled(true);
				return;
			}

			if (value > 0 && value < MIN_BRIDGE_AMOUNT) {
				hasMinAmountError.current = true;
				onFormAlert({
					msg: t("redeem_modal.form.min_amount_error", {
						min: MIN_BRIDGE_AMOUNT,
						coinName: token.type,
					}),
					type: "info",
				});
				if (isFormDisabled) isFormDisabled(true);
			} else {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					if (!hasInsufficientBalance.current) onFormAlert(undefined);
				}
				if (isFormDisabled) isFormDisabled(hasInsufficientBalance.current);
			}

			if (!redemptionFees.data) return;


			try {
				const quoteFee = await qouteSend.mutateAsync({
					amount: parseUnits(value, 6).toString(),
					bridgeType: BRIDGE_TYPE.XRPL,
					executorFee: redemptionFees.data?.executorFee,
					composerFeePPM: redemptionFees.data?.composerFeePPM,
					destinationAddress: destinationAddressRef.current || undefined,
					destinationTag: Number(form.getValues().destinationTag) || undefined,
				});
				setFee(formatUnit(quoteFee, 18));
				form.setFieldValue("fee", quoteFee);
			} catch (error) {
				const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
				const decodedError = await errorDecoder.decode(error);
				showErrorNotification(decodedError.reason as string);
			}
		}, 500);

		//Render
		const isInitialLoading =
			redemptionFees.isPending || redemptionFee.isPending;

		return (
			<div style={{ position: "relative" }}>
				<LoadingOverlay visible={isInitialLoading} />
				<Text className="text-24 mb-5" fw={300} c="var(--flr-black)">
					{t("bridge_modal.form.amount_step_title")}
				</Text>
				<AmountInput
					autoFocus
					key={form.key("amount")}
					description={inputDescription}
					form={form}
					fAssetCoin={token}
					maxAmount={effectiveMax}
				/>

				{/* Amount conversion preview */}
				<div className="flex items-center mb-10 justify-between mt-10 sm:w-[80%]">
					<div className="flex items-center">
						{token?.icon && token.icon({ width: "32", height: "32" })}
						<Text fw={500} c="var(--flr-black)" className="text-18 mx-2">
							{formatNumber(totalToBridge ?? 0)}
						</Text>
						<Text fw={400} c="var(--flr-gray)" className="text-18">
							{token?.type}
						</Text>
					</div>
					<IconArrowNarrowRight size={20} />
					<div className="flex items-center">
						<XrpIcon width="32" height="32" />
						<Text fw={500} c="var(--flr-black)" className="text-18 mx-2">
							{formatNumber(receivedAmount ?? 0)}
						</Text>
						<Text fw={400} c="var(--flr-gray)" className="text-18">
							XRP
						</Text>
					</div>
				</div>

				<ModalDivider />

				{/* Destination address */}
				<DestinationAddressField
					label={t("bridge_modal.form.destination_address_label")}
					editAddress={editAddress}
					editButtonLabel={t("bridge_modal.form.edit_button")}
					onEdit={() => setEditAddress(true)}
					inputProps={form.getInputProps("destinationAddress")}
					inputKey={form.key("destinationAddress")}
					readOnlyValue={
						connectedXrplCoin?.address ??
						(form.getValues().destinationAddress as string)
					}
					onPaste={(text) => form.setFieldValue("destinationAddress", text)}
					containerClassName="flex items-center mt-5"
					labelClassName="text-12 uppercase"
					inputClassName="mt-1"
					valueClassName="text-14 mt-1"
					editButtonClassName="ml-5 md:ml-8"
					destinationTagLabel={t("bridge_modal.form.destination_tag_label")}
					destinationTagInputProps={form.getInputProps("destinationTag")}
					maxTagLength={10}
					destinationTagInputKey={form.key("destinationTag")}
					destinationTagReadOnlyValue={
						form.getValues().destinationTag as string
					}
				/>

				{/* Fees section */}
				<Divider
					className="my-8"
					styles={{
						root: {
							marginLeft: mediaQueryMatches ? "-1rem" : "-2.75rem",
							marginRight: mediaQueryMatches ? "-1rem" : "-2.75rem",
						},
					}}
				/>
				<Text fw={400} c="var(--flr-gray)" className="text-12 mb-1 uppercase">
					{t("bridge_modal.form.fees_label")}
				</Text>
				<div className="flex justify-between">
					<Text className="text-16" fw={400} c="var(--flr-black)">
						{t("bridge_modal.form.cross_chain_fee_label")}
					</Text>
					<div className="flex items-center">
						{bridgeToken?.nativeIcon &&
							bridgeToken.nativeIcon({ width: "18", height: "18" })}
						<Text className="text-16 mx-2" fw={400} c="var(--flr-black)">
							{qouteSend.isPending ? (
								<Loader size={14} />
							) : fee ? (
								formatNumber(fee, 4)
							) : (
								<span>&mdash;</span>
							)}
						</Text>
						<Text c="var(--flr-gray)" fw={400} className="text-16 w-12">
							{HYPE.type}
						</Text>
					</div>
				</div>
				<div className="flex justify-between mt-2">
					<Text className="text-16" fw={400} c="var(--flr-black)">
						{t("bridge_modal.form.redemption_fee_label")}
					</Text>
					<div className="flex items-center">
						{token?.icon && token.icon({ width: "18", height: "18" })}
						<Text className="text-16 mx-2" fw={400} c="var(--flr-black)">
							{totalFeeAmount && totalFeeAmount > 0 ? formatNumber(totalFeeAmount, 4) : <span>&mdash;</span>}
						</Text>
						<Text c="var(--flr-gray)" fw={400} className="text-16 w-12">
							{token?.type}
						</Text>
					</div>
				</div>
			</div>
		);
	},
);

BridgeXrplForm.displayName = "BridgeXrplForm";
export default BridgeXrplForm;
