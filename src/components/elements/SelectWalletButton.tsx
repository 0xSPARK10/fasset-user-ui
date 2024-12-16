import { useState } from "react";
import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import SelectNetworkModal from "@/components/modals/SelectNetworkModal";
import AlreadyConnectedModal from "@/components/modals/AlreadyConnectedModal";
import { IWallet } from "@/config/connectors";
import { useConnectWalletModal } from "@/hooks/useWeb3Modal";
import { useWeb3 } from "@/hooks/useWeb3";
import { notifications } from "@mantine/notifications";
import { INetwork } from "@/types";
import { COINS } from "@/config/coin";
import { WALLET } from "@/constants";
import classes from "@/styles/components/elements/SelectWalletButton.module.scss";

interface ISelectWalletButton {
    wallet: IWallet;
    disabled?: boolean;
    selectNetwork?: boolean;
}

export default function SelectWalletButton({ wallet, disabled = false, selectNetwork = false }: ISelectWalletButton) {
    const [isSelectNetworkModalActive, setIsSelectNetworkModalActive] = useState<boolean>(false);
    const [isAlreadyConnectedModalActive, setIsAlreadyConnectedModalActive] = useState<boolean>(false);
    const {
        connect,
        connectedWallets,
        disconnect,
        connectedCoins,
        walletConnectConnector
    } = useWeb3();
    const { t } = useTranslation();
    const { closeConnectWalletModal, openConnectWalletModalCallback, openConnectWalletModal } = useConnectWalletModal();
    const router = useRouter();
    const queryClient = useQueryClient();
    const buttonSize = useElementSize();

    const isActive = connectedWallets.includes(wallet.id);
    const walletConnectedCoins = connectedCoins.filter(coin => coin.connectedWallet === wallet.id &&
        coin?.nativeIcon !== undefined &&
        coin?.supportedWallets?.includes(wallet.id));

    const availableOptions = COINS
        .filter(coin => coin?.supportedWallets?.includes(wallet.id) && coin.enabled)

    const isConnectedToAllNetworks = availableOptions.filter(coin => connectedCoins.map(coin => coin.type).includes(coin.type)).length === availableOptions.length;
    
    const onClick = async() => {
        try {
            if (!isActive) {
                if (isConnectedToAllNetworks) {
                    closeConnectWalletModal();
                    setIsAlreadyConnectedModalActive(true);
                    return;
                }
                if (selectNetwork) {
                    closeConnectWalletModal(undefined, false);
                    setIsSelectNetworkModalActive(true);
                    return;
                }

                await connect(wallet.id, []);
                queryClient.clear();
                await queryClient.invalidateQueries();
                if (openConnectWalletModalCallback) {
                    openConnectWalletModalCallback(wallet.id);
                }
            } else {
                await disconnect(wallet.id, false);
            }
        } catch (error: any) {
            notifications.show({
                title: t('select_wallet_button.error_title'),
                color: 'red',
                message: error.code === 4001 ? t('select_wallet_button.user_rejected_request_label') : (error?.name ?? error?.message)
            });
            walletConnectConnector.web3Modal?.closeModal();
            closeConnectWalletModal();
        }
    }

    const onCloseSelectNetworkModal = async (networks: INetwork[], isConnected: boolean) => {
        setIsSelectNetworkModalActive(false);
        if (networks.length === 0) {
            if (isConnected && wallet.id === WALLET.LEDGER && router.pathname === '/connect') {
                await router.push('/mint');
                return;
            }

            if (isConnected && router.pathname !== '/') {
                return;
            }

            openConnectWalletModal();
            return;
        }

        try {
            await connect(wallet.id, networks);
            if (openConnectWalletModalCallback) {
                openConnectWalletModalCallback(wallet.id);
            }
        } catch (error: any) {
            notifications.show({
                title: t('select_wallet_button.error_title'),
                color: 'red',
                message: error.code === 4001 ? t('select_wallet_button.user_rejected_request_label') : error.name
            });
            walletConnectConnector.web3Modal?.closeModal();
            closeConnectWalletModal();
        }
    }

    const onCloseAlreadyConnectedModal = () => {
        setIsAlreadyConnectedModalActive(false);
        openConnectWalletModal();
    }

    return (
        <>
            <UnstyledButton disabled={disabled}>
                <Box
                    ref={buttonSize.ref}
                    pr="14px"
                    pl="30px"
                    p={9}
                    style={(theme) => ({
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        color: isActive ? '#ffffff' : '#242425',
                    })}
                    className={`${wallet.id === WALLET.LEDGER ? classes.ledger : ''} ${classes.button} ${isActive ? classes.isActive : ''}`}
                    onClick={onClick}
                >
                    <Group
                        justify="space-between"
                        wrap="nowrap"
                    >
                        <Stack gap={0} className="whitespace-nowrap overflow-hidden">
                            <Text
                                fw={700}
                                c="var(--flr-black)"
                                className="truncate"
                            >
                                {wallet.name}
                            </Text>
                            <Text
                                c="var(--flr-black)"
                                className="truncate text-12"
                                fw={500}
                            >
                                {isActive
                                    ? t('select_wallet_button.disconnect_label')
                                    : t('select_wallet_button.connect_label')
                                }
                            </Text>
                        </Stack>
                        <div className="flex items-center">
                            {walletConnectedCoins.map((coin, index) => (
                                coin?.nativeIcon
                                    ? <div key={index}>
                                        {coin?.nativeIcon({
                                            width: '25',
                                            height: '25',
                                            className: 'ml-1',
                                            style: {
                                                border: '1.5px solid #fff',
                                                borderRadius: '100%',
                                                backgroundColor: '#fff',
                                                zIndex: 100
                                            }
                                        })}
                                    </div>
                                    : ''
                            ))}
                            <wallet.icon
                                height={'45px'}
                                width={'45px'}
                                className={`${wallet.id === WALLET.LEDGER && isActive ? classes.ledgerIcon : ''} ml-2.5 mr-1`}
                            />
                        </div>
                    </Group>
                </Box>
            </UnstyledButton>
            {selectNetwork &&
                <SelectNetworkModal
                    opened={isSelectNetworkModalActive}
                    onClose={onCloseSelectNetworkModal}
                    wallet={wallet}
                />
            }
            <AlreadyConnectedModal
                opened={isAlreadyConnectedModalActive}
                onClose={onCloseAlreadyConnectedModal}
            />
        </>
    );
}
