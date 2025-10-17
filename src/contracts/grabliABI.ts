// ABI exported directly as TypeScript to avoid JSON import issues
export const GRABLI_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "GameClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PrizeClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "prizeTitle",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prizeValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "prizeCurrency",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "prizeDescription",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "prizeToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prizeAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "sponsorName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "sponsorUrl",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "sponsorLogo",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "claimCooldown",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sponsor",
        "type": "address"
      }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PrizeGrabbed",
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
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "closeGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "prizeTitle",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "prizeValue",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "prizeCurrency",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "prizeDescription",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "prizeToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "prizeAmount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "sponsorName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "sponsorUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "sponsorLogo",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimCooldown",
        "type": "uint256"
      }
    ],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "forceCloseGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "fundGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveGames",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getGameDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "prizeTitle",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "prizeValue",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "prizeCurrency",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "prizeDescription",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "sponsorName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "sponsorUrl",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "sponsorLogo",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "startAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "finished",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "prizeToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "prizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "sponsor",
            "type": "address"
          }
        ],
        "internalType": "struct Grabli.GameDetails",
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
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getGameState",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "prizeTitle",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "prizeValue",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "prizeCurrency",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "sponsorName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "startAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endAt",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "currentHolderSeconds",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "finished",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "prizeToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "prizeAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Grabli.GameState",
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
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getLeaderboard",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerStats",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalSeconds",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastClaimTs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Grabli.PlayerStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
