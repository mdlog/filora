const hre = require("hardhat");

async function main() {
  console.log("Deploying AssetRegistry contract...");

  const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");
  const registry = await AssetRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("✅ AssetRegistry deployed to:", address);
  console.log("\nAdd this to contracts/addresses.ts:");
  console.log(`export const ASSET_REGISTRY_ADDRESS = "${address}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
