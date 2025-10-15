# Grabli 🎯

A competitive blockchain game built as a Farcaster MiniApp on Base, where players compete to hold a prize for the longest time.

## 🎮 Game Concept

**Grabli** is a "hot potato" style game where:
- A prize (e.g., "$1 USD") is up for grabs during a fixed time window (e.g., 24 hours)
- Players can **claim** the prize at any time by calling the smart contract
- The current holder accumulates time from their claim until someone else claims
- **The winner is whoever has the most accumulated holding time** when the game ends
- Includes sponsor/advertiser integration with visible branding
- **Only one game can be active at a time** - creating a new game automatically closes active ones

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Blockchain**: Base (Sepolia testnet & Mainnet)
- **Smart Contracts**: Solidity 0.8.20
- **Web3 Integration**:
  - OnchainKit (Coinbase)
  - Wagmi + Viem
  - MiniKit SDK (Farcaster)
- **Development**: Hardhat
- **Styling**: CSS Modules with pixel art theme

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd grabli

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## 🔧 Configuration

Edit `.env` with your values:

```bash
# Required for frontend
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
NEXT_PUBLIC_CDP_API_KEY=your_key_here
NEYNAR_API_KEY=your_key_here

# Smart contract addresses (after deployment)
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_CURRENT_GAME_ID=0

# For deployment
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_deployer_private_key
BASESCAN_API_KEY=your_basescan_key
```

## 🚀 Quick Start

### 1. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Deploy the Smart Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia

# Note the contract address and add it to .env
# NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x...
```

### 3. Create a Game

```bash
# Using script
npx hardhat run scripts/create-game.ts --network baseSepolia

# Or use the Admin UI
# Navigate to http://localhost:3000/admin
# Connect your wallet and create a game
```

### 4. Update Game ID

After creating a game, update `.env`:

```bash
NEXT_PUBLIC_CURRENT_GAME_ID=0  # Use the game ID from creation
```

## 📝 Smart Contract

The `Grabli.sol` contract provides:

### Core Functions

- `createGame()` - Creates a new game (owner only) - **automatically closes all active games first**
- `claim(gameId)` - Claims the prize in an active game
- `closeGame(gameId)` - Finalizes the game and determines winner
- `forceCloseGame(gameId)` - Immediately ends a game (owner only)

### View Functions

- `getGameState(gameId)` - Returns current game state
- `getGameDetails(gameId)` - Returns full game info including sponsor
- `getLeaderboard(gameId)` - Returns all players and their accumulated times
- `getPlayerStats(gameId, player)` - Returns individual player statistics
- `getActiveGames()` - Returns array of all active (non-finished) game IDs
- `getGamePlayers(gameId)` - Returns all players who participated in a game

### Events

- `GameCreated` - Emitted when a new game is created
- `Claimed` - Emitted when a player claims the prize
- `GameFinished` - Emitted when a game ends with winner info

## 🎯 Usage Examples

### Playing the Game

1. **Connect Wallet**: Click the wallet button in the header
2. **Claim Prize**: Click "GRAB IT NOW!" to claim the current prize
3. **Watch Leaderboard**: See your ranking and accumulated time
4. **Win**: Have the most time when the game ends!

### Creating a Game (Admin)

1. Navigate to `/admin`
2. Connect with owner wallet
3. Fill in game details:
   - Prize information
   - Sponsor details
   - Game duration
   - Claim cooldown
4. Click "Create Game"
5. Update `NEXT_PUBLIC_CURRENT_GAME_ID` in `.env`

### Closing a Game

When a game ends, anyone can call `closeGame()` to finalize it:

```typescript
import { useCloseGame } from './lib/hooks/useGrabliContract';

const { closeGame } = useCloseGame();
closeGame(gameId);
```

## 📱 Farcaster Integration

This app is a **Farcaster MiniApp**:

- Configured in `minikit.config.ts`
- Manifest served at `/.well-known/farcaster.json`
- Supports QuickAuth for user verification
- Optimized for Farcaster's mobile experience

## 🌐 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy Contract to Base Mainnet

```bash
# Update .env with BASE_RPC_URL
npx hardhat run scripts/deploy.ts --network base

# Update frontend env
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS=0x...
```

## 🔍 Testing

### Testing Contracts (Local Hardhat)

```bash
# Start local node
npx hardhat node

# In another terminal
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/create-game.ts --network localhost
```

### Testing Auto-Close Functionality

Test that creating a new game automatically closes active games:

```bash
npx hardhat run scripts/test-auto-close.ts --network baseSepolia
```

This script will:
1. Check currently active games
2. Create a new game
3. Verify all previous games were closed
4. Confirm only the new game is active

See [AUTO_CLOSE_IMPLEMENTATION.md](AUTO_CLOSE_IMPLEMENTATION.md) for details.

### Frontend Testing

1. Deploy contract to Base Sepolia
2. Create a test game
3. Try claiming with multiple wallets
4. Verify leaderboard updates
5. Wait for game to end and check winner

## 📊 Project Structure

```
grabli/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main game UI
│   ├── admin/page.tsx     # Admin panel
│   └── api/               # API routes
├── contracts/             # Solidity contracts
│   └── Grabli.sol        # Main game contract
├── lib/
│   ├── contracts/        # Contract ABIs and types
│   └── hooks/            # React hooks for Web3
├── scripts/              # Deployment scripts
│   ├── deploy.ts         # Contract deployment
│   └── create-game.ts    # Game creation script
├── public/               # Static assets
└── hardhat.config.ts     # Hardhat configuration
```

## 🎨 Customization

### Styling

Edit CSS in `app/page.module.css` and `app/globals.css`

### Game Parameters

Modify in admin UI or scripts:
- Duration (hours)
- Claim cooldown (seconds)
- Prize value and currency
- Sponsor information

## 🔐 Security

- Contract uses OpenZeppelin's `Ownable` and `ReentrancyGuard`
- Cooldown mechanism prevents spam
- All game state stored on-chain
- Events for transparency

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📞 Support

- **Issues**: [GitHub Issues](your-repo-url/issues)
- **Docs**: See `CLAUDE.md` for development guidelines
- **Base**: [Base Documentation](https://docs.base.org)
- **OnchainKit**: [OnchainKit Docs](https://onchainkit.xyz)

---

Built with ❤️ on Base
