import React from "react";
import { Anchor } from "@mantine/core";
import { useTranslation } from "react-i18next";

// "Change" (opens the recipient field) / "Use my wallet" (closes it) — the underlined text link
// of the bridge page's TO side.
// Same gray as the TO / Destination address label next to it.
export default function BridgeCustomLink({ onClick, labelKey = "bridge_page.custom_button", color = "var(--flr-gray)" }: { onClick: () => void; labelKey?: string; color?: string }) {
    const { t } = useTranslation();

    return (
        <Anchor
            component="button"
            type="button"
            underline="always"
            c={color}
            className="text-12"
            // Keep focus in the recipient input — its blur would validate the empty field and
            // flash the "required" error just before "Remove" closes it
            onMouseDown={event => event.preventDefault()}
            onClick={onClick}
        >
            {t(labelKey)}
        </Anchor>
    );
}
