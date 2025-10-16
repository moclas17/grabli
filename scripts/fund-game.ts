import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
  const gameId = process.argv[2] || "0";

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  console.log("Funding game...");
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

  // Get game details first
  console.log("\nFetching game details...");
  const gameDetails = await grabli.getGameDetails(gameId);

  console.log("\n=== Game Details ===");
  console.log("Prize Token:", gameDetails.prizeToken);
  console.log("Prize Amount:", gameDetails.prizeAmount.toString());
  console.log("Start At:", gameDetails.startAt.toString());

  if (gameDetails.startAt > 0) {
    console.log("\n⚠️  Game already started!");
    return;
  }

  if (gameDetails.prizeToken === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠️  Game has no ERC20 prize token!");
    console.log("Cannot fund this game. It should have auto-started.");
    return;
  }

  // Get token contract
  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];

  const token = new ethers.Contract(gameDetails.prizeToken, ERC20_ABI, wallet);

  // Get token info
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const balance = await token.balanceOf(wallet.address);
  const allowance = await token.allowance(wallet.address, contractAddress);

  console.log("\n=== Token Info ===");
  console.log("Token Symbol:", symbol);
  console.log("Token Decimals:", decimals);
  console.log("Your Balance:", ethers.formatUnits(balance, decimals), symbol);
  console.log("Current Allowance:", ethers.formatUnits(allowance, decimals), symbol);
  console.log("Required Amount:", ethers.formatUnits(gameDetails.prizeAmount, decimals), symbol);

  // Check balance
  if (balance < gameDetails.prizeAmount) {
    throw new Error(`Insufficient balance! You have ${ethers.formatUnits(balance, decimals)} ${symbol}, but need ${ethers.formatUnits(gameDetails.prizeAmount, decimals)} ${symbol}`);
  }

  // Approve if needed
  if (allowance < gameDetails.prizeAmount) {
    console.log("\n🔓 Approving token spending...");
    const approveTx = await token.approve(contractAddress, gameDetails.prizeAmount);
    console.log("Approve transaction hash:", approveTx.hash);
    console.log("Waiting for confirmation...");
    await approveTx.wait();
    console.log("✅ Approval confirmed!");
  } else {
    console.log("\n✅ Token already approved");
  }

  // Fund game
  console.log("\n💰 Funding game...");
  const fundTx = await grabli.fundGame(gameId);
  console.log("Fund transaction hash:", fundTx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await fundTx.wait();
  console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

  // Get updated game state
  const gameState = await grabli.getGameState(gameId);
  console.log("\n=== Updated Game State ===");
  console.log("Start At:", gameState.startAt.toString(), new Date(Number(gameState.startAt) * 1000).toLocaleString());
  console.log("End At:", gameState.endAt.toString(), new Date(Number(gameState.endAt) * 1000).toLocaleString());
  console.log("\n🎮 Game is now LIVE!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
