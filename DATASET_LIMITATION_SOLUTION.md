# Dataset Limitation - Multiple Files Cannot Be Registered

## 🔴 **Critical Issue Explained**

### **The Problem:**

**AssetRegistry Contract Limitation:**
```solidity
mapping(uint256 => mapping(uint256 => uint256)) public datasetToAssetId;
// providerId => datasetId => assetId
```

**This means:**
- ✅ 1 dataset can have **multiple files** (multiple piece CIDs)
- ❌ But only **1 asset** can be registered per dataset in marketplace
- ❌ Contract uses `datasetId + providerId` as **unique key**
- ❌ Duplicate registration will **REVERT**

---

## 📊 **Your Specific Case**

### **What Happened:**

**First Upload (Previously):**
```
Upload File A → Dataset 20 created → PieceCID: xxx...
                      ↓
          Register to AssetRegistry ✅
                      ↓
          datasetToAssetId[2][20] = assetId_1
                      ↓
          Marketplace shows: File A with CID xxx
```

**Second Upload (Your Current):**
```
Upload File B → Dataset 20 (reused) → PieceCID: bafkzcibeyhjacc...
                      ↓
          Try to register? ❌
                      ↓
          datasetToAssetId[2][20] already exists!
                      ↓
          Contract will REVERT if we try
                      ↓
          System skips registration ⚠️
                      ↓
          Marketplace still shows: File A with CID xxx
          Your new file NOT visible in marketplace ❌
```

---

## 🎯 **Why This Happens**

### **Filecoin Dataset Behavior:**

When user uploads multiple files:
1. **First file** → Creates NEW dataset (e.g., Dataset 20)
2. **Second file** → Reuses SAME dataset (Dataset 20)
3. **Third file** → Reuses SAME dataset (Dataset 20)

**Result:**
- All files stored in Filecoin ✅
- Each file has different PieceCID ✅
- But all share Dataset ID 20 ⚠️

### **Registry Contract Behavior:**

```solidity
function registerAsset(uint256 datasetId, uint256 providerId, ...) {
    uint256 existingAssetId = datasetToAssetId[providerId][datasetId];
    if (existingAssetId > 0 && assets[existingAssetId - 1].isActive) {
        revert("Asset already registered"); // ← BLOCKS NEW FILES!
    }
    // ...
}
```

**Result:**
- Only FIRST file can be registered ✅
- All subsequent files BLOCKED ❌
- Marketplace only shows FIRST file ❌

---

## ✅ **Solution Implemented**

### **Enhanced Duplicate Detection**

**File:** `hooks/useFileUpload.ts`

**Before Fix:**
```typescript
// Old logic - Too simple
const isDuplicate = existingAssets?.some(
  asset =>
    asset.datasetId === dataset.pdpVerifierDataSetId &&
    asset.providerId === dataset.providerId &&
    asset.isActive
);

if (isDuplicate) {
  // ❌ Skip ALL files in this dataset
  console.log("Asset already registered, skipping...");
  return { pieceCid };
}
```

**After Fix:**
```typescript
// New logic - Check specific PieceCID
const existingAsset = existingAssets?.find(
  asset =>
    asset.datasetId === dataset.pdpVerifierDataSetId &&
    asset.providerId === dataset.providerId &&
    asset.isActive
);

if (existingAsset) {
  // Check if it's the SAME file
  if (existingAsset.pieceCid === currentPieceCid) {
    // ✅ Same file - safe to skip
    console.log("This exact piece already registered");
    return { pieceCid: currentPieceCid };
  } else {
    // ⚠️ DIFFERENT file - NEW upload!
    console.warn("⚠️ Different piece detected!");
    console.warn(`Existing PieceCID: ${existingAsset.pieceCid}`);
    console.warn(`New PieceCID: ${currentPieceCid}`);
    console.warn(`Contract only allows 1 asset per dataset.`);
    console.warn(`File uploaded but not added to marketplace.`);
    
    setStatus("⚠️ Dataset already has a registered asset.");
    return { 
      pieceCid: currentPieceCid,
      skippedReason: "dataset_already_registered",
      existingPieceCid: existingAsset.pieceCid
    };
  }
}
```

**Benefits:**
- ✅ Detect if file is **different** from registered one
- ✅ Show **clear warning** to user
- ✅ Log **both CIDs** for comparison
- ✅ File still **uploaded to Filecoin**
- ✅ User understands **why not in marketplace**

---

## 🔧 **Workarounds**

### **Option 1: Use Different Wallet (Easiest)**

**Each wallet creates separate datasets:**

```
Wallet A:
- Upload File 1 → Dataset 20 → Marketplace ✅
- Upload File 2 → Dataset 20 → Not in marketplace ❌

Wallet B:
- Upload File 1 → Dataset 15 → Marketplace ✅
- Upload File 2 → Dataset 15 → Not in marketplace ❌

Wallet C:
- Upload File 1 → Dataset 8 → Marketplace ✅
```

**How to:**
1. Connect different wallet
2. Upload file
3. New dataset created
4. Can register to marketplace

---

### **Option 2: Deactivate Old Asset (Advanced)**

**If you control the old asset:**

```
1. Call AssetRegistry.deactivateAsset(assetId)
2. Old asset becomes inactive
3. Upload new file
4. Register new file (will succeed now)
```

**Requirements:**
- Must be owner of old asset
- Need to interact with contract directly
- Know the assetId

