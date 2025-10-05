# AssetRegistry Deployment Guide

## Overview

AssetRegistry adalah smart contract yang menyimpan metadata semua asset digital yang diupload ke marketplace. Contract ini memungkinkan:

- ✅ Query efisien untuk semua asset di marketplace
- ✅ Tracking owner, dataset ID, provider ID, CID, dan price
- ✅ Real-time updates saat asset baru diupload
- ✅ Scalable untuk ribuan asset
- ✅ On-chain price storage untuk setiap asset

**Current Deployment:** `0x935f69f2A66FaF91004434aFc89f7180161db32d`

## Prerequisites

1. Node.js 18+ installed
2. Wallet dengan tFIL untuk gas fees
3. Private key wallet di `.env` file

## Deployment Steps

### 1. Setup Environment

```bash
cd solidity
cp .env.example .env
```

Edit `.env` dan tambahkan:
```
PRIVATE_KEY=your_private_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contract

```bash
npx hardhat compile
```

### 4. Deploy to Calibration Testnet

```bash
npx hardhat run scripts/deploy-registry.js --network calibration
```

Output akan menampilkan:
```
✅ AssetRegistry deployed to: 0x...
```

### 5. Update Contract Address

Copy address dari output dan update di `contracts/addresses.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // ... existing contracts
  AssetRegistry: "0x...", // Paste address here
  // ...
} as const;
```

### 6. Verify Deployment

Test contract dengan:

```bash
npx hardhat console --network calibration
```

Kemudian:
```javascript
const Registry = await ethers.getContractFactory("AssetRegistry");
const registry = await Registry.attach("YOUR_CONTRACT_ADDRESS");
const total = await registry.getTotalAssets();
console.log("Total assets:", total.toString());
```

## How It Works

### Upload Flow

1. User upload file via UI dengan metadata (name, description, price, royalty)
2. File disimpan ke Filecoin via Synapse SDK
3. **Otomatis register asset ke AssetRegistry contract dengan price**
4. Asset langsung muncul di marketplace untuk semua user dengan price

### Marketplace Flow

1. Marketplace query `getActiveAssets()` dari contract (termasuk price)
2. Display asset dengan gambar dari Filbeam CDN: `https://{owner}.calibration.filcdn.io/{CID}`
3. Show price dan metadata untuk setiap asset
4. Support pagination (15 items per page)
5. Filter by provider dan status (Live/Inactive)

## Contract Functions

### Write Functions

- `registerAsset(datasetId, providerId, pieceCid, price)` - Register asset baru dengan price
- `deactivateAsset(assetId)` - Nonaktifkan asset (owner only)

### Read Functions

- `getActiveAssets()` - Get semua active assets dengan price
- `getTotalAssets()` - Get total jumlah assets
- `getAssetsByOwner(address)` - Get assets by owner
- `getAsset(assetId)` - Get detail asset by ID

## Benefits

### Before Registry
- ❌ Brute force iteration 0-99 dataset IDs
- ❌ Slow dan tidak scalable
- ❌ Tidak bisa track semua user assets
- ❌ Banyak failed requests

### After Registry
- ✅ Direct query dari contract
- ✅ Fast dan efficient
- ✅ Semua user assets visible
- ✅ Real-time updates

## Gas Costs

- Deploy contract: ~0.001 tFIL
- Register asset with price: ~0.00015 tFIL per asset
- Query assets: FREE (read-only)

## Asset Data Structure

```solidity
struct Asset {
    address owner;        // Asset owner address
    uint256 datasetId;    // Filecoin dataset ID
    uint256 providerId;   // Storage provider ID
    string pieceCid;      // IPFS CID of the asset
    uint256 price;        // Price in wei (USDFC)
    uint256 timestamp;    // Upload timestamp
    bool isActive;        // Active status
}
```

## Troubleshooting

**Contract not deployed:**
- Check `.env` has correct PRIVATE_KEY
- Ensure wallet has tFIL for gas
- Verify network is calibration (314159)

**Assets not showing:**
- Verify contract address in `addresses.ts`
- Check browser console for errors
- Ensure wallet connected

**Registration fails:**
- Check gas balance
- Verify dataset exists
- Check contract address is correct

## Next Steps

1. Deploy contract
2. Update address in code
3. Upload test asset
4. Verify asset appears in marketplace
5. Share marketplace with other users

## Support

For issues:
- Check contract on [Calibration Explorer](https://calibration.filfox.info)
- Review transaction logs
- Check browser console errors
