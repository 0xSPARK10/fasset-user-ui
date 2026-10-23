import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { ICoin } from "@/types";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import {
	formatNumber,
	formatUnit,
	parseDestinationTag,
	parseUnits,
	roundDownToDecimals,
	toNumber,
} from "@/utils";
import { Fees, formatInputAmount } from "@/core/fees";
import { useDebouncedCallback } from "@mantine/hooks";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeQouteSend, useHypeBalance } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";
import { BRIDGE_CHAIN } from "@/constants";
import { BRIDGE_GAS_COIN } from "@/config/coin";
import { FEE_TOKEN_CHAIN } from "@/config/bridge";
import { BridgeConfig } from "@/components/modals/BridgeModal";
import { useRedemptionFees } from "@/api/oft";
import { useRedemptionFee, useRedemptionQueue } from "@/api/redemption";
import { isValidClassicAddress } from "xrpl";
import { IAlertMessage } from "@/components/elements/FormAlert";
import { useBridgeXrplFees } from "@/hooks/fees/useBridgeXrplFees";

// TODO: replace with redemptionFee.data.minimumRedeemAmountUBA once confirmed by backend
const MIN_BRIDGE_AMOUNT = 5;

interface UseBridgeXrplFormParams {
	token: ICoin;
	bridgeConfig: BridgeConfig;
	/** LayerZero eid of the source chain — used to query redemption/executor fees. */
	srcEid: number;
	onError: (error: string | undefined) => void;
	onFormAlert: (alert?: IAlertMessage) => void;
	onDestinationAddressChange?: (address: string) => void;
	onDestinationTagChange?: (tag: string) => void;
	isFormDisabled?: (status: boolean) => void;
}

