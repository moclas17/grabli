"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  useGlobalStats,
} from "../../lib/hooks/useGrabliContract";
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
