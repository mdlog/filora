import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { preflightCheck } from "@/utils/preflightCheck";
import { useSynapse } from "@/providers/SynapseProvider";
import { Synapse } from "@filoz/synapse-sdk";
import { useAssetRegistry } from "@/hooks/useAssetRegistry";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  pieceCid?: string;
  txHash?: string;
};

/**
 * Hook to upload a file to the Filecoin network using Synapse.
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const { synapse } = useSynapse();
  const { triggerConfetti } = useConfetti();
  const { address } = useAccount();
  const { registerAsset } = useAssetRegistry();
  const [registryTxHash, setRegistryTxHash] = useState<`0x${string}` | undefined>();
  
  const { isSuccess: isRegistryConfirmed } = useWaitForTransactionReceipt({
    hash: registryTxHash,
  });

  const mutation = useMutation({
    mutationKey: ["file-upload", address],
    mutationFn: async ({ file, price }: { file: File; price?: string }) => {
      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Address not found");
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing file upload to Filecoin...");

      // 1) Convert File → ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // 2) Convert ArrayBuffer → Uint8Array
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      // 3) Create Synapse instance

      // 4) Get dataset
      const datasets = await synapse.storage.findDataSets(address);
      // 5) Check if we have a dataset
      const datasetExists = datasets.length > 0;
      // Include proofset creation fee if no proofset exists
      const includeDatasetCreationFee = !datasetExists;

      // 6) Check if we have enough USDFC to cover the storage costs and deposit if not
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        includeDatasetCreationFee,
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage service and dataset...");
      setProgress(25);

      // 7) Create storage service
      const storageService = await synapse.createStorage({
        callbacks: {
          onDataSetResolved: (info) => {
            console.log("Dataset resolved:", info);
            setStatus("🔗 Existing dataset found and resolved");
            setProgress(30);
          },
          onDataSetCreationStarted: (transactionResponse, statusUrl) => {
            console.log("Dataset creation started:", transactionResponse);
            console.log("Dataset creation status URL:", statusUrl);
            setStatus("🏗️ Creating new dataset on blockchain...");
            setProgress(35);
          },
          onDataSetCreationProgress: (status) => {
            console.log("Dataset creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Dataset transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(
                `🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`
              );
              setProgress(50);
            }
          },
          onProviderSelected: (provider) => {
            console.log("Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading file to storage provider...");
      setProgress(55);
      // 8) Upload file to storage provider
      const { pieceCid } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (piece) => {
          setStatus(
            `📊 File uploaded! Signing msg to add pieces to the dataset`
          );
          setUploadedInfo((prev) => ({
            ...prev,
            fileName: file.name,
            fileSize: file.size,
            pieceCid: piece.toV1().toString(),
          }));
          setProgress(80);
        },
        onPieceAdded: (transactionResponse) => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
            }`
          );
          if (transactionResponse) {
            console.log("Transaction response:", transactionResponse);
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
        },
        onPieceConfirmed: (pieceIds) => {
          setStatus("🌳 Data pieces added to dataset successfully");
          setProgress(90);
        },
      });

      setProgress(95);
      setUploadedInfo((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        pieceCid: pieceCid.toV1().toString(),
      }));

      // Register asset in registry contract
      setStatus("📝 Registering asset in marketplace...");
      const userDatasets = await synapse.storage.findDataSets(address);
      if (userDatasets.length > 0) {
        const dataset = userDatasets[0];
        const priceValue = price ? Number(price) : 0;
        const txHash = await registerAsset(
          dataset.pdpVerifierDataSetId,
          dataset.providerId,
          pieceCid.toV1().toString(),
          priceValue
        );
        setStatus("⏳ Waiting for registry transaction confirmation...");
        return { txHash, pieceCid: pieceCid.toV1().toString() };
      }
      return { pieceCid: pieceCid.toV1().toString() };
    },
    onSuccess: (data) => {
      if (data?.txHash) {
        setRegistryTxHash(data.txHash as `0x${string}`);
      } else {
        setStatus("🎉 File successfully stored on Filecoin!");
        setProgress(100);
        triggerConfetti();
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
    setRegistryTxHash(undefined);
  };

  // Trigger success when registry tx is confirmed
  if (isRegistryConfirmed && registryTxHash) {
    setStatus("🎉 File successfully stored on Filecoin!");
    setProgress(100);
    triggerConfetti();
    setRegistryTxHash(undefined);
  }

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};
