"use client";
import { useEffect } from "react";
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
