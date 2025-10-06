"use client";

import { useReadContract } from "wagmi";
import { FilecoinPayABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { formatEther } from "ethers";

export const useAssetPrice = (tokenId: number) => {
  const { data: price, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI as any,
    functionName: "assetPrice",
    args: [BigInt(tokenId)],
    query: {
      enabled: !isNaN(tokenId),
    },
  });

  const priceBigInt = price as bigint | undefined;
  console.log(`Price for tokenId ${tokenId}:`, priceBigInt, "formatted:", priceBigInt ? formatEther(priceBigInt) : "0");

  return {
    price: priceBigInt && priceBigInt > 0n ? formatEther(priceBigInt) : "0",
    priceRaw: priceBigInt || 0n,
    isLoading,
  };
};
