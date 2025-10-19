"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, FileText, Image, Video, Music, Package } from "lucide-react";

interface MediaViewerProps {
    pieceCid: string;
    filename?: string;
    assetName?: string;
    className?: string;
    showPreview?: boolean;
}

type MediaType = "image" | "video" | "audio" | "pdf" | "3d" | "unknown";

export const MediaViewer = ({
    pieceCid,
    filename,
    assetName,
    className = "",
    showPreview = true
}: MediaViewerProps) => {
    const [mediaType, setMediaType] = useState<MediaType>("unknown");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Detect media type based on filename
    const detectMediaType = (filename?: string): MediaType => {
        if (!filename) return "unknown";

        const extension = filename.split('.').pop()?.toLowerCase();

        // Image formats
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension || '')) {
            return "image";
        }

        // Video formats
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension || '')) {
            return "video";
        }

        // Audio formats
        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(extension || '')) {
            return "audio";
        }

        // PDF
        if (extension === 'pdf') {
            return "pdf";
        }

        // 3D formats
        if (['obj', 'gltf', 'glb', 'fbx', 'dae', '3ds', 'blend'].includes(extension || '')) {
            return "3d";
        }

        return "unknown";
    };

    // Generate preview URL using Filbeam CDN
    const generatePreviewUrl = (cid: string, mediaType: MediaType): string => {
        const baseUrl = "https://gateway.filbeam.com/ipfs";
        return `${baseUrl}/${cid}`;
    };

    useEffect(() => {
        if (pieceCid) {
            setIsLoading(true);
            setHasError(false);

            const detectedType = detectMediaType(filename);
            setMediaType(detectedType);

            if (showPreview && detectedType === "image") {
                const url = generatePreviewUrl(pieceCid, detectedType);
                setPreviewUrl(url);

                // Test if the URL is accessible
                const img = new window.Image();
                img.onload = () => {
                    setIsLoading(false);
                };
                img.onerror = () => {
                    setHasError(true);
                    setIsLoading(false);
                };
                img.src = url;
            } else {
                setIsLoading(false);
            }
        }
    }, [pieceCid, filename, showPreview]);

    // Get icon for media type
    const getMediaIcon = (type: MediaType) => {
        switch (type) {
            case "image":
                return <Image className="w-6 h-6" />;
            case "video":
                return <Video className="w-6 h-6" />;
            case "audio":
                return <Music className="w-6 h-6" />;
            case "pdf":
                return <FileText className="w-6 h-6" />;
            case "3d":
                return <Package className="w-6 h-6" />;
            default:
                return <FileText className="w-6 h-6" />;
        }
    };

    // Get background color for media type
    const getMediaBgColor = (type: MediaType) => {
        switch (type) {
            case "image":
                return "bg-gradient-to-br from-blue-400 to-blue-600";
            case "video":
                return "bg-gradient-to-br from-red-400 to-red-600";
            case "audio":
                return "bg-gradient-to-br from-green-400 to-green-600";
            case "pdf":
                return "bg-gradient-to-br from-orange-400 to-orange-600";
            case "3d":
                return "bg-gradient-to-br from-purple-400 to-purple-600";
            default:
                return "bg-gradient-to-br from-gray-400 to-gray-600";
        }
    };

    if (!showPreview || mediaType === "unknown") {
        return (
            <div className={`relative w-full h-48 ${getMediaBgColor(mediaType)} rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-white text-center">
                    {getMediaIcon(mediaType)}
                    <p className="text-xs mt-2 opacity-90">
                        {mediaType === "unknown" ? "File" : mediaType.toUpperCase()}
                    </p>
                </div>
            </div>
        );
    }

    if (mediaType === "image") {
        return (
            <div className={`relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 ${className}`}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Preview unavailable</p>
                        </div>
                    </div>
                )}

                {previewUrl && !isLoading && !hasError && (
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={previewUrl}
                        alt={assetName || "Asset preview"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                )}

                {/* Overlay with media type indicator */}
                <div className="absolute top-2 left-2">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <div className="flex items-center gap-1 text-white">
                            {getMediaIcon(mediaType)}
                            <span className="text-xs font-medium">{mediaType.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // For non-image media types, show a preview card
    return (
        <div className={`relative w-full h-48 ${getMediaBgColor(mediaType)} rounded-lg flex items-center justify-center group cursor-pointer ${className}`}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-white text-center"
            >
                {getMediaIcon(mediaType)}
                <p className="text-sm font-medium mt-2">{mediaType.toUpperCase()}</p>
                <p className="text-xs opacity-75 mt-1">Click to preview</p>
            </motion.div>

            {/* Play button overlay for video/audio */}
            {(mediaType === "video" || mediaType === "audio") && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 group-hover:bg-black/70 transition-colors">
                        <Play className="w-6 h-6 text-white" />
                    </div>
                </div>
            )}

            {/* File info overlay */}
            <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <p className="text-xs text-white truncate">
                        {filename || assetName || `Asset ${pieceCid.slice(0, 8)}...`}
                    </p>
                </div>
            </div>
        </div>
    );
};
