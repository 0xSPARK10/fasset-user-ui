import { Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";


export default function XamanOpenWalletCard() {
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
                {t('xaman_open_wallet_card.description_label')}
            </Text>
        </Paper>
    );
}
