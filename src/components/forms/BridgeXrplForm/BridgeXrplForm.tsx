import { forwardRef, useImperativeHandle } from "react";
import { UseFormReturnType } from "@mantine/form";
import { LoadingOverlay, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/utils";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { ICoin } from "@/types";
import { BridgeConfig } from "@/components/modals/BridgeModal";
import { FASSET_COIN } from "@/config/coin";
import DestinationAddressField from "@/components/elements/DestinationAddressField";
import AmountInput from "@/components/elements/AmountInput";
import ModalDivider from "@/components/elements/ModalDivider";
import FeeBreakdown from "@/components/elements/FeeBreakdown";
import { IAlertMessage } from "@/components/elements/FormAlert";
import { useBridgeXrplForm } from "./useBridgeXrplForm";

interface IBridgeXrplForm {
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

export type FormRef = {
	form: () => UseFormReturnType<any>;
};

const BridgeXrplForm = forwardRef<FormRef, IBridgeXrplForm>((props, ref) => {
	const { t } = useTranslation();
	const { token } = props;
	const {
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
	} = useBridgeXrplForm(props);

	useImperativeHandle(ref, () => ({ form: () => form }));

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
					{FASSET_COIN?.nativeIcon &&
						FASSET_COIN.nativeIcon({ width: "32", height: "32" })}
					<Text fw={500} c="var(--flr-black)" className="text-18 mx-2">
						{formatNumber(receivedAmount ?? 0)}
					</Text>
					<Text fw={400} c="var(--flr-gray)" className="text-18">
						{FASSET_COIN?.nativeName}
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
				destinationTagReadOnlyValue={form.getValues().destinationTag as string}
			/>

			{/* Fees section */}
			<ModalDivider />
			<FeeBreakdown
				feesLabel={t("bridge_modal.form.fees_label")}
				iconSize={18}
				items={feeItems}
			/>
		</div>
	);
});

BridgeXrplForm.displayName = "BridgeXrplForm";
export default BridgeXrplForm;
