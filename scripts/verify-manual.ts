import hre from "hardhat";

async function main() {
  const contractAddress = "0x0F845905674451bCA3e1D165241de3076F2E5864";

  console.log("Verifying contract:", contractAddress);
  console.log("Network:", hre.network.name);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Error verifying contract:");
      console.error(error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
