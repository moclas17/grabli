import { Address, Abi } from 'viem';
import GrabliArtifact from './GrabliABI.json';

export const GRABLI_ABI = GrabliArtifact.abi as Abi;

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
