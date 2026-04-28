import React from "react";
import { Text, rem } from "@mantine/core";
import { IconExclamationCircle, IconInfoCircle } from "@tabler/icons-react";

export type AlertType = "error" | "warning" | "info";

export interface IAlertMessage {
    msg: string;
    type?: AlertType;
}

interface IFormAlert {
    message: string | undefined;
    type?: AlertType;
    className?: string;
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

export default function FormAlert({ message, type = "error", className = "" }: IFormAlert) {
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
        </div>
    );
}
