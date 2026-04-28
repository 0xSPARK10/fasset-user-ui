import React, { ReactNode } from "react";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import ModalDivider from "@/components/elements/ModalDivider";

interface IModalSuccessStep {
    title: string;
    description: string;
    children?: ReactNode;
}

export default function ModalSuccessStep({ title, description, children }: IModalSuccessStep) {
    return (
        <>
            <Text className="text-24" fw={300} c="var(--flr-black)" mb="md">
                {title}
            </Text>
            <Group gap="sm" mb={children ? "xl" : undefined} align="center">
                <ThemeIcon
                    variant="outline"
                    radius="xl"
                    size="md"
                    color="var(--flr-black)"
                    className="flex-shrink-0"
                >
                    <IconCheck size={14} />
                </ThemeIcon>
                <Text className="text-14" fw={400} c="var(--flr-black)">
                    {description}
                </Text>
            </Group>
            {children && (
                <>
                    <ModalDivider />
                    {children}
                </>
            )}
        </>
    );
}
