import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

// Network configuration - Using Etherscan API v2 multichain
const NETWORKS = {
  base: {
    name: "Base Mainnet",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 8453,
    browserUrl: "https://basescan.org",
    envVar: "NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS",
  },
  baseSepolia: {
    name: "Base Sepolia",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 84532,
    browserUrl: "https://sepolia.basescan.org",
    envVar: "NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA",
  },
};

/**
 * Manual verification on BaseScan using API
 * Usage:
 *   npm run verify-basescan -- base 0xYourContractAddress
 *   npm run verify-basescan -- baseSepolia 0xYourContractAddress
 */
async function main() {
  // Get network and address from command line arguments
  const args = process.argv.slice(2);
  const networkName = args[0] || "baseSepolia";
  const contractAddressArg = args[1];

  const networkConfig = NETWORKS[networkName as keyof typeof NETWORKS];

  if (!networkConfig) {
    throw new Error(
      `Unknown network: ${networkName}. Available networks: ${Object.keys(NETWORKS).join(", ")}`
    );
  }

  // Contract address from argument or env variable
  const contractAddress = contractAddressArg || process.env[networkConfig.envVar];
  const apiKey = process.env.BASESCAN_API_KEY;

  if (!contractAddress) {
    throw new Error(
      `Contract address not provided. Either pass as argument or set ${networkConfig.envVar} in .env`
    );
  }

  if (!apiKey) {
    throw new Error("BASESCAN_API_KEY not set in .env");
  }

  console.log("=".repeat(60));
  console.log("Manual BaseScan Verification");
  console.log("=".repeat(60));
  console.log("Network:", networkConfig.name);
  console.log("Contract Address:", contractAddress);

  // Load contract source
  const sourceCode = readFileSync(
    join(process.cwd(), "contracts/Grabli.sol"),
    "utf-8"
  );

  // Load compiler metadata
  const artifactPath = join(
    process.cwd(),
    "artifacts/contracts/Grabli.sol/Grabli.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

  // Prepare verification payload (API v2 format)
  const params = new URLSearchParams({
    chainid: networkConfig.chainId.toString(),
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: "solidity-single-file",
    contractname: "Grabli",
    compilerversion: "v0.8.20+commit.a1b79de6", // Solidity 0.8.20
    optimizationUsed: "1",
    runs: "200",
    constructorArguements: "", // No constructor arguments
    evmversion: "shanghai",
    licenseType: "3", // MIT License
  });

  console.log("\nSending verification request...");

  try {
    const response = await fetch(networkConfig.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const result = await response.json();

    console.log("\n" + "=".repeat(60));
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));

    if (result.status === "1") {
      console.log("\n✅ Verification submitted successfully!");
      console.log("GUID:", result.result);
      console.log("\nYou can check the verification status at:");
      console.log(
        `${networkConfig.browserUrl}/address/${contractAddress}#code`
      );
      console.log("\nNote: Verification may take a few minutes to complete.");
    } else {
      console.log("\n❌ Verification failed:");
      console.log("Message:", result.result);

      if (result.result.includes("Already Verified")) {
        console.log("\n✅ Contract is already verified!");
        console.log(
          `View at: ${networkConfig.browserUrl}/address/${contractAddress}#code`
        );
      }
    }
  } catch (error) {
    console.error("\n❌ Error submitting verification:");
    console.error(error);
  }

  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
