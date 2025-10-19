"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCw, Download, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";

interface AssetPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    datasetId: number;
    pieceId: number;
    pieceCid: string;
    name?: string;
    filename?: string;
    price?: string;
    owner?: string;
  };
}

type MediaType = "image" | "video" | "audio" | "pdf" | "3d" | "unknown";

export const AssetPreview = ({ isOpen, onClose, asset }: AssetPreviewProps) => {
  const [mediaType, setMediaType] = useState<MediaType>("unknown");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Image viewer states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Video/Audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const { downloadMutation } = useDownloadPiece(asset.pieceCid, asset.filename || `asset-${asset.datasetId}-${asset.pieceId}`);

  // Detect media type based on filename/CID
  const detectMediaType = (filename?: string, cid?: string): MediaType => {
    if (!filename && !cid) return "unknown";

    const file = filename || cid || "";
    const extension = file.split('.').pop()?.toLowerCase();

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

    // For images, we can directly use the CDN
    if (mediaType === "image") {
      return `${baseUrl}/${cid}`;
    }

    // For other media types, we might need different handling
    return `${baseUrl}/${cid}`;
  };

  useEffect(() => {
    if (isOpen && asset.pieceCid) {
      setIsLoading(true);
      setError(null);

      const detectedType = detectMediaType(asset.filename, asset.pieceCid);
      setMediaType(detectedType);

      // Generate preview URL
      const url = generatePreviewUrl(asset.pieceCid, detectedType);
      setPreviewUrl(url);

      // Test if the URL is accessible
      fetch(url, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            setIsLoading(false);
          } else {
            setError("Preview not available");
            setIsLoading(false);
          }
        })
        .catch(() => {
          setError("Failed to load preview");
          setIsLoading(false);
        });
    }
  }, [isOpen, asset]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsPlaying(false);
      setCurrentTime(0);
      setVolume(1);
      setIsMuted(false);
    }
  }, [isOpen]);

  // Image viewer controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse/touch handlers for image dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Video/Audio controls
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleMute = () => setIsMuted(!isMuted);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 truncate flex-1 mx-4">
              {asset.name || `Asset #${asset.datasetId}`}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="relative bg-gray-100 min-h-[400px] flex items-center justify-center">
            {isLoading && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">Preview Not Available</p>
                  <p className="text-gray-600">{error}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download to View
                </button>
              </div>
            )}

            {!isLoading && !error && previewUrl && (
              <>
                {/* Image Viewer */}
                {mediaType === "image" && (
                  <div className="relative w-full h-full overflow-hidden">
                    <motion.img
                      src={previewUrl}
                      alt={asset.name || "Asset preview"}
                      className="max-w-full max-h-full object-contain cursor-move select-none"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                        transformOrigin: "center center",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      draggable={false}
                    />
                  </div>
                )}

                {/* Video Player */}
                {mediaType === "video" && (
                  <div className="relative w-full max-w-4xl">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-h-[70vh]"
                      onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration);
                      }}
                      onTimeUpdate={(e) => {
                        setCurrentTime(e.currentTarget.currentTime);
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Audio Player */}
                {mediaType === "audio" && (
                  <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={handlePlayPause}
                          className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">Audio Preview</p>
                          <p className="text-sm text-gray-600">
                            {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} /
                            {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                          </p>
                        </div>
                        <button
                          onClick={handleMute}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                      </div>
                      <audio
                        src={previewUrl}
                        ref={(audio) => {
                          if (audio) {
                            audio.volume = isMuted ? 0 : volume;
                          }
                        }}
                        onLoadedMetadata={(e) => {
                          setDuration(e.currentTarget.duration);
                        }}
                        onTimeUpdate={(e) => {
                          setCurrentTime(e.currentTarget.currentTime);
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="w-full"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Volume</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Viewer */}
                {mediaType === "pdf" && (
                  <div className="w-full h-full">
                    <iframe
                      src={previewUrl}
                      className="w-full h-[70vh] border-0"
                      title="PDF Preview"
                    />
                  </div>
                )}

                {/* 3D Model Viewer - Placeholder */}
                {mediaType === "3d" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">3D Model Preview</p>
                      <p className="text-gray-600">3D viewer coming soon</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download to View
                    </button>
                  </div>
                )}

                {/* Unknown file type */}
                {mediaType === "unknown" && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">File Preview</p>
                      <p className="text-gray-600">Preview not supported for this file type</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download to View
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              {/* Image controls */}
              {mediaType === "image" && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Reset View"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Price:</span> {asset.price} USDFC
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};