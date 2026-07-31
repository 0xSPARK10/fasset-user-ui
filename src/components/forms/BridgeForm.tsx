import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";
import { useForm, UseFormReturnType } from "@mantine/form";
import { ICoin } from "@/types";
import { Divider, Loader, Text, SegmentedControl } from "@mantine/core";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { formatNumber, formatUnit, parseUnits, toNumber } from "@/utils";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
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
import { formatCrossChainFee } from "@/core/fees/format";
import AmountInput from "../elements/AmountInput";

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
	({ token, type, bridgeConfig, onError, isFormDisabled }: IBridgeForm, ref) => {
		const { t } = useTranslation();
		const mediaQueryMatches = useMediaQuery("(max-width: 40em)");
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
			onValuesChange: (values: any) => {
				if (values?.amount?.length === 0) {
					form.setFieldValue("amount", undefined);
				}
			},
		});

		form.watch("amount", ({ value }) => {
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
			if (value === amount) return;

			setAmount(value);
			if (!value || typeof value !== "number" || isNaN(value)) {
				if (isFormDisabled) isFormDisabled(true);
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
				showErrorNotification(error?.error?.message || decodedError.reason || (error as Error)?.message);
			}
		}, 500);

		return (
			<div>
				<Text className="text-24 mb-5" fw={300} c="var(--flr-black)">
					{t("bridge_modal.form.amount_step_title")}
				</Text>
				<AmountInput				
					description={t("bridge_modal.form.balance_amount_label", {
						balance: formatNumber(Math.floor(toNumber(token?.balance ?? "0") * 100) / 100),
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
						{feeCoin?.icon && feeCoin.icon({ width: "18", height: "18" })}
						<Text className="text-16 mx-2" fw={400} c="var(--flr-black)">
							{qouteSend.isPending ? (
								<Loader size={14} />
							) : fee ? (
								formatCrossChainFee(fee, feeCoin?.feeDecimals)
							) : (
								<span>&mdash;</span>
							)}
						</Text>
						<Text c="var(--flr-gray)" fw={400} className="text-16 w-12">
							{feeCoin?.type}
						</Text>
					</div>
				</div>
			</div>
		);
	},
);

BridgeForm.displayName = "BridgeForm";
export default BridgeForm;
