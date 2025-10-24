"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  useGlobalStats,
  useAllGamesDetails,
  useTokenDecimals,
  formatTokenAmount,
} from "../../lib/hooks/useGrabliContract";
import { Address as AddressType } from "viem";
import { usePublicClient } from 'wagmi';
import { GRABLI_ABI, getGrabliAddress } from '../../lib/contracts/grabli';
import { base } from 'viem/chains';
import styles from "../page.module.css";

export default function GlobalStatsPage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  const {
    totalGames,
    finishedGames,
    totalPrizeValue,
    totalPlayers,
    totalUniquePlayers,
    totalTransactions,
    isLoading,
  } = useGlobalStats();

  const { games, isLoading: isLoadingGames } = useAllGamesDetails();
  const publicClient = usePublicClient({ chainId: base.id });

  const [isDownloading, setIsDownloading] = useState(false);
  const [allUniqueWallets, setAllUniqueWallets] = useState<Map<string, number[]>>(new Map());
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);

  // Load all unique wallets when component mounts
  useEffect(() => {
    const loadAllWallets = async () => {
      if (!publicClient || games.length === 0 || allUniqueWallets.size > 0) return;

      setIsLoadingWallets(true);
      try {
        const walletGamesMap = new Map<string, number[]>();

        for (const game of games) {
          const gameId = game.gameId;

          try {
            const players = await publicClient.readContract({
              address: getGrabliAddress(base.id) as `0x${string}`,
              abi: GRABLI_ABI,
              functionName: 'getGamePlayers',
              args: [gameId],
            }) as string[];

            players.forEach((playerAddress: string) => {
              const lowerAddress = playerAddress.toLowerCase();
              const gamesList = walletGamesMap.get(lowerAddress) || [];
              gamesList.push(Number(gameId));
              walletGamesMap.set(lowerAddress, gamesList);
            });
          } catch (error) {
            console.error(`Error fetching players for game ${gameId}:`, error);
          }
        }

        setAllUniqueWallets(walletGamesMap);
      } catch (error) {
        console.error('Error loading wallets:', error);
      } finally {
        setIsLoadingWallets(false);
      }
    };

    if (!isLoadingWallets && allUniqueWallets.size === 0) {
      loadAllWallets();
    }
  }, [publicClient, games.length, isLoadingWallets, allUniqueWallets.size]);

  // Function to download CSV with all unique wallets from all games
  const downloadAllPlayersCSV = () => {
    if (allUniqueWallets.size === 0) {
      alert('No wallets data available yet. Please wait...');
      return;
    }

    setIsDownloading(true);
    try {
      // Create CSV with all unique wallets
      const headers = ['Wallet Address', 'Games Played', 'Game IDs'];
      const rows = Array.from(allUniqueWallets.entries()).map(([wallet, gameIds]) => [
        wallet,
        gameIds.length.toString(),
        gameIds.join('; ')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `grabli-all-players-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`✓ Downloaded ${allUniqueWallets.size} unique wallets!`);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
            Loading global statistics...
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
            🌍 Global Statistics
          </h1>
          <div style={{
            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
            opacity: 0.9,
          }}>
            All-Time Contract Statistics
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
          {/* Total Games */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #00d4ff',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>🎮</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#00d4ff' }}>
              {totalGames}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Games
            </div>
          </div>

          {/* Total Transactions */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #00ff00',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>⚡</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#00ff00' }}>
              {totalTransactions}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Transactions
            </div>
          </div>

          {/* Finished Games */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #ffd700',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>🏁</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#ffd700' }}>
              {finishedGames}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Finished Games
            </div>
          </div>

          {/* Total Prize Value */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #ff00ff',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>💰</div>
            <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 'bold', color: '#ff00ff' }}>
              ${totalPrizeValue}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Prize Value
            </div>
          </div>

          {/* Total Participations */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #ff6b6b',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>⚡</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#ff6b6b' }}>
              {totalPlayers}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Total Participations
            </div>
          </div>

          {/* Unique Players */}
          <div style={{
            padding: 'clamp(0.75rem, 3vw, 1.5rem)',
            background: '#1a1a2e',
            border: '3px solid #4ecdc4',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '0.25rem' }}>👥</div>
            <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 'bold', color: '#4ecdc4' }}>
              {totalUniquePlayers}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.8, marginTop: '0.25rem' }}>
              Unique Players
            </div>
          </div>
        </div>

        {/* Download All Players CSV Button */}
        <button
          onClick={downloadAllPlayersCSV}
          disabled={games.length === 0 || isDownloading}
          style={{
            width: '100%',
            padding: '1rem',
            background: (games.length === 0 || isDownloading) ? '#666' : '#00ff00',
            border: '3px solid #ffffff',
            borderRadius: '12px',
            textAlign: 'center',
            color: (games.length === 0 || isDownloading) ? '#aaa' : '#0f0f1e',
            fontWeight: 'bold',
            fontSize: 'clamp(0.875rem, 3.5vw, 1.125rem)',
            transition: 'all 0.2s',
            display: 'block',
            cursor: (games.length === 0 || isDownloading) ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: (games.length === 0 || isDownloading) ? 'none' : '0 4px 0 #008800, 0 4px 8px rgba(0, 255, 0, 0.3)',
          }}
        >
          {isDownloading ? '⏳ Downloading...' : '📥 Download All Players Data (CSV)'}
        </button>

        {/* Games Table */}
        <div style={{
          width: '100%',
          marginBottom: '1rem',
          background: '#1a1a2e',
          border: '3px solid #00d4ff',
          borderRadius: '12px',
          padding: 'clamp(0.75rem, 3vw, 1.5rem)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            color: '#00d4ff',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            🎮 All Games
          </h2>

          {isLoadingGames ? (
            <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>
              Loading games data...
            </div>
          ) : games.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>
              No games found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)',
              }}>
                <thead>
                  <tr style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    borderBottom: '2px solid #00d4ff',
                  }}>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'left', color: '#00d4ff' }}>ID</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'left', color: '#00d4ff' }}>Sponsor</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'right', color: '#00d4ff' }}>Prize</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'center', color: '#00d4ff' }}>Users</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'center', color: '#00d4ff' }}>TX</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'center', color: '#00d4ff' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => {
                    const PrizeDisplay = ({ amount, tokenAddress, currency }: { amount: bigint, tokenAddress: AddressType, currency: string }) => {
                      const { decimals } = useTokenDecimals(tokenAddress);
                      return (
                        <span style={{ color: '#00ff00', fontWeight: 'bold' }}>
                          {formatTokenAmount(amount, decimals)} {currency}
                        </span>
                      );
                    };

                    return (
                      <tr key={game.gameId.toString()} style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.2s',
                      }}>
                        <td style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
                          <span style={{
                            color: '#ffd700',
                            fontWeight: 'bold',
                            fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                          }}>
                            #{game.gameId.toString()}
                          </span>
                        </td>
                        <td style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{game.sponsorName}</span>
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
                              opacity: 0.6
                            }}>
                              {game.sponsor.slice(0, 6)}...{game.sponsor.slice(-4)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'right' }}>
                          <PrizeDisplay
                            amount={game.prizeAmount}
                            tokenAddress={game.prizeToken}
                            currency={game.prizeCurrency}
                          />
                        </td>
                        <td style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'center' }}>
                          <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>
                            {game.playerCount}
                          </span>
                        </td>
                        <td style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'center' }}>
                          <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                            {game.transactionCount}
                          </span>
                        </td>
                        <td style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
                            fontWeight: 'bold',
                            background: game.finished ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
                            color: game.finished ? '#ffd700' : '#00ff00',
                          }}>
                            {game.finished ? '✓ Done' : '● Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Unique Wallets Section */}
        <div style={{
          width: '100%',
          marginBottom: '1rem',
          background: '#1a1a2e',
          border: '3px solid #4ecdc4',
          borderRadius: '12px',
          padding: 'clamp(0.75rem, 3vw, 1.5rem)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            color: '#4ecdc4',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            👥 All Unique Players ({allUniqueWallets.size})
          </h2>

          {isLoadingWallets ? (
            <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>
              Loading wallets...
            </div>
          ) : allUniqueWallets.size === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>
              No players found
            </div>
          ) : (
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              {Array.from(allUniqueWallets.entries()).map(([wallet, gameIds], index) => (
                <div
                  key={wallet}
                  style={{
                    padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                    background: '#0f0f1e',
                    border: '2px solid #1a1a2e',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a1a2e';
                    e.currentTarget.style.borderColor = '#4ecdc4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0f0f1e';
                    e.currentTarget.style.borderColor = '#1a1a2e';
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    color: '#888',
                    minWidth: 'clamp(1.5rem, 4vw, 2rem)',
                    fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)',
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)',
                    color: '#c0c0c0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {wallet}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.25rem',
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#4ecdc4',
                      fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                      whiteSpace: 'nowrap',
                    }}>
                      {gameIds.length} {gameIds.length === 1 ? 'game' : 'games'}
                    </span>
                    <span style={{
                      fontSize: 'clamp(0.6rem, 2vw, 0.65rem)',
                      color: '#666',
                      whiteSpace: 'nowrap',
                    }}>
                      Games: {gameIds.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {/* View Individual Game Stats */}
          <Link
            href="/stats"
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
            📊 View Current Game Stats
          </Link>

          {/* Back to Home */}
          <Link
            href="/"
            style={{
              width: '100%',
              padding: '1rem',
              background: '#1a1a2e',
              border: '3px solid #888',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#888',
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
    </div>
  );
}
