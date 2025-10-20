"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Name, Avatar } from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { base } from "viem/chains";
import styles from "./page.module.css";
import {
  useActiveGames,
  useGameCount,
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
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Auto-detect active game
  const { activeGameId, hasActiveGame, isLoading: isLoadingActiveGames } = useActiveGames();
  const { gameCount } = useGameCount();

  // Use the detected active game ID, or if no active game, show the last created game
  const currentGameId = hasActiveGame && activeGameId !== null
    ? activeGameId
    : (gameCount > BigInt(0) ? gameCount - BigInt(1) : BigInt(0));

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

  // Auto-refresh game state every 10 seconds to update current holder's time
  useEffect(() => {
    if (!hasActiveGame || !gameState) return;

    const refreshInterval = setInterval(() => {
      refetchState();
      refetchLeaderboard();
    }, 10000); // Refresh every 10 seconds

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

  // Component to display player name with Basename support
  const PlayerName = ({ address }: { address: string }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <Avatar
        address={address as `0x${string}`}
        chain={base}
        className={styles.playerAvatar}
      />
      <Name
        address={address as `0x${string}`}
        chain={base}
      />
    </div>
  );

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

  const handleRefresh = () => {
    refetchState();
    refetchLeaderboard();
    if (userAddress) {
      refetchPlayerStats();
    }
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleRefresh}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: '#1a1a1a',
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1a1a1a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Refresh"
            >
              🔄
            </button>
            <Wallet />
          </div>
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleRefresh}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: '#1a1a1a',
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1a1a1a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Refresh"
            >
              🔄
            </button>
            <Wallet />
          </div>
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
  const hasHolder = gameState.holder && gameState.holder !== '0x0000000000000000000000000000000000000000';

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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowHowToPlay(true)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              border: 'none',
              background: 'oklch(27.9% .041 260.031)',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'oklch(37.9% .041 260.031)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'oklch(27.9% .041 260.031)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="How to Play"
          >
            ?
          </button>
          <button
            onClick={handleRefresh}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              border: 'none',
              background: 'oklch(27.9% .041 260.031)',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'oklch(37.9% .041 260.031)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'oklch(27.9% .041 260.031)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Refresh"
          >
            🔄
          </button>
          <Wallet />
        </div>
      </header>

      <div className={styles.content}>
        {/* Game Ended - Show Winner Banner (when game is finished) */}
        {gameState.finished && gameState.winner && gameState.winner !== '0x0000000000000000000000000000000000000000' && (
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
          }}>
            {/* Game ID Badge - Top Left */}
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              padding: '0.25rem 0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '0.65rem',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Game #{currentGameId.toString()}
            </div>

            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', marginTop: '0.5rem' }}>🎉🏆🎉</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#FFD700' }}>
              WINNER!
            </div>
            <div style={{
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.3)',
              padding: '0.5rem',
              borderRadius: '8px',
              wordBreak: 'break-all',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {gameState.winner}
            </div>
            {userAddress?.toLowerCase() === gameState.winner.toLowerCase() && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,215,0,0.2)', borderRadius: '8px', border: '2px solid #FFD700' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎊 Congratulations! 🎊</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  Prize: {gameDetails.prizeAmount ? (Number(gameDetails.prizeAmount) / 1e18).toLocaleString() : '0'} {gameDetails.prizeCurrency || 'USD'}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  Contact the sponsor to claim your prize
                </div>
              </div>
            )}
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.8, wordBreak: 'break-word' }}>
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
            {gameDetails.prizeAmount ? (Number(gameDetails.prizeAmount) / 1e18).toLocaleString() : '0'} {gameDetails.prizeCurrency || 'USD'}
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
          <div className={styles.holderAddress}>
            {hasHolder ? (
              <PlayerName address={gameState.holder} />
            ) : (
              'No one yet'
            )}
          </div>
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
        {userAddress && chainId !== base.id && (
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
              onClick={() => switchChain({ chainId: base.id })}
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
              Switch to Base Mainnet
            </button>
          </div>
        )}

        {/* Claim Button */}
        <button
          className={styles.claimButton}
          onClick={handleClaim}
          disabled={!isGameActive || isPending || isConfirming || !userAddress || chainId !== base.id || isCurrentHolder}
        >
          {!userAddress
            ? '🔗 Connect Wallet First'
            : chainId !== base.id
            ? '⚠️ Wrong Network'
            : isCurrentHolder
            ? '👑 You are the Current Holder!'
            : isPending || isConfirming
            ? '⏳ Processing...'
            : isSuccess && isCurrentHolder
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
                      <PlayerName address={player.address} />
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

        {/* Statistics Button */}
        <Link
          href="/stats"
          style={{
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: '3px solid #00d4ff',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            transition: 'all 0.2s',
            display: 'block',
            boxShadow: '0 4px 0 #0088aa, 0 4px 8px rgba(0, 212, 255, 0.3)',
          }}
        >
          📊 View Game Statistics
        </Link>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '2px solid #00d4ff',
              boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHowToPlay(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1.5rem',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#00d4ff', textAlign: 'center' }}>
              🎮 How to Play
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#00ff00' }}>🇪🇸 Cómo se juega</h3>
              <p style={{ lineHeight: '1.8', opacity: 0.9, marginBottom: '1rem' }}>
                En Grabli, hay un premio en juego por tiempo limitado.
                Cualquier jugador puede reclamarlo con un clic, y mientras lo tenga, va acumulando segundos.
              </p>
              <p style={{ lineHeight: '1.8', opacity: 0.9, marginBottom: '1rem' }}>
                Pero cuidado — otro jugador puede reclamarlo en cualquier momento y quitarte el control.
                El contador se detiene para ti y empieza a correr para el nuevo dueño.
              </p>
              <p style={{ lineHeight: '1.8', opacity: 0.9 }}>
                Cuando el tiempo total del juego termina, gana quien haya mantenido el premio más tiempo en total.
              </p>
              <p style={{ lineHeight: '1.8', opacity: 0.9, marginTop: '1rem', fontStyle: 'italic', color: '#00d4ff' }}>
                Es un juego de reflejos, estrategia y oportunidad, donde cada segundo cuenta ⏳
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#00ff00' }}>🇬🇧 How to Play</h3>
              <p style={{ lineHeight: '1.8', opacity: 0.9, marginBottom: '1rem' }}>
                In Grabli, a prize is live for a limited time.
                Any player can claim it with a tap, and while they hold it, they accumulate seconds.
              </p>
              <p style={{ lineHeight: '1.8', opacity: 0.9, marginBottom: '1rem' }}>
                But watch out — another player can claim it at any moment and take it away.
                Your timer stops, theirs starts ticking.
              </p>
              <p style={{ lineHeight: '1.8', opacity: 0.9 }}>
                When the total game time ends, the winner is the one who held the prize the longest.
              </p>
              <p style={{ lineHeight: '1.8', opacity: 0.9, marginTop: '1rem', fontStyle: 'italic', color: '#00d4ff' }}>
                It&apos;s a game of timing, speed, and strategy — where every second counts ⏳
              </p>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              style={{
                marginTop: '2rem',
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Got it! 🎯
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
