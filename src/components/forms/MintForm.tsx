import React, {
	useEffect,
	useState,
	forwardRef,
	useImperativeHandle,
	useRef,
} from "react";
import {
	Divider,
	Loader,
	LoadingOverlay,
	Text,
	FocusTrap,
} from "@mantine/core";
import MintDestinationEditor from "@/components/forms/MintDestinationEditor";
import CryptoJS from "crypto-js";
import { useForm, UseFormReturnType } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import {
	useDebouncedCallback,
	useDebouncedValue,
	useElementSize,
	useMediaQuery,
} from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { toNumber, isZeroAddress } from "@/utils";
import { devLog } from "@/utils/debug";
import { formatInputAmount, formatFeeAmount } from "@/core/fees/format";
import { IFAssetCoin } from "@/types";
import { IAlertMessage } from "@/components/elements/FormAlert";
import AmountInput from "@/components/elements/AmountInput";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUnderlyingBalance } from "@/api/balance";
import { useFassetPrice } from "@/api/user";
import { WALLET } from "@/constants";
import { useDirectMintingInfo, useMintingRecipient, useMintingCapInfo } from "@/api/minting";
import { isAddress } from "ethers";
import { useUserTags } from "@/api/tags";

interface IMintForm {
	isFormDisabled?: (status: boolean) => void;
	fAssetCoin: IFAssetCoin;
	refreshBalance: () => void;
	setHighMintingFee: (fee: number | undefined, transfer?: number) => void;
	onError: (alert?: IAlertMessage) => void;
}

export type FormRef = {
	form: () => UseFormReturnType<any>;
};

const MINTING_FEE_LIMIT = 2;

