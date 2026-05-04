const isDev = () => process.env.NEXT_PUBLIC_APP_ENV === 'development';

export const devLog = (...args: unknown[]) => {
    if (isDev()) console.log(...args);
};

export const devError = (...args: unknown[]) => {
    if (isDev()) console.error(...args);
};

export const devWarn = (...args: unknown[]) => {
    if (isDev()) console.warn(...args);
};

export interface Logger {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    // Creates a nested logger, e.g. createLogger('A').child('B') → [A:B]
    child: (sub: string) => Logger;
}

// Use when you want every log from a feature/hook prefixed with a label.
export const createLogger = (label: string): Logger => ({
    log: (...args) => devLog(`[${label}]`, ...args),
    error: (...args) => devError(`[${label}]`, ...args),
    warn: (...args) => devWarn(`[${label}]`, ...args),
    child: (sub) => createLogger(`${label}:${sub}`),
});
