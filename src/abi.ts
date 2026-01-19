export const AssetManagerAbi = [
    {
      "inputs": [],
      "name": "AlreadyInProductionMode",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GovernedAddressZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GovernedAlreadyInitialized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyExecutor",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyGovernance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TimelockInvalidSelector",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TimelockNotAllowedYet",
      "type": "error"
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
              "name": "redemptionPoolFeeShareBIPS",
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
          "indexed": true,
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
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
      "name": "CoreVaultRedemptionRequested",
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
      "inputs": [],
      "name": "EmergencyPauseTransfersCanceled",
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
      "name": "EmergencyPauseTransfersTriggered",
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
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "poolFeeUBA",
          "type": "uint256"
        }
      ],
      "name": "RedemptionPoolFeeMinted",
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
          "indexed": true,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "ReturnFromCoreVaultCancelled",
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
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "receivedUnderlyingUBA",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "remintedUBA",
          "type": "uint256"
        }
      ],
      "name": "ReturnFromCoreVaultConfirmed",
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
          "name": "requestId",
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
          "internalType": "uint256",
          "name": "valueUBA",
          "type": "uint256"
        }
      ],
      "name": "ReturnFromCoreVaultRequested",
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
          "indexed": true,
          "internalType": "address",
          "name": "agentVault",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transferRedemptionRequestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "remintedUBA",
          "type": "uint256"
        }
      ],
      "name": "TransferToCoreVaultDefaulted",
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
          "name": "transferRedemptionRequestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "valueUBA",
          "type": "uint256"
        }
      ],
      "name": "TransferToCoreVaultStarted",
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
          "name": "transferRedemptionRequestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "valueUBA",
          "type": "uint256"
        }
      ],
      "name": "TransferToCoreVaultSuccessful",
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
          "internalType": "uint256",
          "name": "announcementId",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "announcementId",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "announcementId",
          "type": "uint256"
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
          "internalType": "address",
          "name": "_agentVault",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_minter",
          "type": "address"
        }
      ],
      "name": "addAlwaysAllowedMinterForAgent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
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
        }
      ],
      "name": "alwaysAllowedMintersForAgent",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
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
      "name": "cancelReturnFromCoreVault",
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
          "internalType": "uint256",
          "name": "_collateralReservationId",
          "type": "uint256"
        }
      ],
      "name": "collateralReservationInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint64",
              "name": "collateralReservationId",
              "type": "uint64"
            },
            {
              "internalType": "address",
              "name": "agentVault",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "minter",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "paymentAddress",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "paymentReference",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "valueUBA",
              "type": "uint256"
            },
            {
              "internalType": "uint128",
              "name": "mintingFeeUBA",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "reservationFeeNatWei",
              "type": "uint128"
            },
            {
              "internalType": "uint16",
              "name": "poolFeeShareBIPS",
              "type": "uint16"
            },
            {
              "internalType": "uint64",
              "name": "firstUnderlyingBlock",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "lastUnderlyingBlock",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "lastUnderlyingTimestamp",
              "type": "uint64"
            },
            {
              "internalType": "address",
              "name": "executor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "executorFeeNatWei",
              "type": "uint256"
            },
            {
              "internalType": "enum CollateralReservationInfo.Status",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct CollateralReservationInfo.Data",
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
      "name": "confirmReturnFromCoreVault",
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
      "inputs": [],
      "name": "coreVaultAvailableAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_immediatelyAvailableUBA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_totalAvailableUBA",
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
              "name": "redemptionPoolFeeShareBIPS",
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
      "name": "emergencyPauseTransfers",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyPauseTransfersDetails",
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
              "name": "redemptionPoolFeeShareBIPS",
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
      "name": "getAgentMinPoolCollateralRatioBIPS",
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
      "name": "getAgentMinVaultCollateralRatioBIPS",
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
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "name": "getAgentSetting",
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
      "inputs": [],
      "name": "getCoreVaultManager",
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
      "name": "getCoreVaultMinimumAmountLeftBIPS",
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
      "name": "getCoreVaultMinimumRedeemLots",
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
      "name": "getCoreVaultNativeAddress",
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
      "name": "getCoreVaultRedemptionFeeBIPS",
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
      "name": "getCoreVaultTransferTimeExtensionSeconds",
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
              "name": "__whitelist",
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
              "name": "__minUnderlyingBackingBIPS",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "__requireEOAAddressProof",
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
              "name": "__redemptionDefaultFactorPoolBIPS",
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
              "name": "__ccbTimeSeconds",
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
              "name": "__buybackCollateralFactorBIPS",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "__announcedUnderlyingConfirmationMinSeconds",
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
              "name": "poolExitCRChangeTimelockSeconds",
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
              "name": "__cancelCollateralReservationAfterSeconds",
              "type": "uint64"
            },
            {
              "internalType": "uint16",
              "name": "__rejectOrCancelCollateralReservationReturnFactorBIPS",
              "type": "uint16"
            },
            {
              "internalType": "uint64",
              "name": "__rejectRedemptionRequestWindowSeconds",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "__takeOverRedemptionRequestWindowSeconds",
              "type": "uint64"
            },
            {
              "internalType": "uint32",
              "name": "__rejectedRedemptionDefaultFactorVaultCollateralBIPS",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "__rejectedRedemptionDefaultFactorPoolBIPS",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "_managementAddress",
          "type": "address"
        }
      ],
      "name": "getWorkAddress",
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
          "name": "_payment",
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
        }
      ],
      "name": "maximumTransferToCoreVault",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_maximumTransferUBA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_minimumLeftAmountUBA",
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
          "internalType": "uint256",
          "name": "_lots",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_redeemerUnderlyingAddress",
          "type": "string"
        }
      ],
      "name": "redeemFromCoreVault",
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
          "name": "_redemptionRequestId",
          "type": "uint256"
        }
      ],
      "name": "redemptionRequestInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint64",
              "name": "redemptionRequestId",
              "type": "uint64"
            },
            {
              "internalType": "enum RedemptionRequestInfo.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "agentVault",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "redeemer",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "paymentAddress",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "paymentReference",
              "type": "bytes32"
            },
            {
              "internalType": "uint128",
              "name": "valueUBA",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "feeUBA",
              "type": "uint128"
            },
            {
              "internalType": "uint16",
              "name": "poolFeeShareBIPS",
              "type": "uint16"
            },
            {
              "internalType": "uint64",
              "name": "firstUnderlyingBlock",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "lastUnderlyingBlock",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "lastUnderlyingTimestamp",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "timestamp",
              "type": "uint64"
            },
            {
              "internalType": "bool",
              "name": "poolSelfClose",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "transferToCoreVault",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "executor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "executorFeeNatWei",
              "type": "uint256"
            }
          ],
          "internalType": "struct RedemptionRequestInfo.Data",
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
          "internalType": "address",
          "name": "_agentVault",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_minter",
          "type": "address"
        }
      ],
      "name": "removeAlwaysAllowedMinterForAgent",
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
        }
      ],
      "name": "requestReturnFromCoreVault",
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
        }
      ],
      "name": "reserveCollateral",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_collateralReservationId",
          "type": "uint256"
        }
      ],
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
      "inputs": [],
      "name": "resetEmergencyPauseTransfersTotalDuration",
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
          "internalType": "address",
          "name": "_coreVaultManager",
          "type": "address"
        }
      ],
      "name": "setCoreVaultManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_minimumAmountLeftBIPS",
          "type": "uint256"
        }
      ],
      "name": "setCoreVaultMinimumAmountLeftBIPS",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_minimumRedeemLots",
          "type": "uint256"
        }
      ],
      "name": "setCoreVaultMinimumRedeemLots",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_nativeAddress",
          "type": "address"
        }
      ],
      "name": "setCoreVaultNativeAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_redemptionFeeBIPS",
          "type": "uint256"
        }
      ],
      "name": "setCoreVaultRedemptionFeeBIPS",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_transferTimeExtensionSeconds",
          "type": "uint256"
        }
      ],
      "name": "setCoreVaultTransferTimeExtensionSeconds",
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
      "name": "setPoolExitCRChangeTimelockSeconds",
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
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "setRedemptionDefaultFactorVaultCollateralBIPS",
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
          "name": "_amountUBA",
          "type": "uint256"
        }
      ],
      "name": "transferToCoreVault",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transfersEmergencyPaused",
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
      "name": "transfersEmergencyPausedUntil",
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
      "name": "upgradeAgentVaultsAndPools",
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
      "inputs": [],
      "name": "AlreadyInitialized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AmountOfCollateralTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AmountOfNatTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CannotDestroyPoolWithIssuedTokens",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CollateralAfterExitTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CollateralRatioFallsBelowExitCR",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DepositResultsInZeroTokens",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FAssetAllowanceTooSmall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FreeFAssetBalanceTooSmall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRecipientAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyAgent",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyAssetManager",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyInternalUse",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PaymentLargerThanFeeDebt",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PoolTokenAlreadySet",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RedemptionRequiresClosingTooManyTickets",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SentAmountTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenBalanceTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenShareIsZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenSupplyAfterExitTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "WithdrawZeroFAsset",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroFAssetDebtPayment",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountNatWei",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "rewardType",
          "type": "uint8"
        }
      ],
      "name": "CPClaimedReward",
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
          "name": "timelockExpiresAt",
          "type": "uint256"
        }
      ],
      "name": "CPEntered",
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
        }
      ],
      "name": "CPExited",
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
          "internalType": "int256",
          "name": "newFeeDebtUBA",
          "type": "int256"
        }
      ],
      "name": "CPFeeDebtChanged",
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
          "name": "paidFeesUBA",
          "type": "uint256"
        }
      ],
      "name": "CPFeeDebtPaid",
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
          "name": "withdrawnFeesUBA",
          "type": "uint256"
        }
      ],
      "name": "CPFeesWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paidNatWei",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "burnedTokensWei",
          "type": "uint256"
        }
      ],
      "name": "CPPaidOut",
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
          "name": "closedFAssetsUBA",
          "type": "uint256"
        }
      ],
      "name": "CPSelfCloseExited",
      "type": "event"
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
          "name": "_claimedAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract IRewardManager",
          "name": "_rewardManager",
          "type": "address"
        },
        {
          "internalType": "uint24",
          "name": "_lastRewardEpoch",
          "type": "uint24"
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
                  "internalType": "uint24",
                  "name": "rewardEpochId",
                  "type": "uint24"
                },
                {
                  "internalType": "bytes20",
                  "name": "beneficiary",
                  "type": "bytes20"
                },
                {
                  "internalType": "uint120",
                  "name": "amount",
                  "type": "uint120"
                },
                {
                  "internalType": "enum RewardsV2Interface.ClaimType",
                  "name": "claimType",
                  "type": "uint8"
                }
              ],
              "internalType": "struct RewardsV2Interface.RewardClaim",
              "name": "body",
              "type": "tuple"
            }
          ],
          "internalType": "struct RewardsV2Interface.RewardClaimWithProof[]",
          "name": "_proofs",
          "type": "tuple[]"
        }
      ],
      "name": "claimDelegationRewards",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_claimedAmount",
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
      "inputs": [],
      "name": "enter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_receivedTokens",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_timelockExpiresAt",
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
        }
      ],
      "name": "exit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_natShare",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenShare",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "_recipient",
          "type": "address"
        }
      ],
      "name": "exitTo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_natShare",
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
      "name": "fAssetFeeDebtOf",
      "outputs": [
        {
          "internalType": "int256",
          "name": "",
          "type": "int256"
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
          "name": "_fassets",
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
          "name": "_receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amountWei",
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
          "name": "_tokenShare",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_redeemToCollateral",
          "type": "bool"
        },
        {
          "internalType": "address payable",
          "name": "_recipient",
          "type": "address"
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
      "name": "selfCloseExitTo",
      "outputs": [],
      "stateMutability": "payable",
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
          "internalType": "int256",
          "name": "",
          "type": "int256"
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
      "inputs": [
        {
          "internalType": "contract IWNat",
          "name": "newWNat",
          "type": "address"
        }
      ],
      "name": "upgradeWNatContract",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        }
      ],
      "name": "withdrawFeesTo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

