import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { baseSepolia } from 'viem/chains';

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

export type GrabliContractAddress = Address;

// Contract addresses by chain ID
export const GRABLI_ADDRESSES: Record<number, GrabliContractAddress> = {
  // Base Sepolia (testnet)
  84532: (process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA || '0x0') as Address,
  // Base Mainnet
  8453: (process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS || '0x0') as Address,
  // Local hardhat
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
};

export interface GameState {
  prizeTitle: string;
  prizeValue: bigint;
  prizeCurrency: string;
  sponsorName: string;
  startAt: bigint;
  endAt: bigint;
  holder: Address;
  currentHolderSeconds: bigint;
  finished: boolean;
  winner: Address;
  prizeToken: Address;
  prizeAmount: bigint;
}

export interface GameDetails {
  prizeTitle: string;
  prizeValue: bigint;
  prizeCurrency: string;
  prizeDescription: string;
  sponsorName: string;
  sponsorUrl: string;
  sponsorLogo: string;
  startAt: bigint;
  endAt: bigint;
  finished: boolean;
  prizeToken: Address;
  prizeAmount: bigint;
  sponsor: Address;
}

export interface PlayerStats {
  totalSeconds: bigint;
  lastClaimTs: bigint;
  claimCount: bigint;
}

export interface LeaderboardEntry {
  address: Address;
  totalSeconds: bigint;
}

// Get contract address for current chain
export function getGrabliAddress(chainId: number): GrabliContractAddress {
  const address = GRABLI_ADDRESSES[chainId];
  if (!address || address === '0x0') {
    // Return zero address instead of throwing to allow SSR
    return '0x0000000000000000000000000000000000000000' as Address;
  }
  return address;
}

// Current game ID (should be loaded from env or contract)
export const CURRENT_GAME_ID = BigInt(
  process.env.NEXT_PUBLIC_CURRENT_GAME_ID || '0'
);

// Hook to get active games
export function useActiveGames() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getActiveGames',
    chainId: baseSepolia.id,
  });

  const activeGames = (data as bigint[]) || [];
  const activeGameId = activeGames.length > 0 ? activeGames[0] : null;
  const hasActiveGame = activeGames.length > 0;

  return {
    activeGames,
    activeGameId,
    hasActiveGame,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get game state
export function useGameState(gameId: bigint = CURRENT_GAME_ID) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getGameState',
    args: [gameId],
    chainId: baseSepolia.id,
    query: {
      enabled: gameId !== BigInt(0), // Only query if we have a valid game ID
    },
  });

  // Convert Solidity array/tuple to object with named properties
  let gameState: GameState | undefined = undefined;
  if (data && Array.isArray(data)) {
    gameState = {
      prizeTitle: data[0] as string,
      prizeValue: data[1] as bigint,
      prizeCurrency: data[2] as string,
      sponsorName: data[3] as string,
      startAt: data[4] as bigint,
      endAt: data[5] as bigint,
      holder: data[6] as Address,
      currentHolderSeconds: data[7] as bigint,
      finished: data[8] as boolean,
      winner: data[9] as Address,
      prizeToken: data[10] as Address,
      prizeAmount: data[11] as bigint,
    };
  } else if (data) {
    // If it's already an object, use it as is
    gameState = data as GameState;
  }

  return {
    gameState,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get game details (includes sponsor info)
export function useGameDetails(gameId: bigint = CURRENT_GAME_ID) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getGameDetails',
    args: [gameId],
    chainId: baseSepolia.id,
    query: {
      enabled: gameId !== BigInt(0), // Only query if we have a valid game ID
    },
  });

  // Convert Solidity array/tuple to object with named properties
  let gameDetails: GameDetails | undefined = undefined;
  if (data && Array.isArray(data)) {
    gameDetails = {
      prizeTitle: data[0] as string,
      prizeValue: data[1] as bigint,
      prizeCurrency: data[2] as string,
      prizeDescription: data[3] as string,
      sponsorName: data[4] as string,
      sponsorUrl: data[5] as string,
      sponsorLogo: data[6] as string,
      startAt: data[7] as bigint,
      endAt: data[8] as bigint,
      finished: data[9] as boolean,
      prizeToken: data[10] as Address,
      prizeAmount: data[11] as bigint,
      sponsor: data[12] as Address,
    };
  } else if (data) {
    // If it's already an object, use it as is
    gameDetails = data as GameDetails;
  }

  return {
    gameDetails,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get player stats
export function usePlayerStats(playerAddress?: Address, gameId: bigint = CURRENT_GAME_ID) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getPlayerStats',
    args: playerAddress ? [gameId, playerAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!playerAddress,
    },
  });

  return {
    playerStats: data as PlayerStats | undefined,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get leaderboard
export function useLeaderboard(gameId: bigint = CURRENT_GAME_ID) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getLeaderboard',
    args: [gameId],
    chainId: baseSepolia.id,
  });

  // Transform data into leaderboard entries
  const leaderboard: LeaderboardEntry[] = data
    ? (data as [Address[], bigint[]])[0].map((address, index) => ({
        address,
        totalSeconds: (data as [Address[], bigint[]])[1][index],
      }))
    : [];

  // Sort by total seconds descending
  leaderboard.sort((a, b) => Number(b.totalSeconds - a.totalSeconds));

  return {
    leaderboard,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to claim prize
export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const claim = (gameId: bigint = CURRENT_GAME_ID) => {
    writeContract({
      address: getGrabliAddress(baseSepolia.id),
      abi: GRABLI_ABI,
      functionName: 'claim',
      args: [gameId],
      chainId: baseSepolia.id,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claim,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to close game (admin/anyone after game ends)
export function useCloseGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const closeGame = (gameId: bigint = CURRENT_GAME_ID) => {
    writeContract({
      address: getGrabliAddress(baseSepolia.id),
      abi: GRABLI_ABI,
      functionName: 'closeGame',
      args: [gameId],
      chainId: baseSepolia.id,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    closeGame,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to create a new game (admin only)
export function useCreateGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createGame = (params: {
    prizeTitle: string;
    prizeValue: bigint;
    prizeCurrency: string;
    prizeDescription: string;
    prizeToken: Address;
    prizeAmount: bigint;
    sponsorName: string;
    sponsorUrl: string;
    sponsorLogo: string;
    duration: bigint;
    claimCooldown: bigint;
  }) => {
    writeContract({
      address: getGrabliAddress(baseSepolia.id),
      abi: GRABLI_ABI,
      functionName: 'createGame',
      args: [
        params.prizeTitle,
        params.prizeValue,
        params.prizeCurrency,
        params.prizeDescription,
        params.prizeToken,
        params.prizeAmount,
        params.sponsorName,
        params.sponsorUrl,
        params.sponsorLogo,
        params.duration,
        params.claimCooldown,
      ],
      chainId: baseSepolia.id,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createGame,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to fund a game with ERC20 tokens (sponsor only)
export function useFundGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const fundGame = (gameId: bigint = CURRENT_GAME_ID) => {
    writeContract({
      address: getGrabliAddress(baseSepolia.id),
      abi: GRABLI_ABI,
      functionName: 'fundGame',
      args: [gameId],
      chainId: baseSepolia.id,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    fundGame,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to force close a game before it ends (admin only)
export function useForceCloseGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const forceCloseGame = (gameId: bigint = CURRENT_GAME_ID) => {
    writeContract({
      address: getGrabliAddress(baseSepolia.id),
      abi: GRABLI_ABI,
      functionName: 'forceCloseGame',
      args: [gameId],
      chainId: baseSepolia.id,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    forceCloseGame,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
