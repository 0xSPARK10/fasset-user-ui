import { IIconProps } from "@/types";

const CflrIcon = (props: IIconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 577.78 577.78"
            {...props}
        >
            <circle
                fill="#ff9866"
                cx="288.89"
                cy="288.89"
                r="279.93"
                transform="translate(-119.66 288.89) rotate(-45)"
            />
            <circle fill="#fff" cx="221.63" cy="289.11" r="33.67" />
            <path
                fill="#fff"
                d="M388.05,154.67l-132.82-.1c-36.21,0-66.32,28.63-67.27,65.44-.03,.99,.78,1.79,1.77,1.8l132.82,.08v.02c36.21,0,66.32-28.63,67.27-65.44,.03-.99-.78-1.79-1.77-1.8Z"
            />
            <path
                fill="#fff"
                d="M189.73,355.97l132.82-.1c36.21,0,66.32,28.63,67.27,65.44,.03,.99-.78,1.79-1.8,1.8l-132.82,.08v.02c-36.21,0-66.32-28.63-67.27-65.44-.03-.99,.78-1.79,1.77-1.8Z"
            />
        </svg>
    );
};

export default CflrIcon;
