import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { preflightCheck } from "@/utils/preflightCheck";
import { useSynapse } from "@/providers/SynapseProvider";
import { Synapse } from "@filoz/synapse-sdk";
import { useAssetRegistry, useGetActiveAssets } from "@/hooks/useAssetRegistry";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  pieceCid?: string;
  txHash?: string;
  skippedReason?: string;
  existingPieceCid?: string;
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
  const { data: existingAssets, refetch: refetchAssets } = useGetActiveAssets();
  const [registryTxHash, setRegistryTxHash] = useState<`0x${string}` | undefined>();
  const queryClient = useQueryClient();

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

      // Track which dataset is actually used for this upload
      let uploadedToDatasetId: number | null = null;
      let uploadedToProviderId: number | null = null;

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
            // Track the dataset being used
            uploadedToDatasetId = info.dataSetId;
            uploadedToProviderId = info.provider?.id || null;
            console.log(`Upload will use Dataset ${uploadedToDatasetId}, Provider ${uploadedToProviderId}`);
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
            `🔄 Waiting for transaction to be confirmed on chain${transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
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
      setStatus("📝 Checking marketplace registry...");

      // Use the dataset that was actually used for upload
      if (uploadedToDatasetId && uploadedToProviderId) {
        const priceValue = price || "0";
        const currentPieceCid = pieceCid.toV1().toString();

        console.log(`Checking registry for Dataset ${uploadedToDatasetId}, Provider ${uploadedToProviderId}`);

        // Check if THIS SPECIFIC PIECE already registered
        // Contract allows only 1 asset per datasetId+providerId combination
        const existingAsset = existingAssets?.find(
          asset =>
            asset.datasetId === uploadedToDatasetId &&
            asset.providerId === uploadedToProviderId &&
            asset.isActive // Only check active assets (matches contract logic)
        );

        if (existingAsset) {
          // Check if it's the SAME piece CID
          if (existingAsset.pieceCid === currentPieceCid) {
            console.log("⚠️ This exact piece already registered in marketplace, skipping...");
            console.log(`Dataset ID: ${uploadedToDatasetId}, Provider ID: ${uploadedToProviderId}, PieceCID: ${currentPieceCid}`);
            setStatus("✅ Asset already in marketplace!");
            setProgress(100);
            return { pieceCid: currentPieceCid };
          } else {
            // DIFFERENT piece CID - this is a NEW file in the same dataset!
            console.warn("⚠️ Different piece detected!");
            console.warn(`Existing PieceCID: ${existingAsset.pieceCid}`);
            console.warn(`New PieceCID: ${currentPieceCid}`);
            console.warn(`Dataset ${uploadedToDatasetId} already has a registered asset.`);
            console.warn(`Contract only allows 1 asset per dataset+provider combination.`);
            console.warn(`Skipping registration to avoid revert. File is still uploaded to Filecoin.`);

            setStatus("⚠️ Dataset already has a registered asset. File uploaded but not added to marketplace.");
            setProgress(100);

            // Return with a flag indicating this is a non-registry upload
            return {
              pieceCid: currentPieceCid,
              skippedReason: "dataset_already_registered",
              existingPieceCid: existingAsset.pieceCid
            };
          }
        }

        // Proceed with registration if not duplicate
        console.log(`✅ No existing asset found for Dataset ${uploadedToDatasetId}, Provider ${uploadedToProviderId}. Proceeding with registration...`);
        setStatus("📝 Registering asset in marketplace...");
        try {
          const txHash = await registerAsset(
            uploadedToDatasetId,
            uploadedToProviderId,
            pieceCid.toV1().toString(),
            priceValue
          );
          setStatus("⏳ Waiting for registry transaction confirmation...");
          return { txHash, pieceCid: pieceCid.toV1().toString() };
        } catch (error: any) {
          console.error("Registry registration failed:", error);
          // If registration fails but file is uploaded, still return success
          if (error.message?.includes("already registered") ||
            error.message?.includes("duplicate")) {
            setStatus("✅ File uploaded successfully! (Already in marketplace)");
            return { pieceCid: pieceCid.toV1().toString() };
          }
          throw error;
        }
      } else {
        console.warn("⚠️ Could not determine dataset/provider ID. Skipping registry registration.");
        setStatus("✅ File uploaded successfully! (No registry registration)");
        setProgress(100);
      }
      return { pieceCid: pieceCid.toV1().toString() };
    },
    onSuccess: async (data) => {
      if (data?.txHash) {
        setRegistryTxHash(data.txHash as `0x${string}`);
        console.log("✅ Registry transaction sent:", data.txHash);
        setStatus("⏳ Waiting for registry confirmation...");
      } else {
        setStatus("🎉 File successfully stored on Filecoin!");
        setProgress(100);
        triggerConfetti();
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ["all-datasets"] });
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
  useEffect(() => {
    if (isRegistryConfirmed && registryTxHash) {
      console.log("✅ Registry transaction confirmed!");
      setStatus("🎉 Asset registered in marketplace successfully!");
      setProgress(100);
      triggerConfetti();

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["all-datasets"] });
      refetchAssets();

      // Clear registry tx hash after a delay
      const timer = setTimeout(() => {
        setRegistryTxHash(undefined);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isRegistryConfirmed, registryTxHash, queryClient, refetchAssets, triggerConfetti]);

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};
