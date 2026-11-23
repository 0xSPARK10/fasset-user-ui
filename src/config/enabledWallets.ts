// Kept apart from connectors.ts so server code (API routes) can check it without the wallet icons
export const isWalletEnabled = (wallet: string): boolean => {
    const enabledWallets = process.env.ENABLED_WALLETS !== undefined
        ? process.env.ENABLED_WALLETS.split(',').map(wallet => wallet.toLowerCase())
        : [];
    return enabledWallets.includes(wallet.toLowerCase());
};
