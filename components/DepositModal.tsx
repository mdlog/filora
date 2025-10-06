"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { usePayment } from "@/hooks/usePayment";
import { useBalances } from "@/hooks/useBalances";
import { formatUnits } from "viem";
import { config } from "@/config";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const { chainId } = useAccount();
  const { data: balances, refetch } = useBalances();
  const { mutation, status } = usePayment();
  const [depositAmount, setDepositAmount] = useState("100");
  const [storageGB, setStorageGB] = useState("10");
  const [storageDays, setStorageDays] = useState("30");

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const amount = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
    const ratePerDay = amount / BigInt(parseInt(storageDays));

    await mutation.mutateAsync({
      lockupAllowance: amount,
      epochRateAllowance: ratePerDay,
      depositAmount: amount,
    });

    await refetch();

    // Don't close immediately on success, let user see status
    if (!status?.includes("❌")) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const needsTokens = balances?.usdfcBalance === 0n;
  const hasWarmStorage = balances?.warmStorageBalance && balances.warmStorageBalance > 0n;
  const estimatedDays = depositAmount && storageDays ? parseInt(storageDays) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>💾</span>
              {hasWarmStorage ? "Add More Storage" : "Setup Warm Storage"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {hasWarmStorage ? "Deposit more USDFC to extend storage" : "Initial setup for Filecoin storage"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {needsTokens ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium mb-2">
                ⚠️ You need USDFC tokens first
              </p>
              <p className="text-sm text-yellow-700">
                Get test USDFC tokens from the faucet to start using warm storage.
              </p>
            </div>

            {chainId === 314159 && (
              <button
                onClick={() => window.open("https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc", "_blank")}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Get tUSDFC from Faucet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Current Balance Info */}
            {hasWarmStorage && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-800 font-medium mb-2 flex items-center gap-2">
                  <span>✅</span>
                  Current Storage Status
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-green-600">Current Balance:</p>
                    <p className="text-green-900 font-bold">{balances?.warmStorageBalanceFormatted?.toFixed(2)} USDFC</p>
                  </div>
                  <div>
                    <p className="text-green-600">Storage Allowance:</p>
                    <p className="text-green-900 font-bold">{balances?.currentRateAllowanceGB?.toLocaleString()} GB</p>
                  </div>
                </div>
              </div>
            )}

            {!hasWarmStorage && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-800 font-medium mb-2 flex items-center gap-2">
                  <span>💡</span>
                  Initial Setup
                </p>
                <p className="text-sm text-blue-700">
                  Deposit USDFC to enable storage on Filecoin network. You can customize the amount and duration below.
                </p>
              </div>
            )}

            {/* Deposit Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deposit Amount (USDFC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                  placeholder="100"
                  min="0.1"
                  step="0.1"
                />
                <span className="absolute right-4 top-3 text-gray-500 font-medium">USDFC</span>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <p className="text-gray-600">
                  Available: <span className="font-semibold text-gray-800">{balances?.usdfcBalanceFormatted?.toFixed(2)} USDFC</span>
                </p>
                <button
                  onClick={() => setDepositAmount(balances?.usdfcBalanceFormatted?.toFixed(2) || "100")}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Use Max
                </button>
              </div>
            </div>

            {/* Storage Duration Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Storage Duration (Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={storageDays}
                  onChange={(e) => setStorageDays(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                  placeholder="30"
                  min="1"
                  step="1"
                />
                <span className="absolute right-4 top-3 text-gray-500 font-medium">Days</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recommended: 30-90 days for optimal storage
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Select:</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setDepositAmount("50")}
                  className="px-3 py-2 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  50
                </button>
                <button
                  onClick={() => setDepositAmount("100")}
                  className="px-3 py-2 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  100
                </button>
                <button
                  onClick={() => setDepositAmount("200")}
                  className="px-3 py-2 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  200
                </button>
                <button
                  onClick={() => setDepositAmount("500")}
                  className="px-3 py-2 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  500
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">📊 Summary:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Amount:</span>
                  <span className="font-bold text-gray-900">{depositAmount || "0"} USDFC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-bold text-gray-900">{storageDays || "0"} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span className="font-bold text-gray-900">
                    {depositAmount && storageDays ? (parseFloat(depositAmount) / parseInt(storageDays)).toFixed(2) : "0"} USDFC/day
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleDeposit}
              disabled={mutation.isPending || !depositAmount || parseFloat(depositAmount) <= 0}
              className="w-full px-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : hasWarmStorage ? (
                "💰 Add to Storage Balance"
              ) : (
                "🚀 Setup Warm Storage"
              )}
            </button>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-xl text-sm font-medium ${status.includes("❌") ? "bg-red-50 border border-red-200 text-red-800" :
                  status.includes("✅") ? "bg-green-50 border border-green-200 text-green-800" :
                    "bg-blue-50 border border-blue-200 text-blue-800"
                }`}>
                {status}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};