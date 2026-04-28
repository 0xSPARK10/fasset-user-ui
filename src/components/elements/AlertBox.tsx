import React from "react";
import { Text } from "@mantine/core";

type AlertBoxType = "info" | "error";

const styles: Record<AlertBoxType, { border: string; bg: string; color: string }> = {
    info: {
        border: "border-[var(--flr-orange)]",
        bg: "bg-[var(--flr-lightest-orange)]",
        color: "var(--flr-orange)",
    },
    error: {
        border: "border-[var(--flr-red)]",
        bg: "bg-[var(--flr-lightest-red)]",
        color: "var(--flr-red)",
    },
};

interface IAlertBox {
    title: string;
    type?: AlertBoxType;
    children: React.ReactNode;
    className?: string;
}

export default function AlertBox({ title, type = "info", children, className = "" }: IAlertBox) {
    const { border, bg, color } = styles[type];

    return (
        <div className={`border ${border} rounded-[2px] ${bg} p-4 mb-7 ${className}`}>
            <Text className="text-16" fw={500} c={color} mb="xs">
                {title}
            </Text>
            <div style={{ color }}>
                {children}
            </div>
        </div>
    );
}
