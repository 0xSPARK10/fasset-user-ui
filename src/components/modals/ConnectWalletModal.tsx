import {
    Stack,
    Text,
    Accordion,
    Table,
    rem
} from "@mantine/core";
import React, { useState } from "react";
import { IconMinus, IconPlus, IconCheck } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { wallets } from "@/config/connectors";
import SelectWalletButton from "@/components/elements/SelectWalletButton";
import FAssetModal from "@/components/modals/FAssetModal";
import { COINS } from "@/config/coin";
import { filter } from "lodash-es";

interface IConnectWalletModal {
    opened: boolean;
    onClose: () => void;
}

export default function ConnectWalletModal({ opened, onClose }: IConnectWalletModal) {
    const [isWalletAccordionOpened, setIsWalletAccordionOpened] = useState<boolean>(false);
    const { t } = useTranslation();
    const coins = COINS.filter(coin => coin.enabled && !coin?.isStableCoin);
    const enabledWallets = filter(wallets, wallet => wallet.enabled);

    return (
        <>
            <FAssetModal
                opened={opened}
                title={<Text fw={700}>{t('connect_wallet_modal.title')}</Text>}
                onClose={onClose}
                centered
                radius="md"
                overlayProps={{ color: 'rgba(158, 164, 170, 0.55)' }}
                size={500}
                keepMounted={true}
                zIndex={9999}
            >
                <FAssetModal.Body>
                    {enabledWallets.length > 1 &&
                        <Accordion
                            radius="xs"
                            chevron={isWalletAccordionOpened ? <IconMinus /> : <IconPlus />}
                            disableChevronRotation={true}
                            onChange={() => setIsWalletAccordionOpened(!isWalletAccordionOpened)}
                            value={isWalletAccordionOpened ? 'WALLET_INFO' : null}
                            classNames={{
                                control: 'px-6 bg-white hover:bg-white',
                                panel: 'bg-white border-t border-black',
                                content: 'px-6 py-4'
                            }}
                            styles={{
                                root: {
                                    boxShadow: '0px 7px 7px -5px rgba(0, 0, 0, 0.0392)'
                                }
                            }}
                            className="mb-10"
                        >
                            <Accordion.Item
                                key="WALLET_INFO"
                                value="WALLET_INFO"
                            >
                                <Accordion.Control>
                                    <Text size="sm" fw={700}>{t('connect_wallet_modal.wallet_title')}</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Text size="sm" className="whitespace-pre-line mb-3">
                                        {t('connect_wallet_modal.wallet_description_label')}
                                    </Text>
                                    <Table
                                        styles={{
                                            table: {
                                                border: 'none'
                                            },
                                            td: {
                                                borderBottom: 'none',
                                                borderTop: '1px solid rgba(231, 231, 231, 1)'
                                            }
                                        }}
                                        className="w-fit"
                                    >
                                        <Table.Tbody>
                                            <Table.Tr>
                                                <Table.Td style={{ borderTop: 'none' }} />
                                                {coins.map(coin => (
                                                    <Table.Td key={coin.type} style={{ borderTop: 'none' }}>
                                                        {coin.nativeIcon && coin.nativeIcon({ width: "18", height: "18" })}
                                                    </Table.Td>
                                                ))}
                                            </Table.Tr>
                                            {enabledWallets.map(wallet => (
                                                <Table.Tr key={wallet.id}>
                                                    <Table.Td>
                                                        <wallet.icon
                                                            height={'18px'}
                                                            width={'18px'}
                                                        />
                                                    </Table.Td>
                                                    {coins.map(coin => (
                                                        <Table.Td key={coin.type}>
                                                            {coin.supportedWallets?.includes(wallet.id)
                                                                ? <IconCheck style={{ width: rem(18), height: rem(18) }} />
                                                                : ''
                                                            }
                                                        </Table.Td>
                                                    ))}
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    }
                    <Stack>
                        <Stack justify="flex-start">
                            {wallets.walletConnect.enabled &&
                                <SelectWalletButton
                                    wallet={wallets.walletConnect}
                                    selectNetwork={true}
                                />
                            }
                            {wallets.metaMask.enabled &&
                                <SelectWalletButton
                                    wallet={wallets.metaMask}
                                />
                            }
                            {wallets.ledger.enabled &&
                                <SelectWalletButton
                                    wallet={wallets.ledger}
                                    selectNetwork={true}
                                />
                            }
                            {wallets.xaman.enabled &&
                                <SelectWalletButton
                                    wallet={wallets.xaman}
                                />
                            }
                        </Stack>
                    </Stack>
                </FAssetModal.Body>
            </FAssetModal>
        </>
    );
}
