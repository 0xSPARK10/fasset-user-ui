import React, { useEffect, useState } from "react";
import { Checkbox, Code, CopyButton, FileInput, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import FAssetModal from "@/components/modals/FAssetModal";
import FAssetButton from "@/components/elements/FAssetButton";
import FormAlert from "@/components/elements/FormAlert";
import { useWeb3 } from "@/hooks/useWeb3";
import { FXRP } from "@/config/coin";
import { FIREBLOCKS_REGIONS, FireblocksVault, getEvmAssetId, isFireblocksRegion } from "@/core/fireblocks";

interface IFireblocksConnectModal {
    opened: boolean;
    onClose: (isConnected: boolean) => void;
}

type Step = "key" | "apiKey" | "vault";

const OPENSSL_COMMAND =
    'openssl req -new -newkey rsa:4096 -nodes -keyout fireblocks.key -out fireblocks.csr -subj "/CN=FAsset Minting App"';

const REGION_LABELS: Record<(typeof FIREBLOCKS_REGIONS)[number], string> = {
    us: "US",
    eu: "EU",
    eu2: "EU2",
};

const schema = yup.object({
    apiKey: yup.string().trim().uuid("fireblocks.api_key_invalid_error").required("fireblocks.api_key_invalid_error"),
    region: yup.string().oneOf([...FIREBLOCKS_REGIONS]).required(),
});

function errorKey(error: unknown): string {
    return error instanceof Error && error.message.startsWith("fireblocks.") ? error.message : "fireblocks.request_failed";
}

export default function FireblocksConnectModal({ opened, onClose }: IFireblocksConnectModal) {
    const { t } = useTranslation();
    const { fireblocksConnector, mainToken, getConnectedCoin } = useWeb3();
    const [step, setStep] = useState<Step>("key");
    const [keyFile, setKeyFile] = useState<File | null>(null);
    const [hasStoredKey, setHasStoredKey] = useState(false);
    const [vaults, setVaults] = useState<FireblocksVault[]>([]);
    const [vaultId, setVaultId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [connectFlare, setConnectFlare] = useState(true);
    const asset = FXRP.enabled ? "XRP" : "XRP_TEST";
    // Fireblocks has the Flare asset (not on Coston / Coston2) and no other wallet holds the Flare side
    const canConnectFlare = !!mainToken && getEvmAssetId(mainToken.type) !== undefined && !getConnectedCoin(mainToken.type);

    const form = useForm({
        mode: "controlled",
        initialValues: { apiKey: "", region: "us" },
        validate: yupResolver(schema),
    });

    useEffect(() => {
        if (!opened) return;
        setStep("key");
        setKeyFile(null);
        setErrorMessage(undefined);
        setConnectFlare(true);
        fireblocksConnector
            .hasKey()
            .then(setHasStoredKey)
            .catch((error: unknown) => setErrorMessage(t(errorKey(error))));
    }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

    const run = async (action: () => Promise<void>) => {
        setErrorMessage(undefined);
        setIsLoading(true);
        try {
            await action();
        } catch (error) {
            setErrorMessage(t(errorKey(error), { asset }));
        } finally {
            setIsLoading(false);
        }
    };

    const onKeyContinue = () => {
        void run(async () => {
            if (keyFile) {
                await fireblocksConnector.importKey(await keyFile.text());
                setHasStoredKey(true);
                setKeyFile(null);
            }
            setStep("apiKey");
        });
    };

    const onLoadVaults = form.onSubmit(({ apiKey, region }) => {
        if (!isFireblocksRegion(region)) return;
        void run(async () => {
            const result = await fireblocksConnector.listVaults({ apiKey: apiKey.trim(), region });
            if (result.length === 0) throw new Error("fireblocks.no_vaults_label");
            setVaults(result);
            setVaultId(result[0].id);
            setStep("vault");
        });
    });

    const onConnect = () => {
        const { apiKey, region } = form.getValues();
        if (!vaultId || !isFireblocksRegion(region)) return;
        void run(async () => {
            await fireblocksConnector.connect({ apiKey: apiKey.trim(), region, vaultId, connectFlare: canConnectFlare && connectFlare });
            onClose(true);
        });
    };

    return (
        <FAssetModal opened={opened} onClose={() => onClose(false)} centered size="lg" title={t("fireblocks.connect_title")}>
            <FAssetModal.Body>
                <Stack gap="md">
                    <FormAlert message={errorMessage} />

                    {step === "key" && (
                        <>
                            <Text size="sm">{t("fireblocks.key_instructions")}</Text>
                            <Code block>{OPENSSL_COMMAND}</Code>
                            <CopyButton value={OPENSSL_COMMAND}>
                                {({ copied, copy }) => (
                                    <FAssetButton variant="secondary" onClick={copy}>
                                        {copied ? t("fireblocks.command_copied_label") : t("fireblocks.copy_command_button")}
                                    </FAssetButton>
                                )}
                            </CopyButton>
                            {hasStoredKey && <Text size="sm">{t("fireblocks.key_stored_note")}</Text>}
                            <FileInput
                                id="fireblocks-key-file"
                                label={t("fireblocks.key_file_label")}
                                accept=".key,.pem"
                                clearable
                                value={keyFile}
                                onChange={setKeyFile}
                            />
                            <Text size="xs" c="dimmed">{t("fireblocks.key_stays_local_note")}</Text>
                        </>
                    )}

                    {step === "apiKey" && (
                        <>
                            <TextInput
                                id="fireblocks-api-key"
                                label={t("fireblocks.api_key_label")}
                                autoComplete="off"
                                {...form.getInputProps("apiKey")}
                                error={form.errors.apiKey ? t(String(form.errors.apiKey)) : undefined}
                            />
                            <Select
                                id="fireblocks-region"
                                label={t("fireblocks.region_label")}
                                data={FIREBLOCKS_REGIONS.map((region) => ({ value: region, label: REGION_LABELS[region] }))}
                                allowDeselect={false}
                                {...form.getInputProps("region")}
                            />
                        </>
                    )}

                    {step === "vault" && (
                        <Select
                            id="fireblocks-vault"
                            label={t("fireblocks.vault_label")}
                            data={vaults.map((vault) => ({ value: vault.id, label: vault.name }))}
                            value={vaultId}
                            onChange={setVaultId}
                            allowDeselect={false}
                        />
                    )}

                    {step === "vault" && (
                        <Stack gap="xs">
                            <Text size="sm" fw={500}>{t("fireblocks.networks_label")}</Text>
                            <Checkbox id="fireblocks-network-xrpl" label={t("fireblocks.network_xrpl_label")} checked disabled />
                            {canConnectFlare && mainToken && (
                                <Checkbox
                                    id="fireblocks-network-flare"
                                    label={t("fireblocks.network_flare_label", { network: mainToken.network.name, token: mainToken.type })}
                                    checked={connectFlare}
                                    onChange={(event) => setConnectFlare(event.currentTarget.checked)}
                                />
                            )}
                        </Stack>
                    )}
                </Stack>
            </FAssetModal.Body>
            <FAssetModal.Footer>
                <Group grow className="w-full">
                    {step !== "key" && (
                        <FAssetButton variant="secondary" onClick={() => setStep(step === "vault" ? "apiKey" : "key")}>
                            {t("fireblocks.back_button")}
                        </FAssetButton>
                    )}
                    {step === "key" && (
                        <FAssetButton onClick={onKeyContinue} loading={isLoading} disabled={!keyFile && !hasStoredKey}>
                            {t("fireblocks.continue_button")}
                        </FAssetButton>
                    )}
                    {step === "apiKey" && (
                        <FAssetButton onClick={() => onLoadVaults()} loading={isLoading}>
                            {t("fireblocks.continue_button")}
                        </FAssetButton>
                    )}
                    {step === "vault" && (
                        <FAssetButton onClick={onConnect} loading={isLoading} disabled={!vaultId}>
                            {t("fireblocks.connect_button")}
                        </FAssetButton>
                    )}
                </Group>
            </FAssetModal.Footer>
        </FAssetModal>
    );
}
