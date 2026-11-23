import React from "react";
import { Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";

// A token icon in a "Latest transactions" row that names its network on hover — the badged
// FXRP icons differ only slightly per chain. `labelKey` is a `bridge_page.chains.*` key.
export default function NetworkIcon({ icon, labelKey }: { icon: React.ReactNode; labelKey: string }) {
    const { t } = useTranslation();

    return (
        <Tooltip label={t(`bridge_page.chains.${labelKey}`)} withArrow>
            <span className="flex">{icon}</span>
        </Tooltip>
    );
}
