import BigNumber from 'bignumber.js';
import { ethers } from "ethers";
import { MAX_CR_VALUE } from "@/constants";

export const truncateString = (text: string, from: number = 4, to: number = 4) => {
    return `${text.substring(0, from)}...${text.substring(text.length - to, text.length)}`;
}


/*
    wei = 10^18
    gwei =  10^9
    mwei = 10^6
    ether = 1
 */

export const parseUnits = (value: string | number, unit: number) => {
    const number = new BigNumber(value);
    return ethers.parseUnits(number.toFixed(), unit);
}

export const formatUnit = (value: number | bigint, unit: number) => {
    return ethers.formatUnits(value, unit);
}

export const fromLots = (lots: number | undefined, lotSize: number, fractionDigits: number = 2, formatted: boolean = false): number | string | null => {
    let result: number | string | null = null;
    if (lots !== null && lots !== undefined) {
        result = lots * lotSize;
    }
    if (formatted) {
        if (result !== null) {
            result = result.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
        } else {
            result = '—';
        }
    }
    return result;

}


export const toLots = (value: number, lotSize: number, formated: boolean = false) => {
    let result: number | null | string = null;
    if (value !== null && value !== undefined) {
        result = Math.floor((value / lotSize) + Number.EPSILON);
    }
    if (formated) {
        if (result !== null) {
            result = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            result = '—';
        }
    }
    return result;
}

export const isNumeric = (value: string | number | boolean | undefined | null) => {
    if (value === undefined || value === null) {
        return false;
    }
    if (isBoolean(value)) {
        return false;
    }

    return typeof value === 'number'
        ? true
        : /^-?\d*\.?\d+([eE][+-]?\d+)?$/.test((value as string).replace(/,/g, ''));
}

export const isBoolean = (val: any) => {
    return val === false || val === true;
}

export const isMaxCRValue = (value: string | undefined | null) => {
    if (value !== null && value !== undefined && isNumeric(value)) {
        return Number(value.replace(/,/g, '')) >= MAX_CR_VALUE;
    }
    return false;
}

export const toNumber = (value: string) => {
    return Number(value.replace(/,/g, ''));
}

export function formatNumber(value: string | number, fractionDigits: number = 2, locale = 'en-US') {
    if (typeof value === 'number') {
        return value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
    }

    return toNumber(value).toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
}

export function formatNumberWithSuffix(value: string | number, fractionDigits: number = 2) {
    if (value === undefined) return;

    if (typeof value === 'string') {
        value = toNumber(value);
    }

    const factor = Math.pow(10, fractionDigits);

    if (value >= 1e6) {
        return `${(value / 1e6).toFixed(fractionDigits)}m`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(fractionDigits)}k`;
    } else {
        return (Math.floor(value * factor) / factor).toFixed(fractionDigits);
    }
}

export const toSatoshi = (value: string | number) => {
    if (typeof value === 'string') {
        value = toNumber(value);
    }

    return value * 100000000;
}
