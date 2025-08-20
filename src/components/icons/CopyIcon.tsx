import { rem, Popover, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ICopyIcon {
    text: string;
    color?: string;
    size?: number;
    className?: string;
}

export default function CopyIcon({ text, color, className = '', size = 15 }: ICopyIcon) {
    const { t } = useTranslation();
    const [isPopoverActive, setIsPopoverActive] = useState<boolean>(false);
    const clipboard = useClipboard();

    const onClick = (text: string) => {
        setIsPopoverActive(true);
        setTimeout(() => {
            setIsPopoverActive(false);
        }, 800);
        clipboard.copy(text);
    }

    return (
        <Popover
            withArrow
            opened={isPopoverActive}
            onChange={() => setIsPopoverActive(false)}
            width="auto"
        >
            <Popover.Target>
                <IconCopy
                    color={color ?? '#14151733'}
                    style={{ width: rem(size), height: rem(size) }}
                    onClick={() => onClick(text)}
                    className={`ml-1 cursor-pointer flex-shrink-0  ${className}`}
                />
            </Popover.Target>
            <Popover.Dropdown className="p-2 bg-black text-white">
                <Text size="xs">{t('copy_icon.copied_label')}</Text>
            </Popover.Dropdown>
        </Popover>
    );
}
