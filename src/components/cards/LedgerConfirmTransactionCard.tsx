import { Button, Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface ILedgerConfirmTransactionCard {
    isLoading: boolean;
    appName: string;
    onClick: () => void;
}

export default function LedgerConfirmTransactionCard({ isLoading, onClick, appName } : ILedgerConfirmTransactionCard) {
    const { t } = useTranslation();

    return (
        <Paper
            radius="lg"
            className="p-8 mt-8 mb-4"
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
            <Button
                variant="filled"
                color="black"
                radius="xl"
                size="sm"
                fullWidth
                className="hover:text-white font-normal mt-5"
                onClick={onClick}
                loading={isLoading}
            >
                {t('ledger.confirm_transaction_button')}
            </Button>
        </Paper>
    );
}
