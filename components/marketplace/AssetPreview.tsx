"use client";
import { getFilbeamPieceUrl } from "@/utils/filbeam";

interface AssetPreviewProps {
  pieceCid: string;
  assetName: string;
}

export const AssetPreview = ({ pieceCid, assetName }: AssetPreviewProps) => {
  const previewUrl = getFilbeamPieceUrl(pieceCid);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-96 flex items-center justify-center relative">
        <a 
          href={previewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-gray-200 transition-colors text-center group"
        >
          <span className="text-9xl block mb-4 group-hover:scale-110 transition-transform">🎨</span>
          <div className="bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-semibold mb-1">Preview via Filbeam CDN</p>
            <p className="text-xs opacity-80">Fast global content delivery</p>
          </div>
        </a>
      </div>
      <div className="p-4 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">🌐 CDN URL:</p>
        <a 
          href={previewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-700 break-all underline"
        >
          {previewUrl}
        </a>
      </div>
    </div>
  );
};
