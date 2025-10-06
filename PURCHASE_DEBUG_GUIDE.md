# Purchase Transaction Revert - Debug Guide

## 🐛 Error: "Transaction reverted"

You're getting this error even after the parameter fixes. Let's debug systematically.

---

## 🔍 Most Likely Causes

### 1. **Asset Price Not Set in Contract** (Most Common)
The `processPayment` function transfers tokens, but there's NO validation that price is set.

**Problem:**
```solidity
function processPayment(address to, uint256 amount, uint256 tokenId) external nonReentrant {
    require(usdfc.balanceOf(msg.sender) >= amount, "Insufficient balance");
    
    // ⚠️ NO CHECK if assetPrice[tokenId] is set!
    // ⚠️ NO CHECK if 'to' address is valid!
    
    uint256 royaltyAmount = 0;
    address creator = royaltyRecipient[tokenId];
    // ... rest of logic
}
```

**Solution:** Check if price is actually set in the contract for your asset.

---

### 2. **Invalid Seller Address**
If `seller` is "Unknown", undefined, or `address(0)`, the transaction will fail.

**Check in your code:**
```typescript
seller={asset.owner}  // What is asset.owner?
```

If `asset.owner` = "Unknown" → Transaction will revert!

---

### 3. **Allowance Expired or Not Confirmed**
Testnet can be slow. The approval might not be confirmed yet when payment is processed.

---

## 🧪 Debugging Steps

### Step 1: Check Console Logs

When you try to purchase, check browser console (F12) for these logs:

```javascript
"Processing payment:" { from: "0x...", to: "0x...", amount: "...", tokenId: ... }
"Balance check:" { required: "...", available: "...", hasEnough: true }
"Step 1: Approving USDFC..."
"✅ Approval tx sent:" "0x..."
"⏳ Waiting for approval confirmation..."
"✅ Approval confirmed! Proceeding with payment..."
"Step 2: Processing payment..."
```

**Where does it fail?**
- If it fails at "Step 2" → Likely seller address or price issue
- If it fails immediately → Balance or allowance issue

---

### Step 2: Check Asset Owner/Seller

Add this debug code to `app/assets/[datasetId]/[pieceId]/page.tsx`:

```typescript
// Around line 30-40
useEffect(() => {
  if (assetData) {
    console.log("🔍 DEBUG ASSET DATA:", {
      datasetId,
      pieceId,
      owner: asset.owner,
      ownerType: typeof asset.owner,
      ownerIsValid: asset.owner && asset.owner !== "Unknown" && asset.owner !== "null",
      price: displayPrice,
      priceIsValid: displayPrice && parseFloat(displayPrice) > 0
    });
  }
}, [assetData, displayPrice]);
```

**Expected Output:**
```
🔍 DEBUG ASSET DATA: {
  datasetId: 123,
  pieceId: 1,
  owner: "0xabc123...",  // ✅ Should be valid address
  ownerType: "string",
  ownerIsValid: true,
  price: "1.0",
  priceIsValid: true
}
```

**If owner is "Unknown" or null:**
- The transaction WILL FAIL
- Asset doesn't have proper ownership recorded

---

### Step 3: Check Contract State

Open browser console and run:

```javascript
// Import contracts at top of page if not already
import { useReadContract } from 'wagmi';
import { FilecoinPayABI } from '@/contracts/abis';

// Then in console or add to page:
const checkContractState = async () => {
  // Replace with your actual datasetId
  const tokenId = YOUR_DATASET_ID;
  
  // 1. Check if price is set
  const price = await readContract({
    address: '0xa4118fB7de0666ca38b4e2630204D0a49e486037',
    abi: FilecoinPayABI,
    functionName: 'assetPrice',
    args: [BigInt(tokenId)]
  });
  console.log('📊 Asset Price in Contract:', price.toString());
  console.log('Is price set?', price > 0n);
  
  // 2. Check royalty recipient
  const creator = await readContract({
    address: '0xa4118fB7de0666ca38b4e2630204D0a49e486037',
    abi: FilecoinPayABI,
    functionName: 'royaltyRecipient',
    args: [BigInt(tokenId)]
  });
  console.log('👤 Creator/Royalty Recipient:', creator);
  
  // 3. Check royalty percentage
  const percentage = await readContract({
    address: '0xa4118fB7de0666ca38b4e2630204D0a49e486037',
    abi: FilecoinPayABI,
    functionName: 'royaltyPercentage',
    args: [BigInt(tokenId)]
  });
  console.log('💎 Royalty Percentage:', percentage.toString(), 'basis points');
};

checkContractState();
```

