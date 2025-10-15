import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

/**
 * Manual verification on BaseScan using API
 */
async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
  const apiKey = process.env.BASESCAN_API_KEY;

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  if (!apiKey) {
    throw new Error("BASESCAN_API_KEY not set in .env");
  }

  console.log("=".repeat(60));
  console.log("Manual BaseScan Verification");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network: Base Sepolia");

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

  // Prepare verification payload
  const params = new URLSearchParams({
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
    const response = await fetch("https://api-sepolia.basescan.org/api", {
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
        `https://sepolia.basescan.org/address/${contractAddress}#code`
      );
      console.log("\nNote: Verification may take a few minutes to complete.");
    } else {
      console.log("\n❌ Verification failed:");
      console.log("Message:", result.result);

      if (result.result.includes("Already Verified")) {
        console.log("\n✅ Contract is already verified!");
        console.log(
          `View at: https://sepolia.basescan.org/address/${contractAddress}#code`
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
