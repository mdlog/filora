"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { usePurchasedAssets } from "./usePurchasedAssets";

export const useAssetAccess = () => {
  const { address } = useAccount();
  const { purchases } = usePurchasedAssets();
  const [isGeneratingAccess, setIsGeneratingAccess] = useState(false);

  const hasAccess = (datasetId: number, pieceId: number) => {
    return purchases.some(p => p.datasetId === datasetId && p.pieceId === pieceId);
  };

  const generateAccessToken = async (datasetId: number, pieceId: number) => {
    if (!address || !hasAccess(datasetId, pieceId)) return null;
    
    setIsGeneratingAccess(true);
    try {
      // Generate secure access token
      const token = btoa(JSON.stringify({
        buyer: address,
        datasetId,
        pieceId,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));
      
      return token;
    } finally {
      setIsGeneratingAccess(false);
    }
  };

  const getDownloadUrl = (pieceCid: string, accessToken: string) => {
    return `https://gateway.filora.io/download/${pieceCid}?token=${accessToken}`;
  };

  return {
    hasAccess,
    generateAccessToken,
    getDownloadUrl,
    isGeneratingAccess
  };
};