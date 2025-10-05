"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { useAccount } from "wagmi";

export const RoyaltyManager = () => {
  const { address } = useAccount();
  const { withdrawRoyalties } = usePaymentProcessing();

  const handleWithdraw = async () => {
    try {
      await withdrawRoyalties.mutateAsync();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💰</span>
        <h2 className="text-2xl font-bold text-gray-800">Royalty Manager</h2>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
        <p className="text-sm text-gray-600 mb-2">Available Royalties</p>
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          0.00 USDFC
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 Royalties are automatically distributed when your assets are sold. Withdraw your earnings anytime.
          </p>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!address || withdrawRoyalties.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {withdrawRoyalties.isPending ? "Withdrawing..." : "Withdraw Royalties"}
        </button>
      </div>
    </motion.div>
  );
};
