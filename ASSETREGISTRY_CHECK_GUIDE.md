# AssetRegistry Contract Check Guide

## 🎯 **Tujuan**

Memastikan jumlah asset yang ditampilkan di marketplace sesuai dengan yang terdaftar di contract AssetRegistry.

---

## 📊 **Contract Info**

**Contract Address:** `0x935f69f2A66FaF91004434aFc89f7180161db32d`  
**Network:** Filecoin Calibration Testnet (Chain ID: 314159)  
**Explorer:** https://calibration.filfox.info/en/address/0x935f69f2A66FaF91004434aFc89f7180161db32d

---

## 🔍 **How to Check Contract Data**

### **Method 1: Browser Console (Easiest)**

1. **Open app:** http://localhost:3000
2. **Go to Marketplace tab**
3. **Open console** (F12)
4. **Look for these logs:**

```javascript
🔍 Raw AssetRegistry data: [...]
📊 AssetRegistry loading: false
✅ Total active assets from contract: X

Asset 0 from contract: {
  owner: "0x...",
  datasetId: 20,
  providerId: 1,
  pieceCid: "bafk...",
  price: 1500000000000000000,
  isActive: true
}

Asset 1 from contract: {...}
Asset 2 from contract: {...}
...
```

**Questions to Answer:**
- How many assets total in contract? (X)
- How many shown in marketplace? (should match)
- Is new asset (from 0x4C61...c5B6) in the list?

---

### **Method 2: Block Explorer**

1. **Go to:** https://calibration.filfox.info/en/address/0x935f69f2A66FaF91004434aFc89f7180161db32d
2. **Click "Contract" tab**
3. **Click "Read Contract"**
4. **Call `getActiveAssets()`**
5. **See all registered assets**

---

### **Method 3: Direct Contract Call (Browser Console)**

```javascript
// In browser console (F12)
import { readContract } from 'wagmi';

const checkAssets = async () => {
  const assets = await readContract({
    address: '0x935f69f2A66FaF91004434aFc89f7180161db32d',
    abi: AssetRegistryABI,
    functionName: 'getActiveAssets'
  });
  
  console.log("📊 Total assets in contract:", assets.length);
  console.table(assets.map(a => ({
    owner: a.owner,
    datasetId: Number(a.datasetId),
    providerId: Number(a.providerId),
    price: Number(a.price) / 1e18 + " USDFC",
    isActive: a.isActive
  })));
  
  // Filter by specific owner
  const userAssets = assets.filter(a => 
    a.owner === "0x4C6165286739696849Fb3e77A16b0639D762c5B6"
  );
  console.log("🔍 Assets for 0x4C61...c5B6:", userAssets.length);
  console.table(userAssets);
};

checkAssets();
```

---

## 📋 **Console Logs to Check**

### **Log 1: AssetRegistry Contract Data**

```javascript
🔍 Raw AssetRegistry data: Array(X)
📊 AssetRegistry loading: false
✅ Total active assets from contract: X
```

**What to check:**
- `X` = total assets in contract
- Should match or exceed marketplace display count

### **Log 2: Individual Assets**

```javascript
Asset 0 from contract: {
  owner: "0x4C6165286739696849Fb3e77A16b0639D762c5B6",
  datasetId: 20,
  providerId: 1,
  pieceCid: "bafk...",
  price: 1500000000000000000,  // 1.5 USDFC in wei
  isActive: true
}
```

**What to check:**
- Is owner address correct?
- Is datasetId what you uploaded?
- Is price correct?
- Is isActive = true?

### **Log 3: Registry-Based Datasets**

```javascript
✅ Loading assets from AssetRegistry contract: X assets

📊 Registry-based datasets: [
  { datasetId: 20, provider: "pspsps", owner: "0x4C61...", price: 1500... },
  { datasetId: 29, provider: "pspsps", owner: "0x4C61...", price: 2000... },
  // NEW ASSET should be here!
]
```

**What to check:**
- Total count matches contract
- All owners included
- Your new asset in the list

---

## 🧪 **Verification Steps**

### **Step 1: Count Assets in Contract**

**In console, look for:**
```
✅ Total active assets from contract: X
```

**Expected:** Should be 6 or more (if new upload succeeded)

**If different:**
- Less than 6 → Some assets missing or inactive
- More than 6 → Extra assets registered
- Check individual asset logs

### **Step 2: Count Assets in Marketplace UI**

**Look at marketplace:**
```
Showing 1-6 of X assets
```

**Expected:** X should match contract count

**If different:**
- UI shows less → Filtering or provider loading failed
- UI shows more → Impossible (should be same or less)

### **Step 3: Check Specific User Assets**

**In console:**
```javascript
// Filter logs for specific owner
// Look for "owner: 0x4C61...c5B6"
```

