import React, { ReactNode } from "react";
import { Paper, Stepper, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import ModalDivider from "@/components/elements/ModalDivider";

interface IModalConfirmStep {
    title: string;
    stepLabel: string;
    stepDescription: string;
    walletInfoLabel: string;
    isPending: boolean;
    isSuccess: boolean;
    extraContent?: ReactNode;
}

export default function ModalConfirmStep({
    title,
    stepLabel,
    stepDescription,
    walletInfoLabel,
    isPending,
    isSuccess,
    extraContent,
}: IModalConfirmStep) {
    return (
        <>
            <Text className="text-24" fw={300} c="var(--flr-black)" mb="xl">
                {title}
            </Text>
            <Stepper
                active={isSuccess ? 1 : 0}
                completedIcon={<IconCheck size={14} />}
                size="sm"
                orientation="vertical"
            >
                <Stepper.Step
                    loading={isPending}
                    label={
                        <Text className="text-14" fw={500} c="var(--flr-black)">
                            {stepLabel}
                        </Text>
                    }
                    description={
                        <Text className="text-12" fw={400} c="var(--flr-gray)">
                            {stepDescription}
                        </Text>
                    }
                />
            </Stepper>
            <ModalDivider my="8" />
            <Paper
                radius="lg"
                className="px-10 py-5 mt-[40px]"
                styles={{ root: { backgroundColor: "var(--flr-lightest-blue)" } }}
            >
                <Text className="text-14" fw={400} c="var(--flr-black)">
                    {walletInfoLabel}
                </Text>
            </Paper>
            {extraContent}
        </>
    );
}
