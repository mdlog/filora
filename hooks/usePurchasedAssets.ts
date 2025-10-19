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

  // Load purchases from localStorage
  const loadPurchases = () => {
    if (!address) {
      setPurchases([]);
      console.log("⚠️ No wallet address, clearing purchases");
      return;
    }

    const storageKey = `${STORAGE_KEY}_${address}`;
    const stored = localStorage.getItem(storageKey);

    console.log("📦 Loading purchases from localStorage:", {
      address,
      key: storageKey,
      hasData: !!stored,
      dataLength: stored ? stored.length : 0
    });

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPurchases(parsed);
        console.log("✅ Loaded purchases:", parsed.length, "items");
        console.log("📋 Purchase details:", parsed);
      } catch (error) {
        console.error("❌ Failed to parse purchases:", error);
        console.error("❌ Raw data:", stored);
        setPurchases([]);
      }
    } else {
      console.log("❌ No data found in localStorage for key:", storageKey);
      setPurchases([]);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, [address]);

  // Add manual refresh function
  const refreshPurchases = () => {
    console.log("🔄 Manually refreshing purchases...");
    loadPurchases();
  };

  // Debug utility function
  const debugLocalStorage = () => {
    if (!address) {
      console.log("❌ No wallet address for debugging");
      return;
    }

    const storageKey = `${STORAGE_KEY}_${address}`;
    console.log("🔍 DEBUG: Checking localStorage...");
    console.log("📍 Storage Key:", storageKey);

    const stored = localStorage.getItem(storageKey);
    console.log("📦 Raw Data:", stored);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("✅ Parsed Data:", parsed);
        console.log("📊 Total Items:", parsed.length);
        parsed.forEach((item: PurchasedAsset, index: number) => {
          console.log(`📋 Item ${index}:`, {
            datasetId: item.datasetId,
            pieceId: item.pieceId,
            pieceCid: item.pieceCid,
            price: item.price,
            purchasedAt: new Date(item.purchasedAt * 1000).toLocaleString()
          });
        });
      } catch (error) {
        console.error("❌ Parse Error:", error);
      }
    } else {
      console.log("❌ No data found");
    }

    // Check all filora keys
    console.log("🔍 All filora keys in localStorage:");
    Object.keys(localStorage).forEach(key => {
      if (key.includes('filora')) {
        console.log(`📌 ${key}:`, localStorage.getItem(key));
      }
    });
  };

  const addPurchase = async (asset: PurchasedAsset) => {
    if (!address) {
      console.error("❌ Cannot add purchase: No wallet connected");
      return;
    }

    // Load fresh data from localStorage to check for duplicates
    const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`);
    const currentPurchases = stored ? JSON.parse(stored) : [];

    // Check if already purchased (prevent duplicates)
    const alreadyPurchased = currentPurchases.some(
      (p: PurchasedAsset) => p.datasetId === asset.datasetId && p.pieceId === asset.pieceId
    );

    if (alreadyPurchased) {
      console.warn("⚠️ Asset already purchased, skipping duplicate:", {
        datasetId: asset.datasetId,
        pieceId: asset.pieceId
      });
      return;
    }

    console.log("✅ Adding purchase to storage:", asset);

    const updated = [...currentPurchases, asset];
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(updated));
    setPurchases(updated);

    console.log("✅ Purchase saved! Total purchases:", updated.length);
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
    clearAllPurchases,
    loadPurchases, // Export untuk manual refresh jika diperlukan
    refreshPurchases, // Export untuk manual refresh
    debugLocalStorage // Export untuk debugging
  };
};
