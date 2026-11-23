import { Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import FAssetButton from "@/components/elements/FAssetButton";

interface ILedgerConfirmTransactionCard {
    isLoading: boolean;
    isDisabled: boolean;
    appName: string;
    onClick: () => void;
    confirmLabel?: string;
    className?: string;
}

export default function LedgerConfirmTransactionCard({ isLoading, isDisabled, onClick, appName, confirmLabel, className } : ILedgerConfirmTransactionCard) {
    const { t } = useTranslation();

    return (
        <Paper
            radius="lg"
            className={`p-8 mt-8 mb-4 ${className ? className : ''}`}
            styles={{
                root: {
                    backgroundColor: 'var(--flr-lightest-blue)'
                }
            }}
        >
            <Text
                className="text-16"
                fw={400}
                c="var(--flr-black)"
            >
                {t('ledger.launch_ledger_app_label', { appName: appName })}
            </Text>
            <FAssetButton
                fullWidth
                className="hover:text-white mt-5"
                onClick={onClick}
                loading={isLoading}
                disabled={isDisabled}
            >
                {confirmLabel ? confirmLabel : t('ledger.confirm_transaction_button')}
            </FAssetButton>
        </Paper>
    );
}
