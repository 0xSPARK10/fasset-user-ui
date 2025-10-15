const nextConfig = {
    reactStrictMode: true,
    basePath: process.env.FRONTEND_URL || '',
    assetPrefix: process.env.FRONT_URL || '',
    headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors 'none';"
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    }
                ]
            }
        ]
    },
    async redirects() {
        if (process.env.POOLS_ENABLED === 'false') {
            return [
                {
                    source: '/pools',
                    destination: '/404',
                    permanent: false
                }
            ]
        }

        return  [];
    },
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
    env: {
        WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
        API_URL: process.env.API_URL,
        APP_URL: process.env.APP_URL,
        APP_VERSION: process.env.npm_package_version,
        FREE_CPT_XRP_CONTRACT_ADDRESS: process.env.FREE_CPT_XRP_CONTRACT_ADDRESS,
        FREE_CPT_BTC_CONTRACT_ADDRESS: process.env.FREE_CPT_BTC_CONTRACT_ADDRESS,
        FREE_CPT_DOGE_CONTRACT_ADDRESS: process.env.FREE_CPT_DOGE_CONTRACT_ADDRESS,
        ENABLED_UNDERLYING_FASSETS: process.env.ENABLED_UNDERLYING_FASSETS,
        ENABLED_WALLETS: process.env.ENABLED_WALLETS,
        XPUB_SECRET: process.env.XPUB_SECRET,
        NETWORK: process.env.NETWORK,
        MAINNET_CHAIN: process.env.MAINNET_CHAIN,
        TESTNET_CHAIN: process.env.TESTNET_CHAIN,
        TERM_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL,
        INCENTIVES_MODAL: process.env.INCENTIVES_MODAL,
        WIND_DOWN_DATE: process.env.WIND_DOWN_DATE,
        WIND_DOWN_BLOG_URL: process.env.WIND_DOWN_BLOG_URL,
        FLR_URL: process.env.FLR_URL,
        SGB_URL: process.env.SGB_URL,
        CFLR_URL: process.env.CFLR_URL,
        C2FLR_URL: process.env.C2FLR_URL,
        XAMAN_API_KEY: process.env.XAMAN_API_KEY
    },
    output: "standalone"
};

export default nextConfig;
