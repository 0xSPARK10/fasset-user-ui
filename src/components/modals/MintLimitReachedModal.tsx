import React from "react";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import FAssetModal from "./FAssetModal";
import { Anchor, Paper, rem, Text } from "@mantine/core";
import { IconArrowUpRight } from "@tabler/icons-react";

export interface IMintLimitReachedModal {
	opened: boolean;
	onClose: () => void;
	resumedTimestamp: number;
}

const MintLimitReachedModal = ({
	opened,
	onClose,
	resumedTimestamp,
}: IMintLimitReachedModal) => {
	const { t } = useTranslation();

	return (
		<FAssetModal
			opened={opened}
			onClose={onClose}
			centered
			size={560}
			closeOnClickOutside={false}
			title={t("mint_limit_reached_modal.title")}
		>
			<FAssetModal.Body>
				<div>
					<Text className="text-32" fw={300} c="var(--flr-black">
						{t("mint_limit_reached_modal.subtitle")}
					</Text>
					<Text className="text-16 mt-4" fw={400} c="var(--flr-black)">
						{t("mint_limit_reached_modal.description", {
							resumedTimestamp: moment.unix(resumedTimestamp).format('D.M.YYYY HH:mm'),
						})}
					</Text>
					<Paper
						radius="md"
						className="p-5 mt-8 mb-4"
						styles={{
							root: {
								backgroundColor: "var(--flr-lightest-blue)",
							},
						}}
					>
						<Trans
							i18nKey={t("mint_limit_reached_modal.additional_info")}
							components={{
								bold: <strong />,
								a: (
									<Anchor
										underline="always"
										href={"https://dev.flare.network/fassets/minting"}
										target="_blank"
										className="inline-flex"
										c="black"
										fw={500}
									/>
								),
								icon: (
									<IconArrowUpRight
										style={{ width: rem(20), height: rem(20) }}
										className="ml-1"
									/>
								),
							}}
							parent={Text}
							className="text-16"
							fw={400}
						/>
					</Paper>
				</div>
			</FAssetModal.Body>
		</FAssetModal>
	);
};

export default MintLimitReachedModal;
