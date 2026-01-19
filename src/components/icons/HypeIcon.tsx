import { IIconProps } from "@/types";

const HypeIcon = (props: IIconProps) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect width="16" height="16" rx="8" fill="#072723"/>
            <g clipPath="url(#clip0_118_1567)">
                <path d="M12.9453 8.07188C12.9453 11.3419 10.9441 12.3911 9.88977 11.4568C9.02189 10.695 8.76368 9.08522 7.45828 8.91993C5.80143 8.71151 5.65798 10.9178 4.56776 10.9178C3.29822 10.9178 3.05435 9.07085 3.05435 8.12219C3.05435 7.15197 3.32691 5.82961 4.40996 5.82961C5.67232 5.82961 5.74405 7.71973 7.322 7.61911C8.89278 7.51132 8.92147 5.54213 9.94 4.70128C10.8294 3.97541 12.9453 4.75877 12.9453 8.07188Z" fill="#97FCE4"/>
            </g>
            <defs>
                <clipPath id="clip0_118_1567">
                    <rect width="9.89091" height="9.89091" fill="white" transform="translate(3.05435 2.61816)"/>
                </clipPath>
            </defs>
        </svg>

    );
};

export default HypeIcon;
