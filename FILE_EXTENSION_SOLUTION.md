# File Extension Solution - Download with Correct Extension

## 🎯 **Problem & Solution**

### **Problem:**
Files download dengan extension `.bin` atau `.data` instead of original extension (`.jpg`, `.pdf`, etc.)

### **Solution:**
Auto-detect file extension saat upload + metadata storage system

---

## ✅ **How It Works Now**

### **For Uploaders (Your Own Files):**

```
1. Select file: "my-photo.jpg"
   ↓
2. Extension auto-detected: "jpg" ✅
   ↓
3. Saved to metadata: pieceCid → "my-photo.jpg"
   ↓
4. Upload to Filecoin
   ↓
5. Later download → "my-photo.jpg" ✅
```

**Result:** Original filename preserved! ✅

### **For Buyers (Purchased from Others):**

```
1. Seller uploads: "contract.pdf"
   ↓
2. Seller sets name: "Contract Document.pdf" ✅
   ↓
3. You purchase asset
   ↓
4. Extension extracted from name: ".pdf"
   ↓
5. Download → "asset-123-0.pdf" ✅
```

**Result:** Extension detected from asset name! ✅

---

## 📋 **Changes Made**

### **1. Added Metadata Storage System**

```typescript
// hooks/useFileUpload.ts

// Save filename metadata (pieceCid → filename mapping)
export const saveFileMetadata = (pieceCid: string, fileName: string) => {
  const metadata = getStoredMetadata();
  metadata[pieceCid] = {
    fileName,
    uploadedAt: Date.now()
  };
  localStorage.setItem("filora_file_metadata", JSON.stringify(metadata));
};

// Get filename for pieceCid
export const getFileMetadata = (pieceCid: string): string | null => {
  const metadata = getStoredMetadata();
  return metadata[pieceCid]?.fileName || null;
};
```

### **2. Auto-Detect Extension on File Selection**

```typescript
// UploadAsset.tsx

// When file is selected
onChange={(e) => {
  const selectedFile = e.target.files[0];
  setFile(selectedFile);
  
  // Auto-detect extension
  const ext = selectedFile.name.split('.').pop() || '';
  const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
  
  setMetadata(prev => ({
    ...prev,
    name: prev.name || nameWithoutExt,
    fileExtension: ext.toLowerCase()  // ✅ Save extension
  }));
  
  console.log("📁 File selected:", {
    name: selectedFile.name,
    extension: ext
  });
}}
```

### **3. Display Extension in Upload Form**

```tsx
<label>
  Asset Name
  <span className="bg-indigo-50 px-2 py-1 rounded">
    .{metadata.fileExtension}  {/* Show detected extension */}
  </span>
</label>

<input value={metadata.name} ... />

{metadata.fileExtension && (
  <p className="text-xs text-gray-500">
    💡 Full filename: {metadata.name}.{metadata.fileExtension}
  </p>
)}
```

### **4. Save Metadata During Upload**

```typescript
// After successful upload
const pieceCidString = pieceCid.toV1().toString();

// ✅ Save filename metadata
saveFileMetadata(pieceCidString, file.name);
```

### **5. Smart Filename Resolution on Download**

```typescript
// PurchasedAssets.tsx

const getFilenameWithExtension = () => {
  // Priority 1: Stored filename from purchase
  if (purchase.filename) return purchase.filename;
  
  // Priority 2: Metadata (if you uploaded it)
  const storedFilename = getFromMetadata(purchase.pieceCid);
  if (storedFilename) return storedFilename;
  
  // Priority 3: Extract from asset name
  if (purchase.assetName) {
    const match = purchase.assetName.match(/\.(jpg|pdf|...)$/i);
    if (match) return `asset-${id}${match[0]}`;
  }
  
  // Priority 4: Generic .data
  return `filecoin-asset-${id}.data`;
};
```

---

## 🎯 **Download Scenarios**

### **Scenario 1: You Upload & Download (Best)**

```
Upload: my-photo.jpg
  ↓
Metadata saved: pieceCid123 → "my-photo.jpg"
  ↓
Download (as owner): my-photo.jpg ✅
```

**Extension:** Original `.jpg` ✅

### **Scenario 2: You Upload, Someone Else Buys**

```
Upload: contract.pdf
  ↓
Set asset name: "Contract Document.pdf" ✅
  ↓
Buyer purchases
  ↓
Buyer downloads: asset-123-0.pdf ✅
```