export function useBridgeXrplForm({
	token,
	bridgeConfig,
	srcEid,
	onError,
	onFormAlert,
	onDestinationAddressChange,
	onDestinationTagChange,
	isFormDisabled,
}: UseBridgeXrplFormParams) {
	const { t } = useTranslation();
	const { mainToken, getConnectedCoin } = useWeb3();

	const qouteSend = useBridgeQouteSend();
	// feeTokenKey → the chain the LayerZero nativeFee is paid on.
	// undefined = the route originates on Flare, so the fee comes from mainToken.
	const feeChain = FEE_TOKEN_CHAIN[bridgeConfig.feeTokenKey];
	const feeCoin = feeChain ? BRIDGE_GAS_COIN[feeChain] : mainToken;
	const hypeBalance = useHypeBalance(true, feeChain ?? BRIDGE_CHAIN.HYPER_EVM);
	const redemptionFees = useRedemptionFees(srcEid, true);
	const redemptionFee = useRedemptionFee(token.type, true);
	const redemptionQueue = useRedemptionQueue(token.type, true);

	const [amount, setAmount] = useState<number>();
	const [fee, setFee] = useState<string>();

	const connectedXrplCoin = getConnectedCoin(token.type);
	const hasXrplAddress = !!connectedXrplCoin?.address;
	const [editAddress, setEditAddress] = useState<boolean>(!hasXrplAddress);

	const composerFeePPM = Number(redemptionFees.data?.composerFeePPM ?? "0");
	const redemptionFeeBips = toNumber(redemptionFee?.data?.redemptionFee ?? "0");

	const balance = toNumber(token?.balance ?? "0");
	// User enters net amount (desired receive). Gross = net / (1 - composerFeePPM/1M).
	const affordableBalance =
		composerFeePPM > 0
			? roundDownToDecimals(Fees.affordableNet(balance, composerFeePPM), 2)
			: balance;

	const queueMaxAmount =
		redemptionQueue.data?.maxAmountXRP != null
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

	const totalToBridge = amount
		? Fees.totalToBridge(amount, composerFeePPM)
		: undefined;
	const redeemingFeeAmount = amount
		? Fees.redeemingFee(amount, redemptionFeeBips)
		: undefined;
	const receivedAmount =
		amount && redeemingFeeAmount !== undefined
			? amount - redeemingFeeAmount
			: undefined;
	// Total FXRP fee = composer fee + redemption fee
	const totalFeeAmount =
		totalToBridge !== undefined && receivedAmount !== undefined
			? totalToBridge - receivedAmount
			: undefined;
	const feeItems = useBridgeXrplFees({
		feeCoin,
		fee,
		isLoading: qouteSend.isPending,
		totalFeeAmount,
	});

	// --- Derived validation (pure) — replaces effects #1/#4/#5 and the two state refs ---
	const minAmountError =
		amount != null && amount > 0 && amount < MIN_BRIDGE_AMOUNT;
	const insufficientBalance =
		!!redemptionFees.data && affordableBalance < MIN_BRIDGE_AMOUNT;
	// HYPE balance still loading → block silently (no error); matches old effect.
	const hypeLoading = fee != null && hypeBalance.data === undefined;
	const insufficientHype =
		fee != null &&
		hypeBalance.data !== undefined &&
		toNumber(formatUnit(hypeBalance.data, 18)) < toNumber(fee);
	// Form is usable only once the latest quote succeeded. Using isSuccess (not
	// !isPending) keeps it disabled after a failed re-quote, matching the original.
	const quoteReady = qouteSend.isSuccess && fee != null;

	const reportError = insufficientHype
		? t("bridge_modal.error_insufficient_balance_label", {
				tokenName: feeCoin?.type,
			})
		: undefined;
	// Precedence: insufficient balance wins over min-amount (matches old ref logic).
	const reportAlert: IAlertMessage | undefined = insufficientBalance
		? { msg: t("redeem_modal.form.insufficient_balance_label"), type: "info" }
		: minAmountError
			? {
					msg: t("redeem_modal.form.min_amount_error", {
						min: MIN_BRIDGE_AMOUNT,
						coinName: token.type,
					}),
					type: "info",
				}
			: undefined;
	const isDisabled =
		!amount ||
		!redemptionFees.data ||
		!quoteReady ||
		hypeLoading ||
		insufficientHype ||
		insufficientBalance ||
		minAmountError;

	const schema = yup.object().shape({
		amount: yup
			.number()
			.required(
				t("validation.messages.required", {
					field: t("bridge_modal.form.amount_label"),
				}),
			)
			.min(
				MIN_BRIDGE_AMOUNT,
				t("redeem_modal.form.min_amount_error", {
					min: MIN_BRIDGE_AMOUNT,
					coinName: token.type,
				}),
			),
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
		destinationTag: yup
			.string()
			.test(
				"valid-destination-tag",
				t("redeem_modal.form.destination_tag_invalid") as string,
				(value) => {
					if (!value || value.trim() === "") return true;
					const num = Number(value.trim());
					return Number.isInteger(num) && num >= 0 && num <= 4294967295;
				},
			),
	});

	const form = useForm({
		mode: "controlled",
		initialValues: {
			amount: undefined,
			fee: undefined,
			type: bridgeConfig.type,
			destinationAddress: "",
			destinationTag: "" as string | number,
			executorFee: undefined as string | undefined,
			composerFeePPM: undefined as string | undefined,
		},
		validate: yupResolver(schema),
	});

	form.watch("amount", ({ value }) => {
		debounceFetchQuote(value as number | undefined);
	});
	form.watch("destinationAddress", ({ value }) => {
		const address = value as string;
		// Drop a stale submit-channel error ("enter a valid XRPL address") as soon as the
		// user edits the field. Mirrors the destinationTag effect in BridgeModal, which
		// the address field never had — without this, Next stays disabled and the old
		// error stays on screen until the modal is closed and reopened.
		onError(undefined);
		if (onDestinationAddressChange) {
			if (address && isValidClassicAddress(address)) {
				onDestinationAddressChange(address);
			} else {
				onDestinationAddressChange("");
			}
		}
	});
	form.watch("destinationTag", ({ value }) => {
		if (onDestinationTagChange) {
			onDestinationTagChange(value != null && value !== "" ? String(value) : "");
		}
	});

	// Sync server fee params into the form so ConfirmStepper can read them.
	useEffect(() => {
		if (!redemptionFees.data) return;
		form.setFieldValue("executorFee", redemptionFees.data.executorFee);
		form.setFieldValue("composerFeePPM", redemptionFees.data.composerFeePPM);
	}, [redemptionFees.data]);

	// Auto-fill destination address from the connected XRPL wallet (once).
	useEffect(() => {
		if (!connectedXrplCoin?.address) return;
		const currentAddress = form.getValues().destinationAddress;
		if (!currentAddress) {
			form.setFieldValue("destinationAddress", connectedXrplCoin.address);
			if (
				onDestinationAddressChange &&
				isValidClassicAddress(connectedXrplCoin.address)
			) {
				onDestinationAddressChange(connectedXrplCoin.address);
			}
		}
	}, [connectedXrplCoin?.address]);

	// Single channel for reporting derived validation up to the parent.
	// (React: parent callbacks must not be called during render.)
	useEffect(() => {
		onError(reportError);
		onFormAlert(reportAlert);
		isFormDisabled?.(isDisabled);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reportError, reportAlert?.msg, isDisabled]);

	const debounceFetchQuote = useDebouncedCallback(async (value) => {
		setAmount(value);
		if (!value || !redemptionFees.data) {
			setFee(undefined);
			form.setFieldValue("fee", undefined);
			return;
		}
		try {
			const quoteFee = await qouteSend.mutateAsync({
				amount: parseUnits(value, 6).toString(),
				bridgeType: bridgeConfig.type,
				executorFee: redemptionFees.data.executorFee,
				composerFeePPM: redemptionFees.data.composerFeePPM,
				destinationAddress: form.getValues().destinationAddress || undefined,
				destinationTag: parseDestinationTag(form.getValues().destinationTag),
			});
			setFee(formatUnit(quoteFee, 18));
			form.setFieldValue("fee", quoteFee);
		} catch (error: any) {
			const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
			const decodedError = await errorDecoder.decode(error);
			showErrorNotification(
				error?.error?.message ||
					decodedError.reason ||
					(error as Error)?.message,
			);
		}
	}, 500);

	const isInitialLoading = redemptionFees.isPending || redemptionFee.isPending;

	return {
		form,
		connectedXrplCoin,
		editAddress,
		setEditAddress,
		inputDescription,
		effectiveMax,
		totalToBridge,
		receivedAmount,
		feeItems,
		isInitialLoading,
	};
}
