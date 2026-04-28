import React, { useState } from "react";
import {
	Button,
	Grid,
	Loader,
	SegmentedControl,
	Text,
	TextInput,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import CopyIcon from "@/components/icons/CopyIcon";
import { truncateString } from "@/utils";
import classes from "@/styles/components/elements/DestinationAddressField.module.scss";
import DiscountCheckIcon from "../icons/DiscountCheckIcon";
import { useRouter } from "next/router";

interface IMintDestinationEditor {
	form: UseFormReturnType<any>;
	isAddressTagLoading?: boolean;
}

const LABEL_CLASSNAMES = { label: "uppercase text-12" };
const ERROR_CLASSNAMES = {
	label: "uppercase text-12",
	input: classes.inputError,
	error: classes.inputErrorText,
};

export default function MintDestinationEditor({
	form,
	isAddressTagLoading = false,
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

				<Grid.Col span={{ base: 12, xs: 1.5 }}>
					<Text c="var(--flr-gray)" className="text-12 uppercase">
						{t("mint_modal.form.tag_label")}
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
				<MemoTagPanel form={form} />
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
}: {
	form: UseFormReturnType<any>;
}) {
	const { t } = useTranslation();

	const { destinationTag: tag, resolvedAddress: rawResolvedAddress } = form.getValues();
	const resolvedAddress = tag ? rawResolvedAddress : "";
	const addressError = form.errors.resolvedAddress as string | undefined;

	const isLoading = tag && !resolvedAddress && !addressError;

	return (
		<Grid>
			<Grid.Col span={{ base: 12, xs: 3 }}>
				<TextInput
					{...form.getInputProps("destinationTag")}
					key={form.key("destinationTag")}
					label={t("mint_modal.form.tag_label")}
					classNames={LABEL_CLASSNAMES}
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 9 }}>
				<TextInput
					label={t("mint_modal.form.destination_address_label")}
					value={addressError ? "N/A" : resolvedAddress}
					readOnly
					error={addressError}
					classNames={{
						...LABEL_CLASSNAMES,
						input: addressError ? classes.inputError : classes.inputReadOnly,
						error: classes.inputErrorText,
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
