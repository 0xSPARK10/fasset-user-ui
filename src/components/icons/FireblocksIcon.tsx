import React from "react";
import { IIconProps } from "@/types";

// Neutral placeholder mark; swap for the official Fireblocks asset once we have it.
const FireblocksIcon = (props: IIconProps) => (
    <svg
        width={props.width ?? "24"}
        height={props.height ?? "24"}
        className={props.className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect width="24" height="24" rx="6" fill="#0B1F3A" />
        <path d="M12 5L18 16H6L12 5Z" fill="#FFFFFF" />
        <rect x="6" y="17.5" width="12" height="1.5" rx="0.75" fill="#FFFFFF" />
    </svg>
);

export default FireblocksIcon;
