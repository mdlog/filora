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
    console.log("🛒 Purchase Debug Info:", {
      buyer: address,
      seller: seller,
      sellerValid: seller && seller !== "Unknown" && seller !== "null" && seller.startsWith("0x"),
      assetId,
      pieceId,
      price,
      priceValid: price && parseFloat(price) > 0,
      usdfcBalance: balances?.usdfcBalanceFormatted,
      filBalance: balances?.filBalanceFormatted
    });

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    // ✅ VALIDATION: Check seller address is valid
    if (!seller || seller === "Unknown" || seller === "null" || !seller.startsWith("0x")) {
      setError(`❌ Invalid seller address: "${seller}". This asset doesn't have a valid owner recorded. Cannot process purchase. The asset may have been uploaded without proper ownership tracking.`);
      console.error("❌ Seller validation failed:", {
        seller,
        isUnknown: seller === "Unknown",
        isNull: seller === "null",
        startsWithAddress: seller?.startsWith("0x"),
        message: "Asset owner not properly set - upload may have failed or asset is invalid"
      });
      return;
    }

    // ✅ VALIDATION: Check price is valid
    if (!price || parseFloat(price) <= 0) {
      setError(`❌ Invalid price: "${price}". Cannot process purchase.`);
      console.error("❌ Price validation failed:", price);
      return;
    }

    // ✅ VALIDATION: Don't buy from yourself
    if (seller.toLowerCase() === address.toLowerCase()) {
      setError("❌ You cannot purchase your own asset!");
      return;
    }

    try {
      setError("");

      // Check USDFC balance
      const priceWei = parseEther(price);
      const usdfcBalance = balances?.usdfcBalance || BigInt(0);

      console.log("💰 Balance check:", {
        required: priceWei.toString(),
        requiredFormatted: price + " USDFC",
        available: usdfcBalance.toString(),
        availableFormatted: formatEther(usdfcBalance) + " USDFC",
        hasEnough: usdfcBalance >= priceWei,
      });

      console.log("📋 Transaction parameters:", {
        function: "processPayment",
        to: seller,
        amount: price,
        amountWei: priceWei.toString(),
        tokenId: assetId
      });

      if (usdfcBalance < priceWei) {
        setError(`Insufficient USDFC balance. You need ${price} USDFC but only have ${formatEther(usdfcBalance)} USDFC. Please get more USDFC tokens from the faucet.`);
        return;
      }

      // Process payment with status updates
      console.log("🛒 Starting purchase process...");
      setError(""); // Clear any previous errors

      const result = await processPayment.mutateAsync({
        to: seller,
        amount: price,
        tokenId: assetId,
      });

      // ✅ IMPORTANT: Only add to purchased if payment actually succeeded
      if (!result || !result.paymentHash) {
        throw new Error("❌ Payment transaction failed - no transaction hash returned");
      }

      console.log("✅ Payment completed successfully!");
      console.log("📝 Payment transaction hash:", result.paymentHash);

      // Record purchase to localStorage ONLY after confirmed success
      await addPurchase({
        datasetId: assetId,
        pieceId: pieceId,
        pieceCid: pieceCid,
        price: price,
        seller: seller,
        purchasedAt: Math.floor(Date.now() / 1000),
        txHash: result.paymentHash,
        assetName: assetName, // Save asset name for display
        // Note: We don't have original filename here, will be generic download
      });

      console.log("✅ Purchase recorded to localStorage!");
      triggerConfetti();

      // Small delay before closing to ensure user sees success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("❌ Purchase failed:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        name: error.name
      });

      // ⚠️ IMPORTANT: Do NOT add to purchased if payment failed!
      console.warn("⚠️ Purchase was NOT recorded because payment failed");

      // Show user-friendly error message
      let errorMessage = error.message || "❌ Purchase failed. Please try again.";

      // Add helpful context based on error type
      if (error.message?.includes("user rejected")) {
        errorMessage = "❌ Transaction cancelled by user. No charges were made.";
      } else if (error.message?.includes("SysErr") || error.message?.includes("revert")) {
        errorMessage = "❌ Transaction failed on blockchain. No charges were made.\n\nCommon causes:\n• Approval not confirmed (wait 10s, try again)\n• Insufficient balance\n• Network congestion\n\nPlease try again.";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "❌ Insufficient USDFC or tFIL balance.\n\nGet tokens from:\n• Dashboard → 'Get USDFC' button\n• Dashboard → 'Get tFIL' button";
      }

      setError(errorMessage);
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
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="animate-spin text-lg">⏳</span>
                  <span>Transaction in Progress - Follow These Steps:</span>
                </p>
                <div className="space-y-2 text-xs text-amber-700">
                  <div className="flex items-start gap-2">
                    <span className="font-bold">1️⃣</span>
                    <span>Confirm <strong>FIRST MetaMask popup</strong> (Approve USDFC spending)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">⏰</span>
                    <span>Wait for approval to be <strong>confirmed on blockchain</strong> (10-30 seconds)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">✅</span>
                    <span>After approval confirmed, <strong>SECOND popup will appear automatically</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">2️⃣</span>
                    <span>Confirm <strong>SECOND MetaMask popup</strong> (Process payment)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">⏰</span>
                    <span>Wait for payment to be <strong>confirmed on blockchain</strong> (10-30 seconds)</span>
                  </div>
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-amber-200">
                    <span className="font-bold">⚠️</span>
                    <span><strong>IMPORTANT:</strong> Do NOT close this window! Check console (F12) for progress.</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={processPayment.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processPayment.isPending ? "⏳ Processing... (Check MetaMask)" : "✅ Complete Purchase"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
