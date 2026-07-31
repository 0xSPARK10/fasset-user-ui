import BigNumber from 'bignumber.js';

type RoundingMode = "up" | "down";

// Pass to Mantine NumberInput so both "." and "," keystrokes are accepted as
// decimal separators. iOS keypads in locales like uk-UA or ru-RU show ","
// while EN keypads show "." — display value stays "." regardless.
export const ALLOWED_DECIMAL_SEPARATORS = ['.', ','];

export const parseLocaleFloat = (value: string): number =>
    parseFloat(value.replace(',', '.'));

export const toNumber = (value: string) => {
    return Number(value.replace(/,/g, ''));
};

/**
 * `minFractionDigits` defaults to `fractionDigits`, so by default the width is fixed and
 * trailing zeros are kept. Pass a lower value for a variable-width number: trailing zeros
 * are trimmed down to that many decimals, which lets one call site serve both a small
 * balance that needs every digit (`0.0004`) and a round one that does not (`1.50`).
 */
export function formatNumber(
    value: string | number,
    fractionDigits: number = 2,
    locale = 'en-US',
    minFractionDigits: number = fractionDigits,
) {
    const options = {
        // Guards min > max, which Intl throws on — a caller asking for fewer decimals
        // than the floor collapses to a fixed width rather than blowing up.
        minimumFractionDigits: Math.min(minFractionDigits, fractionDigits),
        maximumFractionDigits: fractionDigits,
    };

    if (typeof value === 'number') {
        return value.toLocaleString(locale, options);
    }

    return toNumber(value).toLocaleString(locale, options);
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

/**
 * Converts an XRPL destination tag from a form value into the number that goes into
 * the compose message.
 *
 * Do not use `Number(value) || undefined` — tag `0` is a valid uint32 but is falsy, so
 * it would drop out as "no tag", and a payment to an account that requires one (an
 * exchange deposit address, say) would be rejected or credited to nobody.
 */
export const parseDestinationTag = (
    value: string | number | undefined | null,
): number | undefined => {
    if (value === undefined || value === null) return undefined;

    const raw = String(value).trim();
    if (raw === '') return undefined;

    const tag = Number(raw);
    return Number.isInteger(tag) && tag >= 0 && tag <= 4294967295
        ? tag
        : undefined;
};

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
