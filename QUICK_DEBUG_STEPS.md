# 🚨 QUICK DEBUG: Purchase Error SysErrContractReverted(33)

## ⚡ **LANGKAH CEPAT (5 Menit)**

### Step 1: Buka Browser Console
**Tekan F12 → Tab "Console"**

### Step 2: Cek Log "🛒 Purchase Debug Info"

Cari log seperti ini di console:
```javascript
🛒 Purchase Debug Info: {
  buyer: "0x...",
  seller: "0x..." atau "Unknown",  // ← CEK INI!
  sellerValid: true atau false,     // ← CEK INI!
  assetId: 123,
  price: "1.0",
  priceValid: true atau false,      // ← CEK INI!
  usdfcBalance: 100.50,
  filBalance: 0.5
}
```

### Step 3: Identifikasi Masalah

#### ❌ **MASALAH A: sellerValid = false**
```javascript
seller: "Unknown"
sellerValid: false  // ← INI MASALAHNYA!
```

**Artinya:** Asset tidak punya owner yang valid  
**Solusi:** Asset ini TIDAK BISA dibeli. Coba asset lain!

#### ❌ **MASALAH B: priceValid = false**
```javascript
price: "0" atau ""
priceValid: false  // ← INI MASALAHNYA!
```

**Artinya:** Harga tidak valid  
**Solusi:** Asset ini TIDAK BISA dibeli. Coba asset lain!

#### ❌ **MASALAH C: usdfcBalance < price**
```javascript
price: "10.0"
usdfcBalance: 5.0  // ← Kurang!
```

**Artinya:** Balance tidak cukup  
**Solusi:** 
1. Go to Dashboard
2. Click "Get USDFC" button
3. Atau buka: https://faucet.calibration.fildev.network/

#### ✅ **SEMUA OK: Tapi masih error**
```javascript
sellerValid: true  ✅
priceValid: true   ✅
usdfcBalance: 100  ✅ (lebih dari price)
```

**Jika semua OK tapi masih error → Lanjut ke Step 4**

---

### Step 4: Cek Transaction Logs

Cari log ini di console:
```javascript
Step 1: Approving USDFC...
✅ Approval tx sent: 0x...

⏳ Waiting for approval confirmation...
⚠️ Please wait, do not close the browser...

✅ Approval confirmed! Proceeding with payment...

Step 2: Processing payment...
```

**Di mana error terjadi?**

#### Scenario A: Error di Step 1 (Approval)
```javascript
Step 1: Approving USDFC...
❌ Error: ...
```

**Kemungkinan:**
- Insufficient tFIL for gas
- User rejected transaction
- Network issue

**Solusi:**
1. Check tFIL balance > 0.001
2. Don't reject MetaMask popup
3. Try again

#### Scenario B: Error di Step 2 (Payment)
```javascript
Step 1: ✅ Success
Step 2: Processing payment...
❌ SysErrContractReverted(33)
```

**Kemungkinan:**
1. **Approval belum confirmed** (most common!)
   - Solusi: WAIT 10-15 seconds, try again
   
2. **Seller address invalid setelah validation**
   - Solusi: Check seller address di UI
   
3. **Balance berubah saat transaction**
   - Solusi: Refresh page, check balance lagi

4. **Contract issue**
   - Solusi: Lihat Step 5

---

### Step 5: Cek Transaction di Explorer

1. Copy transaction hash dari console (jika ada)
2. Buka: https://calibration.filfox.info/en
3. Paste transaction hash
4. Lihat error message di explorer

**Common errors:**
- "Insufficient balance" → Get more USDFC
- "Transfer failed" → Seller address invalid
- "Reverted" → Contract issue

---

## 🎯 **SOLUSI BERDASARKAN MASALAH**

### 🔴 **Jika seller = "Unknown"**

**Asset page akan menunjukkan:**
```
⚠️ Cannot Purchase - Invalid Owner

This asset doesn't have a valid owner address recorded.

Owner: Unknown
```

**Apa yang harus dilakukan:**
1. ❌ JANGAN beli asset ini
2. ✅ Pilih asset lain dari marketplace
3. ✅ Upload asset baru dengan benar

**Kenapa terjadi:**
- Asset di-upload tanpa proper ownership
- Upload gagal di tengah jalan
- Data corrupt

---

### 🟡 **Jika balance tidak cukup**

