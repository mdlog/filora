import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Heart, Share2, Eye, CheckCircle } from "lucide-react";
import { formatCurrency, truncateAddress } from "@/lib/utils";
import { useState } from "react";

interface AssetCardProps {
    asset: {
        id: string | number;
        name: string;
        image?: string;
        price: number | string;
        owner: string;
        ownerAvatar?: string;
        status?: "live" | "sold" | "inactive";
        views?: number;
        isOwned?: boolean;
    };
    onBuy?: () => void;
    onView?: () => void;
    index?: number;
}

export function AssetCard({ asset, onBuy, onView, index = 0 }: AssetCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getStatusBadge = () => {
        switch (asset.status) {
            case "live":
                return <Badge variant="live" icon={<CheckCircle className="w-3 h-3" />}>Live</Badge>;
            case "sold":
                return <Badge variant="sold">Sold</Badge>;
            case "inactive":
                return <Badge variant="inactive">Inactive</Badge>;
            default:
                return <Badge variant="live" icon={<CheckCircle className="w-3 h-3" />}>Live</Badge>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
        >
            <Card variant="elevated" hover="lift" className="overflow-hidden group cursor-pointer">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {asset.image && !imageError ? (
                        <motion.img
                            src={asset.image}
                            alt={asset.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={() => setImageError(true)}
                            onClick={onView}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-6xl" onClick={onView}>
                            🎨
                        </div>
                    )}

                    {/* Overlay with Quick Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLiked(!isLiked);
                                }}
                                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isLiked
                                        ? "bg-red-500 text-white"
                                        : "bg-white/90 text-gray-700 hover:bg-white"
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Share functionality
                                }}
                                className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* View Count */}
                        {asset.views && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
                                <Eye className="w-3 h-3" />
                                <span>{asset.views}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                        {getStatusBadge()}
                    </div>

                    {/* Owned Badge */}
                    {asset.isOwned && (
                        <div className="absolute top-4 left-4">
                            <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                                Owned
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {asset.name}
                    </h3>

                    {/* Owner Info */}
                    <div className="flex items-center gap-2">
                        <Avatar
                            src={asset.ownerAvatar}
                            fallback={asset.owner.slice(0, 2).toUpperCase()}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Owner</p>
                            <p className="text-sm font-medium text-gray-700 truncate">
                                {truncateAddress(asset.owner)}
                            </p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Current Price</p>
                            <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(asset.price)}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!asset.isOwned && onBuy && (
                        <Button
                            variant="primary"
                            size="md"
                            fullWidth
                            onClick={(e) => {
                                e.stopPropagation();
                                onBuy();
                            }}
                        >
                            Buy Now
                        </Button>
                    )}

                    {asset.isOwned && onView && (
                        <Button
                            variant="outline"
                            size="md"
                            fullWidth
                            onClick={(e) => {
                                e.stopPropagation();
                                onView();
                            }}
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
