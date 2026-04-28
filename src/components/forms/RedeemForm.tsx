import {
	useState,
	forwardRef,
	useImperativeHandle,
	useEffect,
	useRef,
} from "react";
import { UseFormReturnType, useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import {
	useDebouncedCallback,
	useElementSize,
	useMediaQuery,
} from "@mantine/hooks";
import { Text, Divider } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useRedemptionFee, useRedemptionQueue } from "@/api/redemption";
import { useNativeBalance } from "@/api/balance";
import { useDirectMintingExecutor } from "@/api/user";
import { toNumber, formatNumber } from "@/utils";
import { formatFeeAmount, formatInputAmount } from "@/core/fees/format";
import { IFAssetCoin } from "@/types";
import { useWeb3 } from "@/hooks/useWeb3";
import { isValidClassicAddress } from "xrpl";
import DestinationAddressField from "@/components/elements/DestinationAddressField";
import AmountInput from "@/components/elements/AmountInput";
import { IAlertMessage } from "@/components/elements/FormAlert";

interface IRedeemForm {
	fAssetCoin: IFAssetCoin;
	setErrorMessage: (message: string) => void;
	onFormAlert?: (alert?: IAlertMessage) => void;
	onDestinationAddressChange?: (address: string) => void;
	onDestinationTagChange?: (tag: string) => void;
	supportsDestinationTag?: boolean;
	isFormDisabled?: (status: boolean) => void;
}

export type FormRef = {
	form: () => UseFormReturnType<any>;
};

