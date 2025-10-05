# Filora Smart Contracts

Solidity smart contracts for Filora marketplace on Filecoin Calibration testnet.

## 📦 Contracts

### 1. FiloraLicense1155.sol
ERC-1155 NFT contract for minting asset licenses.

**Features:**
- Mint NFT licenses for digital assets
- Track creators for each token ID
- Set custom URIs for metadata

### 2. FilecoinPay.sol
Payment processing with automatic royalty distribution.

**Features:**
- Process USDFC payments
- Automatic royalty calculation and distribution
- Withdraw pending royalties
- Configurable royalty percentages (basis points)

### 3. LicenseVerifier.sol
Verify license ownership and status.

**Features:**
- Check if user owns license
- Verify license is active
- Set license expiry dates

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Setup Environment
```bash
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

### Compile Contracts
```bash
npm run compile
```

### Deploy to Calibration
```bash
npm run deploy
```

## 📝 Deployment

See [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 🔧 Development

### Compile
```bash
npx hardhat compile
```

### Test (if tests exist)
```bash
npx hardhat test
```

### Deploy
```bash
npx hardhat run scripts/deploy.js --network calibration
```

## 🌐 Network Configuration

**Filecoin Calibration Testnet:**
- Chain ID: 314159
- RPC: https://api.calibration.node.glif.io/rpc/v1
- Explorer: https://calibration.filfox.info/en
- Faucet: https://faucet.calibnet.chainsafe-fil.io/funds.html

## 📋 Contract Addresses

After deployment, update `../contracts/addresses.ts` with deployed addresses.

## 🛡️ Security

- ⚠️ These contracts are for testnet only
- ⚠️ Audit required before mainnet deployment
- ⚠️ Never commit .env file
- ⚠️ Use testnet wallet only

## 📚 Dependencies

- Hardhat: Smart contract development framework
- OpenZeppelin: Secure contract libraries
- ethers.js: Ethereum library

## 🔗 Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/contracts)
- [Filecoin Docs](https://docs.filecoin.io)
