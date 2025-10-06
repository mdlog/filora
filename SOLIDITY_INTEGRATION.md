# Solidity Smart Contracts Integration

## 📁 Folder Structure

```
solidity/
├── contracts/           # Solidity source code
│   ├── FilecoinPay.sol
│   ├── FiloraLicense1155.sol
│   ├── AssetRegistry.sol
│   └── LicenseVerifier.sol
├── artifacts/          # Compiled contracts (ABI + bytecode)
│   └── contracts/
│       ├── FilecoinPay.sol/
│       │   ├── FilecoinPay.json
│       │   └── FilecoinPay.dbg.json
│       └── ...
├── scripts/            # Deployment scripts
│   ├── deploy.js
│   └── deploy-registry.js
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Dependencies
```

---

## ✅ Integration Status

### FilecoinPay Contract
**Address:** `0xa4118fB7de0666ca38b4e2630204D0a49e486037`

#### Functions Integrated:

1. ✅ **processPayment(address to, uint256 amount, uint256 tokenId)**
   - Frontend: `hooks/usePaymentProcessing.ts`
   - Fixed: Removed extra `from` parameter (uses `msg.sender` automatically)
   
2. ✅ **setPrice(uint256 tokenId, uint256 price)**
   - Used during asset upload
   
3. ✅ **setRoyalty(uint256 tokenId, address creator, uint256 percentage)**
   - Used during asset registration
   
4. ✅ **withdrawRoyalties()**
   - Frontend: `components/marketplace/RoyaltyManager.tsx`
   
5. ✅ **assetPrice(uint256 tokenId) → uint256**
   - Frontend: `hooks/useAssetPrice.ts`
   - Fixed: Changed from `getPrice` to `assetPrice`
   
6. ✅ **pendingRoyalties(address creator) → uint256**
   - Frontend: `hooks/useRoyaltyInfo.ts`
   - Fixed: Changed from `getRoyaltyBalance` to `pendingRoyalties`

---

## 🔄 ABI Updates Applied

### Before (Incorrect):
```typescript
// Missing actual public variable functions
functionName: "getPrice"        // ❌ Doesn't exist
functionName: "getRoyaltyBalance" // ❌ Doesn't exist
```

### After (Correct):
```typescript
// Using actual Solidity public mappings
functionName: "assetPrice"       // ✅ From: mapping(uint256 => uint256) public assetPrice
functionName: "pendingRoyalties" // ✅ From: mapping(address => uint256) public pendingRoyalties
```

---

## 📊 Contract State Mappings

The contract has these public state variables that automatically create getter functions:

```solidity
mapping(uint256 => uint256) public royaltyPercentage;  // tokenId => percentage (basis points)
mapping(uint256 => address) public royaltyRecipient;   // tokenId => creator address
mapping(address => uint256) public pendingRoyalties;   // creator => pending amount
mapping(uint256 => uint256) public assetPrice;         // tokenId => price in USDFC
```

Each `public` mapping automatically gets a getter function in the ABI:
- `royaltyPercentage(uint256 tokenId) → uint256`
- `royaltyRecipient(uint256 tokenId) → address`
- `pendingRoyalties(address creator) → uint256`
- `assetPrice(uint256 tokenId) → uint256`

---

## 🔧 How to Update ABIs

### Option 1: Manual Update from Artifacts
```bash
cd solidity/
cat artifacts/contracts/FilecoinPay.sol/FilecoinPay.json | jq '.abi' > ../contracts/FilecoinPayABI.json
```

### Option 2: Copy Specific Functions
```bash
cd solidity/
cat artifacts/contracts/FilecoinPay.sol/FilecoinPay.json | jq '.abi | map(select(.type == "function"))'
```

### Option 3: Use Full ABI (Recommended for Development)
Import the entire compiled artifact:
```typescript
import FilecoinPayArtifact from '../solidity/artifacts/contracts/FilecoinPay.sol/FilecoinPay.json';
export const FilecoinPayABI = FilecoinPayArtifact.abi;
```

---

## 🚀 Deployment Process

### 1. Compile Contracts
```bash
cd solidity/
npm install
npx hardhat compile
```

### 2. Deploy to Testnet
```bash
npx hardhat run scripts/deploy.js --network calibration
```

### 3. Update Frontend Addresses
After deployment, update `contracts/addresses.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  FiloraLicense1155: "0x...",  // From deployment output
  FilecoinPay: "0x...",
  LicenseVerifier: "0x...",
  AssetRegistry: "0x...",
  USDFC: "0x..."
};
```

### 4. Update ABIs (if contract changed)
```bash
# Extract new ABI
cd solidity/
cat artifacts/contracts/FilecoinPay.sol/FilecoinPay.json | jq '.abi' > temp_abi.json

# Copy functions to contracts/abis.ts
# Update const FilecoinPayABI = [...]
```

---

