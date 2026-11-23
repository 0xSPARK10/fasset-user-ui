import { IIconProps } from "@/types";

// Katana chain logo — the FXrpKatanaIcon badge (13.5 px) scaled to 32 px
const KatanaIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g transform="scale(2.370370)">
                <circle cx="6.75" cy="6.75" r="6.75" fill="url(#katana-gradient)"/>
                <path d="M6.55592 5.93861L8.22639 3.02353H9.89691L8.64403 7.19588H7.40173L10.7428 8.86482L9.06183 11.3891L6.55592 8.45491V10.5337H3.63249L4.6348 7.19588H3.63249L4.88539 3.02353H6.55592V5.93861Z" fill="#F6FF0D"/>
                <defs>
                    <linearGradient id="katana-gradient" x1="6.75" y1="0" x2="6.75" y2="19.1228" gradientUnits="userSpaceOnUse">
                        <stop offset="0.06" stopColor="#101631"/>
                        <stop offset="0.39" stopColor="#0541B2"/>
                        <stop offset="0.57" stopColor="#059EED"/>
                        <stop offset="0.7" stopColor="#C5EAFC"/>
                    </linearGradient>
                </defs>
            </g>
        </svg>
    );
};

export default KatanaIcon;
