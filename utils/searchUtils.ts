/**
 * Enhanced Search & Filtering Utilities
 */

// import { detectMediaType } from "./mediaUtils";

export interface MarketplaceAsset {
    datasetId: number;
    pieceId: number;
    pieceCid: string;
    providerId: number;
    provider: string;
    owner: string;
    price?: number;
    isLive: boolean;
    filename?: string;
    assetName?: string;
    uploadedAt?: Date;
    fileSize?: number;
    tags?: string[];
    category?: string;
    description?: string;
    viewCount?: number;
    downloadCount?: number;
    purchaseCount?: number;
}

export interface SearchFilters {
    searchTerm: string;
    category: string;
    priceRange: { min: number; max: number };
    tags: string[];
    creator: string;
    sortBy: "newest" | "oldest" | "price-high" | "price-low" | "popular" | "trending";
    status: "all" | "live" | "inactive";
    provider: string;
    dateRange: { start: string; end: string };
    fileSize: { min: number; max: number };
    licenseType: string;
}

/**
 * Detect asset category based on filename or pieceCid
 */
export const detectAssetCategory = (filename?: string, pieceCid?: string): string => {
    if (!filename && !pieceCid) return "other";

    const file = filename || pieceCid || "";
    const extension = file.split('.').pop()?.toLowerCase();

    // Image formats
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(extension || '')) {
        return "image";
    }

    // Video formats
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv'].includes(extension || '')) {
        return "video";
    }

    // Audio formats
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'].includes(extension || '')) {
        return "audio";
    }

    // Document formats
    if (['pdf', 'txt', 'doc', 'docx', 'rtf', 'odt', 'md', 'json', 'xml', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
        return "document";
    }

    // 3D formats
    if (['obj', 'gltf', 'glb', 'fbx', 'dae', '3ds', 'blend', 'stl', 'ply'].includes(extension || '')) {
        return "3d";
    }

    // Archive formats
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension || '')) {
        return "archive";
    }

    return "other";
};

/**
 * Generate tags for an asset based on filename, category, and metadata
 */
export const generateAssetTags = (asset: MarketplaceAsset): string[] => {
    const tags: string[] = [];

    // Category-based tags
    if (asset.category) {
        tags.push(asset.category);
    }

    // File extension tag
    if (asset.filename) {
        const extension = asset.filename.split('.').pop()?.toLowerCase();
        if (extension) {
            tags.push(extension);
        }
    }

    // Provider tag
    if (asset.provider && asset.provider !== "Unknown") {
        tags.push(asset.provider.toLowerCase());
    }

    // Price-based tags
    if (asset.price !== undefined) {
        if (asset.price === 0) {
            tags.push("free");
        } else if (asset.price < 10) {
            tags.push("budget");
        } else if (asset.price > 100) {
            tags.push("premium");
        }
    }

    // Status tags
    if (asset.isLive) {
        tags.push("live");
    } else {
        tags.push("inactive");
    }

    // Popularity tags (mock data for now)
    if (asset.viewCount && asset.viewCount > 100) {
        tags.push("popular");
    }
    if (asset.downloadCount && asset.downloadCount > 50) {
        tags.push("trending");
    }

    return [...new Set(tags)]; // Remove duplicates
};

/**
 * Calculate popularity score for an asset
 */
export const calculatePopularityScore = (asset: MarketplaceAsset): number => {
    let score = 0;

    // Base score from views
    score += (asset.viewCount || 0) * 1;

    // Downloads are worth more
    score += (asset.downloadCount || 0) * 3;

    // Purchases are worth even more
    score += (asset.purchaseCount || 0) * 10;

    // Recent uploads get a boost
    if (asset.uploadedAt) {
        const daysSinceUpload = (Date.now() - asset.uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpload < 7) {
            score += 50; // New upload boost
        } else if (daysSinceUpload < 30) {
            score += 20; // Recent upload boost
        }
    }

    return score;
};

/**
 * Filter assets based on search filters
 */
export const filterAssets = (assets: MarketplaceAsset[], filters: SearchFilters): MarketplaceAsset[] => {
    return assets.filter((asset) => {
        // Search term filter
        if (filters.searchTerm) {
            const search = filters.searchTerm.toLowerCase();
            const matchesSearch =
                asset.pieceCid.toLowerCase().includes(search) ||
                asset.pieceId.toString().includes(search) ||
                asset.provider.toLowerCase().includes(search) ||
                asset.owner.toLowerCase().includes(search) ||
                (asset.assetName && asset.assetName.toLowerCase().includes(search)) ||
                (asset.filename && asset.filename.toLowerCase().includes(search)) ||
                (asset.description && asset.description.toLowerCase().includes(search));

            if (!matchesSearch) return false;
        }

        // Category filter
        if (filters.category !== "all") {
            const assetCategory = detectAssetCategory(asset.filename, asset.pieceCid);
            if (assetCategory !== filters.category) return false;
        }

        // Price range filter
        const assetPrice = asset.price !== undefined ? asset.price / 1e18 : 0; // Convert from wei
        if (assetPrice < filters.priceRange.min || assetPrice > filters.priceRange.max) {
            return false;
        }

        // Tags filter
        if (filters.tags.length > 0) {
            const assetTags = generateAssetTags(asset);
            const hasMatchingTag = filters.tags.some(tag =>
                assetTags.some(assetTag => assetTag.includes(tag.toLowerCase()))
            );
            if (!hasMatchingTag) return false;
        }

        // Creator filter
        if (filters.creator) {
            const creator = filters.creator.toLowerCase();
            const matchesCreator =
                asset.owner.toLowerCase().includes(creator) ||
                (asset.assetName && asset.assetName.toLowerCase().includes(creator));
            if (!matchesCreator) return false;
        }

        // Status filter
        if (filters.status !== "all") {
            if (filters.status === "live" && !asset.isLive) return false;
            if (filters.status === "inactive" && asset.isLive) return false;
        }

        // Provider filter
        if (filters.provider !== "all" && asset.provider !== filters.provider) {
            return false;
        }

        // Date range filter
        if (filters.dateRange.start && asset.uploadedAt) {
            const uploadDate = asset.uploadedAt.toISOString().split('T')[0];
            if (uploadDate < filters.dateRange.start) return false;
        }
        if (filters.dateRange.end && asset.uploadedAt) {
            const uploadDate = asset.uploadedAt.toISOString().split('T')[0];
            if (uploadDate > filters.dateRange.end) return false;
        }

        // File size filter
        if (asset.fileSize) {
            const sizeInMB = asset.fileSize / (1024 * 1024);
            if (sizeInMB < filters.fileSize.min || sizeInMB > filters.fileSize.max) {
                return false;
            }
        }

        return true;
    });
};

