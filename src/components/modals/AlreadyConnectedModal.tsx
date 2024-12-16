import { Button, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import React from "react";

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
                <Button
                    onClick={onClose}
                    variant="filled"
                    color="black"
                    radius="xl"
                    size="sm"
                    fullWidth
                    className="hover:text-white font-normal"
                >
                    {t('already_connected_modal.confirm_button')}
                </Button>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
