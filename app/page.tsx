"use client";
import { useEffect, useState } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";

// Mock data - will be replaced with smart contract data
const MOCK_GAME = {
  prize: {
    title: "Prize Pool",
    value: "1",
    currency: "USD",
    description: "Winner takes all!",
    sponsor: {
      name: "Acme Corp",
      url: "https://acme.example",
      logo: "/sponsor-logo.png",
    },
  },
  startAt: Date.now() - 3600000, // Started 1 hour ago
  endAt: Date.now() + 82800000, // Ends in 23 hours
  holder: {
    address: "0x1234...5678",
    sinceTs: Date.now() - 1800000, // Holding for 30 min
  },
  totals: [
    { address: "0x1234...5678", seconds: 5400 },
    { address: "0xabcd...efgh", seconds: 3600 },
    { address: "0x9876...5432", seconds: 1800 },
  ],
};

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, MOCK_GAME.endAt - Date.now());
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatSeconds = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handleClaim = () => {
    // TODO: Call smart contract claim() function
    console.log("Claiming prize...");
  };

  return (
    <div className={styles.container}>
      {/* Floating Wallet Button */}
      <div className={styles.walletFloat}>
        <Wallet />
      </div>

      <div className={styles.content}>
        {/* Prize Display with Sponsor Ribbon */}
        <div className={styles.prizeSection}>
          {/* Sponsor Ribbon */}
          <a
            href={MOCK_GAME.prize.sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sponsorRibbon}
            data-text={MOCK_GAME.prize.sponsor.name}
          />

          <div className={styles.prizeIcon}>🏆</div>
          <h1 className={styles.prizeTitle}>{MOCK_GAME.prize.title}</h1>
          <div className={styles.prizeValue}>
            ${MOCK_GAME.prize.value} {MOCK_GAME.prize.currency}
          </div>
          <p className={styles.prizeDescription}>
            {MOCK_GAME.prize.description}
          </p>
        </div>

        {/* Timer */}
        <div className={styles.timerSection}>
          <div className={styles.timerLabel}>Time Remaining</div>
          <div className={styles.timerValue}>{formatTime(timeRemaining)}</div>
        </div>

        {/* Current Holder */}
        <div className={styles.holderSection}>
          <div className={styles.holderLabel}>Current Holder</div>
          <div className={styles.holderAddress}>{MOCK_GAME.holder.address}</div>
        </div>

        {/* Claim Button */}
        <button className={styles.claimButton} onClick={handleClaim}>
          🎯 GRAB IT NOW!
        </button>

        {/* Leaderboard */}
        <div className={styles.leaderboard}>
          <h2 className={styles.leaderboardTitle}>🏅 Top Players</h2>
          <div className={styles.leaderboardList}>
            {MOCK_GAME.totals.map((player, index) => (
              <div key={player.address} className={styles.leaderboardItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.playerAddress}>{player.address}</span>
                <span className={styles.playerScore}>
                  {formatSeconds(player.seconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
