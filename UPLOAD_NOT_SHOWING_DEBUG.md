# Debug: Uploaded Asset Not Showing in Marketplace

## 🐛 **Problem Reported**

**User:** `0x4C6165286739696849Fb3e77A16b0639D762c5B6`  
**Issue:** Baru upload file, tapi tidak muncul di marketplace

---

## 🔍 **Possible Causes**

### **1. Cache/Refresh Delay** ⏰

**Problem:**
- Data di-cache selama beberapa detik
- Auto-refresh setiap 15 detik
- Asset baru bisa muncul dengan delay

**Solution:**
- ✅ Reduced cache time: 30s → 10s
- ✅ Faster auto-refresh: 60s → 15s
- ✅ Added "Refresh Now" button
- ✅ Refresh on window focus

**How to Fix:**
1. Click **"Refresh Now"** button (top-right di marketplace)
2. Or wait 15 seconds for auto-refresh
3. Or switch tab dan kembali (auto-refresh on focus)

---

### **2. Upload Incomplete** ❌

**Problem:**
- Upload process tidak selesai sempurna
- Registry registration failed
- Transaction tidak confirmed

**How to Check:**
Open console (F12) dan cari logs dari upload:

**Expected logs (Success):**
```javascript
🔄 Initializing file upload...
💰 Checking USDFC balance...
🔗 Setting up storage service...
📤 Uploading file to Filecoin...
✅ File uploaded! Piece CID: bafk...
📝 Checking marketplace registry...
✅ Asset registered successfully. Tx hash: 0x...
✅ Upload Complete!
🎊 Confetti triggered
```

**Problem logs (Failed):**
```javascript
❌ Failed to register asset
❌ Upload failed
⚠️ Transaction not confirmed
```

**Solution:**
- If upload failed → Try uploading again
- If registry failed → Asset uploaded but not listed
- Check transaction on explorer

---

### **3. Provider Not Indexed** 🔍

**Problem:**
- Asset uploaded to NEW provider
- Provider not yet indexed by useAllDatasets
- Provider ID > 100 (outside scan range)

**How to Check:**
```javascript
// In console, check provider ID
console.log("Provider ID:", yourProviderId);

// useAllDatasets scans provider IDs 0-10 and datasets 0-100
// If outside range → Won't show!
```

**Solution:**
- Use indexed provider (ID < 10)
- Or wait for full marketplace scan
- Or manually refresh

---

### **4. Filter Active** 🔎

**Problem:**
- Search term or filter active
- Asset doesn't match filter criteria
- Hidden by filter, not actually missing

**How to Check:**
1. Look at search box - is there text?
2. Check filter dropdown - is "All" selected?
3. Check status filter - is "Live" or "Inactive" selected?

**Solution:**
1. Clear search box (click X)
2. Set filters to "All"
3. Asset should appear

---

### **5. Dataset/Piece ID Mismatch** 🔢

**Problem:**
- Asset created with specific dataset/piece ID
- But marketplace looking for different ID
- ID mismatch causes not found

**How to Check:**
In console, check:
```javascript
📊 All datasets in marketplace: [
  { datasetId: 20, provider: "pspsps", payer: "0x4C61...", pieces: 1 },
  { datasetId: 29, provider: "pspsps", payer: "0x4C61...", pieces: 1 },
  // Is your new dataset here?
]
```

**Solution:**
- If dataset in list → Should show (check filters)
- If dataset NOT in list → Upload issue or cache

---

## 🔧 **Quick Fixes to Try**

### **Fix 1: Manual Refresh (Fastest)**

Click **"Refresh Now"** button at top of marketplace

**Expected:**
- Button shows "Refreshing..."
- Spinner icon rotates
- Data re-fetches from blockchain
- New asset appears

### **Fix 2: Clear Filters**

1. Clear search box (if has text)
2. Set Status filter to "All"
3. Set Provider filter to "All"
4. Set Sort to "Newest"

### **Fix 3: Switch Tab & Return**

1. Go to different tab (Dashboard, Upload, etc.)
2. Return to Marketplace
3. Auto-refresh triggers
4. Asset should appear

