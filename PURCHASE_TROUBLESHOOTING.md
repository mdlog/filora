# Purchase Troubleshooting Guide

## Common Purchase Errors and Solutions

### 1. "Internal JSON-RPC error" during `processPayment`

**Error Message:**
```
The contract function "processPayment" reverted with the following reason:
Internal JSON-RPC error.
```

**Common Causes:**

#### A. Insufficient USDFC Balance
- **Symptom**: Error occurs immediately after MetaMask confirmation
- **Solution**: 
  1. Check your USDFC balance in the Dashboard
  2. Get more USDFC from the faucet: [Filecoin Calibration Faucet](https://faucet.calibration.fildev.network/)
  3. Make sure you have at least the asset price amount in USDFC

#### B. Approval Failed
- **Symptom**: Error occurs during the approval transaction
- **Solution**:
  1. Make sure you confirm BOTH MetaMask popups:
     - First popup: Approve USDFC spending
     - Second popup: Process payment
  2. If you reject the first popup, the purchase will fail
  3. Try the purchase again and confirm both transactions

#### C. Gas Fee Issues
- **Symptom**: Transaction fails or stuck pending
- **Solution**:
  1. Make sure you have enough FIL for gas fees (usually < 0.001 FIL)
  2. Get FIL from: [Filecoin Calibration Faucet](https://faucet.calibration.fildev.network/)
  3. Wait for any pending transactions to complete before trying again

#### D. Network Congestion
- **Symptom**: Transaction takes very long or times out
- **Solution**:
  1. Wait a few minutes and try again
  2. Check network status at [Filecoin Status](https://status.filecoin.io/)
  3. Increase gas price in MetaMask (Advanced settings)

---

## Purchase Flow Breakdown

### Step 1: Balance Check (Client-side)
```
✅ Checking USDFC balance...
✅ You have enough USDFC
```
- The system checks if you have enough USDFC before initiating the transaction
- If insufficient, you'll get a clear error message with your current balance

### Step 2: Approve USDFC Spending
```
MetaMask Popup #1: Approve USDFC
- This allows FilecoinPay contract to spend your USDFC
- You must confirm this transaction
```
- **IMPORTANT**: Don't reject this popup!
- This sets an allowance for the FilecoinPay contract

### Step 3: Process Payment
```
MetaMask Popup #2: Process Payment
- This transfers USDFC to seller and creator (royalty)
- This also mints your NFT license
```
- This is the actual payment transaction
- After confirmation, you'll receive your NFT license

### Step 4: Record Purchase
```
✅ Payment successful!
✅ NFT license minted
✅ Purchase recorded locally
```
- Your purchase is saved to localStorage
- You can now access the asset from "Purchased" tab

---

## Debug Information

### What the System Logs:

1. **Payment Processing**:
```javascript
Processing payment: {
  from: "0x...",
  to: "0x...",
  amount: "1.0",
  amountWei: "1000000000000000000",
  tokenId: 42
}
```

2. **Balance Check**:
```javascript
Balance check: {
  required: "1000000000000000000",
  available: "5000000000000000000",
  hasEnough: true
}
```

3. **Approval Transaction**:
```javascript
Step 1: Approving USDFC...
✅ Approval tx sent: 0x...
Waiting for approval confirmation...
```

4. **Payment Transaction**:
```javascript
Step 2: Processing payment...
✅ Payment tx sent: 0x...
```

### How to Check Your USDFC Balance:

1. **Option 1: Dashboard Tab**
   - Go to "Dashboard" tab
   - Check "Storage Balance" section
   - Shows your USDFC balance

2. **Option 2: MetaMask**
   - Open MetaMask
   - Add USDFC as custom token:
     - Contract: `0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0`
     - Symbol: `USDFC`
     - Decimals: `18`

3. **Option 3: Block Explorer**
   - Visit: https://calibration.filfox.info/en/address/YOUR_ADDRESS
   - Look for USDFC token balance

---

## Error Prevention Tips

### Before Making a Purchase:

1. ✅ **Check USDFC Balance**
   - Go to Dashboard tab
   - Verify you have enough USDFC (asset price + buffer)

2. ✅ **Check FIL Balance for Gas**
   - Open MetaMask
   - Make sure you have at least 0.001 FIL

3. ✅ **Clear Pending Transactions**
   - Open MetaMask
   - Cancel or wait for any pending transactions to complete

4. ✅ **Good Network Connection**
   - Make sure your internet is stable
   - Avoid switching networks during purchase

### During Purchase:

1. ✅ **Confirm Both Popups**
   - First popup: Approve (don't reject!)
   - Second popup: Process Payment

2. ✅ **Don't Close Browser**
   - Wait for both transactions to complete
   - You'll see success confetti when done

3. ✅ **Watch Console Logs** (Optional)
   - Open Browser DevTools (F12)
   - Console tab shows detailed progress

---

## Enhanced Error Handling (New Features)

### Automatic Balance Check
- ✅ System checks USDFC balance before initiating transactions
- ✅ Clear error message if insufficient funds
- ✅ Shows exactly how much more USDFC you need

### Better Error Messages
- ✅ User-friendly error descriptions
- ✅ Specific solutions for each error type
- ✅ Links to faucets and resources

### Transaction Confirmation Wait
- ✅ 2-second delay between approve and payment
- ✅ Ensures approval is processed before payment
- ✅ Reduces "allowance not set" errors

### Detailed Logging
- ✅ Console logs show each step
- ✅ Easy to debug issues
- ✅ Helpful for support requests

---

## Still Having Issues?

### Check Contract Status:

1. **FilecoinPay Contract**: `0xa4118fB7de0666ca38b4e2630204D0a49e486037`
2. **USDFC Contract**: `0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0`

### Verify on Block Explorer:
- Visit: https://calibration.filfox.info/en
- Search for contract addresses above
- Verify contracts are active

### Get Help:
1. Copy the full error message from console
2. Include your wallet address (first and last 6 characters only)
3. Include the asset ID you're trying to purchase
4. Include screenshots if possible

---

## Summary of Fix (October 2025)

### What Was Fixed:

1. **Added Balance Check**
   - Client-side USDFC balance validation before transaction
   - Clear error messages with exact balance information

2. **Enhanced Error Handling**
   - Better error messages for common issues
   - Specific solutions for each error type
   - Helpful links to faucets and resources

3. **Transaction Flow Improvements**
   - Added delay between approve and payment transactions
   - Better logging for debugging
   - Explicit transaction confirmation waits

4. **User Experience**
   - Shows required vs available USDFC
   - Guides user to faucet if needed
   - Processing indicators for each step

### Files Modified:
- `hooks/usePaymentProcessing.ts`: Enhanced error handling, logging, transaction delays
- `components/marketplace/PurchaseModal.tsx`: Added balance check, better error messages
- `PURCHASE_TROUBLESHOOTING.md`: This documentation

---

## Quick Troubleshooting Checklist

- [ ] I have enough USDFC (check Dashboard)
- [ ] I have enough FIL for gas (check MetaMask)
- [ ] No pending transactions (check MetaMask)
- [ ] I'm on Filecoin Calibration testnet
- [ ] I confirmed BOTH MetaMask popups
- [ ] I waited for transactions to complete
- [ ] My internet connection is stable
- [ ] I checked the console for error details

If all checked and still failing, the issue might be:
- Smart contract issue (check block explorer)
- Network congestion (wait and retry)
- Wallet/RPC issue (try different RPC endpoint)

