# Upload Troubleshooting Guide

## Error: "Internal JSON-RPC error" atau "SysErrContractReverted" saat registerAsset

### Penyebab Umum

Error ini terjadi saat memanggil `registerAsset()` pada AssetRegistry contract. Ada dua jenis error utama:

1. **Internal JSON-RPC error** - Network/RPC communication issue
2. **SysErrContractReverted** - Contract function execution failed (reverted)

Berikut adalah penyebab umum dan solusinya:

---

## 🔧 Solusi

### 1. Gas Fee Tidak Cukup

**Gejala:**
```
Internal JSON-RPC error.
Contract Call: registerAsset(...)
```

**Solusi:**
- Pastikan wallet Anda memiliki cukup **tFIL** untuk gas fees (minimal 0.001 tFIL)
- Dapatkan tFIL gratis dari faucet: https://faucet.calibnet.chainsafe-fil.io/
- Check balance di wallet: `https://calibration.filfox.info/en/address/YOUR_ADDRESS`

---

### 2. Network Connection Issue

**Gejala:**
- Transaksi gagal tanpa error message yang jelas
- Timeout saat confirmasi transaksi

**Solusi:**
1. **Refresh halaman** dan coba upload lagi
2. **Disconnect dan reconnect wallet** (klik alamat wallet → Disconnect → Connect lagi)
3. **Ganti RPC endpoint** di MetaMask:
   - Network Name: Filecoin Calibration
   - RPC URL: `https://api.calibration.node.glif.io/rpc/v1`
   - Chain ID: `314159`
   - Currency Symbol: `tFIL`
   - Block Explorer: `https://calibration.filfox.info/`

---

### 3. Price Conversion Error

**Gejala:**
- Error saat convert price value
- "Invalid BigInt value"

**Solusi:**
Sudah diperbaiki di kode. Sekarang price dikonversi dengan benar:
- ✅ Input price dalam ETH/USDFC (contoh: "1.3")
- ✅ Otomatis dikonversi ke Wei (1300000000000000000)
- ✅ Dikirim ke contract sebagai BigInt

---

### 4. Contract Not Responding

**Gejala:**
- Transaksi pending terlalu lama (> 5 menit)
- No confirmation dari blockchain

**Solusi:**
1. **Cancel transaksi pending:**
   - Buka MetaMask
   - Klik transaksi pending → Cancel
   - Speed up dengan gas fee lebih tinggi (optional)

2. **Reset MetaMask nonce:**
   - Settings → Advanced → Reset Account
   - ⚠️ Ini akan clear pending transactions

3. **Try again** dengan gas priority lebih tinggi

---

### 5. Duplicate Asset Registration (SysErrContractReverted) ⚠️ **MOST COMMON**

**Gejala:**
```
Error: SysErrContractReverted
Status: Transaction confirmed but execution reverted
```

**Solusi:**
Asset dengan `datasetId` dan `providerId` yang sama sudah terdaftar di marketplace.

**Fix yang sudah diterapkan:**
- ✅ Automatic duplicate detection sebelum registrasi
- ✅ Skip registration jika asset sudah ada
- ✅ File tetap berhasil diupload ke Filecoin
- ✅ Asset tetap bisa diakses via Filecoin storage

**User Action:**
- Tidak perlu action - sistem otomatis handle duplicate
- File sudah tersimpan di Filecoin
- Bisa dilihat di "My Assets" atau "Marketplace" tab

**Untuk memverifikasi:**
1. Buka Marketplace tab
2. Cari asset dengan dataset ID yang sama
3. Jika muncul, berarti asset sudah terdaftar ✅

---

### 6. Invalid Parameters (SysErrContractReverted)

**Gejala:**
```
Error: Contract execution failed
Invalid dataset or provider ID
```

**Penyebab:**
- `datasetId = 0` (upload belum selesai)
- `providerId = 0` (provider tidak valid)
- `pieceCid = ""` (CID kosong/corrupt)

**Solusi:**
1. **Tunggu upload selesai:**
   - Pastikan status "🌳 Data pieces added to dataset successfully"
   - Jangan close browser sebelum upload complete

2. **Check console logs:**
   ```javascript
   Registering asset with params: {
     datasetId: 20,    // ✅ Must be > 0
     providerId: 2,    // ✅ Must be > 0
     pieceCid: "bafk..." // ✅ Must not be empty
   }
   ```

3. **Retry upload:**
   - Refresh halaman
   - Upload file lagi dari awal

---

### 7. Dataset Tidak Ditemukan

**Gejala:**
```
Error: Dataset not found
```

