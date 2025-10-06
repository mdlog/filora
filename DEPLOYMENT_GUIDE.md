# 🚀 Smart Contract Deployment Guide

Complete guide to deploy Filora smart contracts to Filecoin Calibration testnet.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ MetaMask or another Web3 wallet
- ✅ Wallet connected to Filecoin Calibration network (Chain ID: 314159)
- ✅ tFIL tokens for gas fees ([Get from faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html))
- ✅ Your wallet's private key

## 🔧 Step 1: Setup Environment

### 1.1 Navigate to solidity folder
```bash
cd solidity
```

### 1.2 Install dependencies
```bash
npm install
```

### 1.3 Create .env file
```bash
cp .env.example .env
```

### 1.4 Add your private key to .env
```bash
# Edit .env file
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

**⚠️ IMPORTANT:** 
- Never commit .env file to git
- Keep your private key secure
- Use a testnet wallet, not your main wallet

## 💰 Step 2: Get Testnet Tokens

### 2.1 Get tFIL (for gas fees)
1. Visit: https://faucet.calibnet.chainsafe-fil.io/funds.html
2. Enter your wallet address
3. Request tFIL tokens
4. Wait for confirmation (~1-2 minutes)

### 2.2 Verify balance
Check your wallet has at least 1 tFIL for deployment.

## 🚀 Step 3: Deploy Contracts

### 3.1 Compile contracts
```bash
npm run compile
```

Expected output:
```
Compiled 3 Solidity files successfully
```

### 3.2 Deploy to Calibration testnet
```bash
npm run deploy
```

Expected output:
```
🚀 Deploying Filora Smart Contracts to Filecoin Calibration...

Deploying with account: 0x...
Account balance: ...

📝 Deploying FiloraLicense1155...
✅ FiloraLicense1155 deployed to: 0x...

📝 Deploying FilecoinPay...
✅ FilecoinPay deployed to: 0x...

📝 Deploying LicenseVerifier...
✅ LicenseVerifier deployed to: 0x...

============================================================
🎉 DEPLOYMENT COMPLETE!
============================================================

📋 Contract Addresses:

FiloraLicense1155: 0x0a609046e6cd45C5408f3e283003B4bcB9050C6F
FilecoinPay: 0xa4118fB7de0666ca38b4e2630204D0a49e486037
LicenseVerifier: 0x25f2133C8A11abB2B9CB72184f88CDF31b353E85
AssetRegistry: 0x935f69f2A66FaF91004434aFc89f7180161db32d
USDFC: 0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0
```

### 3.3 Save contract addresses
Copy the deployed addresses - you'll need them in the next step!

## 📝 Step 4: Update Application

### 4.1 Navigate back to root
```bash
cd ..
```

### 4.2 Update contracts/addresses.ts
Replace the empty strings with your deployed addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  FiloraLicense1155: "0xYOUR_DEPLOYED_ADDRESS",
  FilecoinPay: "0xYOUR_DEPLOYED_ADDRESS",
  LicenseVerifier: "0xYOUR_DEPLOYED_ADDRESS",
  USDFC: "0x7a7d1C8C92A4B8d8C8e8F8a8B8C8D8E8F8A8B8C8",
} as const;
```

### 4.3 Restart development server

**Using Yarn:**
```bash
yarn dev
```

**Using npm:**
```bash
npm run dev
```

> The server will start on the next available port (usually 3000 or 3004).

## ✅ Step 5: Verify Deployment

### 5.1 Check on Block Explorer
Visit Filecoin Calibration explorer:
- https://calibration.filfox.info/en

Search for your contract addresses to verify deployment.

### 5.2 Test in Application

1. **Open application**: Check terminal for the port (usually http://localhost:3000 or http://localhost:3004)
2. **Connect wallet**: Click "Connect Wallet"
3. **Test NFT Minting**:
   - Go to any asset detail page
   - Click "Mint NFT" button
   - Should now be enabled (not grayed out)
   - Complete transaction

4. **Test Payment**:
   - Click "Buy" on any asset
   - Should now be enabled
   - Complete transaction

5. **Test License Verification**:
   - After minting, check for license badge
   - Should show "Licensed" status

## 🎉 Success!

If all tests pass, your smart contracts are successfully deployed and integrated!

## 📊 Contract Details

### FiloraLicense1155 (ERC-1155 NFT)
- **Purpose**: Mint NFT licenses for digital assets
- **Features**: 
  - Mint licenses to any address
  - Track creators
  - Set custom URIs

### FilecoinPay (Payment Processing)
- **Purpose**: Process USDFC payments with royalties
- **Features**:
  - Automatic royalty distribution
  - Configurable royalty percentages
  - Withdraw pending royalties

### LicenseVerifier (License Management)
- **Purpose**: Verify license ownership
- **Features**:
  - Check if user has license
  - Verify license is active
  - Set license expiry

## 🔍 Troubleshooting

### Error: "Insufficient funds"
- **Solution**: Get more tFIL from faucet
- Need at least 1 tFIL for deployment

### Error: "Invalid private key"
- **Solution**: Check .env file format
- Remove "0x" prefix from private key
- Ensure no extra spaces

### Error: "Network error"
- **Solution**: Check internet connection
- Verify Calibration RPC is accessible
- Try again in a few minutes

### Deployment succeeds but app doesn't work
- **Solution**: 
  - Verify addresses in contracts/addresses.ts
  - Restart development server
  - Clear browser cache
  - Check wallet is on Calibration network

## 🛡️ Security Notes

- ✅ Use testnet wallet only
- ✅ Never share private key
- ✅ Don't commit .env file
- ✅ Audit contracts before mainnet
- ✅ Test thoroughly on testnet

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Filecoin Documentation](https://docs.filecoin.io)
- [Calibration Faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
- [Calibration Explorer](https://calibration.filfox.info/en)

## 💬 Support

If you encounter issues:
1. Check troubleshooting section above
2. Review deployment logs
3. Verify all prerequisites
4. Open GitHub issue with error details

---

**Last Updated:** January 2025  
**Network:** Filecoin Calibration Testnet  
**Status:** ✅ Ready for Deployment
