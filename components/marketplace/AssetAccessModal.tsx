"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAssetAccess } from "@/hooks/useAssetAccess";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";

interface AssetAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    datasetId: number;
    pieceId: number;
    pieceCid: string;
    price: string;
  };
}

export const AssetAccessModal = ({ isOpen, onClose, asset }: AssetAccessModalProps) => {
  const { hasAccess, generateAccessToken, getDownloadUrl } = useAssetAccess();
  const { downloadMutation } = useDownloadPiece(asset.pieceCid, `asset-${asset.pieceCid}.png`);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showLicense, setShowLicense] = useState(false);

  const handleGenerateAccess = async () => {
    const token = await generateAccessToken(asset.datasetId, asset.pieceId);
    setAccessToken(token);
  };

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  if (!isOpen) return null;

  const userHasAccess = hasAccess(asset.datasetId, asset.pieceId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Asset Access</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm opacity-90 mt-2">
              Dataset #{asset.datasetId} • Piece #{asset.pieceId}
            </p>
          </div>

          <div className="p-6">
            {userHasAccess ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-bold text-green-800">Access Granted</h3>
                    <p className="text-sm text-green-600">You own this digital asset</p>
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
                    onClick={handleGenerateAccess}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    🔗 Generate Access Link
                  </button>

                  <button
                    onClick={() => setShowLicense(!showLicense)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    🏆 {showLicense ? "Hide" : "View"} NFT License
                  </button>
                </div>

                {accessToken && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h4 className="font-bold text-blue-800 mb-2">🔗 Secure Access Link</h4>
                    <div className="space-y-2">
                      <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                        {getDownloadUrl(asset.pieceCid, accessToken)}
                      </p>
                      <button
                        onClick={() => navigator.clipboard.writeText(getDownloadUrl(asset.pieceCid, accessToken))}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Copy Link
                      </button>
                      <p className="text-xs text-blue-600">⏰ Expires in 24 hours</p>
                    </div>
                  </motion.div>
                )}

                {showLicense && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🏆</span>
                      <h4 className="font-bold text-amber-800">NFT License Certificate</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-amber-800">License Type</p>
                          <p className="text-amber-700">Commercial Use</p>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800">Validity</p>
                          <p className="text-amber-700">Lifetime</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800">Rights Included</p>
                        <ul className="text-amber-700 text-xs space-y-1 mt-1">
                          <li>• Download and use asset</li>
                          <li>• Modify for commercial purposes</li>
                          <li>• Resell with attribution</li>
                          <li>• Transfer ownership rights</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-amber-200">
                        <p className="text-xs text-amber-600">
                          This NFT license is permanently recorded on blockchain and cannot be revoked.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h3>
                <p className="text-gray-600 mb-4">
                  You need to purchase this asset to access it.
                </p>
                <p className="text-lg font-bold text-indigo-600">Price: {asset.price} USDFC</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};