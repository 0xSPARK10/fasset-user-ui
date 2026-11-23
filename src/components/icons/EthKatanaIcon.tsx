import { IIconProps } from "@/types";
import EthIcon from "@/components/icons/EthIcon";

// ETH on Katana — Figma Flare-Design-Component-Library, node 10754:3499 (light)
const EthKatanaIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* The plain ETH icon, so ETH looks the same on every chain */}
            <EthIcon width="32" height="32" />
            {/* Chain badge at the bottom right */}
            <g transform="translate(25 25) scale(1.1667) translate(-26 -26)">
                <path d="M32 26C32 22.6863 29.3137 20 26 20C22.6863 20 20 22.6863 20 26C20 29.3137 22.6863 32 26 32C29.3137 32 32 29.3137 32 26Z" fill="url(#eth-katana-badge)"/>
                <path d="M25.8276 25.2787L27.3125 22.6875H28.7974L27.6837 26.3963H26.5794L29.5493 27.8798L28.0551 30.1235L25.8276 27.5154V29.3632H23.229L24.1199 26.3963H23.229L24.3427 22.6875H25.8276V25.2787Z" fill="#F6FF0D"/>
            </g>
            <defs>
                <linearGradient id="eth-katana-badge" x1="26" y1="20" x2="26" y2="36.998" gradientUnits="userSpaceOnUse">
                    <stop offset="0.06" stopColor="#101631"/>
                    <stop offset="0.39" stopColor="#0541B2"/>
                    <stop offset="0.57" stopColor="#059EED"/>
                    <stop offset="0.7" stopColor="#C5EAFC"/>
                </linearGradient>
            </defs>
        </svg>
    );
};

export default EthKatanaIcon;
