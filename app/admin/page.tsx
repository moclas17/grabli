"use client";
import { useState } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { Wallet } from "@coinbase/onchainkit/wallet";
import Image from "next/image";
import { useCreateGame, useForceCloseGame, useActiveGames, useFundGame, useGameDetails, useApproveERC20, useERC20Allowance } from "../../lib/hooks/useGrabliContract";
import { getGrabliAddress } from "../../lib/contracts/grabli";
import { baseSepolia } from "viem/chains";
import styles from "../page.module.css";

export default function AdminPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Auto-detect active game
  const { activeGameId, hasActiveGame } = useActiveGames();
  const currentGameId = activeGameId || BigInt(0);

  const { createGame, isPending, isConfirming, isSuccess, error, hash } = useCreateGame();
  const {
    forceCloseGame,
    isPending: isClosePending,
    isConfirming: isCloseConfirming,
    isSuccess: isCloseSuccess,
    error: closeError,
    hash: closeHash
  } = useForceCloseGame();

  // Fund game hooks
  const { gameDetails } = useGameDetails(currentGameId);
  const {
    fundGame,
    isPending: isFundPending,
    isConfirming: isFundConfirming,
    isSuccess: isFundSuccess,
    error: fundError,
    hash: fundHash
  } = useFundGame();

  const {
    approve,
    isPending: isApprovePending,
    isConfirming: isApproveConfirming,
    isSuccess: isApproveSuccess,
    error: approveError,
    hash: approveHash
  } = useApproveERC20();

  const contractAddress = getGrabliAddress(baseSepolia.id);
  const { allowance, refetch: refetchAllowance } = useERC20Allowance(
    gameDetails?.prizeToken,
    address,
    contractAddress
  );

  const [formData, setFormData] = useState({
    prizeTitle: "Prize Pool",
    prizeValue: "1",
    prizeCurrency: "USD",
    prizeDescription: "Winner takes all!",
    prizeToken: "0x0000000000000000000000000000000000000000",
    prizeAmount: "0",
    sponsorName: "Acme Corp",
    sponsorUrl: "https://acme.example",
    sponsorLogo: "/sponsor-logo.png",
    durationHours: "24",
    claimCooldown: "10",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    const durationSeconds = BigInt(Number(formData.durationHours) * 3600);
    const cooldownSeconds = BigInt(Number(formData.claimCooldown));

    createGame({
      prizeTitle: formData.prizeTitle,
      prizeValue: BigInt(formData.prizeValue),
      prizeCurrency: formData.prizeCurrency,
      prizeDescription: formData.prizeDescription,
      prizeToken: formData.prizeToken as `0x${string}`,
      prizeAmount: BigInt(formData.prizeAmount),
      sponsorName: formData.sponsorName,
      sponsorUrl: formData.sponsorUrl,
      sponsorLogo: formData.sponsorLogo,
      duration: durationSeconds,
      claimCooldown: cooldownSeconds,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            🎮 Create New Game
          </h1>

          {/* Wrong Network Warning */}
          {address && chainId !== baseSepolia.id && (
            <div style={{
              background: '#f59e0b',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ⚠️ Wrong Network! You&apos;re on chain {chainId}, but need Base Sepolia (84532)
              <br />
              <button
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'white',
                  color: '#f59e0b',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Switch to Base Sepolia
              </button>
            </div>
          )}

          {isSuccess && hash && (
            <div style={{
              background: '#10b981',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✅ Game created successfully!
              <br />
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white', textDecoration: 'underline' }}
              >
                View transaction
              </a>
            </div>
          )}

          {error && (
            <div style={{
              background: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ❌ Error: {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Prize Info */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Prize Title
              </label>
              <input
                type="text"
                name="prizeTitle"
                value={formData.prizeTitle}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Prize Value
                </label>
                <input
                  type="number"
                  name="prizeValue"
                  value={formData.prizeValue}
                  onChange={handleChange}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Currency
                </label>
                <input
                  type="text"
                  name="prizeCurrency"
                  value={formData.prizeCurrency}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Prize Description
              </label>
              <textarea
                name="prizeDescription"
                value={formData.prizeDescription}
                onChange={handleChange}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* ERC20 Prize Token */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>💰 ERC20 Prize (Optional)</h3>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Token Address
                </label>
                <input
                  type="text"
                  name="prizeToken"
                  value={formData.prizeToken}
                  onChange={handleChange}
                  placeholder="0x0000... (leave as 0x0 for no token prize)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontFamily: 'monospace',
                  }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.7 }}>
                  USDC on Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
                </small>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Token Amount (in smallest unit)
                </label>
                <input
                  type="text"
                  name="prizeAmount"
                  value={formData.prizeAmount}
                  onChange={handleChange}
                  placeholder="0 (use 0 for no token prize)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                  }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.7 }}>
                  For USDC: 1000000 = 1 USDC (6 decimals)
                </small>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <strong>⚠️ Important:</strong> Game will be created but NOT started until you fund it with the specified tokens.
                After creating, you&apos;ll need to:
                <br />1. Approve the contract to spend your tokens
                <br />2. Call fundGame() to deposit tokens and start the game
              </div>
            </div>

            {/* Sponsor Info */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Sponsor Information</h3>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Sponsor Name
                </label>
                <input
                  type="text"
                  name="sponsorName"
                  value={formData.sponsorName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                  }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Sponsor URL
                </label>
                <input
                  type="url"
                  name="sponsorUrl"
                  value={formData.sponsorUrl}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                  }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Sponsor Logo URL
                </label>
                <input
                  type="text"
                  name="sponsorLogo"
                  value={formData.sponsorLogo}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                  }}
                />
              </div>
            </div>

            {/* Game Settings */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Game Settings</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleChange}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'white',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Claim Cooldown (seconds)
                  </label>
                  <input
                    type="number"
                    name="claimCooldown"
                    value={formData.claimCooldown}
                    onChange={handleChange}
                    required
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'white',
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming || !address}
              style={{
                marginTop: '2rem',
                padding: '1rem',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                background: !address
                  ? '#6b7280'
                  : isPending || isConfirming
                  ? '#f59e0b'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: !address || isPending || isConfirming ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {!address
                ? '🔗 Connect Wallet First'
                : isPending || isConfirming
                ? '⏳ Creating Game...'
                : isSuccess
                ? '✅ Game Created!'
                : '🎮 Create Game'}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <strong>Note:</strong> Only the contract owner can create games. Make sure you&apos;re connected
            with the owner wallet.
            {hasActiveGame && (
              <>
                <br /><br />
                <strong>⚠️ Auto-Close:</strong> Creating a new game will automatically close the active game (ID: {currentGameId.toString()}) and determine its winner.
              </>
            )}
          </div>
        </div>

        {/* Force Close Game Section */}
        <div style={{
          maxWidth: '600px',
          margin: '2rem auto 0',
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
          border: '2px solid rgba(239, 68, 68, 0.3)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#ef4444' }}>
            ⚠️ Force Close Game
          </h2>

          {isCloseSuccess && closeHash && (
            <div style={{
              background: '#10b981',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✅ Game closed successfully!
              <br />
              <a
                href={`https://sepolia.basescan.org/tx/${closeHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white', textDecoration: 'underline' }}
              >
                View transaction
              </a>
            </div>
          )}

          {closeError && (
            <div style={{
              background: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ❌ Error: {closeError.message}
            </div>
          )}

          <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {hasActiveGame
              ? `This will immediately end the active game (ID: ${currentGameId.toString()}) and determine the winner based on current standings.`
              : 'No active game to close. Create a new game first.'}
          </p>

          <button
            onClick={() => {
              if (!hasActiveGame) {
                alert('No active game to close!');
                return;
              }
              if (confirm(`Are you sure you want to force close game ${currentGameId.toString()}? This cannot be undone!`)) {
                forceCloseGame(currentGameId);
              }
            }}
            disabled={!address || isClosePending || isCloseConfirming || chainId !== baseSepolia.id}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              background: !address || isClosePending || isCloseConfirming
                ? '#6b7280'
                : '#ef4444',
              color: 'white',
              cursor: !address || isClosePending || isCloseConfirming ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {!address
              ? '🔗 Connect Wallet First'
              : isClosePending || isCloseConfirming
              ? '⏳ Closing Game...'
              : isCloseSuccess
              ? '✅ Game Closed!'
              : '🛑 Force Close Game'}
          </button>

          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <strong>Warning:</strong> This will end the game immediately, even before the scheduled end time.
            Use this for testing or emergency situations only.
          </div>
        </div>

        {/* Fund Game Section */}
        {hasActiveGame && gameDetails && gameDetails.startAt === BigInt(0) && gameDetails.prizeToken !== '0x0000000000000000000000000000000000000000' && (
          <div style={{
            maxWidth: '600px',
            margin: '2rem auto 0',
            padding: '2rem',
            background: 'rgba(217, 119, 6, 0.1)',
            borderRadius: '12px',
            border: '2px solid rgba(217, 119, 6, 0.3)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#d97706' }}>
              💰 Fund Game & Start
            </h2>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <strong>Game ID {currentGameId.toString()} - Pending Funding</strong>
              <br /><br />
              <strong>Prize Token:</strong> {gameDetails.prizeToken}
              <br />
              <strong>Prize Amount:</strong> {gameDetails.prizeAmount.toString()}
              <br />
              <strong>Current Allowance:</strong> {allowance?.toString() || '0'}
              <br />
              <strong>Status:</strong> {gameDetails.startAt === BigInt(0) ? '⏳ NOT STARTED' : '✅ ACTIVE'}
            </div>

            {/* Approve Success */}
            {isApproveSuccess && approveHash && (
              <div style={{
                background: '#10b981',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                ✅ Tokens approved successfully!
                <br />
                <a
                  href={`https://sepolia.basescan.org/tx/${approveHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'underline' }}
                >
                  View transaction
                </a>
                <br />
                <small>Now click &ldquo;Fund & Start Game&rdquo; below</small>
              </div>
            )}

            {/* Fund Success */}
            {isFundSuccess && fundHash && (
              <div style={{
                background: '#10b981',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🎉 Game funded and started successfully!
                <br />
                <a
                  href={`https://sepolia.basescan.org/tx/${fundHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'underline' }}
                >
                  View transaction
                </a>
              </div>
            )}

            {/* Errors */}
            {approveError && (
              <div style={{
                background: '#ef4444',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                ❌ Approve Error: {approveError.message}
              </div>
            )}

            {fundError && (
              <div style={{
                background: '#ef4444',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                ❌ Fund Error: {fundError.message}
              </div>
            )}

            {/* Step 1: Approve */}
            {(!allowance || allowance < gameDetails.prizeAmount) && (
              <button
                onClick={() => {
                  if (!gameDetails.prizeToken || !gameDetails.prizeAmount) {
                    alert('Invalid game details');
                    return;
                  }
                  approve(gameDetails.prizeToken as `0x${string}`, contractAddress as `0x${string}`, gameDetails.prizeAmount);
                }}
                disabled={!address || isApprovePending || isApproveConfirming || chainId !== baseSepolia.id}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  border: 'none',
                  background: !address || isApprovePending || isApproveConfirming
                    ? '#6b7280'
                    : '#f59e0b',
                  color: 'white',
                  cursor: !address || isApprovePending || isApproveConfirming ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  marginBottom: '1rem'
                }}
              >
                {!address
                  ? '🔗 Connect Wallet First'
                  : isApprovePending || isApproveConfirming
                  ? '⏳ Approving...'
                  : isApproveSuccess
                  ? '✅ Approved!'
                  : '🔓 Step 1: Approve Tokens'}
              </button>
            )}

            {/* Step 2: Fund Game */}
            <button
              onClick={() => {
                fundGame(currentGameId);
                // Refetch allowance after funding
                setTimeout(() => refetchAllowance(), 2000);
              }}
              disabled={
                !address ||
                isFundPending ||
                isFundConfirming ||
                chainId !== baseSepolia.id ||
                !allowance ||
                allowance < gameDetails.prizeAmount
              }
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                background: !address || isFundPending || isFundConfirming || !allowance || allowance < gameDetails.prizeAmount
                  ? '#6b7280'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                cursor: !address || isFundPending || isFundConfirming || !allowance || allowance < gameDetails.prizeAmount ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {!address
                ? '🔗 Connect Wallet First'
                : !allowance || allowance < gameDetails.prizeAmount
                ? '🔒 Approve tokens first'
                : isFundPending || isFundConfirming
                ? '⏳ Funding Game...'
                : isFundSuccess
                ? '✅ Game Started!'
                : '💰 Step 2: Fund & Start Game'}
            </button>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(217, 119, 6, 0.1)',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <strong>How it works:</strong>
              <br />1. Click &ldquo;Approve Tokens&rdquo; to give the contract permission
              <br />2. Click &ldquo;Fund & Start Game&rdquo; to deposit tokens and start the game
              <br />3. Game will start immediately after funding
              <br /><br />
              <strong>Note:</strong> Only the sponsor who created the game can fund it.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
