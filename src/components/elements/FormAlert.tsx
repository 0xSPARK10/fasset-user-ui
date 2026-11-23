import React from "react";
import { Text, rem } from "@mantine/core";
import { IconExclamationCircle, IconInfoCircle } from "@tabler/icons-react";

import type { AlertType } from "@/core/alerts/types";
export type { AlertType, IAlertMessage } from "@/core/alerts/types";

interface IFormAlert {
    message: string | undefined;
    type?: AlertType;
    className?: string;
    // Optional control on the right (e.g. a button that resolves the alert)
    action?: React.ReactNode;
}

const styles: Record<AlertType, { border: string; bg: string; color: string }> = {
    error: {
        border: "border-[var(--flr-red)]",
        bg: "bg-[var(--flr-lightest-red)]",
        color: "var(--flr-red)",
    },
    warning: {
        border: "border-[var(--flr-orange)]",
        bg: "bg-[var(--flr-lightest-orange)]",
        color: "var(--flr-orange)",
    },
    info: {
        border: "border-[var(--flr-sky)]",
        bg: "bg-[var(--flr-lightest-sky)]",
        color: "var(--flr-sky)",
    },
};

export default function FormAlert({ message, type = "error", className = "", action }: IFormAlert) {
    if (!message) return null;

    const { border, bg, color } = styles[type];
    const Icon = type === "info" ? IconInfoCircle : IconExclamationCircle;

    return (
        <div className={`flex items-center mb-5 border ${border} p-3 ${bg} ${className}`}>
            <Icon
                style={{ width: rem(25), height: rem(25) }}
                color={color}
                className="mr-3 flex-shrink-0"
            />
            <Text className="text-16" fw={400} c={color}>
                {message}
            </Text>
            {action && <div className="ml-auto pl-3 flex-shrink-0">{action}</div>}
        </div>
    );
}
