import { IIconProps } from "@/types";

const UpshiftIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#00FF7E"/>
            <g clip-path="url(#clip0_3623_68597)">
                <rect width="32" height="32" rx="8" fill="#00FF7E"/>
                <path d="M0 16C0 24.8365 7.16347 32 16 32C24.8365 32 32 24.8365 32 16C32 7.16347 24.8365 0 16 0C7.16347 0 0 7.16347 0 16Z" fill="#00FF7E"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M23.9167 26H18.5001C11.5962 26 6 20.4037 6 13.5V8.08333C6 6.93294 6.93295 6 8.08334 6H23.9167C25.0671 6 26 6.93294 26 8.08333V23.9167C26 25.0671 25.0671 26 23.9167 26Z" fill="black"/>
            </g>
            <defs>
                <clipPath id="clip0_3623_68597">
                    <rect width="32" height="32" rx="8" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    );
};

export default UpshiftIcon;