export const CollateralPoolTokenAbi = [
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
          "name": "",
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

export const IIFAssetAbi = [
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
      "inputs": [],
      "name": "assetManager",
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
      "name": "assetName",
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
      "inputs": [],
      "name": "assetSymbol",
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
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_blockNumber",
          "type": "uint256"
        }
      ],
      "name": "balanceOfAt",
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
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cleanupBlockNumber",
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
      "name": "cleanupBlockNumberManager",
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
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
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
          "name": "_cleanerContract",
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
          "internalType": "uint256",
          "name": "_blockNumber",
          "type": "uint256"
        }
      ],
      "name": "setCleanupBlockNumber",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_cleanupBlockNumberManager",
          "type": "address"
        }
      ],
      "name": "setCleanupBlockNumberManager",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "uint256",
          "name": "_blockNumber",
          "type": "uint256"
        }
      ],
      "name": "totalSupplyAt",
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
    }
];

export const FAssetOFTAdapterAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_lzEndpoint",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountSD",
          "type": "uint256"
        }
      ],
      "name": "AmountSDOverflowed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidBps",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDelegate",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidEndpointCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidFeeOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidLocalDecimals",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "options",
          "type": "bytes"
        }
      ],
      "name": "InvalidOptions",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "LzTokenUnavailable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoFeesToWithdraw",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "eid",
          "type": "uint32"
        }
      ],
      "name": "NoPeer",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "msgValue",
          "type": "uint256"
        }
      ],
      "name": "NotEnoughNative",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "OnlyEndpoint",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "eid",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "sender",
          "type": "bytes32"
        }
      ],
      "name": "OnlyPeer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlySelf",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "result",
          "type": "bytes"
        }
      ],
      "name": "SimulationResult",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountLD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minAmountLD",
          "type": "uint256"
        }
      ],
      "name": "SlippageExceeded",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "feeBps",
          "type": "uint16"
        }
      ],
      "name": "DefaultFeeBpsSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "eid",
              "type": "uint32"
            },
            {
              "internalType": "uint16",
              "name": "msgType",
              "type": "uint16"
            },
            {
              "internalType": "bytes",
              "name": "options",
              "type": "bytes"
            }
          ],
          "indexed": false,
          "internalType": "struct EnforcedOptionParam[]",
          "name": "_enforcedOptions",
          "type": "tuple[]"
        }
      ],
      "name": "EnforcedOptionSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "dstEid",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "feeBps",
          "type": "uint16"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "FeeBpsSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountLD",
          "type": "uint256"
        }
      ],
      "name": "FeeWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "inspector",
          "type": "address"
        }
      ],
      "name": "MsgInspectorSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "guid",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "srcEid",
          "type": "uint32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "toAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountReceivedLD",
          "type": "uint256"
        }
      ],
      "name": "OFTReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "guid",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "dstEid",
          "type": "uint32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "fromAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountSentLD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountReceivedLD",
          "type": "uint256"
        }
      ],
      "name": "OFTSent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "eid",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "peer",
          "type": "bytes32"
        }
      ],
      "name": "PeerSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "preCrimeAddress",
          "type": "address"
        }
      ],
      "name": "PreCrimeSet",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "BPS_DENOMINATOR",
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
      "name": "SEND",
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
      "name": "SEND_AND_CALL",
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
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "srcEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "sender",
              "type": "bytes32"
            },
            {
              "internalType": "uint64",
              "name": "nonce",
              "type": "uint64"
            }
          ],
          "internalType": "struct Origin",
          "name": "origin",
          "type": "tuple"
        }
      ],
      "name": "allowInitializePath",
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
      "name": "approvalRequired",
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
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_eid",
          "type": "uint32"
        },
        {
          "internalType": "uint16",
          "name": "_msgType",
          "type": "uint16"
        },
        {
          "internalType": "bytes",
          "name": "_extraOptions",
          "type": "bytes"
        }
      ],
      "name": "combineOptions",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimalConversionRate",
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
      "name": "defaultFeeBps",
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
      "name": "endpoint",
      "outputs": [
        {
          "internalType": "contract ILayerZeroEndpointV2",
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
          "internalType": "uint32",
          "name": "_eid",
          "type": "uint32"
        },
        {
          "internalType": "uint16",
          "name": "_msgType",
          "type": "uint16"
        }
      ],
      "name": "enforcedOptions",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "feeBalance",
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
          "internalType": "uint32",
          "name": "_dstEid",
          "type": "uint32"
        }
      ],
      "name": "feeBps",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint16",
              "name": "feeBps",
              "type": "uint16"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct FeeConfig",
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
          "internalType": "uint32",
          "name": "_dstEid",
          "type": "uint32"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "getFee",
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
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "srcEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "sender",
              "type": "bytes32"
            },
            {
              "internalType": "uint64",
              "name": "nonce",
              "type": "uint64"
            }
          ],
          "internalType": "struct Origin",
          "name": "",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "_sender",
          "type": "address"
        }
      ],
      "name": "isComposeMsgSender",
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
          "internalType": "uint32",
          "name": "_eid",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "_peer",
          "type": "bytes32"
        }
      ],
      "name": "isPeer",
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
              "internalType": "uint32",
              "name": "srcEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "sender",
              "type": "bytes32"
            },
            {
              "internalType": "uint64",
              "name": "nonce",
              "type": "uint64"
            }
          ],
          "internalType": "struct Origin",
          "name": "_origin",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "_guid",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_message",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "_executor",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_extraData",
          "type": "bytes"
        }
      ],
      "name": "lzReceive",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "uint32",
                  "name": "srcEid",
                  "type": "uint32"
                },
                {
                  "internalType": "bytes32",
                  "name": "sender",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "nonce",
                  "type": "uint64"
                }
              ],
              "internalType": "struct Origin",
              "name": "origin",
              "type": "tuple"
            },
            {
              "internalType": "uint32",
              "name": "dstEid",
              "type": "uint32"
            },
            {
              "internalType": "address",
              "name": "receiver",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "guid",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "executor",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "message",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "extraData",
              "type": "bytes"
            }
          ],
          "internalType": "struct InboundPacket[]",
          "name": "_packets",
          "type": "tuple[]"
        }
      ],
      "name": "lzReceiveAndRevert",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "srcEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "sender",
              "type": "bytes32"
            },
            {
              "internalType": "uint64",
              "name": "nonce",
              "type": "uint64"
            }
          ],
          "internalType": "struct Origin",
          "name": "_origin",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "_guid",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_message",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "_executor",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_extraData",
          "type": "bytes"
        }
      ],
      "name": "lzReceiveSimulate",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "msgInspector",
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
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "nextNonce",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "nonce",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "oApp",
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
      "name": "oAppVersion",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "senderVersion",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "receiverVersion",
          "type": "uint64"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "oftVersion",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        },
        {
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
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
          "internalType": "uint32",
          "name": "_eid",
          "type": "uint32"
        }
      ],
      "name": "peers",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "preCrime",
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
          "components": [
            {
              "internalType": "uint32",
              "name": "dstEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "to",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "amountLD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minAmountLD",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "extraOptions",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "composeMsg",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "oftCmd",
              "type": "bytes"
            }
          ],
          "internalType": "struct SendParam",
          "name": "_sendParam",
          "type": "tuple"
        }
      ],
      "name": "quoteOFT",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "minAmountLD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxAmountLD",
              "type": "uint256"
            }
          ],
          "internalType": "struct OFTLimit",
          "name": "oftLimit",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "int256",
              "name": "feeAmountLD",
              "type": "int256"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            }
          ],
          "internalType": "struct OFTFeeDetail[]",
          "name": "oftFeeDetails",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amountSentLD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountReceivedLD",
              "type": "uint256"
            }
          ],
          "internalType": "struct OFTReceipt",
          "name": "oftReceipt",
          "type": "tuple"
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
              "internalType": "uint32",
              "name": "dstEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "to",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "amountLD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minAmountLD",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "extraOptions",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "composeMsg",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "oftCmd",
              "type": "bytes"
            }
          ],
          "internalType": "struct SendParam",
          "name": "_sendParam",
          "type": "tuple"
        },
        {
          "internalType": "bool",
          "name": "_payInLzToken",
          "type": "bool"
        }
      ],
      "name": "quoteSend",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "nativeFee",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lzTokenFee",
              "type": "uint256"
            }
          ],
          "internalType": "struct MessagingFee",
          "name": "msgFee",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "dstEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes32",
              "name": "to",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "amountLD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minAmountLD",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "extraOptions",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "composeMsg",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "oftCmd",
              "type": "bytes"
            }
          ],
          "internalType": "struct SendParam",
          "name": "_sendParam",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "nativeFee",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lzTokenFee",
              "type": "uint256"
            }
          ],
          "internalType": "struct MessagingFee",
          "name": "_fee",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "_refundAddress",
          "type": "address"
        }
      ],
      "name": "send",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "guid",
              "type": "bytes32"
            },
            {
              "internalType": "uint64",
              "name": "nonce",
              "type": "uint64"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "nativeFee",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "lzTokenFee",
                  "type": "uint256"
                }
              ],
              "internalType": "struct MessagingFee",
              "name": "fee",
              "type": "tuple"
            }
          ],
          "internalType": "struct MessagingReceipt",
          "name": "msgReceipt",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amountSentLD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountReceivedLD",
              "type": "uint256"
            }
          ],
          "internalType": "struct OFTReceipt",
          "name": "oftReceipt",
          "type": "tuple"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint16",
          "name": "_feeBps",
          "type": "uint16"
        }
      ],
      "name": "setDefaultFeeBps",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_delegate",
          "type": "address"
        }
      ],
      "name": "setDelegate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "eid",
              "type": "uint32"
            },
            {
              "internalType": "uint16",
              "name": "msgType",
              "type": "uint16"
            },
            {
              "internalType": "bytes",
              "name": "options",
              "type": "bytes"
            }
          ],
          "internalType": "struct EnforcedOptionParam[]",
          "name": "_enforcedOptions",
          "type": "tuple[]"
        }
      ],
      "name": "setEnforcedOptions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_dstEid",
          "type": "uint32"
        },
        {
          "internalType": "uint16",
          "name": "_feeBps",
          "type": "uint16"
        },
        {
          "internalType": "bool",
          "name": "_enabled",
          "type": "bool"
        }
      ],
      "name": "setFeeBps",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_msgInspector",
          "type": "address"
        }
      ],
      "name": "setMsgInspector",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_eid",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "_peer",
          "type": "bytes32"
        }
      ],
      "name": "setPeer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_preCrime",
          "type": "address"
        }
      ],
      "name": "setPreCrime",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sharedDecimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
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
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
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
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

