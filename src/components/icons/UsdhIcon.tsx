import { IIconProps } from "@/types";


const UsdhIcon = (props: IIconProps) => {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" {...props}>
            <g clipPath="url(#clip0_3719_43737)">
                <rect width="48" height="48" rx="24" fill="#033022"/>
                <rect width="48" height="48" fill="url(#pattern0_3719_43737)"/>
            </g>
            <defs>
                <pattern id="pattern0_3719_43737" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_3719_43737" transform="scale(0.015625)"/>
                </pattern>
                <clipPath id="clip0_3719_43737">
                    <rect width="48" height="48" rx="24" fill="white"/>
                </clipPath>
                <image id="image0_3719_43737" width="64" height="64" preserveAspectRatio="none" xlinkHref="data:image/png;base64,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"/>
            </defs>
        </svg>

    );
};

export default UsdhIcon;
