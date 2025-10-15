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

  console.log("Creating a new game...");
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

  // Game parameters
  const prizeTitle = process.env.PRIZE_TITLE || "Prize Pool";
  const prizeValue = process.env.PRIZE_VALUE || "1";
  const prizeCurrency = process.env.PRIZE_CURRENCY || "USD";
  const prizeDescription = process.env.PRIZE_DESCRIPTION || "Winner takes all!";
  const sponsorName = process.env.SPONSOR_NAME || "Acme Corp";
  const sponsorUrl = process.env.SPONSOR_URL || "https://acme.example";
  const sponsorLogo = process.env.SPONSOR_LOGO || "/sponsor-logo.png";
  const duration = process.env.GAME_DURATION || "86400"; // 24 hours default
  const claimCooldown = process.env.CLAIM_COOLDOWN || "10"; // 10 seconds default

  console.log("\n=== Game Parameters ===");
  console.log("Prize Title:", prizeTitle);
  console.log("Prize Value:", prizeValue, prizeCurrency);
  console.log("Prize Description:", prizeDescription);
  console.log("Sponsor:", sponsorName);
  console.log("Duration:", duration, "seconds (", Number(duration) / 3600, "hours)");
  console.log("Claim Cooldown:", claimCooldown, "seconds");

  // Create game
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

  console.log("\nTransaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Get game ID from event
  const gameCreatedEvent = receipt?.logs.find((log: any) => {
    try {
      const parsed = grabli.interface.parseLog(log);
      return parsed?.name === "GameCreated";
    } catch {
      return false;
    }
  });

  if (gameCreatedEvent) {
    const parsed = grabli.interface.parseLog(gameCreatedEvent);
    const gameId = parsed?.args[0];
    console.log("\n✅ Game created successfully!");
    console.log("Game ID:", gameId.toString());

    // Get game details
    const gameState = await grabli.getGameState(gameId);
    console.log("\n=== Game State ===");
    console.log("Prize Title:", gameState.prizeTitle);
    console.log("Start Time:", new Date(Number(gameState.startAt) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(gameState.endAt) * 1000).toLocaleString());
    console.log("Current Holder:", gameState.holder);
    console.log("Finished:", gameState.finished);

    console.log("\n=== Update Frontend ===");
    console.log("Add to .env:");
    console.log(`NEXT_PUBLIC_CURRENT_GAME_ID=${gameId}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
