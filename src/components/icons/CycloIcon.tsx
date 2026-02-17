import { IIconProps } from "@/types";

const CycloIcon = (props: IIconProps) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect width="32" height="32" rx="8" fill="black"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M11.4 11.4H15V17H17V9.4H9.4V22.4H22.4V6H26V26H6V6H20.4V20.4H11.4V11.4Z" fill="white"/>
        </svg>
    );
};

export default CycloIcon;
