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
      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Wallet not connected");

      console.log("🔍 Fetching balances for address:", address);

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

      // Calculate storage metrics
      const storageMetrics = await calculateStorageMetrics(synapse);

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
    },
    enabled: !!address && !!synapse, // ✅ Only run query when wallet is connected and synapse is ready
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
