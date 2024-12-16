export const AssetManagerAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "feeBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "mintingVaultCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "mintingPoolCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "freeCollateralLots",
                "type": "uint256"
            }
        ],
        "name": "AgentAvailable",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "collateralClass",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "AgentCollateralTypeChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "destroyAllowedAt",
                "type": "uint256"
            }
        ],
        "name": "AgentDestroyAnnounced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            }
        ],
        "name": "AgentDestroyed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "AgentInCCB",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "query",
                "type": "uint256"
            }
        ],
        "name": "AgentPing",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "query",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "response",
                "type": "string"
            }
        ],
        "name": "AgentPingResponse",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "validAt",
                "type": "uint256"
            }
        ],
        "name": "AgentSettingChangeAnnounced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "AgentSettingChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "collateralPool",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "collateralPoolToken",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "underlyingAddress",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "vaultCollateralToken",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "poolWNatToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolFeeShareBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingVaultCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingPoolCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "buyFAssetByAgentFactorBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolExitCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolTopupCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolTopupTokenPriceFactorBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "handshakeType",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct IAssetManagerEvents.AgentVaultCreationData",
                "name": "creationData",
                "type": "tuple"
            }
        ],
        "name": "AgentVaultCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "exitAllowedAt",
                "type": "uint256"
            }
        ],
        "name": "AvailableAgentExitAnnounced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            }
        ],
        "name": "AvailableAgentExited",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "collateralClass",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "collateralToken",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "minCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ccbMinCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "safetyMinCollateralRatioBIPS",
                "type": "uint256"
            }
        ],
        "name": "CollateralRatiosChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "CollateralReservationCancelled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reservedAmountUBA",
                "type": "uint256"
            }
        ],
        "name": "CollateralReservationDeleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "CollateralReservationRejected",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "feeUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "firstUnderlyingBlock",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lastUnderlyingBlock",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lastUnderlyingTimestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "paymentAddress",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "paymentReference",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "executor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "executorFeeNatWei",
                "type": "uint256"
            }
        ],
        "name": "CollateralReserved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "collateralClass",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "decimals",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "directPricePair",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "assetFtsoSymbol",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "tokenFtsoSymbol",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "minCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ccbMinCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "safetyMinCollateralRatioBIPS",
                "type": "uint256"
            }
        ],
        "name": "CollateralTypeAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "collateralClass",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "collateralToken",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "validUntil",
                "type": "uint256"
            }
        ],
        "name": "CollateralTypeDeprecated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "value",
                "type": "address"
            }
        ],
        "name": "ContractChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "underlyingBlockNumber",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "underlyingBlockTimestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            }
        ],
        "name": "CurrentUnderlyingBlockUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "facetAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "enum IDiamond.FacetCutAction",
                        "name": "action",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes4[]",
                        "name": "functionSelectors",
                        "type": "bytes4[]"
                    }
                ],
                "indexed": false,
                "internalType": "struct IDiamond.FacetCut[]",
                "name": "_diamondCut",
                "type": "tuple[]"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "_init",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "_calldata",
                "type": "bytes"
            }
        ],
        "name": "DiamondCut",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash1",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash2",
                "type": "bytes32"
            }
        ],
        "name": "DuplicatePaymentConfirmed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "dustUBA",
                "type": "uint256"
            }
        ],
        "name": "DustChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "EmergencyPauseCanceled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "pausedUntil",
                "type": "uint256"
            }
        ],
        "name": "EmergencyPauseTriggered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "FullLiquidationStarted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "encodedCall",
                "type": "bytes"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "encodedCallHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "allowedAfterTimestamp",
                "type": "uint256"
            }
        ],
        "name": "GovernanceCallTimelocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "initialGovernance",
                "type": "address"
            }
        ],
        "name": "GovernanceInitialised",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "governanceSettings",
                "type": "address"
            }
        ],
        "name": "GovernedProductionModeEntered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string[]",
                "name": "minterUnderlyingAddresses",
                "type": "string[]"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "feeUBA",
                "type": "uint256"
            }
        ],
        "name": "HandshakeRequired",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash",
                "type": "bytes32"
            }
        ],
        "name": "IllegalPaymentConfirmed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            }
        ],
        "name": "LiquidationEnded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "liquidator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "paidVaultCollateralWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "paidPoolCollateralWei",
                "type": "uint256"
            }
        ],
        "name": "LiquidationPerformed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "LiquidationStarted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "mintedAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "agentFeeUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "poolFeeUBA",
                "type": "uint256"
            }
        ],
        "name": "MintingExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "collateralReservationId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reservedAmountUBA",
                "type": "uint256"
            }
        ],
        "name": "MintingPaymentDefault",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "withdrawalAllowedAt",
                "type": "uint256"
            }
        ],
        "name": "PoolTokenRedemptionAnnounced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redemptionAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "paidVaultCollateralWei",
                "type": "uint256"
            }
        ],
        "name": "RedeemedInCollateral",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redemptionAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redeemedVaultCollateralWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redeemedPoolCollateralWei",
                "type": "uint256"
            }
        ],
        "name": "RedemptionDefault",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redemptionAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "spentUnderlyingUBA",
                "type": "int256"
            }
        ],
        "name": "RedemptionPaymentBlocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "spentUnderlyingUBA",
                "type": "int256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "failureReason",
                "type": "string"
            }
        ],
        "name": "RedemptionPaymentFailed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redemptionAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "spentUnderlyingUBA",
                "type": "int256"
            }
        ],
        "name": "RedemptionPerformed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redemptionAmountUBA",
                "type": "uint256"
            }
        ],
        "name": "RedemptionRejected",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "remainingLots",
                "type": "uint256"
            }
        ],
        "name": "RedemptionRequestIncomplete",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "paymentAddress",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueUBA",
                "type": "uint256"
            }
        ],
        "name": "RedemptionRequestRejected",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "requestId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueTakenOverUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "newAgentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint64",
                "name": "newRequestId",
                "type": "uint64"
            }
        ],
        "name": "RedemptionRequestTakenOver",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "paymentAddress",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "feeUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "firstUnderlyingBlock",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lastUnderlyingBlock",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lastUnderlyingTimestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "paymentReference",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "executor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "executorFeeNatWei",
                "type": "uint256"
            }
        ],
        "name": "RedemptionRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "redemptionTicketId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketValueUBA",
                "type": "uint256"
            }
        ],
        "name": "RedemptionTicketCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "redemptionTicketId",
                "type": "uint256"
            }
        ],
        "name": "RedemptionTicketDeleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "redemptionTicketId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketValueUBA",
                "type": "uint256"
            }
        ],
        "name": "RedemptionTicketUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueUBA",
                "type": "uint256"
            }
        ],
        "name": "SelfClose",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "mintFromFreeUnderlying",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "mintedAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "depositedAmountUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "poolFeeUBA",
                "type": "uint256"
            }
        ],
        "name": "SelfMint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "value",
                "type": "uint256[]"
            }
        ],
        "name": "SettingArrayChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "SettingChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "encodedCallHash",
                "type": "bytes32"
            }
        ],
        "name": "TimelockedGovernanceCallCanceled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "encodedCallHash",
                "type": "bytes32"
            }
        ],
        "name": "TimelockedGovernanceCallExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "nextTransferFeeMillionths",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "scheduledAt",
                "type": "uint256"
            }
        ],
        "name": "TransferFeeChangeScheduled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "agentClaimedUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "poolClaimedUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "remainingUnclaimedEpochs",
                "type": "uint256"
            }
        ],
        "name": "TransferFeesClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "underlyingBalanceUBA",
                "type": "int256"
            }
        ],
        "name": "UnderlyingBalanceChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "balance",
                "type": "int256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requiredBalance",
                "type": "uint256"
            }
        ],
        "name": "UnderlyingBalanceTooLow",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "depositedUBA",
                "type": "uint256"
            }
        ],
        "name": "UnderlyingBalanceToppedUp",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "announcementId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "paymentReference",
                "type": "bytes32"
            }
        ],
        "name": "UnderlyingWithdrawalAnnounced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "announcementId",
                "type": "uint64"
            }
        ],
        "name": "UnderlyingWithdrawalCancelled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint64",
                "name": "announcementId",
                "type": "uint64"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "spentUBA",
                "type": "int256"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "transactionHash",
                "type": "bytes32"
            }
        ],
        "name": "UnderlyingWithdrawalConfirmed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "agentVault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "withdrawalAllowedAt",
                "type": "uint256"
            }
        ],
        "name": "VaultCollateralWithdrawalAnnounced",
        "type": "event"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "enum CollateralType.Class",
                        "name": "collateralClass",
                        "type": "uint8"
                    },
                    {
                        "internalType": "contract IERC20",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "decimals",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "validUntil",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "directPricePair",
                        "type": "bool"
                    },
                    {
                        "internalType": "string",
                        "name": "assetFtsoSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "tokenFtsoSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ccbMinCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "safetyMinCollateralRatioBIPS",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CollateralType.Data",
                "name": "_data",
                "type": "tuple"
            }
        ],
        "name": "addCollateralType",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_query",
                "type": "uint256"
            }
        ],
        "name": "agentPing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_query",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_response",
                "type": "string"
            }
        ],
        "name": "agentPingResponse",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_firstRedemptionTicketId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_pageSize",
                "type": "uint256"
            }
        ],
        "name": "agentRedemptionQueue",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "redemptionTicketId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "agentVault",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ticketValueUBA",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct RedemptionTicketInfo.Data[]",
                "name": "_queue",
                "type": "tuple[]"
            },
            {
                "internalType": "uint256",
                "name": "_nextRedemptionTicketId",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_maxEpochsToClaim",
                "type": "uint256"
            }
        ],
        "name": "agentTransferFeeShare",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_feeShareUBA",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_epoch",
                "type": "uint256"
            }
        ],
        "name": "agentTransferFeeShareForEpoch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "agentUnclaimedTransferFeeEpochs",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_first",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_count",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_valueNATWei",
                "type": "uint256"
            }
        ],
        "name": "announceAgentPoolTokenRedemption",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_redemptionAllowedAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "announceAgentSettingUpdate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_updateAllowedAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "announceDestroyAgent",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_destroyAllowedAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "announceExitAvailableAgentList",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_exitAllowedAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "announceUnderlyingWithdrawal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_valueNATWei",
                "type": "uint256"
            }
        ],
        "name": "announceVaultCollateralWithdrawal",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_withdrawalAllowedAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "approveCollateralReservation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "assetManagerController",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "assetMintingDecimals",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "assetMintingGranularityUBA",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "assetPriceNatWei",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_multiplier",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_divisor",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "attached",
                "type": "bool"
            }
        ],
        "name": "attachController",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_valueNATWei",
                "type": "uint256"
            }
        ],
        "name": "beforeCollateralWithdrawal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "buybackAgentCollateral",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "cancelCollateralReservation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_encodedCall",
                "type": "bytes"
            }
        ],
        "name": "cancelGovernanceCall",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "cancelUnderlyingWithdrawal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_maxEpochsToClaim",
                "type": "uint256"
            }
        ],
        "name": "claimTransferFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_agentClaimedUBA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_poolClaimedUBA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_remainingUnclaimedEpochs",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_lots",
                "type": "uint256"
            }
        ],
        "name": "collateralReservationFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_reservationFeeNATWei",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "inUtxo",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "utxo",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct IPayment.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "receivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "intendedReceivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedSpentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "receivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedReceivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "oneToOne",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "uint8",
                                        "name": "status",
                                        "type": "uint8"
                                    }
                                ],
                                "internalType": "struct IPayment.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IPayment.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IPayment.Proof",
                "name": "_payment",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "confirmRedemptionPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "inUtxo",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "utxo",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct IPayment.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "receivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "intendedReceivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedSpentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "receivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedReceivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "oneToOne",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "uint8",
                                        "name": "status",
                                        "type": "uint8"
                                    }
                                ],
                                "internalType": "struct IPayment.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IPayment.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IPayment.Proof",
                "name": "_payment",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "confirmTopupPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "inUtxo",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "utxo",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct IPayment.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "receivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "intendedReceivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedSpentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "receivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedReceivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "oneToOne",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "uint8",
                                        "name": "status",
                                        "type": "uint8"
                                    }
                                ],
                                "internalType": "struct IPayment.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IPayment.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IPayment.Proof",
                "name": "_payment",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "confirmUnderlyingWithdrawal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "controllerAttached",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "convertDustToTicket",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "string",
                                        "name": "addressStr",
                                        "type": "string"
                                    }
                                ],
                                "internalType": "struct IAddressValidity.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bool",
                                        "name": "isValid",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "string",
                                        "name": "standardAddress",
                                        "type": "string"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardAddressHash",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IAddressValidity.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IAddressValidity.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IAddressValidity.Proof",
                "name": "_addressProof",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "contract IERC20",
                        "name": "vaultCollateralToken",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "poolTokenSuffix",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolFeeShareBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingVaultCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingPoolCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "buyFAssetByAgentFactorBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolExitCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolTopupCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolTopupTokenPriceFactorBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "handshakeType",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AgentSettings.Data",
                "name": "_settings",
                "type": "tuple"
            }
        ],
        "name": "createAgentVault",
        "outputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentTransferFeeEpoch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentUnderlyingBlock",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_blockNumber",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_blockTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_lastUpdateTs",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum CollateralType.Class",
                "name": "_collateralClass",
                "type": "uint8"
            },
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_invalidationTimeSec",
                "type": "uint256"
            }
        ],
        "name": "deprecateCollateralType",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "address payable",
                "name": "_recipient",
                "type": "address"
            }
        ],
        "name": "destroyAgent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "facetAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "enum IDiamond.FacetCutAction",
                        "name": "action",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes4[]",
                        "name": "functionSelectors",
                        "type": "bytes4[]"
                    }
                ],
                "internalType": "struct IDiamond.FacetCut[]",
                "name": "_diamondCut",
                "type": "tuple[]"
            },
            {
                "internalType": "address",
                "name": "_init",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_calldata",
                "type": "bytes"
            }
        ],
        "name": "diamondCut",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressIndicator",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IBalanceDecreasingTransaction.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IBalanceDecreasingTransaction.Proof",
                "name": "_payment1",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressIndicator",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IBalanceDecreasingTransaction.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IBalanceDecreasingTransaction.Proof",
                "name": "_payment2",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "doublePaymentChallenge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "_byGovernance",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "_duration",
                "type": "uint256"
            }
        ],
        "name": "emergencyPause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyPauseDetails",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_pausedUntil",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_totalPauseDuration",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_pausedByGovernance",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyPaused",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyPausedUntil",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "endLiquidation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            }
        ],
        "name": "executeAgentSettingUpdate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_encodedCall",
                "type": "bytes"
            }
        ],
        "name": "executeGovernanceCall",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "inUtxo",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "utxo",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct IPayment.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "receivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "intendedReceivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedSpentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "receivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedReceivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "oneToOne",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "uint8",
                                        "name": "status",
                                        "type": "uint8"
                                    }
                                ],
                                "internalType": "struct IPayment.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IPayment.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IPayment.Proof",
                "name": "_payment",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "executeMinting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "exitAvailableAgentList",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fAsset",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "_functionSelector",
                "type": "bytes4"
            }
        ],
        "name": "facetAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "facetAddress_",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "facetAddresses",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "facetAddresses_",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_facet",
                "type": "address"
            }
        ],
        "name": "facetFunctionSelectors",
        "outputs": [
            {
                "internalType": "bytes4[]",
                "name": "facetFunctionSelectors_",
                "type": "bytes4[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "facets",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "facetAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes4[]",
                        "name": "functionSelectors",
                        "type": "bytes4[]"
                    }
                ],
                "internalType": "struct IDiamondLoupe.Facet[]",
                "name": "facets_",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fee",
                "type": "uint256"
            }
        ],
        "name": "fassetTransferFeePaid",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "queryWindow",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IConfirmedBlockHeightExists.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "numberOfConfirmations",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "lowestQueryWindowBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "lowestQueryWindowBlockTimestamp",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IConfirmedBlockHeightExists.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IConfirmedBlockHeightExists.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IConfirmedBlockHeightExists.Proof",
                "name": "_proof",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "finishRedemptionWithoutPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "firstClaimableTransferFeeEpoch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressIndicator",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IBalanceDecreasingTransaction.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IBalanceDecreasingTransaction.Proof[]",
                "name": "_payments",
                "type": "tuple[]"
            },
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "freeBalanceNegativeChallenge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getAgentFullPoolCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getAgentFullVaultCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getAgentInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum AgentInfo.Status",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "ownerManagementAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "ownerWorkAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "collateralPool",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "collateralPoolToken",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "underlyingAddressString",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "publiclyAvailable",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolFeeShareBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "contract IERC20",
                        "name": "vaultCollateralToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingVaultCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingPoolCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "freeCollateralLots",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalVaultCollateralWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "freeVaultCollateralWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "vaultCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "contract IERC20",
                        "name": "poolWNatToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalPoolCollateralNATWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "freePoolCollateralNATWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAgentPoolTokensWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "announcedVaultCollateralWithdrawalWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "announcedPoolTokensWithdrawalWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "freeAgentPoolTokensWei",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintedUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "reservedUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "redeemingUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolRedeemingUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dustUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ccbStartTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "liquidationStartTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLiquidationAmountUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "liquidationPaymentFactorVaultBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "liquidationPaymentFactorPoolBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "int256",
                        "name": "underlyingBalanceUBA",
                        "type": "int256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredUnderlyingBalanceUBA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "int256",
                        "name": "freeUnderlyingBalanceUBA",
                        "type": "int256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "announcedUnderlyingWithdrawalId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "buyFAssetByAgentFactorBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolExitCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolTopupCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolTopupTokenPriceFactorBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "handshakeType",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AgentInfo.Info",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getAgentLiquidationFactorsAndMaxAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "liquidationPaymentFactorVaultBIPS",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidationPaymentFactorPoolBIPS",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxLiquidationAmountUBA",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getAgentVaultCollateralToken",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getAgentVaultOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "_ownerManagementAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_start",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_end",
                "type": "uint256"
            }
        ],
        "name": "getAllAgents",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "_agentVaults",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "_totalLength",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_start",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_end",
                "type": "uint256"
            }
        ],
        "name": "getAvailableAgentsDetailedList",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "agentVault",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "ownerManagementAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingVaultCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "mintingPoolCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "freeCollateralLots",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum AgentInfo.Status",
                        "name": "status",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct AvailableAgentInfo.Data[]",
                "name": "_agents",
                "type": "tuple[]"
            },
            {
                "internalType": "uint256",
                "name": "_totalLength",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_start",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_end",
                "type": "uint256"
            }
        ],
        "name": "getAvailableAgentsList",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "_agentVaults",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "_totalLength",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getCollateralPool",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCollateralPoolTokenTimelockSeconds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum CollateralType.Class",
                "name": "_collateralClass",
                "type": "uint8"
            },
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            }
        ],
        "name": "getCollateralType",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum CollateralType.Class",
                        "name": "collateralClass",
                        "type": "uint8"
                    },
                    {
                        "internalType": "contract IERC20",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "decimals",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "validUntil",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "directPricePair",
                        "type": "bool"
                    },
                    {
                        "internalType": "string",
                        "name": "assetFtsoSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "tokenFtsoSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ccbMinCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "safetyMinCollateralRatioBIPS",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CollateralType.Data",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCollateralTypes",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum CollateralType.Class",
                        "name": "collateralClass",
                        "type": "uint8"
                    },
                    {
                        "internalType": "contract IERC20",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "decimals",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "validUntil",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "directPricePair",
                        "type": "bool"
                    },
                    {
                        "internalType": "string",
                        "name": "assetFtsoSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "tokenFtsoSymbol",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ccbMinCollateralRatioBIPS",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "safetyMinCollateralRatioBIPS",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CollateralType.Data[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "getFAssetsBackedByPool",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSettings",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "assetManagerController",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "fAsset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "agentVaultFactory",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "collateralPoolFactory",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "collateralPoolTokenFactory",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "poolTokenSuffix",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "whitelist",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "agentOwnerRegistry",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "fdcVerification",
                        "type": "address"
                    },
                    {
                        "internalType": "address payable",
                        "name": "burnAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "priceReader",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "assetDecimals",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "assetMintingDecimals",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "chainId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "averageBlockTimeMS",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "mintingPoolHoldingsRequiredBIPS",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint16",
                        "name": "collateralReservationFeeBIPS",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint64",
                        "name": "assetUnitUBA",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "assetMintingGranularityUBA",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "lotSizeAMG",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint16",
                        "name": "minUnderlyingBackingBIPS",
                        "type": "uint16"
                    },
                    {
                        "internalType": "bool",
                        "name": "requireEOAAddressProof",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint64",
                        "name": "mintingCapAMG",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "underlyingBlocksForPayment",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "underlyingSecondsForPayment",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint16",
                        "name": "redemptionFeeBIPS",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint32",
                        "name": "redemptionDefaultFactorVaultCollateralBIPS",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "redemptionDefaultFactorPoolBIPS",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "confirmationByOthersAfterSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint128",
                        "name": "confirmationByOthersRewardUSD5",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint16",
                        "name": "maxRedeemedTickets",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "paymentChallengeRewardBIPS",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint128",
                        "name": "paymentChallengeRewardUSD5",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint64",
                        "name": "withdrawalWaitMinSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "maxTrustedPriceAgeSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "ccbTimeSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "attestationWindowSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "minUpdateRepeatTimeSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "buybackCollateralFactorBIPS",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "announcedUnderlyingConfirmationMinSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "tokenInvalidationTimeMinSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint32",
                        "name": "vaultCollateralBuyForFlareFactorBIPS",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "agentExitAvailableTimelockSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "agentFeeChangeTimelockSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "agentMintingCRChangeTimelockSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "poolExitAndTopupChangeTimelockSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "agentTimelockedOperationWindowSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint32",
                        "name": "collateralPoolTokenTimelockSeconds",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "liquidationStepSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "liquidationCollateralFactorBIPS",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "liquidationFactorVaultCollateralBIPS",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint64",
                        "name": "diamondCutMinTimelockSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "maxEmergencyPauseDurationSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "emergencyPauseDurationResetAfterSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "cancelCollateralReservationAfterSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "rejectRedemptionRequestWindowSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "takeOverRedemptionRequestWindowSeconds",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint32",
                        "name": "rejectedRedemptionDefaultFactorVaultCollateralBIPS",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "rejectedRedemptionDefaultFactorPoolBIPS",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct AssetManagerSettings.Data",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWNat",
        "outputs": [
            {
                "internalType": "contract IWNat",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "governance",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "governanceSettings",
        "outputs": [
            {
                "internalType": "contract IGovernanceSettings",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressIndicator",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IBalanceDecreasingTransaction.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IBalanceDecreasingTransaction.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IBalanceDecreasingTransaction.Proof",
                "name": "_transaction",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "illegalPaymentChallenge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_agentVaults",
                "type": "address[]"
            }
        ],
        "name": "initAgentsMintingHistory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "isAgentVaultOwner",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "isExecutor",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            }
        ],
        "name": "isLockedVaultToken",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_suffix",
                "type": "string"
            }
        ],
        "name": "isPoolTokenSuffixReserved",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountUBA",
                "type": "uint256"
            }
        ],
        "name": "liquidate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_liquidatedAmountUBA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountPaidVault",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountPaidPool",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lotSize",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_lotSizeUBA",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "makeAgentAvailable",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "maxRedemptionFromAgent",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint64",
                "name": "_lots",
                "type": "uint64"
            }
        ],
        "name": "mintFromFreeUnderlying",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mintingPaused",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "minimalBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "deadlineBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "deadlineTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "destinationAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "amount",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "checkSourceAddresses",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IReferencedPaymentNonexistence.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "minimalBlockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "firstOverflowBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "firstOverflowBlockTimestamp",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IReferencedPaymentNonexistence.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IReferencedPaymentNonexistence.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IReferencedPaymentNonexistence.Proof",
                "name": "_proof",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "mintingPaymentDefault",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pauseMinting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "priceReader",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "productionMode",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "inUtxo",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "utxo",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct IPayment.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "receivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "intendedReceivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedSpentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "receivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedReceivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "oneToOne",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "uint8",
                                        "name": "status",
                                        "type": "uint8"
                                    }
                                ],
                                "internalType": "struct IPayment.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IPayment.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IPayment.Proof",
                "name": "_payment",
                "type": "tuple"
            }
        ],
        "name": "proveUnderlyingAddressEOA",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_lots",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_redeemerUnderlyingAddressString",
                "type": "string"
            },
            {
                "internalType": "address payable",
                "name": "_executor",
                "type": "address"
            }
        ],
        "name": "redeem",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_redeemedAmountUBA",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountUBA",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_receiverUnderlyingAddress",
                "type": "string"
            },
            {
                "internalType": "address payable",
                "name": "_executor",
                "type": "address"
            }
        ],
        "name": "redeemFromAgent",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountUBA",
                "type": "uint256"
            }
        ],
        "name": "redeemFromAgentInCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "minimalBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "deadlineBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "deadlineTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "destinationAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "amount",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "checkSourceAddresses",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IReferencedPaymentNonexistence.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "minimalBlockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "firstOverflowBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "firstOverflowBlockTimestamp",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IReferencedPaymentNonexistence.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IReferencedPaymentNonexistence.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IReferencedPaymentNonexistence.Proof",
                "name": "_proof",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "redemptionPaymentDefault",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "redemptionPaymentExtensionSeconds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_firstRedemptionTicketId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_pageSize",
                "type": "uint256"
            }
        ],
        "name": "redemptionQueue",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "redemptionTicketId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "agentVault",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ticketValueUBA",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct RedemptionTicketInfo.Data[]",
                "name": "_queue",
                "type": "tuple[]"
            },
            {
                "internalType": "uint256",
                "name": "_nextRedemptionTicketId",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "rejectCollateralReservation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "string",
                                        "name": "addressStr",
                                        "type": "string"
                                    }
                                ],
                                "internalType": "struct IAddressValidity.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bool",
                                        "name": "isValid",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "string",
                                        "name": "standardAddress",
                                        "type": "string"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardAddressHash",
                                        "type": "bytes32"
                                    }
                                ],
                                "internalType": "struct IAddressValidity.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IAddressValidity.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IAddressValidity.Proof",
                "name": "_proof",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "rejectInvalidRedemption",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "rejectRedemptionRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "rejectedRedemptionPaymentDefault",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lots",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxMintingFeeBIPS",
                "type": "uint256"
            },
            {
                "internalType": "address payable",
                "name": "_executor",
                "type": "address"
            },
            {
                "internalType": "string[]",
                "name": "_minterUnderlyingAddresses",
                "type": "string[]"
            }
        ],
        "name": "reserveCollateral",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "resetEmergencyPauseTotalDuration",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountUBA",
                "type": "uint256"
            }
        ],
        "name": "selfClose",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_closedAmountUBA",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "transactionId",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "inUtxo",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "utxo",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct IPayment.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "sourceAddressesRoot",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "receivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "intendedReceivingAddressHash",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "spentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedSpentAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "receivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "int256",
                                        "name": "intendedReceivedAmount",
                                        "type": "int256"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "standardPaymentReference",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "oneToOne",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "uint8",
                                        "name": "status",
                                        "type": "uint8"
                                    }
                                ],
                                "internalType": "struct IPayment.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IPayment.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IPayment.Proof",
                "name": "_payment",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lots",
                "type": "uint256"
            }
        ],
        "name": "selfMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAgentExitAvailableTimelockSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAgentFeeChangeTimelockSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAgentMintingCRChangeTimelockSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setAgentOwnerRegistry",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAgentTimelockedOperationWindowSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setAgentVaultFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAnnouncedUnderlyingConfirmationMinSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAttestationWindowSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setAverageBlockTimeMS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setCancelCollateralReservationAfterSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setCcbTimeSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setCleanerContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setCleanupBlockNumberManager",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setCollateralPoolFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setCollateralPoolTokenFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setCollateralPoolTokenTimelockSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum CollateralType.Class",
                "name": "_collateralClass",
                "type": "uint8"
            },
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_minCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_ccbMinCollateralRatioBIPS",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_safetyMinCollateralRatioBIPS",
                "type": "uint256"
            }
        ],
        "name": "setCollateralRatiosForToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setCollateralReservationFeeBips",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setConfirmationByOthersAfterSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setConfirmationByOthersRewardUSD5",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setEmergencyPauseDurationResetAfterSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setFdcVerification",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_liquidationFactors",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_vaultCollateralFactors",
                "type": "uint256[]"
            }
        ],
        "name": "setLiquidationPaymentFactors",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_stepSeconds",
                "type": "uint256"
            }
        ],
        "name": "setLiquidationStepSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setLotSizeAmg",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMaxEmergencyPauseDurationSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMaxRedeemedTickets",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMaxTrustedPriceAgeSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMinUnderlyingBackingBips",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMinUpdateRepeatTimeSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMintingCapAmg",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setMintingPoolHoldingsRequiredBIPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rewardNATWei",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_rewardBIPS",
                "type": "uint256"
            }
        ],
        "name": "setPaymentChallengeReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setPoolExitAndTopupChangeTimelockSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setPriceReader",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_vaultFactor",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_poolFactor",
                "type": "uint256"
            }
        ],
        "name": "setRedemptionDefaultFactorBips",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setRedemptionFeeBips",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setRedemptionPaymentExtensionSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setRejectRedemptionRequestWindowSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_vaultF",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_poolF",
                "type": "uint256"
            }
        ],
        "name": "setRejectedRedemptionDefaultFactorBips",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setTakeOverRedemptionRequestWindowSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_underlyingBlocks",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_underlyingSeconds",
                "type": "uint256"
            }
        ],
        "name": "setTimeForPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setTokenInvalidationTimeMinSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_scheduledAt",
                "type": "uint256"
            }
        ],
        "name": "setTransferFeeMillionths",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setVaultCollateralBuyForFlareFactorBIPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            }
        ],
        "name": "setWhitelist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setWithdrawalOrDestroyWaitMinSeconds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "startLiquidation",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "_liquidationStatus",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_liquidationStartTs",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "switchToProductionMode",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            }
        ],
        "name": "switchVaultCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_redemptionRequestId",
                "type": "uint256"
            }
        ],
        "name": "takeOverRedemptionRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "terminate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "terminated",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_epoch",
                "type": "uint256"
            }
        ],
        "name": "transferFeeCalculationDataForAgent",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "cumulativeMinted",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalCumulativeMinted",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "claimable",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "claimed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct ITransferFees.TransferFeeCalculationDataForAgent",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_epoch",
                "type": "uint256"
            }
        ],
        "name": "transferFeeEpochData",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "startTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "claimedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "claimable",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "expired",
                        "type": "bool"
                    }
                ],
                "internalType": "struct ITransferFees.TransferFeeEpochData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "transferFeeMillionths",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "transferFeeSettings",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "transferFeeMillionths",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "firstEpochStartTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "epochDuration",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxUnexpiredEpochs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "firstClaimableEpoch",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ITransferFees.TransferFeeSettings",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unpauseMinting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "queryWindow",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IConfirmedBlockHeightExists.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "numberOfConfirmations",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "lowestQueryWindowBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "lowestQueryWindowBlockTimestamp",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IConfirmedBlockHeightExists.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IConfirmedBlockHeightExists.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IConfirmedBlockHeightExists.Proof",
                "name": "_proof",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_collateralReservationId",
                "type": "uint256"
            }
        ],
        "name": "unstickMinting",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "contract IERC20",
                "name": "_token",
                "type": "address"
            }
        ],
        "name": "updateCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32[]",
                        "name": "merkleProof",
                        "type": "bytes32[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "attestationType",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "sourceId",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint64",
                                "name": "votingRound",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint64",
                                "name": "lowestUsedTimestamp",
                                "type": "uint64"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "queryWindow",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IConfirmedBlockHeightExists.RequestBody",
                                "name": "requestBody",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint64",
                                        "name": "blockTimestamp",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "numberOfConfirmations",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "lowestQueryWindowBlockNumber",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "lowestQueryWindowBlockTimestamp",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct IConfirmedBlockHeightExists.ResponseBody",
                                "name": "responseBody",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct IConfirmedBlockHeightExists.Response",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IConfirmedBlockHeightExists.Proof",
                "name": "_proof",
                "type": "tuple"
            }
        ],
        "name": "updateCurrentBlock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_controller",
                "type": "address"
            },
            {
                "internalType": "contract IWNat",
                "name": "_wNat",
                "type": "address"
            }
        ],
        "name": "updateSystemContracts",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "upgradeAgentVaultAndPool",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_value",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
            }
        ],
        "name": "upgradeFAssetImplementation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            }
        ],
        "name": "upgradeWNatContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const CollateralPoolAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentVault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_assetManager",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_fAsset",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "_exitCollateralRatioBIPS",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "_topupCollateralRatioBIPS",
                "type": "uint32"
            },
            {
                "internalType": "uint16",
                "name": "_topupTokenPriceFactorBIPS",
                "type": "uint16"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenHolder",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountNatWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receivedTokensWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "addedFAssetFeesUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newFAssetFeeDebt",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timelockExpiresAt",
                "type": "uint256"
            }
        ],
        "name": "Entered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenHolder",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "burnedTokensWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receivedNatWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receviedFAssetFeesUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "closedFAssetsUBA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newFAssetFeeDebt",
                "type": "uint256"
            }
        ],
        "name": "Exited",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "burnedTokensWei",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "redeemedFAssetUBA",
                "type": "uint256"
            }
        ],
        "name": "IncompleteSelfCloseExit",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "MIN_NAT_BALANCE_AFTER_EXIT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MIN_NAT_TO_ENTER",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MIN_TOKEN_SUPPLY_AFTER_EXIT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "agentVault",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "assetManager",
        "outputs": [
            {
                "internalType": "contract IIAssetManager",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IDistributionToDelegators",
                "name": "_distribution",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_month",
                "type": "uint256"
            }
        ],
        "name": "claimAirdropDistribution",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IFtsoRewardManager",
                "name": "_ftsoRewardManager",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lastRewardEpoch",
                "type": "uint256"
            }
        ],
        "name": "claimFtsoRewards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "debtFreeTokensOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "debtLockedTokensOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_bips",
                "type": "uint256"
            }
        ],
        "name": "delegate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "delegateGovernance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "depositNat",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "_recipient",
                "type": "address"
            }
        ],
        "name": "destroy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fAssets",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_enterWithFullFAssets",
                "type": "bool"
            }
        ],
        "name": "enter",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tokenShare",
                "type": "uint256"
            },
            {
                "internalType": "enum ICollateralPool.TokenExitType",
                "name": "_exitType",
                "type": "uint8"
            }
        ],
        "name": "exit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "exitCollateralRatioBIPS",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fAsset",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "fAssetFeeDebtOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "fAssetFeeDeposited",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "fAssetFeesOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tokenAmountWei",
                "type": "uint256"
            }
        ],
        "name": "fAssetRequiredForSelfCloseExit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IDistributionToDelegators",
                "name": "_distribution",
                "type": "address"
            }
        ],
        "name": "optOutOfAirdrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fAssets",
                "type": "uint256"
            }
        ],
        "name": "payFAssetFeeDebt",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_agentResponsibilityWei",
                "type": "uint256"
            }
        ],
        "name": "payout",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "poolToken",
        "outputs": [
            {
                "internalType": "contract ICollateralPoolToken",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_who",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_blockNumber",
                "type": "uint256"
            }
        ],
        "name": "revokeDelegationAt",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tokenShare",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_redeemToCollateral",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "_redeemerUnderlyingAddress",
                "type": "string"
            },
            {
                "internalType": "address payable",
                "name": "_executor",
                "type": "address"
            }
        ],
        "name": "selfCloseExit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_exitCollateralRatioBIPS",
                "type": "uint256"
            }
        ],
        "name": "setExitCollateralRatioBIPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_poolToken",
                "type": "address"
            }
        ],
        "name": "setPoolToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_topupCollateralRatioBIPS",
                "type": "uint256"
            }
        ],
        "name": "setTopupCollateralRatioBIPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_topupTokenPriceFactorBIPS",
                "type": "uint256"
            }
        ],
        "name": "setTopupTokenPriceFactorBIPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "_interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "token",
        "outputs": [
            {
                "internalType": "contract IICollateralPoolToken",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "topupCollateralRatioBIPS",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "topupTokenPriceFactorBIPS",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFAssetFeeDebt",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFAssetFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "undelegateAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "undelegateGovernance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IWNat",
                "name": "_newWNat",
                "type": "address"
            }
        ],
        "name": "upgradeWNatContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "virtualFAssetOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wNat",
        "outputs": [
            {
                "internalType": "contract IWNat",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawCollateralWhenFAssetTerminated",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fAssets",
                "type": "uint256"
            }
        ],
        "name": "withdrawFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

export const CollateralPoolTokenAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_collateralPool",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_tokenName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_tokenSymbol",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_ignoreTimelocked",
                "type": "bool"
            }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_maxTimelockedEntries",
                "type": "uint256"
            }
        ],
        "name": "cleanupExpiredTimelocks",
        "outputs": [
            {
                "internalType": "bool",
                "name": "_cleanedAllExpired",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "collateralPool",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "debtFreeBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "debtLockedBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "_recipient",
                "type": "address"
            }
        ],
        "name": "destroy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "lockedBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_timelockExpiresAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "nonTimelockedBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "_interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "timelockedBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_timelocked",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "transferableBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
