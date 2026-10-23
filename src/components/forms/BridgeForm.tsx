import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";
import { useForm, UseFormReturnType } from "@mantine/form";
import { ICoin } from "@/types";
import { Text, SegmentedControl } from "@mantine/core";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { formatNumber, formatUnit, parseUnits, toNumber } from "@/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBridgeQouteSend, useHypeBalance } from "@/hooks/useContracts";
import { showErrorNotification } from "@/hooks/useNotifications";
import { ErrorDecoder } from "ethers-decode-error";
import { FAssetOFTAdapterAbi } from "@/abi";
import { BRIDGE_CHAIN, BRIDGE_TYPE } from "@/constants";
import { BridgeConfig } from "@/components/modals/BridgeModal";
import { useNativeBalance } from "@/api/balance";
import { BRIDGE_GAS_COIN } from "@/config/coin";
import { FEE_TOKEN_CHAIN } from "@/config/bridge";
import AmountInput from "@/components/elements/AmountInput";
import ModalDivider from "@/components/elements/ModalDivider";
import FeeBreakdown from "@/components/elements/FeeBreakdown";
import { useBridgeFees } from "@/hooks/fees/useBridgeFees";

interface IBridgeForm {
	token: ICoin;
	type: (typeof BRIDGE_TYPE)[keyof typeof BRIDGE_TYPE];
	bridgeConfig: BridgeConfig;
	onError: (error: string | undefined) => void;
	isFormDisabled?: (status: boolean) => void;
}
export type FormRef = {
	form: () => UseFormReturnType<any>;
};