export const OFTUpgradeableAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountSD",
        "type": "uint256"
      }
    ],
    "name": "AmountSDOverflowed",
    "type": "error"
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
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidDelegate",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidEndpointCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidInitialization",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidLocalDecimals",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "options",
        "type": "bytes"
      }
    ],
    "name": "InvalidOptions",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LzTokenUnavailable",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "eid",
        "type": "uint32"
      }
    ],
    "name": "NoPeer",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "msgValue",
        "type": "uint256"
      }
    ],
    "name": "NotEnoughNative",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotInitializing",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "OnlyEndpoint",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "eid",
        "type": "uint32"
      },
      {
        "internalType": "bytes32",
        "name": "sender",
        "type": "bytes32"
      }
    ],
    "name": "OnlyPeer",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlySelf",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "result",
        "type": "bytes"
      }
    ],
    "name": "SimulationResult",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountLD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minAmountLD",
        "type": "uint256"
      }
    ],
    "name": "SlippageExceeded",
    "type": "error"
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
        "components": [
          {
            "internalType": "uint32",
            "name": "eid",
            "type": "uint32"
          },
          {
            "internalType": "uint16",
            "name": "msgType",
            "type": "uint16"
          },
          {
            "internalType": "bytes",
            "name": "options",
            "type": "bytes"
          }
        ],
        "indexed": false,
        "internalType": "struct EnforcedOptionParam[]",
        "name": "_enforcedOptions",
        "type": "tuple[]"
      }
    ],
    "name": "EnforcedOptionSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "inspector",
        "type": "address"
      }
    ],
    "name": "MsgInspectorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guid",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "srcEid",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "toAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountReceivedLD",
        "type": "uint256"
      }
    ],
    "name": "OFTReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "guid",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "dstEid",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "fromAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountSentLD",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountReceivedLD",
        "type": "uint256"
      }
    ],
    "name": "OFTSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "eid",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "peer",
        "type": "bytes32"
      }
    ],
    "name": "PeerSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "preCrimeAddress",
        "type": "address"
      }
    ],
    "name": "PreCrimeSet",
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
    "inputs": [],
    "name": "SEND",
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
    "name": "SEND_AND_CALL",
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
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint32",
            "name": "srcEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "sender",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          }
        ],
        "internalType": "struct Origin",
        "name": "origin",
        "type": "tuple"
      }
    ],
    "name": "allowInitializePath",
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
    "inputs": [],
    "name": "approvalRequired",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
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
        "internalType": "uint32",
        "name": "_eid",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "_msgType",
        "type": "uint16"
      },
      {
        "internalType": "bytes",
        "name": "_extraOptions",
        "type": "bytes"
      }
    ],
    "name": "combineOptions",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimalConversionRate",
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
    "inputs": [],
    "name": "endpoint",
    "outputs": [
      {
        "internalType": "contract ILayerZeroEndpointV2",
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
        "internalType": "uint32",
        "name": "_eid",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "_msgType",
        "type": "uint16"
      }
    ],
    "name": "enforcedOptions",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
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
            "internalType": "uint32",
            "name": "srcEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "sender",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          }
        ],
        "internalType": "struct Origin",
        "name": "",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "_sender",
        "type": "address"
      }
    ],
    "name": "isComposeMsgSender",
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
        "internalType": "uint32",
        "name": "_eid",
        "type": "uint32"
      },
      {
        "internalType": "bytes32",
        "name": "_peer",
        "type": "bytes32"
      }
    ],
    "name": "isPeer",
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
            "internalType": "uint32",
            "name": "srcEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "sender",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          }
        ],
        "internalType": "struct Origin",
        "name": "_origin",
        "type": "tuple"
      },
      {
        "internalType": "bytes32",
        "name": "_guid",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_message",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "_executor",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "_extraData",
        "type": "bytes"
      }
    ],
    "name": "lzReceive",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "uint32",
                "name": "srcEid",
                "type": "uint32"
              },
              {
                "internalType": "bytes32",
                "name": "sender",
                "type": "bytes32"
              },
              {
                "internalType": "uint64",
                "name": "nonce",
                "type": "uint64"
              }
            ],
            "internalType": "struct Origin",
            "name": "origin",
            "type": "tuple"
          },
          {
            "internalType": "uint32",
            "name": "dstEid",
            "type": "uint32"
          },
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "guid",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "executor",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "message",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "extraData",
            "type": "bytes"
          }
        ],
        "internalType": "struct InboundPacket[]",
        "name": "_packets",
        "type": "tuple[]"
      }
    ],
    "name": "lzReceiveAndRevert",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint32",
            "name": "srcEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "sender",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          }
        ],
        "internalType": "struct Origin",
        "name": "_origin",
        "type": "tuple"
      },
      {
        "internalType": "bytes32",
        "name": "_guid",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_message",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "_executor",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "_extraData",
        "type": "bytes"
      }
    ],
    "name": "lzReceiveSimulate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "msgInspector",
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
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "nextNonce",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "nonce",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oApp",
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
    "name": "oAppVersion",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "senderVersion",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "receiverVersion",
        "type": "uint64"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oftVersion",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      },
      {
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
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
        "internalType": "uint32",
        "name": "_eid",
        "type": "uint32"
      }
    ],
    "name": "peers",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "preCrime",
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
        "components": [
          {
            "internalType": "uint32",
            "name": "dstEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "to",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amountLD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minAmountLD",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraOptions",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "composeMsg",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "oftCmd",
            "type": "bytes"
          }
        ],
        "internalType": "struct SendParam",
        "name": "_sendParam",
        "type": "tuple"
      }
    ],
    "name": "quoteOFT",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "minAmountLD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxAmountLD",
            "type": "uint256"
          }
        ],
        "internalType": "struct OFTLimit",
        "name": "oftLimit",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "int256",
            "name": "feeAmountLD",
            "type": "int256"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct OFTFeeDetail[]",
        "name": "oftFeeDetails",
        "type": "tuple[]"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "amountSentLD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountReceivedLD",
            "type": "uint256"
          }
        ],
        "internalType": "struct OFTReceipt",
        "name": "oftReceipt",
        "type": "tuple"
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
            "internalType": "uint32",
            "name": "dstEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "to",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amountLD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minAmountLD",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraOptions",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "composeMsg",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "oftCmd",
            "type": "bytes"
          }
        ],
        "internalType": "struct SendParam",
        "name": "_sendParam",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "_payInLzToken",
        "type": "bool"
      }
    ],
    "name": "quoteSend",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "nativeFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lzTokenFee",
            "type": "uint256"
          }
        ],
        "internalType": "struct MessagingFee",
        "name": "msgFee",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint32",
            "name": "dstEid",
            "type": "uint32"
          },
          {
            "internalType": "bytes32",
            "name": "to",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amountLD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minAmountLD",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraOptions",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "composeMsg",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "oftCmd",
            "type": "bytes"
          }
        ],
        "internalType": "struct SendParam",
        "name": "_sendParam",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "nativeFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lzTokenFee",
            "type": "uint256"
          }
        ],
        "internalType": "struct MessagingFee",
        "name": "_fee",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "_refundAddress",
        "type": "address"
      }
    ],
    "name": "send",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "guid",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "nativeFee",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "lzTokenFee",
                "type": "uint256"
              }
            ],
            "internalType": "struct MessagingFee",
            "name": "fee",
            "type": "tuple"
          }
        ],
        "internalType": "struct MessagingReceipt",
        "name": "msgReceipt",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "amountSentLD",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountReceivedLD",
            "type": "uint256"
          }
        ],
        "internalType": "struct OFTReceipt",
        "name": "oftReceipt",
        "type": "tuple"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_delegate",
        "type": "address"
      }
    ],
    "name": "setDelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint32",
            "name": "eid",
            "type": "uint32"
          },
          {
            "internalType": "uint16",
            "name": "msgType",
            "type": "uint16"
          },
          {
            "internalType": "bytes",
            "name": "options",
            "type": "bytes"
          }
        ],
        "internalType": "struct EnforcedOptionParam[]",
        "name": "_enforcedOptions",
        "type": "tuple[]"
      }
    ],
    "name": "setEnforcedOptions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_msgInspector",
        "type": "address"
      }
    ],
    "name": "setMsgInspector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_eid",
        "type": "uint32"
      },
      {
        "internalType": "bytes32",
        "name": "_peer",
        "type": "bytes32"
      }
    ],
    "name": "setPeer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_preCrime",
        "type": "address"
      }
    ],
    "name": "setPreCrime",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sharedDecimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
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
    "inputs": [],
    "name": "token",
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
        "name": "value",
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
        "name": "value",
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
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];