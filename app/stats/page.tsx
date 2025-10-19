"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  useActiveGames,
  useGameCount,
  useGameState,
  useGameDetails,
  useGamePlayers,
  useLeaderboard,
} from "../../lib/hooks/useGrabliContract";
import styles from "../page.module.css";

export default function StatsPage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // Auto-detect active game
  const { activeGameId, hasActiveGame } = useActiveGames();
  const { gameCount } = useGameCount();

  // Use the detected active game ID, or if no active game, show the last created game
  const currentGameId = hasActiveGame && activeGameId !== null
    ? activeGameId
    : (gameCount > BigInt(0) ? gameCount - BigInt(1) : BigInt(0));

  // Fetch game data
  const { gameState, isLoading: isLoadingState } = useGameState(currentGameId);
  const { gameDetails, isLoading: isLoadingDetails } = useGameDetails(currentGameId);
  const { players, isLoading: isLoadingPlayers } = useGamePlayers(currentGameId);
  const { leaderboard, isLoading: isLoadingLeaderboard } = useLeaderboard(currentGameId);

  // Calculate statistics from leaderboard
  const totalClaims = leaderboard.reduce((sum, player) => sum + Number(player.claimCount), 0);
  const totalPlayTime = leaderboard.reduce((sum, player) => sum + Number(player.totalSeconds), 0);

  // Most active player (most claims)
  const mostActivePlayer = leaderboard.length > 0
    ? leaderboard.reduce((max, player) =>
        player.claimCount > max.claimCount ? player : max
      )
    : null;

  // Longest holder (most seconds)
  const longestHolder = leaderboard.length > 0
    ? leaderboard.reduce((max, player) =>
        player.totalSeconds > max.totalSeconds ? player : max
      )
    : null;

  const formatSeconds = (seconds: bigint) => {
    const total = Number(seconds);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isLoading = isLoadingState || isLoadingDetails || isLoadingPlayers || isLoadingLeaderboard;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <div className={styles.logoSection}>
            <Link href="/">
              <Image
                src="/logo2.png"
                alt="Grabli"
                width={120}
                height={40}
                className={styles.logo}
                priority
              />
            </Link>
          </div>
          <Wallet />
        </header>
        <div className={styles.content}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading statistics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div className={styles.logoSection}>
          <Link href="/">
            <Image
              src="/logo2.png"
              alt="Grabli"
              width={120}
              height={40}
              className={styles.logo}
              priority
            />
          </Link>
        </div>
        <Wallet />
      </header>

      <div className={styles.content}>
        {/* Page Title */}
        <div style={{
          width: '100%',
          textAlign: 'center',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          marginBottom: '1rem',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 0 #aa00aa, 4px 4px 0 rgba(0, 0, 0, 0.8)',
            marginBottom: '0.5rem',
          }}>
            📊 Game Statistics
          </h1>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Game #{currentGameId.toString()} - {gameDetails?.prizeTitle || 'N/A'}
          </div>
        </div>

        {/* Overview Stats */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          {/* Total Players */}
          <div style={{
            padding: '1.5rem',
            background: '#1a1a2e',
            border: '3px solid #00d4ff',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {players.length}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Players
            </div>
          </div>

          {/* Total Claims */}
          <div style={{
            padding: '1.5rem',
            background: '#1a1a2e',
            border: '3px solid #ff00ff',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ff00ff' }}>
              {totalClaims}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Transactions
            </div>
          </div>

          {/* Game Status */}
          <div style={{
            padding: '1.5rem',
            background: '#1a1a2e',
            border: '3px solid #ffd700',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {gameState?.finished ? '🏁' : '🎮'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffd700' }}>
              {gameState?.finished ? 'Finished' : 'Active'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
              Game Status
            </div>
          </div>

          {/* Prize Value */}
          <div style={{
            padding: '1.5rem',
            background: '#1a1a2e',
            border: '3px solid #00ff00',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00ff00' }}>
              ${gameDetails?.prizeValue?.toString() || '0'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
              Prize Value
            </div>
          </div>
        </div>

        {/* Most Active Player */}
        {mostActivePlayer && mostActivePlayer.claimCount > BigInt(0) && (
          <div style={{
            width: '100%',
            padding: '1.5rem',
            background: '#16213e',
            border: '4px solid #ff00ff',
            borderRadius: '16px',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#ff00ff',
              textTransform: 'uppercase',
            }}>
              ⚡ Most Active Player
            </h2>
            <div style={{
              padding: '1rem',
              background: '#0f0f1e',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1rem',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#c0c0c0',
              }}>
                {shortenAddress(mostActivePlayer.address)}
              </div>
              <div style={{
                fontWeight: 'bold',
                color: '#ff00ff',
                fontSize: '1.25rem',
              }}>
                {mostActivePlayer.claimCount.toString()} claims
              </div>
            </div>
          </div>
        )}

        {/* Longest Holder */}
        {longestHolder && longestHolder.totalSeconds > BigInt(0) && (
          <div style={{
            width: '100%',
            padding: '1.5rem',
            background: '#16213e',
            border: '4px solid #ffd700',
            borderRadius: '16px',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#ffd700',
              textTransform: 'uppercase',
            }}>
              👑 Longest Holder
            </h2>
            <div style={{
              padding: '1rem',
              background: '#0f0f1e',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1rem',
              alignItems: 'center',
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#c0c0c0',
              }}>
                {shortenAddress(longestHolder.address)}
              </div>
              <div style={{
                fontWeight: 'bold',
                color: '#ffd700',
                fontSize: '1.25rem',
              }}>
                {formatSeconds(longestHolder.totalSeconds)}
              </div>
            </div>
          </div>
        )}

        {/* Player List with Stats */}
        {leaderboard.length > 0 && (
          <div style={{
            width: '100%',
            padding: '1.5rem',
            background: '#16213e',
            border: '4px solid #00d4ff',
            borderRadius: '16px',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#00d4ff',
              textTransform: 'uppercase',
            }}>
              👥 Player Statistics ({leaderboard.length})
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              {leaderboard
                .sort((a, b) => Number(b.claimCount) - Number(a.claimCount))
                .map((player, index) => (
                  <div
                    key={player.address}
                    style={{
                      padding: '0.75rem',
                      background: '#0f0f1e',
                      border: '2px solid #1a1a2e',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: '2rem 1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{
                      fontWeight: 'bold',
                      color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#888',
                    }}>
                      #{index + 1}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#c0c0c0',
                        marginBottom: '0.25rem',
                      }}>
                        {shortenAddress(player.address)}
                      </div>
                      <div style={{
                        fontSize: '0.65rem',
                        color: '#888',
                      }}>
                        Time: {formatSeconds(player.totalSeconds)}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#00ff00',
                      fontSize: '0.875rem',
                      textAlign: 'right',
                    }}>
                      {player.claimCount.toString()} TX
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/"
          style={{
            width: '100%',
            padding: '1rem',
            background: '#1a1a2e',
            border: '3px solid #00d4ff',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#00d4ff',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            transition: 'all 0.2s',
            display: 'block',
          }}
        >
          ← Back to Game
        </Link>
      </div>
    </div>
  );
}
