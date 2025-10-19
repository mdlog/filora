"use client";

import { useWriteContract, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { FilecoinPayABI } from "@/contracts/abis";
import { parseEther, formatEther } from "ethers";

export const useAssetPrice = (tokenId: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
    abi: FilecoinPayABI,
    functionName: "assetPrice",
    args: [BigInt(tokenId)],
    query: {
      enabled: !!CONTRACT_ADDRESSES.FilecoinPay && tokenId > 0,
    },
  });

  const price = data ? formatEther(data as bigint) : "0";

  return { price, isLoading, error, refetch };
};

export const useAssetPriceManagement = () => {
  const { writeContractAsync } = useWriteContract();

  const setAssetPrice = async (tokenId: number, price: string): Promise<`0x${string}`> => {
    if (!CONTRACT_ADDRESSES.FilecoinPay) {
      throw new Error("FilecoinPay contract not deployed");
    }

    try {
      const priceWei = parseEther(price);

      console.log("Setting asset price in FilecoinPay:", {
        tokenId,
        price,
        priceWei: priceWei.toString(),
      });

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
        abi: FilecoinPayABI,
        functionName: "setPrice",
        args: [BigInt(tokenId), priceWei],
      });

      console.log("✅ Price set successfully in FilecoinPay. Tx hash:", hash);
      return hash;
    } catch (error: any) {
      console.error("❌ Failed to set price in FilecoinPay:", error);
      throw error;
    }
  };

  return { setAssetPrice };
};
