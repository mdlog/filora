"use client";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { usePayment } from "@/hooks/usePayment";
import { DepositModal } from "@/components/DepositModal";
import { DataSet } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseUnits } from "viem";

export const Dashboard = () => {
    const { address } = useAccount();
    const { data: balances, isLoading: isLoadingBalances, refetch: refetchBalances } = useBalances();
    const { purchases } = usePurchasedAssets();
    const { data: allData } = useAllDatasets();
    const router = useRouter();
    const { mutation: paymentMutation, status: paymentStatus } = usePayment();
    const { mutateAsync: handlePayment, isPending: isProcessingPayment } = paymentMutation;

    // Profile state
    const [username, setUsername] = useState<string>("");
    const [profileImage, setProfileImage] = useState<string>("");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempUsername, setTempUsername] = useState("");
    const [isDismissedStorageAlert, setIsDismissedStorageAlert] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);

    // Check if user has never used warm storage
    const hasNoWarmStorage = !isLoadingBalances &&
        (balances?.warmStorageBalance === 0n || !balances?.warmStorageBalance) &&
        (balances?.currentRateAllowanceGB === 0 || !balances?.currentRateAllowanceGB);

    // Check if user has enough balance to setup
    const hasEnoughBalance = !isLoadingBalances &&
        balances?.filBalance && balances.filBalance > 0n &&
        balances?.usdfcBalance && balances.usdfcBalance > 0n;

    // Check if can auto-setup (has balance but no storage)
    const canAutoSetup = hasNoWarmStorage && hasEnoughBalance && !isProcessingPayment;

    // Debug logging
    useEffect(() => {
        if (!isLoadingBalances && balances) {
            console.log("🔍 Dashboard Debug Info:");
            console.log("- Warm Storage Balance:", balances.warmStorageBalance);
            console.log("- Current Rate Allowance GB:", balances.currentRateAllowanceGB);
            console.log("- Current Lockup Allowance:", balances.currentLockupAllowance);
            console.log("- FIL Balance:", balances.filBalance);
            console.log("- USDFC Balance:", balances.usdfcBalance);
            console.log("- Has No Warm Storage:", hasNoWarmStorage);
            console.log("- Has Enough Balance:", hasEnoughBalance);
            console.log("- Can Auto Setup:", canAutoSetup);
            console.log("- Is Dismissed:", isDismissedStorageAlert);
        }
    }, [balances, isLoadingBalances, hasNoWarmStorage, hasEnoughBalance, canAutoSetup, isDismissedStorageAlert]);

    // Handler for setup storage
    const handleSetupStorage = async () => {
        if (!balances || !canAutoSetup) {
            // If not enough balance, redirect to storage tab for manual setup
            router.push("/?tab=storage");
            return;
        }

        try {
            console.log("🚀 Starting automatic warm storage setup...");

            // Setup with deposit needed and rate needed from balances
            await handlePayment({
                lockupAllowance: balances.totalLockupNeeded || balances.depositNeeded,
                epochRateAllowance: balances.rateNeeded || parseUnits("10", 18), // Default 10 USDFC rate
                depositAmount: balances.depositNeeded || parseUnits("0.1", 18), // Default 0.1 USDFC deposit
            });

            console.log("✅ Warm storage setup successful!");

            // Refetch balances to update UI
            await refetchBalances();

            // Show success message (optional: could add toast notification)
            alert("✅ Warm Storage Setup Successful! You can now upload files.");

        } catch (error) {
            console.error("❌ Error setting up warm storage:", error);
            alert("❌ Failed to setup warm storage. Please try manually in Storage tab.");
            // Fallback to storage tab if auto-setup fails
            router.push("/?tab=storage");
        }
    };

    // Load profile from localStorage
    useEffect(() => {
        if (address) {
            const storedUsername = localStorage.getItem(`filora_username_${address}`);
            const storedImage = localStorage.getItem(`filora_profile_${address}`);
            const dismissedAlert = localStorage.getItem(`filora_dismiss_storage_alert_${address}`);

            if (storedUsername) setUsername(storedUsername);
            if (storedImage) setProfileImage(storedImage);
            if (dismissedAlert === "true") setIsDismissedStorageAlert(true);
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
            (dataset.data as any)?.payer ||
            (dataset.provider as any)?.address ||
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
                <div className="flex flex-col gap-6">
                    {/* Top Section - Profile */}
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
                                <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                                    <span>🌐</span>
                                    Filecoin Calibration Network
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-6xl">📊</span>
                        </div>
                    </div>

                    {/* Bottom Section - Balances & Faucet Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/20">
                        {/* Balance Info */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">💎</span>
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs">FIL Balance</p>
                                    <p className="text-white font-bold text-lg">
                                        {isLoadingBalances ? "..." : balances?.filBalanceFormatted.toFixed(4) || "0.0000"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">💳</span>
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs">USDFC Balance</p>
                                    <p className="text-white font-bold text-lg">
                                        {isLoadingBalances ? "..." : balances?.usdfcBalanceFormatted.toFixed(2) || "0.00"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">💾</span>
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs">Storage Balance</p>
                                    <p className="text-white font-bold text-lg">
                                        {isLoadingBalances ? "..." : balances?.warmStorageBalanceFormatted.toFixed(2) || "0.00"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Faucet Buttons */}
                        <div className="flex items-center gap-3">
                            <div className="text-white/80 text-sm font-semibold mr-2">
                                🚰 Get Testnet Tokens:
                            </div>
                            <button
                                onClick={() => window.open("https://faucet.calibnet.chainsafe-fil.io/funds.html", "_blank")}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all font-semibold text-sm border-2 border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span className="text-xl">💎</span>
                                <span>Get tFIL</span>
                            </button>
                            <button
                                onClick={() => window.open("https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc", "_blank")}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all font-semibold text-sm border-2 border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span className="text-xl">💳</span>
                                <span>Get USDFC</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Warm Storage Setup Alert - Only show if user has no warm storage and hasn't dismissed */}
            {hasNoWarmStorage && !isDismissedStorageAlert && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-2xl p-6 border-2 border-orange-300"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl animate-bounce">
                                🚀
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                ⚠️ Warm Storage Setup Required
                            </h3>
                            <p className="text-orange-100 mb-4 text-sm leading-relaxed">
                                You haven&apos;t set up warm storage yet. To upload files to Filecoin, you need to deposit USDFC tokens to pay for storage.
                            </p>

                            {canAutoSetup && (
                                <div className="bg-green-500/20 border border-green-300 rounded-xl p-3 mb-4">
                                    <p className="text-green-100 text-sm font-semibold flex items-center gap-2">
                                        <span>✅</span>
                                        Good news! You have enough balance. Click &quot;Auto-Setup Storage Now&quot; to automatically configure warm storage.
                                    </p>
                                </div>
                            )}

                            {!hasEnoughBalance && (
                                <div className="bg-yellow-500/20 border border-yellow-300 rounded-xl p-3 mb-4">
                                    <p className="text-yellow-100 text-sm font-semibold flex items-center gap-2">
                                        <span>⚠️</span>
                                        You need tFIL and USDFC tokens first. Get them from the faucets below before setting up storage.
                                    </p>
                                </div>
                            )}

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    📋 {canAutoSetup ? "Auto-Setup Process:" : "How to Setup Warm Storage:"}
                                </h4>
                                {canAutoSetup ? (
                                    <ol className="space-y-2 text-sm text-orange-50">
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">1.</span>
                                            <span>Click <strong>&quot;Auto-Setup Storage Now&quot;</strong> button below</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">2.</span>
                                            <span>Approve <strong>2 transactions</strong> in your wallet (USDFC approval + deposit)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">3.</span>
                                            <span>Wait for confirmation (~10-30 seconds)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">4.</span>
                                            <span>You&apos;re ready to upload files! 🎉</span>
                                        </li>
                                    </ol>
                                ) : (
                                    <ol className="space-y-2 text-sm text-orange-50">
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">1.</span>
                                            <span>Get <strong>tFIL</strong> (for gas) and <strong>USDFC tokens</strong> from faucets below</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">2.</span>
                                            <span>Once you have tokens, refresh this page</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">3.</span>
                                            <span>Click <strong>&quot;Auto-Setup Storage Now&quot;</strong> (will appear when you have balance)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-white">4.</span>
                                            <span>Or go to <strong>Storage</strong> tab for manual setup</span>
                                        </li>
                                    </ol>
                                )}
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    💡 Default Storage Allocation:
                                </h4>
                                <ul className="space-y-1 text-sm text-orange-50">
                                    <li>• <strong>Capacity:</strong> 10 GB</li>
                                    <li>• <strong>Duration:</strong> 30 days</li>
                                    <li>• <strong>Estimated Cost:</strong> ~0.1 USDFC</li>
                                </ul>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {canAutoSetup ? (
                                    <>
                                        {/* Auto-setup with default amount */}
                                        <button
                                            onClick={handleSetupStorage}
                                            disabled={isProcessingPayment}
                                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ${isProcessingPayment
                                                ? "bg-gray-400 text-white cursor-not-allowed"
                                                : "bg-white text-orange-600 hover:bg-orange-50 hover:scale-105"
                                                }`}
                                        >
                                            <span>{isProcessingPayment ? "⏳" : "🚀"}</span>
                                            {isProcessingPayment ? "Setting Up..." : "Quick Setup (Default)"}
                                        </button>

                                        {/* Custom amount setup */}
                                        <button
                                            onClick={() => setShowDepositModal(true)}
                                            disabled={isProcessingPayment}
                                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30 hover:border-white/50 flex items-center gap-2"
                                        >
                                            <span>💰</span>
                                            Custom Amount
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* If user doesn't have balance, show custom setup button */}
                                        <button
                                            onClick={() => setShowDepositModal(true)}
                                            className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                                        >
                                            <span>💾</span>
                                            Setup Storage
                                        </button>

                                        <button
                                            onClick={() => router.push("/?tab=storage")}
                                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30 flex items-center gap-2"
                                        >
                                            <span>⚙️</span>
                                            Advanced Setup
                                        </button>
                                    </>
                                )}

                                {!hasEnoughBalance && (
                                    <>
                                        <button
                                            onClick={() => window.open("https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc", "_blank")}
                                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30 flex items-center gap-2"
                                        >
                                            <span>🚰</span>
                                            Get USDFC Tokens
                                        </button>

                                        <button
                                            onClick={() => window.open("https://faucet.calibnet.chainsafe-fil.io/funds.html", "_blank")}
                                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border-2 border-white/30 flex items-center gap-2"
                                        >
                                            <span>💎</span>
                                            Get tFIL (Gas)
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Payment Status Indicator */}
                            {paymentStatus && (
                                <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${paymentStatus.includes("❌")
                                    ? "bg-red-500/20 border border-red-300 text-red-100"
                                    : paymentStatus.includes("✅")
                                        ? "bg-green-500/20 border border-green-300 text-green-100"
                                        : "bg-blue-500/20 border border-blue-300 text-blue-100"
                                    }`}>
                                    {paymentStatus}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (address) {
                                    // Store dismissal in localStorage
                                    localStorage.setItem(`filora_dismiss_storage_alert_${address}`, "true");
                                    setIsDismissedStorageAlert(true);
                                }
                            }}
                            className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                            title="Dismiss alert"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </motion.div>
            )}

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

                        <div className={`flex items-center justify-between p-4 rounded-xl ${hasNoWarmStorage
                            ? "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200"
                            : "bg-gradient-to-r from-purple-50 to-pink-50"
                            }`}>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    Storage Balance
                                    {hasNoWarmStorage && (
                                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                            Setup Required
                                        </span>
                                    )}
                                </p>
                                <p className={`text-3xl font-bold ${hasNoWarmStorage ? "text-red-600" : "text-gray-800"}`}>
                                    {isLoadingBalances ? "..." : balances?.warmStorageBalanceFormatted.toFixed(2) || "0.00"} <span className="text-lg text-gray-600">USDFC</span>
                                </p>
                                <div className="flex gap-2 mt-2">
                                    {hasNoWarmStorage ? (
                                        <button
                                            onClick={canAutoSetup ? handleSetupStorage : () => router.push("/?tab=storage")}
                                            disabled={isProcessingPayment}
                                            className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${isProcessingPayment
                                                ? "bg-gray-400 text-white cursor-not-allowed"
                                                : "bg-red-500 text-white hover:bg-red-600"
                                                }`}
                                        >
                                            {isProcessingPayment ? "⏳ Setting Up..." : canAutoSetup ? "🚀 Auto-Setup →" : "Setup Now →"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowDepositModal(true)}
                                            className="text-xs px-3 py-1 rounded-full font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                                        >
                                            💰 Add More
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className={`text-5xl ${hasNoWarmStorage ? "animate-bounce" : ""}`}>
                                {hasNoWarmStorage ? "⚠️" : "💾"}
                            </div>
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

            {/* Deposit Modal */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => {
                    setShowDepositModal(false);
                    refetchBalances();
                }}
            />
        </div>
    );
};

