import { IIconProps } from "@/types";
import EthIcon from "@/components/icons/EthIcon";

// ETH on Base — Figma Flare-Design-Component-Library, node 10754:3449 (light)
const EthBaseIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* The plain ETH icon, so ETH looks the same on every chain */}
            <EthIcon width="32" height="32" />
            {/* Chain badge at the bottom right */}
            <circle cx="25" cy="25" r="6.75" fill="white" stroke="black" strokeWidth="0.5"/>
            <rect x="21.5" y="21.5" width="7" height="7" rx="0.5" fill="#0000FF" stroke="black" strokeWidth="0.5"/>
        </svg>
    );
};

export default EthBaseIcon;
