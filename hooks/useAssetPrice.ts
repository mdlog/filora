"use client";

import { useReadContract } from "wagmi";
import { FilecoinPayABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { formatEther } from "ethers";

export const useAssetPrice = (tokenId: number) => {
  const { data: price, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI,
    functionName: "assetPrice",
    args: [BigInt(tokenId)],
    query: {
      enabled: !isNaN(tokenId),
    },
  });

  console.log(`Price for tokenId ${tokenId}:`, price, "formatted:", price ? formatEther(price as bigint) : "0");

  return {
    price: price && price > 0n ? formatEther(price as bigint) : "0",
    priceRaw: price as bigint,
    isLoading,
  };
};
