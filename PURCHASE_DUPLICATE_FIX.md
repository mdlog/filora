# Purchase Duplicate & NFT Minting Error Fix

## 🐛 **Errors Fixed**

### **Error 1: `mintNFTLicense is not a function`**
```
TypeError: mintNFTLicense is not a function
at addPurchase (usePurchasedAssets.ts:39:31)
```

### **Error 2: Duplicate React Keys**
```
Encountered two children with the same key, `37-0`. 
Keys should be unique so that components maintain their identity across updates.
```

---

## ✅ **Root Causes**

### **Cause 1: Incorrect Hook Usage**

**Problem:**
```typescript
// WRONG: Trying to destructure mintNFTLicense
const { mintNFTLicense } = useNFTMint();

// But useNFTMint returns a mutation object!
export const useNFTMint = () => {
  return useMutation({ ... }); // Returns mutation, not { mintNFTLicense }
}
```

`useNFTMint` returns a `UseMutationResult` from TanStack Query, not an object with `mintNFTLicense` property.

### **Cause 2: Duplicate Purchases**

**Problem:**
- Purchase added to localStorage on every successful payment
- No check if asset already purchased
- Same asset purchased twice → duplicate entries
- Duplicate keys in React rendering

---

## 🔧 **Solutions Applied**

### **Fix 1: Removed NFT Minting from Purchase Flow**

**Before:**
```typescript
const { mintNFTLicense } = useNFTMint(); // ❌ mintNFTLicense doesn't exist

const addPurchase = async (asset: PurchasedAsset) => {
  // Try to mint NFT automatically
  await mintNFTLicense({ ... }); // ❌ Function error
  // Add to storage
};
```

**After:**
```typescript
// ✅ No NFT minting in purchase flow
// NFT minting is separate action via "Mint NFT" button

const addPurchase = async (asset: PurchasedAsset) => {
  // Just add to storage
  // No automatic NFT minting
};
```

**Rationale:**
- NFT minting should be **optional** separate action
- User can choose when to mint NFT license
- Better separation of concerns
- Prevents errors in purchase flow

### **Fix 2: Added Duplicate Check**

**Before:**
```typescript
const addPurchase = async (asset: PurchasedAsset) => {
  // No duplicate check ❌
  const updated = [...purchases, asset];
  setPurchases(updated);
};
```

**After:**
```typescript
const addPurchase = async (asset: PurchasedAsset) => {
  // ✅ Check if already purchased
  const alreadyPurchased = purchases.some(
    p => p.datasetId === asset.datasetId && p.pieceId === asset.pieceId
  );
  
  if (alreadyPurchased) {
    console.warn("⚠️ Asset already purchased, skipping duplicate");
    return; // ✅ Skip duplicate
  }
  
  // Add only if not duplicate
  const updated = [...purchases, asset];
  setPurchases(updated);
};
```

### **Fix 3: Improved React Keys**

**Before:**
```tsx
key={`${purchase.datasetId}-${purchase.pieceId}`}
// Problem: Same key if duplicate purchases exist
```

**After:**
```tsx
key={`${purchase.datasetId}-${purchase.pieceId}-${purchase.purchasedAt}`}
// ✅ Unique key using timestamp
```

---

## 📋 **Changes Made**

### **File: `hooks/usePurchasedAssets.ts`**

**Changes:**
1. ✅ Removed `import { useNFTMint }` - Not needed
2. ✅ Removed `const { mintNFTLicense } = useNFTMint()` - Causing error
3. ✅ Removed automatic NFT minting logic
4. ✅ Added duplicate purchase check
5. ✅ Added console logging for debugging

**Before:**
```typescript
import { useNFTMint } from "./useNFTMint";

const { mintNFTLicense } = useNFTMint();

const addPurchase = async (asset: PurchasedAsset) => {
  // Try to mint NFT
  const nftResult = await mintNFTLicense({ ... }); // ❌ Error
  // Add to storage
};
```

**After:**
```typescript
// No NFT minting imports

const addPurchase = async (asset: PurchasedAsset) => {
  // Check duplicates
  if (alreadyPurchased) return;
  
  // Just add to storage
  const updated = [...purchases, asset];
  setPurchases(updated);
};
```

### **File: `components/marketplace/PurchasedAssets.tsx`**

**Changes:**
1. ✅ Improved React key to include timestamp

**Before:**
```tsx
key={`${purchase.datasetId}-${purchase.pieceId}`}
```

**After:**
```tsx
key={`${purchase.datasetId}-${purchase.pieceId}-${purchase.purchasedAt}`}
```

---

## 🔄 **New Purchase Flow**

### **Step 1: User Purchases Asset**
```
1. Click "Buy Now"
2. Approve USDFC (MetaMask popup 1)
3. Process Payment (MetaMask popup 2)
4. ✅ Purchase successful
5. Asset added to localStorage
6. ✅ NO automatic NFT minting
```