## 📝 Contract Verification Checklist

Before deploying/updating contracts:

- [ ] Solidity version matches (^0.8.20)
- [ ] OpenZeppelin contracts version matches (^5.0.1)
- [ ] All imports resolve correctly
- [ ] Compilation succeeds without errors
- [ ] Function signatures match frontend calls
- [ ] Event names match frontend listeners
- [ ] Access control is properly set
- [ ] ReentrancyGuard on payable functions
- [ ] Test on local network first
- [ ] Test on testnet before mainnet

---

## 🧪 Testing Smart Contracts

### Run Unit Tests
```bash
cd solidity/
npx hardhat test
```

### Test Specific Function
```bash
npx hardhat test --grep "processPayment"
```

### Gas Report
```bash
REPORT_GAS=true npx hardhat test
```

---

## 🔍 Debugging Contract Calls

### Console Logging in Frontend
```typescript
console.log("Calling processPayment with:", {
  to: sellerAddress,
  amount: amountWei.toString(),
  tokenId: tokenId
});

const result = await writeContractAsync({
  address: CONTRACT_ADDRESSES.FilecoinPay,
  abi: FilecoinPayABI,
  functionName: "processPayment",
  args: [sellerAddress, amountWei, BigInt(tokenId)]
});

console.log("Transaction hash:", result);
```

### Check Transaction on Explorer
```
https://calibration.filfox.info/en/tx/{transaction_hash}
```

### Verify Contract State
```typescript
// Check if price is set
const price = await readContract({
  address: CONTRACT_ADDRESSES.FilecoinPay,
  abi: FilecoinPayABI,
  functionName: "assetPrice",
  args: [BigInt(tokenId)]
});
console.log("Asset price:", formatEther(price));

// Check royalty recipient
const creator = await readContract({
  address: CONTRACT_ADDRESSES.FilecoinPay,
  abi: FilecoinPayABI,
  functionName: "royaltyRecipient",
  args: [BigInt(tokenId)]
});
console.log("Royalty recipient:", creator);
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Function Not Found
**Error:** `Function "getPrice" not found in ABI`

**Solution:** Check actual function name in contract:
```solidity
// If you have: mapping(uint256 => uint256) public assetPrice;
// The getter is: assetPrice(uint256), not getPrice(uint256)
```

### Issue 2: Parameter Mismatch
**Error:** `SysErrContractReverted(33)`

**Solution:** Count parameters in contract vs frontend call:
```solidity
// Contract: function processPayment(address to, uint256 amount, uint256 tokenId)
// Frontend must send exactly 3 args, not 4!
```

### Issue 3: ABI Out of Sync
**Error:** Various unexplained reverts

**Solution:** Re-extract ABI after contract changes:
```bash
cd solidity/
npx hardhat clean
npx hardhat compile
# Copy new ABI to frontend
```

---

## 📚 Related Files

### Frontend Integration:
- `contracts/abis.ts` - Contract ABIs
- `contracts/addresses.ts` - Deployed addresses
- `hooks/usePaymentProcessing.ts` - Payment logic
- `hooks/useAssetPrice.ts` - Price queries
- `hooks/useRoyaltyInfo.ts` - Royalty queries

### Smart Contracts:
- `solidity/contracts/FilecoinPay.sol` - Payment contract
- `solidity/contracts/FiloraLicense1155.sol` - NFT contract
- `solidity/contracts/AssetRegistry.sol` - Registry contract
- `solidity/contracts/LicenseVerifier.sol` - Verifier contract

### Documentation:
- `CONTRACT_FIX_SYSERR33.md` - Purchase error fix
- `SMART_CONTRACTS.md` - Contract overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

---

## 🎯 Key Learnings

1. **Public Mappings Create Getters**
   - Solidity `public` keyword auto-generates getter functions
   - Name in ABI = mapping name, not custom getter name

2. **Parameter Count Must Match**
   - Extra/missing parameters cause contract revert
   - `msg.sender` is implicit, don't pass as parameter

3. **ABI Must Match Deployed Contract**
   - Re-compile after any contract changes
   - Extract fresh ABI from artifacts
   - Test thoroughly after updates

4. **Testnet Can Be Slow**
   - Add delays between dependent transactions
   - Wait for confirmations before next call
   - Increase timeouts for testnet

---

## 📞 Support

If you encounter issues:

1. Check contract on explorer: https://calibration.filfox.info/en
2. Verify function exists in ABI
3. Compare parameters with contract
4. Check console logs for errors
5. Test contract call in hardhat console

**Deployed Contracts:**
- FilecoinPay: `0xa4118fB7de0666ca38b4e2630204D0a49e486037`
- All contracts: See `contracts/addresses.ts`

---

## ✅ Integration Complete

All smart contract functions are now properly integrated with correct ABIs and parameters! 🎉

**Last Updated:** October 6, 2025

