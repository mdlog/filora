# Contract Revert Analysis - SysErrContractReverted

## 🔴 Error: SysErrContractReverted

**Status:** Contract function reverted after MetaMask confirmation  
**Contract:** AssetRegistry (`0x935f69f2A66FaF91004434aFc89f7180161db32d`)  
**Function:** `registerAsset(uint256 datasetId, uint256 providerId, string pieceCid, uint256 price)`

---

## 🔍 What is SysErrContractReverted?

`SysErrContractReverted` adalah error yang terjadi ketika:

1. ✅ Transaksi berhasil dikirim ke blockchain
2. ✅ Gas fee cukup dan dibayar
3. ✅ Signature valid dari wallet
4. ❌ **Contract function execution REVERTED**

Ini berarti ada **validation logic di dalam smart contract** yang gagal.

---

## 🎯 Kemungkinan Penyebab

### 1. Duplicate Asset Registration ⚠️ **MOST LIKELY**

**Kemungkinan Besar:** Contract tidak mengizinkan pendaftaran asset dengan `datasetId` dan `providerId` yang sama.

```solidity
// Possible contract logic:
function registerAsset(...) {
    require(!assetExists[datasetId][providerId], "Asset already registered");
    // ... rest of code
}
```

**Solusi:**
- Jangan register asset yang sudah pernah diupload
- Check apakah dataset sudah ada di registry sebelum register

---

### 2. Invalid Parameters

**Parameter yang bisa menyebabkan revert:**

#### a) DatasetId = 0 atau Invalid
```solidity
require(datasetId > 0, "Invalid dataset ID");
```

#### b) ProviderId = 0 atau Invalid
```solidity
require(providerId > 0, "Invalid provider ID");
```

#### c) PieceCid Empty atau Invalid Format
```solidity
require(bytes(pieceCid).length > 0, "Empty CID");
require(bytes(pieceCid).length < 256, "CID too long");
```

#### d) Price Negative (tidak mungkin karena uint256)
```solidity
// uint256 tidak bisa negative, tapi bisa overflow
```

---

### 3. Access Control atau Owner Check

**Kemungkinan ada restriction:**

```solidity
// Contract mungkin punya owner-only restriction
require(msg.sender == owner, "Not authorized");

// Atau whitelist
require(isWhitelisted[msg.sender], "Not whitelisted");
```

**Note:** Dari dokumentasi, tidak disebutkan ada access control, tapi contract bisa saja diupdate.

---

### 4. Contract Paused

```solidity
bool public paused = false;

function registerAsset(...) {
    require(!paused, "Contract is paused");
    // ...
}
```

---

### 5. Gas Limit Issue

Meskipun gas fee dibayar, bisa jadi:
- Calculation di dalam contract terlalu complex
- String `pieceCid` terlalu panjang
- Storage operation melebihi gas limit

---

## 🔧 How to Debug

### Step 1: Check Transaction on Block Explorer

Buka transaksi yang gagal di Filecoin Calibration Explorer:

```
https://calibration.filfox.info/en/message/[TX_HASH]
```

Cari:
1. **Revert Reason** - Jika ada message error
2. **Gas Used** - Bandingkan dengan gas limit
3. **Input Data** - Verifikasi parameter yang dikirim

---

### Step 2: Check Console Logs

Buka Browser Console (F12) dan cari:

```javascript
// Log sebelum register
Registering asset with params: {
  datasetId: 20,
  providerId: 2,
  pieceCid: "bafkz...",
  price: "1300000000000000000",
  retryAttempt: 0
}

// Error log
❌ Failed to register asset: ContractFunctionExecutionError
  Details: execution reverted
  Contract: 0x935f69f2A66FaF91004434aFc89f7180161db32d
```

---

### Step 3: Verify Parameters

**Check Parameter Values:**

```typescript
// Should NOT be:
datasetId: 0          ❌
providerId: 0         ❌
pieceCid: ""          ❌
pieceCid: "undefined" ❌
price: negative       ❌ (impossible with uint256)

// Should BE:
datasetId: > 0        ✅ (e.g., 20)
providerId: > 0       ✅ (e.g., 2)
pieceCid: "bafk..."   ✅ (valid CID)
price: >= 0           ✅ (e.g., "1300000000000000000")
```

---

### Step 4: Check if Asset Already Registered

**Query contract untuk check existing assets:**

```typescript
import { useGetActiveAssets } from "@/hooks/useAssetRegistry";

const { data: assets } = useGetActiveAssets();

// Check if datasetId already exists
const alreadyExists = assets?.some(
  asset => asset.datasetId === yourDatasetId && 
           asset.providerId === yourProviderId
);

if (alreadyExists) {
  console.error("⚠️ Asset already registered!");
}
```

---

## ✅ Solution: Add Duplicate Check

### Fix 1: Check Before Register

Update `useFileUpload.ts` to check for duplicates:

