# Filora - Decentralized Digital Asset Marketplace

Filora is a decentralized marketplace for buying, selling, and trading digital assets on the Filecoin blockchain. Built with Synapse SDK, Filora provides secure, permanent storage with NFT licensing and automated royalty distribution.

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

## Prerequisites

- Node.js 18+ and npm
- A web3 wallet (like MetaMask)
- Basic understanding of React and TypeScript
- Get some tFIL tokens on Filecoin Calibration testnet [link to faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
- Get some USDFC tokens on Filecoin Calibration testnet [link to faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)

## Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/mdlog/filora
cd filora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Testnet Tokens
- Get tFIL: [Filecoin Calibration Faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
- Get USDFC: [USDFC Faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)

### 4. Deploy Smart Contracts (Optional - for full features)

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

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Connect Wallet
- Click "Connect Wallet" button
- Select MetaMask or your preferred wallet
- Switch to Filecoin Calibration network (Chain ID: 314159)

## How to Use

### Browse Marketplace
1. Navigate to **Marketplace** tab
2. Switch between **Grid View** (all assets) or **By Owner** (grouped by user)
3. Use search to filter by CID, Asset ID, or Provider
4. Filter by status: All, Live, or Inactive
5. Click asset to view details and preview via Filbeam CDN

### Upload Assets
1. Go to **Upload Asset** tab
2. Select file to upload
3. Add metadata (name, description, price)
4. Click "Upload to Filecoin"
5. Confirm transaction in wallet

### Purchase Assets

1. Click on any asset in marketplace
2. Click **Buy** button
3. Review price and royalty breakdown
4. Approve USDFC spending
5. Confirm purchase transaction
6. Royalties automatically distributed to creator

### Mint NFT License

1. Open asset detail page
2. Click **Mint NFT** button
3. Set amount to mint
4. Confirm transaction
5. NFT license minted to your wallet

### Manage Storage
1. Go to **Storage** tab
2. View FIL, USDFC, and storage balances
3. Pay for storage if needed (10GB for 30 days)
4. Monitor storage usage and expiry

### Withdraw Royalties

1. Go to **Royalties** tab
2. View available royalty earnings
3. Click "Withdraw Royalties"
4. Confirm transaction
5. USDFC transferred to your wallet

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

### Smart Contracts

> ✅ **Deployed:** All contracts are live on Calibration testnet.

- **FiloraLicense1155** ✅ DEPLOYED - ERC-1155 NFT contract for asset licensing
- **FilecoinPay** ✅ DEPLOYED - Payment processing with automatic royalty distribution
- **LicenseVerifier** ✅ DEPLOYED - On-chain license verification and management
- **USDFC Token** ✅ DEPLOYED - Stablecoin for payments

See [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for deployment guide and instructions.

### Key Hooks

**Storage & Assets:**
- `useBalances` - Query FIL, USDFC, and storage balances
- `usePayment` - Pay for Filecoin storage (10GB/30 days)
- `useFileUpload` - Upload files to Filecoin via Synapse SDK
- `useDatasets` - Fetch user's datasets
- `useAllDatasets` - Fetch all marketplace datasets

**NFT & Payments:**
- `useNFTMint` - Mint ERC-1155 NFT licenses
- `usePaymentProcessing` - Process USDFC payments with royalties
- `useLicenseVerification` - Verify license ownership
- `useRoyaltyInfo` - Get royalty information

### Components

**Marketplace:**
- `MarketplaceGrid` - Display all assets with grid/owner view
- `UploadAsset` - Upload interface
- `MyAssets` - User's asset collection
- `NFTMintModal` - Mint NFT licenses
- `PurchaseModal` - Buy assets with royalty breakdown
- `LicenseVerificationBadge` - Show license status
- `RoyaltyManager` - Withdraw creator earnings

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Blockchain:** Filecoin Calibration Testnet
- **Storage:** Synapse SDK for Filecoin storage
- **Wallet:** RainbowKit + Wagmi
- **State Management:** TanStack Query
- **Animations:** Framer Motion
- **Smart Contracts:** Solidity, ERC-1155

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

## Resources

- [Filecoin Synapse SDK](https://github.com/FilOzone/synapse-sdk)
- [Synapse PDP Components](https://synapse.filecoin.services/intro/components/)
- [Filbeam CDN](https://filbeam.com/docs) - Fast content delivery for Filecoin
- [USDFC Documentation](https://docs.secured.finance/usdfc-stablecoin/getting-started)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [Filecoin Documentation](https://docs.filecoin.io)

## Troubleshooting

**Wallet not connecting:**
- Ensure MetaMask is installed
- Add Filecoin Calibration network manually if needed

**Transaction failing:**
- Check you have enough tFIL for gas
- Verify USDFC balance for payments
- Ensure correct network (Chain ID: 314159)

**Upload failing:**
- Check storage balance in Storage tab
- Pay for storage if balance insufficient
- Verify file size is reasonable

**Contract errors:**
- Smart contracts are not yet deployed
- Deploy contracts first using [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) guide
- Update contract addresses in `contracts/addresses.ts` after deployment
- NFT and payment features require deployed contracts

## Development

### Build for Production
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

## Support

For issues or questions:
- Open an issue on GitHub
- Check [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for contract help
- Review [Filecoin documentation](https://docs.filecoin.io)
