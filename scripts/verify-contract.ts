import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function verifyContract() {
  const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
  const apiKey = process.env.BASESCAN_API_KEY;
  const chainId = 84532; // Base Sepolia

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
  }

  if (!apiKey) {
    throw new Error("BASESCAN_API_KEY not set in .env");
  }

  console.log("Loading Standard JSON Input from Hardhat build...");

  // Load the exact Standard JSON Input that Hardhat used during compilation
  const buildInfoPath = join(
    process.cwd(),
    "artifacts/build-info/solc-0_8_20-2b800ef2d3859cd87ff22ad4cf4064d763276493.json"
  );
  const buildInfo = JSON.parse(readFileSync(buildInfoPath, "utf-8"));
  const standardJsonInput = buildInfo.input;

  console.log("Preparing verification request...");
  console.log("Contract Address:", contractAddress);
  console.log("Chain ID:", chainId);

  // Prepare the request body for API v2 with Standard JSON input
  const params = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: JSON.stringify(standardJsonInput),
    codeformat: "solidity-standard-json-input",
    contractname: "project/contracts/Grabli.sol:Grabli",
    compilerversion: "v0.8.20+commit.a1b79de6",
    constructorArguements: "",
    licenseType: "3", // MIT
  });

  console.log("\nSubmitting to BaseScan API v2...");

  const response = await fetch(
    `https://api.etherscan.io/v2/api?chainid=${chainId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  const result = await response.json();

  console.log("\n=== BaseScan Response ===");
  console.log(JSON.stringify(result, null, 2));

  if (result.status === "1") {
    console.log("\n✅ Verification submitted successfully!");
    console.log("GUID:", result.result);
    console.log("\nChecking status in 20 seconds...");

    // Wait and check status
    await new Promise(resolve => setTimeout(resolve, 20000));

    const statusParams = new URLSearchParams({
      apikey: apiKey,
      module: "contract",
      action: "checkverifystatus",
      guid: result.result,
    });

    const statusResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&${statusParams.toString()}`
    );
    const statusResult = await statusResponse.json();

    console.log("\n=== Verification Status ===");
    console.log(JSON.stringify(statusResult, null, 2));

    if (statusResult.status === "1") {
      console.log("\n✅ Contract verified successfully!");
      console.log("View on BaseScan:");
      console.log(`https://sepolia.basescan.org/address/${contractAddress}#code`);
    } else {
      console.log("\n⏳ Verification status:", statusResult.result);
      console.log("Check later at:");
      console.log(`https://sepolia.basescan.org/address/${contractAddress}#code`);
    }
  } else {
    console.log("\n❌ Verification submission failed!");
    console.log("Error:", result.result);
  }
}

verifyContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
