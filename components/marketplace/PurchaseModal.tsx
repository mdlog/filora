"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { useRoyaltyInfo } from "@/hooks/useRoyaltyInfo";
import { useConfetti } from "@/hooks/useConfetti";
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { useBalances } from "@/hooks/useBalances";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "ethers";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  pieceId: number;
  pieceCid: string;
  assetName: string;
  seller: string;
  price: string;
}

export const PurchaseModal = ({ isOpen, onClose, assetId, pieceId, pieceCid, assetName, seller, price }: PurchaseModalProps) => {
  const { address } = useAccount();
  const { processPayment } = usePaymentProcessing();
  const { creator, percentage } = useRoyaltyInfo(assetId);
  const { triggerConfetti } = useConfetti();
  const { addPurchase } = usePurchasedAssets();
  const { data: balances } = useBalances();
  const [error, setError] = useState<string>("");

  const royaltyAmount = percentage ? (parseFloat(price) * Number(percentage)) / 10000 : 0;
  const sellerAmount = parseFloat(price) - royaltyAmount;

  const handlePurchase = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setError("");

      // Check USDFC balance
      const priceWei = parseEther(price);
      const usdfcBalance = balances?.usdfc || BigInt(0);

      console.log("Balance check:", {
        required: priceWei.toString(),
        available: usdfcBalance.toString(),
        hasEnough: usdfcBalance >= priceWei
      });

      if (usdfcBalance < priceWei) {
        setError(`Insufficient USDFC balance. You need ${price} USDFC but only have ${formatEther(usdfcBalance)} USDFC. Please get more USDFC tokens from the faucet.`);
        return;
      }

      // Process payment
      const result = await processPayment.mutateAsync({
        to: seller,
        amount: price,
        tokenId: assetId,
      });

      // Record purchase to localStorage
      await addPurchase({
        datasetId: assetId,
        pieceId: pieceId,
        pieceCid: pieceCid,
        price: price,
        seller: seller,
        buyer: address,
        purchasedAt: Math.floor(Date.now() / 1000),
        txHash: result.paymentHash,
      });

      triggerConfetti();
      onClose();
    } catch (error: any) {
      console.error("Purchase failed:", error);
      setError(error.message || "Purchase failed. Please try again.");
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {processPayment.isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Processing payment... Please confirm transactions in your wallet.</span>
                </p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={processPayment.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processPayment.isPending ? "⏳ Processing..." : "✅ Complete Purchase"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