### **Fix 4: Hard Refresh**

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

Clears cache and reloads everything.

---

## 🧪 **Debug Steps**

### **Step 1: Check Console Logs**

Open F12 Console, look for:

```javascript
Marketplace data: { datasets: Array(X) }
Marketplace loading: false
Marketplace error: null

📊 All datasets in marketplace: [
  { datasetId: 20, ... },
  { datasetId: 29, ... },
  // YOUR NEW DATASET should be here!
]

All assets: X  // Total count
```

**Questions:**
- Is your new dataset in the array?
- Does total asset count increase?
- Any errors shown?

### **Step 2: Check Upload Completion**

Scroll up in console to find upload logs:

**Look for:**
```javascript
✅ File uploaded with Piece CID: bafk...
✅ Asset registered successfully
📝 Saved file metadata: { pieceCid: "bafk...", fileName: "..." }
```

**If missing:**
- Upload didn't complete
- Try uploading again

### **Step 3: Check Provider Info**

```javascript
// Should show your provider
Dataset 20 (pspsps): owner=0x4C6165..., pieces=1
Dataset 29 (pspsps): owner=0x4C6165..., pieces=1
Dataset XX (???): owner=0x4C6165..., pieces=1  // ← New one?
```

**If new dataset shown:**
- ✅ Upload succeeded
- ✅ Just need to refresh marketplace

**If NOT shown:**
- ❌ Upload issue
- Check upload logs for errors

---

## 📋 **Information to Provide**

If asset still not showing, provide:

### **1. Upload Info:**
- When did you upload? (how long ago?)
- Did you see "✅ Upload Complete" message?
- Did confetti appear?
- Any error messages during upload?

### **2. Console Logs:**

Copy-paste from browser console (F12):

```javascript
// Upload logs
🔄 Initializing file upload...
[COPY ALL UPLOAD LOGS]

// Marketplace logs
Marketplace data: { ... }
📊 All datasets in marketplace: [...]
All assets: X
```

### **3. Asset Info:**
- Expected dataset ID: ???
- File uploaded: ??? (filename)
- Provider used: ???
- Your wallet: 0x4C61...c5B6

### **4. Current Marketplace State:**
- How many assets showing? (should be 6)
- Any filters active? (search, status, provider)
- Which page? (1 of X)

---

## ⚡ **Quick Test**

Run this in browser console (F12):

```javascript
// Check if your new asset is in data
const marketplace = data; // From React DevTools or window
console.log("Total datasets:", marketplace?.datasets?.length);

// Filter by your address
const yourAssets = marketplace?.datasets?.filter(d => 
  d.payer === "0x4C6165286739696849Fb3e77A16b0639D762c5B6"
);
console.log("Your assets:", yourAssets);
console.log("Count:", yourAssets?.length);

// Should show 3 if new one uploaded (was 2 before)
```

---

## ✅ **Expected Behavior**

### **After Upload Success:**

```
Upload Complete! ✅
  ↓
Wait 0-15 seconds (auto-refresh)
  ↓
OR Click "Refresh Now" button
  ↓
Marketplace re-fetches data
  ↓
New asset appears! ✅
```

### **Timing:**

- **Immediate:** Upload completes, confetti shows
- **0-10 seconds:** Data cache expires
- **0-15 seconds:** Auto-refresh triggers
- **Or instant:** Click "Refresh Now" button

---

## 🆘 **Still Not Showing?**

Provide these details:

1. **Time since upload:** How many minutes ago?
2. **Upload completion:** Did you see "✅ Upload Complete!"?
3. **Console logs:** Copy all logs (upload + marketplace)
4. **Current count:** How many assets showing in marketplace?
5. **Filters:** Any search term or filters active?
6. **Tried refresh?** Did you click "Refresh Now" button?

---

**Quick Actions:**
1. ✅ Click "Refresh Now" button
2. ✅ Clear all filters
3. ✅ Check console logs
4. ✅ Provide debug info above

Let's find out why it's not showing! 🔍

