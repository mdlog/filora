# Download Filename Fix - Proper File Extensions

## 🐛 **Problem Reported**

**Issue:** Saat download asset, file menggunakan extension `.bin` instead of actual file extension.

**Example:**
- Download file: `asset-37-0.bin` ❌
- Expected: `asset-37-0.jpg` or `asset-37-0.pdf` ✅

---

## 🔍 **Root Cause**

### **Current Code (Before Fix):**

```typescript
// PurchasedAssets.tsx
const fileExtension = purchase.filename?.split('.').pop() || 'bin';
//                    ↑ Always undefined!

// Interface doesn't have filename field
export interface PurchasedAsset {
  datasetId: number;
  // ... other fields
  // ❌ No filename field!
}
```

**Problem:**
1. `purchase.filename` always `undefined` (field doesn't exist)
2. Falls back to `'bin'` extension
3. Downloaded file: `asset-123-0.bin`

---

## ✅ **Solution Applied**

### **1. Added Fields to Interface**

```typescript
export interface PurchasedAsset {
  datasetId: number;
  pieceId: number;
  pieceCid: string;
  seller: string;
  price: string;
  purchasedAt: number;
  txHash?: string;
  nftTokenId?: string;
  licenseHash?: string;
  filename?: string;  // ✅ NEW: Original filename
  assetName?: string; // ✅ NEW: Asset name for display
}
```

### **2. Save Asset Name During Purchase**

```typescript
// PurchaseModal.tsx
await addPurchase({
  datasetId: assetId,
  pieceId: pieceId,
  pieceCid: pieceCid,
  price: price,
  seller: seller,
  purchasedAt: Math.floor(Date.now() / 1000),
  txHash: result.paymentHash,
  assetName: assetName, // ✅ Save asset name
});
```

### **3. Smart Filename Detection**

```typescript
// PurchasedAssets.tsx
const getFilenameWithExtension = () => {
  // 1. If we have stored filename, use it (future enhancement)
  if (purchase.filename) {
    return purchase.filename;
  }
  
  // 2. Try to extract extension from asset name
  if (purchase.assetName) {
    const match = purchase.assetName.match(/\.(jpg|jpeg|png|gif|pdf|mp4|mp3|zip|doc|docx|txt|json|csv)$/i);
    if (match) {
      return `asset-${purchase.datasetId}-${purchase.pieceId}${match[0]}`;
    }
  }
  
  // 3. Default: use descriptive generic name
  return `filecoin-asset-${purchase.datasetId}-${purchase.pieceId}.data`;
};
```

---

## 📊 **Filename Resolution Logic**

### **Priority Order:**

```
1. Stored filename (if available)
   ↓ Not found
2. Extract from assetName
   ↓ No extension found
3. Generic: filecoin-asset-{id}-{piece}.data
```

### **Supported Extensions:**

```typescript
Common extensions detected:
- Images: .jpg, .jpeg, .png, .gif
- Documents: .pdf, .doc, .docx, .txt
- Media: .mp4, .mp3
- Data: .json, .csv, .zip
```

---

## 🧪 **Examples**

### **Example 1: Asset with Extension in Name**

**Asset Name:** `"My Photo.jpg"`

**Download Filename:** `asset-123-0.jpg` ✅

**Logic:**
1. Check `purchase.filename` → undefined
2. Check `purchase.assetName` → "My Photo.jpg"
3. Extract extension → ".jpg"
4. Result: `asset-123-0.jpg`

### **Example 2: Asset without Extension**

**Asset Name:** `"Digital Asset #42"`

**Download Filename:** `filecoin-asset-42-0.data` ✅

**Logic:**
1. Check `purchase.filename` → undefined
2. Check `purchase.assetName` → "Digital Asset #42"
3. No extension found → use generic
4. Result: `filecoin-asset-42-0.data`

### **Example 3: PDF Document**

**Asset Name:** `"Contract Document.pdf"`

**Download Filename:** `asset-15-1.pdf` ✅

**Logic:**
1. Check `purchase.assetName` → "Contract Document.pdf"
2. Extract extension → ".pdf"
3. Result: `asset-15-1.pdf`

---

## 📋 **Changes Made**

### **File: `hooks/usePurchasedAssets.ts`**

**Added:**
```typescript
export interface PurchasedAsset {
  // ... existing fields
  filename?: string;  // ✅ Original filename with extension
  assetName?: string; // ✅ Asset name for display
}
```

### **File: `components/marketplace/PurchaseModal.tsx`**

**Changed:**
```typescript
// Before
await addPurchase({
  datasetId: assetId,
  // ... other fields
  // ❌ No assetName
});

// After
await addPurchase({
  datasetId: assetId,
  // ... other fields
  assetName: assetName, // ✅ Save for filename detection
});
```

### **File: `components/marketplace/PurchasedAssets.tsx`**

**Changed:**
```typescript
// Before
const fileExtension = purchase.filename?.split('.').pop() || 'bin';
const filename = `asset-${purchase.datasetId}-${purchase.pieceId}.${fileExtension}`;

// After
const getFilenameWithExtension = () => {
  // Smart detection logic
  if (purchase.filename) return purchase.filename;
  if (purchase.assetName) {
    const match = purchase.assetName.match(/\.(jpg|jpeg|png|gif|pdf|...)$/i);
    if (match) return `asset-${purchase.datasetId}-${purchase.pieceId}${match[0]}`;
  }
  return `filecoin-asset-${purchase.datasetId}-${purchase.pieceId}.data`;
};
const filename = getFilenameWithExtension();
```

---

## 🎯 **Before vs After**

### **Before Fix:**

```
Asset: "My Photo.jpg"
Download: asset-37-0.bin  ❌

Asset: "Document.pdf"
Download: asset-42-0.bin  ❌

Asset: "Video.mp4"
Download: asset-55-0.bin  ❌
```

### **After Fix:**

```
Asset: "My Photo.jpg"
Download: asset-37-0.jpg  ✅

Asset: "Document.pdf"
Download: asset-42-0.pdf  ✅

Asset: "Video.mp4"
Download: asset-55-0.mp4  ✅

Asset: "Generic Asset"
Download: filecoin-asset-55-0.data  ✅
```

---

## 🚀 **Future Enhancements**

### **Option 1: Store Original Filename During Upload**

Currently, we don't capture the original filename during upload. To improve:

```typescript
// During upload in UploadAsset.tsx
const originalFilename = file.name; // e.g., "my-photo.jpg"

// Store in metadata
const metadata = {
  name: metadata.name,
  filename: originalFilename, // ✅ Store original
  // ... other metadata
};

// Save to IPFS or Filecoin metadata
```

### **Option 2: Detect from Content-Type**

```typescript
// In useDownloadPiece.ts
const blob = await response.blob();
const contentType = response.headers.get('content-type');

const extensionMap = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  // ... more mappings
};

const extension = extensionMap[contentType] || '.data';
```

### **Option 3: Registry Metadata**

Store filename in AssetRegistry contract:

```solidity
struct AssetMetadata {
  uint256 price;
  address owner;
  string filename; // ✅ Store original filename
}
```

---

## 🧪 **Testing**

### **Test 1: Download Asset with Extension**

1. Upload file: `test-image.jpg`
2. Purchase asset
3. Download asset
4. **Expected:** Downloaded file has `.jpg` extension

### **Test 2: Download Asset without Extension**

1. Upload file with generic name
2. Purchase asset
3. Download asset
4. **Expected:** Downloaded file has `.data` extension

### **Test 3: Various File Types**

Test with:
- `.jpg`, `.png`, `.gif` (images)
- `.pdf`, `.doc` (documents)
- `.mp4`, `.mp3` (media)
- `.zip`, `.json` (data)

**Expected:** Each downloads with correct extension

---

## 📝 **For Users**

### **Current Behavior:**

**New Purchases (After Fix):**
- Extension detected from asset name ✅
- Generic `.data` if no extension found ✅

**Old Purchases (Before Fix):**
- Will download as `.data` (better than `.bin`) ✅
- Can manually rename after download ✅

### **How to Rename Downloaded Files:**

If you get a `.data` file but know the type:

**Windows:**
```
1. Right-click file
2. Rename
3. Change extension: file.data → file.jpg
```

**Mac/Linux:**
```bash
mv filecoin-asset-123-0.data my-image.jpg
```

---

## 🔧 **Manual Fix for Existing Purchases**

If you have old purchases with `.bin` extension:

### **Option 1: Re-download After Fix**

Just download again, it will use new logic!

### **Option 2: Add Filename Manually (Console)**

```javascript
// Open console (F12)
const address = "YOUR_ADDRESS";
const key = `filora_purchased_assets_${address}`;
let purchases = JSON.parse(localStorage.getItem(key));

// Add filename to specific purchase
const purchase = purchases.find(p => p.datasetId === 37 && p.pieceId === 0);
if (purchase) {
  purchase.filename = "my-photo.jpg"; // ✅ Add extension
  localStorage.setItem(key, JSON.stringify(purchases));
  location.reload();
}
```

---

## ✅ **Summary**

**Problem:** Files download as `.bin` instead of correct extension  
**Root Cause:** No filename/extension stored in purchase data  
**Solution:** 
1. Save `assetName` during purchase
2. Smart extension detection from name
3. Fallback to `.data` instead of `.bin`

**Result:**
- ✅ Correct extensions when detectable
- ✅ Better fallback (`.data` vs `.bin`)
- ✅ Future-ready for storing actual filenames

**Status:** 🟢 **IMPROVED!**

**Note:** For best results, future enhancement should store original filename during upload.

---

**Last Updated:** October 6, 2025

**Files Modified:**
- `hooks/usePurchasedAssets.ts` - Added filename/assetName fields
- `components/marketplace/PurchaseModal.tsx` - Save assetName
- `components/marketplace/PurchasedAssets.tsx` - Smart filename detection

**Result:** Better file extensions on download! ✅

