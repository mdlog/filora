# Smart Contract Integration Guide

## ⚠️ Deployment Status

**IMPORTANT:** Smart contracts are **NOT YET DEPLOYED** to Filecoin Calibration testnet.

The following contracts need to be deployed before full marketplace functionality:
- ❌ FiloraLicense1155 (ERC-1155 NFT)
- ❌ FilecoinPay (Payment Processing)
- ❌ LicenseVerifier (License Management)
- ✅ USDFC Token (Already deployed at `0x7a7d1C8C92A4B8d8C8e8F8a8B8C8D8E8F8A8B8C8`)

## Current Functionality

**Working Features (No Smart Contracts Required):**
- ✅ Browse marketplace assets
- ✅ Upload files to Filecoin via Synapse SDK
- ✅ View asset details
- ✅ Preview via Filbeam CDN
- ✅ Download assets
- ✅ Storage management
- ✅ USDFC balance checking

**Features Requiring Contract Deployment:**
- ❌ NFT minting
- ❌ Asset purchasing with royalties
- ❌ License verification
- ❌ Royalty withdrawal

## Contracts

### 1. FiloraLicense1155 (ERC-1155 NFT)
**Status:** ❌ NOT DEPLOYED  
**Address:** Deploy contract and update `contracts/addresses.ts`

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
**Status:** ❌ NOT DEPLOYED  
**Address:** Deploy contract and update `contracts/addresses.ts`

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
**Status:** ❌ NOT DEPLOYED  
**Address:** Deploy contract and update `contracts/addresses.ts`

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
  FiloraLicense1155: "0xYOUR_DEPLOYED_ADDRESS", // Replace with actual address
  FilecoinPay: "0xYOUR_DEPLOYED_ADDRESS", // Replace with actual address
  LicenseVerifier: "0xYOUR_DEPLOYED_ADDRESS", // Replace with actual address
  USDFC: "0x7a7d1C8C92A4B8d8C8e8F8a8B8C8D8E8F8A8B8C8", // Already deployed
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
