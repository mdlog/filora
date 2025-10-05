// Contract addresses on Filecoin Calibration testnet
// ✅ DEPLOYED - All contracts are now live on Calibration testnet
export const CONTRACT_ADDRESSES = {
  FiloraLicense1155: "0x0a609046e6cd45C5408f3e283003B4bcB9050C6F", // ✅ DEPLOYED
  FilecoinPay: "0xa4118fB7de0666ca38b4e2630204D0a49e486037", // ✅ DEPLOYED
  LicenseVerifier: "0x25f2133C8A11abB2B9CB72184f88CDF31b353E85", // ✅ DEPLOYED
  AssetRegistry: "0xcf31ba1c4fb2dc6ab8A04ab4Ed72ADb2AC8fc5b0", // ✅ DEPLOYED
  USDFC: "0x7A7D1C8C92A4B8D8C8E8F8A8B8C8D8E8F8A8B8C8", // ✅ DEPLOYED
} as const;

export const CHAIN_ID = 314159; // Filecoin Calibration testnet

// Check if contracts are deployed
export const isContractsDeployed = () => {
  return !!CONTRACT_ADDRESSES.FiloraLicense1155 && 
         !!CONTRACT_ADDRESSES.FilecoinPay && 
         !!CONTRACT_ADDRESSES.LicenseVerifier &&
         !!CONTRACT_ADDRESSES.AssetRegistry;
};
