"use client";

import { useReadContract } from "wagmi";
import { FilecoinPayABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

export const useRoyaltyInfo = (tokenId: number) => {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI,
    functionName: "getRoyaltyInfo",
    args: [BigInt(tokenId)],
  });

  const royaltyData = data as [string, bigint] | undefined;

  return {
    creator: royaltyData?.[0],
    percentage: royaltyData?.[1],
    isLoading,
  };
};
