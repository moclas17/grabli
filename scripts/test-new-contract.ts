import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Test the newly deployed contract with auto-close functionality
 */
async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  console.log("=".repeat(60));
  console.log("Testing NEW Contract with Auto-Close Functionality");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);

  // Setup provider and wallet
  const rpcUrl = "https://sepolia.base.org";
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

  // Test 1: Check if getActiveGames() exists (new function)
  console.log("\n" + "=".repeat(60));
  console.log("TEST 1: Verify getActiveGames() function exists");
  console.log("=".repeat(60));
  try {
    const activeGames = await grabli.getActiveGames();
    console.log("✅ SUCCESS: getActiveGames() is available");
    console.log("Active games:", activeGames.map((id: bigint) => id.toString()));
    console.log("Count:", activeGames.length);
  } catch (error: any) {
    console.log("❌ FAILED: getActiveGames() not available");
    console.log("Error:", error.message);
    return;
  }

  // Test 2: Check gameCount
  console.log("\n" + "=".repeat(60));
  console.log("TEST 2: Check game count");
  console.log("=".repeat(60));
  const gameCount = await grabli.gameCount();
  console.log("Total games created:", gameCount.toString());

  // Test 3: Create first game (should not close any games)
  console.log("\n" + "=".repeat(60));
  console.log("TEST 3: Create first game (no games to close)");
  console.log("=".repeat(60));
  console.log("Creating game...");

  const tx1 = await grabli.createGame(
    "Test Game 1 - Auto Close Test",
    "100",
    "USD",
    "Testing that first game creates normally",
    "Test Sponsor 1",
    "https://test1.com",
    "/logo1.png",
    3600, // 1 hour
    10 // 10 seconds cooldown
  );

  console.log("Transaction hash:", tx1.hash);
  console.log("Waiting for confirmation...");
  const receipt1 = await tx1.wait();
  console.log("✅ Transaction confirmed in block:", receipt1?.blockNumber);

  // Get game ID from event
  const event1 = receipt1?.logs.find((log: any) => {
    try {
      const parsed = grabli.interface.parseLog(log);
      return parsed?.name === "GameCreated";
    } catch {
      return false;
    }
  });

  let gameId1 = null;
  if (event1) {
    const parsed = grabli.interface.parseLog(event1);
    gameId1 = parsed?.args[0];
    console.log("Game 1 created with ID:", gameId1.toString());
  }

  // Check active games
  const activeAfterFirst = await grabli.getActiveGames();
  console.log("Active games after first creation:", activeAfterFirst.map((id: bigint) => id.toString()));
  console.log("Expected: 1 active game ✅", activeAfterFirst.length === 1 ? "PASS" : "FAIL");

  // Test 4: Create second game (should auto-close first game)
  console.log("\n" + "=".repeat(60));
  console.log("TEST 4: Create second game (should close first game)");
  console.log("=".repeat(60));
  console.log("Creating second game...");
  console.log("This should automatically close Game 1");

  const tx2 = await grabli.createGame(
    "Test Game 2 - Auto Close Test",
    "200",
    "USD",
    "This should close Game 1 automatically",
    "Test Sponsor 2",
    "https://test2.com",
    "/logo2.png",
    3600, // 1 hour
    10 // 10 seconds cooldown
  );

  console.log("Transaction hash:", tx2.hash);
  console.log("Waiting for confirmation...");
  const receipt2 = await tx2.wait();
  console.log("✅ Transaction confirmed in block:", receipt2?.blockNumber);

  // Check for GameFinished event (Game 1 should be closed)
  const finishedEvent = receipt2?.logs.find((log: any) => {
    try {
      const parsed = grabli.interface.parseLog(log);
      return parsed?.name === "GameFinished";
    } catch {
      return false;
    }
  });

  if (finishedEvent) {
    const parsed = grabli.interface.parseLog(finishedEvent);
    console.log("✅ GameFinished event emitted!");
    console.log("  Closed Game ID:", parsed?.args[0].toString());
    console.log("  Winner:", parsed?.args[1]);
    console.log("  Total Seconds:", parsed?.args[2].toString());
  } else {
    console.log("⚠️  No GameFinished event found");
  }

  // Get game ID from GameCreated event
  const createdEvent = receipt2?.logs.find((log: any) => {
    try {
      const parsed = grabli.interface.parseLog(log);
      return parsed?.name === "GameCreated";
    } catch {
      return false;
    }
  });

  let gameId2 = null;
  if (createdEvent) {
    const parsed = grabli.interface.parseLog(createdEvent);
    gameId2 = parsed?.args[0];
    console.log("Game 2 created with ID:", gameId2.toString());
  }

  // Verify Game 1 is closed
  if (gameId1 !== null) {
    console.log("\n" + "-".repeat(60));
    console.log("Verifying Game 1 status:");
    const game1State = await grabli.getGameState(gameId1);
    console.log("  Prize:", game1State.prizeTitle);
    console.log("  Finished:", game1State.finished ? "✅ CLOSED" : "❌ STILL ACTIVE");
    console.log("  Winner:", game1State.winner);
  }

  // Check active games
  const activeAfterSecond = await grabli.getActiveGames();
  console.log("\n" + "-".repeat(60));
  console.log("Active games after second creation:", activeAfterSecond.map((id: bigint) => id.toString()));
  console.log("Expected: 1 active game (Game 2) ✅", activeAfterSecond.length === 1 ? "PASS" : "FAIL");

  if (gameId2 !== null) {
    console.log("\n" + "-".repeat(60));
    console.log("Verifying Game 2 status:");
    const game2State = await grabli.getGameState(gameId2);
    console.log("  Prize:", game2State.prizeTitle);
    console.log("  Finished:", game2State.finished ? "❌ Already finished" : "✅ ACTIVE");
  }

  // Final Summary
  console.log("\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));
  console.log("✅ getActiveGames() function works");
  console.log("✅ First game created successfully");
  console.log("✅ Second game created successfully");
  console.log(finishedEvent ? "✅ GameFinished event emitted" : "❌ GameFinished event NOT emitted");
  console.log(activeAfterSecond.length === 1 ? "✅ Only one game active" : `❌ ${activeAfterSecond.length} games active`);
  console.log("\n🎯 Auto-close functionality " + (finishedEvent && activeAfterSecond.length === 1 ? "VERIFIED ✅" : "FAILED ❌"));

  console.log("\n" + "=".repeat(60));
  console.log("Update .env with:");
  console.log(`NEXT_PUBLIC_CURRENT_GAME_ID=${gameId2?.toString()}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERROR:");
    console.error(error);
    process.exit(1);
  });
