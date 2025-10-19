"use client";
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";
import { useLicenseVerification } from "@/hooks/useLicenseVerification";
import { motion } from "framer-motion";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingCart } from "lucide-react";

export const PurchasedAssets = () => {
  const { purchases, refreshPurchases, debugLocalStorage } = usePurchasedAssets();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  console.log("🛒 PurchasedAssets rendered:", {
    purchaseCount: purchases.length,
    purchases: purchases
  });

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Purchased Assets</h2>
            <div className="flex gap-2">
              <button
                onClick={debugLocalStorage}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span>🔍</span>
                Debug
              </button>
              <button
                onClick={refreshPurchases}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Refresh
              </button>
            </div>
          </div>
        </div>
        <EmptyState
          icon={<ShoppingCart className="w-24 h-24" />}
          title="No Purchases Yet"
          description="Start exploring the marketplace to find amazing digital assets and make your first purchase!"
          action={{
            label: "Browse Marketplace",
            onClick: () => window.location.href = "/?tab=marketplace"
          }}
        />
      </div>
    );
  }

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPurchases = purchases.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Purchased Assets ({purchases.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={debugLocalStorage}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            Debug
          </button>
          <button
            onClick={refreshPurchases}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPurchases.map((purchase, index) => (
          <PurchasedAssetCard
            key={`${purchase.datasetId}-${purchase.pieceId}-${purchase.purchasedAt}`}
            purchase={purchase}
            index={index}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 bg-white rounded-2xl shadow-lg p-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const PurchasedAssetCard = ({ purchase, index }: { purchase: any; index: number }) => {
  // Try to determine file extension from various sources
  const getFilenameWithExtension = () => {
    // 1. If we have stored filename, use it
    if (purchase.filename) {
      return purchase.filename;
    }

    // 2. Try to get filename from metadata (if uploaded by current user)
    try {
      const stored = localStorage.getItem("filora_file_metadata");
      if (stored) {
        const metadata = JSON.parse(stored);
        const fileInfo = metadata[purchase.pieceCid];
        if (fileInfo?.fileName) {
          console.log("✅ Found original filename from metadata:", fileInfo.fileName);
          return fileInfo.fileName;
        }
      }
    } catch (error) {
      // Ignore errors, continue to fallback
    }

    // 3. If we have asset name, try to extract extension from it
    if (purchase.assetName) {
      const match = purchase.assetName.match(/\.(jpg|jpeg|png|gif|pdf|mp4|mp3|zip|doc|docx|txt|json|csv|webp|svg|avi|mov|wav|ogg|tar|gz|rar|7z|xlsx|pptx)$/i);
      if (match) {
        return `asset-${purchase.datasetId}-${purchase.pieceId}${match[0]}`;
      }
    }

    // 4. Default: use descriptive generic name
    return `filecoin-asset-${purchase.datasetId}-${purchase.pieceId}.data`;
  };

  const filename = getFilenameWithExtension();

  const { downloadMutation, downloadStatus, downloadError, clearError } = useDownloadPiece(
    purchase.pieceCid,
    filename
  );
  const { hasLicense, isLoading: isVerifying } = useLicenseVerification(purchase.datasetId);
  const [showLicense, setShowLicense] = useState(false);

  const handleDownload = () => {
    console.log("🖱️ Download button clicked for:", {
      datasetId: purchase.datasetId,
      pieceId: purchase.pieceId,
      pieceCid: purchase.pieceCid,
      filename
    });

    if (!purchase.pieceCid || purchase.pieceCid === "undefined") {
      alert("❌ Cannot download: Invalid piece CID. This asset may not have been properly uploaded.");
      return;
    }

    clearError();
    downloadMutation.mutate();
  };

  const handleVerifyLicense = async () => {
    setShowLicense(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✅</span>
          <h3 className="font-bold">Owned Asset</h3>
        </div>
        <p className="text-sm opacity-90">Dataset #{purchase.datasetId} • Piece #{purchase.pieceId}</p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Asset CID</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded truncate">{purchase.pieceCid}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Price Paid</p>
            <p className="font-bold text-lg">{purchase.price} USDFC</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Purchased</p>
            <p className="font-bold text-sm">{new Date(purchase.purchasedAt * 1000).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Download Status */}
          {downloadStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">{downloadStatus}</p>
            </div>
          )}

          {/* Download Error */}
          {downloadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                <span>❌</span>
                <span>{downloadError}</span>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Try again or check console (F12) for details.
              </p>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadMutation.isPending ? "⏳ Downloading..." : "⬇️ Download Asset"}
          </button>

          <button
            onClick={handleVerifyLicense}
            disabled={isVerifying}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "⏳ Verifying..." : "🏆 View NFT License"}
          </button>
        </div>

        {showLicense && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏆</span>
              <h4 className="font-bold text-amber-800">NFT License Verified</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">License Type:</span> Commercial Use</p>
              <p><span className="font-semibold">Valid Until:</span> Lifetime</p>
              <p><span className="font-semibold">Rights:</span> Download, Use, Modify</p>
              {purchase.txHash && (
                <p><span className="font-semibold">TX Hash:</span>
                  <span className="font-mono text-xs ml-1">{purchase.txHash.slice(0, 10)}...</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};