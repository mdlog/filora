"use client";

import { useReadContract } from "wagmi";
import { FiloraLicense1155ABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

export const useAssetCreator = (tokenId: number) => {
  const { data: creator, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FiloraLicense1155 as `0x${string}`,
    abi: FiloraLicense1155ABI,
    functionName: "creators",
    args: [BigInt(tokenId)],
    query: {
      enabled: !isNaN(tokenId),
    },
  });

  return {
    creator: creator as string,
    isLoading,
  };
};
