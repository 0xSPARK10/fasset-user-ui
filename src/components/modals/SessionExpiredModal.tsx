import {
    Text
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import FAssetButton from "@/components/elements/FAssetButton";

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
                <FAssetButton
                    onClick={onClose}
                    fullWidth
                    className="hover:text-white"
                >
                    {t('session_expired_modal.confirm_button')}
                </FAssetButton>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