const RedeemForm = forwardRef<FormRef, IRedeemForm>(
	(
		{
			fAssetCoin,
			setErrorMessage,
			onFormAlert,
			onDestinationAddressChange,
			onDestinationTagChange,
			supportsDestinationTag = false,
			isFormDisabled,
		}: IRedeemForm,
		ref,
	) => {
		const [amount, setAmount] = useState<number>();
		const [maxAmount, setMaxAmount] = useState<number>();
		const [redeemingFee, setRedeemingFee] = useState<number>();
		const [deposit, setDeposit] = useState<number>();
		const [inputDescription, setInputDescription] = useState<string>();
		const [editAddress, setEditAddress] = useState<boolean>(
			!fAssetCoin.enabled,
		);

		const maxRedemptionAmount = useRef<number>();
		const maxAmountOneRedemption = useRef<number>();
		const hasInsufficientBalance = useRef(false);
		const hasMinAmountError = useRef(false);

		const { mainToken } = useWeb3();
		const { t } = useTranslation();
		const depositLabelSize = useElementSize();
		const redeemingFeeLabelSize = useElementSize();
		const executorFeeLabelSize = useElementSize();
		const mediaQueryMatches = useMediaQuery("(max-width: 40em)");
		const redemptionFee = useRedemptionFee(fAssetCoin.type);
		const redemptionQueue = useRedemptionQueue(fAssetCoin.type);
		const executor = useDirectMintingExecutor(fAssetCoin.type);
		const nativeBalance = useNativeBalance(mainToken?.address!);

		// minimumRedeemAmountUBA is in UBA (Underlying Base Amount — smallest unit, e.g. XRP drops).
		// XRP has 6 decimal places, so divide by 10^6 to get the human-readable XRP amount.
		const minAmount = redemptionFee.data?.minimumRedeemAmountUBA
			? Number(redemptionFee.data.minimumRedeemAmountUBA) /
				Math.pow(10, fAssetCoin.contractDecimals ?? 6)
			: undefined;

		const queueMaxAmount = redemptionQueue.data?.maxAmountXRP != null
			? Number(redemptionQueue.data.maxAmountXRP)
			: undefined;

		const queueMaxSingleAmount = redemptionQueue.data?.maxAmountOneRedemptionXRP != null
			? Number(redemptionQueue.data.maxAmountOneRedemptionXRP)
			: undefined;

		const schema = yup.object().shape({
			amount: yup.number().required(
				t("validation.messages.required", {
					field: t("redeem_modal.form.amount_label"),
				}),
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
			destinationAddress: yup
				.string()
				.transform((val) => (typeof val === "string" ? val.trim() : val))
				.required(
					t("validation.messages.required", {
						field: t("redeem_modal.form.destination_address_label"),
					}),
				)
				.test(
					"is-valid-address",
					t("redeem_modal.form.invalid_xrp_address_label") as string,
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
				executorAddress: "",
				executorFee: "",
				destinationAddress: fAssetCoin?.address ?? "",
				destinationTag: "",
			},
			validate: yupResolver(schema),
			onValuesChange: (values: any) => {
				if (values?.amount?.length === 0) {
					form.setFieldValue("amount", undefined);
				}
			},
		});

		form.watch("amount", ({ value }) => {
			debounceSetAmount(value);
		});

		form.watch("destinationAddress", ({ value }) => {
			const address = value as string;
			if (onDestinationAddressChange) {
				onDestinationAddressChange(address && isValidClassicAddress(address) ? address : '');
			}
		});

		form.watch("destinationTag", ({ value }) => {
			if (onDestinationTagChange)
				onDestinationTagChange(value != null ? String(value) : "");
		});

		const labelWidth = Math.max(
			depositLabelSize.width,
			redeemingFeeLabelSize.width,
			executorFeeLabelSize.width,
		);

		useImperativeHandle(ref, () => ({
			form: () => form,
		}));

		useEffect(() => {
			if (!nativeBalance.data) return;
			const balance = nativeBalance.data.find(
				(b) => b.symbol.toLowerCase() === fAssetCoin.type.toLowerCase(),
			);
			if (balance) {
				const balanceNum = toNumber(balance.balance);
				const max =
					queueMaxAmount !== undefined
						? Math.min(balanceNum, queueMaxAmount)
						: balanceNum;
				if (fAssetCoin.type.toLowerCase().includes("xrp")) {
					if (queueMaxAmount !== undefined && queueMaxAmount < balanceNum) {
						setInputDescription(
							t("redeem_modal.form.current_max_redeemable_label", {
								amount: formatInputAmount(queueMaxAmount, fAssetCoin.decimals),
								token: fAssetCoin.type,
							}),
						);
					} else {
						setInputDescription(
							t("redeem_modal.form.balance_amount_label", {
								balance: formatNumber(balance.balance, 2),
								token: fAssetCoin.type,
							}),
						);
					}
				}

				setMaxAmount(max);

				if (onFormAlert) {
					const effectiveMin = minAmount ?? fAssetCoin.lotSize;
					const insufficient = balanceNum < effectiveMin;
					hasInsufficientBalance.current = insufficient;
					onFormAlert(
						insufficient
							? {
									msg: t("redeem_modal.form.insufficient_balance_label"),
									type: "info",
								}
							: undefined,
					);
				}
			}
		}, [nativeBalance.data, minAmount, queueMaxAmount]);

		useEffect(() => {
			if (queueMaxSingleAmount !== undefined) {
				maxAmountOneRedemption.current = queueMaxSingleAmount;
			}

			if (queueMaxAmount !== undefined) {
				maxRedemptionAmount.current = queueMaxAmount;
			}
		}, [queueMaxAmount, queueMaxSingleAmount]);

		useEffect(() => {
			if (!executor.data) return;
			form.setValues({
				executorAddress: executor?.data?.executorAddress,
				executorFee: executor?.data?.executorFee,
			});
		}, [executor.data]);

		const debounceSetAmount = useDebouncedCallback(async (value) => {
			setAmount(value);
			const rawAmount = value ?? 0;
			const feeRate =
				toNumber(redemptionFee?.data?.redemptionFee ?? "0") / 10000;
			const fee = rawAmount * feeRate;
			setRedeemingFee(fee);
			setDeposit(rawAmount - fee);

			const effectiveMin = minAmount ?? fAssetCoin.lotSize;

			if (!value || typeof value !== "number" || isNaN(value)) {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					if (!hasInsufficientBalance.current && onFormAlert)
						onFormAlert(undefined);
				}
				if (isFormDisabled) isFormDisabled(true);
			} else if (value > 0 && value < effectiveMin) {
				hasMinAmountError.current = true;
				if (onFormAlert)
					onFormAlert({
						msg: t("redeem_modal.form.min_amount_error", {
							min: effectiveMin,
							coinName: fAssetCoin.type,
						}),
						type: "info",
					});
				if (isFormDisabled) isFormDisabled(true);
			} else if (
				maxAmountOneRedemption.current !== undefined &&
				maxRedemptionAmount.current !== undefined &&
				rawAmount > maxAmountOneRedemption.current &&
				rawAmount < maxRedemptionAmount.current
			) {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					if (!hasInsufficientBalance.current && onFormAlert)
						onFormAlert(undefined);
				}
				setErrorMessage(
					t("redeem_modal.form.single_redemption_limit_error", {
						amount: formatFeeAmount(
							maxAmountOneRedemption.current,
							fAssetCoin.decimals,
						),
						fAsset: fAssetCoin.type,
					}),
				);
				form.setFieldError(
					"amount",
					t("redeem_modal.form.adjust_amount_label"),
				);
				if (isFormDisabled) isFormDisabled(true);
			} else if (
				(maxRedemptionAmount.current !== undefined &&
					rawAmount > maxRedemptionAmount.current) ||
				maxRedemptionAmount.current === 0
			) {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					if (!hasInsufficientBalance.current && onFormAlert)
						onFormAlert(undefined);
				}
				setErrorMessage(
					t("redeem_modal.form.above_max_amount_core_vault_error", {
						amount: formatFeeAmount(
							maxRedemptionAmount.current ?? 0,
							fAssetCoin.decimals,
						),
						fAsset: fAssetCoin.type,
					}),
				);
				form.setFieldError(
					"amount",
					t("redeem_modal.form.adjust_amount_label"),
				);
				if (isFormDisabled) isFormDisabled(true);
			} else {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					if (!hasInsufficientBalance.current && onFormAlert)
						onFormAlert(undefined);
				}
				setErrorMessage("");
				if (isFormDisabled) isFormDisabled(false);
			}
		}, 500);

		return (
			<>
				<AmountInput
					form={form}
					fAssetCoin={fAssetCoin}
					maxAmount={maxAmount}
					autoFocus
					label={
						<Text className="text-12" fw={400} c="var(--flr-gray)">
							{t("redeem_modal.form.amount_label")}
						</Text>
					}
					placeholder={
						minAmount !== undefined ? `min is ${minAmount}` : undefined
					}
					description={
						form.errors?.amount !== undefined ? "" : inputDescription
					}
					onBlur={(value) => {
						const effectiveMin = minAmount ?? fAssetCoin.lotSize;
						if (value > 0 && value < effectiveMin) {
							if (onFormAlert)
								onFormAlert({
									msg: t("redeem_modal.form.min_amount_error", {
										min: effectiveMin,
										coinName: fAssetCoin.type,
									}),
									type: "info",
								});
						}
					}}
					className="mr-0 sm:mr-8 mt-3"
				/>
				<div className="flex items-center mt-2 sm:hidden">
					{fAssetCoin.icon({ width: "24", height: "24" })}
					<Text fw={500} className="text-18 mx-2">
						{amount ?? <span>&mdash;</span>}
					</Text>
					<Text c="var(--flr-gray)" fw={400} className="text-18">
						{fAssetCoin.type}
					</Text>
				</div>
				<Divider
					className="my-8"
					styles={{
						root: {
							marginLeft: mediaQueryMatches ? "-1rem" : "-2.75rem",
							marginRight: mediaQueryMatches ? "-1rem" : "-2.75rem",
						},
					}}
				/>
				<DestinationAddressField
					label={t("redeem_modal.form.destination_address_label")}
					editAddress={editAddress}
					editButtonLabel={t("redeem_modal.form.edit_button")}
					onEdit={() => setEditAddress(true)}
					inputProps={form.getInputProps("destinationAddress")}
					inputKey={form.key("destinationAddress")}
					readOnlyValue={fAssetCoin?.address}
					onPaste={(text) => form.setFieldValue("destinationAddress", text)}
					containerClassName="flex items-center mt-5"
					labelClassName="text-12 uppercase"
					inputClassName="mt-1"
					valueClassName="text-14 mt-1"
					editButtonClassName="ml-5 md:ml-8"
					destinationTagLabel={
						supportsDestinationTag
							? t("redeem_modal.form.destination_tag_label")
							: undefined
					}
					destinationTagInputProps={
						supportsDestinationTag
							? form.getInputProps("destinationTag")
							: undefined
					}
					destinationTagInputKey={
						supportsDestinationTag ? form.key("destinationTag") : undefined
					}
					destinationTagReadOnlyValue={
						supportsDestinationTag
							? (form.getValues().destinationTag as string)
							: undefined
					}
					maxTagLength={10}
				/>
				<Divider
					className="my-8"
					styles={{
						root: {
							marginLeft: mediaQueryMatches ? "-1rem" : "-2.75rem",
							marginRight: mediaQueryMatches ? "-1rem" : "-2.75rem",
						},
					}}
				/>
				<div className="mt-2">
					<Text fw={400} c="var(--flr-gray)" className="mb-1 text-12 uppercase">
						{t("redeem_modal.form.you_will_receive_label")}
					</Text>
					<div className="flex justify-between">
						<Text className="text-16" fw={400}>
							{t("redeem_modal.form.deposit_label")}
						</Text>
						<div className="flex items-center">
							{fAssetCoin.nativeIcon &&
								fAssetCoin.nativeIcon({ width: "16", height: "16" })}
							<Text className="mx-2 text-16" fw={400}>
								{deposit ? (
									// decimals from coin config: BTC=8, XRP=2, etc.
									formatFeeAmount(deposit, fAssetCoin.decimals)
								) : (
									<span>&mdash;</span>
								)}
							</Text>
							<Text
								ref={depositLabelSize.ref}
								className="text-16"
								fw={400}
								c="var(--flr-gray)"
								style={{ width: labelWidth > 0 ? `${labelWidth}px` : "auto" }}
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
						{t("redeem_modal.form.fees_label")}
					</Text>
					<div className="flex justify-between">
						<Text className="text-16" fw={400} c="var(--flr-black)">
							{t("redeem_modal.form.redeeming_fee_label")}
						</Text>
						<div className="flex items-center">
							{fAssetCoin.nativeIcon &&
								fAssetCoin.nativeIcon({ width: "16", height: "16" })}
							<Text className="mx-2 text-16" fw={400}>
								{redeemingFee ? (
									formatFeeAmount(redeemingFee, fAssetCoin.decimals)
								) : (
									<span>&mdash;</span>
								)}
							</Text>
							<Text
								ref={redeemingFeeLabelSize.ref}
								className="text-16"
								fw={400}
								c="var(--flr-gray)"
								style={{ width: labelWidth > 0 ? `${labelWidth}px` : "auto" }}
							>
								{fAssetCoin.nativeName}
							</Text>
						</div>
					</div>
					<div className="flex justify-between mt-2">
						<Text className="text-16" fw={400} c="var(--flr-black)">
							{t("redeem_modal.form.executor_fee_label")}
						</Text>
						<div className="flex items-center">
							{mainToken?.icon !== undefined &&
								mainToken?.icon({ width: "16", height: "16" })}
							<Text className="mx-2 text-16" fw={400}>
								{amount && executor.data ? (
									(
										Number(executor?.data?.executorFee) / 1000000000000000000
									).toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})
								) : (
									<span>&mdash;</span>
								)}
							</Text>
							<Text
								ref={executorFeeLabelSize.ref}
								className="text-16"
								fw={400}
								c="var(--flr-gray)"
								style={{ width: labelWidth > 0 ? `${labelWidth}px` : "auto" }}
							>
								{mainToken?.type}
							</Text>
						</div>
					</div>
				</div>
			</>
		);
	},
);

RedeemForm.displayName = "RedeemForm";
export default RedeemForm;