**Expected Results:**
- ✅ Asset Price > 0
- ✅ Creator address is valid (or address(0) if no royalty)
- ✅ Royalty percentage ≤ 10000

**If Asset Price = 0:**
- This is NOT validated in the contract
- But it might cause issues with royalty calculation
- Price should match what's shown in UI

---

### Step 4: Check USDFC Balance & Allowance

```javascript
const checkBalanceAndAllowance = async () => {
  const yourAddress = 'YOUR_WALLET_ADDRESS';
  const filecoinPayAddress = '0xa4118fB7de0666ca38b4e2630204D0a49e486037';
  const usdfcAddress = '0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0';
  
  // Check balance
  const balance = await readContract({
    address: usdfcAddress,
    abi: USDFCABI,
    functionName: 'balanceOf',
    args: [yourAddress]
  });
  console.log('💰 USDFC Balance:', formatEther(balance), 'USDFC');
  
  // Check allowance
  const allowance = await readContract({
    address: usdfcAddress,
    abi: USDFCABI,
    functionName: 'allowance',
    args: [yourAddress, filecoinPayAddress]
  });
  console.log('✅ Allowance:', formatEther(allowance), 'USDFC');
  console.log('Allowance sufficient?', allowance >= parseEther('ASSET_PRICE'));
};

checkBalanceAndAllowance();
```

---

## 🔧 Quick Fixes

### Fix 1: Validate Seller Address

Update `PurchaseModal.tsx` to add validation:

```typescript
const handlePurchase = async () => {
  if (!address) {
    setError("Please connect your wallet");
    return;
  }

  // ✅ ADD THIS VALIDATION
  if (!seller || seller === "Unknown" || seller === "null" || !seller.startsWith("0x")) {
    setError("❌ Invalid seller address. This asset may not have an owner recorded. Cannot purchase.");
    console.error("Invalid seller:", seller);
    return;
  }

  try {
    setError("");
    // ... rest of code
```

### Fix 2: Add Longer Delay Between Transactions

In `hooks/usePaymentProcessing.ts`, increase the delay:

```typescript
// Change from 5000 to 8000 or 10000
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
```

### Fix 3: Validate Price

Add price validation in `PurchaseModal`:

```typescript
const handlePurchase = async () => {
  // ... existing validations ...
  
  // ✅ ADD PRICE VALIDATION
  if (!price || parseFloat(price) <= 0) {
    setError("❌ Invalid asset price. Cannot process purchase.");
    console.error("Invalid price:", price);
    return;
  }
  
  // ... rest of code
```

---

## 📊 Transaction Failure Checklist

When purchase fails, check:

- [ ] **Seller address is valid** (not "Unknown", starts with 0x)
- [ ] **Price is set and > 0** (both in UI and contract)
- [ ] **USDFC balance >= price** (check Dashboard)
- [ ] **tFIL balance >= 0.001** (for gas fees)
- [ ] **Approval transaction confirmed** (check block explorer)
- [ ] **No pending transactions** (in MetaMask)
- [ ] **On Filecoin Calibration testnet** (Chain ID: 314159)
- [ ] **Waited 5-10 seconds** between approve and payment

---

## 🎯 Enhanced Purchase Modal

Add comprehensive logging and validation:

