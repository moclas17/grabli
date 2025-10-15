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

  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const artifactPath = join(process.cwd(), "artifacts/contracts/Grabli.sol/Grabli.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
  const contract = new ethers.Contract(
    contractAddress,
    artifact.abi,
    provider
  );

  console.log("Testing getGameDetails(1)...");
  const details = await contract.getGameDetails(1);
  console.log("\nRaw result:");
  console.log(details);

  console.log("\nParsed result:");
  console.log({
    prizeTitle: details[0],
    prizeValue: details[1].toString(),
    prizeCurrency: details[2],
    prizeDescription: details[3],
    sponsorName: details[4],
    sponsorUrl: details[5],
    sponsorLogo: details[6],
    startAt: details[7].toString(),
    endAt: details[8].toString(),
    finished: details[9],
  });
}

main().catch(console.error);
