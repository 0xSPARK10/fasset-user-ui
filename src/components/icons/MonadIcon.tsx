import { IIconProps } from "@/types";

// Monad chain logo — drawn after the brand mark (purple disc, rounded diamond); not from Figma yet
const MonadIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <circle cx="16" cy="16" r="16" fill="#836EF9"/>
            <rect x="10" y="10" width="12" height="12" rx="3.5" transform="rotate(45 16 16)" stroke="#FFFFFF" strokeWidth="2.6"/>
        </svg>
    );
};

export default MonadIcon;
