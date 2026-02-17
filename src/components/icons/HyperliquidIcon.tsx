import { IIconProps } from "@/types";

const HyperliquidIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g clipPath="url(#clip0_3719_43684)">
                <rect width="32" height="32" rx="8" fill="#072723"/>
                <rect width="32" height="32" rx="16" fill="#072723"/>
                <g clipPath="url(#clip1_3719_43684)">
                    <path d="M25.8907 15.6457C25.8907 22.1857 21.8885 24.2842 19.7797 22.4156C18.044 20.892 17.5275 17.6724 14.9167 17.3418C11.603 16.925 11.3161 21.3377 9.1357 21.3377C6.59662 21.3377 6.10889 17.6436 6.10889 15.7463C6.10889 13.8059 6.654 11.1612 8.8201 11.1612C11.3448 11.1612 11.4883 14.9414 14.6442 14.7402C17.7858 14.5246 17.8431 10.5862 19.8802 8.90452C21.6589 7.45278 25.8907 9.0195 25.8907 15.6457Z" fill="#97FCE4"/>
                </g>
            </g>
            <defs>
                <clipPath id="clip0_3719_43684">
                    <rect width="32" height="32" rx="8" fill="white"/>
                </clipPath>
                <clipPath id="clip1_3719_43684">
                    <rect width="19.7818" height="19.7818" fill="white" transform="translate(6.10889 5.23438)"/>
                </clipPath>
            </defs>
        </svg>

    );
};

export default HyperliquidIcon;
