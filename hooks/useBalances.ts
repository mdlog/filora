import { useQuery } from "@tanstack/react-query";
import { TOKENS } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";
import { calculateStorageMetrics } from "@/utils/calculateStorageMetrics";
import { formatUnits } from "viem";
import { defaultBalances, UseBalancesResponse } from "@/types";
import { useSynapse } from "@/providers/SynapseProvider";

/**
 * Hook to fetch and format wallet balances and storage metrics
 */
export const useBalances = () => {
  const { synapse } = useSynapse();
  const { address } = useAccount();

  const query = useQuery({
    queryKey: ["balances", address],
    queryFn: async (): Promise<UseBalancesResponse> => {
      if (!synapse) {
        console.error("❌ Synapse not initialized");
        throw new Error("Synapse SDK not initialized. Please wait or refresh the page.");
      }
      if (!address) {
        console.error("❌ Wallet not connected");
        throw new Error("Wallet not connected");
      }

      console.log("🔍 Fetching balances for address:", address);

      try {
        // Fetch raw balances
        const [filRaw, usdfcRaw, paymentsRaw] = await Promise.all([
          synapse.payments.walletBalance(),
          synapse.payments.walletBalance(TOKENS.USDFC),
          synapse.payments.balance(TOKENS.USDFC),
        ]);

        console.log("💰 Raw balances fetched:", {
          filRaw: filRaw.toString(),
          usdfcRaw: usdfcRaw.toString(),
          paymentsRaw: paymentsRaw.toString(),
        });

        const usdfcDecimals = synapse.payments.decimals(TOKENS.USDFC);

        // Calculate storage metrics with error handling
        let storageMetrics;
        try {
          storageMetrics = await calculateStorageMetrics(synapse);
          console.log("📊 Storage metrics calculated:", storageMetrics);
        } catch (storageError: any) {
          console.error("⚠️ Error calculating storage metrics:", storageError);
          // Use default storage metrics if calculation fails
          storageMetrics = {
            rateNeeded: 0n,
            rateUsed: 0n,
            currentStorageBytes: 0n,
            currentStorageGB: 0,
            totalLockupNeeded: 0n,
            depositNeeded: 0n,
            persistenceDaysLeft: 0,
            persistenceDaysLeftAtCurrentRate: 0,
            isRateSufficient: false,
            isLockupSufficient: false,
            isSufficient: false,
            currentRateAllowanceGB: 0,
            currentLockupAllowance: 0n,
          };
        }

        const result = {
          filBalance: filRaw,
          usdfcBalance: usdfcRaw,
          warmStorageBalance: paymentsRaw,
          filBalanceFormatted: formatBalance(filRaw, 18),
          usdfcBalanceFormatted: formatBalance(usdfcRaw, usdfcDecimals),
          warmStorageBalanceFormatted: formatBalance(paymentsRaw, usdfcDecimals),
          ...storageMetrics,
        };

        console.log("✅ Balances formatted:", result);

        return result;
      } catch (error: any) {
        console.error("❌ Error fetching balances:", error);
        throw new Error(`Failed to fetch balances: ${error.message || "Unknown error"}`);
      }
    },
    enabled: !!address && !!synapse, // ✅ Only run query when wallet is connected and synapse is ready
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchInterval: 10000, // Refetch every 10 seconds to keep balances updated
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  return {
    ...query,
    data: query.data || defaultBalances,
  };
};

/**
 * Formats a balance value with specified decimals
 */
export const formatBalance = (balance: bigint, decimals: number): number => {
  return Number(Number(formatUnits(balance, decimals)).toFixed(5));
};
