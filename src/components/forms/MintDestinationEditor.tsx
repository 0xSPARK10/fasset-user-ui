import React, { useState } from "react";
import {
	Button,
	Combobox,
	Grid,
	Loader,
	SegmentedControl,
	Text,
	TextInput,
	useCombobox,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import CopyIcon from "@/components/icons/CopyIcon";
import { truncateString } from "@/utils";
import elementClasses from "@/styles/components/elements/DestinationAddressField.module.scss";
import formClasses from "@/styles/components/forms/MintForm.module.scss";
import DiscountCheckIcon from "../icons/DiscountCheckIcon";
import { useRouter } from "next/router";
import { ITagsByAddress } from "@/types";

interface IMintDestinationEditor {
	form: UseFormReturnType<any>;
	isAddressTagLoading?: boolean;
	userTags?: ITagsByAddress[];
	onTagSelect?: (tagId: string, mintingRecipient: string) => void;
}

const LABEL_CLASSNAMES = { label: "uppercase text-12" };
const ERROR_CLASSNAMES = {
	label: "uppercase text-12",
	input: elementClasses.inputError,
	error: elementClasses.inputErrorText,
};

export default function MintDestinationEditor({
	form,
	isAddressTagLoading = false,
	userTags = [],
	onTagSelect,
}: IMintDestinationEditor) {
	const { t } = useTranslation();
	const router = useRouter();

	const [isEditMode, setIsEditMode] = useState(false);
	const [editTab, setEditTab] = useState<"address" | "tag">("address");

	const currentAddress = form.getValues().destinationAddress;
	const { addressTag } = form.getValues();

	const handleTabChange = (tab: "address" | "tag") => {
		setEditTab(tab);
		form.setFieldValue("destinationMode", tab);
	};

	if (!isEditMode) {
		return (
			<Grid align="center">
				<Grid.Col span={{ base: 12, xs: 8 }}>
					<Text c="var(--flr-gray)" className="text-12">
						{t("mint_modal.form.destination_address_label")}
					</Text>

					<div className="flex items-center min-w-0 mr-3">
						<Text className="block text-15 truncate" fw={400}>
							{truncateString(currentAddress, 16, 16)}
						</Text>
						<CopyIcon text={currentAddress} color="#AFAFAF" />
					</div>
				</Grid.Col>

				<Grid.Col span={{ base: 12, xs: 2 }}>
					<Text c="var(--flr-gray)" className="text-12 uppercase">
						{t("mint_modal.form.minting_tag_label")}
					</Text>

					{isAddressTagLoading ? (
						<Loader size={14} />
					) : (
						<Text c="var(--flr-gray)" className="text-16">
							{addressTag ? (addressTag) : <span>--</span>}
						</Text>
					)}
				</Grid.Col>

				<Grid.Col span={{ base: 12, xs: 1.5 }}>
					<Button
						variant="gradient"
						size="sm"
						radius="xl"
						fw={400}
						onClick={() => setIsEditMode(true)}
					>
						{t("mint_modal.form.edit_button")}
					</Button>
				</Grid.Col>
			</Grid>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Text fw={400} c="var(--flr-gray)" className="text-16 mr-1">
						{t("mint_modal.form.i_want_to_enter_label")}
					</Text>

					<SegmentedControl
						value={editTab}
						onChange={(v) => handleTabChange(v as "address" | "tag")}
						data={[
							{
								label: t("mint_modal.form.address_tab_label"),
								value: "address",
							},
							{
								label: t("mint_modal.form.tag_tab_label"),
								value: "tag",
							},
						]}
					/>
				</div>

				{editTab === "tag" && (
					<Button
						variant="gradient"
						size="xs"
						radius="xl"
						fw={400}
						color="var(--flr-black)"
						onClick={() => router.push('/tags')}
					>
						{t("mint_modal.form.register_new_tag_button")}
					</Button>
				)}
			</div>

			<div style={{ display: editTab === "address" ? "block" : "none" }}>
				<MemoAddressPanel form={form} />
			</div>

			<div style={{ display: editTab === "tag" ? "block" : "none" }}>
				<MemoTagPanel
					form={form}
					userTags={userTags}
					onTagSelect={onTagSelect}
					resolvedAddress={form.getValues().resolvedAddress}
					addressError={form.errors.resolvedAddress as string | undefined}
				/>
			</div>
		</div>
	);
}

const MemoAddressPanel = React.memo(function AddressPanel({
	form,
}: {
	form: UseFormReturnType<any>;
}) {
	const { t } = useTranslation();

	const { destinationAddress: address } = form.getValues();
	const addressError = form.errors.destinationAddress as string | undefined;

	return (
		<Grid align="flex-start">
			<Grid.Col span={{ base: 12, xs: 9 }}>
				<TextInput
					{...form.getInputProps("destinationAddress")}
					key={form.key("destinationAddress")}
					label={t("mint_modal.form.destination_address_label")}
					classNames={addressError ? ERROR_CLASSNAMES : LABEL_CLASSNAMES}
					rightSection={<CopyIcon text={address} color="#AFAFAF" />}
					onBlur={() => form.validateField("destinationAddress")}
				/>
			</Grid.Col>
		</Grid>
	);
});

const MemoTagPanel = React.memo(function TagPanel({
	form,
	userTags = [],
	onTagSelect,
	resolvedAddress: rawResolvedAddress = "",
	addressError,
}: {
	form: UseFormReturnType<any>;
	userTags?: ITagsByAddress[];
	onTagSelect?: (tagId: string, mintingRecipient: string) => void;
	resolvedAddress?: string;
	addressError?: string;
}) {
	const { t } = useTranslation();

	const tag = form.getValues().destinationTag;
	const resolvedAddress = tag ? rawResolvedAddress : "";
	const isLoading = tag && !resolvedAddress && !addressError;

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});
	const [search, setSearch] = useState(tag ?? "");

	const filteredTags = userTags.filter((item) =>
		item.tagId.startsWith(search)
	);

	const handleSelect = (tagId: string) => {
		const item = userTags.find((entry) => entry.tagId === tagId);
		if (item && onTagSelect) {
			onTagSelect(tagId, item.mintingRecipient);
		}
		setSearch(tagId);
		combobox.closeDropdown();
	};

	const handleSearchChange = (value: string) => {
		if (!/^\d*$/.test(value)) return;
		setSearch(value);
		form.setFieldValue("destinationTag", value);
		combobox.openDropdown();
		combobox.updateSelectedOptionIndex();
	};

	return (
		<Grid>
			<Grid.Col span={{ base: 12, xs: 3 }}>
				<Combobox
					store={combobox}
					onOptionSubmit={handleSelect}
					width="max-content"
					position="bottom-start"
					middlewares={{ flip: false }}
				>
					<Combobox.Target>
						<TextInput
							label={t("mint_modal.form.minting_tag_label")}
							classNames={LABEL_CLASSNAMES}
							value={search}
							onChange={(e) => handleSearchChange(e.currentTarget.value)}
							onClick={() => combobox.openDropdown()}
							onFocus={() => combobox.openDropdown()}
							onBlur={() => combobox.closeDropdown()}
						/>
					</Combobox.Target>

					{filteredTags.length > 0 && (
						<Combobox.Dropdown
							onMouseDown={(e) => e.preventDefault()}
							style={{ maxHeight: 220, overflowY: "auto" }}
						>
							<Combobox.Options>
								{filteredTags.map((item) => (
									<Combobox.Option key={item.tagId} value={item.tagId} className={formClasses.comboboxOption}>
										<span className="font-medium mr-2">{item.tagId}</span>
										<span className="text-12" style={{ color: "var(--flr-gray)" }}>
											{item.mintingRecipient}
										</span>
									</Combobox.Option>
								))}
							</Combobox.Options>
						</Combobox.Dropdown>
					)}
				</Combobox>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 9 }}>
				<TextInput
					label={t("mint_modal.form.destination_address_label")}
					value={addressError ? "N/A" : resolvedAddress}
					readOnly
					error={addressError}
					classNames={{
						...LABEL_CLASSNAMES,
						input: addressError ? elementClasses.inputError : elementClasses.inputReadOnly,
						error: elementClasses.inputErrorText,
					}}
					rightSection={
						isLoading ? (
							<Loader size={14} />
						) : resolvedAddress && !addressError ? (
							<DiscountCheckIcon size={16} />
						) : undefined
					}
				/>
			</Grid.Col>
		</Grid>
	);
});
