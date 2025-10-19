"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import { NFTMintModal } from "@/components/marketplace/NFTMintModal";
import { PurchaseModal } from "@/components/marketplace/PurchaseModal";
import { LicenseVerificationBadge } from "@/components/marketplace/LicenseVerificationBadge";
import { useRoyaltyInfo } from "@/hooks/useRoyaltyInfo";
import { useAllDatasets } from "@/hooks/useAllDatasets";
import { usePurchasedAssets } from "@/hooks/usePurchasedAssets";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Alert } from "@/components/ui/Alert";
import { Info, History, Tag, FileText, Share2, Heart, ShoppingCart, Coins } from "lucide-react";
import { toast } from "sonner";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const { data: balances } = useBalances();
  const [quantity, setQuantity] = useState(1);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const assetId = params.id as string;
  const [datasetId, pieceId] = assetId.split('-').map(Number);
  const { data: allData } = useAllDatasets();
  const { creator, percentage } = useRoyaltyInfo(datasetId);
  const { purchases } = usePurchasedAssets();

  // Check if user has already purchased this asset
  const hasPurchased = purchases.some(p => p.datasetId === datasetId && p.pieceId === pieceId);

  // Find the specific asset from marketplace data
  const assetData = allData?.datasets?.find(ds => ds.pdpVerifierDataSetId === datasetId);
  const pieceData = assetData?.data?.pieces?.find(p => p.pieceId === pieceId);

  const asset = {
    id: assetId,
    name: `Digital Asset #${pieceId}`,
    description: "Exclusive digital asset stored permanently on Filecoin blockchain via Synapse SDK. Verified on-chain with decentralized storage.",
    price: 25,
    owner: assetData?.payer || (assetData?.data as any)?.payer || "Unknown",
    pieceCid: pieceData?.pieceCid?.toString() || "Loading...",
    created: new Date().toISOString().split('T')[0],
    category: "Digital Asset",
    status: assetData?.isLive ? "Live" : "Inactive",
    provider: assetData?.provider?.name || "Unknown",
    datasetId,
    pieceId,
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Asset Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center overflow-hidden relative group">
              <span className="text-9xl">🎨</span>

              {/* Action Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Share this asset" side="left">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Share2 className="w-4 h-4" />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  />
                </Tooltip>
                <Tooltip content="Add to favorites" side="left">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Heart className="w-4 h-4" />}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  />
                </Tooltip>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Asset Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-800">{asset.name}</h1>
                <div className="flex items-center gap-2">
                  <LicenseVerificationBadge tokenId={assetId} />
                  {asset.status === "Live" && (
                    <Badge variant="live">
                      Live
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{asset.description}</p>
            </div>

            {/* Owner Info */}
            <Card variant="gradient">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={asset.owner?.slice(0, 2).toUpperCase() || "??"}
                    size="lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Owner</p>
                    <p className="font-semibold text-gray-800">
                      {asset.owner ? `${asset.owner.slice(0, 6)}...${asset.owner.slice(-4)}` : "Unknown"}
                    </p>
                  </div>
                  <Tooltip content="View owner profile">
                    <Button variant="ghost" size="sm" icon={<Info className="w-4 h-4" />} />
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* Price & Royalty */}
            <div className="grid grid-cols-2 gap-4">
              <Card variant="elevated">
                <CardContent className="p-4 text-center">
                  <Coins className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {asset.price} USDFC
                  </p>
                </CardContent>
              </Card>

              {creator && percentage && (
                <Card variant="elevated">
                  <CardContent className="p-4 text-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold text-sm">%</span>
                    </div>
                    <p className="text-sm text-gray-500">Creator Royalty</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(Number(percentage) / 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quantity Selector */}
            <Card>
              <CardContent className="p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2"
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per item:</span>
                    <span className="font-semibold">{asset.price} USDFC</span>
                  </div>
                  <div className="flex justify-between">
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

                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="text-gray-700">
                    💰 Your Balance: <span className="font-bold">{balances?.usdfcBalanceFormatted.toFixed(2) || 0} USDFC</span>
                  </p>
                  {!canAfford && (
                    <p className="text-red-600 mt-2">⚠️ Insufficient balance to purchase</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!hasPurchased && (
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<ShoppingCart className="w-5 h-5" />}
                  disabled={!canAfford || !address}
                >
                  {!address ? "Connect Wallet" : !canAfford ? "Insufficient Balance" : `Buy for ${totalPrice} USDFC`}
                </Button>
              )}

              {hasPurchased && (
                <div className="space-y-2">
                  <Alert variant="success" title="You own this asset!">
                    You can now mint an NFT license or download the asset.
                  </Alert>
                  <Button
                    onClick={() => setShowMintModal(true)}
                    variant="secondary"
                    size="lg"
                    fullWidth
                  >
                    🎨 Mint NFT License
                  </Button>
                </div>
              )}

              {!hasPurchased && (
                <Alert variant="info" title="NFT License Information">
                  After purchasing this asset, you can mint an NFT license to verify your ownership on-chain.
                </Alert>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details" icon={<Info className="w-4 h-4" />}>
                Details
              </TabsTrigger>
              <TabsTrigger value="history" icon={<History className="w-4 h-4" />}>
                History
              </TabsTrigger>
              <TabsTrigger value="properties" icon={<Tag className="w-4 h-4" />}>
                Properties
              </TabsTrigger>
              <TabsTrigger value="about" icon={<FileText className="w-4 h-4" />}>
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Asset Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Asset ID</p>
                          <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                            {assetId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Provider</p>
                          <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                            {asset.provider}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Piece CID</p>
                          <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded break-all">
                            {asset.pieceCid}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          <Badge variant={asset.status === "Live" ? "live" : "inactive"}>
                            {asset.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Created</p>
                          <p className="text-sm font-semibold">{asset.created}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <Badge variant="success">Created</Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Asset created and uploaded</p>
                          <p className="text-xs text-gray-500">Stored on Filecoin blockchain</p>
                        </div>
                      </div>
                      {asset.status === "Live" && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <Badge variant="info">Listed</Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Listed for sale</p>
                            <p className="text-xs text-gray-500">Price: {asset.price} USDFC</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Properties</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-indigo-50 rounded-lg text-center">
                        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Type</p>
                        <p className="text-sm font-bold mt-1">{asset.category}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Blockchain</p>
                        <p className="text-sm font-bold mt-1">Filecoin</p>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg text-center">
                        <p className="text-xs text-pink-600 font-semibold uppercase tracking-wide">Storage</p>
                        <p className="text-sm font-bold mt-1">Permanent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">About This Asset</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {asset.description}
                      </p>
                      <p className="text-gray-700 leading-relaxed mt-4">
                        This digital asset is permanently stored on the Filecoin blockchain, ensuring its authenticity and ownership.
                        Each piece is unique and comes with verifiable proof of ownership through blockchain technology.
                      </p>
                    </div>

                    {creator && percentage && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Creator Information</h4>
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={creator.slice(0, 2).toUpperCase()}
                            size="md"
                          />
                          <div>
                            <p className="font-medium">
                              {creator.slice(0, 6)}...{creator.slice(-4)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Receives {(Number(percentage) / 100).toFixed(1)}% royalty on sales
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <NFTMintModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        assetId={Number(assetId)}
        assetName={asset.name}
      />

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        assetId={datasetId}
        pieceId={pieceId}
        pieceCid={pieceData?.pieceCid?.toString() || ""}
        assetName={asset.name}
        seller={asset.owner}
        price={totalPrice.toString()}
      />
    </div>
  );
}
