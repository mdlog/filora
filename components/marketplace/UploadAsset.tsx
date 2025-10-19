"use client";
import { useState, useCallback } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useBalances } from "@/hooks/useBalances";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { FilecoinPayABI } from "@/contracts/abis";
import { parseEther } from "ethers";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Alert } from "@/components/ui/Alert";
import { FileText, DollarSign, Upload as UploadIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const UploadAsset = () => {
  const { address } = useAccount();
  const { data: balances, isLoading: isLoadingBalances } = useBalances();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    price: "",
    royaltyPercentage: "10", // Default 10% royalty
    fileExtension: "" // File extension (e.g., jpg, pdf, mp4)
  });
  const [datasetId, setDatasetId] = useState<number | null>(null);
  const { uploadFileMutation, uploadedInfo, handleReset, status, progress } = useFileUpload();
  const { isPending: isUploading, mutateAsync: uploadFile } = uploadFileMutation;
  const { mutateAsync: mintNFT } = useNFTMint();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      setFile(droppedFile);

      // ✅ Auto-fill Asset Name with full filename including extension
      const fullFileName = droppedFile.name;
      const ext = fullFileName.split('.').pop() || '';

      setMetadata(prev => ({
        ...prev,
        name: fullFileName, // ✅ Use full filename with extension
        fileExtension: ext.toLowerCase()
      }));

      console.log("📁 File dropped:", {
        name: fullFileName,
        extension: ext,
        size: droppedFile.size
      });
    }
  }, []);

  // Check if user has warm storage setup
  const hasNoWarmStorage = !isLoadingBalances &&
    (balances?.warmStorageBalance === 0n || !balances?.warmStorageBalance) &&
    (balances?.currentRateAllowanceGB === 0 || !balances?.currentRateAllowanceGB);

  // Check if user has enough balance
  const hasEnoughBalance = !isLoadingBalances &&
    balances?.filBalance && balances.filBalance > 0n &&
    balances?.usdfcBalance && balances.usdfcBalance > 0n;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Warm Storage Setup Warning */}
      {!isLoadingBalances && hasNoWarmStorage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-2xl shadow-2xl p-6 border-2 border-red-300"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl animate-bounce">
                ⚠️
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                🚫 Upload Disabled - Warm Storage Setup Required
              </h3>
              <p className="text-orange-100 mb-4 text-sm leading-relaxed">
                You cannot upload files because warm storage is not set up yet. Please set up warm storage first in the Dashboard.
              </p>

              {hasEnoughBalance && (
                <div className="bg-green-500/20 border border-green-300 rounded-xl p-3 mb-4">
                  <p className="text-green-100 text-sm font-semibold flex items-center gap-2">
                    <span>✅</span>
                    Good news! You have enough balance to setup storage automatically.
                  </p>
                </div>
              )}

              {!hasEnoughBalance && (
                <div className="bg-yellow-500/20 border border-yellow-300 rounded-xl p-3 mb-4">
                  <p className="text-yellow-100 text-sm font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    You need tFIL and USDFC tokens first before setting up storage.
                  </p>
                </div>
              )}

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  📋 What You Need To Do:
                </h4>
                <ol className="space-y-2 text-sm text-orange-50">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white">1.</span>
                    <span>Click <strong>&quot;Go to Dashboard&quot;</strong> button below</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white">2.</span>
                    <span>{hasEnoughBalance ? 'Click "Auto-Setup Storage Now" to automatically configure storage' : 'Get tFIL and USDFC tokens from faucets'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white">3.</span>
                    <span>{hasEnoughBalance ? 'Approve 2 transactions in your wallet' : 'Return to Dashboard and setup storage'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-white">4.</span>
                    <span>Come back to this Upload tab and start uploading! 🎉</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  💡 Why Do I Need Warm Storage?
                </h4>
                <ul className="space-y-1 text-sm text-orange-50">
                  <li>• Storage is required to store your files on Filecoin network</li>
                  <li>• Default allocation: <strong>10 GB</strong> for <strong>30 days</strong></li>
                  <li>• Estimated cost: <strong>~0.1 USDFC</strong></li>
                  <li>• One-time setup, reusable for all uploads</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/?tab=dashboard")}
                  className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  <span>🏠</span>
                  Go to Dashboard
                </button>

                {!hasEnoughBalance && (
                  <>
                    <button
                      onClick={() => window.open("https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc", "_blank")}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30 flex items-center gap-2"
                    >
                      <span>🚰</span>
                      Get USDFC
                    </button>

                    <button
                      onClick={() => window.open("https://faucet.calibnet.chainsafe-fil.io/funds.html", "_blank")}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30 flex items-center gap-2"
                    >
                      <span>💎</span>
                      Get tFIL
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Form - Disabled if no warm storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-xl p-8 ${hasNoWarmStorage ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📤</span>
            Upload Digital Asset
          </h2>

          {hasNoWarmStorage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
              <span>🔒</span>
              <span>Upload Disabled</span>
            </div>
          )}
        </div>

        <div
          className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all mb-6 ${isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (isUploading) return;
            document.getElementById("fileInput")?.click();
          }}
        >
          <input
            id="fileInput"
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const selectedFile = e.target.files[0];
                setFile(selectedFile);

                // ✅ Auto-fill Asset Name with full filename including extension
                const fullFileName = selectedFile.name;
                const ext = fullFileName.split('.').pop() || '';

                setMetadata(prev => ({
                  ...prev,
                  name: fullFileName, // ✅ Use full filename with extension
                  fileExtension: ext.toLowerCase()
                }));

                console.log("📁 File selected:", {
                  name: fullFileName,
                  extension: ext,
                  size: selectedFile.size
                });
              }
              e.target.value = "";
            }}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">{file ? "📁" : "☁️"}</div>
            <div>
              <p className="text-xl font-semibold text-gray-800">
                {file ? file.name : "Drop your file here"}
              </p>
              {!file && (
                <p className="text-gray-500 mt-2">
                  or click to browse (Images, Videos, Audio, Documents)
                </p>
              )}
              {file && (
                <p className="text-gray-500 mt-2">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          {/* Asset Name Input with Badge */}
          <div className="relative">
            <Input
              label="Asset Name"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              placeholder="Select a file to auto-fill name with extension"
              icon={<FileText className="w-5 h-5" />}
              helperText={
                file && metadata.name
                  ? `Filename for buyers: ${metadata.name}`
                  : "Upload a file first, and the name will be auto-filled"
              }
              error={!metadata.name && file ? "Asset name is required" : undefined}
            />
          </div>

          {/* Description Textarea */}
          <Textarea
            label="Description"
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            placeholder="Describe your digital asset in detail"
            rows={4}
            maxLength={500}
            showCount
            helperText="Provide a detailed description to attract buyers"
          />

          {/* Price Input */}
          <Input
            label="Price (USDFC)"
            type="number"
            value={metadata.price}
            onChange={(e) => setMetadata({ ...metadata, price: e.target.value })}
            placeholder="0.00"
            step="0.01"
            min="0"
            icon={<DollarSign className="w-5 h-5" />}
            helperText="Set the price for your asset in USDFC tokens"
            error={metadata.price && parseFloat(metadata.price) < 0 ? "Price must be positive" : undefined}
          />

          {/* Royalty Slider */}
          <div>
            <Slider
              label="Royalty Percentage"
              value={Number(metadata.royaltyPercentage) || 0}
              onChange={(e) => setMetadata({ ...metadata, royaltyPercentage: e.target.value })}
              min={0}
              max={100}
              showValue
              formatValue={(v) => `${v}%`}
              marks={[0, 25, 50, 75, 100]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Percentage of sales that goes to you as the creator (0-100%)
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={async () => {
              if (!file || !address) return;
              try {
                console.log("🚀 Starting upload process...");
                console.log("📋 Upload metadata:", {
                  fileName: metadata.name,
                  price: metadata.price,
                  royalty: metadata.royaltyPercentage,
                });

                // Upload file to Filecoin with price
                const priceInWei = metadata.price ? parseEther(metadata.price) : BigInt(0);
                console.log("💰 Price in Wei:", priceInWei.toString());

                const result = await uploadFile({ file, price: priceInWei.toString() });

                // File uploaded successfully
                if (result?.pieceCid) {
                  console.log("✅ File uploaded with Piece CID:", result.pieceCid);

                  // Store dataset ID for royalty and price setting
                  if ((result as any).datasetId) {
                    setDatasetId((result as any).datasetId);
                    console.log("📝 Dataset ID stored:", (result as any).datasetId);

                    // ✅ CRITICAL: Set price in FilecoinPay contract
                    if (metadata.price && parseFloat(metadata.price) > 0) {
                      console.log("💰 Setting price in FilecoinPay:", metadata.price);
                      try {
                        const priceWei = parseEther(metadata.price);
                        console.log("💰 Price in Wei:", priceWei.toString());

                        const priceTxHash = await writeContract({
                          address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
                          abi: FilecoinPayABI,
                          functionName: "setPrice",
                          args: [BigInt((result as any).datasetId), priceWei],
                        });

                        console.log("✅ Price set in FilecoinPay:", priceTxHash);
                      } catch (priceError: any) {
                        console.error("⚠️ Failed to set price in FilecoinPay:", priceError);
                        console.warn("Upload succeeded but price setting in FilecoinPay failed. Purchases will fail!");
                      }
                    }

                    // Set royalty if percentage is provided
                    if (metadata.royaltyPercentage && parseFloat(metadata.royaltyPercentage) > 0) {
                      console.log("💎 Setting royalty percentage:", metadata.royaltyPercentage);
                      try {
                        // Convert percentage to basis points (e.g., 10% = 1000 basis points)
                        const royaltyBasisPoints = Math.floor(parseFloat(metadata.royaltyPercentage) * 100);

                        console.log("📊 Royalty basis points:", royaltyBasisPoints);
                        console.log("🎨 Setting royalty for dataset:", result.datasetId);
                        console.log("👤 Creator address:", address);

                        // Call FilecoinPay contract to set royalty
                        const royaltyTxHash = await writeContract({
                          address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
                          abi: FilecoinPayABI,
                          functionName: "setRoyalty",
                          args: [BigInt((result as any).datasetId), address, BigInt(royaltyBasisPoints)],
                        });

                        console.log("✅ Royalty transaction sent:", royaltyTxHash);
                      } catch (royaltyError: any) {
                        console.error("⚠️ Failed to set royalty:", royaltyError);
                        // Don't fail the whole upload if royalty setting fails
                        console.warn("Upload succeeded but royalty setting failed. You can set it later.");
                      }
                    }
                  }

                  console.log("🎉 Upload process completed successfully!");
                }
              } catch (error) {
                console.error("❌ Upload failed:", error);
              }
            }}
            disabled={!file || isUploading || !!uploadedInfo || !address}
            className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${!file || isUploading || uploadedInfo || !address
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl"
              }`}
          >
            {!address ? "Connect Wallet" : isUploading ? "Uploading..." : uploadedInfo ? "✅ Uploaded" : "🚀 Upload Asset"}
          </button>
          <button
            onClick={() => {
              handleReset();
              setFile(null);
              setDatasetId(null);
              setMetadata({ name: "", description: "", price: "", royaltyPercentage: "10", fileExtension: "" });
            }}
            disabled={!file || isUploading}
            className={`px-8 py-4 rounded-xl font-semibold transition-all ${!file || isUploading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Reset
          </button>
        </div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div
              className={`p-4 rounded-xl ${status.includes("❌")
                ? "bg-red-50 text-red-700"
                : status.includes("✅") || status.includes("🎉")
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
                }`}
            >
              <p className="font-semibold">{status}</p>
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {uploadedInfo && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6"
          >
            <h4 className="font-bold text-lg text-green-800 mb-4 flex items-center gap-2">
              <span>✅</span> Upload Successful!
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Asset Name:</span>
                <span className="font-semibold text-gray-800">{metadata.name || uploadedInfo.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-gray-800">{metadata.price || "0"} USDFC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Royalty:</span>
                <span className="font-semibold text-gray-800">{metadata.royaltyPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">File size:</span>
                <span className="font-semibold text-gray-800">
                  {uploadedInfo.fileSize?.toLocaleString()} bytes
                </span>
              </div>
              <div className="break-all">
                <span className="text-gray-600">Piece CID:</span>
                <p className="font-mono text-xs mt-1 bg-white p-2 rounded">{uploadedInfo.pieceCid}</p>
              </div>
              <div className="break-all">
                <span className="text-gray-600">Tx Hash:</span>
                <p className="font-mono text-xs mt-1 bg-white p-2 rounded">{uploadedInfo.txHash}</p>
              </div>
              {datasetId !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dataset ID:</span>
                  <span className="font-semibold text-gray-800">#{datasetId}</span>
                </div>
              )}
            </div>
            {isConfirming && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">⏳ Setting royalty on-chain...</p>
              </div>
            )}
            {hash && !isConfirming && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">✅ Royalty set successfully!</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
