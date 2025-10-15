import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function main() {
  console.log("Deploying Grabli contract...");

  // Setup provider and wallet
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying with account:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Load contract ABI and bytecode
  const artifactPath = join(process.cwd(), "artifacts/contracts/Grabli.sol/Grabli.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

  // Deploy contract
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log("\nDeploying contract...");

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Grabli deployed to:", address);

  // Wait for confirmations
  console.log("Waiting for block confirmations...");
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    await deployTx.wait(5);
  }

  const network = await provider.getNetwork();
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", address);
  console.log("Deployer:", wallet.address);
  console.log("Chain ID:", network.chainId.toString());

  console.log("\n=== Next Steps ===");
  console.log("1. Add contract address to .env:");
  console.log(`   NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=${address}`);
  console.log("\n2. Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
