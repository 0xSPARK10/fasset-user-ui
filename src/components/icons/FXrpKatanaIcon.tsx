import { IIconProps } from "@/types";

// FXRP on Katana — Figma FAssets-Demo-Dapp, node 4923:157104 (badge without an outline)
const FXrpKatanaIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* Figma draws the token at 36 px — its coordinates kept, scaled to the 32 px viewBox */}
            <g transform="scale(0.888889)">
                <circle cx="18" cy="18" r="18" fill="#E62058"/>
                <path transform="translate(6.6816 8.8776)" d="M19.3184 0H22.589L15.7818 6.74182C14.5916 7.91445 12.9879 8.57178 11.3171 8.57178C9.64639 8.57178 8.0427 7.91445 6.85253 6.74182L0.0396219 0H3.31592L8.48787 5.11889C9.24103 5.86229 10.2566 6.27911 11.3149 6.27911C12.3731 6.27911 13.3888 5.86229 14.1419 5.11889L19.3184 0ZM3.27633 18.7451H0L6.85253 11.9626C8.0427 10.7899 9.64639 10.1326 11.3171 10.1326C12.9879 10.1326 14.5916 10.7899 15.7818 11.9626L22.6343 18.744H19.358L14.1464 13.581C13.3933 12.8376 12.3776 12.4208 11.3194 12.4208C10.2612 12.4208 9.24553 12.8376 8.49241 13.581L3.27519 18.7451H3.27633Z" fill="white"/>
                {/* Chain badge: 13.5 px at the bottom right */}
                <g transform="translate(22.5 22.5)">
                    <path d="M13.5 6.75C13.5 3.02208 10.4779 0 6.75 0C3.02208 0 0 3.02208 0 6.75C0 10.4779 3.02208 13.5 6.75 13.5C10.4779 13.5 13.5 10.4779 13.5 6.75Z" fill="url(#fxrp-katana-badge-gradient)"/>
                    <path d="M6.55592 5.93861L8.22639 3.02353H9.89691L8.64403 7.19588H7.40173L10.7428 8.86482L9.06183 11.3891L6.55592 8.45491V10.5337H3.63249L4.6348 7.19588H3.63249L4.88539 3.02353H6.55592V5.93861Z" fill="#F6FF0D"/>
                    <defs>
                        <linearGradient id="fxrp-katana-badge-gradient" x1="6.75" y1="0" x2="6.75" y2="19.1228" gradientUnits="userSpaceOnUse">
                            <stop offset="0.06" stopColor="#101631"/>
                            <stop offset="0.39" stopColor="#0541B2"/>
                            <stop offset="0.57" stopColor="#059EED"/>
                            <stop offset="0.7" stopColor="#C5EAFC"/>
                        </linearGradient>
                    </defs>
                </g>
            </g>
        </svg>
    );
};

export default FXrpKatanaIcon;
