# Smart Contract Integration Guide

## ✅ Deployment Status

**IMPORTANT:** Smart contracts are **SUCCESSFULLY DEPLOYED** to Filecoin Calibration testnet.

All contracts are live and operational:
- ✅ FiloraLicense1155 (ERC-1155 NFT) - `0x0a609046e6cd45C5408f3e283003B4bcB9050C6F`
- ✅ FilecoinPay (Payment Processing) - `0xa4118fB7de0666ca38b4e2630204D0a49e486037`
- ✅ LicenseVerifier (License Management) - `0x25f2133C8A11abB2B9CB72184f88CDF31b353E85`
- ✅ AssetRegistry (Marketplace Registry) - `0x935f69f2A66FaF91004434aFc89f7180161db32d`
- ✅ USDFC Token - `0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0`

## Current Functionality

**All Features Are Now Active:**
- ✅ Browse marketplace assets
- ✅ Upload files to Filecoin via Synapse SDK
- ✅ View asset details with pricing
- ✅ Preview via Filbeam CDN
- ✅ Download assets
- ✅ Storage management
- ✅ USDFC balance checking
- ✅ NFT minting for digital assets
- ✅ Asset purchasing with royalties
- ✅ License verification
- ✅ Royalty withdrawal

## Contracts

### 1. FiloraLicense1155 (ERC-1155 NFT)
**Status:** ✅ DEPLOYED  
**Address:** `0x0a609046e6cd45C5408f3e283003B4bcB9050C6F`

**Features:**
- Mint NFT licenses for digital assets
- Batch minting support
- URI management for metadata
- Transfer and approval functionality

**Usage:**
```typescript
import { useNFTMint } from "@/hooks/useNFTMint";

const { mutateAsync: mintNFT } = useNFTMint();
await mintNFT({ tokenId: 1, amount: 1 });
```

### 2. FilecoinPay (Payment Processing)
**Status:** ✅ DEPLOYED  
**Address:** `0xa4118fB7de0666ca38b4e2630204D0a49e486037`

**Features:**
- Process USDFC payments
- Automatic royalty distribution
- Royalty percentage management
- Creator earnings withdrawal

**Usage:**
```typescript
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";

const { processPayment } = usePaymentProcessing();
await processPayment.mutateAsync({
  to: sellerAddress,
  amount: "10.0",
  tokenId: 1
});
```

### 3. LicenseVerifier (License Management)
**Status:** ✅ DEPLOYED  
**Address:** `0x25f2133C8A11abB2B9CB72184f88CDF31b353E85`

**Features:**
- Verify license ownership
- Check license expiry
- Grant/revoke licenses
- Active license validation

**Usage:**
```typescript
import { useLicenseVerification } from "@/hooks/useLicenseVerification";

const { hasLicense, isActive, expiry } = useLicenseVerification(tokenId);
```

## Contract Deployment

### Prerequisites
- Filecoin Calibration testnet RPC
- Deployer wallet with tFIL
- Hardhat or Foundry setup

### Deploy Commands
```bash
# Deploy FiloraLicense1155
npx hardhat run scripts/deploy-license.ts --network calibration

# Deploy FilecoinPay
npx hardhat run scripts/deploy-payment.ts --network calibration

# Deploy LicenseVerifier
npx hardhat run scripts/deploy-verifier.ts --network calibration
```

### Update Addresses
After deployment, update contract addresses in `contracts/addresses.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  FiloraLicense1155: "0x0a609046e6cd45C5408f3e283003B4bcB9050C6F",
  FilecoinPay: "0xa4118fB7de0666ca38b4e2630204D0a49e486037",
  LicenseVerifier: "0x25f2133C8A11abB2B9CB72184f88CDF31b353E85",
  AssetRegistry: "0x935f69f2A66FaF91004434aFc89f7180161db32d",
  USDFC: "0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0",
};
```

### Verify Deployment
Check if contracts are deployed:
```typescript
import { isContractsDeployed } from "@/contracts/addresses";

if (isContractsDeployed()) {
  // All contracts deployed, full functionality available
} else {
  // Contracts not deployed, limited functionality
}
```

## Features Implemented

### ✅ NFT Minting
- UI modal for minting NFT licenses
- Integration with ERC-1155 contract
- Batch minting support
- Metadata URI management

### ✅ Payment Processing
- USDFC token approval flow
- Secure payment processing
- Transaction confirmation
- Error handling

### ✅ License Verification
- Real-time license checking
- Visual badge indicators
- Expiry date display
- Active status validation

### ✅ Royalty Distribution
- Automatic creator royalties
- Configurable royalty percentages
- Withdrawal interface
- Earnings tracking

### ✅ Smart Contract Automation
- On-chain royalty calculation
- Automatic payment splitting
- Event emission for tracking
- Gas-optimized operations

## UI Components

### NFTMintModal
Location: `components/marketplace/NFTMintModal.tsx`
- Mint NFT licenses for assets
- Configure mint amount
- Transaction status feedback

### PurchaseModal
Location: `components/marketplace/PurchaseModal.tsx`
- Purchase assets with USDFC
- Display royalty breakdown
- Automatic payment processing

### LicenseVerificationBadge
Location: `components/marketplace/LicenseVerificationBadge.tsx`
- Show license status
- Display expiry information
- Visual indicators

### RoyaltyManager
Location: `components/marketplace/RoyaltyManager.tsx`
- View available royalties
- Withdraw earnings
- Transaction history

## Hooks

### useNFTMint
Mint ERC-1155 NFT licenses

### usePaymentProcessing
Process USDFC payments with royalty distribution

### useLicenseVerification
Verify and check license status

### useRoyaltyInfo
Get royalty information for tokens

## Testing

### Test on Calibration Testnet
1. Get tFIL from [faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
2. Get USDFC from [faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)
3. Connect wallet to Filecoin Calibration
4. Test minting, purchasing, and royalty features

## Security Considerations

- All contracts should be audited before mainnet deployment
- Use OpenZeppelin contracts for standard implementations
- Implement access control for admin functions
- Add reentrancy guards for payment functions
- Validate all user inputs
- Emit events for all state changes

## Future Enhancements

- [ ] Multi-signature wallet support
- [ ] Auction functionality
- [ ] Fractional ownership
- [ ] Staking mechanisms
- [ ] Governance features
- [ ] Cross-chain bridging

## Support

For contract deployment assistance or integration questions, refer to:
- [Filecoin Documentation](https://docs.filecoin.io)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/docs)
