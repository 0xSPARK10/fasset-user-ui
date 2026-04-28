export const fromLots = (
    lots: number | undefined,
    lotSize: number,
    fractionDigits: number = 2,
    formatted: boolean = false,
): number | string | null => {
    let result: number | string | null = null;
    if (lots !== null && lots !== undefined) {
        result = lots * lotSize;
    }
    if (formatted) {
        if (result !== null) {
            result = result.toLocaleString('en-US', {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            });
        } else {
            result = '—';
        }
    }
    return result;
};

export const toLots = (
    value: number,
    lotSize: number,
    formated: boolean = false,
) => {
    let result: number | string | null = null;
    if (value !== null && value !== undefined) {
        result = Math.floor((value / lotSize) + Number.EPSILON);
    }
    if (formated) {
        if (result !== null) {
            result = result.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } else {
            result = '—';
        }
    }
    return result;
};
