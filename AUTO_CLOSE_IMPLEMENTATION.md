# Auto-Close Active Games Feature

## Overview

The Grabli smart contract has been enhanced to ensure **only one game can be active at a time**. When a new game is created, all previously active games are automatically closed and their winners are determined.

## Changes Made

### 1. Smart Contract Modifications ([contracts/Grabli.sol](contracts/Grabli.sol))

#### Added Internal Function: `_closeAllActiveGames()`
- **Location**: Lines 260-302
- **Purpose**: Iterates through all existing games and closes any that are not finished
- **Behavior**:
  - Calculates and awards final time to current holders
  - Determines winners based on accumulated time
  - Updates game state to `finished = true`
  - Sets `endAt` to current timestamp
  - Emits `GameFinished` events for each closed game

#### Modified Function: `createGame()`
- **Change**: Added call to `_closeAllActiveGames()` at line 104
- **Impact**: Before creating a new game, all active games are automatically closed
- **Note**: Added documentation explaining this behavior

#### Added View Function: `getActiveGames()`
- **Location**: Lines 432-458
- **Purpose**: Returns an array of all active (non-finished) game IDs
- **Use Case**: Useful for debugging, monitoring, and frontend display

## How It Works

### Game Creation Flow (Before)
1. Owner calls `createGame()`
2. New game is created
3. Multiple games can be active simultaneously

### Game Creation Flow (After)
1. Owner calls `createGame()`
2. **Contract automatically closes all active games**
   - Current holders receive their final accumulated time
   - Winners are determined for each closed game
   - `GameFinished` events are emitted
3. New game is created
4. **Only the new game is active**

## Testing

### Test Script: `scripts/test-auto-close.ts`

A comprehensive test script has been created to verify the auto-close functionality:

```bash
npx hardhat run scripts/test-auto-close.ts --network baseSepolia
```

**Test Steps:**
1. Lists all currently active games
2. Creates a new game (which triggers auto-close)
3. Verifies previously active games are now closed
4. Confirms only the new game is active

### Expected Results
- All previous games should have `finished = true`
- Winners should be determined for closed games
- Only one game should be active (the newly created one)

## Usage

### For Contract Owners

**Creating a New Game (Admin UI):**
1. Go to `/admin`
2. Connect with owner wallet
3. Fill in game details
4. Click "Create Game"
5. **All active games will be automatically closed**
6. New game becomes active

**Creating a New Game (Script):**
```bash
npx hardhat run scripts/create-game.ts --network baseSepolia
```

### For Developers

**Check Active Games:**
```typescript
const activeGameIds = await grabli.getActiveGames();
console.log("Active games:", activeGameIds);
```

**Create Game (Programmatic):**
```typescript
// This will auto-close any active games
const tx = await grabli.createGame(
  prizeTitle,
  prizeValue,
  prizeCurrency,
  prizeDescription,
  sponsorName,
  sponsorUrl,
  sponsorLogo,
  duration,
  claimCooldown
);
```

## Events Emitted

When creating a new game with active games present:

1. **Multiple `GameFinished` events** - One for each closed game
   - `gameId`: ID of the closed game
   - `winner`: Address of the winner
   - `totalSeconds`: Winner's total holding time

2. **One `GameCreated` event** - For the new game
   - `gameId`: ID of the new game
   - `prizeTitle`: Prize title
   - `startAt`: Start timestamp
   - `endAt`: End timestamp
   - `sponsorName`: Sponsor name

## Frontend Integration

The frontend will automatically work with this change, but you may want to:

1. **Update the UI** to show a warning when creating a new game:
   ```typescript
   "Creating a new game will close all active games and determine their winners."
   ```

2. **Display closed games** with their winners in a "Past Games" section

3. **Listen for events** to show real-time updates when games are closed

## Benefits

1. **Simplified Game Management**: Only one active game to track
2. **Automatic Cleanup**: No need to manually close old games
3. **Fair Winner Determination**: Winners are automatically determined when games are closed
4. **Gas Efficient**: All closing operations happen in one transaction
5. **Event Transparency**: All game closures emit events for tracking

## Important Notes

- **Owner Privileges**: Only the contract owner can create games (and trigger auto-close)
- **Winners Determined**: Closed games will have their winners calculated based on accumulated time
- **No Refunds**: The auto-close doesn't affect prize distribution (handled off-chain)
- **Gas Costs**: Creating a game will cost more gas if multiple games need to be closed
- **Irreversible**: Once games are auto-closed, they cannot be reopened

## Deployment

After making these changes:

1. **Compile the contract:**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to testnet first:**
   ```bash
   npx hardhat run scripts/deploy.ts --network baseSepolia
   ```

3. **Test the auto-close functionality:**
   ```bash
   npx hardhat run scripts/test-auto-close.ts --network baseSepolia
   ```

4. **Deploy to mainnet** when ready:
   ```bash
   npx hardhat run scripts/deploy.ts --network base
   ```

5. **Update environment variables** with new contract address

## Migration Notes

If you have an existing deployed contract with active games:

1. Deploy the new contract version
2. Update frontend to use new contract address
3. Old games will remain on the old contract
4. New games will use the new auto-close functionality

---

**Built with Base + OnchainKit**
