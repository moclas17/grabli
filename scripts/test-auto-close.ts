import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

/**
 * Test script to verify that creating a new game automatically closes active games
 */
async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  console.log("Testing auto-close functionality...");
  console.log("Contract Address:", contractAddress);

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

  // Step 1: Check current active games
  console.log("\n=== Step 1: Check Active Games ===");
  const activeGamesBefore = await grabli.getActiveGames();
  console.log("Active games before:", activeGamesBefore.map((id: bigint) => id.toString()));

  if (activeGamesBefore.length > 0) {
    console.log("\nActive game details:");
    for (const gameId of activeGamesBefore) {
      const gameState = await grabli.getGameState(gameId);
      console.log(`\nGame ${gameId.toString()}:`);
      console.log("  Prize:", gameState.prizeTitle);
      console.log("  Holder:", gameState.holder);
      console.log("  Finished:", gameState.finished);
      console.log("  End Time:", new Date(Number(gameState.endAt) * 1000).toLocaleString());
    }
  } else {
    console.log("No active games found.");
  }

  // Step 2: Create a new game
  console.log("\n=== Step 2: Creating New Game ===");
  console.log("This should automatically close all active games...");

  const tx = await grabli.createGame(
    "Test Prize - Auto Close",
    "1",
    "USD",
    "Testing auto-close functionality",
    "Test Sponsor",
    "https://test.com",
    "/logo.png",
    86400, // 24 hours
    10 // 10 seconds cooldown
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Get new game ID from event
  const gameCreatedEvent = receipt?.logs.find((log: any) => {
    try {
      const parsed = grabli.interface.parseLog(log);
      return parsed?.name === "GameCreated";
    } catch {
      return false;
    }
  });

  let newGameId = null;
  if (gameCreatedEvent) {
    const parsed = grabli.interface.parseLog(gameCreatedEvent);
    newGameId = parsed?.args[0];
    console.log("New Game ID:", newGameId.toString());
  }

  // Step 3: Verify old games are closed and new game is active
  console.log("\n=== Step 3: Verify Results ===");

  if (activeGamesBefore.length > 0) {
    console.log("\nChecking previously active games (should now be finished):");
    for (const gameId of activeGamesBefore) {
      const gameState = await grabli.getGameState(gameId);
      console.log(`\nGame ${gameId.toString()}:`);
      console.log("  Prize:", gameState.prizeTitle);
      console.log("  Finished:", gameState.finished ? "✅ CLOSED" : "❌ STILL ACTIVE");
      if (gameState.finished) {
        console.log("  Winner:", gameState.winner);
      }
    }
  }

  // Check new active games
  const activeGamesAfter = await grabli.getActiveGames();
  console.log("\n=== Active Games After ===");
  console.log("Active games:", activeGamesAfter.map((id: bigint) => id.toString()));

  if (newGameId) {
    const newGameState = await grabli.getGameState(newGameId);
    console.log(`\nNew Game ${newGameId.toString()}:`);
    console.log("  Prize:", newGameState.prizeTitle);
    console.log("  Finished:", newGameState.finished ? "❌ Already finished" : "✅ Active");
    console.log("  Start:", new Date(Number(newGameState.startAt) * 1000).toLocaleString());
    console.log("  End:", new Date(Number(newGameState.endAt) * 1000).toLocaleString());
  }

  // Summary
  console.log("\n=== Test Summary ===");
  console.log(`Games closed: ${activeGamesBefore.length}`);
  console.log(`New active games: ${activeGamesAfter.length}`);
  console.log(`Expected: Only 1 active game (the new one)`);

  if (activeGamesAfter.length === 1) {
    console.log("✅ TEST PASSED: Only one active game exists!");
  } else {
    console.log(`❌ TEST FAILED: Expected 1 active game, but found ${activeGamesAfter.length}`);
  }

  console.log("\n📝 Update .env with:");
  console.log(`NEXT_PUBLIC_CURRENT_GAME_ID=${newGameId?.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
