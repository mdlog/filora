# Debug Purchase Error: SysErrContractReverted(33)

## 🐛 Error Reported
**Error:** `SysErrContractReverted(33)` during asset purchase

## 🔍 Debug Checklist

### Step 1: Open Browser Console (F12)
Look for the debug logs we added:

```javascript
🛒 Purchase Debug Info: {
  buyer: "0x...",
  seller: "???",  // ← Check this!
  sellerValid: true/false,
  assetId: ???,
  price: "???",
  ...
}
```

**Critical Questions:**
- Is `sellerValid` = `true`?
- Is `seller` a valid address (starts with 0x)?
- Is `price` > 0?

### Step 2: Check Validation Errors

Look for these console errors:

```javascript
❌ Seller validation failed: {
  seller: "Unknown",
  isUnknown: true,
  message: "..."
}
```

If you see this → Asset has no valid owner, cannot purchase!

### Step 3: Check Transaction Parameters

```javascript
📋 Transaction parameters: {
  function: "processPayment",
  to: "0x...",  // ← Should be valid address
  amount: "1.0",
  amountWei: "1000000000000000000",
  tokenId: 123
}
```

**Questions:**
- Is `to` address valid?
- Is `amount` correct?
- Is `tokenId` correct?

### Step 4: Check Balance & Allowance

```javascript
💰 Balance check: {
  required: "1000000000000000000",
  requiredFormatted: "1.0 USDFC",
  available: "...",
  availableFormatted: "... USDFC",
  hasEnough: true/false
}
```

**If `hasEnough` = false → Get more USDFC from faucet!**

---

## 🎯 Most Common Causes

### Cause 1: Invalid Seller Address ⚠️
**Problem:** `seller = "Unknown"` or invalid address

**How to check:**
1. Open browser console
2. Look for: `sellerValid: false`
3. Check seller value

**Solution:**
- This asset cannot be purchased (no valid owner)
- Try a different asset
- Or re-upload the asset properly

### Cause 2: Insufficient USDFC Balance 💰
**Problem:** Not enough USDFC to complete purchase

**How to check:**
1. Dashboard → Check USDFC balance
2. Console → Check `hasEnough: false`

**Solution:**
```
Go to Dashboard → Click "Get USDFC" button
Or visit: https://faucet.calibration.fildev.network/
```

### Cause 3: Approval Not Confirmed ⏳
**Problem:** USDFC approval transaction not confirmed yet

**How to check:**
1. Did you wait 5-10 seconds after first MetaMask popup?
2. Check transaction on explorer

**Solution:**
- Wait longer between approve and payment
- Try purchase again (will re-approve)

### Cause 4: Price Not Set in Contract 📊
**Problem:** Asset price = 0 or not set in contract

**How to check in browser console:**
```javascript
// Replace YOUR_DATASET_ID with actual ID
const price = await readContract({
  address: '0xa4118fB7de0666ca38b4e2630204D0a49e486037',
  abi: FilecoinPayABI,
  functionName: 'assetPrice',
  args: [BigInt(YOUR_DATASET_ID)]
});
console.log('Price in contract:', price.toString());
```

**If price = 0 → Asset not properly registered!**

---

## 🔧 Quick Fixes to Try

### Fix 1: Check Seller Address in UI

Before clicking "Buy", check the asset detail page:

**Look for warning:**
```
⚠️ Cannot Purchase - Invalid Owner

Owner: Unknown
```

**If you see this → DO NOT attempt purchase!**

### Fix 2: Verify Your Balances

Go to Dashboard and check:
- ✅ USDFC Balance > Asset Price
- ✅ tFIL Balance > 0.001 (for gas)

**If insufficient → Get tokens from faucet**

### Fix 3: Wait Longer Between Transactions

After first MetaMask popup (Approve):
1. Click "Confirm"
2. **WAIT 10 seconds** (count to 10!)
3. Then confirm second popup (Payment)

### Fix 4: Try Different Asset

If one asset fails:
1. Go back to Marketplace
2. Try purchasing a different asset
3. Check if same error occurs

---

## 📊 Error Scenarios

### Scenario A: Validation Caught Error ✅
```
Console shows:
❌ Seller validation failed

UI shows:
⚠️ Invalid seller address: "Unknown"
```

**This is GOOD** - Validation working, no transaction sent!
**Action:** Find asset with valid owner

### Scenario B: Transaction Sent but Reverted ❌
```
Console shows:
Step 1: Approving USDFC... ✅
Step 2: Processing payment... ❌
Error: SysErrContractReverted(33)
```

**This is BAD** - Validation passed, but contract reverted
**Possible causes:**
1. Seller address became invalid between validation and tx
2. Insufficient balance (changed during tx)
3. Contract bug or network issue
4. Price mismatch

---

## 🧪 Debug Commands

### Check Asset Owner
```javascript
// In browser console on asset page
console.log("Owner:", asset.owner);
console.log("Valid?", asset.owner && asset.owner.startsWith("0x"));
```

### Check Your USDFC Balance
```javascript
// Check current balance
const balance = await readContract({
  address: '0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0',
  abi: USDFCABI,
  functionName: 'balanceOf',
  args: ['YOUR_WALLET_ADDRESS']
});
console.log('USDFC Balance:', formatEther(balance));
```

### Check Allowance
```javascript
// Check if approval is sufficient
const allowance = await readContract({
  address: '0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0',
  abi: USDFCABI,
  functionName: 'allowance',
  args: ['YOUR_WALLET_ADDRESS', '0xa4118fB7de0666ca38b4e2630204D0a49e486037']
});
console.log('Allowance:', formatEther(allowance));
```

---

## 📋 Information to Provide

If error persists, provide:

1. **Asset Info:**
   - Dataset ID: ???
   - Piece ID: ???
   - Price shown in UI: ???
   - Seller address shown: ???

2. **Console Logs:**
   - Copy full "🛒 Purchase Debug Info"
   - Copy any error messages (red text)
   - Copy transaction hashes if available

3. **Your Balances:**
   - USDFC balance: ???
   - tFIL balance: ???

4. **Transaction Details:**
   - Did first MetaMask popup appear? Yes/No
   - Did you confirm it? Yes/No
   - Did second popup appear? Yes/No
   - Error appeared after which popup?

5. **Browser Console Screenshot:**
   - Take screenshot of F12 console
   - Show all logs from purchase attempt

---

## ✅ Success Criteria

Purchase should work if:
- ✅ Seller address is valid (0x... format)
- ✅ USDFC balance >= asset price
- ✅ tFIL balance >= 0.001
- ✅ No validation errors in console
- ✅ Waited 5-10 seconds between popups

---

**Next Steps:**
1. Open browser console (F12)
2. Copy all logs related to purchase
3. Check seller address in UI
4. Verify your balances
5. Provide information above for further debugging