**Extension:** Extracted from name `.pdf` ✅

### **Scenario 3: Generic Asset Name**

```
Upload: data.csv
  ↓
Set asset name: "Financial Data" ❌ (no extension)
  ↓
Buyer purchases
  ↓
Buyer downloads: filecoin-asset-123-0.data ⚠️
```

**Extension:** Generic `.data` ⚠️

**Fix:** Include extension in name: "Financial Data.csv" ✅

### **Scenario 4: No Extension in Original File**

```
Upload: README (no extension)
  ↓
Set asset name: "README.txt" ✅
  ↓
Buyer downloads: asset-123-0.txt ✅
```

**Extension:** From name `.txt` ✅

---

## 💡 **Best Practices for Sellers**

### **✅ DO: Include Extension in Asset Name**

```
Good Examples:
"My Photo.jpg"
"Contract Document.pdf"
"Tutorial Video.mp4"
"Music Track.mp3"
"Data Export.csv"
```

**Result:** Buyers can download with correct extension! ✅

### **❌ DON'T: Generic Names Without Extension**

```
Bad Examples:
"Photo 1"          → downloads as .data
"Document"         → downloads as .data
"Video File"       → downloads as .data
"My File"          → downloads as .data
```

**Result:** Buyers get generic `.data` file ❌

---

## 📊 **Extension Detection Priority**

```
1. purchase.filename (highest priority)
   ↓ Not found
2. File metadata from localStorage (pieceCid lookup)
   ↓ Not found
3. Extract from purchase.assetName
   ↓ Not found
4. Generic: .data extension (fallback)
```

---

## 🧪 **Testing**

### **Test 1: Upload Image**

1. Select file: `vacation-photo.jpg`
2. **Check:** Extension badge shows `.jpg`
3. **Check:** Preview shows "vacation-photo.jpg"
4. Upload to Filecoin
5. Download from "My Assets"
6. **Expected:** Downloads as `vacation-photo.jpg` ✅

### **Test 2: Upload PDF**

1. Select file: `contract.pdf`
2. **Check:** Extension badge shows `.pdf`
3. Set name: "Legal Contract"
4. **Check:** Full filename shows "Legal Contract.pdf"
5. Someone else purchases
6. They download
7. **Expected:** Downloads as `asset-123-0.pdf` ✅

### **Test 3: Generic Name (No Extension)**

1. Select file: `data.csv`
2. Set name: "Sales Data" (no .csv)
3. Buyer downloads
4. **Expected:** Downloads as `filecoin-asset-123-0.data` ⚠️
5. **Fix:** Change name to "Sales Data.csv"
6. Buyer downloads
7. **Expected:** Downloads as `asset-123-0.csv` ✅

---

## 🔧 **For Users:**

### **If You Uploaded the File:**

Your own uploads will download with **original filename** automatically! ✅

Example:
- Uploaded: `my-document.pdf`
- Download: `my-document.pdf` ✅

### **If You Purchased from Someone:**

Download extension depends on seller's asset name:

**Good Seller (Includes Extension):**
- Asset name: "Contract.pdf"
- Download: `asset-123-0.pdf` ✅

**Bad Seller (No Extension):**
- Asset name: "Contract"
- Download: `filecoin-asset-123-0.data` ⚠️
- **Fix:** Rename file manually after download

---

## 📝 **Manual Rename After Download**

If you get `.data` file but know the type:

### **Windows:**
1. Right-click file
2. Rename
3. Change: `filecoin-asset-123-0.data` → `myfile.jpg`

### **Mac:**
1. Select file
2. Press Enter
3. Change extension: `.data` → `.jpg`

### **Linux:**
```bash
mv filecoin-asset-123-0.data myfile.jpg
```

---

## 🎨 **UI Changes**

### **Upload Form (Enhanced):**

**Before:**
```
Asset Name: [ _____________ ]
```

**After:**
```
Asset Name (.jpg)  ← Shows detected extension
[ my-photo _______ ]

💡 Full filename: my-photo.jpg
```

**Benefits:**
- ✅ User sees detected extension
- ✅ Encourages including extension in name
- ✅ Preview shows final filename
- ✅ Clear what buyers will get

---

## 📁 **localStorage Structure**

### **File Metadata (pieceCid → filename):**

```json
{
  "filora_file_metadata": {
    "bafk123abc...": {
      "fileName": "my-photo.jpg",
      "uploadedAt": 1728234567890
    },
    "bafk456def...": {
      "fileName": "contract.pdf",
      "uploadedAt": 1728234999123
    }
  }
}
```