**Contract Function:**
```solidity
function deactivateAsset(uint256 assetId) external {
    require(assets[assetId].owner == msg.sender, "Not asset owner");
    require(assets[assetId].isActive, "Asset already inactive");
    assets[assetId].isActive = false;
}
```

---

### **Option 3: Contract Upgrade (Long-term)**

**Issue with current contract:**
```solidity
// Current: Only 1 asset per dataset
mapping(uint256 => mapping(uint256 => uint256)) public datasetToAssetId;
```

**Better design:**
```solidity
// Better: Multiple assets per dataset, indexed by pieceCid
mapping(bytes32 => uint256) public pieceCidToAssetId;
// hash(pieceCid) => assetId

// Or: Array of assets per dataset
mapping(uint256 => mapping(uint256 => uint256[])) public datasetAssets;
// providerId => datasetId => [assetId1, assetId2, ...]
```

**Would allow:**
- ✅ Multiple files per dataset
- ✅ Each file registered separately
- ✅ All files visible in marketplace

**Note:** Requires contract redeployment and migration

---

## 📝 **Status Messages**

### **Scenario 1: Same File Re-uploaded**
```
Status: "✅ Asset already in marketplace!"
Logs:
- "⚠️ This exact piece already registered in marketplace, skipping..."
- "Dataset ID: 20, Provider ID: 2, PieceCID: bafkz..."

Action: None needed ✅
```

### **Scenario 2: Different File in Same Dataset**
```
Status: "⚠️ Dataset already has a registered asset. File uploaded but not added to marketplace."
Logs:
- "⚠️ Different piece detected!"
- "Existing PieceCID: xxx..."
- "New PieceCID: bafkzcibeyhjacc..."
- "Contract only allows 1 asset per dataset+provider combination."
- "Skipping registration to avoid revert. File is still uploaded to Filecoin."

Action Required: ⚠️
- File IS on Filecoin ✅
- File NOT in marketplace ❌
- Use workaround if marketplace visibility needed
```

### **Scenario 3: First File in New Dataset**
```
Status: "📝 Registering asset in marketplace..."
         "⏳ Waiting for registry confirmation..."
         "🎉 Asset registered in marketplace successfully!"

Action: None ✅ All working
```

---

## 🔍 **How to Identify Your Case**

### **Check Console Logs:**

**Case A: Same File (OK)**
```javascript
⚠️ This exact piece already registered in marketplace, skipping...
Dataset ID: 20, Provider ID: 2, PieceCID: bafkzcibeyhjacc...
```
→ File already in marketplace ✅

**Case B: Different File (LIMITED)**
```javascript
⚠️ Different piece detected!
Existing PieceCID: xxx...
New PieceCID: bafkzcibeyhjacc...
Dataset 20 already has a registered asset.
```
→ New file NOT in marketplace ❌

---

## 💡 **Recommendations**

### **For Single User:**

**Best Practice:**
1. Each new asset → Use new wallet OR wait for contract update
2. Keep track of which dataset has which file
3. Be aware of limitation

### **For Platform:**

**Short-term:**
- ✅ Current fix: Clear warnings implemented
- ✅ Users informed about limitation
- ✅ Files still stored safely

**Long-term:**
- 🔄 Consider contract upgrade
- 🔄 New design supporting multiple pieces
- 🔄 Migration path for existing assets

---

## 📊 **Comparison**

| Aspect | Current State | Ideal State |
|--------|---------------|-------------|
| Files per dataset | Many ✅ | Many ✅ |
| Registered assets per dataset | 1 ❌ | Many ✅ |
| Marketplace visibility | First file only ❌ | All files ✅ |
| Contract design | Dataset-based ❌ | Piece-based ✅ |
| User experience | Confusing ❌ | Clear ✅ |

---

## 🎯 **Your Specific Situation**

**Your File:**
```
PieceCID: bafkzcibeyhjacc7oio5gp4nrqxho3f6tx6hbzlok6o4i35gwrac6hegj5ausb2tqae
Dataset ID: 20
Provider ID: 2
Status: Uploaded to Filecoin ✅
        NOT in marketplace ❌
Reason: Dataset 20 already has a different file registered
```

**What You Can Do:**

1. **Check what's currently registered:**
   - Go to marketplace
   - Search for dataset ID: 20
   - You'll see a DIFFERENT PieceCID there
   
2. **If you want YOUR file in marketplace:**
   - Option A: Use different wallet
   - Option B: Deactivate old asset (if you own it)
   - Option C: Wait for contract upgrade

3. **Your file is still accessible:**
   - File is on Filecoin ✅
   - Can be downloaded via Filecoin ✅
   - Just not visible in marketplace UI ❌

---

## ✅ **Summary**

### **What We Fixed:**

1. ✅ **Better detection** - Now checks specific PieceCID
2. ✅ **Clear warnings** - User knows why it's not registered
3. ✅ **Detailed logs** - Shows both old and new CIDs
4. ✅ **File preservation** - Upload still succeeds

### **What Still Needs Work:**

1. ⚠️ **Contract limitation** - Only 1 asset per dataset
2. ⚠️ **Multiple files** - Can't register to marketplace
3. ⚠️ **User workaround** - Need different wallet or deactivate

### **Long-term Solution:**

1. 🔄 Contract redesign with piece-based indexing
2. 🔄 Migration tool for existing assets
3. 🔄 Better UX for multi-file datasets

---

**Status:** ✅ **ISSUE IDENTIFIED AND MITIGATED**  
**Priority:** 🔴 **HIGH** (Limitation affects user experience)  
**Solution:** Workarounds available, long-term fix needs contract upgrade  
**Date:** October 2025

