import React, { useEffect, useState } from "react";
import {
	Accordion,
	ActionIcon,
	Badge,
	Button,
	Card,
	Container,
	CopyButton,
	Divider,
	Group,
	List,
	Loader,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { IconCheck, IconCircleCheck, IconCopy, IconMinus, IconPlus } from "@tabler/icons-react";
import { Trans, useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { useTagReservationFee, useUserTags } from "@/api/tags";
import { useDirectMintingInfo } from "@/api/minting";
import { FASSET_COIN } from "@/config/coin";
import { truncateString, formatNumber, formatUnit, formatTimestamp } from "@/utils";
import BlingIcon from "@/components/icons/BlingIcon";
import FormAlert from "@/components/elements/FormAlert";
import ReserveMintingTagModal from "@/components/modals/ReserveMintingTagModal";
import EditExecutorModal from "@/components/modals/EditExecutorModal";
import TransferTagModal from "@/components/modals/TransferTagModal";
import { ITagsByAddress } from "@/types";
import CopyIcon from "@/components/icons/CopyIcon";
import RecipientTagModal from "@/components/modals/RecipientTagModal";
import TimerIcon from "@/components/icons/TimerIcon";

export default function Tags() {
	const { t } = useTranslation();
	const { isConnected, mainToken } = useWeb3();
	const { openConnectWalletModal } = useConnectWalletModal();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isHowToOpened, setIsHowToOpened] = useState(false);
	const [editingTag, setEditingTag] = useState<ITagsByAddress | null>(null);
	const [editingExecutorTag, setEditingExecutorTag] =
		useState<ITagsByAddress | null>(null);
	const [transferringTag, setTransferringTag] = useState<ITagsByAddress | null>(
		null,
	);

	const connectedAddress = mainToken?.address ?? "";
	const {
		data: tags = [],
		isPending: isTagsPending,
		isError: isTagsError,
		refetch,
	} = useUserTags(FASSET_COIN?.type, connectedAddress, isConnected);

	const hasPendingTags = tags.some(tag => tag.executorChangePending);
	useEffect(() => {
		if (!isConnected) return;
		const interval = setInterval(() => refetch(), hasPendingTags ? 30_000 : 60_000);
		return () => clearInterval(interval);
	}, [hasPendingTags, isConnected, refetch]);

	const reservationFee = useTagReservationFee(FASSET_COIN?.type, isConnected);
	const {
		data: directMintingInfo,
		isPending: isDirectMintingPending,
	} = useDirectMintingInfo(FASSET_COIN?.type, isConnected);
	const coreVaultAddress = directMintingInfo?.paymentAddress ?? "";

	const handleReserveTag = () => {
		if (!isConnected) {
			openConnectWalletModal();
		} else {
			setIsModalOpen(true);
		}
	};

	const handleModalSuccess = () => {
		refetch();
	};

	if (!isConnected || tags.length === 0) {
		return (
			<Container
				size="xs"
				className="flex flex-col flex-1 justify-center  text-center"
			>
				{isTagsPending && isConnected ? (
					<Loader size="sm" />
				) : isTagsError ? (
					<FormAlert message={t("my_tags.fetch_error")} />
				) : (
					<>
						<Title fw={500} className="text-32" c="var(--flr-black)">
							{t("my_tags.no_tags_title")}
						</Title>
						<Text c="var(--flr-gray)" className="mt-2 text-16 max-w-xs">
							{t("my_tags.no_tags_description", { networkName: mainToken?.network.brandName ?? "Flare" })}
						</Text>
						<Text c="var(--flr-gray)" className="mt-3 text-14">
							{t("my_tags.reservation_fee_label")}
							<Text component="span" className="ml-1">
								{reservationFee.isPending ? (
									<Loader size="10" />
								) : (
									<Text component="span" fw={700} className="text-16 mr-1">
										{reservationFee.data?.reservationFee
											? formatNumber(
													formatUnit(
														BigInt(reservationFee.data.reservationFee),
														18,
													),
												)
											: "—"}
									</Text>
								)}
								{mainToken?.type}
							</Text>
						</Text>
						<Card shadow="sm" className="mt-6">
							<Button
								variant="filled"
								color="black"
								radius="xl"
								size="lg"
								onClick={handleReserveTag}
								rightSection={
									isConnected ? undefined : <BlingIcon width="14" height="14" />
								}
								className="pl-12 pr-12 font-light hover:text-white"
								fw={400}
							>
								{isConnected
									? t("my_tags.reserve_tag_button")
									: t("connect_wallet_button.title")}
							</Button>
						</Card>
					</>
				)}
				<ReserveMintingTagModal
					opened={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSuccess={handleModalSuccess}
				/>
			</Container>
		);
	}

	return (
		<Container fluid className="mt-8 w-full max-w-[800px] mx-auto px-4">
			{/* How to mint with your tag — accordion */}
			<Accordion
				w="100%"
				radius="xs"
				chevron={isHowToOpened ? <IconMinus /> : <IconPlus />}
				disableChevronRotation
				onChange={() => setIsHowToOpened(!isHowToOpened)}
				mb="48px"
				classNames={{
					control: "px-6 bg-white hover:bg-white",
					panel: "bg-white border-t border-black",
					content: "px-6 py-4",
				}}
				styles={{
					root: {
						boxShadow: "0px 7px 7px -5px rgba(0, 0, 0, 0.0392)",
					},
				}}
			>
				<Accordion.Item value="HOW_TO">
					<Accordion.Control>
						<Text className="text-15" c="var(--flr-black)" fw={500}>
							{t("my_tags.how_to_title")}
						</Text>
					</Accordion.Control>
					<Accordion.Panel>
						<List
							type="ordered"
							size="sm"
							classNames={{ itemWrapper: "inline" }}
						>
							<List.Item>
								<Text className="text-14 inline" c="var(--flr-black)" fw={400}>
									{t("my_tags.how_to_step_1")}
								</Text>
							</List.Item>
							<List.Item className="mt-1">
								<Text className="text-14 inline" c="var(--flr-black)" fw={400}>
									{isDirectMintingPending ? (
										<Loader size="xs" display="inline" />
									) : (
										<Trans
											i18nKey={"my_tags.how_to_step_2"}
											components={{
												addr: (
													<Group display="inline-flex" gap="0" component="span">
														<Text inherit component="span">
															{coreVaultAddress}
														</Text>
														<CopyIcon text={coreVaultAddress} />
													</Group>
												),
											}}
										/>
									)}
								</Text>
							</List.Item>
							<List.Item className="mt-1">
								<Text className="text-14 inline" c="var(--flr-black)" fw={400}>
									{t("my_tags.how_to_step_3")}
								</Text>
							</List.Item>
							<List.Item className="mt-1">
								<Text className="text-14 inline" c="var(--flr-black)" fw={400}>
									{t("my_tags.how_to_step_4")}
								</Text>
							</List.Item>
							<List.Item className="mt-1">
								<Text className="text-14 inline" c="var(--flr-black)" fw={400}>
									{t("my_tags.how_to_step_5")}
								</Text>
							</List.Item>
						</List>
						<Text className="mt-3 text-14" c="var(--flr-gray)" fw={400}>
							{t("my_tags.how_to_note")}
						</Text>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>

			{/* My Tags header */}
			<Group justify="space-between" align="center" mb="md" w="100%">
				<Title c={"#212529"} fw={500} className="text-32">
					<Text component="span" inherit>
						{t("my_tags.tags_count_title")}
					</Text>{" "}
					<Text component="span" fw={400} c={"var(--flr-gray)"} inherit>
						({tags.length})
					</Text>
				</Title>
				<Button
					variant="gradient"
					radius="xl"
					size="xs"
					fw={400}
					onClick={() => setIsModalOpen(true)}
				>
					{t("my_tags.reserve_tag_button")}
				</Button>
			</Group>

			{/* Tag list */}
			<Card
				shadow="xs"
				radius="xs"
				withBorder
				p={40}
				w="100%"
				className="border-[--flr-border-color]"
			>
				{tags.map((tag, index) => (
					<TagCard
						key={tag.tagId}
						tag={tag}
						connectedAddress={connectedAddress}
						isLast={index === tags.length - 1}
						onEdit={() => setEditingTag(tag)}
						onEditExecutor={() => setEditingExecutorTag(tag)}
						onTransfer={() => setTransferringTag(tag)}
					/>
				))}
			</Card>

			<ReserveMintingTagModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleModalSuccess}
			/>
			<RecipientTagModal
				opened={editingTag !== null}
				tag={editingTag}
				onClose={() => setEditingTag(null)}
				onSuccess={handleModalSuccess}
			/>
			<EditExecutorModal
				opened={editingExecutorTag !== null}
				tag={editingExecutorTag}
				onClose={() => setEditingExecutorTag(null)}
				onSuccess={handleModalSuccess}
			/>
			<TransferTagModal
				opened={transferringTag !== null}
				tag={transferringTag}
				onClose={() => setTransferringTag(null)}
				onSuccess={handleModalSuccess}
			/>
		</Container>
	);
}

interface ITagCard {
	tag: ITagsByAddress;
	connectedAddress: string;
	isLast: boolean;
	onEdit: () => void;
	onEditExecutor: () => void;
	onTransfer: () => void;
}

function TagCard({
	tag,
	connectedAddress,
	isLast,
	onEdit,
	onEditExecutor,
	onTransfer,
}: ITagCard) {
	const { t } = useTranslation();
	const isConnectedAddress =
		connectedAddress &&
		tag.mintingRecipient.toLowerCase() === connectedAddress.toLowerCase();
	const displayRecipient =
		tag.mintingRecipient.length > 20
			? truncateString(tag.mintingRecipient, 6)
			: tag.mintingRecipient;
	const isZeroAddress = (addr: string) => /^0x0+$/i.test(addr);
	const displayExecutor = !tag.pendingNewExecutor &&
		tag.allowedExecutor && !isZeroAddress(tag.allowedExecutor)
			? tag.allowedExecutor.length > 20
				? truncateString(tag.allowedExecutor, 6)
				: tag.allowedExecutor
			: null;

	return (
		<Stack gap={0} mb={isLast ? 0 : "20px"}>
			<Text fw={300} className="text-24 mb-3" c="var(--flr-black)">
				{t("my_tags.tag_number_label", { number: tag.tagId })}
			</Text>

			{/* Minting Recipient row */}
			<Group justify="space-between" align="center" mb="xs">
				<Text className="text-14" fw={400} c="var(--flr-gray)">
					{t("my_tags.minting_recipient_label")}
				</Text>
				<Group gap="xs" align="center">
					<Group gap={"2px"}>
						<Text className="text-14" fw={400} c="var(--flr-black)">
							{displayRecipient}
						</Text>
						<CopyButton value={tag.mintingRecipient} timeout={2000}>
							{({ copied, copy }) => (
								<Tooltip
									label={
										copied ? t("my_tags.copied_label") : t("my_tags.copy_label")
									}
									withArrow
								>
									<ActionIcon
										variant="subtle"
										color="gray"
										size="sm"
										onClick={copy}
									>
										{copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
					</Group>
					{isConnectedAddress && (
						<Badge
							color="var(--flr-sky)"
							bd={"1px solid var(--flr-sky-lighter)"}
							variant="outline"
							size="md"
							radius="xs"
							className="font-normal"
						>
							<Text className="text-10" fw={400} c="var(--flr-sky)">
								{t("my_tags.connected_badge")}
							</Text>
						</Badge>
					)}
				</Group>
			</Group>

			{/* Allowed Executor row */}
			<Group justify="space-between" align="center" mb="md">
				<Text className="text-14" fw={400} c="var(--flr-gray)">
					{t("my_tags.allowed_executor_label")}
				</Text>
				{displayExecutor ? (
					<Group gap="2px" align="center">
						<Text className="text-14" fw={400} c="var(--flr-black)">
							{displayExecutor}
						</Text>
						<CopyButton value={tag.allowedExecutor} timeout={2000}>
							{({ copied, copy }) => (
								<Tooltip
									label={
										copied ? t("my_tags.copied_label") : t("my_tags.copy_label")
									}
									withArrow
								>
									<ActionIcon
										variant="subtle"
										color="gray"
										size="sm"
										onClick={copy}
									>
										{copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
					</Group>
				) : tag.pendingNewExecutor ? (
					<Tooltip label={t(
									"edit_executor_modal.success_description",
									formatTimestamp(tag?.executorChangeActiveAfterTs ?? 0),
								)}>

					<Group gap={"6"}>
						<TimerIcon size={12} color="var(--flr-gray)"/>
						<Text className="text-14" fw={400} c="var(--flr-gray)">
							{t("my_tags.pending_update")}
						</Text>
					</Group>
					</Tooltip>
				) : (
					<Group gap={"6"}>
					<IconCircleCheck stroke={1} size={15} color="var(--flr-gray)"/>
					<Text className="text-14" fw={400} c="var(--flr-gray)">
						{t("my_tags.anyone_default_label")}
					</Text>
					</Group>
				)}
			</Group>

			<Divider mb="md" />

			{/* Action buttons */}
			<Group justify="flex-end" gap="xs">
				<Button
					variant="gradient"
					radius="xl"
					size="xs"
					fw={400}
					onClick={onEdit}
				>
					{t("my_tags.change_recipient_button")}
				</Button>
				<Button
					variant="gradient"
					radius="xl"
					size="xs"
					fw={400}
					onClick={onEditExecutor}
					disabled={tag.pendingNewExecutor !== undefined}
				>
					{t("my_tags.edit_executor_button")}
				</Button>
				<Button
					variant="gradient"
					radius="xl"
					size="xs"
					fw={400}
					onClick={onTransfer}
				>
					{t("my_tags.transfer_button")}
				</Button>
			</Group>
		</Stack>
	);
}
