export const devLog = (...args: unknown[]) => {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
        console.log(...args);
    }
}

export const devError = (...args: unknown[]) => {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
        console.error(...args);
    }
}
