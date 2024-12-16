import { Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useWeb3 } from "@/hooks/useWeb3";

interface IWalletConnectOpenWalletCard {}

export default function WalletConnectOpenWalletCard() {
    const { t } = useTranslation();
    const { walletConnectConnector } = useWeb3();

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
                {t('wallet_connect_open_wallet_card.title', {
                    wallet: walletConnectConnector.connectedWallet
                })}
            </Text>
        </Paper>
    );
}
