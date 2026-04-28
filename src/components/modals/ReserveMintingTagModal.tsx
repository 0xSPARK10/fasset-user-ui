import React, { useState, useEffect, useRef } from "react";
import {
	Button,
	Divider,
	Group,
	Stack,
	Stepper,
	Text,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import ModalConfirmStep from "@/components/elements/ModalConfirmStep";
import ModalSuccessStep from "@/components/elements/ModalSuccessStep";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTagReservationFee } from "@/api/tags";
import { useNativeBalance } from "@/api/balance";
import { useReserveTag } from "@/hooks/useContracts";
import { FASSET_COIN } from "@/config/coin";
import { formatNumber, formatUnit, toNumber, findBalanceBySymbol } from "@/utils";
import FormAlert from "@/components/elements/FormAlert";
import { isError } from "ethers";
import { WALLET } from "@/constants";
import LedgerConfirmTransactionCard from "@/components/cards/LedgerConfirmTransactionCard";

interface IReserveMintingTagModal {
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const STEP_INFO = 0;
const STEP_CONFIRM = 1;
const STEP_SUCCESS = 2;

export default function ReserveMintingTagModal({
	opened,
	onClose,
	onSuccess,
}: IReserveMintingTagModal) {
	const [currentStep, setCurrentStep] = useState(STEP_INFO);
	const [reservedTagNumber, setReservedTagNumber] = useState<number | null>(
		null,
	);
	const [reservedRecipient, setReservedRecipient] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const { t } = useTranslation();
	const { mainToken, displayWalletName } = useWeb3();
	const reservationFee = useTagReservationFee(FASSET_COIN?.type);
	const nativeBalance = useNativeBalance(
		mainToken?.address!,
		mainToken?.address !== undefined,
	);
	const reserveTag = useReserveTag();
	const isReserveRequestActive = useRef<boolean>(false);

	const nativeBalanceEntry = findBalanceBySymbol(nativeBalance.data, mainToken?.type ?? '');
	const hasInsufficientBalance =
    nativeBalanceEntry !== undefined &&
    reservationFee.data?.reservationFee !== undefined &&
    toNumber(nativeBalanceEntry.balance) <
    parseFloat(formatUnit(BigInt(reservationFee.data.reservationFee), 18));
	useEffect(() => {
		if (!opened) {
			setCurrentStep(STEP_INFO);
			setReservedTagNumber(null);
			setReservedRecipient("");
			setErrorMessage(undefined);
		}
	}, [opened]);

	const handleNextButton = () => {
		if (mainToken?.connectedWallet === WALLET.LEDGER) {
			setCurrentStep(STEP_CONFIRM);
		} else {
			reserveTagRequest();
		}
	};

	const reserveTagRequest = async () => {
		if (isReserveRequestActive.current) return;
		const fee = reservationFee.data?.reservationFee;
		if (!fee) return;

		setErrorMessage(undefined);
		isReserveRequestActive.current = true;
		setCurrentStep(STEP_CONFIRM);
		try {
			const result = await reserveTag.mutateAsync({
				reservationFee: BigInt(fee),
			});
			if (!result) return;
			setReservedTagNumber(result.tag);
			setReservedRecipient(result.owner);
			setTimeout(() => setCurrentStep(STEP_SUCCESS), 2000);
		} catch (error: any) {
			if (isError(error, "ACTION_REJECTED")) {
				setErrorMessage(t("notifications.request_rejected_by_user_label"));
			} else {
				setErrorMessage(
					error?.message ?? t("reserve_minting_tag_modal.error_label"),
				);
			}
			setCurrentStep(STEP_INFO);
		} finally {
			isReserveRequestActive.current = false;
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
			title={t("reserve_minting_tag_modal.title")}
		>
			<FAssetModal.Body>
				<FormAlert message={errorMessage} />{" "}
				<Stepper
					active={currentStep}
					size="xs"
					classNames={{
						content: "pt-0",
						separator: "hidden",
					}}
				>
					{/* Step 0: INFO */}
					<Stepper.Step withIcon={false}>
						<FormAlert
							message={
								hasInsufficientBalance
									? t("reserve_minting_tag_modal.insufficient_balance_label", {
											symbol: mainToken?.type,
										})
									: undefined
							}
							type="info"
						/>
						<Text className="text-14" fw={400} c="var(--flr-black)" mb="xl">
							{t("reserve_minting_tag_modal.info_description")}
						</Text>
						<Text
							className="text-12"
							fw={400}
							c="var(--flr-gray)"
							mb={5}
							style={{ letterSpacing: "0.05em" }}
						>
							{t("reserve_minting_tag_modal.fees_label")}
						</Text>
						<Group justify="space-between" align="center">
							<Text className="text-16" fw={400} c="var(--flr-black)">
								{t("reserve_minting_tag_modal.reservation_fee_label")}
							</Text>
							<Group gap="xs" align="center">
								{mainToken?.icon?.({ width: "16", height: "16" })}
								<Text className="text-16" fw={400} c="var(--flr-black)">
									{reservationFee.data?.reservationFee ? (
										formatNumber(
											formatUnit(
												BigInt(reservationFee.data.reservationFee),
												18,
											),
										)
									) : (
										<span>&mdash;</span>
									)}
								</Text>
								<Text className="text-16" fw={400} c="var(--flr-gray)">
									{mainToken?.type}
								</Text>
							</Group>
						</Group>
					</Stepper.Step>

					{/* Step 1: CONFIRM */}
					<Stepper.Step withIcon={false}>
						<ModalConfirmStep
							title={t("reserve_minting_tag_modal.confirm_title")}
							stepLabel={t("reserve_minting_tag_modal.confirm_step_label")}
							stepDescription={t("reserve_minting_tag_modal.confirm_step_description")}
							walletInfoLabel={t('edit_tag_modal.wallet_info_label', {wallet: displayWalletName})}
							isPending={reserveTag.isPending}
							isSuccess={reserveTag.isSuccess}
						/>
						{currentStep === STEP_CONFIRM && mainToken?.connectedWallet === WALLET.LEDGER &&
							<>
								<Divider
									className="my-8"
									classNames={{ root: 'mx-[-1rem] sm:mx-[-2.7rem]' }}
								/>
								<LedgerConfirmTransactionCard
									appName={mainToken?.network?.ledgerApp!}
									onClick={() => reserveTagRequest()}
									isLoading={reserveTag.isPending}
									isDisabled={reserveTag.isPending || reserveTag.isSuccess}
								/>
							</>
						}
					</Stepper.Step>

					{/* Step 2: SUCCESS */}
					<Stepper.Step withIcon={false}>
						<ModalSuccessStep
							title={t("reserve_minting_tag_modal.success_title", { tagNumber: reservedTagNumber })}
							description={t("reserve_minting_tag_modal.success_description")}
						>
							<Stack className="mt-10 gap-[5px]">
								<Text
									className="text-12"
									fw={400}
									c="var(--flr-gray)"
									style={{ letterSpacing: "0.05em" }}
								>
									{t("reserve_minting_tag_modal.summary_label")}
								</Text>
								<Group justify="space-between">
									<Text className="text-14" fw={400} c="var(--flr-black)">
										{t("reserve_minting_tag_modal.tag_number_summary_label")}
									</Text>
									<Text className="text-14" fw={400} c="var(--flr-black)">
										#{reservedTagNumber}
									</Text>
								</Group>
								<Group justify="space-between">
									<Text className="text-14" fw={400} c="var(--flr-black)">
										{t("reserve_minting_tag_modal.minting_recipient_label")}
									</Text>
									<Text className="text-14" fw={400} c="var(--flr-black)">
										{reservedRecipient}
									</Text>
								</Group>
								<Group justify="space-between">
									<Text className="text-14" fw={400} c="var(--flr-black)">
										{t("reserve_minting_tag_modal.allowed_executor_label")}
									</Text>
									<Text className="text-14" fw={400} c="var(--flr-black)">
										{t("reserve_minting_tag_modal.anyone_label")}
									</Text>
								</Group>
							</Stack>
						</ModalSuccessStep>
					</Stepper.Step>
				</Stepper>
			</FAssetModal.Body>

			{currentStep === STEP_INFO && (
				<FAssetModal.Footer>
					<Button
						onClick={handleNextButton}
						variant="filled"
						color="var(--mantine-color-black)"
						radius="xl"
						size="sm"
						fullWidth
						disabled={
							reservationFee.isPending ||
							!reservationFee.data ||
							!!hasInsufficientBalance
						}
						className="hover:text-white"
					>
						{t("reserve_minting_tag_modal.next_button")}
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
						{t("reserve_minting_tag_modal.done_button")}
					</Button>
				</FAssetModal.Footer>
			)}
		</FAssetModal>
	);
}