/**
 * Sort assets based on sort criteria
 */
export const sortAssets = (assets: MarketplaceAsset[], sortBy: string): MarketplaceAsset[] => {
    return [...assets].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return b.datasetId - a.datasetId;

            case "oldest":
                return a.datasetId - b.datasetId;

            case "price-high":
                const priceA = a.price !== undefined ? a.price / 1e18 : 0;
                const priceB = b.price !== undefined ? b.price / 1e18 : 0;
                return priceB - priceA;

            case "price-low":
                const priceALow = a.price !== undefined ? a.price / 1e18 : 0;
                const priceBLow = b.price !== undefined ? b.price / 1e18 : 0;
                return priceALow - priceBLow;

            case "popular":
                const popularityA = calculatePopularityScore(a);
                const popularityB = calculatePopularityScore(b);
                return popularityB - popularityA;

            case "trending":
                // Trending = recent uploads with high engagement
                const trendScoreA = calculateTrendingScore(a);
                const trendScoreB = calculateTrendingScore(b);
                return trendScoreB - trendScoreA;

            default:
                return 0;
        }
    });
};

/**
 * Calculate trending score (recent uploads with high engagement)
 */
export const calculateTrendingScore = (asset: MarketplaceAsset): number => {
    let score = 0;

    // Base popularity score
    score += calculatePopularityScore(asset);

    // Recent upload boost
    if (asset.uploadedAt) {
        const daysSinceUpload = (Date.now() - asset.uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpload < 3) {
            score *= 3; // Very recent
        } else if (daysSinceUpload < 7) {
            score *= 2; // Recent
        } else if (daysSinceUpload < 14) {
            score *= 1.5; // Somewhat recent
        }
    }

    return score;
};

/**
 * Get unique providers from assets
 */
export const getUniqueProviders = (assets: MarketplaceAsset[]): string[] => {
    const providers = assets.map(asset => asset.provider).filter(Boolean);
    return [...new Set(providers)];
};

/**
 * Get unique creators from assets
 */
export const getUniqueCreators = (assets: MarketplaceAsset[]): string[] => {
    const creators = assets.map(asset => asset.owner).filter(Boolean);
    return [...new Set(creators)];
};

/**
 * Search suggestions based on popular terms
 */
export const getSearchSuggestions = (assets: MarketplaceAsset[], query: string): string[] => {
    if (!query || query.length < 2) return [];

    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    // Add matching asset names
    assets.forEach(asset => {
        if (asset.assetName && asset.assetName.toLowerCase().includes(queryLower)) {
            suggestions.push(asset.assetName);
        }
        if (asset.filename && asset.filename.toLowerCase().includes(queryLower)) {
            suggestions.push(asset.filename);
        }
    });

    // Add matching providers
    const uniqueProviders = getUniqueProviders(assets);
    uniqueProviders.forEach(provider => {
        if (provider.toLowerCase().includes(queryLower)) {
            suggestions.push(provider);
        }
    });

    // Add matching creators
    const uniqueCreators = getUniqueCreators(assets);
    uniqueCreators.forEach(creator => {
        if (creator.toLowerCase().includes(queryLower)) {
            suggestions.push(creator);
        }
    });

    // Remove duplicates and limit to 10 suggestions
    return [...new Set(suggestions)].slice(0, 10);
};

/**
 * Get filter statistics
 */
export const getFilterStats = (assets: MarketplaceAsset[]) => {
    const stats = {
        total: assets.length,
        categories: {} as Record<string, number>,
        priceRanges: {
            free: 0,
            low: 0,
            medium: 0,
            high: 0,
        },
        status: {
            live: 0,
            inactive: 0,
        },
        providers: {} as Record<string, number>,
    };

    assets.forEach(asset => {
        // Category stats
        const category = detectAssetCategory(asset.filename, asset.pieceCid);
        stats.categories[category] = (stats.categories[category] || 0) + 1;

        // Price range stats
        const price = asset.price !== undefined ? asset.price / 1e18 : 0;
        if (price === 0) stats.priceRanges.free++;
        else if (price < 10) stats.priceRanges.low++;
        else if (price < 100) stats.priceRanges.medium++;
        else stats.priceRanges.high++;

        // Status stats
        if (asset.isLive) stats.status.live++;
        else stats.status.inactive++;

        // Provider stats
        stats.providers[asset.provider] = (stats.providers[asset.provider] || 0) + 1;
    });

    return stats;
};
