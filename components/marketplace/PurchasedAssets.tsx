"use client";
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";
import { useLicenseVerification } from "@/hooks/useLicenseVerification";
import { motion } from "framer-motion";
import { useState } from "react";

export const PurchasedAssets = () => {
  const { purchases } = usePurchasedAssets();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (purchases.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 bg-white rounded-2xl shadow-lg"
      >
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Purchases Yet</h3>
        <p className="text-gray-600">Buy your first digital asset to access it here!</p>
      </motion.div>
    );
  }

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPurchases = purchases.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPurchases.map((purchase, index) => (
          <PurchasedAssetCard key={`${purchase.datasetId}-${purchase.pieceId}`} purchase={purchase} index={index} />
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
  const filename = `purchased-asset-${purchase.pieceCid}.png`;
  const { downloadMutation } = useDownloadPiece(purchase.pieceCid, filename);
  const { verifyLicense, isVerifying } = useLicenseVerification();
  const [showLicense, setShowLicense] = useState(false);

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  const handleVerifyLicense = async () => {
    await verifyLicense(purchase.datasetId, purchase.pieceId);
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
            <p className="font-bold text-lg">{purchase.price} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Purchased</p>
            <p className="font-bold text-sm">{new Date(purchase.purchasedAt * 1000).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {downloadMutation.isPending ? "⏳ Downloading..." : "⬇️ Download Asset"}
          </button>

          <button
            onClick={handleVerifyLicense}
            disabled={isVerifying}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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