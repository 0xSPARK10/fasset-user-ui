import React, { useState, useEffect, useRef } from "react";
import { Button, Divider, List, Stepper, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { isAddress, isError } from "ethers";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import ModalConfirmStep from "@/components/elements/ModalConfirmStep";
import ModalSuccessStep from "@/components/elements/ModalSuccessStep";
import FormAlert from "@/components/elements/FormAlert";
import AlertBox from "@/components/elements/AlertBox";
import { ITagsByAddress } from "@/types";
import { useTransferTag } from "@/hooks/useContracts";
import { useWeb3 } from "@/hooks/useWeb3";
import { WALLET } from "@/constants";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";
import { isMobile } from "react-device-detect";
import PasteClipboard from "../elements/PasteClipboard";

interface ITransferTagModal {
	opened: boolean;
	tag: ITagsByAddress | null;
	onClose: () => void;
	onSuccess: () => void;
}

const STEP_FORM = 0;
const STEP_CONFIRM = 1;
const STEP_SUCCESS = 2;

export default function TransferTagModal({
	opened,
	tag,
	onClose,
	onSuccess,
}: ITransferTagModal) {
	const [currentStep, setCurrentStep] = useState(STEP_FORM);
	const [newOwner, setNewOwner] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const { t } = useTranslation();
	const transferTag = useTransferTag();
	const isTransferRequestActive = useRef<boolean>(false);
	const { mainToken, displayWalletName } = useWeb3();


	const schema = yup.object().shape({
		newOwner: yup
			.string()
			.required(
				t("validation.messages.required", {
					field: t("transfer_tag_modal.new_owner_label"),
				}),
			)
			.test(
				"is-valid-address",
				t("validation.messages.invalid_address", {
					field: t("transfer_tag_modal.new_owner_label"),
				}),
				(val) => isAddress(val ?? ""),
			),
	});

	const form = useForm({
		mode: "controlled",
		initialValues: { newOwner: "" },
		validate: yupResolver(schema),
	});

	useEffect(() => {
		if (!opened) {
			setCurrentStep(STEP_FORM);
			setNewOwner("");
			setErrorMessage(undefined);
			form.reset();
		}
	}, [opened]);

	const handleTransferButton = () => {
		if (isTransferRequestActive.current || !tag) return;
		const result = form.validate();
		if (result.hasErrors) return;

		setNewOwner(form.getValues().newOwner);
		setErrorMessage(undefined);

		if (mainToken?.connectedWallet === WALLET.LEDGER) {
			setCurrentStep(STEP_CONFIRM);
		} else {
			transferTagRequest();
		}
	};

	const transferTagRequest = async () => {
		if (isTransferRequestActive.current || !tag) return;
		const to = form.getValues().newOwner;

		setErrorMessage(undefined);
		isTransferRequestActive.current = true;
		setCurrentStep(STEP_CONFIRM);
		try {
			await transferTag.mutateAsync({ tagId: Number(tag.tagId), to });
			setCurrentStep(STEP_SUCCESS);
		} catch (error: any) {
			if (isError(error, "ACTION_REJECTED")) {
				setErrorMessage(t("notifications.request_rejected_by_user_label"));
			} else {
				setErrorMessage(error?.message ?? t("transfer_tag_modal.error_label"));
			}
			setCurrentStep(STEP_FORM);
		} finally {
			isTransferRequestActive.current = false;
		}
	};

	const handleDone = () => {
		onSuccess();
		onClose();
	};

	return (
		<FAssetModal
			opened={opened}
			onClose={onClose}
			centered
			size="lg"
			title={t("transfer_tag_modal.title", { tagId: tag?.tagId })}
		>
			<FAssetModal.Body>
				<FormAlert message={errorMessage} />
				<Stepper
					active={currentStep}
					size="xs"
					classNames={{ content: "pt-0", separator: "hidden" }}
				>
					{/* Step 0: FORM */}
					<Stepper.Step withIcon={false}>
						<AlertBox title={t("transfer_tag_modal.warning_title")}>
							<List
								withPadding
								pl={"0.5rem"}
								size="sm"
								fw={400}
								className="text-16"
								spacing={0}
								lh={1}
							>
								<List.Item>
									<Text>{t("transfer_tag_modal.warning_item_1")}</Text>
								</List.Item>
								<List.Item>
									<Text>{t("transfer_tag_modal.warning_item_2")}</Text>
								</List.Item>
								<List.Item>
									<Text>{t("transfer_tag_modal.warning_item_3")}</Text>
								</List.Item>
							</List>
						</AlertBox>
						<Text
							className="text-12"
							fw={400}
							c="var(--flr-gray)"
							mb="xs"
							style={{ letterSpacing: "0.05em" }}
						>
							{t("transfer_tag_modal.new_owner_label").toUpperCase()}
						</Text>
						<TextInput
							style={{ maxWidth: 400 }}
							placeholder={t("transfer_tag_modal.new_owner_placeholder")}
							rightSection={
								!isMobile ? <PasteClipboard onPaste={(text)=>form.setFieldValue("newOwner",text)} />: null
							}
							{...form.getInputProps("newOwner")}
						/>
					</Stepper.Step>

					{/* Step 1: CONFIRM */}
					<Stepper.Step withIcon={false}>
						<ModalConfirmStep
							title={t("transfer_tag_modal.confirm_title")}
							stepLabel={t("transfer_tag_modal.confirm_step_label")}
							stepDescription={t("transfer_tag_modal.confirm_step_description")}
							walletInfoLabel={t("edit_tag_modal.wallet_info_label", {
								wallet: displayWalletName,
							})}
							isPending={transferTag.isPending}
							isSuccess={transferTag.isSuccess}
						/>
						{currentStep === STEP_CONFIRM && mainToken?.connectedWallet === WALLET.LEDGER &&
							<>
								<Divider
									className="my-8"
									classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
								/>
								<LedgerConfirmTransactionCard
									appName={mainToken?.network?.ledgerApp!}
									onClick={() => transferTagRequest()}
									isLoading={transferTag.isPending}
									isDisabled={transferTag.isPending || transferTag.isSuccess}
								/>
							</>
						}
					</Stepper.Step>

					{/* Step 2: SUCCESS */}
					<Stepper.Step withIcon={false}>
						<ModalSuccessStep
							title={t("transfer_tag_modal.success_title", {
								tagId: tag?.tagId,
							})}
							description={t("transfer_tag_modal.success_description", {
								address: newOwner,
							})}
						/>
					</Stepper.Step>
				</Stepper>
			</FAssetModal.Body>

			{currentStep === STEP_FORM && (
				<FAssetModal.Footer>
					<Button
						onClick={handleTransferButton}
						variant="filled"
						color="var(--mantine-color-black)"
						radius="xl"
						size="sm"
						fullWidth
						className="hover:text-white"
					>
						{t("transfer_tag_modal.transfer_button")}
					</Button>
				</FAssetModal.Footer>
			)}

			{currentStep === STEP_SUCCESS && (
				<FAssetModal.Footer>
					<Button
						onClick={handleDone}
						variant="filled"
						color="var(--mantine-color-black)"
						radius="xl"
						size="sm"
						fullWidth
						className="hover:text-white"
					>
						{t("transfer_tag_modal.done_button")}
					</Button>
				</FAssetModal.Footer>
			)}
		</FAssetModal>
	);
}
