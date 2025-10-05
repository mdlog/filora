#!/bin/bash

echo "🚀 Filora Smart Contract Deployment Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "solidity" ]; then
    echo "❌ Error: solidity folder not found"
    echo "Please run this script from the project root"
    exit 1
fi

# Navigate to solidity folder
cd solidity

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit solidity/.env and add your PRIVATE_KEY"
    echo "Then run this script again"
    exit 1
fi

# Check if PRIVATE_KEY is set
if grep -q "your_private_key_here" .env; then
    echo "❌ Error: PRIVATE_KEY not set in .env"
    echo "Please edit solidity/.env and add your private key"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi
echo ""

# Deploy contracts
echo "🚀 Deploying to Filecoin Calibration testnet..."
echo ""
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the contract addresses from above"
    echo "2. Update contracts/addresses.ts with the new addresses"
    echo "3. Restart your development server: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo "Please check the error messages above"
    exit 1
fi
