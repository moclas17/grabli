"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { baseSepolia } from "viem/chains";
import styles from "./page.module.css";
import {
  useActiveGames,
  useGameState,
  useGameDetails,
  useLeaderboard,
  useClaim,
  usePlayerStats,
} from "../lib/hooks/useGrabliContract";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Auto-detect active game
  const { activeGameId, hasActiveGame, isLoading: isLoadingActiveGames } = useActiveGames();

  // Use the detected active game ID directly
  const currentGameId = activeGameId !== null ? activeGameId : BigInt(0);

  // Fetch game data from contract using detected active game
  const { gameState, isLoading: isLoadingState, refetch: refetchState } = useGameState(currentGameId);
  const { gameDetails, isLoading: isLoadingDetails } = useGameDetails(currentGameId);
  const { leaderboard, isLoading: isLoadingLeaderboard, refetch: refetchLeaderboard } = useLeaderboard(currentGameId);
  const { playerStats, refetch: refetchPlayerStats } = usePlayerStats(userAddress, currentGameId);
  const { claim, isPending, isConfirming, isSuccess, error } = useClaim();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // Update countdown timer
  useEffect(() => {
    if (!gameState) return;

    const updateTimer = () => {
      const endTime = Number(gameState.endAt) * 1000;
      const remaining = Math.max(0, endTime - Date.now());
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Auto-refresh game state every 2 seconds to update current holder's time
  useEffect(() => {
    if (!hasActiveGame || !gameState) return;

    const refreshInterval = setInterval(() => {
      refetchState();
      refetchLeaderboard();
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(refreshInterval);
  }, [hasActiveGame, gameState, refetchState, refetchLeaderboard]);

  // Refresh data after successful claim
  useEffect(() => {
    if (isSuccess) {
      // Refresh immediately after successful claim
      setTimeout(() => {
        refetchState();
        refetchLeaderboard();
        refetchPlayerStats();
      }, 2000);
    }
  }, [isSuccess, refetchState, refetchLeaderboard, refetchPlayerStats]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatSeconds = (seconds: bigint) => {
    const total = Number(seconds);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const shortenAddress = (address?: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleClaim = () => {
    if (!userAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!hasActiveGame) {
      alert("No active game found!");
      return;
    }
    claim(currentGameId);
  };

  // Loading state
  // If we're still detecting active games, show loading
  // OR if we have an active game but still loading its data, show loading
  const isStillLoading = isLoadingActiveGames || (hasActiveGame && (isLoadingState || isLoadingDetails));

  if (isStillLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <div className={styles.logoSection}>
            <Image
              src="/logo2.png"
              alt="Grabli"
              width={120}
              height={40}
              className={styles.logo}
              priority
            />
          </div>
          <Wallet />
        </header>
        <div className={styles.content}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {isLoadingActiveGames ? 'Detecting active game...' : 'Loading game data...'}
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log the data to console (comment out in production)
  // console.log('Main page data:', {
  //   hasActiveGame,
  //   activeGameId: activeGameId?.toString(),
  //   currentGameId: currentGameId.toString(),
  //   gameState,
  //   gameDetails,
  // });

  // No game data or empty data
  if (!gameState || !gameDetails || !gameDetails.prizeTitle) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <div className={styles.logoSection}>
            <Image
              src="/logo2.png"
              alt="Grabli"
              width={120}
              height={40}
              className={styles.logo}
              priority
            />
          </div>
          <Wallet />
        </header>
        <div className={styles.content}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>⚠️ No Active Game</h2>
            <p style={{ marginBottom: '1rem' }}>
              {hasActiveGame
                ? `Game ID ${currentGameId.toString()} has no data yet.`
                : 'No active game found.'}
            </p>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              {hasActiveGame
                ? 'The game data is loading or unavailable. Please try again.'
                : 'Please wait for the owner to create a new game, or create one from the admin panel.'}
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.875rem'
            }}>
              <strong>Debug Info:</strong>
              <br />
              Active Game ID: {hasActiveGame ? currentGameId.toString() : 'None'}
              <br />
              Has gameState: {gameState ? 'Yes' : 'No'}
              <br />
              Has gameDetails: {gameDetails ? 'Yes' : 'No'}
              <br />
              Prize Title: {gameDetails?.prizeTitle || 'N/A'}
              <br />
              Contract: {userAddress ? 'Connected' : 'Not connected'}
              <br />
              Chain: {chainId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGameActive = gameState.endAt && !gameState.finished && Date.now() < Number(gameState.endAt) * 1000;
  const currentHolder = gameState.holder && gameState.holder !== '0x0000000000000000000000000000000000000000'
    ? shortenAddress(gameState.holder)
    : 'No one yet';

  // Check if current user is the holder
  const isCurrentHolder = userAddress && gameState.holder &&
    userAddress.toLowerCase() === gameState.holder.toLowerCase();


  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div className={styles.logoSection}>
          <Image
            src="/logo2.png"
            alt="Grabli"
            width={120}
            height={40}
            className={styles.logo}
            priority
          />
        </div>
        <Wallet />
      </header>

      <div className={styles.content}>
        {/* Game Ended - Show Winner Banner (when game is finished) */}
        {gameState.finished && gameState.winner && gameState.winner !== '0x0000000000000000000000000000000000000000' && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉🏆🎉</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#FFD700' }}>
              WINNER!
            </div>
            <div style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', display: 'inline-block' }}>
              {gameState.winner}
            </div>
            {userAddress?.toLowerCase() === gameState.winner.toLowerCase() && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,215,0,0.2)', borderRadius: '8px', border: '2px solid #FFD700' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎊 Congratulations! You Won! 🎊</div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  Prize: ${gameDetails.prizeValue?.toString() || '0'} {gameDetails.prizeCurrency || 'USD'}
                </div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  Contact the sponsor to claim your prize
                </div>
              </div>
            )}
            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
              Game ended at {gameState.endAt ? new Date(Number(gameState.endAt) * 1000).toLocaleString() : 'N/A'}
            </div>
          </div>
        )}

        {/* Prize Display with Sponsor Ribbon */}
        <div className={styles.prizeSection}>
          {/* Sponsor Ribbon */}
          <a
            href={gameDetails.sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sponsorRibbon}
            data-text={gameDetails.sponsorName}
          />

          <div className={styles.prizeIcon}>🏆</div>
          <h1 className={styles.prizeTitle}>{gameDetails.prizeTitle || 'Prize'}</h1>
          <div className={styles.prizeValue}>
            ${gameDetails.prizeValue?.toString() || '0'} {gameDetails.prizeCurrency || 'USD'}
          </div>
          <p className={styles.prizeDescription}>
            {gameDetails.prizeDescription || 'Winner takes all!'}
          </p>
          {/* Game ID Badge */}
          <div style={{
            marginTop: '0.5rem',
            padding: '0.25rem 0.75rem',
            background: 'rgba(100, 200, 100, 0.2)',
            border: '1px solid rgba(100, 200, 100, 0.5)',
            borderRadius: '12px',
            fontSize: '0.75rem',
            display: 'inline-block'
          }}>
            Game #{currentGameId.toString()}
          </div>
        </div>

        {/* Timer */}
        <div className={styles.timerSection}>
          <div className={styles.timerLabel}>
            {gameState.finished ? 'Game Ended' : 'Time Remaining'}
          </div>
          <div className={styles.timerValue}>
            {gameState.finished ? 'Finished' : formatTime(timeRemaining)}
          </div>
        </div>

        {/* Current Holder */}
        <div className={styles.holderSection}>
          <div className={styles.holderLabel}>Current Holder</div>
          <div className={styles.holderAddress}>{currentHolder}</div>
        </div>

        {/* Your Stats */}
        {userAddress && playerStats && Number(playerStats.totalSeconds) > 0 && (
          <div className={styles.holderSection}>
            <div className={styles.holderLabel}>Your Total Time</div>
            <div className={styles.holderAddress}>
              {formatSeconds(playerStats.totalSeconds)}
            </div>
          </div>
        )}

        {/* Wrong Network Warning */}
        {userAddress && chainId !== baseSepolia.id && (
          <div style={{
            background: '#f59e0b',
            padding: '1rem',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ⚠️ Wrong Network! You&apos;re on chain {chainId}
            </div>
            <button
              onClick={() => switchChain({ chainId: baseSepolia.id })}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#f59e0b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Switch to Base Sepolia
            </button>
          </div>
        )}

        {/* Claim Button */}
        <button
          className={styles.claimButton}
          onClick={handleClaim}
          disabled={!isGameActive || isPending || isConfirming || !userAddress || chainId !== baseSepolia.id || isCurrentHolder}
        >
          {!userAddress
            ? '🔗 Connect Wallet First'
            : chainId !== baseSepolia.id
            ? '⚠️ Wrong Network'
            : isCurrentHolder
            ? '👑 You are the Current Holder!'
            : isPending || isConfirming
            ? '⏳ Processing...'
            : isSuccess
            ? '✅ Claimed!'
            : '🎯 GRAB IT NOW!'}
        </button>

        {error && (
          <div style={{
            color: 'red',
            textAlign: 'center',
            padding: '0.5rem',
            fontSize: '0.875rem'
          }}>
            Error: {error.message}
          </div>
        )}

        {/* Leaderboard */}
        <div className={styles.leaderboard}>
          <h2 className={styles.leaderboardTitle}>🏅 Top Players</h2>
          <div className={styles.leaderboardList}>
            {isLoadingLeaderboard ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                No players yet. Be the first to grab!
              </div>
            ) : (
              leaderboard.slice(0, 10).map((player, index) => {
                // Check if this player is the current holder
                const isHolder = gameState.holder &&
                  gameState.holder.toLowerCase() === player.address.toLowerCase();

                // The leaderboard already includes live time from the contract
                // so we just display it as-is
                const displaySeconds = player.totalSeconds;

                return (
                  <div key={player.address} className={styles.leaderboardItem}>
                    <span className={styles.rank}>#{index + 1}</span>
                    <span className={styles.playerAddress}>
                      {shortenAddress(player.address)}
                      {userAddress?.toLowerCase() === player.address.toLowerCase() && ' (You)'}
                      {isHolder && ' 👑'}
                    </span>
                    <span className={styles.playerScore}>
                      {formatSeconds(displaySeconds)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