const MintForm = forwardRef<FormRef, IMintForm>(
	(
		{
			isFormDisabled,
			fAssetCoin,
			refreshBalance,
			setHighMintingFee,
			onError,
		}: IMintForm,
		ref,
	) => {
		const [transfer, setTransfer] = useState<number>();
		const [isLoading, setIsLoading] = useState<boolean>(false);
		const [isDisabled, setIsDisabled] = useState<boolean>(true);
		const [destinationMode, setDestinationMode] = useState<"address" | "tag">(
			"address",
		);
		const hasRun = useRef(false);
		const hasXamanInsufficientFunds = useRef(false);
		const hasMinAmountError = useRef(false);
		const hasMintCapError = useRef(false);
		const [tagForLookup, setTagForLookup] = useState("");

		const { walletConnectConnector, connectedCoins, mainToken } = useWeb3();
		const addressForTagLookup = mainToken?.address ?? "";
		const transferLabelSize = useElementSize();
		const mintingFeeLabelSize = useElementSize();
		const { t } = useTranslation();
		const isMobile = useMediaQuery("(max-width: 640px)");

		const mintingData = useDirectMintingInfo(fAssetCoin.type);
		const mintingCapInfo = useMintingCapInfo(fAssetCoin.type);
		const fAssetPrice = useFassetPrice(fAssetCoin.type, false);

		const connectedCoin = connectedCoins.find(
			(coin) => coin.type == fAssetCoin.type,
		);
		const underlyingBalance = useUnderlyingBalance(
			connectedCoin &&
				connectedCoin.connectedWallet === WALLET.LEDGER &&
				connectedCoin.xpub !== undefined
				? CryptoJS.AES.decrypt(
						connectedCoin.xpub!,
						process.env.XPUB_SECRET!,
					).toString(CryptoJS.enc.Utf8)
				: fAssetCoin?.address!,
			fAssetCoin.type,
			fAssetCoin?.address !== undefined,
			connectedCoin &&
				connectedCoin.connectedWallet === WALLET.LEDGER &&
				connectedCoin.xpub !== undefined,
		);

		const schema = yup.object().shape({
			amount: yup
				.number()
				.required(
					t("validation.messages.required", {
						field: t("mint_modal.form.input_label"),
					}),
				)
				.min(1),
			destinationAddress: yup.string().when("destinationMode", {
				is: "address",
				then: (s) =>
					s
						.required(
							t("validation.messages.required", {
								field: t("mint_modal.form.destination_address_label"),
							}),
						)
						.test(
							"is-valid-address",
							t("validation.messages.invalid_address"),
							(value) => isAddress(value ?? ""),
						),
				otherwise: (s) => s.optional(),
			}),
		});

		const form = useForm({
			mode: "controlled",
			initialValues: {
				amount: undefined,
				destinationAddress: mainToken?.address ?? "",
				destinationTag: "",
				resolvedAddress: "",
				addressTag: "",
				destinationMode: "address" as "address" | "tag",
			},
			validate: yupResolver(schema),
			onValuesChange: (values: any) => {
				if (values?.amount?.length === 0) {
					form.setFieldValue("amount", undefined);
				}
			},
		});

		const [debouncedTag] = useDebouncedValue(tagForLookup, 500);
		const hasValidTransfer =
			typeof transfer === "number" && !Number.isNaN(transfer);

		const recipientQuery = useMintingRecipient(
			fAssetCoin.type,
			debouncedTag,
			debouncedTag.length > 0,
		);

		const tagsByAddressQuery = useUserTags(
			fAssetCoin.type,
			addressForTagLookup,
			addressForTagLookup.length > 0 && isAddress(addressForTagLookup),
		);

		const hasValidAmount = () => {
			const amount = form.getValues().amount;
			return typeof amount === "number" && !Number.isNaN(amount) && amount >= minMintingAmount;
		};

		// Syncs resolvedAddress form field with API result after tag lookup.
		// setFieldValue("resolvedAddress", "") is only called when value is non-empty
		// to avoid Mantine clearing the field error as a side effect.
		useEffect(() => {
			if (destinationMode !== "tag" || !debouncedTag) return;

			if (recipientQuery.data?.recipient && !isZeroAddress(recipientQuery.data.recipient)) {
				form.setFieldValue("resolvedAddress", recipientQuery.data.recipient);
				form.clearFieldError("resolvedAddress");
				if (isFormDisabled) isFormDisabled(!hasValidAmount());
			} else if (!recipientQuery.isFetching) {
				if (form.getValues().resolvedAddress) {
					form.setFieldValue("resolvedAddress", "");
				}
				form.setFieldError(
					"resolvedAddress",
					t("mint_modal.form.tag_no_address_error_label"),
				);
				if (isFormDisabled) isFormDisabled(true);
			}
		}, [recipientQuery.data, recipientQuery.isFetching, debouncedTag, destinationMode]); // eslint-disable-line react-hooks/exhaustive-deps

		// Syncs addressTag form field with the first registered tag found for the destination address.
		// Used to auto-display the tag in address mode (read-only).
		useEffect(() => {
			if (!addressForTagLookup) return;
			const filteredTags = tagsByAddressQuery.data?.filter((tag) => tag.mintingRecipient === addressForTagLookup)
			form.setFieldValue("addressTag", filteredTags?.[0]?.tagId ?? "");
		}, [tagsByAddressQuery.data, addressForTagLookup]); // eslint-disable-line react-hooks/exhaustive-deps

		// Disable Next button while tag is being fetched for the entered address.
		useEffect(() => {
			if (!isFormDisabled) return;
			if (tagsByAddressQuery.isFetching) {
				isFormDisabled(true);
			} else if (destinationMode === "address") {
				const addr = form.getValues().destinationAddress;
				isFormDisabled(!hasValidAmount() || !isAddress(addr ?? "") || hasXamanInsufficientFunds.current);
			}
		}, [tagsByAddressQuery.isFetching]); // eslint-disable-line react-hooks/exhaustive-deps

		form.watch("destinationTag", ({ value }) => {
			setTagForLookup(value as string);
			form.setFieldValue("resolvedAddress", "");
			form.clearFieldError("resolvedAddress");
			if (isFormDisabled) isFormDisabled(true);
		});

		form.watch("destinationMode", ({ value }) => {
			setDestinationMode(value as "address" | "tag");
			if (value === "address") {
				const addr = form.getValues().destinationAddress;
				if (isFormDisabled)
					isFormDisabled(
						!hasValidAmount() || !isAddress(addr ?? "") || hasXamanInsufficientFunds.current,
					);
			} else {
				const resolvedAddress = form.getValues().resolvedAddress;
				if (isFormDisabled) isFormDisabled(!hasValidAmount() || !resolvedAddress);
			}
		});

		form.watch("destinationAddress", ({ value }) => {
			if (form.getValues().destinationMode !== "address") return;
			if (value !== (mainToken?.address ?? "")) {
				form.setFieldValue("addressTag", "");
			}
			if (isFormDisabled)
				isFormDisabled(
					!hasValidAmount() || !isAddress(value ?? "") || hasXamanInsufficientFunds.current,
				);
		});

		const feeRate = Number(mintingData.data?.mintingFeeBIPS ?? 0) / 10000;
		const minimumMintingFee =
			Number(mintingData.data?.minimumMintingFeeUBA ?? 0) / 10 ** 6;
		// TODO: use API value once backend returns minMintingAmount
		// const minMintingAmount =
		// 	Number(mintingData.data?.minMintingAmount ?? 0) / 10 ** 6;
		const minMintingAmount = 10;
		const executorFee =
			Number(mintingData.data?.fassetsExecutorFee ?? 0) / 10 ** 6;

		// Fee model (MIGRATION_v1.3.md):
		//   systemFee    = max(totalSend × feeRate, minimumMintingFee)
		//   totalSend    = transfer + systemFee + executorFee
		//
		// Solving for systemFee when percentage case applies (systemFee = totalSend × feeRate):
		//   totalSend = transfer + totalSend × feeRate + executorFee
		//   totalSend × (1 − feeRate) = transfer + executorFee
		//   totalSend = (transfer + executorFee) / (1 − feeRate)
		//   systemFee = totalSend − transfer − executorFee
		//             = (transfer + executorFee) × feeRate / (1 − feeRate)
		//
		// effectiveMax: largest transfer that fits in availableToSpend = rawBalance − minWalletBalance − executorFee
		//   percentage case: transfer = (availableToSpend + executorFee) × (1 − feeRate) − executorFee
		//   flat-fee  case:  transfer = availableToSpend − minimumMintingFee
		//   threshold between cases: transfer where percentage fee = minimumMintingFee
		//     → transfer_threshold = minimumMintingFee / feeRate (before fee correction)
		//
		// required = minMintingAmount + minFee + executorFee + minWalletBalance
		//   minFee  = max((minMintingAmount + executorFee) × feeRate / (1 − feeRate), minimumMintingFee)
		const percentageMintingFee =
			hasValidTransfer ? (transfer + executorFee) * feeRate / (1 - feeRate) : undefined;
		const mintingFee =
			hasValidTransfer
				? Math.max(percentageMintingFee ?? 0, minimumMintingFee)
				: undefined;
		const totalFees =
			hasValidTransfer && mintingFee !== undefined
				? mintingFee + executorFee
				: undefined;
		const totalSend =
			hasValidTransfer && mintingFee !== undefined
				? transfer + mintingFee + executorFee
				: undefined;
		const mintFeePercentage =
			mintingFee !== undefined && hasValidTransfer && transfer !== 0
				? (mintingFee / transfer) * 100
				: 0;
		const isMintingFeeHigh = mintFeePercentage > MINTING_FEE_LIMIT;

		const rawBalance = toNumber(underlyingBalance.data?.balance ?? "0");
		const minFee = Math.max((minMintingAmount + executorFee) * feeRate / (1 - feeRate), minimumMintingFee);
		const required =
			minMintingAmount +
			minFee +
			executorFee +
			fAssetCoin.minWalletBalance;
		const availableToSpend =
			rawBalance - fAssetCoin.minWalletBalance - executorFee;
		const mintingFeeThreshold =
			feeRate > 0 ? minimumMintingFee / feeRate : Number.POSITIVE_INFINITY;
		const effectiveMax =
			availableToSpend <= 0
				? 0
				: availableToSpend <= mintingFeeThreshold + minimumMintingFee
					? Math.max(availableToSpend - minimumMintingFee, 0)
					: (availableToSpend + executorFee) * (1 - feeRate) - executorFee
		const hasMintCap =
			mintingCapInfo.data !== undefined &&
			mintingCapInfo.data.mintingCap !== "0";
		const mintCapRemaining = hasMintCap
			? Number(BigInt(mintingCapInfo.data!.mintingCap) - BigInt(mintingCapInfo.data!.totalSupply)) / 1e6
			: Infinity;
		const isMintCapReached = hasMintCap && mintCapRemaining <= 0;

		const maxAmount = (() => {
			if (underlyingBalance.data?.balance == null) return undefined;
			if (rawBalance < required) return 0;
			if (!hasMintCap) return effectiveMax;
			const capped = Math.min(effectiveMax, Math.max(mintCapRemaining, 0));
			if (capped < effectiveMax) {
				devLog(`[MintCap] Max reduced for ${fAssetCoin.type}: ${effectiveMax} → ${capped} (cap remaining: ${mintCapRemaining})`);
			}
			return capped;
		})();


		const inputDescription = `${t("mint_modal.form.lots_limit_label", {
			nativeName: fAssetCoin.nativeName,
			value:
				maxAmount !== undefined
					? formatInputAmount(maxAmount, 0)
					: 0,
			tokenName: fAssetCoin.type,
		})}`;

		const labelWidth = Math.max(
			transferLabelSize.width,
			mintingFeeLabelSize.width,
		);

		useEffect(() => {
			if (mintingCapInfo.isLoading) return;
			if (isMintCapReached) {
				devLog(`[MintCap] Cap reached for ${fAssetCoin.type} — minting disabled`);
				hasMintCapError.current = true;
				setTransfer(undefined);
				onError({ msg: t("mint_modal.form.mint_cap_reached"), type: 'info' });
				if (isFormDisabled) isFormDisabled(true);
			} else if (hasMintCapError.current) {
				hasMintCapError.current = false;
				if (!hasMinAmountError.current) {
					onError();
				}
			}
		}, [isMintCapReached, mintingCapInfo.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

		const debounceSetAmount = useDebouncedCallback(async (value) => {
			if (hasMintCapError.current) return;
			if (
				value === undefined ||
				value === null ||
				value === "" ||
				typeof value !== "number" ||
				Number.isNaN(value)
			) {
				setTransfer(undefined);
				if (isFormDisabled) isFormDisabled(true);
				return;
			}
			setTransfer(value);
			if (value > 0 && value < minMintingAmount) {
				hasMinAmountError.current = true;
				if (isFormDisabled) isFormDisabled(true);
				onError({
					msg: t("mint_modal.form.min_amount_label", {
						lotSize: minMintingAmount,
						valueToken: fAssetCoin.nativeName,
					}),
					type: "info",
				});
			} else {
				if (hasMinAmountError.current) {
					hasMinAmountError.current = false;
					onError();
				}
				const mode = form.getValues().destinationMode;
				const addr = form.getValues().destinationAddress;
				const resolvedAddress = form.getValues().resolvedAddress;
				const addressOk = mode === "address" ? isAddress(addr ?? "") : !!resolvedAddress;
				if (isFormDisabled) isFormDisabled(!addressOk || hasXamanInsufficientFunds.current || hasMintCapError.current);
			}
		}, 500);

		const checkXamanBalance = async () => {
			const response = await fAssetPrice.refetch();
			hasXamanInsufficientFunds.current = false;
			onError();

			if (response.data?.price && transfer) {
				const balance = toNumber(underlyingBalance.data?.balance!);
				let totalUsd = response.data.price * (totalSend ?? 0);
				let xamanFee = 0;

				if (totalUsd > 50000 && totalUsd <= 100000) {
					xamanFee = totalUsd * 0.001;
				} else if (totalUsd > 100000) {
					xamanFee = totalUsd * 0.0007;
				}

				totalUsd += xamanFee;
				const totalXrp = totalUsd / response.data.price;

				if (
					isFormDisabled &&
					totalXrp > balance - fAssetCoin.minWalletBalance
				) {
					isFormDisabled(true);
					hasXamanInsufficientFunds.current = true;
					onError({
						msg: t("mint_modal.form.error_insufficient_balance_label", {
							tokenName: "XRP",
						}),
					});
				}
			}
		};

		// Notifies parent when minting fee exceeds threshold so it can show a warning.
		// Also checks Xaman wallet balance since Xaman adds its own fee on top.
		useEffect(() => {
			if (mintingFee === undefined || mintingData.isPending) return;
			if (transfer === undefined || (minMintingAmount > 0 && transfer < minMintingAmount)) {
				setHighMintingFee(undefined);
				return;
			}
			if (isMintingFeeHigh) {
				setHighMintingFee(mintingFee, transfer);
			} else {
				setHighMintingFee(undefined);
			}

			if (fAssetCoin?.connectedWallet === WALLET.XAMAN) {
				checkXamanBalance();
			}
		}, [mintingFee, isMintingFeeHigh]); // eslint-disable-line react-hooks/exhaustive-deps

		// Shows an error and disables the form if the user's underlying balance
		// is below the minimum required to cover amount + fees + wallet reserve.
		// hasBalanceError ref prevents clearing the error on every re-render.
		const hasBalanceError = useRef(false);
		useEffect(() => {
			if (!underlyingBalance.data?.balance || !mintingData.data) return;

			if (rawBalance < required) {
				hasBalanceError.current = true;
				onError({
					msg: t(
						"mint_modal.form.error_insufficient_balance_amount_is_needed_label",
						{ value: formatFeeAmount(required, fAssetCoin.decimals), tokenName: fAssetCoin.nativeName },
					),
				});
				if (isFormDisabled) isFormDisabled(true);
			} else if (hasBalanceError.current) {
				hasBalanceError.current = false;
				onError();
			}
		}, [underlyingBalance.data, mintingData.data]); // eslint-disable-line react-hooks/exhaustive-deps

		// Runs once when underlying balance data first arrives.
		// For Ledger/UTXO wallets (balance === null): fetches UTXO addresses via WalletConnect.
		// For standard wallets: just unlocks the form.
		// hasRun ref prevents re-triggering on subsequent balance refreshes.
		useEffect(() => {
			if (!underlyingBalance.data || hasRun.current) return;

			const fetch = async () => {
				try {
					setIsDisabled(false);
					setIsLoading(true);

					if (underlyingBalance.data.balance === null) {
						await walletConnectConnector.fetchUtxoAddresses(
							fAssetCoin.network.namespace,
							fAssetCoin.network.chainId,
							fAssetCoin.address!,
						);
						return;
					}

					hasRun.current = true;
				} catch (error: any) {
					if (error.code === 4001) {
						refreshBalance();
					}
				} finally {
					setIsLoading(false);
				}
			};

			fetch();
		}, [underlyingBalance.data]); // eslint-disable-line react-hooks/exhaustive-deps

		useImperativeHandle(ref, () => ({
			form: () => form,
		}));

		form.watch("amount", ({ value }) => {
			debounceSetAmount(value);
		});

		return (
			<div>
				<LoadingOverlay visible={isLoading || underlyingBalance.isPending || mintingData.isPending} />
				<FocusTrap active={true}>
					<AmountInput
						form={form}
						autoFocus
						fAssetCoin={fAssetCoin}
						maxAmount={underlyingBalance.isPending ? undefined : isMintCapReached ? 0 : maxAmount}
						allowDecimal={false}
						placeholder={mintingData.data ? `min is ${minMintingAmount}` : undefined}
						description={
							underlyingBalance.isPending || isLoading
								? t("mint_modal.form.lots_waiting_balance_label", {
										coin: fAssetCoin.nativeName,
									})
								: isDisabled
									? ""
									: inputDescription
						}
						disabled={isDisabled}
						readOnly={isMintCapReached}
						onBlur={(value) => {
							if (hasMintCapError.current || hasBalanceError.current || hasXamanInsufficientFunds.current) return;
							if (value && minMintingAmount > 0 && value < minMintingAmount) {
								onError({
									msg: t("mint_modal.form.min_amount_label", {
										lotSize: minMintingAmount,
										valueToken: fAssetCoin.nativeName,
									}),
									type: "info",
								});
							} else {
								onError();
							}
						}}
					/>
				</FocusTrap>
				<div className="flex items-center mt-2 sm:hidden">
					{fAssetCoin.icon({ width: "30", height: "30" })}
					<Text fw={500} className="text-18 mx-2">
						{transfer ? (
							formatFeeAmount(transfer, fAssetCoin.decimals)
						) : (
							<span>&mdash;</span>
						)}
					</Text>
					<Text c="var(--flr-gray)" fw={400} className="text-18">
						{fAssetCoin.symbol}
					</Text>
				</div>
				<Divider
					className="my-8"
					styles={{
						root: {
							marginLeft: isMobile ? "-1rem" : "-2.75rem",
							marginRight: isMobile ? "-1rem" : "-2.75rem",
						},
					}}
				/>
				<MintDestinationEditor form={form} isAddressTagLoading={tagsByAddressQuery.isFetching} />
				<Divider
					className="my-8"
					styles={{
						root: {
							marginLeft: isMobile ? "-1rem" : "-2.75rem",
							marginRight: isMobile ? "-1rem" : "-2.75rem",
						},
					}}
				/>
				<div className="mt-2">
					<Text fw={400} c="var(--flr-gray)" className="mb-1 text-12 uppercase">
						{t("mint_modal.form.you_will_send_label")}
					</Text>
					<div className="flex justify-between">
						<Text className="text-16" fw={400}>
							{t("mint_modal.form.transfer_label")}
						</Text>
						<div className="flex items-center">
							{fAssetCoin.nativeIcon &&
								fAssetCoin.nativeIcon({ width: "16", height: "16" })}
							<Text className="mx-2 text-16" fw={400}>
								{transfer ? (
									formatFeeAmount(transfer, fAssetCoin.decimals)
								) : (
									<span>&mdash;</span>
								)}
							</Text>
							<Text
								ref={transferLabelSize.ref}
								className="text-16"
								fw={400}
								c="var(--flr-gray)"
								style={{ width: labelWidth > 0 ? `${labelWidth}px` : "auto" }}
							>
								{fAssetCoin.nativeName}
							</Text>
						</div>
					</div>
					<Text fw={400} c="var(--flr-gray)" className="mb-1 mt-5 uppercase text-12">
						{t("mint_modal.form.fees_label")}
					</Text>
					<div className="flex justify-between items-center">
						<Text className="text-16" fw={400} c="var(--flr-black)">
							{t("mint_modal.form.minting_fee_label")}
						</Text>
						<div className="flex items-center">
							{fAssetCoin.nativeIcon &&
								fAssetCoin.nativeIcon({ width: "16", height: "16" })}
							<Text className="mx-2 text-16" fw={400}>
								{mintingData.isPending ? (
									<Loader size={14} />
								) : totalFees !== undefined ? (
									formatFeeAmount(totalFees, fAssetCoin.decimals)
								) : (
									<span>&mdash;</span>
								)}
							</Text>
							<Text
								ref={mintingFeeLabelSize.ref}
								className="text-16"
								fw={400}
								c="var(--flr-gray)"
								style={{ width: labelWidth > 0 ? `${labelWidth}px` : "auto" }}
							>
								{fAssetCoin.nativeName}
							</Text>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

MintForm.displayName = "MintForm";
export default MintForm;
