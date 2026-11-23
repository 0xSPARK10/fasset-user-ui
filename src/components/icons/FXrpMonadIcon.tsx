import { IIconProps } from "@/types";

// FXRP on Monad — the FXRP token with the MonadIcon mark as badge; not from Figma yet
const FXrpMonadIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* Figma draws the token at 36 px — its coordinates kept, scaled to the 32 px viewBox */}
            <g transform="scale(0.888889)">
                <circle cx="18" cy="18" r="18" fill="#E62058"/>
                <path transform="translate(6.6816 8.8776)" d="M19.3184 0H22.589L15.7818 6.74182C14.5916 7.91445 12.9879 8.57178 11.3171 8.57178C9.64639 8.57178 8.0427 7.91445 6.85253 6.74182L0.0396219 0H3.31592L8.48787 5.11889C9.24103 5.86229 10.2566 6.27911 11.3149 6.27911C12.3731 6.27911 13.3888 5.86229 14.1419 5.11889L19.3184 0ZM3.27633 18.7451H0L6.85253 11.9626C8.0427 10.7899 9.64639 10.1326 11.3171 10.1326C12.9879 10.1326 14.5916 10.7899 15.7818 11.9626L22.6343 18.744H19.358L14.1464 13.581C13.3933 12.8376 12.3776 12.4208 11.3194 12.4208C10.2612 12.4208 9.24553 12.8376 8.49241 13.581L3.27519 18.7451H3.27633Z" fill="white"/>
                {/* Chain badge: 13.5 px at the bottom right */}
                <g transform="translate(22.5 22.5)">
                    <circle cx="6.75" cy="6.75" r="6.75" fill="#836EF9"/>
                    <rect x="4.22" y="4.22" width="5.06" height="5.06" rx="1.48" transform="rotate(45 6.75 6.75)" stroke="#FFFFFF" strokeWidth="1.1"/>
                </g>
            </g>
        </svg>
    );
};

export default FXrpMonadIcon;
