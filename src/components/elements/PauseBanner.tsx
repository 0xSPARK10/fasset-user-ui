import React from "react";
import { Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface IPauseBanner {
    text: string;
}

// Red strip above the header for a system pause (FAsset emergency pause, OFT pause)
export default function PauseBanner({ text }: IPauseBanner) {
    return (
        <div className="flex items-center justify-center bg-[var(--flr-red)] py-2">
            <IconAlertTriangle
                size={24}
                color="var(--flr-white)"
                className="flex-shrink-0"
            />
            <Text
                className="text-16 ml-4"
                fw={400}
                c="var(--flr-white)"
            >
                {text}
            </Text>
        </div>
    );
}
