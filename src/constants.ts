export const MAX_CR_VALUE = 1000;

export const WALLET = {
    WALLET_CONNECT: 'WalletConnect',
    META_MASK: 'MetaMask',
    LEDGER: 'Ledger',
    XAMAN: 'Xaman'
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
export const DISTRIBUTION_CYCLES_COUNT = 1000;
export const DISTRIBUTION_CYCLE_DAYS = 14;

export const COOKIE_WINDDOWN = 'winddown';

export const ABI_ERRORS: Record<string, string> = {
    "0x42c58312": "InappropriateFeeAmount",
    "0x3c36e9da": "AgentsFeeTooHigh",
    "0xd78c6677": "NotEnoughFreeCollateral",
    "0xaa2b63b3": "InvalidAgentStatus",
    "0x59ed140d": "CannotMintZeroLots",
    "0x417a2298": "AgentNotInMintQueue",
    "0xeb560756": "MintingPaused",
    "0x6d5ab9d3": "OnlyAssetManager",
    "0x73620441": "OnlyAgent",
    "0x0dc149f0": "AlreadyInitialized",
    "0x4c5eb241": "OnlyInternalUse",
    "0x983d334d": "PoolTokenAlreadySet",
    "0xb561932a": "AmountOfNatTooLow",
    "0xdea97f50": "AmountOfCollateralTooLow",
    "0x083b70a9": "DepositResultsInZeroTokens",
    "0xd9ebc7e5": "TokenShareIsZero",
    "0x8cf25597": "TokenBalanceTooLow",
    "0x4e9d9139": "SentAmountTooLow",
    "0x66f30fc4": "CollateralRatioFallsBelowExitCR",
    "0x44d99fea": "InvalidRecipientAddress",
    "0x1d7154c1": "RedemptionRequiresClosingTooManyTickets",
    "0x489e7ff8": "FreeFAssetBalanceTooSmall",
    "0x8ad31ccd": "WithdrawZeroFAsset",
    "0x8b25b007": "ZeroFAssetDebtPayment",
    "0xee10eda6": "PaymentLargerThanFeeDebt",
    "0xf132b8f9": "FAssetAllowanceTooSmall",
    "0x3b9c256f": "TokenSupplyAfterExitTooLow",
    "0xd4f24daf": "CollateralAfterExitTooLow",
    "0x6c8a6c62": "CannotDestroyPoolWithIssuedTokens",
    "0x909b1917": "EmergencyPauseActive",
    "0x9220531a": "SelfCloseOfZero",
    "0x1e99ffed": "AddressValid",
    "0x1a479e82": "WrongAddress",
    "0x8336ad7d": "InvalidRedemptionStatus",
    "0x45a22e43": "RedemptionOfZero",
    "0x882ccad9": "RedeemZeroLots",
    "0x369cb277": "InvalidTicketId",
    "0x5c85050a": "OnlyGovernanceOrExecutor"
};

export const LAYER_ZERO_STATUS = {
    DELIVERED: 'DELIVERED',
    INFLIGHT: 'INFLIGHT',
    PAYLOAD_STORED: 'PAYLOAD_STORED',
    FAILED: 'FAILED',
    BLOCKED: 'BLOCKED',
    CONFIRMING: 'CONFIRMING',
};

export const BRIDGE_TYPE = {
    HYPER_EVM: 'hyper_evm',
    HYPER_CORE: 'hyper_core',
    FLARE: 'flare'
} as const;