import React from "react";
import { IIconProps } from "@/types";

const MonarqIcon = (props: IIconProps) => {
    const id = React.useId().replace(/:/g, "");

    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect width="32" height="32" rx="8" fill="black" />
            <g clipPath={`url(#clip0_monarq-${id})`}>
                <path d="M22.1695 21.5702H24.2942C24.3606 21.5702 24.4144 21.5168 24.4144 21.451V13.3889C24.4144 13.3572 24.4272 13.3269 24.4495 13.3045L26.3493 11.4219C26.4251 11.3468 26.5547 11.3999 26.5547 11.5062V23.572C26.5547 23.6378 26.5009 23.6912 26.4345 23.6912H20.0293C19.9629 23.6912 19.909 23.6378 19.909 23.572V17.8537C19.909 17.822 19.9218 17.7917 19.9441 17.7693L21.8439 15.8867C21.9197 15.8116 22.0493 15.8647 22.0493 15.971V21.451C22.0493 21.5168 22.1032 21.5702 22.1695 21.5702Z" fill={`url(#paint0_linear_monarq-${id})`} />
                <path d="M9.19077 21.57H7.06612C6.99975 21.57 6.94588 21.5166 6.94588 21.4508V13.3887C6.94588 13.357 6.93314 13.3267 6.91077 13.3043L5.01097 11.4219C4.93522 11.3468 4.8056 11.3999 4.8056 11.506V23.5718C4.8056 23.6376 4.85947 23.691 4.92584 23.691H11.3311C11.3974 23.691 11.4513 23.6376 11.4513 23.5718V17.8535C11.4513 17.8218 11.4385 17.7915 11.4162 17.7691L9.51639 15.8864C9.44063 15.8114 9.31101 15.8645 9.31101 15.9708V21.4508C9.31101 21.5166 9.25715 21.57 9.19077 21.57Z" fill={`url(#paint1_linear_monarq-${id})`} />
                <path d="M26.5533 9.87724H26.5547V7.17024C26.5547 7.06419 26.4251 7.0108 26.3493 7.08587L20.4794 12.9041L15.7711 8.23812C15.7239 8.19141 15.6474 8.19165 15.6006 8.2386L10.9097 12.9327L5.01097 7.08587C4.93522 7.0108 4.8056 7.06419 4.8056 7.17024V9.87724H4.80705L4.8056 9.87867V9.88367L15.5101 20.4917C15.6042 20.5849 15.7564 20.5849 15.8502 20.4917L26.5547 9.88367V9.87867L26.5533 9.87724ZM15.7653 17.5767C15.7184 17.6231 15.6422 17.6231 15.5953 17.5767L12.4238 14.4331L15.6008 11.2847C15.6477 11.2382 15.7239 11.2382 15.7708 11.2847L18.9423 14.4276L15.7653 17.5764V17.5767Z" fill={`url(#paint2_linear_monarq-${id})`} />
            </g>
            <defs>
                <linearGradient id={`paint0_linear_monarq-${id}`} x1="15.6802" y1="7.05088" x2="15.6802" y2="23.6912" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#938168" />
                    <stop offset="1" stopColor="#6B5B3E" />
                </linearGradient>
                <linearGradient id={`paint1_linear_monarq-${id}`} x1="15.6802" y1="7.05065" x2="15.6802" y2="23.691" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#938168" />
                    <stop offset="1" stopColor="#6B5B3E" />
                </linearGradient>
                <linearGradient id={`paint2_linear_monarq-${id}`} x1="15.6802" y1="7.05077" x2="15.6802" y2="23.6911" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#938168" />
                    <stop offset="1" stopColor="#6B5B3E" />
                </linearGradient>
                <clipPath id={`clip0_monarq-${id}`}>
                    <rect width="26" height="26" fill="white" transform="translate(3 3)" />
                </clipPath>
            </defs>
        </svg>
    );
};

export default MonarqIcon;
