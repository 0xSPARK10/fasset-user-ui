import React, { useState, useEffect, useRef } from "react";
import { Button, Divider, Stepper, Text, TextInput } from "@mantine/core";
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
import { useWeb3 } from "@/hooks/useWeb3";
import { useSetAllowedExecutor } from "@/hooks/useContracts";
import { formatTimestamp } from "@/utils";
import apiClient from "@/api/apiClient";
import { FASSET_COIN } from "@/config/coin";
import PasteClipboard from "../elements/PasteClipboard";
import { WALLET } from "@/constants";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";

interface IEditExecutorModal {
	opened: boolean;
	tag: ITagsByAddress | null;
	onClose: () => void;
	onSuccess: () => void;
}

const STEP_FORM = 0;
const STEP_CONFIRM = 1;
const STEP_SUCCESS = 2;

const ZERO = "0x0000000000000000000000000000000000000000";
const normalizeExecutor = (v?: string) => (!v || v === ZERO ? "" : v);

export default function EditExecutorModal({
	opened,
	tag,
	onClose,
	onSuccess,
}: IEditExecutorModal) {
	const [currentStep, setCurrentStep] = useState(STEP_FORM);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const [executorData, setExecutorData] = useState<ITagsByAddress | undefined>(
		undefined,
	);
	const { t } = useTranslation();
	const { mainToken, displayWalletName } = useWeb3();
	const setAllowedExecutor = useSetAllowedExecutor();
	const isRequestActive = useRef<boolean>(false);

	const schema = yup.object().shape({
		executor: yup
			.string()
			.optional()
			.test(
				"is-valid-address-or-empty",
				t("validation.messages.invalid_address", {
					field: t("edit_executor_modal.executor_label"),
				}),
				(val) => !val || isAddress(val),
			),
	});

	const form = useForm({
		mode: "controlled",
		initialValues: {
			executor: normalizeExecutor(tag?.allowedExecutor),
		},
		validate: yupResolver(schema),
	});

	useEffect(() => {
		if (!opened) {
			setCurrentStep(STEP_FORM);
			setErrorMessage(undefined);
			setExecutorData(undefined);
		}
	}, [opened]);

	useEffect(() => {
		if (tag) {
			form.setValues({
				executor: normalizeExecutor(tag.allowedExecutor),
			});
		}
	}, [tag]);

	const handleSaveButton = () => {
		if (isRequestActive.current || !tag) return;
		const result = form.validate();
		if (result.hasErrors) return;

		setErrorMessage(undefined);

		if (mainToken?.connectedWallet === WALLET.LEDGER) {
			setCurrentStep(STEP_CONFIRM);
		} else {
			editExecutorRequest();
		}
	};

	const editExecutorRequest = async () => {
		if (isRequestActive.current || !tag) return;
		const result = form.validate();
		if (result.hasErrors) return;

		setErrorMessage(undefined);
		isRequestActive.current = true;
		setCurrentStep(STEP_CONFIRM);
		try {
			const executor = form.getValues().executor;
			await setAllowedExecutor.mutateAsync({
				tagId: Number(tag.tagId),
				executor: executor || ZERO,
			});
			try {
				const response = await apiClient.get(
					`tag/${FASSET_COIN.type}/${tag.tagId}`,
				);
				setExecutorData(response.data);
			} catch {
				// non-critical, but if this fails executorData stays undefined:
				// executorChangePending will be falsy and a pending change will show as immediate
			}
			setCurrentStep(STEP_SUCCESS);
		} catch (error: any) {
			if (isError(error, "ACTION_REJECTED")) {
				setErrorMessage(t("notifications.request_rejected_by_user_label"));
			} else {
				setErrorMessage(error?.message ?? t("edit_executor_modal.error_label"));
			}
			setCurrentStep(STEP_FORM);
		} finally {
			isRequestActive.current = false;
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
			title={t("edit_executor_modal.title", { tagId: tag?.tagId })}
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
						<AlertBox title={t("edit_executor_modal.warning_title")}>
							<Text className="text-16" fw={400}>{t("edit_executor_modal.warning_description")}</Text>
						</AlertBox>

						<Text
							className="text-12"
							fw={400}
							c="var(--flr-gray)"
							mb="xs"
							style={{ letterSpacing: "0.05em" }}
						>
							{t("edit_executor_modal.executor_label").toUpperCase()}
						</Text>
						<TextInput
							placeholder={t("edit_executor_modal.executor_placeholder")}
							style={{ maxWidth: 400 }}
							mb={2}
							rightSection={
								<PasteClipboard
									onPaste={(text) => form.setFieldValue("executor", text)}
								/>
							}
							{...form.getInputProps("executor")}
						/>
						<Text className="text-12" mt="6" fw={400} c="var(--flr-gray)">
							{t("edit_executor_modal.executor_hint")}
						</Text>
					</Stepper.Step>

					{/* Step 1: CONFIRM */}
					<Stepper.Step withIcon={false}>
						<ModalConfirmStep
							title={t("edit_executor_modal.confirm_title")}
							stepLabel={t("edit_executor_modal.confirm_step_label")}
							stepDescription={t(
								"edit_executor_modal.confirm_step_description",
							)}
							walletInfoLabel={t("edit_executor_modal.wallet_info_label", {
								wallet: displayWalletName,
							})}
							isPending={setAllowedExecutor.isPending}
							isSuccess={setAllowedExecutor.isSuccess}
						/>
						{currentStep === STEP_CONFIRM &&
							mainToken?.connectedWallet === WALLET.LEDGER && (
								<>
									<Divider
										className="my-8"
										classNames={{ root: "mx-[-1rem] sm:mx-[-2.7rem]" }}
									/>
									<LedgerConfirmTransactionCard
										appName={mainToken?.network?.ledgerApp!}
										onClick={() => editExecutorRequest()}
										isLoading={setAllowedExecutor.isPending}
										isDisabled={
											setAllowedExecutor.isPending ||
											setAllowedExecutor.isSuccess
										}
									/>
								</>
							)}
					</Stepper.Step>

					{/* Step 2: SUCCESS */}
					<Stepper.Step withIcon={false}>
						<ModalSuccessStep
							title={t("edit_executor_modal.success_title", {
								tagId: tag?.tagId,
							})}
							description={
								executorData?.executorChangePending
									? executorData?.executorChangeActiveAfterTs
										? t(
												"edit_executor_modal.success_description",
												formatTimestamp(
													executorData?.executorChangeActiveAfterTs,
												),
											)
										: t("edit_executor_modal.success_description", {
												date: "-",
												time: "-",
											})
									: t("edit_executor_modal.success_description_immediate")
							}
						/>
					</Stepper.Step>
				</Stepper>
			</FAssetModal.Body>

			{currentStep === STEP_FORM && (
				<FAssetModal.Footer>
					<Button
						onClick={handleSaveButton}
						variant="filled"
						color="var(--mantine-color-black)"
						radius="xl"
						size="sm"
						fullWidth
						className="hover:text-white"
					>
						{t("edit_executor_modal.save_button")}
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
						{t("edit_executor_modal.done_button")}
					</Button>
				</FAssetModal.Footer>
			)}
		</FAssetModal>
	);
}
