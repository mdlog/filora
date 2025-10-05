const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Filora Smart Contracts to Filecoin Calibration...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // USDFC address on Calibration testnet (checksummed)
  const USDFC_ADDRESS = "0x7A7D1C8C92A4B8D8C8E8F8A8B8C8D8E8F8A8B8C8";

  // 1. Deploy FiloraLicense1155
  console.log("📝 Deploying FiloraLicense1155...");
  const FiloraLicense1155 = await hre.ethers.getContractFactory("FiloraLicense1155");
  const license = await FiloraLicense1155.deploy();
  await license.waitForDeployment();
  const licenseAddress = await license.getAddress();
  console.log("✅ FiloraLicense1155 deployed to:", licenseAddress, "\n");

  // 2. Deploy FilecoinPay
  console.log("📝 Deploying FilecoinPay...");
  const FilecoinPay = await hre.ethers.getContractFactory("FilecoinPay");
  const payment = await FilecoinPay.deploy(USDFC_ADDRESS);
  await payment.waitForDeployment();
  const paymentAddress = await payment.getAddress();
  console.log("✅ FilecoinPay deployed to:", paymentAddress, "\n");

  // 3. Deploy LicenseVerifier
  console.log("📝 Deploying LicenseVerifier...");
  const LicenseVerifier = await hre.ethers.getContractFactory("LicenseVerifier");
  const verifier = await LicenseVerifier.deploy(licenseAddress);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ LicenseVerifier deployed to:", verifierAddress, "\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📋 Contract Addresses:\n");
  console.log("FiloraLicense1155:", licenseAddress);
  console.log("FilecoinPay:", paymentAddress);
  console.log("LicenseVerifier:", verifierAddress);
  console.log("USDFC:", USDFC_ADDRESS);
  console.log("\n" + "=".repeat(60));
  console.log("\n📝 Update contracts/addresses.ts with these addresses:\n");
  console.log(`export const CONTRACT_ADDRESSES = {
  FiloraLicense1155: "${licenseAddress}",
  FilecoinPay: "${paymentAddress}",
  LicenseVerifier: "${verifierAddress}",
  USDFC: "${USDFC_ADDRESS}",
} as const;`);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
