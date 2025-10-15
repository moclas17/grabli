import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;

  // Get game ID from environment variable
  // When using "hardhat run", use GAME_ID env variable to specify a different game
  const gameId = process.env.GAME_ID || process.env.NEXT_PUBLIC_CURRENT_GAME_ID || "0";

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  console.log("Force closing game...");
  console.log("Contract Address:", contractAddress);
  console.log("Game ID:", gameId);

  // Setup provider and wallet
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Using account:", wallet.address);

  // Load contract ABI
  const artifactPath = join(process.cwd(), "artifacts/contracts/Grabli.sol/Grabli.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

  // Get contract instance
  const grabli = new ethers.Contract(contractAddress, artifact.abi, wallet);

  // Check game status first
  console.log("\n=== Current Game Status ===");
  const gameState = await grabli.getGameState(gameId);
  console.log("Prize Title:", gameState.prizeTitle);
  console.log("Current Holder:", gameState.holder);
  console.log("Finished:", gameState.finished);
  console.log("End Time:", new Date(Number(gameState.endAt) * 1000).toLocaleString());

  if (gameState.finished) {
    console.log("\n❌ Game is already finished!");
    return;
  }

  // Get leaderboard before closing
  console.log("\n=== Current Leaderboard ===");
  const leaderboard = await grabli.getLeaderboard(gameId);
  const players = leaderboard[0];
  const seconds = leaderboard[1];

  if (players.length === 0) {
    console.log("No players yet");
  } else {
    for (let i = 0; i < players.length; i++) {
      console.log(`${i + 1}. ${players[i]} - ${seconds[i].toString()} seconds`);
    }
  }

  // Confirm
  console.log("\n⚠️  This will force close the game and determine the winner NOW.");
  console.log("Proceeding in 3 seconds...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Force close the game
  console.log("\nClosing game...");
  const tx = await grabli.forceCloseGame(gameId);
  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Get game status after closing
  console.log("\n=== Final Game Status ===");
  const finalGameState = await grabli.getGameState(gameId);
  console.log("Prize Title:", finalGameState.prizeTitle);
  console.log("Finished:", finalGameState.finished);
  console.log("Winner:", finalGameState.winner);

  if (finalGameState.winner !== '0x0000000000000000000000000000000000000000') {
    // Get winner stats
    const winnerStats = await grabli.getPlayerStats(gameId, finalGameState.winner);
    console.log("Winner Total Time:", winnerStats.totalSeconds.toString(), "seconds");
    console.log("Winner Claims:", winnerStats.claimCount.toString());
  }

  console.log("\n✅ Game closed successfully!");
  console.log("View on BaseScan:");
  console.log(`https://sepolia.basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
