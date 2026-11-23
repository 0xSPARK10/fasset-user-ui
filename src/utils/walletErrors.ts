// EIP-1193 "unauthorized". MetaMask also answers it for an account or method the site is not
// authorized for, so only its spam filter message counts as a blocked request.
const WALLET_UNAUTHORIZED_CODE = 4100;
const SPAM_FILTER_MESSAGE = /spam filter/i;

// MetaMask's spam filter blocks a site after several rejected requests in a row
// ("Request blocked due to spam filter."). ethers wraps the wallet error as UNKNOWN_ERROR
// and keeps it in `error.error`; other providers throw the wallet error as is.
export const isWalletRequestBlocked = (error: any): boolean => {
    return [error, error?.error, error?.info?.error].some(walletError =>
        walletError?.code === WALLET_UNAUTHORIZED_CODE && SPAM_FILTER_MESSAGE.test(walletError?.message ?? "")
    );
};
