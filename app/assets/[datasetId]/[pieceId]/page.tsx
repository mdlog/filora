"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import { NFTMintModal } from "@/components/marketplace/NFTMintModal";

import { LicenseVerificationBadge } from "@/components/marketplace/LicenseVerificationBadge";
import { useRoyaltyInfo } from "@/hooks/useRoyaltyInfo";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { getFilbeamPieceUrl } from "@/utils/filbeam";
import { useAssetPrice } from "@/hooks/useAssetPrice";
import { PurchaseModal } from "@/components/marketplace/PurchaseModal";
import { useAssetCreator } from "@/hooks/useAssetCreator";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const { data: balances } = useBalances();
  const [quantity, setQuantity] = useState(1);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const datasetId = parseInt(params.datasetId as string);
  const pieceId = parseInt(params.pieceId as string);
  const { data: allData } = useAllDatasets();
  const { creator, percentage } = useRoyaltyInfo(datasetId);
  const { price } = useAssetPrice(datasetId);
  const { creator: contractCreator } = useAssetCreator(datasetId);
  
  const assetData = allData?.datasets?.find(ds => ds.pdpVerifierDataSetId === datasetId);
  const pieceData = assetData?.data?.pieces?.find(p => p.pieceId === pieceId);
  
  const asset = {
    id: `${datasetId}-${pieceId}`,
    name: `Digital Asset #${pieceId}`,
    description: "Exclusive digital asset stored permanently on Filecoin blockchain via Synapse SDK. Verified on-chain with decentralized storage.",
    owner: assetData?.payer || "Unknown",
    pieceCid: pieceData?.pieceCid?.toString() || "Loading...",
    created: new Date().toISOString().split('T')[0],
    category: "Digital Asset",
    status: assetData?.isLive ? "Live" : "Inactive",
    provider: assetData?.provider?.name || "Unknown",
    datasetId,
    pieceId,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/?tab=marketplace")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>←</span> Back to Marketplace
        </motion.button>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-96 flex items-center justify-center relative">
              {pieceData?.pieceCid ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <a 
                    href={getFilbeamPieceUrl(pieceData.pieceCid.toString())} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-200 transition-colors text-center"
                  >
                    <span className="text-9xl block mb-4">🎨</span>
                    <span className="text-sm bg-black/50 px-4 py-2 rounded-lg">Click to preview via Filbeam CDN</span>
                  </a>
                </div>
              ) : (
                <span className="text-9xl">🎨</span>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  asset.status === "Live" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {asset.status === "Live" ? "✅ Live" : "⏸️ Inactive"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {asset.category}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">{asset.created}</span>
                </div>
                {price && parseFloat(price) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-indigo-600">{parseFloat(price).toFixed(2)} USDFC</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-mono text-xs">{asset.owner.length > 20 ? `${asset.owner.slice(0, 6)}...${asset.owner.slice(-4)}` : asset.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="text-xs">{asset.provider}</span>
                </div>
                <div>
                  <span className="text-gray-600">Piece CID:</span>
                  <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded mt-1">
                    {asset.pieceCid}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-800">{asset.name}</h1>
                <LicenseVerificationBadge tokenId={datasetId} />
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{asset.description}</p>
              
              {creator && percentage && (
                <div className="bg-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎨</span>
                    <span className="font-semibold text-gray-800">Creator Royalties</span>
                  </div>
                  <p className="text-sm text-gray-600">Creator: {creator.slice(0, 6)}...{creator.slice(-4)}</p>
                  <p className="text-sm text-gray-600">Royalty: {Number(percentage) / 100}%</p>
                </div>
              )}

              {price && parseFloat(price) > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Current Price</p>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {parseFloat(price).toFixed(2)} USDFC
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {price && parseFloat(price) > 0 && (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={!address}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      !address
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl"
                    }`}
                  >
                    {!address ? "Connect Wallet" : `💳 Buy for ${parseFloat(price).toFixed(2)} USDFC`}
                  </button>
                )}
                <button
                  onClick={() => setShowMintModal(true)}
                  disabled={!address}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    !address
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl"
                  }`}
                >
                  {!address ? "Connect Wallet" : "🪙 Mint NFT License"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">📝 Description</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {asset.description}
            </p>
            
            <h3 className="text-xl font-bold mb-4 mt-6">📊 Technical Details</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Dataset ID:</span>
                <span className="font-mono text-gray-800">{asset.datasetId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Piece ID:</span>
                <span className="font-mono text-gray-800">{asset.pieceId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Storage Provider:</span>
                <span className="text-gray-800">{asset.provider}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Network:</span>
                <span className="text-gray-800">Filecoin Calibration Testnet</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className={`font-semibold ${
                  asset.status === "Live" ? "text-green-600" : "text-gray-600"
                }`}>{asset.status}</span>
              </div>
              {pieceData?.pieceCid && (
                <div className="pt-2">
                  <span className="text-gray-600 font-medium block mb-2">🌐 CDN Access:</span>
                  <a 
                    href={getFilbeamPieceUrl(pieceData.pieceCid.toString())} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-xs break-all underline"
                  >
                    {getFilbeamPieceUrl(pieceData.pieceCid.toString())}
                  </a>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold mb-4">✨ Key Features</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <span className="text-2xl">🔐</span>
                <div>
                  <p className="font-semibold text-gray-800">Decentralized Storage</p>
                  <p className="text-gray-600">Stored permanently on Filecoin blockchain</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-gray-800">Verified Ownership</p>
                  <p className="text-gray-600">On-chain proof with transparent history</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold text-gray-800">Instant Transfer</p>
                  <p className="text-gray-600">Immediate ownership via smart contracts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="font-semibold text-gray-800">Immutable Records</p>
                  <p className="text-gray-600">Cannot be altered once on blockchain</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <NFTMintModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        assetId={datasetId}
        assetName={asset.name}
        pieceCid={pieceData?.pieceCid?.toString()}
        ownerAddress={contractCreator || asset.owner}
      />
      
      {price && parseFloat(price) > 0 && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          assetId={datasetId}
          assetName={asset.name}
          seller={asset.owner}
          price={price}
        />
      )}
    </div>
  );
}