**Expected:** Should see 2-3 assets for that owner

**If missing:**
- Check if upload completed successfully
- Check if registration transaction confirmed
- Check transaction on block explorer

---

## 🐛 **Common Issues**

### **Issue 1: Contract Returns Assets, UI Shows Less**

**Symptoms:**
```
Contract: 8 assets
Marketplace: 6 assets showing
```

**Possible Causes:**
1. Pagination active (check if on page 1)
2. Filters active (clear all filters)
3. Provider info failed to load
4. Some assets filtered out

**Solution:**
1. Click "Refresh Now" button
2. Clear all filters
3. Check console for provider errors
4. Go to page 2 (if exists)

---

### **Issue 2: Asset Registered but Not in Contract**

**Symptoms:**
```
Upload shows: ✅ Asset registered successfully
Contract shows: 0 new assets
```

**Possible Causes:**
1. Registration transaction not confirmed yet
2. Transaction failed after "success" message
3. Wrong contract address

**Solution:**
1. Check transaction on block explorer
2. Wait 30 seconds, refresh
3. Verify contract address in `addresses.ts`

---

### **Issue 3: Asset in Contract but Not in Marketplace**

**Symptoms:**
```
Contract: Asset exists
Marketplace: Asset not showing
```

**Possible Causes:**
1. Provider info fetch failed
2. No serviceURL for provider
3. Cache not updated

**Solution:**
1. Check console for provider errors
2. Click "Refresh Now"
3. Hard refresh (Ctrl + Shift + R)

---

## 📊 **Expected vs Actual**

### **For User 0x4C61...c5B6:**

**Expected (Before New Upload):**
```
Contract Assets:
- Dataset 20, Provider 1 (pspsps)
- Dataset 29, Provider 1 (pspsps)
Total: 2 assets
```

**Expected (After New Upload):**
```
Contract Assets:
- Dataset 20, Provider 1 (pspsps)
- Dataset 29, Provider 1 (pspsps)
- Dataset XX, Provider Y (???)  ← NEW
Total: 3 assets
```

**Marketplace Should Show:** Same 3 assets

---

## 🔧 **Debugging Actions**

### **Action 1: Check Contract Directly**

Use block explorer:
1. Go to contract page
2. Read `getTotalAssets()` → Total count
3. Read `getActiveAssets()` → All active assets
4. Read `getAssetsByOwner(0x4C61...)` → User's assets

### **Action 2: Check Console Logs**

Required logs to check:
```javascript
✅ Total active assets from contract: X
✅ Loading assets from AssetRegistry: X assets
✅ Total datasets loaded from registry: X
📊 All datasets in marketplace: [...]
All assets: X
```

**All X values should match!**

### **Action 3: Manual Refresh**

1. Click "Refresh Now" button in marketplace
2. Wait for spinner to stop
3. Check if count updates

### **Action 4: Check Upload Transaction**

If asset not in contract:
1. Find upload transaction hash (from console logs)
2. Check on explorer: https://calibration.filfox.info/en/tx/YOUR_TX_HASH
3. Verify "registerAsset" call succeeded
4. Check event logs for "AssetRegistered" event

---

## 📋 **Information to Provide**

To help debug, provide:

### **1. Console Logs:**
```
[COPY ALL LOGS WITH EMOJIS FROM CONSOLE]

Especially:
- 🔍 Raw AssetRegistry data
- ✅ Total active assets from contract
- Asset X from contract: {...}
- 📊 Registry-based datasets
```

### **2. Contract Check:**

Visit block explorer and check:
- `getTotalAssets()` → ???
- `getActiveAssets()` → ??? assets
- First few assets listed

### **3. Upload Info:**
- Upload transaction hash: ???
- Dataset ID: ???
- Provider ID: ???
- Was registration successful? (✅ or ❌)

### **4. Current UI State:**
- Assets showing in marketplace: ???
- "Showing 1-6 of X" → X = ???
- Any filters active? Yes/No

---

## ✅ **Success Criteria**

System is working correctly if:

✅ **Contract assets count** = Marketplace total count  
✅ **All contract assets** appear in marketplace  
✅ **New uploads** appear after refresh  
✅ **Owner filter** shows correct user assets  
✅ **No console errors** loading assets  

---

## 🆘 **Quick Debug Checklist**

Before providing info, try:

- [ ] Open console (F12) and check logs
- [ ] Click "Refresh Now" button
- [ ] Clear all filters (search, status, provider)
- [ ] Check if on page 1 (not page 2)
- [ ] Look for "✅ Total active assets from contract: X"
- [ ] Count assets in UI
- [ ] Compare X values

---

**Silakan check console logs dan berikan info di atas!** 🔍

Contract Address: `0x935f69f2A66FaF91004434aFc89f7180161db32d`

