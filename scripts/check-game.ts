import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
  const gameId = process.env.NEXT_PUBLIC_CURRENT_GAME_ID || "0";

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  console.log("Checking game status...");
  console.log("Contract Address:", contractAddress);
  console.log("Game ID:", gameId);

  // Setup provider
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Load contract ABI
  const artifactPath = join(process.cwd(), "artifacts/contracts/Grabli.sol/Grabli.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

  // Get contract instance
  const grabli = new ethers.Contract(contractAddress, artifact.abi, provider);

  console.log("\n=== Checking Game Count ===");
  const gameCount = await grabli.gameCount();
  console.log("Total games created:", gameCount.toString());

  if (Number(gameId) >= Number(gameCount)) {
    console.log("\n❌ ERROR: Game ID", gameId, "doesn't exist!");
    console.log("Valid Game IDs: 0 to", (Number(gameCount) - 1).toString());
    return;
  }

  console.log("\n=== Game State ===");
  try {
    const gameState = await grabli.getGameState(gameId);
    console.log("Prize Title:", gameState.prizeTitle);
    console.log("Prize Value:", gameState.prizeValue.toString());
    console.log("Prize Currency:", gameState.prizeCurrency);
    console.log("Sponsor:", gameState.sponsorName);
    console.log("Start Time:", new Date(Number(gameState.startAt) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(gameState.endAt) * 1000).toLocaleString());
    console.log("Current Holder:", gameState.holder);
    console.log("Finished:", gameState.finished);
    console.log("Winner:", gameState.winner);
  } catch (error) {
    console.error("Error getting game state:", error);
  }

  console.log("\n=== Game Details ===");
  try {
    const gameDetails = await grabli.getGameDetails(gameId);
    console.log("Prize Title:", gameDetails.prizeTitle);
    console.log("Prize Value:", gameDetails.prizeValue.toString());
    console.log("Prize Currency:", gameDetails.prizeCurrency);
    console.log("Prize Description:", gameDetails.prizeDescription);
    console.log("Sponsor Name:", gameDetails.sponsorName);
    console.log("Sponsor URL:", gameDetails.sponsorUrl);
    console.log("Sponsor Logo:", gameDetails.sponsorLogo);
    console.log("Start Time:", new Date(Number(gameDetails.startAt) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(gameDetails.endAt) * 1000).toLocaleString());
    console.log("Finished:", gameDetails.finished);
  } catch (error) {
    console.error("Error getting game details:", error);
  }

  console.log("\n=== Leaderboard ===");
  try {
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
  } catch (error) {
    console.error("Error getting leaderboard:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
