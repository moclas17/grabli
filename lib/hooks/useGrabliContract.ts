import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import {
  GRABLI_ABI,
  getGrabliAddress,
  CURRENT_GAME_ID,
  GameState,
  GameDetails,
  PlayerStats,
  LeaderboardEntry
} from '../contracts/grabli';

// Hook to get game count
export function useGameCount() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'gameCount',
    chainId: baseSepolia.id,
  });

  return {
    gameCount: (data as bigint) || BigInt(0),
    isLoading,
    isError,
    refetch,
  };
}

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

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  }
] as const;

// Hook to approve ERC20 tokens
export function useApproveERC20() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const approve = (tokenAddress: Address, spenderAddress: Address, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amount],
      chainId: baseSepolia.id,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to check ERC20 allowance
export function useERC20Allowance(tokenAddress?: Address, ownerAddress?: Address, spenderAddress?: Address) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress,
    },
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get all players who participated in a game
export function useGamePlayers(gameId: bigint) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getGamePlayers',
    args: [gameId],
    chainId: baseSepolia.id,
    query: {
      enabled: gameId !== BigInt(0),
    },
  });

  return {
    players: (data as Address[]) || [],
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get full leaderboard with claim counts
// This fetches the basic leaderboard and then enriches it with player stats
export function useFullLeaderboard(gameId: bigint = CURRENT_GAME_ID) {
  const { data: leaderboardData, isError: isErrorLeaderboard, isLoading: isLoadingLeaderboard } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getLeaderboard',
    args: [gameId],
    chainId: baseSepolia.id,
    query: {
      enabled: gameId !== BigInt(0),
    },
  });

  // Get the list of player addresses from leaderboard
  const playerAddresses = leaderboardData
    ? (leaderboardData as [Address[], bigint[]])[0]
    : [];

  // Create contract calls for each player's stats
  const contracts = playerAddresses.map((address) => ({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getPlayerStats' as const,
    args: [gameId, address] as const,
    chainId: baseSepolia.id,
  }));

  // Fetch all player stats in batch
  const { data: playerStatsData, isError: isErrorStats, isLoading: isLoadingStats } = useReadContracts({
    contracts,
    query: {
      enabled: playerAddresses.length > 0 && gameId !== BigInt(0),
    },
  });

  // Combine leaderboard data with player stats
  const leaderboard: LeaderboardEntry[] = [];

  if (leaderboardData && playerStatsData) {
    const [addresses, totalSeconds] = leaderboardData as [Address[], bigint[]];
    addresses.forEach((address, index) => {
      const statsResult = playerStatsData[index];
      const claimCount = statsResult?.status === 'success' && statsResult.result
        ? (statsResult.result as [bigint, bigint, bigint])[2] // claimCount is the 3rd element
        : BigInt(0);

      leaderboard.push({
        address,
        totalSeconds: totalSeconds[index],
        claimCount,
      });
    });
  }

  return {
    leaderboard,
    isLoading: isLoadingLeaderboard || isLoadingStats,
    isError: isErrorLeaderboard || isErrorStats,
  };
}