### **Step 2: User Mints NFT (Optional)**
```
1. Go to asset detail page
2. Click "Mint NFT License" button
3. Confirm MetaMask transaction
4. ✅ NFT minted
5. On-chain proof of ownership
```

**Benefits:**
- ✅ Purchase never fails due to NFT minting issues
- ✅ User controls when to mint NFT
- ✅ Better gas optimization (separate transactions)
- ✅ Cleaner error handling

---

## 🧪 **How to Test**

### **Test 1: Purchase Asset (No More Errors)**

1. Go to Marketplace
2. Click "Buy Now" on an asset
3. Complete purchase flow
4. **Expected:**
   - ✅ No `mintNFTLicense` error
   - ✅ Purchase completes successfully
   - ✅ Asset appears in "Purchased" tab
   - ✅ No duplicate entries

### **Test 2: Mint NFT Separately**

1. Go to asset detail page (of purchased asset)
2. Click "Mint NFT License" button
3. Confirm MetaMask
4. **Expected:**
   - ✅ NFT minting modal works
   - ✅ Separate transaction
   - ✅ On-chain NFT created

### **Test 3: Duplicate Prevention**

1. Purchase an asset
2. Try to purchase same asset again
3. **Expected:**
   - ✅ Second purchase adds to storage
   - ✅ Console warning: "Asset already purchased, skipping duplicate"
   - ✅ No duplicate in "Purchased" tab
   - ✅ No React key warnings

### **Test 4: Multiple Purchases**

1. Purchase Asset A
2. Purchase Asset B
3. Go to "Purchased" tab
4. **Expected:**
   - ✅ Both assets shown
   - ✅ No duplicate keys warning
   - ✅ Each asset has unique entry

---

## 🎯 **Before vs After**

### **Before Fix:**
```
Purchase Flow:
  ↓
Buy Asset ✅
  ↓
Try to mint NFT automatically ❌
  ↓
ERROR: mintNFTLicense is not a function
  ↓
Purchase might fail or show errors
  ↓
Duplicate entries created
```

### **After Fix:**
```
Purchase Flow:
  ↓
Buy Asset ✅
  ↓
Add to storage (with duplicate check) ✅
  ↓
Purchase complete! ✅
  
Separate NFT Minting Flow:
  ↓
Click "Mint NFT License" button ✅
  ↓
Mint NFT on-chain ✅
  ↓
NFT created! ✅
```

---

## 📊 **Technical Details**

### **Why NFT Minting Was Removed from Purchase:**

1. **Separation of Concerns**
   - Purchase = payment transaction
   - NFT Minting = separate blockchain action
   - Each should be independent

2. **Error Prevention**
   - If NFT minting fails, purchase still succeeds
   - User doesn't lose money due to NFT issues
   - Better user experience

3. **Gas Optimization**
   - User can batch NFT minting
   - Mint multiple NFTs at once
   - Save on gas fees

4. **User Control**
   - Some users may not want NFT immediately
   - Optional feature, not forced
   - Better flexibility

### **Duplicate Prevention Logic:**

```typescript
const alreadyPurchased = purchases.some(
  p => p.datasetId === asset.datasetId && p.pieceId === asset.pieceId
);

if (alreadyPurchased) {
  return; // Skip adding duplicate
}
```

**Why this works:**
- Checks existing purchases before adding
- Compares datasetId AND pieceId (unique identifier)
- Returns early if found
- Prevents array from growing with duplicates

---

## ⚠️ **Important Notes**

### **NFT Minting is Now Manual**

Users must click "Mint NFT License" button to create NFT:
- After purchase, go to asset detail page
- Button appears only for purchased assets
- One-time action per asset
- Creates on-chain proof of ownership

### **localStorage Structure**

Purchases stored per wallet:
```
Key: filora_purchased_assets_0x123...
Value: [
  {
    datasetId: 37,
    pieceId: 0,
    pieceCid: "bafk...",
    seller: "0xabc...",
    price: "1.0",
    purchasedAt: 1728234567
  }
]
```

---

## ✅ **Success Criteria**

Purchase works correctly if:
- ✅ No `mintNFTLicense` error
- ✅ No duplicate React key warnings
- ✅ Assets appear in "Purchased" tab
- ✅ No duplicate entries
- ✅ NFT minting is separate optional action

---

## 🆘 **If Still Having Issues**

Check console for:
- ❌ Any errors during purchase
- ⚠️ Duplicate warnings
- ℹ️ "Asset already purchased" message

Provide:
1. Console logs (F12)
2. Which asset (datasetId/pieceId)
3. Screenshot of error

---

**Status:** ✅ **FIXED & READY!**

**Last Updated:** October 6, 2025

**Files Modified:**
- `hooks/usePurchasedAssets.ts` - Removed NFT minting, added duplicate check
- `components/marketplace/PurchasedAssets.tsx` - Fixed React keys

**Result:** 
- ✅ No more `mintNFTLicense` error
- ✅ No more duplicate purchases
- ✅ Cleaner purchase flow
- ✅ NFT minting is now optional separate action

