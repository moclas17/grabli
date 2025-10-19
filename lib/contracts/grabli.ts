import { Address, Abi } from 'viem';
import GrabliArtifact from './GrabliABI.json';

export const GRABLI_ABI = GrabliArtifact.abi as Abi;

export type GrabliContractAddress = Address;

// Contract addresses by chain ID
export const GRABLI_ADDRESSES: Record<number, GrabliContractAddress> = {
  // Base Mainnet
  8453: (process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS || '0x0') as Address,
};

export interface GameState {
  prizeTitle: string;
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
  prizeCurrency: string;
  prizeDescription: string;
  sponsorName: string;
  sponsorUrl: string;
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
  claimCount?: bigint; // Optional - populated when fetching full stats
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

// Current game ID default (use useActiveGames() to get actual active game)
export const CURRENT_GAME_ID = BigInt(0);
