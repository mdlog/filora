# Filora - Decentralized Digital Asset Marketplace

Filora is a decentralized marketplace for buying, selling, and trading digital assets on the Filecoin blockchain. Built with Synapse SDK, Filora provides secure, permanent storage for your digital assets.

## Overview

Filora features:
- 🎨 Browse and discover digital assets
- 📤 Upload digital assets with metadata
- 🖼️ Manage your asset collection
- 💾 Decentralized storage on Filecoin
- 💰 USDFC token payments
- 🔐 Secure wallet connection

## Prerequisites

- Node.js 18+ and npm
- A web3 wallet (like MetaMask)
- Basic understanding of React and TypeScript
- Get some tFIL tokens on Filecoin Calibration testnet [link to faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
- Get some USDFC tokens on Filecoin Calibration testnet [link to faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)

## Getting Started

1. Clone this repository:
```bash
git clone https://github.com/yourusername/filora
cd filora
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dApp.

## Key Components

### Wallet Connection
The dApp uses RainbowKit for seamless wallet connection, configured specifically for Filecoin networks:
- Filecoin Mainnet
- Filecoin Calibration (testnet)

### Query token and storage usage Balances
Shows how to:
- Get user FIL-USDFC-SynapseStorageUsage balances
- hook used to query user balances [link](https://github.com/FIL-Builders/fs-upload-dapp/blob/main/hooks/useBalances.ts)

### Pay For Storage with USDFC
Demonstrates how to:
- Pay for storage by depositing funds to Synapse contracts using USDFC token
- Handles one time payment for 10GB usage that persists 30days
- Notifies repayment if less than 10days remain for paying synapse based on current usage
- hook used to conduct a payment [link](https://github.com/FIL-Builders/fs-upload-dapp/blob/main/hooks/usePayment.ts)

### File Upload
Shows how to:
- Create a user-friendly file upload interface
- Upload file to Filecoin using synapse-sdk
- Monitor upload status
- Download filecoin from Filecoin using synapse-sdk
- hook used to upload a file [link](https://github.com/FIL-Builders/fs-upload-dapp/blob/main/hooks/useFileUpload.ts)

## Learn More

- [Filecoin synapse-sdk](https://github.com/FilOzone/synapse-sdk)
- [USDFC Token Documentation](https://docs.secured.finance/usdfc-stablecoin/getting-started)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- Best practices in React!
  - [Tanstack Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
  - [Tanstack Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