const BridgeForm = forwardRef<FormRef, IBridgeForm>(
	(
		{ token, type, bridgeConfig, onError, isFormDisabled }: IBridgeForm,
		ref,
	) => {
		const { t } = useTranslation();
		const { mainToken } = useWeb3();
		const [amount, setAmount] = useState<number>();
		const [fee, setFee] = useState<string>();
		const [bridgeType, setBridgeType] =
			useState<(typeof BRIDGE_TYPE)[keyof typeof BRIDGE_TYPE]>(type);
		const qouteSend = useBridgeQouteSend();
		// feeTokenKey → the chain the LayerZero nativeFee is paid on.
		// undefined = the route originates on Flare, so the fee comes from mainToken.
		const feeChain = FEE_TOKEN_CHAIN[bridgeConfig.feeTokenKey];
		const feeCoin = feeChain ? BRIDGE_GAS_COIN[feeChain] : mainToken;

		const feeItems = useBridgeFees({
			feeCoin,
			fee,
			isLoading: qouteSend.isPending,
		});
		const nativeBalance = useNativeBalance(
			mainToken?.address!,
			feeChain === undefined,
		);
		const hypeBalance = useHypeBalance(
			feeChain !== undefined,
			feeChain ?? BRIDGE_CHAIN.HYPER_EVM,
		);

		const schema = yup.object().shape({
			amount: yup
				.number()
				.transform((value) => (Number.isNaN(value) ? undefined : value))
				.required(
					t("validation.messages.required", {
						field: t("bridge_modal.form.amount_label"),
					}),
				)
				.min(0),
		});

		const form = useForm({
			mode: "controlled",
			initialValues: {
				amount: undefined,
				fee: undefined,
				type: type,
			},
			validate: yupResolver(schema),
		});

		form.watch("amount", ({ value }) => {
			const isEmpty =
				value === undefined || value === "" || Number.isNaN(Number(value));
			if (isEmpty && isFormDisabled) isFormDisabled(true);
			debounceSetAmount(value);
		});
		form.watch("type", ({ value }) => {
			debounceSetType(value as (typeof BRIDGE_TYPE)[keyof typeof BRIDGE_TYPE]);
		});

		useImperativeHandle(ref, () => ({
			form: () => {
				return form;
			},
		}));

		useEffect(() => {
			if (isFormDisabled) isFormDisabled(true);
		}, []);

		// Check value and throw errors
		useEffect(() => {
			if (!fee) return;

			if (feeChain === undefined) {
				if (!nativeBalance.data) {
					if (isFormDisabled) isFormDisabled(true);
					return;
				}

				const balance = nativeBalance.data.find(
					(balance) =>
						balance.symbol.toLowerCase() === mainToken?.type?.toLowerCase(),
				);
				if (balance && toNumber(balance?.balance!) < toNumber(fee)) {
					onError(
						t("bridge_modal.error_insufficient_balance_label", {
							tokenName: mainToken?.type,
						}),
					);
				}
			} else {
				if (hypeBalance.data === undefined) {
					if (isFormDisabled) isFormDisabled(true);
					return;
				}
				const balance = formatUnit(hypeBalance.data, 18);
				if (toNumber(balance) < toNumber(fee)) {
					onError(
						t("bridge_modal.error_insufficient_balance_label", {
							tokenName: feeCoin?.type,
						}),
					);
				}
			}
		}, [fee, nativeBalance, hypeBalance]);

		const debounceSetType = useDebouncedCallback(
			async (value: (typeof BRIDGE_TYPE)[keyof typeof BRIDGE_TYPE]) => {
				try {
					onError(undefined);
					setBridgeType(value);
					if (!amount) return;

					const fee = await qouteSend.mutateAsync({
						amount: parseUnits(amount!, 6).toString(),
						bridgeType: value,
					});

					form.setFieldValue("fee", fee);
					setFee(formatUnit(fee, 18));
				} catch (error) {
					const errorDecoder = ErrorDecoder.create([FAssetOFTAdapterAbi]);
					const decodedError = await errorDecoder.decode(error);
					showErrorNotification(decodedError.reason as string);
				}
			},
			500,
		);

		const debounceSetAmount = useDebouncedCallback(async (value) => {
			if (!value || typeof value !== "number" || isNaN(value)) {
				setAmount(undefined);
				setFee(undefined);
				form.setFieldValue("fee", undefined);
				if (isFormDisabled) isFormDisabled(true);
				return;
			}
			setAmount(value);
			if (value === amount) {
				if (isFormDisabled) isFormDisabled(false);
				return;
			}

			if (isFormDisabled) isFormDisabled(true);

			try {
				const fee = await qouteSend.mutateAsync({
					amount: parseUnits(value, 6).toString(),
					bridgeType: bridgeType,
				});

				setFee(formatUnit(fee, 18));
				form.setFieldValue("fee", fee);
				if (isFormDisabled) isFormDisabled(false);
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

		return (
			<div>
				<Text className="text-24 mb-5" fw={300} c="var(--flr-black)">
					{t("bridge_modal.form.amount_step_title")}
				</Text>
				<AmountInput
					description={t("bridge_modal.form.balance_amount_label", {
						balance: formatNumber(
							Math.floor(toNumber(token?.balance ?? "0") * 100) / 100,
						),
						token: token.type,
					})}
					form={form}
					fAssetCoin={token}
					maxAmount={toNumber(token?.balance ?? "")}
				/>

				{bridgeConfig.showSegmentedControl && (
					<div className="flex items-center mt-5">
						<Text fw={500} c="var(--flr-gray)" className="text-16 mr-2">
							{t("bridge_modal.form.to_label")}
						</Text>
						<SegmentedControl
							{...form.getInputProps("type")}
							data={[
								{
									label: t("bridge_modal.form.hyper_core_label"),
									value: BRIDGE_TYPE.HYPER_CORE,
								},
								{
									label: t("bridge_modal.form.hyper_evm_label"),
									value: BRIDGE_TYPE.HYPER_EVM,
								},
							]}
						/>
					</div>
				)}
				<ModalDivider />
				<FeeBreakdown
					feesLabel={t("bridge_modal.form.fees_label")}
					iconSize={18}
					items={feeItems}
				/>
			</div>
		);
	},
);

BridgeForm.displayName = "BridgeForm";
export default BridgeForm;
