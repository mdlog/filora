"use client";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { motion } from "framer-motion";
import { DataSet } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { AssetPreview } from "./AssetPreview";
import { MediaViewer } from "./MediaViewer";
import { EnhancedSearchFilter, SearchFilters } from "./EnhancedSearchFilter";
import {
  filterAssets,
  sortAssets,
  detectAssetCategory,
  generateAssetTags,
  MarketplaceAsset as EnhancedAsset
} from "@/utils/searchUtils";

export const MarketplaceGrid = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { data, isLoading, error, refetch } = useAllDatasets();
  console.log("Marketplace data:", data);
  console.log("Marketplace loading:", isLoading);
  console.log("Marketplace error:", error);

  // Debug: Show all datasets with their owners
  if (data?.datasets) {
    console.log("📊 All datasets in marketplace:", data.datasets.map((d: any) => ({
      datasetId: d.pdpVerifierDataSetId,
      provider: d.provider?.name,
      payer: d.payer,
      pieces: d.data?.pieces?.length || 0
    })));
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "by-owner">("grid");
  const itemsPerPage = 6; // 6 items per page (2 rows of 3 in grid view)

  // Enhanced search filters
  const [enhancedFilters, setEnhancedFilters] = useState<SearchFilters>({
    searchTerm: "",
    category: "all",
    priceRange: { min: 0, max: 1000 },
    tags: [],
    creator: "",
    sortBy: "newest",
    status: "all",
    provider: "all",
    dateRange: { start: "", end: "" },
    fileSize: { min: 0, max: 100 },
    licenseType: "all",
  });

  // Asset preview states
  const [previewAsset, setPreviewAsset] = useState<{
    datasetId: number;
    pieceId: number;
    pieceCid: string;
    name?: string;
    filename?: string;
    price?: string;
    owner?: string;
  } | null>(null);

  // Don't return early - show UI always

  const allAssets = data?.datasets?.flatMap((dataset: DataSet | undefined) => {
    if (!dataset?.data?.pieces) {
      console.log("Dataset without pieces:", dataset?.pdpVerifierDataSetId);
      return [];
    }

    // Get owner address from available sources
    const owner = dataset.payer ||
      (dataset.data as any)?.payer ||
      (dataset.provider as any)?.address ||
      dataset.payee;

    console.log(`Dataset ${dataset.pdpVerifierDataSetId} (${dataset.provider?.name}): owner=${owner}, pieces=${dataset.data.pieces.length}`);

    return dataset.data.pieces.map((piece) => ({
      pieceId: piece.pieceId,
      pieceCid: piece.pieceCid.toString(),
      datasetId: dataset.pdpVerifierDataSetId,
      providerId: dataset.providerId,
      isLive: dataset.isLive ?? true,
      provider: dataset.provider?.name || "Unknown",
      owner: owner,
      price: dataset.price,
    }));
  }) || [];

  console.log("All assets:", allAssets.length);

  const formatAddress = (address: string) => {
    if (!address || address === "Unknown" || address === "null" || address === "undefined") return "Unknown";
    if (address.length < 10) return address;
    if (!address.startsWith("0x")) return address.slice(0, 10) + "...";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCID = (cid: string) => {
    if (!cid || cid.length < 20) return cid;
    return `${cid.slice(0, 10)}...${cid.slice(-6)}`;
  };

  const getAssetName = (asset: any) => {
    // Try to get a descriptive name from various sources

    // 1. Check if asset has a specific name/title
    if (asset.name && asset.name !== "Unknown") {
      return asset.name;
    }

    // 2. Use provider name + dataset ID for uniqueness
    if (asset.provider && asset.provider !== "Unknown") {
      return `${asset.provider} #${asset.datasetId}`;
    }

    // 3. Use dataset ID + piece ID for uniqueness
    return `Dataset #${asset.datasetId} • Piece #${asset.pieceId}`;
  };

  // Group assets by owner
  const assetsByOwner = allAssets.reduce((acc, asset) => {
    if (!asset) return acc;
    const owner = asset.owner || "Unknown";
    if (!acc[owner]) {
      acc[owner] = [];
    }
    acc[owner].push(asset);
    return acc;
  }, {} as Record<string, typeof allAssets>);

  const uniqueOwners = Object.keys(assetsByOwner).length;

  // Convert to enhanced assets format
  const enhancedAssets: EnhancedAsset[] = allAssets.map(asset => ({
    datasetId: asset.datasetId,
    pieceId: asset.pieceId,
    pieceCid: asset.pieceCid,
    providerId: asset.providerId,
    provider: asset.provider,
    owner: asset.owner,
    price: asset.price,
    isLive: asset.isLive,
    filename: (asset as any).filename,
    assetName: getAssetName(asset),
    uploadedAt: new Date(), // Mock date for now
    fileSize: Math.random() * 100 * 1024 * 1024, // Mock file size
    tags: generateAssetTags({
      datasetId: asset.datasetId,
      pieceId: asset.pieceId,
      pieceCid: asset.pieceCid,
      providerId: asset.providerId,
      provider: asset.provider,
      owner: asset.owner,
      price: asset.price,
      isLive: asset.isLive,
      filename: (asset as any).filename,
      assetName: getAssetName(asset),
    }),
    category: detectAssetCategory((asset as any).filename, asset.pieceCid),
    description: `${getAssetName(asset)} - Digital asset stored on Filecoin`,
    viewCount: Math.floor(Math.random() * 1000),
    downloadCount: Math.floor(Math.random() * 100),
    purchaseCount: Math.floor(Math.random() * 50),
  }));

  // Use enhanced filtering and sorting
  const filteredAssets = sortAssets(filterAssets(enhancedAssets, enhancedFilters), enhancedFilters.sortBy);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Handle enhanced filters change
  const handleEnhancedFiltersChange = (newFilters: SearchFilters) => {
    setEnhancedFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Enhanced Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Auto-refreshing every 15 seconds
          </div>
          <button
            onClick={() => {
              console.log("🔄 Manual refresh triggered");
              refetch();
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>

        {/* Enhanced Search Filter Component */}
        <EnhancedSearchFilter
          onFiltersChange={handleEnhancedFiltersChange}
          totalAssets={enhancedAssets.length}
          filteredCount={filteredAssets.length}
        />
      </motion.div>

      {/* Stats Cards */}
      {!isLoading && data && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon="📦" label="Total Assets" value={enhancedAssets.length} />
          <StatCard icon="✅" label="Live Assets" value={enhancedAssets.filter((a) => a.isLive).length} />
          <StatCard icon="👥" label="Unique Owners" value={uniqueOwners} />
          <StatCard icon="🗂️" label="Filtered Results" value={filteredAssets.length} />
        </motion.div>
      )}

      {/* View Mode Toggle */}
      {!isLoading && data && allAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">View Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span>🔲</span> Grid View
              </button>
              <button
                onClick={() => setViewMode("by-owner")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === "by-owner"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span>👥</span> By Owner
              </button>
            </div>
          </div>

          {/* Pagination Info */}
          {viewMode === "grid" && filteredAssets.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">Page {currentPage} of {totalPages}</span>
              <span className="text-gray-400">•</span>
              <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredAssets.length)} of {filteredAssets.length} assets</span>
              <span className="text-gray-400">•</span>
              <span className="font-semibold text-gray-800">{itemsPerPage} per page</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Content Area */}
      {error ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Assets</h3>
          <p className="text-gray-600 mb-4">{error.message || "Failed to load marketplace data"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div>
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading marketplace assets...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      ) : !data || !data.datasets || data.datasets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Assets Available</h3>
          <p className="text-gray-600">Be the first to upload assets to the marketplace!</p>
        </div>
      ) : viewMode === "by-owner" ? (
        /* By Owner View */
        <div className="space-y-8">
          {Object.entries(assetsByOwner)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([owner, assets]) => (
              <motion.div
                key={owner}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {owner.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 font-mono">{formatAddress(owner)}</h3>
                      <p className="text-sm text-gray-500">{assets.length} asset{assets.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      ✅ {assets.filter(a => a.isLive).length} Live
                    </span>
                    {assets.filter(a => !a.isLive).length > 0 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        ⏸️ {assets.filter(a => !a.isLive).length} Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.slice(0, 6).map((asset) => (
                    <motion.div
                      key={`${asset.providerId}-${asset.datasetId}-${asset.pieceId}`}
                      whileHover={{ scale: 1.03 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 cursor-pointer border-2 border-gray-200 hover:border-indigo-400 transition-all"
                      onClick={() => router.push(`/assets/${asset.datasetId}/${asset.pieceId}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="relative w-8 h-8">
                          {asset.owner && (
                            <img
                              src={`https://${asset.owner}.calibration.filcdn.io/${asset.pieceCid}`}
                              alt={`Asset ${asset.pieceId}`}
                              className="w-8 h-8 rounded object-cover absolute inset-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-2xl">🎨</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${asset.isLive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {asset.isLive ? "✅" : "⏸️"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-2">{getAssetName(asset)}</h4>

                      {/* 2-Column Grid Layout for By Owner View */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Row 1: CID | Author */}
                        <div className="min-w-0">
                          <p className="text-gray-500 mb-0.5">🔗 CID</p>
                          <p className="text-gray-700 font-mono truncate" title={asset.pieceCid}>
                            {formatCID(asset.pieceCid)}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-500 mb-0.5">✍️ Author</p>
                          <p className="text-gray-700 font-mono truncate" title={asset.owner}>
                            {formatAddress(asset.owner)}
                          </p>
                        </div>

                        {/* Row 2: Provider | Price */}
                        <div className="min-w-0">
                          <p className="text-gray-500 mb-0.5">🏢 Provider</p>
                          <p className="text-gray-700 truncate" title={asset.provider}>
                            {asset.provider}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-500 mb-0.5">
                            {asset.price !== undefined && asset.price > 0 ? "💰 Price" : "🆓 Price"}
                          </p>
                          <p className={`font-bold truncate ${asset.price !== undefined && asset.price > 0 ? "text-gray-800" : "text-green-600"}`}>
                            {asset.price !== undefined && asset.price > 0
                              ? `${(asset.price / 1e18).toFixed(2)} USDFC`
                              : "Free"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {assets.length > 6 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setEnhancedFilters(prev => ({ ...prev, creator: owner }));
                        setViewMode("grid");
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                    >
                      View all {assets.length} assets from this owner →
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      ) : currentAssets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl shadow-lg"
        >
          <div className="text-6xl mb-4">{enhancedFilters.searchTerm ? "🔍" : "🎨"}</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {enhancedFilters.searchTerm ? "No Matching Assets" : "No Assets Found"}
          </h3>
          <p className="text-gray-600">
            {enhancedFilters.searchTerm ? "Try a different search term" : "Start by uploading your first digital asset!"}
          </p>
          {enhancedFilters.searchTerm && (
            <button
              onClick={() => setEnhancedFilters(prev => ({ ...prev, searchTerm: "" }))}
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
                  key={`${asset.providerId}-${asset.datasetId}-${asset.pieceId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => router.push(`/assets/${asset.datasetId}/${asset.pieceId}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                >
                  {/* Media Preview Section */}
                  <div className="relative">
                    <MediaViewer
                      pieceCid={asset.pieceCid}
                      filename={asset.filename}
                      assetName={getAssetName(asset)}
                      className="h-48"
                      showPreview={true}
                    />

                    {/* Preview Button Overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAsset({
                            datasetId: asset.datasetId,
                            pieceId: asset.pieceId,
                            pieceCid: asset.pieceCid,
                            name: getAssetName(asset),
                            filename: (asset as any).filename,
                            price: asset.price !== undefined ? (asset.price / 1e18).toFixed(2) : "0",
                            owner: asset.owner
                          });
                        }}
                        className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                        title="Preview Asset"
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>

                    {/* Price Badge */}
                    {asset.price !== undefined && asset.price > 0 && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-20">
                        <span className="text-sm font-bold text-indigo-600">{(asset.price / 1e18).toFixed(2)} USDFC</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{getAssetName(asset)}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${asset.isLive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {asset.isLive ? "✅ Live" : "⏸️ Inactive"}
                      </span>
                    </div>

                    {/* 2-Column Grid Layout */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Row 1: CID | Author */}
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 text-sm">🔗</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">CID</p>
                          <p className="text-gray-700 font-mono text-xs truncate" title={asset.pieceCid}>
                            {formatCID(asset.pieceCid)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 text-sm">✍️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Author</p>
                          <p className="text-gray-700 font-mono text-xs truncate" title={asset.owner}>
                            {formatAddress(asset.owner)}
                          </p>
                        </div>
                      </div>

                      {/* Row 2: Provider | Price */}
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 text-sm">🏢</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Provider</p>
                          <p className="text-gray-700 text-xs truncate" title={asset.provider}>
                            {asset.provider}
                          </p>
                        </div>
                      </div>
                      {asset.price !== undefined && asset.price > 0 ? (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 text-sm">💰</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">Price</p>
                            <p className="text-gray-800 font-bold text-xs">
                              {(asset.price / 1e18).toFixed(2)} USDFC
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 text-sm">🆓</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">Price</p>
                            <p className="text-green-600 font-bold text-xs">Free</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-semibold text-center">
                      View Details
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mt-8"
            >
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg disabled:hover:shadow-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="w-10 h-10 rounded-xl font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="text-gray-400 px-2">...</span>
                      )}
                    </>
                  )}

                  {/* Page Range */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1 ||
                        (page === currentPage - 2 && currentPage <= 3) ||
                        (page === currentPage + 2 && currentPage >= totalPages - 2);
                    })
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all ${currentPage === page
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Last Page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="text-gray-400 px-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 rounded-xl font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg disabled:hover:shadow-none"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Page Info */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-gray-800">{Math.min(endIndex, filteredAssets.length)}</span> of{' '}
                <span className="font-semibold text-gray-800">{filteredAssets.length}</span> assets
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <AssetPreview
          isOpen={!!previewAsset}
          onClose={() => setPreviewAsset(null)}
          asset={previewAsset}
        />
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
