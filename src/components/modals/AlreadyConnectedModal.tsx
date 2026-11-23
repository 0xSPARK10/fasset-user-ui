import { Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import React from "react";
import FAssetButton from "@/components/elements/FAssetButton";

interface IAlreadyConnectedModal {
    opened: boolean;
    onClose: () => void;
}

export default function AlreadyConnectedModal({ opened, onClose }: IAlreadyConnectedModal) {
    const { t } = useTranslation();

    return (
        <FAssetModal
            opened={opened}
            onClose={onClose}
            title={t('already_connected_modal.title')}
            centered
        >
            <FAssetModal.Body>
                <Title
                    order={3}
                    fw={300}
                    className="mb-3"
                >
                    {t('already_connected_modal.subtitle')}
                </Title>
                <Text fw={300}>{t('already_connected_modal.description_label')}</Text>
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <FAssetButton
                    onClick={onClose}
                    fullWidth
                    className="hover:text-white"
                >
                    {t('already_connected_modal.confirm_button')}
                </FAssetButton>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
