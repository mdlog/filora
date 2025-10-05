"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useConfetti } from "@/hooks/useConfetti";

interface NFTMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  assetName: string;
  pieceCid?: string;
  ownerAddress?: string;
}

export const NFTMintModal = ({ isOpen, onClose, assetId, assetName, pieceCid, ownerAddress }: NFTMintModalProps) => {
  const [amount, setAmount] = useState(1);
  const { mutateAsync: mintNFT, isPending } = useNFTMint();
  const { triggerConfetti } = useConfetti();

  const handleMint = async () => {
    try {
      const metadata = pieceCid && ownerAddress 
        ? `https://${ownerAddress}.calibration.filcdn.io/${pieceCid}` 
        : undefined;
      const result = await mintNFT({ tokenId: assetId, amount, metadata });
      triggerConfetti();
      onClose();
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🪙 Mint NFT License</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Asset</label>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <p className="font-bold text-gray-800">{assetName}</p>
                <p className="text-sm text-gray-600">Token ID: #{assetId}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 Minting this NFT will grant you a license to use this digital asset.
              </p>
            </div>

            <button
              onClick={handleMint}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
