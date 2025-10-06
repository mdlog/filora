"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { AssetRegistryABI } from "@/contracts/abis";

export const useAssetRegistry = () => {
  const { writeContractAsync } = useWriteContract();

  const registerAsset = async (
    datasetId: number,
    providerId: number,
    pieceCid: string,
    price: string | number = 0,
    retryCount: number = 0
  ): Promise<`0x${string}`> => {
    if (!CONTRACT_ADDRESSES.AssetRegistry) {
      throw new Error("AssetRegistry contract not deployed");
    }

    try {
      // Convert price to BigInt - handle both string (wei) and number
      const priceBigInt = typeof price === 'string' ? BigInt(price) : BigInt(price);

      console.log("Registering asset with params:", {
        datasetId,
        providerId,
        pieceCid,
        price: priceBigInt.toString(),
        retryAttempt: retryCount,
      });

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.AssetRegistry as `0x${string}`,
        abi: AssetRegistryABI,
        functionName: "registerAsset",
        args: [BigInt(datasetId), BigInt(providerId), pieceCid, priceBigInt],
      });

      console.log("✅ Asset registered successfully. Tx hash:", hash);
      return hash;
    } catch (error: any) {
      console.error("❌ Failed to register asset:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data,
      });

      // Check for contract revert errors first
      if (error.message?.includes("ContractFunctionExecutionError") ||
        error.message?.includes("execution reverted") ||
        error.message?.includes("SysErrContractReverted")) {

        // Check for duplicate/already exists
        if (error.message?.includes("already registered") ||
          error.message?.includes("duplicate") ||
          error.message?.includes("exists")) {
          throw new Error("Asset already registered in marketplace");
        }

        // Check for invalid parameters
        if (error.message?.includes("Invalid dataset") ||
          error.message?.includes("Invalid provider") ||
          error.message?.includes("Invalid")) {
          throw new Error(
            "Invalid parameters detected:\n" +
            `- Dataset ID: ${datasetId}\n` +
            `- Provider ID: ${providerId}\n` +
            `- Piece CID: ${pieceCid}\n` +
            "Please ensure the file was uploaded successfully."
          );
        }

        // Check for empty/invalid CID
        if (error.message?.includes("Empty") ||
          error.message?.includes("CID")) {
          throw new Error("Invalid or empty piece CID. Upload may have failed.");
        }

        // Generic contract revert
        throw new Error(
          "⚠️ Contract execution failed (SysErrContractReverted)\n\n" +
          "Possible reasons:\n" +
          "1. Asset already registered with same dataset/provider ID\n" +
          "2. Invalid dataset or provider ID (must be > 0)\n" +
          "3. Invalid or empty piece CID\n" +
          "4. Contract paused or restricted\n\n" +
          "Please check console logs for details or try uploading a different file."
        );
      }

      // Retry logic for network errors
      if (error.message?.includes("Internal JSON-RPC error") && retryCount < 2) {
        console.log(`⏳ Retrying registration... (attempt ${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return registerAsset(datasetId, providerId, pieceCid, price, retryCount + 1);
      }

      // Provide more helpful error messages
      if (error.message?.includes("Internal JSON-RPC error")) {
        throw new Error(
          "Network error occurred. Please try the following:\n" +
          "1. Check your wallet connection\n" +
          "2. Ensure you have enough tFIL for gas fees\n" +
          "3. Try refreshing the page and uploading again"
        );
      }

      if (error.message?.includes("user rejected")) {
        throw new Error("Transaction was rejected. Please try again.");
      }

      throw error;
    }
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
