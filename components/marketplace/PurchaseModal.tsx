"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { useRoyaltyInfo } from "@/hooks/useRoyaltyInfo";
import { useConfetti } from "@/hooks/useConfetti";
import { formatEther } from "ethers";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  assetName: string;
  seller: string;
  price: string;
}

export const PurchaseModal = ({ isOpen, onClose, assetId, assetName, seller, price }: PurchaseModalProps) => {
  const { processPayment } = usePaymentProcessing();
  const { creator, percentage } = useRoyaltyInfo(assetId);
  const { triggerConfetti } = useConfetti();

  const royaltyAmount = percentage ? (parseFloat(price) * Number(percentage)) / 10000 : 0;
  const sellerAmount = parseFloat(price) - royaltyAmount;

  const handlePurchase = async () => {
    try {
      await processPayment.mutateAsync({
        to: seller,
        amount: price,
        tokenId: assetId,
      });
      triggerConfetti();
      onClose();
    } catch (error) {
      console.error("Purchase failed:", error);
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
            <h2 className="text-2xl font-bold text-gray-800">💳 Purchase Asset</h2>
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
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="font-bold text-gray-800 text-lg">{assetName}</p>
              <p className="text-sm text-gray-600">Token ID: #{assetId}</p>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Price</span>
                <span className="font-bold text-gray-800">{price} USDFC</span>
              </div>
              {percentage && percentage > 0n && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Royalty ({Number(percentage) / 100}%)</span>
                    <span className="text-gray-700">{royaltyAmount.toFixed(4)} USDFC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">To Seller</span>
                    <span className="text-gray-700">{sellerAmount.toFixed(4)} USDFC</span>
                  </div>
                </>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-indigo-600 text-lg">{price} USDFC</span>
              </div>
            </div>

            {creator && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  🎨 Creator royalties will be automatically distributed to the original creator
                </p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={processPayment.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processPayment.isPending ? "Processing..." : "Complete Purchase"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
