import { Divider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface IModalDivider {
    marginX?: string;
    marginXMobile?: string;
    className?: string;
    mb?: string | number;
    my?: string | number;
}

export default function ModalDivider({
    marginX = "-2.75rem",
    marginXMobile = "-1rem",
    className,
    mb,
    my = 32,
}: IModalDivider) {
    const isMobile = useMediaQuery("(max-width: 640px)");

    return (
        <Divider
            className={className}
            // Top / bottom set separately — `mb` alongside `my` would depend on Mantine's prop order
            mt={my}
            mb={mb ?? my}
            styles={{
                root: {
                    marginLeft: isMobile ? marginXMobile : marginX,
                    marginRight: isMobile ? marginXMobile : marginX,
                },
            }}
        />
    );
}
