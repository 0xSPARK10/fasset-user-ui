import React from "react";
import { Paper, rem, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconExclamationCircle } from "@tabler/icons-react";
import classes from "@/styles/components/elements/HoverTooltip.module.scss";

interface IHoverTooltip {
    children: React.ReactNode;
    message: string;
    show: boolean;
}

export default function HoverTooltip({ children, message, show }: IHoverTooltip) {
    const { hovered, ref } = useHover();

    return (
        <div ref={ref} className={classes.wrapper}>
            {children}
            {show && hovered &&
                <Paper
                    radius="lg"
                    className={`p-4 ${classes.tooltip}`}
                    styles={{
                        root: {
                            backgroundColor: 'rgba(230, 30, 87, 0.09)'
                        }
                    }}
                >
                    <div className="flex items-center">
                        <IconExclamationCircle
                            style={{ width: rem(30), height: rem(30) }}
                            className="flex-shrink-0 mr-3"
                            color="var(--mantine-color-red-6)"
                        />
                        <Text
                            className="text-12"
                            fw={400}
                            c="var(--flr-black)"
                        >
                            {message}
                        </Text>
                    </div>
                </Paper>
            }
        </div>
    );
}
