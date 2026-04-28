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

export const isMaxCRValue = (value: string | undefined | null) => {
    if (value !== null && value !== undefined && isNumeric(value)) {
        return Number(value.replace(/,/g, '')) >= MAX_CR_VALUE;
    }
    return false;
};
