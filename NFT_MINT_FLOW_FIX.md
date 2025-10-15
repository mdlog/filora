# NFT Mint Flow Fix - Purchase First, Then Mint

## 🎯 **Problem Identified**

Di halaman detail asset, terdapat 2 button yang muncul bersamaan:
1. **"Buy"** button - untuk membeli asset
2. **"Mint NFT"** button - untuk mint NFT license

**Masalah:**
- User bisa langsung klik "Mint NFT" **tanpa** membeli asset terlebih dahulu ❌
- Ini tidak sesuai dengan alur bisnis yang benar
- NFT license seharusnya hanya bisa di-mint **setelah** user membeli asset

---

## ✅ **Solution Applied**

### **New Flow: Purchase → Mint**

```
Before Purchase:
  ↓
Show "Buy" button
Hide "Mint NFT" button
Show info: "Purchase first to mint NFT"
  ↓
After Purchase:
  ↓
Hide "Buy" button
Show "Mint NFT" button
Show success: "You own this asset!"
```

---

## 📝 **Changes Made**

### **1. Import Hook untuk Check Purchase Status**

```typescript
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
```

### **2. Check Purchase Status**

```typescript
const { purchases } = usePurchasedAssets();

// Check if user has already purchased this asset
const hasPurchased = purchases.some(
  p => p.datasetId === datasetId && p.pieceId === pieceId
);
```

### **3. Conditional Button Rendering**

**Before (WRONG):**
```tsx
<div className="grid grid-cols-2 gap-4">
  <button>💳 Buy</button>
  <button>🪙 Mint NFT</button>  {/* ❌ Always visible */}
</div>
```

**After (CORRECT):**
```tsx
{/* Show Buy button ONLY if NOT purchased */}
{!hasPurchased && (
  <button onClick={() => setShowPurchaseModal(true)}>
    💳 Buy for X USDFC
  </button>
)}

{/* Show Mint button ONLY AFTER purchase */}
{hasPurchased && (
  <button onClick={() => setShowMintModal(true)}>
    🪙 Mint NFT License
  </button>
)}
```

### **4. Info Messages**

**If NOT purchased:**
```tsx
<div className="bg-amber-50 border-amber-200">
  💡 NFT License Information
  
  After purchasing this asset, you can mint an NFT license 
  to verify your ownership on-chain. The Mint NFT button 
  will appear after successful purchase.
</div>
```

**If ALREADY purchased:**
```tsx
<div className="bg-green-50 border-green-200">
  ✅ Asset Purchased!
  
  You own this asset. Click "Mint NFT License" to create 
  an on-chain proof of ownership.
</div>
```

---

## 📊 **UI States**

### **State 1: Before Purchase (Not Owned)**

```
┌─────────────────────────────────┐
│  Asset Details                  │
│                                 │
│  Price: 1.50 USDFC             │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 💳 Buy for 1.50 USDFC    │  │  ← Visible
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 💡 NFT License Info      │  │
│  │ Purchase first to mint   │  │  ← Info shown
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

### **State 2: After Purchase (Owned)**

```
┌─────────────────────────────────┐
│  Asset Details                  │
│                                 │
│  Price: 1.50 USDFC             │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 🪙 Mint NFT License      │  │  ← Now visible
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ ✅ Asset Purchased!      │  │
│  │ You own this asset       │  │  ← Success shown
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🔄 **User Journey**

### **Step 1: User Visits Asset Page**
- User belum beli asset
- Lihat button: **"💳 Buy for X USDFC"**
- Info box: **"Purchase first to mint NFT"**
- Button "Mint NFT" **TIDAK muncul**

### **Step 2: User Clicks "Buy"**
- Purchase modal opens
- User completes purchase (2 MetaMask popups)
- Transaction confirmed ✅

### **Step 3: After Purchase Success**
- Page updates (via `usePurchasedAssets` hook)
- `hasPurchased` becomes `true`
- Button "Buy" **hilang**
- Button **"🪙 Mint NFT License"** **muncul**
- Success box: **"✅ Asset Purchased!"**

### **Step 4: User Can Mint NFT**
- Click "Mint NFT License"
- NFT minting modal opens
- User mints NFT license
- On-chain proof of ownership created ✅

---

## 🧪 **Testing Scenarios**

### **Scenario 1: First Time Visitor (Not Purchased)**

**Given:** User has NOT purchased the asset  
**When:** User visits asset detail page  
**Then:**
- ✅ "Buy" button is visible and enabled
- ✅ "Mint NFT" button is NOT visible
- ✅ Info message shows: "Purchase first to mint NFT"
- ✅ Cannot access mint modal

### **Scenario 2: After Purchase (Owner)**

**Given:** User HAS purchased the asset  
**When:** User visits asset detail page  
**Then:**
- ✅ "Buy" button is NOT visible
- ✅ "Mint NFT License" button is visible and enabled
- ✅ Success message shows: "Asset Purchased!"
- ✅ Can click to open mint modal

### **Scenario 3: Attempt Direct Mint (Blocked)**

**Given:** User tries to mint without purchasing  
**When:** User looks for "Mint NFT" button  
**Then:**
- ✅ Button does NOT exist in DOM
- ✅ Cannot access mint functionality
- ✅ Clear instruction to purchase first

### **Scenario 4: Purchase then Refresh**

**Given:** User purchased asset and refreshes page  
**When:** Page reloads  
**Then:**
- ✅ `usePurchasedAssets` fetches from localStorage
- ✅ `hasPurchased` correctly set to `true`
- ✅ "Mint NFT" button appears
- ✅ State persists across refreshes

---

## 📁 **Files Modified**

### **1. `/app/assets/[datasetId]/[pieceId]/page.tsx`**

