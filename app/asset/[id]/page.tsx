"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const { data: balances } = useBalances();
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const asset = {
    id: params.id,
    name: `Digital Asset #${params.id}`,
    description: "Exclusive digital artwork stored permanently on Filecoin blockchain. This unique piece represents the future of digital ownership.",
    price: 25,
    owner: "0x1234...5678",
    pieceCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    created: "2024-01-15",
    category: "Digital Art",
    status: "Live",
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Successfully purchased ${quantity} x ${asset.name} for ${asset.price * quantity} USDFC!`);
    setIsPurchasing(false);
  };

  const totalPrice = asset.price * quantity;
  const canAfford = balances && balances.usdfcBalanceFormatted >= totalPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>←</span> Back to Marketplace
        </motion.button>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-96 flex items-center justify-center">
              <span className="text-9xl">🎨</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  asset.status === "Live" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {asset.status === "Live" ? "✅ Live" : "⏸️ Inactive"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {asset.category}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">{asset.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-mono text-xs">{asset.owner}</span>
                </div>
                <div>
                  <span className="text-gray-600">Piece CID:</span>
                  <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded mt-1">
                    {asset.pieceCid}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{asset.name}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{asset.description}</p>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Current Price</p>
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {asset.price} USDFC
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-xl"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price per item:</span>
                    <span className="font-semibold">{asset.price} USDFC</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-2xl text-indigo-600">{totalPrice} USDFC</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-sm">
                  <p className="text-gray-700">
                    💰 Your Balance: <span className="font-bold">{balances?.usdfcBalanceFormatted.toFixed(2) || 0} USDFC</span>
                  </p>
                  {!canAfford && (
                    <p className="text-red-600 mt-2">⚠️ Insufficient balance to purchase</p>
                  )}
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !canAfford || !address}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isPurchasing || !canAfford || !address
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl"
                  }`}
                >
                  {isPurchasing ? "Processing..." : !address ? "Connect Wallet" : !canAfford ? "Insufficient Balance" : `🛒 Buy Now for ${totalPrice} USDFC`}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {asset.description}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                This digital asset is permanently stored on the Filecoin blockchain, ensuring its authenticity and ownership. 
                Each piece is unique and comes with verifiable proof of ownership through blockchain technology.
              </p>
              <h3 className="text-xl font-bold mb-4 mt-6">Asset Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="font-semibold">Blockchain Storage</p>
                    <p className="text-gray-600">Stored permanently on Filecoin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold">Verified Ownership</p>
                    <p className="text-gray-600">Proof of ownership on-chain</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold">Instant Transfer</p>
                    <p className="text-gray-600">Immediate ownership transfer</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
