import { isAddress } from "ethers";
import { MAX_CR_VALUE } from "@/constants";

export const isBoolean = (val: any) => {
    return val === false || val === true;
};

export const isNumeric = (
    value: string | number | boolean | undefined | null,
) => {
    if (value === undefined || value === null) {
        return false;
    }
    if (isBoolean(value)) {
        return false;
    }

    return typeof value === 'number'
        ? true
        : /^-?\d*\.?\d+([eE][+-]?\d+)?$/.test((value as string).replace(/,/g, ''));
};

export const isZeroAddress = (address: string | undefined | null) => {
    return address === "0x0000000000000000000000000000000000000000";
};

// ethers' own isAddress() also accepts 40-char hex without the "0x" prefix,
// but ethers' address resolution used during contract calls does not - it
// treats such input as an ENS name and tries to resolve it, which fails on
// networks without ENS support. Require the prefix here so invalid input is
// caught by form validation instead of surfacing an ENS error at submit time.
export const isValidEvmAddress = (address: string | undefined | null) => {
    return !!address && address.startsWith("0x") && isAddress(address);
};

export const isMaxCRValue = (value: string | undefined | null) => {
    if (value !== null && value !== undefined && isNumeric(value)) {
        return Number(value.replace(/,/g, '')) >= MAX_CR_VALUE;
    }
    return false;
};