```typescript
const handlePurchase = async () => {
  console.log("🛒 Purchase Debug Info:", {
    buyer: address,
    seller: seller,
    sellerValid: seller && seller !== "Unknown" && seller.startsWith("0x"),
    assetId,
    pieceId,
    price,
    priceValid: price && parseFloat(price) > 0,
    usdfcBalance: balances?.usdfcBalanceFormatted,
    filBalance: balances?.filBalanceFormatted
  });

  // Validation 1: Wallet connected
  if (!address) {
    setError("Please connect your wallet");
    return;
  }

  // Validation 2: Valid seller
  if (!seller || seller === "Unknown" || seller === "null" || !seller.startsWith("0x")) {
    setError(`❌ Invalid seller address: "${seller}". This asset doesn't have a valid owner. Cannot purchase.`);
    console.error("Seller validation failed:", seller);
    return;
  }

  // Validation 3: Valid price
  if (!price || parseFloat(price) <= 0) {
    setError(`❌ Invalid price: "${price}". Cannot process purchase.`);
    console.error("Price validation failed:", price);
    return;
  }

  // Validation 4: Don't buy from yourself
  if (seller.toLowerCase() === address.toLowerCase()) {
    setError("❌ You cannot purchase your own asset!");
    return;
  }

  try {
    setError("");

    // Check USDFC balance
    const priceWei = parseEther(price);
    const usdfcBalance = balances?.usdfcBalance || BigInt(0);

    console.log("💰 Balance check:", {
      required: priceWei.toString(),
      requiredFormatted: price + " USDFC",
      available: usdfcBalance.toString(),
      availableFormatted: formatEther(usdfcBalance) + " USDFC",
      hasEnough: usdfcBalance >= priceWei,
    });

    if (usdfcBalance < priceWei) {
      setError(`Insufficient USDFC balance. You need ${price} USDFC but only have ${formatEther(usdfcBalance)} USDFC. Please get more USDFC tokens from the faucet.`);
      return;
    }

    // Process payment with full logging
    console.log("🛒 Starting purchase process...");
    console.log("📋 Transaction parameters:", {
      to: seller,
      amount: price,
      amountWei: priceWei.toString(),
      tokenId: assetId
    });
    
    const result = await processPayment.mutateAsync({
      to: seller,
      amount: price,
      tokenId: assetId,
    });

    console.log("✅ Payment completed successfully!");
    console.log("Transaction hashes:", result);
    
    // ... rest of code
```

---

## 🚨 Common Error Messages Decoded

### "Insufficient balance"
- Contract is checking: `usdfc.balanceOf(msg.sender) >= amount`
- You don't have enough USDFC
- Get more from faucet

### "Transfer to seller failed"
- Contract call: `usdfc.transferFrom(msg.sender, to, sellerAmount)`
- Possible causes:
  1. Allowance not set or expired
  2. Seller address is invalid
  3. Your USDFC balance changed between check and transfer

### "No royalties" (when withdrawing)
- You're trying to withdraw but have no pending royalties
- Only creators get royalties when their assets are purchased

### Generic "revert" or "ContractReverted(33)"
- Could be any require() statement failing
- Check ALL validations mentioned above
- Add console.log before each contract call

---

## 📞 Still Stuck?

If purchase still fails after all checks:

1. **Copy full error message** from console
2. **Check transaction on block explorer:**
   - Go to: https://calibration.filfox.info/en
   - Search your wallet address
   - Find the failed transaction
   - Look at "Error Message" field
   
3. **Provide debug info:**
   - Asset ID (datasetId) you're trying to buy
   - Your wallet address (first 6 + last 4 chars)
   - Seller address shown
   - Price shown
   - Full console logs
   - Transaction hash (if available)

---

## ✅ Success Criteria

Purchase should succeed if:
- ✅ Seller address is valid (0x... format, not "Unknown")
- ✅ Price is set and matches contract state
- ✅ USDFC balance >= price
- ✅ tFIL balance >= 0.001 (for gas)
- ✅ Approval confirmed on blockchain
- ✅ No other pending transactions
- ✅ Waited appropriate time between transactions

---

**Last Updated:** October 6, 2025

