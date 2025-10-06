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

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const amount = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
    
    await mutation.mutateAsync({
      lockupAllowance: amount,
      epochRateAllowance: amount / BigInt(30), // Rough estimate for rate
      depositAmount: amount,
    });
    
    await refetch();
    onClose();
  };

  const needsTokens = balances?.usdfcBalance === 0n;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Setup Warm Storage</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">
                💡 Initial Deposit Required
              </p>
              <p className="text-sm text-blue-700">
                Deposit USDFC to enable {config.storageCapacity}GB storage for {config.persistencePeriod} days.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (USDFC)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {balances?.usdfcBalanceFormatted?.toLocaleString()} USDFC
              </p>
            </div>

            <button
              onClick={handleDeposit}
              disabled={mutation.isPending || !depositAmount}
              className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {mutation.isPending ? "Processing..." : "Setup Warm Storage"}
            </button>

            {status && (
              <div className={`p-3 rounded-lg text-sm ${
                status.includes("❌") ? "bg-red-50 text-red-800" :
                status.includes("✅") ? "bg-green-50 text-green-800" :
                "bg-blue-50 text-blue-800"
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