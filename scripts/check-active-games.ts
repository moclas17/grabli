import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  console.log("=".repeat(60));
  console.log("Checking Active Games");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);

  // Setup provider
  const rpcUrl = "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Load contract ABI
  const artifactPath = join(process.cwd(), "artifacts/contracts/Grabli.sol/Grabli.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

  // Get contract instance
  const grabli = new ethers.Contract(contractAddress, artifact.abi, provider);

  // Check gameCount
  console.log("\n" + "=".repeat(60));
  console.log("Contract State");
  console.log("=".repeat(60));
  const gameCount = await grabli.gameCount();
  console.log("Total Games Created:", gameCount.toString());

  // Check active games
  console.log("\n" + "=".repeat(60));
  console.log("Active Games");
  console.log("=".repeat(60));

  try {
    const activeGames = await grabli.getActiveGames();
    console.log("Active Game IDs:", activeGames.map((id: bigint) => id.toString()));
    console.log("Count:", activeGames.length);

    if (activeGames.length > 0) {
      for (const gameId of activeGames) {
        console.log("\n" + "-".repeat(60));
        console.log(`Game #${gameId.toString()} Details:`);
        const gameState = await grabli.getGameState(gameId);
        console.log("  Prize Title:", gameState.prizeTitle);
        console.log("  Holder:", gameState.holder);
        console.log("  Finished:", gameState.finished);
        console.log("  Start Time:", new Date(Number(gameState.startAt) * 1000).toLocaleString());
        console.log("  End Time:", new Date(Number(gameState.endAt) * 1000).toLocaleString());

        const gameDetails = await grabli.getGameDetails(gameId);
        console.log("  Sponsor:", gameDetails.sponsorName);
      }
    } else {
      console.log("❌ No active games found");
    }
  } catch (error: any) {
    console.error("❌ Error calling getActiveGames():");
    console.error(error.message);
  }

  // Check all games individually
  console.log("\n" + "=".repeat(60));
  console.log("All Games (Individual Check)");
  console.log("=".repeat(60));

  for (let i = 0; i < Number(gameCount); i++) {
    try {
      const gameState = await grabli.getGameState(i);
      console.log(`\nGame #${i}:`);
      console.log("  Title:", gameState.prizeTitle);
      console.log("  Finished:", gameState.finished);
      console.log("  End Time:", new Date(Number(gameState.endAt) * 1000).toLocaleString());
    } catch (error: any) {
      console.log(`\nGame #${i}: Error - ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