### **Purchased Assets (per wallet):**

```json
{
  "filora_purchased_assets_0x123...": [
    {
      "datasetId": 37,
      "pieceId": 0,
      "pieceCid": "bafk123...",
      "seller": "0xabc...",
      "price": "1.0",
      "purchasedAt": 1728234567,
      "txHash": "0xdef...",
      "assetName": "Contract.pdf"  ← Extension in name
    }
  ]
}
```

---

## 🔄 **Complete Flow**

### **Uploader's Journey:**

```
1. Select file: my-photo.jpg
2. Auto-detect: extension = "jpg"
3. UI shows: "Asset Name (.jpg)"
4. Upload to Filecoin
5. Save metadata: pieceCid → "my-photo.jpg"
6. Later download (as owner): my-photo.jpg ✅
```

### **Buyer's Journey:**

```
1. See asset: "Beautiful Photo.jpg"
2. Purchase asset
3. Save to purchased: assetName = "Beautiful Photo.jpg"
4. Download from Purchased tab
5. Extract extension from name: ".jpg"
6. Download as: asset-37-0.jpg ✅
```

---

## ⚠️ **Limitations**

### **Current Limitations:**

1. **Buyer relies on seller's asset name**
   - If seller doesn't include extension → buyer gets `.data`
   - Solution: Educate sellers to include extension

2. **No on-chain metadata storage**
   - Filename not stored in smart contract
   - Only in localStorage (local to browser)
   - Solution: Future enhancement to store in IPFS metadata

3. **Cross-device sync**
   - Metadata doesn't sync across devices
   - Solution: Use IPFS or on-chain storage

---

## 🚀 **Future Enhancements**

### **Option 1: Store in AssetRegistry Contract**

```solidity
struct Asset {
  uint256 price;
  address owner;
  string filename;  // ✅ Store original filename
  string contentType;  // ✅ MIME type
}
```

### **Option 2: IPFS Metadata**

```typescript
// Upload metadata to IPFS
const metadata = {
  name: "My Photo",
  filename: "my-photo.jpg",
  contentType: "image/jpeg",
  description: "..."
};

const metadataHash = await ipfs.add(JSON.stringify(metadata));
// Store metadataHash in contract or registry
```

### **Option 3: Content-Type Detection**

```typescript
// Detect from blob during download
const contentType = response.headers.get('content-type');
const extension = mimeToExtension(contentType);
```

---

## 📝 **For Sellers: How to Ensure Buyers Get Correct Extension**

### **Step 1: Upload File**
Select your file (e.g., `report.pdf`)

### **Step 2: Check Extension Badge**
See `.pdf` badge next to "Asset Name" label ✅

### **Step 3: Set Asset Name**
```
Good: "Monthly Report.pdf" ✅
Bad: "Monthly Report" ❌
```

### **Step 4: Verify Preview**
Check full filename preview:
```
💡 Full filename for buyers: Monthly Report.pdf
```

### **Step 5: Upload**
Complete upload process

**Result:** Buyers will download as `asset-123-0.pdf` ✅

---

## ✅ **Summary**

**Files Modified:**
1. ✅ `hooks/useFileUpload.ts` - Added metadata save/get functions
2. ✅ `components/marketplace/UploadAsset.tsx` - Auto-detect extension
3. ✅ `components/marketplace/PurchasedAssets.tsx` - Smart filename resolution

**How It Works:**
- ✅ Auto-detect extension from file.name
- ✅ Save to localStorage metadata
- ✅ Display extension badge in UI
- ✅ Download with original extension (for your files)
- ✅ Download with detected extension (from asset name)
- ✅ Fallback to `.data` if no extension found

**Supported Extensions:**
`jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `pdf`, `doc`, `docx`, `txt`, `mp4`, `mp3`, `avi`, `mov`, `wav`, `ogg`, `zip`, `rar`, `7z`, `tar`, `gz`, `json`, `csv`, `xlsx`, `pptx`

**Best Practice for Sellers:**
Include file extension in asset name!  
Example: "My Photo.jpg" instead of "My Photo"

---

**Status:** ✅ **IMPROVED!**

**Last Updated:** October 6, 2025

**Result:** 
- ✅ Your uploads: Original extension preserved
- ✅ Purchased: Extension from asset name
- ✅ Fallback: `.data` (better than `.bin`)

