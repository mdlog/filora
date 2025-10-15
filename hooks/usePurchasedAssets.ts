"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export interface PurchasedAsset {
  datasetId: number;
  pieceId: number;
  pieceCid: string;
  seller: string;
  price: string;
  purchasedAt: number;
  txHash?: string;
  nftTokenId?: string;
  licenseHash?: string;
  filename?: string; // Original filename with extension
  assetName?: string; // Asset name for display
}

const STORAGE_KEY = "filora_purchased_assets";

export const usePurchasedAssets = () => {
  const { address } = useAccount();
  const [purchases, setPurchases] = useState<PurchasedAsset[]>([]);

  useEffect(() => {
    if (!address) return;
    const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`);
    if (stored) {
      setPurchases(JSON.parse(stored));
    }
  }, [address]);

  const addPurchase = async (asset: PurchasedAsset) => {
    if (!address) return;

    // Check if already purchased (prevent duplicates)
    const alreadyPurchased = purchases.some(
      p => p.datasetId === asset.datasetId && p.pieceId === asset.pieceId
    );

    if (alreadyPurchased) {
      console.warn("⚠️ Asset already purchased, skipping duplicate:", {
        datasetId: asset.datasetId,
        pieceId: asset.pieceId
      });
      return;
    }

    console.log("✅ Adding purchase to storage:", asset);

    const updated = [...purchases, asset];
    setPurchases(updated);
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(updated));
  };

  const getPurchase = (datasetId: number, pieceId: number) => {
    return purchases.find(p => p.datasetId === datasetId && p.pieceId === pieceId);
  };

  const removePurchase = (datasetId: number, pieceId: number) => {
    if (!address) return;

    console.log("🗑️ Removing purchase:", { datasetId, pieceId });

    const updated = purchases.filter(
      p => !(p.datasetId === datasetId && p.pieceId === pieceId)
    );

    setPurchases(updated);
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(updated));

    console.log("✅ Purchase removed from storage");
  };

  const clearAllPurchases = () => {
    if (!address) return;

    console.log("🗑️ Clearing all purchases");
    setPurchases([]);
    localStorage.removeItem(`${STORAGE_KEY}_${address}`);
    console.log("✅ All purchases cleared");
  };

  return {
    purchases,
    addPurchase,
    getPurchase,
    removePurchase,
    clearAllPurchases
  };
};