**Solusi:**
- Pastikan file sudah **berhasil diupload ke Filecoin** sebelum register ke contract
- Lihat console log untuk `pieceCid` - harus ada value sebelum register
- Tunggu hingga status "🌳 Data pieces added to dataset successfully"

---

## 🔄 Automatic Features

Sistem sekarang sudah dilengkapi dengan **automatic protection**:

### 1. Duplicate Detection
```typescript
// Check sebelum registrasi
1. Query existing assets from contract
2. Compare datasetId + providerId
3. If duplicate → Skip registration ✅
4. If new → Proceed with registration
```

### 2. Automatic Retry
```typescript
// Retry untuk network errors
1. Upload attempt #1 → Network error
2. Wait 2 seconds
3. Upload attempt #2 → Network error  
4. Wait 2 seconds
5. Upload attempt #3 → Success or final error
```

### 3. Graceful Error Handling
```typescript
// Jika registration gagal tapi upload berhasil
1. File tetap tersimpan di Filecoin ✅
2. Bisa diakses via storage provider
3. Show success message
4. User tidak perlu re-upload
```

---

## 📊 Upload Flow

Berikut adalah complete flow saat upload asset:

```
1. 🔄 Initializing file upload to Filecoin...
2. 💰 Checking USDFC balance and storage allowances...
3. 🔗 Setting up storage service and dataset...
4. 📤 Uploading file to storage provider...
5. 📊 File uploaded! Signing msg to add pieces to the dataset
6. 🔄 Waiting for transaction to be confirmed on chain
7. 🌳 Data pieces added to dataset successfully
8. 📝 Registering asset in marketplace...     ← ERROR BIASANYA DI SINI
9. ⏳ Waiting for registry transaction confirmation...
10. ✅ Upload complete!
```

Jika error terjadi di step 8, berarti masalah ada di **registerAsset()** call.

---

## 🐛 Debug Mode

Untuk melihat detail error, buka **Browser Console** (F12):

```javascript
// Anda akan melihat log seperti ini:
Registering asset with params: {
  datasetId: 20,
  providerId: 2,
  pieceCid: "bafkzcibeyhjacc...",
  price: "1300000000000000000",
  retryAttempt: 0
}
```

Copy semua log ini jika membutuhkan bantuan debugging.

---

## ✅ Verifikasi Success

Setelah upload berhasil, verifikasi dengan:

1. **Check Marketplace Tab:**
   - Asset Anda harus muncul di grid
   - Price dan metadata harus benar

2. **Check Blockchain:**
   - Buka: `https://calibration.filfox.info/en/address/0x935f69f2A66FaF91004434aFc89f7180161db32d`
   - Lihat latest transactions - harus ada `registerAsset` call dari address Anda

3. **Check Console Log:**
   ```
   ✅ Asset registered successfully. Tx hash: 0x...
   ```

---

## 🆘 Still Having Issues?

Jika masih mengalami error setelah mencoba semua solusi di atas:

1. **Backup info berikut:**
   - Error message lengkap dari console
   - Transaction hash (jika ada)
   - Wallet address
   - Dataset ID dan Provider ID
   - Price yang diinput

2. **Check Contract Status:**
   ```
   AssetRegistry: 0x935f69f2A66FaF91004434aFc89f7180161db32d
   Status: ✅ Active
   ```

3. **Verify Wallet:**
   - Connected to Filecoin Calibration (Chain ID: 314159)
   - Has tFIL for gas fees
   - Not using VPN that might block RPC calls

---

## 📝 Common Error Messages

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Internal JSON-RPC error` | Network issue atau gas tidak cukup | Tambah tFIL, refresh, retry |
| `SysErrContractReverted` | Duplicate asset atau invalid params | Check console logs, auto-handled |
| `Asset already registered` | Dataset sudah ada di marketplace | ✅ Auto-skip, file tetap tersimpan |
| `Invalid dataset/provider` | Upload belum selesai atau gagal | Tunggu upload complete, retry |
| `user rejected transaction` | User cancel di wallet | Approve transaction di wallet |
| `insufficient funds` | Gas fee tidak cukup | Tambah tFIL dari faucet |
| `nonce too low` | Transaksi pending | Cancel pending tx di MetaMask |
| `Dataset not found` | File belum selesai upload | Tunggu upload selesai dulu |

---

## 🔗 Useful Links

- **Faucet tFIL:** https://faucet.calibnet.chainsafe-fil.io/
- **Block Explorer:** https://calibration.filfox.info/
- **AssetRegistry Contract:** https://calibration.filfox.info/en/address/0x935f69f2A66FaF91004434aFc89f7180161db32d
- **RPC Endpoint:** https://api.calibration.node.glif.io/rpc/v1

