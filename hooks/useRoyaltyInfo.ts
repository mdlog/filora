"use client";

import { useReadContract, useAccount } from "wagmi";
import { FilecoinPayABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

export const useRoyaltyInfo = (tokenId: number) => {
  const { address } = useAccount();

  // Get royalty recipient (creator address)
  const { data: creator, isLoading: isLoadingCreator } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI as any,
    functionName: "royaltyRecipient",
    args: [BigInt(tokenId)],
    query: {
      enabled: !isNaN(tokenId),
    },
  });

  // Get royalty percentage (basis points)
  const { data: percentage, isLoading: isLoadingPercentage } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI as any,
    functionName: "royaltyPercentage",
    args: [BigInt(tokenId)],
    query: {
      enabled: !isNaN(tokenId),
    },
  });

  // Get pending royalties for current user (if they are a creator)
  const { data: pendingRoyalties, isLoading: isLoadingPending } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI as any,
    functionName: "pendingRoyalties",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    creator: creator as string | undefined,
    percentage: percentage as bigint | undefined,
    pendingRoyalties: pendingRoyalties as bigint | undefined,
    isLoading: isLoadingCreator || isLoadingPercentage || isLoadingPending,
  };
};
