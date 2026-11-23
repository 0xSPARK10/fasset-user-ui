import { IIconProps } from "@/types";

// Figma "sync_alt" glyph, transposed to ↓↑ as on the bridge form. currentColor so a hover can recolour it
const SwapVerticalIcon = (props: IIconProps) => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g transform="matrix(0 1 1 0 0 0)">
                <path d="M4.89868 19L0 14.16L4.89868 9.32009L6.02421 10.416L3.02421 13.38H18.9474V14.9401H3.02421L6.02421 17.9041L4.89868 19ZM15.1013 10.6799L13.9758 9.584L16.9758 6.61996H1.05263V5.05995H16.9758L13.9758 2.09591L15.1013 1L20 5.83995L15.1013 10.6799Z" fill="currentColor"/>
            </g>
        </svg>
    );
};

export default SwapVerticalIcon;
