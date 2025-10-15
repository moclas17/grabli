import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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
