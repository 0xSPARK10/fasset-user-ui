import React, { useEffect, useState } from "react";
import {
    Checkbox,
    Stack,
    Button,
    Title,
    Text,
    Stepper,
    rem
} from "@mantine/core";
import { IconSettings, IconCheck, IconLock } from "@tabler/icons-react";
import { useListState } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import FAssetModal from "@/components/modals/FAssetModal";
import { COINS } from "@/config/coin";
import { uniqBy } from "lodash-es";
import { useTranslation } from "react-i18next";
import { INetwork } from "@/types";
import { IWallet } from "@/config/connectors";
import { WALLET } from "@/constants";
import { useWeb3 } from "@/hooks/useWeb3";

interface ISelectNetworkModal {
    opened: boolean;
    onClose: (networks: INetwork[], isConnected: boolean) => void;
    wallet: IWallet;
}

interface ILocalNetwork extends INetwork {
    checked: boolean;
    disabled: boolean;
    required: boolean
}

const enabledNetworks = uniqBy(
    COINS
        .filter(coin => coin.enabled)
        .map(coin => {
            return {
                ...coin.network,
                supportedWallets: coin.supportedWallets,
                required: coin?.network?.isMandatory || false,
                disabled: false,
                checked: true
            }
        })
    , 'name');

const STEP_CHOOSE_NETWORK = 0;
const STEP_CONNECT_LEDGER = 1;

