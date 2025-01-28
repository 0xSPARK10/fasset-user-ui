export const MAX_CR_VALUE = 1000;

export const WALLET = {
    WALLET_CONNECT: 'WalletConnect',
    META_MASK: 'MetaMask',
    LEDGER: 'Ledger'
}

export const BIP44_PATH = {
    TESTNET: {
        BTC: "m/44'/1'/0'/0/0",
        DOGE: "m/44'/1'/0'/0/0",
        ETH: "m/44'/60'/0'/0/0",
        XRP: "m/44'/144'/0'/0/0"
    },
    MAINNET: {
        BTC: "m/44'/0'/0'/0/0",
        DOGE: "m/44'/3'/0'/0/0",
        ETH: "m/44'/60'/0'/0/0",
        XRP: "m/44'/144'/0'/0/0"
    }
}

export const LEDGER_APP = {
    ETH: 'Ethereum',
    XRP: 'XRP',
    BTC: 'Bitcoin',
    BTC_TEST: 'Bitcoin Test',
    DOGE: 'Dogecoin',
    FLARE: 'Flare Network'
}

export const FILTERS = {
    LAST_24_HOURS: 'day',
    LAST_WEEK: 'week',
    LAST_MONTH: 'month',
    YEAR_TO_DATE: 'yearToDate',
    LAST_YEAR: 'year',
    ALL_TIME: 'allTime'
}

export const DISTRIBUTION_START = '2024-12-16 00:00';
export const DISTRIBUTION_CYCLES_COUNT = 7;
export const DISTRIBUTION_CYCLE_DAYS = 14;
