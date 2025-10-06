# 🎨 Filora - Decentralized Digital Asset Marketplace

> **Note:** This project is a fork of [FIL-Builders/fs-upload-dapp](https://github.com/FIL-Builders/fs-upload-dapp) with additional marketplace features, NFT licensing, and automated royalty distribution.

**Filora** is a decentralized marketplace for buying, selling, and trading digital assets on the Filecoin blockchain. Built with Synapse SDK, Filora provides secure, permanent storage with NFT licensing and automated royalty distribution.

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/mdlog/filora
cd filora

# Install dependencies
yarn install

# Run development server
yarn dev

# Open browser at http://localhost:3000 (or the port shown in terminal)
```

**🎉 All smart contracts are deployed and ready to use!**

---

## 📋 Smart Contract Addresses (Filecoin Calibration Testnet)

All contracts are deployed and active on **Filecoin Calibration Testnet** (Chain ID: 314159):

| Contract | Address | Purpose |
|----------|---------|---------|
| **FiloraLicense1155** | `0x0a609046e6cd45C5408f3e283003B4bcB9050C6F` | ERC-1155 NFT licenses for digital assets |
| **FilecoinPay** | `0xa4118fB7de0666ca38b4e2630204D0a49e486037` | Payment processing with automatic royalty distribution |
| **LicenseVerifier** | `0x25f2133C8A11abB2B9CB72184f88CDF31b353E85` | On-chain license verification |
| **AssetRegistry** | `0x935f69f2A66FaF91004434aFc89f7180161db32d` | Marketplace registry with price storage |
| **USDFC Token** | `0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0` | Stablecoin for payments |

### 🔍 Verify Contracts
- **Block Explorer:** https://calibration.filfox.info/en
- **Network:** Filecoin Calibration (Chain ID: 314159)
- **Status:** ✅ All contracts active and operational

---

## Features

### Core Features
- 🎨 Browse and discover digital assets from all users
- 📤 Upload digital assets with metadata
- 🖼️ Manage your asset collection
- 💾 Decentralized storage on Filecoin
- 💰 USDFC token payments
- 🔐 Secure wallet connection
- ⚡ Fast preview & download via Filbeam CDN

### Smart Contract & NFT Features
> ✅ **Status:** Smart contracts are now deployed and active on Calibration testnet!

- 🪙 **ERC-1155 NFT Minting** - Mint NFT licenses for digital assets
- 📜 **Automated Licensing** - On-chain license verification
- 💳 **Payment Processing** - USDFC payments with automatic royalty distribution
- 🔍 **License Verification** - Real-time license status checking
- 🤖 **Smart Contract Automation** - Automatic royalty distribution to creators
- 📋 **AssetRegistry** - On-chain marketplace registry with price storage

## 📦 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** and **Yarn** (or npm)
- ✅ **MetaMask** or another Web3 wallet
- ✅ **Basic understanding** of React and TypeScript

> **💡 Tip:** This project uses **Yarn** as the package manager for better disk space efficiency and faster installation.

---

## 🎯 Getting Started

### Step 1: Clone Repository
```bash
git clone https://github.com/mdlog/filora
cd filora
```

### Step 2: Install Dependencies

**Using Yarn (Recommended):**
```bash
yarn install
```

**Using npm:**
```bash
npm install
```

> **💾 Disk Space Issue?** If you get "ENOSPC" errors, clean npm cache (`npm cache clean --force`) and use Yarn instead.

### Step 3: Run Development Server

**Using Yarn:**
```bash
yarn dev
```

**Using npm:**
```bash
npm run dev
```

The application will automatically start on an available port:
- **Default:** http://localhost:3000
- **If port 3000 is busy:** http://localhost:3004 (or next available port)

> 📌 **Note:** Check the terminal output for the exact port number.

### Step 4: Get Testnet Tokens

To use the marketplace, you'll need testnet tokens:

**1. Get tFIL (for gas fees):**
- Faucet: https://faucet.calibnet.chainsafe-fil.io/funds.html
- Enter your wallet address
- Request tFIL tokens (you'll receive ~5-10 FIL)

**2. Get USDFC (for buying assets):**
- Faucet: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
- Enter your wallet address
- Request USDFC tokens (you'll receive ~100 USDFC)

### Step 5: Connect Wallet
1. Open the application in your browser
2. Click **"Connect Wallet"** button
3. Select **MetaMask** or your preferred wallet
4. **Switch to Filecoin Calibration network** (Chain ID: 314159)
5. Approve the connection

**🎉 You're ready to use Filora!**

---

## 🔧 Optional: Deploy Your Own Contracts

The application comes with pre-deployed contracts, but you can deploy your own if needed.

**Quick Deploy:**
```bash
./deploy-contracts.sh
```

**Manual Deploy:**
```bash
cd solidity
npm install
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
npm run deploy
# Copy addresses and update contracts/addresses.ts
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📖 How to Use Filora

### 🛍️ 1. Browse & Discover Assets

**Navigate the Marketplace:**
1. Click on **"Marketplace"** tab in the navigation bar
2. Browse all digital assets in **Grid View** or **By Owner** view
3. Use the **search bar** to filter by CID, Asset ID, or Provider
4. Filter by status: **All**, **Live**, or **Inactive**
5. **Pagination:** 15 assets per page for easy browsing

**View Asset Details:**
- Click any asset to see full details
- View **price** in USDFC
- Check **royalty percentage** for the creator
- Preview images via Filbeam CDN
- See asset metadata (name, description, CID)

---

### 📤 2. Upload & Sell Your Assets

**Upload Process:**
1. Go to **"Upload Asset"** tab
2. **Select file** (drag & drop or click to browse)
3. **Add metadata:**
   - 🏷️ Asset name
   - 📝 Description
   - 💰 Price (in USDFC)
   - 💵 Royalty percentage (0-100%)
4. Click **"Upload to Filecoin"**
5. **Confirm transaction** in your wallet
6. ✅ Asset automatically registered to marketplace

**What Happens:**
- File uploaded to Filecoin storage
- Asset registered in AssetRegistry contract
- Price and royalty info stored on-chain
- Immediately available in marketplace

---

### 💳 3. Buy Assets

**Purchase Flow:**
1. Find an asset you want to buy
2. Click the asset to open details
3. Click **"Buy"** button
4. **Review breakdown:**
   - Asset price
   - Royalty percentage
   - Total amount
5. **Approve USDFC spending** (first transaction)
6. **Confirm purchase** (second transaction)
7. ✅ Payment processed automatically
8. 💸 Royalties distributed to creator
9. 🎫 NFT license minted to your wallet

**Important Notes:**
- Ensure you have enough **USDFC** for the purchase
- Ensure you have enough **tFIL** for gas fees
- You'll need to approve **2 transactions**: Approval + Payment
- Wait a few seconds between transactions

> 📘 **Having issues?** See [PURCHASE_TROUBLESHOOTING.md](./PURCHASE_TROUBLESHOOTING.md)

---

### 📥 4. Access Your Purchased Assets

After purchasing, you can download your assets in multiple ways:

**Method 1: Purchased Tab (Recommended) 🛒**
1. Click **"Purchased"** tab in navigation
2. View all assets you've bought
3. Click **"Download Asset"** button
4. ⚡ File downloads via Filbeam CDN (1-2 seconds)

**Method 2: Asset Detail Page 📄**
1. Click any purchased asset in marketplace
2. You'll see **"✅ Owned"** badge
3. **"Download"** button becomes available
4. Click to download instantly

**Method 3: My Assets Tab 📁**
1. Go to **"My Assets"** tab
2. Expand dataset to view pieces
3. Click download on owned piece

**Features:**
- 📥 **One-click download** via Filbeam CDN
- 🎫 **View NFT license** details
- ✅ **Verify ownership** on-chain
- 💾 **Persistent storage** in your account
- ⚡ **Fast CDN delivery** (1-2 seconds)

> 📖 **Full Guide:** See [BUYER_ACCESS_GUIDE.md](./BUYER_ACCESS_GUIDE.md)

---

### 🎨 5. Mint NFT Licenses

**Minting Process:**
1. Open any asset detail page
2. Click **"Mint NFT"** button
3. Set the **amount** to mint
4. **Confirm transaction** in wallet
5. ✅ NFT license minted to your wallet

**Use Cases:**
- Gift licenses to others
- Create multiple copies
- Transfer ownership rights
- Collectible digital assets

---

### 💾 6. Manage Storage

**Storage Management:**
1. Go to **"Storage"** tab
2. View your balances:
   - 💰 FIL balance
   - 💵 USDFC balance
   - 📦 Storage balance
3. **Pay for storage** if needed (10GB for 30 days)
4. Monitor storage usage and expiry

**Storage Details:**
- **Cost:** ~0.1 FIL per 10GB/30 days
- **Payment:** Automatic via smart contract
- **Status:** View active/expired storage
- **Capacity:** Expandable as needed

---

### 💰 7. Withdraw Royalties (For Creators)

**Royalty Withdrawal:**
1. Go to **"Royalties"** tab
2. View your **pending royalty earnings**
3. Click **"Withdraw Royalties"**
4. **Confirm transaction** in wallet
5. ✅ USDFC transferred to your wallet

**Royalty System:**
- Automatic distribution on each sale
- Configurable percentage (0-100%)
- No manual tracking needed
- Instant availability after sale
- Withdraw anytime

## Architecture

### PDP (Proof of Data Possession) Components

Filora uses Filecoin's PDP system for verifiable, persistent storage:

**On-Chain Components:**
- **PDP Verifier Contract** - Verifies storage proofs, manages datasets and challenges
- **WarmStorage Service Contract** - Handles storage payments and subscriptions

**Off-Chain Components:**
- **PDP Servers** - Storage provider APIs for upload/download operations
- **Storage Providers** - Entities running PDP servers with staked collateral
- **Filbeam CDN** - Fast global content delivery network for Filecoin data

**How It Works:**
1. **Upload**: Files sent to PDP Server → Registered in on-chain dataset
2. **Verification**: PDP Verifier challenges providers every epoch → Providers submit proofs
3. **Rewards**: Valid proofs → Provider earns rewards | Failed proofs → Penalties
4. **Download**: Retrieve files via Filbeam CDN (fast) or PDP Server (fallback)
5. **Preview**: Access content directly via `https://gateway.filbeam.com/piece/{CID}`

### Smart Contracts Architecture

**🎉 Status:** All contracts are deployed and active on Calibration testnet!

Our smart contract ecosystem consists of 5 key contracts:

**1. FiloraLicense1155** - `0x0a609046e6cd45C5408f3e283003B4bcB9050C6F`
- ERC-1155 standard for NFT licenses
- Mint licenses for any digital asset
- Track creators for royalty distribution
- Support for batch minting
- Custom metadata URIs

**2. FilecoinPay** - `0xa4118fB7de0666ca38b4e2630204D0a49e486037`
- USDFC payment processing
- Automatic royalty calculation (basis points)
- Secure royalty distribution to creators
- Withdraw pending royalties
- Reentrancy protection

**3. LicenseVerifier** - `0x25f2133C8A11abB2B9CB72184f88CDF31b353E85`
- Verify license ownership on-chain
- Check active license status
- License expiry management
- Integration with ERC-1155

**4. AssetRegistry** - `0x935f69f2A66FaF91004434aFc89f7180161db32d`
- On-chain marketplace registry
- Store asset pricing information
- Query all marketplace assets
- Track asset metadata

**5. USDFC Token** - `0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0`
- Stablecoin for all payments
- Filecoin Calibration testnet token
- Get from faucet: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc

**📚 Learn More:**
- [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) - Contract implementation details
- [REGISTRY_DEPLOYMENT.md](./REGISTRY_DEPLOYMENT.md) - Registry deployment guide
- [DEPLOYED_CONTRACTS.md](./DEPLOYED_CONTRACTS.md) - Full deployment documentation

**⚠️ Troubleshooting:**
- Upload issues? See [UPLOAD_TROUBLESHOOTING.md](./UPLOAD_TROUBLESHOOTING.md)
- Purchase errors? See [PURCHASE_TROUBLESHOOTING.md](./PURCHASE_TROUBLESHOOTING.md)

### Key Hooks

**Storage & Assets:**
- `useBalances` - Query FIL, USDFC, and storage balances
- `usePayment` - Pay for Filecoin storage (10GB/30 days)
- `useFileUpload` - Upload files to Filecoin with price metadata
- `useDatasets` - Fetch user's datasets with pagination (10 per page)
- `useAllDatasets` - Fetch all marketplace datasets from AssetRegistry
- `useAssetRegistry` - Register and query assets from registry contract

**NFT & Payments:**
- `useNFTMint` - Mint ERC-1155 NFT licenses
- `usePaymentProcessing` - Process USDFC payments with royalties
- `useLicenseVerification` - Verify license ownership
- `useRoyaltyInfo` - Get royalty information

### Components

**Marketplace:**
- `MarketplaceGrid` - Display all assets with grid/owner view, pagination, filters
- `UploadAsset` - Upload interface with price and royalty settings
- `MyAssets` - User's asset collection with pagination (10 per page)
- `NFTMintModal` - Mint NFT licenses
- `PurchaseModal` - Buy assets with royalty breakdown
- `LicenseVerificationBadge` - Show license status
- `RoyaltyManager` - Withdraw creator earnings
- `AssetPreview` - Display asset images via Filbeam CDN

## Tech Stack

- **Frontend:** Next.js 15.3.2, React 19, TypeScript, TailwindCSS 4
- **Build Tool:** Turbopack (Next.js optimized bundler)
- **Blockchain:** Filecoin Calibration Testnet (Chain ID: 314159)
- **Storage:** Synapse SDK for Filecoin storage
- **CDN:** Filbeam CDN for fast content delivery
- **Wallet:** RainbowKit + Wagmi v2
- **State Management:** TanStack Query v5
- **Animations:** Framer Motion v11
- **Smart Contracts:** Solidity, ERC-1155, Hardhat
- **Package Manager:** Yarn (recommended) / npm

## Project Structure

```
filora/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main marketplace page
│   └── assets/[id]/       # Asset detail pages
├── components/            # React components
│   ├── marketplace/       # Marketplace components
│   └── ui/               # UI components
├── contracts/            # Smart contract ABIs & addresses
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── utils/                # Utility functions
└── types.ts              # TypeScript types
```

## 🔗 Important Links & Resources

### 🚰 Testnet Faucets

Get free tokens for testing on Filecoin Calibration:

| Token | Purpose | Faucet Link |
|-------|---------|-------------|
| **tFIL** | Gas fees for transactions | https://faucet.calibnet.chainsafe-fil.io/funds.html |
| **USDFC** | Buy assets & make payments | https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc |

**💡 Recommended amounts:**
- tFIL: Request at least 5-10 FIL for multiple transactions
- USDFC: Request 100+ USDFC for testing purchases

---

### 🔍 Block Explorers

| Explorer | URL | Purpose |
|----------|-----|---------|
| **Filecoin Explorer** | https://calibration.filfox.info/en | View transactions & contracts |
| **Filbeam Gateway** | https://gateway.filbeam.com/ | Access stored files via CDN |

---

### 📚 Documentation

**Project Documentation:**
- [README.md](./README.md) - Main documentation (this file)
- [STATUS.md](./STATUS.md) - Current application status
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy smart contracts
- [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) - Contract implementation
- [DEPLOYED_CONTRACTS.md](./DEPLOYED_CONTRACTS.md) - Contract addresses & details
- [BUYER_ACCESS_GUIDE.md](./BUYER_ACCESS_GUIDE.md) - How buyers access purchased assets
- [PURCHASE_TROUBLESHOOTING.md](./PURCHASE_TROUBLESHOOTING.md) - Fix purchase errors
- [UPLOAD_TROUBLESHOOTING.md](./UPLOAD_TROUBLESHOOTING.md) - Fix upload issues
- [ROADMAP.md](./ROADMAP.md) - Future features & plans

**External Resources:**
- [Filecoin Synapse SDK](https://github.com/FilOzone/synapse-sdk) - Storage SDK
- [Synapse PDP Components](https://synapse.filecoin.services/intro/components/) - PDP architecture
- [Filbeam CDN Documentation](https://filbeam.com/docs) - Fast content delivery
- [USDFC Documentation](https://docs.secured.finance/usdfc-stablecoin/getting-started) - Stablecoin info
- [Wagmi Documentation](https://wagmi.sh) - React hooks for Ethereum
- [RainbowKit Documentation](https://www.rainbowkit.com) - Wallet connection UI
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/queries) - Data fetching
- [Filecoin Documentation](https://docs.filecoin.io) - Official Filecoin docs

---

### 🌐 Network Configuration

**Filecoin Calibration Testnet:**
```
Network Name: Filecoin Calibration
RPC URL: https://api.calibration.node.glif.io/rpc/v1
Chain ID: 314159
Currency Symbol: tFIL
Block Explorer: https://calibration.filfox.info/en
```

Add this network to MetaMask manually if auto-switch doesn't work.

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 🔌 Wallet Connection Issues

**Problem:** Wallet not connecting or showing wrong network

**Solutions:**
1. ✅ Ensure **MetaMask** is installed and updated
2. ✅ Switch to **Filecoin Calibration** network (Chain ID: 314159)
3. ✅ Add network manually if needed:
   - Network Name: Filecoin Calibration
   - RPC URL: https://api.calibration.node.glif.io/rpc/v1
   - Chain ID: 314159
   - Currency: tFIL
   - Explorer: https://calibration.filfox.info/en
4. ✅ Refresh page and reconnect wallet

---

#### ❌ Transaction Failing

**Problem:** Transaction rejected or reverted

**Solutions:**
1. ✅ Check you have enough **tFIL** for gas fees
   - Get more: https://faucet.calibnet.chainsafe-fil.io/funds.html
2. ✅ Verify **USDFC balance** for payments
   - Get more: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
3. ✅ Ensure correct network (Chain ID: **314159**)
4. ✅ Try again with higher gas limit
5. ✅ Wait a few seconds between transactions

---

#### 📤 Upload Issues

**Problem:** File upload failing or asset not registering

**Solutions:**
1. ✅ Check **storage balance** in Storage tab
2. ✅ Pay for storage if balance insufficient
3. ✅ Verify file size is reasonable (< 100MB recommended)
4. ✅ Wait for transaction confirmation before refreshing
5. ✅ Check for duplicate assets (automatic detection)

**See:** [UPLOAD_TROUBLESHOOTING.md](./UPLOAD_TROUBLESHOOTING.md) for detailed solutions

---

#### 💳 Purchase Errors

**Problem:** "Internal JSON-RPC error" or purchase failing

**Common Causes:**
- ❌ Insufficient USDFC balance
- ❌ Insufficient FIL for gas
- ❌ Not approving both transactions
- ❌ Transaction timeout

**Solutions:**
1. ✅ Check **USDFC balance** in Dashboard (need asset price + gas)
2. ✅ Check **FIL balance** (need ~0.01 FIL for gas)
3. ✅ **Approve BOTH transactions:**
   - First: USDFC spending approval
   - Second: Purchase transaction
4. ✅ Wait 5-10 seconds between approvals
5. ✅ Don't close MetaMask during transaction
6. ✅ Try with lower gas price if urgent

**See:** [PURCHASE_TROUBLESHOOTING.md](./PURCHASE_TROUBLESHOOTING.md) for detailed solutions

---

#### 🔧 Smart Contract Issues

**Problem:** NFT/Payment features not working

**Solutions:**
1. ✅ Verify contracts are deployed (see contract addresses above)
2. ✅ Check contract addresses in `contracts/addresses.ts`
3. ✅ Ensure wallet is on **Calibration network** (Chain ID: 314159)
4. ✅ Clear browser cache and restart application
5. ✅ Verify contract on explorer: https://calibration.filfox.info/en

---

#### 💾 Disk Space Issues

**Problem:** "ENOSPC: no space left on device" during installation

**Solutions:**
1. ✅ Clean npm cache:
   ```bash
   npm cache clean --force
   ```
2. ✅ **Use Yarn** (more space-efficient):
   ```bash
   yarn install
   ```
3. ✅ Check available space:
   ```bash
   df -h
   ```
4. ✅ Remove unused node_modules:
   ```bash
   find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
   ```

---

#### 🌐 Port Already in Use

**Problem:** Port 3000 already in use

**Solutions:**
1. ✅ Application **auto-detects** next available port (usually 3004)
2. ✅ Check terminal output for actual port number
3. ✅ Or manually kill process on port 3000:
   ```bash
   # Find process
   lsof -ti:3000
   
   # Kill process
   kill -9 $(lsof -ti:3000)
   ```

---

#### 📥 Download Issues

**Problem:** Asset download failing

**Solutions:**
1. ✅ Check **internet connection**
2. ✅ Verify you **own the asset** (purchased or created)
3. ✅ Try manual download via Filbeam:
   ```
   https://gateway.filbeam.com/piece/{CID}
   ```
4. ✅ Check browser console (F12) for errors
5. ✅ Clear browser cache and retry

---

### 📞 Still Having Issues?

If none of the above solutions work:

1. **Check Documentation:**
   - [README.md](./README.md) - This file
   - [STATUS.md](./STATUS.md) - Current status
   - [BUYER_ACCESS_GUIDE.md](./BUYER_ACCESS_GUIDE.md) - Access guide
   
2. **Debug Tools:**
   - Open browser console (F12) → Check for errors
   - Check Network tab → Look for failed requests
   - Verify transaction on explorer

3. **Get Help:**
   - Open GitHub Issue with:
     - Error message
     - Screenshot
     - Browser & wallet info
     - Transaction hash (if applicable)

## Development

### Build for Production

**Using Yarn:**
```bash
yarn build
yarn start
```

**Using npm:**
```bash
npm run build
npm start
```

### Deploy Smart Contracts
See [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for contract deployment instructions.

### Environment Variables
No environment variables required for basic functionality. All configuration in `config.ts`.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## 💬 Support & Community

### Get Help

For issues, questions, or feedback:

1. **📖 Check Documentation First:**
   - Browse documentation files in the project root
   - Most common issues are covered in troubleshooting sections

2. **🐛 Report Issues:**
   - Open a [GitHub Issue](https://github.com/mdlog/filora/issues)
   - Include: Error message, screenshots, wallet address, transaction hash
   - Specify: Browser version, wallet type, network info

3. **💡 Community Support:**
   - Join [Filecoin Discord](https://discord.gg/filecoin)
   - Follow [Filecoin Twitter](https://twitter.com/Filecoin)
   - Check [Filecoin Forum](https://filecoin.discourse.group/)

---

## 🎉 Quick Summary

**Filora** is a fully-functional decentralized marketplace for digital assets built on Filecoin:

### ✅ What's Working
- ✅ **Upload & Store** - Upload files to Filecoin with metadata
- ✅ **Marketplace** - Browse, search, and filter digital assets
- ✅ **Buy & Sell** - USDFC payments with automatic royalties
- ✅ **NFT Licenses** - ERC-1155 NFT licenses for asset ownership
- ✅ **Fast Downloads** - Filbeam CDN for instant file access
- ✅ **Smart Contracts** - All 5 contracts deployed and active
- ✅ **Royalty System** - Automatic royalty distribution to creators

### 🚀 Getting Started is Easy
```bash
# 1. Install
yarn install

# 2. Run
yarn dev

# 3. Get tokens
# Visit faucets (links above)

# 4. Start trading!
# Connect wallet and explore marketplace
```

### 📋 Key Contract Addresses
- **FiloraLicense1155:** `0x0a609046e6cd45C5408f3e283003B4bcB9050C6F`
- **FilecoinPay:** `0xa4118fB7de0666ca38b4e2630204D0a49e486037`
- **LicenseVerifier:** `0x25f2133C8A11abB2B9CB72184f88CDF31b353E85`
- **AssetRegistry:** `0x935f69f2A66FaF91004434aFc89f7180161db32d`
- **USDFC Token:** `0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0`

### 🔗 Essential Links
- **tFIL Faucet:** https://faucet.calibnet.chainsafe-fil.io/funds.html
- **USDFC Faucet:** https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
- **Block Explorer:** https://calibration.filfox.info/en
- **Network:** Filecoin Calibration (Chain ID: 314159)

### 📚 Documentation
All documentation is in the project root:
- `README.md` - Main guide (you're reading it!)
- `STATUS.md` - Current status & features
- `BUYER_ACCESS_GUIDE.md` - How to access purchased assets
- `PURCHASE_TROUBLESHOOTING.md` - Fix purchase issues
- `UPLOAD_TROUBLESHOOTING.md` - Fix upload issues
- `DEPLOYMENT_GUIDE.md` - Deploy your own contracts

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ on Filecoin | Ready for Production Use | All Systems Operational ✅**

*Last Updated: October 2025*
