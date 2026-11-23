import { Loader, Paper, Stack, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import FAssetButton from "@/components/elements/FAssetButton";
import FormAlert from "@/components/elements/FormAlert";
import { useWeb3 } from "@/hooks/useWeb3";
import { FireblocksWhitelistTarget } from "@/connectors/FireblocksConnector";
import { createLogger } from "@/utils/debug";

const log = createLogger("FIREBLOCKS:whitelist");

interface IFireblocksPaymentCard {
    // undefined while the core vault address is loading or the payment has no tag
    target: FireblocksWhitelistTarget | undefined;
    // The core vault address could not be loaded, so there is no target to check
    isTargetError: boolean;
    onPay: () => void;
    isPaying: boolean;
}

function errorKey(error: unknown): string {
    return error instanceof Error && error.message.startsWith("fireblocks.") ? error.message : "fireblocks.request_failed";
}

/**
 * Fireblocks pays only to a whitelisted address, so the payment step first makes sure the
 * FAssets core vault + this minting tag is on the user's whitelist.
 */
export default function FireblocksPaymentCard({ target, isTargetError, onPay, isPaying }: IFireblocksPaymentCard) {
    const { t } = useTranslation();
    const { fireblocksConnector } = useWeb3();

    const whitelist = useQuery({
        queryKey: ["fireblocks", "whitelist", target?.address, target?.tag],
        queryFn: () => {
            if (!target) throw new Error("fireblocks.request_failed");
            return fireblocksConnector.getWhitelist(target).catch((error: unknown) => {
                log.error("whitelist check failed", error);
                throw error;
            });
        },
        enabled: target !== undefined,
        retry: false,
    });

    const requestWhitelist = useMutation({
        mutationFn: () => {
            if (!target) throw new Error("fireblocks.request_failed");
            return fireblocksConnector.requestWhitelist(target).catch((error: unknown) => {
                log.error("whitelist request failed", error);
                throw error;
            });
        },
        onSuccess: () => whitelist.refetch(),
    });

    const renderBody = () => {
        if (isTargetError) return <FormAlert message={t("fireblocks.minting_info_failed")} />;
        if (!target || whitelist.isPending) return <Loader size="sm" />;
        if (whitelist.isError) return <FormAlert message={t(errorKey(whitelist.error))} />;

        const { kind } = whitelist.data;
        if (kind === "missing") {
            return (
                <>
                    <Text size="sm">{t("fireblocks.whitelist_missing", { address: target.address, tag: target.tag })}</Text>
                    <FormAlert message={requestWhitelist.isError ? t(errorKey(requestWhitelist.error)) : undefined} />
                    <FAssetButton onClick={() => requestWhitelist.mutate()} loading={requestWhitelist.isPending}>
                        {t("fireblocks.whitelist_request_button")}
                    </FAssetButton>
                </>
            );
        }
        if (kind === "pending") {
            return (
                <>
                    <FormAlert type="warning" message={t("fireblocks.whitelist_pending", { address: target.address, tag: target.tag })} />
                    <FAssetButton variant="secondary" onClick={() => whitelist.refetch()} loading={whitelist.isFetching}>
                        {t("fireblocks.whitelist_check_button")}
                    </FAssetButton>
                </>
            );
        }
        return (
            <>
                <Text size="sm">{t("fireblocks.whitelist_approved", { address: target.address, tag: target.tag })}</Text>
                {isPaying
                    ? <FormAlert type="info" message={t("fireblocks.awaiting_approval")} />
                    : <FAssetButton onClick={onPay}>{t("fireblocks.send_payment_button")}</FAssetButton>}
            </>
        );
    };

    return (
        <Paper
            radius="lg"
            className="p-8 mt-8 mb-4"
            styles={{ root: { backgroundColor: "var(--flr-lightest-blue)" } }}
        >
            <Stack gap="md">
                <Text fw={700}>{t("fireblocks.whitelist_title")}</Text>
                {renderBody()}
            </Stack>
        </Paper>
    );
}
