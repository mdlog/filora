# 📤 Upload Asset Integration with Smart Contracts

## Overview

Form upload asset sekarang terintegrasi penuh dengan smart contracts untuk menyimpan metadata dan mengatur royalty on-chain.

## ✅ Fitur yang Ditambahkan

### 1. **Royalty Percentage Field**
- Input field untuk set royalty percentage (0-100%)
- Default: 10%
- Disimpan on-chain via FilecoinPay contract

### 2. **Automatic Royalty Setup**
- Setelah upload file berhasil
- Otomatis call `setRoyalty()` di FilecoinPay contract
- Set creator address dan royalty percentage

### 3. **Enhanced Upload Info**
- Menampilkan asset name
- Menampilkan price
- Menampilkan royalty percentage
- Menampilkan dataset ID
- Status royalty setup

## 🔄 Upload Flow

### Before (Tanpa Smart Contract):
```
1. User select file
2. User input metadata (name, description, price)
3. Upload to Filecoin
4. Done ✅
```

### After (Dengan Smart Contract):
```
1. User select file
2. User input metadata:
   - Name
   - Description
   - Price (USDFC)
   - Royalty Percentage (%)
3. Upload to Filecoin
4. Get dataset ID
5. Call setRoyalty() on FilecoinPay contract
   - tokenId: dataset ID
   - creator: user address
   - percentage: royalty in basis points
6. Wait for transaction confirmation
7. Done ✅
```

## 📝 Form Fields

### Asset Name
```typescript
type: string
required: false
purpose: Display name untuk asset
```

### Description
```typescript
type: string (textarea)
required: false
purpose: Deskripsi detail asset
```

### Price (USDFC)
```typescript
type: number
required: false
default: 0
min: 0
step: 0.01
purpose: Harga jual asset dalam USDFC
```

### Royalty Percentage
```typescript
type: number
required: false
default: 10
min: 0
max: 100
step: 1
purpose: Persentase royalty untuk creator (0-100%)
note: Dikonversi ke basis points (x100) untuk smart contract
```

## 🔧 Technical Implementation

### Smart Contract Integration

```typescript
// Set royalty on FilecoinPay contract
const royaltyBps = Math.floor(parseFloat(royaltyPercentage) * 100);
writeContract({
  address: CONTRACT_ADDRESSES.FilecoinPay,
  abi: FILECOIN_PAY_ABI,
  functionName: 'setRoyalty',
  args: [
    BigInt(datasetId),      // tokenId
    address,                 // creator address
    BigInt(royaltyBps)      // percentage in basis points
  ],
});
```

### Basis Points Conversion

Royalty percentage dikonversi ke basis points untuk presisi:
- 1% = 100 basis points
- 10% = 1000 basis points
- 100% = 10000 basis points

Example:
```typescript
Input: 10%
Calculation: 10 * 100 = 1000 basis points
On-chain: 1000
```

## 💡 User Experience

### Upload Success Display

Setelah upload berhasil, user melihat:

```
✅ Upload Successful!

Asset Name: My Digital Art
Price: 25 USDFC
Royalty: 10%
File size: 1,234,567 bytes
Piece CID: bafk...
Tx Hash: 0x...
Dataset ID: #42

⏳ Setting royalty on-chain...
✅ Royalty set successfully!
```

### Validation

- **Wallet Connection**: Required untuk upload
- **File Selection**: Required
- **Metadata**: Optional (dapat diisi nanti)
- **Royalty**: Optional (default 10%)

## 🎯 Benefits

### For Creators:
- ✅ Automatic royalty setup
- ✅ Earn from secondary sales
- ✅ Configurable royalty percentage
- ✅ On-chain verification

### For Buyers:
- ✅ Transparent royalty info
- ✅ Automatic royalty distribution
- ✅ Support creators directly
- ✅ Fair pricing

## 🔍 Verification

### Check Royalty On-Chain

```typescript
import { useRoyaltyInfo } from "@/hooks/useRoyaltyInfo";

const { creator, percentage } = useRoyaltyInfo(datasetId);
console.log("Creator:", creator);
console.log("Royalty:", Number(percentage) / 100, "%");
```

### Check in Purchase Flow

When buying asset:
1. Price breakdown shows royalty amount
2. Royalty automatically sent to creator
3. Seller receives price minus royalty

## 📊 Example Scenarios

### Scenario 1: Upload with 10% Royalty
```
Upload: Digital Art
Price: 100 USDFC
Royalty: 10%

First Sale:
- Buyer pays: 100 USDFC
- Creator gets: 100 USDFC

Secondary Sale:
- Buyer pays: 100 USDFC
- Creator gets: 10 USDFC (royalty)
- Seller gets: 90 USDFC
```

### Scenario 2: Upload with 0% Royalty
```
Upload: Public Domain Image
Price: 50 USDFC
Royalty: 0%

All Sales:
- Buyer pays: 50 USDFC
- Seller gets: 50 USDFC
- Creator gets: 0 USDFC (no royalty)
```

### Scenario 3: Upload with 25% Royalty
```
Upload: Exclusive Music
Price: 200 USDFC
Royalty: 25%

Secondary Sale:
- Buyer pays: 200 USDFC
- Creator gets: 50 USDFC (royalty)
- Seller gets: 150 USDFC
```

## 🛠️ Troubleshooting

### Issue: Royalty not set
**Solution:**
- Check wallet is connected
- Verify contract addresses are correct
- Ensure sufficient tFIL for gas
- Check transaction on block explorer

### Issue: Upload succeeds but royalty fails
**Solution:**
- Royalty setup is separate transaction
- Can be set manually later
- Check console for error messages
- Retry royalty setup

### Issue: Wrong royalty percentage
**Solution:**
- Royalty can be updated by contract owner
- Contact support to update
- Or re-upload asset with correct percentage

## 📚 Related Documentation

- [DEPLOYED_CONTRACTS.md](./DEPLOYED_CONTRACTS.md) - Contract addresses
- [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) - Contract details
- [contracts/abis.ts](./contracts/abis.ts) - Contract ABIs

---

**Last Updated:** January 2025  
**Status:** ✅ Fully Integrated  
**Version:** 1.0
