"use client";
import { useDatasets } from "@/hooks/useDatasets";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";
import { motion } from "framer-motion";
import { DataSet } from "@/types";
import { DataSetPieceData } from "@filoz/synapse-sdk";

export const MyAssets = () => {
  const { data, isLoading } = useDatasets();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="bg-gray-200 h-8 rounded mb-4 w-1/3"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.datasets || data.datasets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 bg-white rounded-2xl shadow-lg"
      >
        <div className="text-6xl mb-4">🖼️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Assets Yet</h3>
        <p className="text-gray-600">Upload your first digital asset to get started!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {data.datasets.map((dataset: DataSet | undefined, index) =>
        dataset ? (
          <motion.div
            key={dataset.clientDataSetId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Dataset #{dataset.pdpVerifierDataSetId}</h3>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <span className="flex items-center gap-1">
                      {dataset.isLive ? "✅" : "⏸️"} {dataset.isLive ? "Live" : "Inactive"}
                    </span>
                    <span className="flex items-center gap-1">
                      {dataset.withCDN ? "⚡" : "📦"} {dataset.withCDN ? "CDN Enabled" : "Standard"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Commission</p>
                  <p className="text-2xl font-bold">{dataset.commissionBps / 100}%</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoCard icon="📦" label="Pieces" value={dataset.currentPieceCount} />
                <InfoCard icon="🆔" label="Next Piece ID" value={dataset.nextPieceId} />
                <InfoCard
                  icon="🏪"
                  label="Provider"
                  value={dataset.provider?.name || "Unknown"}
                />
              </div>

              {dataset.provider?.products.PDP?.data.serviceURL && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">PDP Service URL</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-gray-800 flex-1 truncate">
                      {dataset.provider.products.PDP.data.serviceURL}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          dataset.provider?.products.PDP?.data.serviceURL || ""
                        );
                        alert("PDP URL copied!");
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {dataset.data?.pieces && dataset.data.pieces.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-gray-800">Available Pieces</h4>
                    <span className="text-sm text-gray-600">
                      Next Challenge: Epoch {dataset.data.nextChallengeEpoch}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dataset.data.pieces.map((piece) => (
                      <PieceCard key={piece.pieceId} piece={piece} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null
      )}
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: string; label: string; value: string | number }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const PieceCard = ({ piece }: { piece: DataSetPieceData }) => {
  const filename = `asset-${piece.pieceCid}.png`;
  const { downloadMutation } = useDownloadPiece(piece.pieceCid.toString(), filename);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
          🎨
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800">Piece #{piece.pieceId}</p>
          <p className="text-xs text-gray-500 truncate font-mono">{piece.pieceCid.toString()}</p>
        </div>
      </div>
      <button
        onClick={() => downloadMutation.mutate()}
        disabled={downloadMutation.isPending}
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloadMutation.isPending ? "⏳ Downloading..." : "⬇️ Download"}
      </button>
    </motion.div>
  );
};
