"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { AssetRegistryABI } from "@/contracts/abis";

export const useAssetRegistry = () => {
  const { writeContractAsync } = useWriteContract();

  const registerAsset = async (datasetId: number, providerId: number, pieceCid: string, price: number = 0) => {
    if (!CONTRACT_ADDRESSES.AssetRegistry) {
      throw new Error("AssetRegistry contract not deployed");
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.AssetRegistry as `0x${string}`,
      abi: AssetRegistryABI,
      functionName: "registerAsset",
      args: [BigInt(datasetId), BigInt(providerId), pieceCid, BigInt(price)],
    });

    return hash;
  };

  return { registerAsset };
};

export const useGetActiveAssets = () => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AssetRegistry as `0x${string}`,
    abi: AssetRegistryABI,
    functionName: "getActiveAssets",
    query: {
      enabled: !!CONTRACT_ADDRESSES.AssetRegistry,
    },
  });

  const serializedData = data ? (data as any[]).map((asset: any) => ({
    owner: asset.owner,
    datasetId: Number(asset.datasetId),
    providerId: Number(asset.providerId),
    pieceCid: asset.pieceCid,
    price: Number(asset.price),
    timestamp: Number(asset.timestamp),
    isActive: asset.isActive,
  })) : undefined;

  return { data: serializedData, isLoading, error, refetch };
};
