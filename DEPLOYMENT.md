# Grabli Deployment Guide

Complete step-by-step guide to deploy Grabli to production.

## Prerequisites

- Node.js 18+ installed
- A wallet with Base Sepolia ETH for testing (get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- API Keys:
  - Coinbase Developer Platform (CDP) API Key
  - OnchainKit API Key
  - Neynar API Key (for Farcaster)
  - BaseScan API Key (optional, for verification)

## Step 1: Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Fill in required values:

```bash
# Frontend Keys
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key
NEXT_PUBLIC_CDP_API_KEY=your_cdp_key
NEYNAR_API_KEY=your_neynar_key

# Deployment Keys
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_wallet_private_key_without_0x
BASESCAN_API_KEY=your_basescan_key

# Will be filled after deployment
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=
NEXT_PUBLIC_CURRENT_GAME_ID=
```

## Step 2: Deploy Smart Contract

### To Base Sepolia (Testnet)

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

Expected output:
```
Deploying Grabli contract...
Deploying with account: 0x...
Account balance: X.XX ETH
Grabli deployed to: 0x1234567890abcdef...
```

**Copy the contract address** and add to `.env`:

```bash
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x1234567890abcdef...
```

### Verify Contract (Optional but Recommended)

```bash
npx hardhat verify --network baseSepolia 0xYOUR_CONTRACT_ADDRESS
```

## Step 3: Create Initial Game

### Option A: Using Script

Update game parameters in `.env` or use defaults:

```bash
PRIZE_TITLE="100 USDC Prize"
PRIZE_VALUE=100
PRIZE_CURRENCY="USDC"
PRIZE_DESCRIPTION="First to grab wins big!"
SPONSOR_NAME="Your Sponsor"
SPONSOR_URL="https://sponsor.com"
SPONSOR_LOGO="/sponsor-logo.png"
GAME_DURATION=86400  # 24 hours
CLAIM_COOLDOWN=10    # 10 seconds
```

Run the script:

```bash
npm run create-game:sepolia
```

Expected output:
```
Creating a new game...
Contract Address: 0x...
Transaction hash: 0x...
✅ Game created successfully!
Game ID: 0
```

**Copy the Game ID** and add to `.env`:

```bash
NEXT_PUBLIC_CURRENT_GAME_ID=0
```

### Option B: Using Admin UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin`

3. Connect with the wallet that deployed the contract (owner)

4. Fill in the form and click "Create Game"

5. Copy the Game ID from the transaction and add to `.env`

## Step 4: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and:

1. Connect your wallet
2. Click "GRAB IT NOW!" to claim
3. Verify transaction completes
4. Check leaderboard updates
5. Try with multiple wallets

## Step 5: Deploy Frontend to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Configure Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=...
NEXT_PUBLIC_CDP_API_KEY=...
NEYNAR_API_KEY=...
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_CURRENT_GAME_ID=0
```

## Step 6: Production Deployment (Base Mainnet)

### 1. Get Base ETH

Transfer ETH to your deployer wallet on Base Mainnet.

### 2. Update Configuration

Add to `.env`:

```bash
BASE_RPC_URL=https://mainnet.base.org
```

### 3. Deploy Contract

```bash
npm run deploy:mainnet
```

### 4. Update Environment

```bash
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS=0xYOUR_MAINNET_ADDRESS
```

### 5. Create Production Game

```bash
npm run create-game -- --network base
```

### 6. Update Vercel

Add production environment variable:
```
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS=0xYOUR_MAINNET_ADDRESS
```

## Step 7: Register as Farcaster MiniApp

1. Ensure your app is deployed and accessible via HTTPS

2. Verify manifest is accessible at:
   ```
   https://your-domain.com/.well-known/farcaster.json
   ```

3. Submit to Farcaster directory (follow Farcaster documentation)

4. Test in Warpcast app

## Monitoring & Maintenance

### View Contract on BaseScan

- Testnet: `https://sepolia.basescan.org/address/YOUR_CONTRACT`
- Mainnet: `https://basescan.org/address/YOUR_CONTRACT`

### Create New Games

Use the admin panel at `/admin` or the script:

```bash
npm run create-game:sepolia
# or
npm run create-game -- --network base
```

### Close Finished Games

Games can be closed by anyone after they end. Users can call `closeGame()` via the contract or you can add a UI button.

## Troubleshooting

### "Insufficient funds" Error

- Check your wallet has enough Base ETH
- Testnet: Get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- Mainnet: Bridge ETH to Base

### "Game does not exist" Error

- Verify `NEXT_PUBLIC_CURRENT_GAME_ID` is set correctly
- Check the game was created successfully on BaseScan

### Contract Reads Failing

- Verify contract address is correct
- Check you're on the right network (Sepolia vs Mainnet)
- Ensure RPC endpoint is working

### Wallet Not Connecting

- Check OnchainKit and CDP API keys are valid
- Verify MiniKit is properly configured
- Try different wallet (Coinbase Wallet, MetaMask)

## Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Keep private keys secure
- [ ] Use separate wallets for testnet and mainnet
- [ ] Verify contract on BaseScan
- [ ] Test thoroughly on Sepolia before mainnet
- [ ] Set up monitoring for contract events
- [ ] Have a plan to handle winner payouts

## Cost Estimates

### Base Sepolia (Testnet)
- Contract Deployment: ~0.001-0.003 ETH (free testnet ETH)
- Game Creation: ~0.0001-0.0003 ETH
- Claim Transaction: ~0.00005-0.0001 ETH

### Base Mainnet
- Contract Deployment: ~$0.50-2.00
- Game Creation: ~$0.10-0.50
- Claim Transaction: ~$0.01-0.05

*Prices vary with gas fees*

## Support

For issues or questions:
- Check GitHub Issues
- Review contract on BaseScan
- Test on Sepolia first
- Check Base documentation

---

Ready to launch! 🚀