```typescript
import { useGetActiveAssets } from "@/hooks/useAssetRegistry";

export const useFileUpload = () => {
  const { data: existingAssets } = useGetActiveAssets();
  
  // ... inside mutation function
  
  // Register asset in registry contract
  setStatus("📝 Registering asset in marketplace...");
  const userDatasets = await synapse.storage.findDataSets(address);
  
  if (userDatasets.length > 0) {
    const dataset = userDatasets[0];
    const priceValue = price || "0";
    
    // ✅ CHECK FOR DUPLICATE
    const isDuplicate = existingAssets?.some(
      asset => asset.datasetId === dataset.pdpVerifierDataSetId && 
               asset.providerId === dataset.providerId
    );
    
    if (isDuplicate) {
      console.log("⚠️ Asset already registered, skipping registration...");
      setStatus("✅ Asset already in marketplace");
      return { pieceCid: pieceCid.toV1().toString() };
    }
    
    // Proceed with registration
    const txHash = await registerAsset(
      dataset.pdpVerifierDataSetId,
      dataset.providerId,
      pieceCid.toV1().toString(),
      priceValue
    );
    setStatus("⏳ Waiting for registry transaction confirmation...");
    return { txHash, pieceCid: pieceCid.toV1().toString() };
  }
  
  return { pieceCid: pieceCid.toV1().toString() };
};
```

---

### Fix 2: Enhanced Error Handling

Update `useAssetRegistry.ts` to detect duplicate errors:

```typescript
catch (error: any) {
  console.error("❌ Failed to register asset:", error);
  
  // Check for duplicate/already registered error
  if (error.message?.includes("already registered") || 
      error.message?.includes("duplicate") ||
      error.message?.includes("exists")) {
    throw new Error(
      "⚠️ This asset is already registered in the marketplace.\n" +
      "You can view it in the Marketplace or My Assets tab."
    );
  }
  
  // Check for invalid parameter errors
  if (error.message?.includes("Invalid dataset") || 
      error.message?.includes("Invalid provider")) {
    throw new Error(
      "❌ Invalid dataset or provider ID.\n" +
      "Please ensure the file was uploaded successfully to Filecoin."
    );
  }
  
  // ... rest of error handling
}
```

---

## 🧪 Testing Strategy

### Test 1: Fresh Upload
```
1. Upload NEW file that hasn't been registered
2. Should succeed ✅
```

### Test 2: Re-upload Same File
```
1. Upload file that's already registered
2. Should skip registration ✅
3. Show "Asset already in marketplace" ✅
```

### Test 3: Invalid Parameters
```
1. Mock datasetId = 0
2. Should show "Invalid dataset" error ✅
```

---

## 🔍 Debug Checklist

Saat error terjadi, check:

- [ ] DatasetId > 0?
- [ ] ProviderId > 0?
- [ ] PieceCid tidak empty?
- [ ] PieceCid format valid (starts with "bafk" atau "bafy")?
- [ ] Asset belum pernah diregister sebelumnya?
- [ ] Wallet connected ke Calibration network (314159)?
- [ ] Ada cukup tFIL untuk gas?
- [ ] Contract address benar (0x935f...)?
- [ ] Transaction hash ada di block explorer?

---

## 📊 Common Scenarios

### Scenario 1: Duplicate Registration
```
User Action: Upload file kedua kali
Result: ❌ SysErrContractReverted
Reason: Asset with same datasetId+providerId already exists
Solution: Skip registration, show success message
```

### Scenario 2: Upload Failed but Trying to Register
```
User Action: Network interrupted during upload
Result: ❌ SysErrContractReverted  
Reason: datasetId = 0 (upload incomplete)
Solution: Ensure upload completes before registration
```

### Scenario 3: Invalid CID Format
```
User Action: Corrupt or invalid file upload
Result: ❌ SysErrContractReverted
Reason: pieceCid validation failed in contract
Solution: Validate CID format before registration
```

---

## 🛠️ Temporary Workaround

Jika Anda stuck dan perlu upload segera:

### Option 1: Skip Registry Registration

Comment out registry registration temporarily:

```typescript
// Register asset in registry contract
// setStatus("📝 Registering asset in marketplace...");
// const txHash = await registerAsset(...);

// Skip directly to success
setStatus("✅ File uploaded to Filecoin successfully!");
return { pieceCid: pieceCid.toV1().toString() };
```

**Note:** Asset tidak akan muncul di marketplace untuk user lain, tapi tetap tersimpan di Filecoin.

---

### Option 2: Manual Registration Later

Buat manual registration tool:

```typescript
// Manual registry registration hook
export const useManualRegister = () => {
  const { registerAsset } = useAssetRegistry();
  
  const manualRegister = async (
    datasetId: number,
    providerId: number, 
    pieceCid: string,
    price: string
  ) => {
    try {
      const hash = await registerAsset(datasetId, providerId, pieceCid, price);
      console.log("✅ Manually registered:", hash);
      return hash;
    } catch (error) {
      console.error("❌ Manual registration failed:", error);
      throw error;
    }
  };
  
  return { manualRegister };
};
```

---

## 📝 Next Steps

1. **Implement duplicate check** (Fix 1) - HIGH PRIORITY
2. **Enhanced error messages** (Fix 2) - MEDIUM PRIORITY  
3. **Check transaction on block explorer** - Get actual revert reason
4. **Contact contract deployer** - If issue persists, contract might need update

---

## 🔗 Useful Links

- **Contract Address:** `0x935f69f2A66FaF91004434aFc89f7180161db32d`
- **Block Explorer:** https://calibration.filfox.info/en/address/0x935f69f2A66FaF91004434aFc89f7180161db32d
- **Deployer Address:** `0x4C6165286739696849Fb3e77A16b0639D762c5B6`

---

## 💡 Prevention Tips

1. **Always check for duplicates** before registering
2. **Validate parameters** before sending transaction
3. **Handle errors gracefully** with user-friendly messages
4. **Log all parameters** for debugging
5. **Test with small files** first

---

**Status:** 🔍 INVESTIGATING  
**Priority:** 🔴 HIGH  
**Date:** October 2025