export default function SelectNetworkModal({ opened, onClose, wallet }: ISelectNetworkModal) {
    const [currentStep, setCurrentStep] = useState<number>(STEP_CHOOSE_NETWORK);
    const [currentNetworkToConnect, setCurrentNetworkToConnect] = useState<ILocalNetwork>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [networksToConnect, setNetworksToConnect] = useState<ILocalNetwork[]>();
    const [currentNetworkStep, setCurrentNetworkStep] = useState<number>(0);

    const { t } = useTranslation();
    const [networks, networkHandlers] = useListState(enabledNetworks);
    const { connect, disconnect, connectedCoins, isConnected } = useWeb3();
    const queryClient = useQueryClient();
    const router = useRouter();

    const selectedNetworks: ILocalNetwork[] = networks.filter(network => network.checked && (isConnected ? !network.disabled : true));

    useEffect(() => {
        if (!opened) {
            networkHandlers.setState(enabledNetworks.filter(network => network.supportedWallets?.includes(wallet.id)));
            return;
        }

        networkHandlers.apply(item => {
            return {
                ...item,
                disabled: connectedCoins.find(connectedCoin => connectedCoin.network.name === item.name) !== undefined
            }
        })

        return () => {
            setCurrentStep(STEP_CHOOSE_NETWORK);
            setNetworksToConnect([]);
            setCurrentNetworkStep(0);
        }
    }, [opened]);

    const closeModal = async (networks: ILocalNetwork[] = []) => {
        networkHandlers.apply(network => ({
            ...network,
            disabled: false,
            checked: true
        }));

        if (currentStep === STEP_CONNECT_LEDGER) {
            setCurrentNetworkToConnect(undefined);
            await disconnect(WALLET.LEDGER, router.pathname === '/mint');
        }

        setCurrentStep(STEP_CHOOSE_NETWORK);
        networks = networks.filter(network => !isConnected ? true : !network.disabled)
        onClose(networks, isConnected);
    }

    const onConnect = async () => {
        if (wallet.id === WALLET.LEDGER) {
            setNetworksToConnect(selectedNetworks);
            setCurrentNetworkToConnect(selectedNetworks[0]);
            setCurrentStep(STEP_CONNECT_LEDGER);
        } else {
            await closeModal(selectedNetworks);
        }
    }

    const onLedgerConnect = async() => {
        setIsLoading(true);
        const status = await connect(WALLET.LEDGER, [currentNetworkToConnect!]);
        setIsLoading(false);
        if (!status) return;

        const index = selectedNetworks.findIndex(network => network.name === currentNetworkToConnect?.name);
        if (index > -1 && index < selectedNetworks.length) {
            setCurrentNetworkToConnect(selectedNetworks[index + 1]);
            setCurrentNetworkStep(currentNetworkStep + 1);
            if (index + 1 === selectedNetworks.length) {
                setCurrentStep(STEP_CHOOSE_NETWORK);
                queryClient.clear();
                await queryClient.invalidateQueries();
                onClose([], true);
            }
        }
    }

    const connectedToNetworkLabel = (network: INetwork) => {
        const coin = connectedCoins.find(coin => coin.network.name === network.name && coin.network.chainId === network.chainId);

        if (coin) {
            return `(${t('select_network_modal.connected_via_network_label', { wallet: coin.connectedWallet })})`;
        }

        return '';
    }

    return (
        <FAssetModal
            title={t('select_network_modal.title')}
            opened={opened}
            centered
            size={500}
            zIndex={9999}
            onClose={closeModal}
        >
            <FAssetModal.Body>
                <Stepper
                    active={currentStep}
                    size="xs"
                >
                    <Stepper.Step
                        withIcon={false}
                    >
                        <Title
                            order={3}
                            fw={300}
                            className="mb-8"
                        >
                            {t('select_network_modal.select_networks_title')}
                        </Title>
                        {opened &&
                            <Stack>
                                {networks.map((network, index) => (
                                    <Checkbox
                                        icon={({ indeterminate, ...others }) => {
                                            return network.disabled
                                                ? <IconLock
                                                    {...others}
                                                    style={{ width: rem(15), height: rem(15) }}
                                                />
                                                : <IconCheck
                                                    {...others}
                                                    style={{ width: rem(15), height: rem(15) }}
                                                />
                                        }}
                                        label={
                                            <div className="flex items-center">
                                                {network.icon && network.icon({ width: '20', height: '20', className: 'flex-shrink-0 mr-2' })}
                                                {network.name} {network.isMandatory && !network.disabled && `(${t('select_network_modal.mandatory_label')})`} {network.disabled && connectedToNetworkLabel(network)}
                                            </div>
                                        }
                                        checked={network.checked}
                                        key={index}
                                        disabled={network.disabled}
                                        onChange={(event) => network.isMandatory
                                            ? () => {}
                                            : networkHandlers.setItemProp(index, 'checked', event.currentTarget.checked)
                                        }
                                    />
                                ))}
                            </Stack>
                        }
                    </Stepper.Step>
                    <Stepper.Step
                        withIcon={false}
                    >
                        <Title
                            order={3}
                            fw={300}
                        >
                            {t('select_network_modal.ledger.title', {
                                appName: currentNetworkToConnect?.ledgerApp,
                                stepsCount: networksToConnect?.length,
                                currentStep: currentNetworkStep + 1
                            })}
                        </Title>
                        <Text
                            className="mt-5 whitespace-pre-line"
                        >
                            {t('select_network_modal.ledger.description_label', {
                                network: currentNetworkToConnect?.name,
                                appName: currentNetworkToConnect?.ledgerApp
                            })}
                        </Text>
                        <Text
                            className="mt-2 mb-5 whitespace-pre-line"
                        >
                            {t('select_network_modal.ledger.repeat_label')}
                        </Text>
                        <Stepper
                            active={currentNetworkStep}
                            size="xs"
                            color="var(--mantine-color-flare-6)"
                            orientation="vertical"
                        >
                            {networksToConnect?.map((network, index) => (
                                <Stepper.Step
                                    key={index}
                                    label={<Text size="sm" className="mt-2">
                                        {`${index + 1}. ${t('select_network_modal.ledger.connect_to_label', { network: network.name })}`}
                                    </Text>}
                                    icon={
                                        <IconSettings
                                            style={{ width: rem(18), height: rem(18) }}
                                        />
                                    }
                                    completedIcon={
                                        <IconCheck
                                            style={{ width: rem(18), height: rem(18) }}
                                            color="var(--mantine-color-black)"
                                        />
                                    }
                                    loading={currentNetworkStep === index}
                                >
                                </Stepper.Step>
                            ))}
                        </Stepper>
                    </Stepper.Step>
                </Stepper>
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <div className="flex justify-between">
                    <Button
                        variant="filled"
                        color="var(--mantine-color-black)"
                        radius="xl"
                        size="sm"
                        fullWidth
                        className="font-light hover:text-white"
                        onClick={currentStep === STEP_CHOOSE_NETWORK ? onConnect : onLedgerConnect}
                        disabled={selectedNetworks.length === 0}
                        loading={isLoading}
                    >
                        {currentStep === STEP_CHOOSE_NETWORK
                            ? wallet.id !== WALLET.LEDGER ? t('select_network_modal.connect_button') : t('select_network_modal.next_button')
                            : t('select_network_modal.ledger.connect_button', {
                                network: currentNetworkToConnect?.name
                            })
                        }
                    </Button>
                </div>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
