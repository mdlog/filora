"use client";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { DataSet } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const Dashboard = () => {
    const { address } = useAccount();
    const { data: balances, isLoading: isLoadingBalances } = useBalances();
    const { purchases } = usePurchasedAssets();
    const { data: allData } = useAllDatasets();
    const router = useRouter();

    // Profile state
    const [username, setUsername] = useState<string>("");
    const [profileImage, setProfileImage] = useState<string>("");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempUsername, setTempUsername] = useState("");

    // Load profile from localStorage
    useEffect(() => {
        if (address) {
            const storedUsername = localStorage.getItem(`filora_username_${address}`);
            const storedImage = localStorage.getItem(`filora_profile_${address}`);

            if (storedUsername) setUsername(storedUsername);
            if (storedImage) setProfileImage(storedImage);
        }
    }, [address]);

    // Save profile to localStorage
    const saveProfile = () => {
        if (address) {
            if (tempUsername.trim()) {
                localStorage.setItem(`filora_username_${address}`, tempUsername.trim());
                setUsername(tempUsername.trim());
            }
            setIsEditingProfile(false);
        }
    };

    // Handle profile image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && address) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem(`filora_profile_${address}`, base64String);
                setProfileImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // Generate avatar from address
    const getDefaultAvatar = (addr: string) => {
        const colors = [
            "from-red-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-purple-500 to-pink-500",
            "from-orange-500 to-red-500",
            "from-indigo-500 to-purple-500",
        ];
        const index = parseInt(addr.slice(2, 4), 16) % colors.length;
        return colors[index];
    };

    // Calculate purchased assets statistics
    const totalPurchased = purchases.length;
    const totalSpent = purchases.reduce((sum, purchase) => {
        return sum + parseFloat(purchase.price || "0");
    }, 0);

    // Calculate uploaded assets statistics
    const myUploadedAssets = allData?.datasets?.flatMap((dataset: DataSet | undefined) => {
        if (!dataset?.data?.pieces) return [];

        const owner = dataset.payer ||
            dataset.data?.payer ||
            dataset.provider?.address ||
            dataset.payee;

        if (!address || !owner || owner.toLowerCase() !== address.toLowerCase()) {
            return [];
        }

        return dataset.data.pieces;
    }) || [];

    const totalUploaded = myUploadedAssets.length;

    // Calculate earnings from sales (would need implementation)
    const totalEarnings = 0; // Placeholder

    if (!address) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">Please connect your wallet to view your dashboard</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile & Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl p-8"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                        {/* Profile Image */}
                        <div className="relative group">
                            <label htmlFor="profile-upload" className="cursor-pointer">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30 group-hover:border-white/50 transition-all shadow-xl"
                                    />
                                ) : (
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getDefaultAvatar(address)} border-4 border-white/30 group-hover:border-white/50 transition-all shadow-xl flex items-center justify-center text-4xl font-bold`}>
                                        {username ? username.charAt(0).toUpperCase() : address.slice(2, 4).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">📷 Change</span>
                                </div>
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Username & Address */}
                        <div>
                            {isEditingProfile ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempUsername}
                                        onChange={(e) => setTempUsername(e.target.value)}
                                        placeholder="Enter username"
                                        className="px-3 py-1.5 rounded-lg text-gray-800 text-lg font-bold border-2 border-white/30 focus:border-white outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveProfile}
                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold text-sm transition-colors"
                                    >
                                        ✓ Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setTempUsername("");
                                        }}
                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold text-sm transition-colors"
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold">
                                        👋 Welcome Back, {username || "User"}!
                                    </h1>
                                    <button
                                        onClick={() => {
                                            setTempUsername(username);
                                            setIsEditingProfile(true);
                                        }}
                                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-semibold transition-colors"
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            )}
                            <p className="text-indigo-100 text-sm font-mono mt-1">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <span className="text-6xl">📊</span>
                    </div>
                </div>
            </motion.div>

            {/* Main Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* Total Purchased */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-3xl">🛒</span>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">Purchased</p>
                            <p className="text-4xl font-bold">{totalPurchased}</p>
                        </div>
                    </div>
                    <div className="border-t border-blue-400 pt-3">
                        <p className="text-blue-100 text-xs">Assets bought from marketplace</p>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-3xl">💰</span>
                        </div>
                        <div className="text-right">
                            <p className="text-purple-100 text-sm">Total Spent</p>
                            <p className="text-3xl font-bold">{totalSpent.toFixed(2)}</p>
                            <p className="text-purple-100 text-xs">USDFC</p>
                        </div>
                    </div>
                    <div className="border-t border-purple-400 pt-3">
                        <p className="text-purple-100 text-xs">Total spending on purchases</p>
                    </div>
                </div>

                {/* Total Uploaded */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-3xl">📤</span>
                        </div>
                        <div className="text-right">
                            <p className="text-green-100 text-sm">Uploaded</p>
                            <p className="text-4xl font-bold">{totalUploaded}</p>
                        </div>
                    </div>
                    <div className="border-t border-green-400 pt-3">
                        <p className="text-green-100 text-xs">Assets uploaded to marketplace</p>
                    </div>
                </div>

                {/* USDFC Balance */}
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-3xl">💳</span>
                        </div>
                        <div className="text-right">
                            <p className="text-pink-100 text-sm">Balance</p>
                            <p className="text-3xl font-bold">
                                {isLoadingBalances ? "..." : balances?.usdfcBalanceFormatted.toFixed(2) || "0.00"}
                            </p>
                            <p className="text-pink-100 text-xs">USDFC</p>
                        </div>
                    </div>
                    <div className="border-t border-pink-400 pt-3">
                        <p className="text-pink-100 text-xs">Current wallet balance</p>
                    </div>
                </div>
            </motion.div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Purchase Activity */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span>🛒</span> Purchase Activity
                        </h2>
                        <button
                            onClick={() => router.push("/?tab=purchased")}
                            className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-600">Total Purchases</p>
                                <p className="text-3xl font-bold text-gray-800">{totalPurchased}</p>
                            </div>
                            <div className="text-5xl">🎨</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-3xl font-bold text-gray-800">{totalSpent.toFixed(2)} <span className="text-lg text-gray-600">USDFC</span></p>
                            </div>
                            <div className="text-5xl">💰</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-600">Average Price</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {totalPurchased > 0 ? (totalSpent / totalPurchased).toFixed(2) : "0.00"} <span className="text-lg text-gray-600">USDFC</span>
                                </p>
                            </div>
                            <div className="text-5xl">📊</div>
                        </div>
                    </div>

                    {purchases.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Recent Purchases</h3>
                            <div className="space-y-2">
                                {purchases.slice(0, 3).map((purchase, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/assets/${purchase.datasetId}/${purchase.pieceId}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                #{purchase.datasetId}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">Dataset #{purchase.datasetId}</p>
                                                <p className="text-xs text-gray-500">Piece #{purchase.pieceId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-600">{parseFloat(purchase.price).toFixed(2)} USDFC</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(purchase.purchasedAt * 1000).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {purchases.length === 0 && (
                        <div className="mt-6 text-center py-8 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-2">🛒</div>
                            <p className="text-gray-600 text-sm">No purchases yet</p>
                            <button
                                onClick={() => router.push("/?tab=marketplace")}
                                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Browse Marketplace
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Upload Activity */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span>📤</span> Upload Activity
                        </h2>
                        <button
                            onClick={() => router.push("/?tab=my-assets")}
                            className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-600">Total Uploads</p>
                                <p className="text-3xl font-bold text-gray-800">{totalUploaded}</p>
                            </div>
                            <div className="text-5xl">🎨</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-600">FIL Balance</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {isLoadingBalances ? "..." : balances?.filBalanceFormatted.toFixed(4) || "0.0000"} <span className="text-lg text-gray-600">FIL</span>
                                </p>
                            </div>
                            <div className="text-5xl">💎</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-600">Storage Balance</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {isLoadingBalances ? "..." : balances?.warmStorageBalanceFormatted.toFixed(2) || "0.00"} <span className="text-lg text-gray-600">USDFC</span>
                                </p>
                            </div>
                            <div className="text-5xl">💾</div>
                        </div>
                    </div>

                    {totalUploaded === 0 && (
                        <div className="mt-6 text-center py-8 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-2">📤</div>
                            <p className="text-gray-600 text-sm">No uploads yet</p>
                            <button
                                onClick={() => router.push("/?tab=upload")}
                                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                            >
                                Upload Asset
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>⚡</span> Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => router.push("/?tab=marketplace")}
                        className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:shadow-lg transition-all text-center group"
                    >
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🏪</div>
                        <p className="font-semibold text-gray-800">Marketplace</p>
                        <p className="text-xs text-gray-600 mt-1">Browse assets</p>
                    </button>

                    <button
                        onClick={() => router.push("/?tab=upload")}
                        className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-all text-center group"
                    >
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📤</div>
                        <p className="font-semibold text-gray-800">Upload</p>
                        <p className="text-xs text-gray-600 mt-1">Add new asset</p>
                    </button>

                    <button
                        onClick={() => router.push("/?tab=purchased")}
                        className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition-all text-center group"
                    >
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🛒</div>
                        <p className="font-semibold text-gray-800">Purchased</p>
                        <p className="text-xs text-gray-600 mt-1">View purchases</p>
                    </button>

                    <button
                        onClick={() => router.push("/?tab=royalties")}
                        className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl hover:shadow-lg transition-all text-center group"
                    >
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                        <p className="font-semibold text-gray-800">Royalties</p>
                        <p className="text-xs text-gray-600 mt-1">Check earnings</p>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

