import { IIconProps } from "@/types";

// Base chain logo — the blue square of the FXrpBaseIcon badge on a white disc
const BaseIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <circle cx="16" cy="16" r="16" fill="#FFFFFF"/>
            <circle cx="16" cy="16" r="15.75" stroke="#E5E7EB" strokeWidth="0.5"/>
            <rect x="8" y="8" width="16" height="16" rx="1.5" fill="#0000FF"/>
        </svg>
    );
};

export default BaseIcon;
