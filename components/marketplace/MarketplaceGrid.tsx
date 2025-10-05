"use client";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { motion } from "framer-motion";
import { DataSet } from "@/types";
import { useState } from "react";

export const MarketplaceGrid = () => {
  const { data, isLoading, error } = useAllDatasets();
  const [searchTerm, setSearchTerm] = useState("");
  
  console.log("Marketplace data:", data);
  console.log("Marketplace loading:", isLoading);
  console.log("Marketplace error:", error);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "id-asc" | "id-desc">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "inactive">("all");
  const itemsPerPage = 15;

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
            <div className="bg-gray-200 h-6 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const allAssets = data?.datasets?.flatMap((dataset: DataSet | undefined) => {
    if (!dataset?.data?.pieces) return [];
    return dataset.data.pieces.map((piece) => ({
      pieceId: piece.pieceId,
      pieceCid: piece.pieceCid.toString(),
      datasetId: dataset.pdpVerifierDataSetId,
      isLive: dataset.isLive,
      provider: dataset.provider?.name || "Unknown",
      owner: dataset.payer || "",
    }));
  }) || [];
  
  console.log("All assets:", allAssets.length);

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredAssets = allAssets
    .filter((asset) => {
      if (!asset) return false;
      const search = searchTerm.toLowerCase();
      const matchSearch = 
        asset.pieceCid.toLowerCase().includes(search) ||
        asset.pieceId.toString().includes(search) ||
        asset.provider.toLowerCase().includes(search) ||
        asset.owner.toLowerCase().includes(search);
      
      const matchStatus = 
        filterStatus === "all" ? true :
        filterStatus === "live" ? asset.isLive :
        !asset.isLive;
      
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      switch (sortBy) {
        case "newest":
          return b.datasetId - a.datasetId;
        case "oldest":
          return a.datasetId - b.datasetId;
        case "id-asc":
          return a.pieceId - b.pieceId;
        case "id-desc":
          return b.pieceId - a.pieceId;
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Search by CID, Asset ID, or Provider..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 flex gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="id-asc">ID: Low to High</option>
                <option value="id-desc">ID: High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterStatus === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("live")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterStatus === "live"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Live
                </button>
                <button
                  onClick={() => setFilterStatus("inactive")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterStatus === "inactive"
                      ? "bg-gray-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <StatCard icon="📦" label="Total Assets" value={allAssets.length} />
        <StatCard icon="✅" label="Live Assets" value={allAssets.filter((a) => a?.isLive).length} />
        <StatCard icon="🗂️" label="Datasets" value={data?.datasets?.length || 0} />
      </motion.div>

      {currentAssets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl shadow-lg"
        >
          <div className="text-6xl mb-4">{searchTerm ? "🔍" : "🎨"}</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {searchTerm ? "No Matching Assets" : "No Assets Found"}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? "Try a different search term" : "Start by uploading your first digital asset!"}
          </p>
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentAssets.map((asset, index) =>
            asset ? (
              <motion.div
                key={`${asset.datasetId}-${asset.pieceId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              >
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-48 flex items-center justify-center">
                  <span className="text-6xl">🎨</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Asset #{asset.pieceId}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        asset.isLive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {asset.isLive ? "✅ Live" : "⏸️ Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 truncate">CID: {asset.pieceCid}</p>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">👤</span>
                      <span className="text-gray-600 font-mono text-xs">{formatAddress(asset.owner)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">🏢</span>
                      <span className="text-gray-600 text-xs">{asset.provider}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.href = `/asset/${asset.datasetId}-${asset.pieceId}`}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ) : null
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-100 shadow"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: string; label: string; value: number }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4"
  >
    <div className="text-4xl">{icon}</div>
    <div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </motion.div>
);
