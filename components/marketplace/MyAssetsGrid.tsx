"use client";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { motion } from "framer-motion";
import { DataSet } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export const MyAssetsGrid = () => {
    const router = useRouter();
    const { address } = useAccount();
    const { data, isLoading } = useAllDatasets();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "id-asc" | "id-desc">("newest");
    const [filterStatus, setFilterStatus] = useState<"all" | "live" | "inactive">("all");
    const itemsPerPage = 15;

    // Filter only user's assets
    const myAssets = data?.datasets?.flatMap((dataset: DataSet | undefined) => {
        if (!dataset?.data?.pieces) return [];

        // Get owner address from available sources
        const owner = dataset.payer ||
            dataset.data?.payer ||
            dataset.provider?.address ||
            dataset.payee;

        // Only include assets owned by current user
        if (!address || !owner || owner.toLowerCase() !== address.toLowerCase()) {
            return [];
        }

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

    const formatAddress = (address: string) => {
        if (!address || address === "Unknown" || address === "null" || address === "undefined") return "Unknown";
        if (address.length < 10) return address;
        if (!address.startsWith("0x")) return address.slice(0, 10) + "...";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const filteredAssets = myAssets
        .filter((asset) => {
            if (!asset) return false;
            const search = searchTerm.toLowerCase();
            const matchSearch =
                asset.pieceCid.toLowerCase().includes(search) ||
                asset.pieceId.toString().includes(search) ||
                asset.provider.toLowerCase().includes(search);

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

    const liveCount = myAssets.filter(a => a?.isLive).length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                            <div className="bg-gray-200 h-32 rounded mb-4"></div>
                            <div className="bg-gray-200 h-4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!address) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">Please connect your wallet to view your assets</p>
            </motion.div>
        );
    }

    if (myAssets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
                <div className="text-6xl mb-4">🖼️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Assets Yet</h3>
                <p className="text-gray-600 mb-4">You haven't uploaded any assets to the marketplace yet</p>
                <button
                    onClick={() => router.push("/?tab=upload")}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                    Upload Your First Asset
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm">Total Assets</p>
                            <p className="text-4xl font-bold mt-2">{myAssets.length}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-4xl">🎨</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Live Assets</p>
                            <p className="text-4xl font-bold mt-2">{liveCount}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-4xl">✅</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-pink-100 text-sm">Inactive</p>
                            <p className="text-4xl font-bold mt-2">{myAssets.length - liveCount}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-4xl">⏸️</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by CID, ID..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="id-asc">Piece ID (Low to High)</option>
                            <option value="id-desc">Piece ID (High to Low)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value as typeof filterStatus);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="live">Live Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Assets Grid */}
            {filteredAssets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white rounded-2xl shadow-lg"
                >
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                </motion.div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentAssets.map((asset, index) => (
                            <motion.div
                                key={`${asset.datasetId}-${asset.pieceId}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                onClick={() => router.push(`/assets/${asset.datasetId}/${asset.pieceId}`)}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
                            >
                                <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                    {asset.owner ? (
                                        <>
                                            <img
                                                src={`https://${asset.owner}.calibration.filcdn.io/${asset.pieceCid}`}
                                                alt={`Asset ${asset.pieceId}`}
                                                className="w-full h-full object-cover absolute inset-0"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            <span className="text-6xl relative z-10">🎨</span>
                                        </>
                                    ) : (
                                        <span className="text-6xl">🎨</span>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${asset.isLive
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-500 text-white"
                                            }`}>
                                            {asset.isLive ? "✅ Live" : "⏸️ Inactive"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">
                                                Dataset #{asset.datasetId}
                                            </h3>
                                            <p className="text-sm text-gray-600">Piece #{asset.pieceId}</p>
                                        </div>
                                        {asset.price && parseFloat((asset.price / 1e18).toFixed(2)) > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Price</p>
                                                <p className="font-bold text-indigo-600">
                                                    {(asset.price / 1e18).toFixed(2)} USDFC
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Provider</span>
                                            <span className="font-semibold text-gray-800">{asset.provider}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Owner</span>
                                            <span className="font-mono text-xs text-gray-800">{formatAddress(asset.owner || "")}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                                        <p className="text-xs text-gray-500 mb-1">CID</p>
                                        <p className="text-xs font-mono text-gray-800 truncate">{asset.pieceCid}</p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/assets/${asset.datasetId}/${asset.pieceId}`);
                                        }}
                                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl font-semibold transition-all ${currentPage === pageNum
                                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110"
                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                                >
                                    Next
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{' '}
                                <span className="font-semibold text-gray-800">{Math.min(endIndex, filteredAssets.length)}</span> of{' '}
                                <span className="font-semibold text-gray-800">{filteredAssets.length}</span> assets
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};

