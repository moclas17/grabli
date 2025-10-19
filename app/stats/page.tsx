"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Name, Avatar, Address } from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { base } from "viem/chains";
import {
  useActiveGames,
  useGameCount,
  useGameState,
  useGameDetails,
  useGamePlayers,
  useFullLeaderboard,
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
  const { leaderboard, isLoading: isLoadingLeaderboard } = useFullLeaderboard(currentGameId);

  // Calculate statistics from leaderboard
  const totalClaims = leaderboard.reduce((sum, player) => sum + Number(player.claimCount || 0), 0);
  const totalPlayTime = leaderboard.reduce((sum, player) => sum + Number(player.totalSeconds), 0);

  // Most active player (most claims)
  const mostActivePlayer = leaderboard.length > 0
    ? leaderboard.reduce((max, player) =>
        (player.claimCount || BigInt(0)) > (max.claimCount || BigInt(0)) ? player : max
      )
    : null;

  // Longest holder (most seconds)
  const longestHolder = leaderboard.length > 0
    ? leaderboard.reduce((max, player) =>
        player.totalSeconds > max.totalSeconds ? player : max
      )
    : null;

  // Calculate percentage of time held
  const calculatePercentage = (seconds: bigint): string => {
    if (totalPlayTime === 0) return '0';
    const percentage = (Number(seconds) / totalPlayTime) * 100;
    return percentage.toFixed(1);
  };

  const formatSeconds = (seconds: bigint) => {
    const total = Number(seconds);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  // Component to display player identity with Basename support
  const PlayerIdentity = ({ address }: { address: string }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(0.35rem, 1.5vw, 0.5rem)',
      minWidth: 0,
    }}>
      <div style={{ flexShrink: 0 }}>
        <Avatar
          address={address as `0x${string}`}
          chain={base}
        />
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
          fontWeight: '600',
          color: '#00d4ff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          <Name
            address={address as `0x${string}`}
            chain={base}
          />
        </div>
        <div style={{
          fontSize: 'clamp(0.6rem, 2.5vw, 0.7rem)',
          color: '#888',
          fontFamily: 'monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          <Address
            address={address as `0x${string}`}
            isSliced
          />
        </div>
      </div>
    </div>
  );

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
          padding: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          marginBottom: '1rem',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 5vw, 2rem)',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 0 #aa00aa, 4px 4px 0 rgba(0, 0, 0, 0.8)',
            marginBottom: '0.5rem',
          }}>
            📊 Game Statistics
          </h1>
          <div style={{
            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
            opacity: 0.9,
            wordBreak: 'break-word',
          }}>
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
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #00d4ff',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>👥</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#00d4ff' }}>
              {players.length}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Players
            </div>
          </div>

          {/* Total Claims */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #ff00ff',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>⚡</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#ff00ff' }}>
              {totalClaims}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Transactions
            </div>
          </div>

          {/* Game Status */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #ffd700',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>
              {gameState?.finished ? '🏁' : '🎮'}
            </div>
            <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 'bold', color: '#ffd700' }}>
              {gameState?.finished ? 'Finished' : 'Active'}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Game Status
            </div>
          </div>

          {/* Prize Value */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #00ff00',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>💰</div>
            <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 'bold', color: '#00ff00' }}>
              {gameDetails?.prizeAmount ? (Number(gameDetails.prizeAmount) / 1e6).toFixed(2) : '0'} {gameDetails?.prizeCurrency || 'USD'}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Prize Value
            </div>
          </div>
        </div>

        {/* Most Active Player */}
        {mostActivePlayer && (mostActivePlayer.claimCount || BigInt(0)) > BigInt(0) && (
          <div style={{
            width: '100%',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            background: '#16213e',
            border: '4px solid #ff00ff',
            borderRadius: '16px',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#ff00ff',
              textTransform: 'uppercase',
            }}>
              ⚡ Most Active Player
            </h2>
            <div style={{
              padding: 'clamp(0.75rem, 2.5vw, 1rem)',
              background: '#0f0f1e',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                <PlayerIdentity address={mostActivePlayer.address} />
              </div>
              <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#ff00ff',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  whiteSpace: 'nowrap',
                }}>
                  {(mostActivePlayer.claimCount || BigInt(0)).toString()} claims
                </div>
                <div style={{
                  fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
                  color: '#888',
                  marginTop: '0.25rem',
                  whiteSpace: 'nowrap',
                }}>
                  {calculatePercentage(mostActivePlayer.totalSeconds)}% of time
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Longest Holder */}
        {longestHolder && longestHolder.totalSeconds > BigInt(0) && (
          <div style={{
            width: '100%',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            background: '#16213e',
            border: '4px solid #ffd700',
            borderRadius: '16px',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#ffd700',
              textTransform: 'uppercase',
            }}>
              👑 Longest Holder
            </h2>
            <div style={{
              padding: 'clamp(0.75rem, 2.5vw, 1rem)',
              background: '#0f0f1e',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                <PlayerIdentity address={longestHolder.address} />
              </div>
              <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#ffd700',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  whiteSpace: 'nowrap',
                }}>
                  {formatSeconds(longestHolder.totalSeconds)}
                </div>
                <div style={{
                  fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
                  color: '#888',
                  marginTop: '0.25rem',
                  whiteSpace: 'nowrap',
                }}>
                  {calculatePercentage(longestHolder.totalSeconds)}% of time
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player List with Stats */}
        {leaderboard.length > 0 && (
          <div style={{
            width: '100%',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            background: '#16213e',
            border: '4px solid #00d4ff',
            borderRadius: '16px',
          }}>
            <h2 style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
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
                .sort((a, b) => Number((b.claimCount || BigInt(0))) - Number((a.claimCount || BigInt(0))))
                .map((player, index) => (
                  <div
                    key={player.address}
                    style={{
                      padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                      background: '#0f0f1e',
                      border: '2px solid #1a1a2e',
                      borderRadius: '8px',
                      display: 'flex',
                      gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{
                      fontWeight: 'bold',
                      color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#888',
                      minWidth: 'clamp(1.5rem, 4vw, 2rem)',
                      fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                    }}>
                      #{index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <PlayerIdentity address={player.address} />
                      <div style={{
                        fontSize: 'clamp(0.6rem, 2.5vw, 0.65rem)',
                        color: '#888',
                        marginTop: '0.25rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem',
                        alignItems: 'center',
                      }}>
                        <span>Time: {formatSeconds(player.totalSeconds)}</span>
                        <span style={{
                          color: '#00d4ff',
                          fontWeight: 'bold',
                        }}>
                          ({calculatePercentage(player.totalSeconds)}%)
                        </span>
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#00ff00',
                      fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}>
                      {(player.claimCount || BigInt(0)).toString()} TX
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
            fontSize: 'clamp(0.875rem, 3.5vw, 1.125rem)',
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
