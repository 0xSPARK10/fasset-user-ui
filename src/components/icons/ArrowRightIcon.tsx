import { IIconProps } from "@/types";

// Figma "arrow_back" glyph pointing right — rotate with CSS for other directions.
const ArrowRightIcon = (props: IIconProps) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M12.175 7L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9H0V7H12.175Z" fill={props.color ?? "#E61E57"}/>
        </svg>
    );
};

export default ArrowRightIcon;
