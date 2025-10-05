"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/ui/Confetti";
import { useConfetti } from "@/hooks/useConfetti";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalances } from "@/hooks/useBalances";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { UploadAsset } from "@/components/marketplace/UploadAsset";
import { MyAssets } from "@/components/marketplace/MyAssets";
import { StorageManager } from "@/components/StorageManager";
import { Hero } from "@/components/Hero";
import { RoyaltyManager } from "@/components/marketplace/RoyaltyManager";

type Tab = "marketplace" | "upload" | "my-assets" | "dashboard" | "royalties";

export default function Home() {
  const { isConnected, chainId } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("marketplace");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showConfetti } = useConfetti();
  const { data: balances, isLoading: isLoadingBalances } = useBalances();

  const isTab = (value: string | null): value is Tab =>
    value === "marketplace" || value === "upload" || value === "my-assets" || value === "dashboard" || value === "royalties";

  const updateUrl = (tab: Tab) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    updateUrl(tab);
  };

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (isTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      updateUrl(activeTab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}
        />
      )}

      {/* Hero Section */}
      <Hero />

      {chainId !== 314159 && isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500 text-white py-3 text-center"
        >
          ⚠️ Please switch to Filecoin Calibration network
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Visual */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex flex-col justify-center items-center text-white">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8"
                  >
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">Secure Access</h3>
                  <p className="text-center text-white/90 text-sm leading-relaxed">
                    Your gateway to decentralized digital assets powered by Filecoin blockchain
                  </p>
                </div>

                {/* Right Side - Content */}
                <div className="p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Filora</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Connect your Web3 wallet to start exploring, buying, and selling digital assets on our decentralized marketplace.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Browse Digital Assets</p>
                          <p className="text-xs text-gray-500">Discover unique items from creators worldwide</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Decentralized Storage</p>
                          <p className="text-xs text-gray-500">Permanent storage on Filecoin network</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Secure Transactions</p>
                          <p className="text-xs text-gray-500">Trade with confidence using USDFC tokens</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ConnectButton />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex gap-2 overflow-x-auto"
            >
              <TabButton
                active={activeTab === "marketplace"}
                onClick={() => handleTabChange("marketplace")}
                icon="🏪"
                label="Marketplace"
              />
              <TabButton
                active={activeTab === "upload"}
                onClick={() => handleTabChange("upload")}
                icon="📤"
                label="Upload Asset"
              />
              <TabButton
                active={activeTab === "my-assets"}
                onClick={() => handleTabChange("my-assets")}
                icon="🖼️"
                label="My Assets"
              />
              <TabButton
                active={activeTab === "royalties"}
                onClick={() => handleTabChange("royalties")}
                icon="💰"
                label="Royalties"
              />
              <TabButton
                active={activeTab === "dashboard"}
                onClick={() => handleTabChange("dashboard")}
                icon="📊"
                label="Dashboard"
              />
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "marketplace" && (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MarketplaceGrid />
                </motion.div>
              )}
              {activeTab === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <UploadAsset />
                </motion.div>
              )}
              {activeTab === "my-assets" && (
                <motion.div
                  key="my-assets"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MyAssets />
                </motion.div>
              )}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <StorageManager />
                </motion.div>
              )}
              {activeTab === "royalties" && (
                <motion.div
                  key="royalties"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RoyaltyManager />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

const TabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
      active
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </motion.button>
);