**Dashboard akan menunjukkan:**
```
USDFC Balance: 5.00 USDFC
```

**Asset price:**
```
Price: 10.00 USDFC
```

**Solusi:**
1. Go to Dashboard
2. Scroll ke section "User Profile"
3. Click button **"Get USDFC"**
4. Atau manual: https://faucet.calibration.fildev.network/
5. Tunggu faucet transfer (~30 detik)
6. Refresh page
7. Try purchase lagi

---

### 🟢 **Jika approval gagal/belum confirmed**

**Gejala:**
- Step 1 success, Step 2 error
- Error: SysErrContractReverted(33)

**Solusi TERBAIK:**
1. **WAIT LONGER!** 
   - After confirm popup 1 → Count to 15
   - Then confirm popup 2
   
2. **Increase delay in code** (if technical):
   - Edit `hooks/usePaymentProcessing.ts`
   - Change: `setTimeout(..., 5000)` → `setTimeout(..., 15000)`
   
3. **Manual approval check:**
   ```javascript
   // In console, check allowance:
   const allowance = await readContract({
     address: '0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0',
     abi: [{
       "inputs": [{"name": "owner","type": "address"},{"name": "spender","type": "address"}],
       "name": "allowance",
       "outputs": [{"name": "","type": "uint256"}],
       "stateMutability": "view",
       "type": "function"
     }],
     functionName: 'allowance',
     args: ['YOUR_ADDRESS', '0xa4118fB7de0666ca38b4e2630204D0a49e486037']
   });
   console.log('Allowance:', allowance.toString());
   // Should be > 0 after approval
   ```

---

## 📊 **CHECKLIST SEBELUM PURCHASE**

Sebelum click "Buy", pastikan:

- [ ] ✅ Wallet connected
- [ ] ✅ On Filecoin Calibration testnet (Chain ID: 314159)
- [ ] ✅ USDFC balance >= asset price (check Dashboard)
- [ ] ✅ tFIL balance >= 0.001 (for gas fees)
- [ ] ✅ NO warning "Invalid Owner" on asset page
- [ ] ✅ Seller address bukan "Unknown"
- [ ] ✅ Price displayed > 0
- [ ] ✅ No pending transactions in MetaMask

---

## 🆘 **MASIH ERROR? BERIKAN INFO INI:**

Copy paste dari console:

**1. Purchase Debug Info:**
```
🛒 Purchase Debug Info: {
  [PASTE SEMUA ISI DI SINI]
}
```

**2. Transaction Parameters:**
```
📋 Transaction parameters: {
  [PASTE SEMUA ISI DI SINI]
}
```

**3. Balance Check:**
```
💰 Balance check: {
  [PASTE SEMUA ISI DI SINI]
}
```

**4. Error Message:**
```
[COPY FULL ERROR MESSAGE FROM CONSOLE]
```

**5. Asset Info:**
- Dataset ID: ???
- Piece ID: ???
- Seller shown in UI: ???
- Price shown: ???

**6. Your Info:**
- USDFC Balance (from Dashboard): ???
- tFIL Balance (from Dashboard): ???
- Wallet address: 0x...???...??? (first 6 + last 4)

---

## 🚀 **TRY THIS FIRST:**

### Quick Test dengan Asset Lain:

1. Go to Marketplace
2. Pilih asset BERBEDA
3. Check apakah ada warning "Invalid Owner"
4. Jika TIDAK ada warning → Try purchase
5. Jika SUCCESS → Asset pertama yang bermasalah
6. Jika MASIH ERROR → Ada issue lebih dalam

---

## ⚡ **EMERGENCY FIX:**

Jika terus error, coba ini:

### Fix 1: Clear Browser Cache
```
1. Ctrl + Shift + Delete
2. Clear cached images and files
3. Refresh page (Ctrl + F5)
```

### Fix 2: Reconnect Wallet
```
1. Disconnect wallet from site
2. Close browser
3. Open browser lagi
4. Connect wallet
5. Try purchase
```

### Fix 3: Switch Network
```
1. Switch to different network in MetaMask
2. Switch back to Filecoin Calibration
3. Try purchase
```

### Fix 4: Reset Approval
```
1. Set USDFC allowance to 0
2. Re-approve with new amount
3. Try purchase
```

---

**Tunggu feedback dari Anda dengan info di atas!** 🔍

