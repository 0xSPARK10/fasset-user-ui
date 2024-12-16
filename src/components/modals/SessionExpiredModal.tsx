import {
    Button,
    Text
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";

interface ISessionExpiredModal {
    opened: boolean;
    onClose: () => void;
}

export default function SessionExpiredModal({ opened, onClose }: ISessionExpiredModal) {
    const { t } = useTranslation();

    return (
        <FAssetModal
            opened={opened}
            onClose={onClose}
            centered
            title={t('session_expired_modal.title')}
        >
            <FAssetModal.Body>
                <Text
                    size="sm"
                    className="whitespace-pre-line"
                >
                    {t('session_expired_modal.description_label')}
                </Text>
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <Button
                    onClick={onClose}
                    variant="filled"
                    color="black"
                    radius="xl"
                    size="sm"
                    fullWidth
                    className="hover:text-white font-normal mb-5"
                >
                    {t('session_expired_modal.confirm_button')}
                </Button>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
