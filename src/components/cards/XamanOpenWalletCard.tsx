import { Button, Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface IXamanOpenWalletCard {
    onClick?: () => void;
    confirmButton?: boolean;
    isLoading?: boolean;
}

export default function XamanOpenWalletCard({ onClick, confirmButton = false, isLoading = false }: IXamanOpenWalletCard) {
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
                {confirmButton ? t('xaman_open_wallet_card.mobile_description_label') : t('xaman_open_wallet_card.description_label')}
            </Text>
            {confirmButton &&
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
                    {t('xaman_open_wallet_card.confirm_button')}
                </Button>
            }
        </Paper>
    );
}
