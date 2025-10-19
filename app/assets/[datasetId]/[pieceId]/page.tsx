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
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { AssetPreview } from "@/components/marketplace/AssetPreview";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const { data: balances } = useBalances();
  const [quantity, setQuantity] = useState(1);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const datasetId = parseInt(params.datasetId as string);
  const pieceId = parseInt(params.pieceId as string);
  const { data: allData, isLoading } = useAllDatasets();
  const { creator, percentage } = useRoyaltyInfo(datasetId);
  const { price } = useAssetPrice(datasetId);
  const { creator: contractCreator } = useAssetCreator(datasetId);
  const { purchases } = usePurchasedAssets();

  // Check if user has already purchased this asset
  const hasPurchased = purchases.some(p => p.datasetId === datasetId && p.pieceId === pieceId);

  const assetData = allData?.datasets?.find(ds => ds.pdpVerifierDataSetId === datasetId);
  const pieceData = assetData?.data?.pieces?.find(p => p.pieceId === pieceId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!assetData || !pieceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Asset Not Found</h3>
            <p className="text-gray-600 mb-4">Dataset ID: {datasetId}, Piece ID: {pieceId}</p>
            <button
              onClick={() => router.push("/?tab=marketplace")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use price from registry if available, otherwise from contract
  const registryPrice = assetData?.price ? (assetData.price / 1e18).toFixed(2) : null;
  const displayPrice = registryPrice || price;

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

  // Check if owner is valid
  const hasValidOwner = asset.owner && asset.owner !== "Unknown" && asset.owner !== "null" && asset.owner.startsWith("0x");
  const canPurchase = hasValidOwner && displayPrice && parseFloat(displayPrice) > 0;

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
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-96 flex items-center justify-center relative overflow-hidden">
              {pieceData?.pieceCid && asset.owner ? (
                <>
                  <img
                    src={`https://${asset.owner}.calibration.filcdn.io/${pieceData.pieceCid.toString()}`}
                    alt={asset.name}
                    className="w-full h-full object-cover absolute inset-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Preview Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg hover:bg-white transition-colors"
                      title="Preview Asset"
                    >
                      <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-9xl">🎨</span>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${asset.status === "Live" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
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
                {displayPrice && parseFloat(displayPrice) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-indigo-600">{parseFloat(displayPrice).toFixed(2)} USDFC</span>
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

              {displayPrice && parseFloat(displayPrice) > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Current Price</p>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {parseFloat(displayPrice).toFixed(2)} USDFC
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Warning if owner is invalid */}
                {!hasValidOwner && displayPrice && parseFloat(displayPrice) > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Cannot Purchase - Invalid Owner</span>
                    </p>
                    <p className="text-xs text-red-700">
                      This asset doesn&apos;t have a valid owner address recorded. The asset may have been uploaded incorrectly or the ownership data was not properly set. Purchase is disabled.
                    </p>
                    <p className="text-xs text-red-600 mt-2 font-mono">
                      Owner: {asset.owner}
                    </p>
                  </div>
                )}

                {/* Show Buy button only if NOT purchased yet */}
                {!hasPurchased && displayPrice && parseFloat(displayPrice) > 0 && (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={!address || !canPurchase}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!address || !canPurchase
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl"
                      }`}
                  >
                    {!address
                      ? "Connect Wallet"
                      : !canPurchase
                        ? "❌ Purchase Unavailable"
                        : `💳 Buy for ${parseFloat(displayPrice).toFixed(2)} USDFC`}
                  </button>
                )}

                {/* Show Mint button only AFTER purchase */}
                {hasPurchased && (
                  <button
                    onClick={() => setShowMintModal(true)}
                    disabled={!address}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!address
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl"
                      }`}
                  >
                    {!address ? "Connect Wallet" : "🪙 Mint NFT License"}
                  </button>
                )}

                {/* Info message: Must purchase before minting */}
                {!hasPurchased && displayPrice && parseFloat(displayPrice) > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
                    <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                      <span>💡</span>
                      <span>NFT License Information</span>
                    </p>
                    <p className="text-xs text-amber-700">
                      After purchasing this asset, you can mint an NFT license to verify your ownership on-chain. The Mint NFT button will appear after successful purchase.
                    </p>
                  </div>
                )}

                {/* Success badge if already purchased */}
                {hasPurchased && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
                      <span>✅</span>
                      <span>Asset Purchased!</span>
                    </p>
                    <p className="text-xs text-green-700">
                      You own this asset. Click &quot;Mint NFT License&quot; to create an on-chain proof of ownership.
                    </p>
                  </div>
                )}
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
                <span className={`font-semibold ${asset.status === "Live" ? "text-green-600" : "text-gray-600"
                  }`}>{asset.status}</span>
              </div>
              {pieceData?.pieceCid && asset.owner && (
                <div className="pt-2">
                  <span className="text-gray-600 font-medium block mb-2">🌐 CDN Access:</span>
                  <a
                    href={`https://${asset.owner}.calibration.filcdn.io/${pieceData.pieceCid.toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-xs break-all underline"
                  >
                    https://{asset.owner}.calibration.filcdn.io/{pieceData.pieceCid.toString()}
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

      {displayPrice && parseFloat(displayPrice) > 0 && canPurchase && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          assetId={datasetId}
          pieceId={pieceId}
          pieceCid={pieceData?.pieceCid?.toString() || ""}
          assetName={asset.name}
          seller={asset.owner}
          price={displayPrice}
        />
      )}

      {/* Asset Preview Modal */}
      <AssetPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        asset={{
          datasetId,
          pieceId,
          pieceCid: pieceData?.pieceCid?.toString() || "",
          name: asset.name,
          filename: (pieceData as any)?.filename,
          price: displayPrice,
          owner: asset.owner
        }}
      />
    </div>
  );
}