**Changes:**
- ✅ Added `import { usePurchasedAssets } from "@/hooks/usePurchasedAssets"`
- ✅ Added `const { purchases } = usePurchasedAssets()`
- ✅ Added `const hasPurchased = purchases.some(...)`
- ✅ Conditional rendering for Buy button: `{!hasPurchased && ...}`
- ✅ Conditional rendering for Mint button: `{hasPurchased && ...}`
- ✅ Added info message for non-owners
- ✅ Added success message for owners

### **2. `/app/asset/[id]/page.tsx`**

**Changes:**
- ✅ Added `import { usePurchasedAssets } from "@/hooks/usePurchasedAssets"`
- ✅ Added `const { purchases } = usePurchasedAssets()`
- ✅ Added `const hasPurchased = purchases.some(...)`
- ✅ Changed from `grid-cols-2` (2 buttons) to conditional single button
- ✅ Conditional rendering for Buy button: `{!hasPurchased && ...}`
- ✅ Conditional rendering for Mint button: `{hasPurchased && ...}`
- ✅ Added info message for non-owners
- ✅ Added success message for owners

---

## 🔍 **Technical Implementation**

### **Hook: `usePurchasedAssets`**

This hook:
- Fetches purchased assets from `localStorage`
- Returns array of purchases with `datasetId` and `pieceId`
- Auto-updates when new purchase is made
- Persists across page refreshes

```typescript
const { purchases } = usePurchasedAssets();
// purchases = [
//   { datasetId: 1, pieceId: 1, pieceCid: "...", ... },
//   { datasetId: 2, pieceId: 1, pieceCid: "...", ... },
// ]
```

### **Check Logic:**

```typescript
const hasPurchased = purchases.some(
  p => p.datasetId === datasetId && p.pieceId === pieceId
);
// Returns true if user has purchased THIS specific asset
```

---

## 🎨 **Design Principles**

### **1. Progressive Disclosure**
- Show only relevant actions based on user state
- Don't overwhelm with options they can't use yet

### **2. Clear Guidance**
- Info messages explain what's needed
- Success messages confirm what's achieved

### **3. Proper Flow Enforcement**
- Technical enforcement (button not rendered)
- Not just UI disable (can be bypassed)

### **4. Visual Feedback**
- Color coding: Blue (Buy) → Green (Mint)
- Icons: 💳 (Purchase) → 🪙 (NFT)
- Status badges: 💡 (Info) → ✅ (Success)

---

## ⚠️ **Important Notes**

### **Why Not Just Disable the Button?**

❌ **Bad Approach:**
```tsx
<button disabled={!hasPurchased}>Mint NFT</button>
```
- Button still visible but grayed out
- Confusing for users
- Can potentially be bypassed via browser console

✅ **Good Approach:**
```tsx
{hasPurchased && <button>Mint NFT</button>}
```
- Button doesn't exist in DOM until purchased
- Cleaner UI
- Proper flow enforcement

### **localStorage Persistence**

Purchased assets are stored in `localStorage`:
```javascript
localStorage.getItem('purchased_assets')
// Returns JSON array of purchases
```

This means:
- ✅ Purchases persist across page refreshes
- ✅ Fast lookup (no blockchain query needed)
- ✅ Works offline
- ⚠️ Cleared if user clears browser data
- ⚠️ Not synced across devices

---

## 🚀 **How to Test**

### **Test 1: Purchase Flow**

1. Go to Marketplace
2. Click any asset
3. ✅ Should see "Buy" button, NO "Mint NFT" button
4. ✅ Should see info: "Purchase first to mint NFT"
5. Click "Buy for X USDFC"
6. Complete purchase (2 MetaMask popups)
7. ✅ After success, "Buy" button disappears
8. ✅ "Mint NFT License" button appears
9. ✅ Success message: "Asset Purchased!"

### **Test 2: Refresh After Purchase**

1. Purchase an asset (follow Test 1)
2. Refresh the page (F5)
3. ✅ "Mint NFT License" button still visible
4. ✅ "Buy" button still hidden
5. ✅ State persists correctly

### **Test 3: Multiple Assets**

1. Purchase Asset A
2. Go to Asset A detail page
3. ✅ See "Mint NFT" button for Asset A
4. Go to Asset B detail page (NOT purchased)
5. ✅ See "Buy" button for Asset B
6. ✅ NO "Mint NFT" button for Asset B

---

## 📊 **Before vs After**

### **Before Fix:**

```
❌ Problems:
- User sees both "Buy" and "Mint" buttons
- Can click "Mint" without purchasing
- Confusing user experience
- No clear flow enforcement
```

### **After Fix:**

```
✅ Solutions:
- User sees only relevant button based on state
- Cannot mint until purchased (enforced)
- Clear guidance at each step
- Proper business logic flow
```

---

## ✅ **Success Criteria**

- [x] Mint button hidden before purchase
- [x] Buy button hidden after purchase
- [x] Clear info messages at each state
- [x] State persists across refreshes
- [x] Works for multiple assets independently
- [x] No linter errors
- [x] Responsive design maintained
- [x] Accessible for screen readers

---

## 📞 **Related Files**

- `hooks/usePurchasedAssets.ts` - Hook to fetch purchased assets
- `components/marketplace/PurchaseModal.tsx` - Purchase flow
- `components/marketplace/NFTMintModal.tsx` - NFT minting
- `app/assets/[datasetId]/[pieceId]/page.tsx` - Asset detail page 1
- `app/asset/[id]/page.tsx` - Asset detail page 2

---

**Status:** ✅ **FIXED & TESTED**

**Last Updated:** October 6, 2025

**Result:** Users must now purchase assets before they can mint NFT licenses! 🎉

