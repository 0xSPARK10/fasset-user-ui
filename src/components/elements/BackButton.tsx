import Link from "next/link";
import { IconArrowUpLeft } from "@tabler/icons-react";
import { Button } from "@mantine/core";

interface IBackButton {
    href: string;
    text: string;
    className?: string;
}

export default function BackButton({ href, text, className }: IBackButton) {
    return (
        <Button
            component={Link}
            href={href}
            variant="transparent"
            leftSection={<IconArrowUpLeft size={18} />}
            className={`text-base text-black p-0 mb-8 ${className}`}
            fw={500}
        >
            {text}
        </Button>
    );
}
