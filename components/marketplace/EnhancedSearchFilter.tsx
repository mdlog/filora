"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Tag, DollarSign, Calendar, FileText, Star, Users, Zap } from "lucide-react";

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

interface EnhancedSearchFilterProps {
    onFiltersChange: (filters: SearchFilters) => void;
    totalAssets: number;
    filteredCount: number;
}

const CATEGORIES = [
    { value: "all", label: "All Categories", icon: "📁" },
    { value: "image", label: "Images", icon: "🖼️" },
    { value: "video", label: "Videos", icon: "🎥" },
    { value: "audio", label: "Audio", icon: "🎵" },
    { value: "document", label: "Documents", icon: "📄" },
    { value: "3d", label: "3D Models", icon: "🎮" },
    { value: "archive", label: "Archives", icon: "📦" },
    { value: "other", label: "Other", icon: "📄" },
];

const POPULAR_TAGS = [
    "art", "music", "video", "photo", "design", "creative", "digital", "nft",
    "collection", "rare", "exclusive", "limited", "vintage", "modern", "abstract"
];

const LICENSE_TYPES = [
    { value: "all", label: "All Licenses" },
    { value: "commercial", label: "Commercial Use" },
    { value: "personal", label: "Personal Use" },
    { value: "royalty-free", label: "Royalty Free" },
    { value: "exclusive", label: "Exclusive Rights" },
];

export const EnhancedSearchFilter = ({ onFiltersChange, totalAssets, filteredCount }: EnhancedSearchFilterProps) => {
    const [filters, setFilters] = useState<SearchFilters>({
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

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [tagInput, setTagInput] = useState("");

    // Update parent component when filters change
    useEffect(() => {
        onFiltersChange(filters);
    }, [filters, onFiltersChange]);

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleTagAdd = (tag: string) => {
        if (tag && !filters.tags.includes(tag)) {
            setFilters(prev => ({
                ...prev,
                tags: [...prev.tags, tag.toLowerCase()]
            }));
        }
        setTagInput("");
    };

    const handleTagRemove = (tagToRemove: string) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handlePopularTagClick = (tag: string) => {
        handleTagAdd(tag);
    };

    const clearAllFilters = () => {
        setFilters({
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
    };

    const hasActiveFilters = filters.searchTerm ||
        filters.category !== "all" ||
        filters.tags.length > 0 ||
        filters.creator ||
        filters.sortBy !== "newest" ||
        filters.status !== "all" ||
        filters.provider !== "all" ||
        filters.licenseType !== "all" ||
        filters.priceRange.min > 0 ||
        filters.priceRange.max < 1000;

    return (
        <div className="space-y-4">
            {/* Main Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
            >
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search assets, creators, descriptions..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                        />
                        {filters.searchTerm && (
                            <button
                                onClick={() => handleFilterChange("searchTerm", "")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${showAdvancedFilters
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                        {hasActiveFilters && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {[
                                    filters.searchTerm,
                                    filters.category !== "all",
                                    filters.tags.length > 0,
                                    filters.creator,
                                    filters.sortBy !== "newest",
                                    filters.status !== "all",
                                    filters.provider !== "all",
                                    filters.licenseType !== "all"
                                ].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Results Count */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-800">{filteredCount}</span> of{" "}
                        <span className="font-semibold text-gray-800">{totalAssets}</span> assets
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showAdvancedFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="p-6 space-y-6">
                            {/* Category and Sort Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Category Filter */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <FileText className="w-4 h-4" />
                                        Category
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {CATEGORIES.map((category) => (
                                            <button
                                                key={category.value}
                                                onClick={() => handleFilterChange("category", category.value)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.category === category.value
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                <span>{category.icon}</span>
                                                {category.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort Options */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Star className="w-4 h-4" />
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                                    >
                                        <option value="newest">🆕 Newest First</option>
                                        <option value="oldest">⏰ Oldest First</option>
                                        <option value="price-high">💎 Price: High to Low</option>
                                        <option value="price-low">💸 Price: Low to High</option>
                                        <option value="popular">🔥 Most Popular</option>
                                        <option value="trending">📈 Trending Now</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <DollarSign className="w-4 h-4" />
                                    Price Range (USDFC)
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.priceRange.min}
                                            onChange={(e) => handleFilterChange("priceRange", {
                                                ...filters.priceRange,
                                                min: parseFloat(e.target.value) || 0
                                            })}
                                            className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.priceRange.max}
                                            onChange={(e) => handleFilterChange("priceRange", {
                                                ...filters.priceRange,
                                                max: parseFloat(e.target.value) || 1000
                                            })}
                                            className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {[0, 10, 50, 100, 500, 1000].map((price) => (
                                            <button
                                                key={price}
                                                onClick={() => handleFilterChange("priceRange", { min: price, max: 1000 })}
                                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                {price === 0 ? "Free" : `${price}+`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <Tag className="w-4 h-4" />
                                    Tags
                                </label>
                                <div className="space-y-3">
                                    {/* Tag Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTagAdd(tagInput);
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleTagAdd(tagInput)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Active Tags */}
                                    {filters.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {filters.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => handleTagRemove(tag)}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Popular Tags */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {POPULAR_TAGS.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handlePopularTagClick(tag)}
                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status and Provider */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Status Filter */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Zap className="w-4 h-4" />
                                        Status
                                    </label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: "all", label: "All", color: "gray" },
                                            { value: "live", label: "Live", color: "green" },
                                            { value: "inactive", label: "Inactive", color: "gray" }
                                        ].map((status) => (
                                            <button
                                                key={status.value}
                                                onClick={() => handleFilterChange("status", status.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filters.status === status.value
                                                        ? `bg-${status.color}-600 text-white`
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {status.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Creator Filter */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Users className="w-4 h-4" />
                                        Creator
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Creator address or name..."
                                        value={filters.creator}
                                        onChange={(e) => handleFilterChange("creator", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Date Range */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Calendar className="w-4 h-4" />
                                        Upload Date
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            placeholder="From"
                                            value={filters.dateRange.start}
                                            onChange={(e) => handleFilterChange("dateRange", {
                                                ...filters.dateRange,
                                                start: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                        <input
                                            type="date"
                                            placeholder="To"
                                            value={filters.dateRange.end}
                                            onChange={(e) => handleFilterChange("dateRange", {
                                                ...filters.dateRange,
                                                end: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* File Size */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <FileText className="w-4 h-4" />
                                        File Size (MB)
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min size"
                                            value={filters.fileSize.min}
                                            onChange={(e) => handleFilterChange("fileSize", {
                                                ...filters.fileSize,
                                                min: parseFloat(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max size"
                                            value={filters.fileSize.max}
                                            onChange={(e) => handleFilterChange("fileSize", {
                                                ...filters.fileSize,
                                                max: parseFloat(e.target.value) || 100
                                            })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* License Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <FileText className="w-4 h-4" />
                                        License Type
                                    </label>
                                    <select
                                        value={filters.licenseType}
                                        onChange={(e) => handleFilterChange("licenseType", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                                    >
                                        {LICENSE_TYPES.map((license) => (
                                            <option key={license.value} value={license.value}>
                                                {license.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
