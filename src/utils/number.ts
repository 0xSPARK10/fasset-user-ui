import BigNumber from 'bignumber.js';

type RoundingMode = "up" | "down";

export const toNumber = (value: string) => {
    return Number(value.replace(/,/g, ''));
};

export function formatNumber(
    value: string | number,
    fractionDigits: number = 2,
    locale = 'en-US',
) {
    if (typeof value === 'number') {
        return value.toLocaleString(locale, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        });
    }

    return toNumber(value).toLocaleString(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

export function formatNumberWithSuffix(
    value: string | number,
    fractionDigits: number = 2,
) {
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

export const roundToDecimals = (
    value: string | number,
    fractionDigits: number = 2,
    mode: RoundingMode = 'down',
) => {
    const number = new BigNumber(value);
    const roundingMode =
        mode === 'up' ? BigNumber.ROUND_CEIL : BigNumber.ROUND_FLOOR;

    return number.decimalPlaces(fractionDigits, roundingMode).toNumber();
};

export const roundDownToDecimals = (
    value: string | number,
    fractionDigits: number = 2,
) => {
    return roundToDecimals(value, fractionDigits, 'down');
};

export const roundUpToDecimals = (
    value: string | number,
    fractionDigits: number = 2,
) => {
    return roundToDecimals(value, fractionDigits, 'up');
};
