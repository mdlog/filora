"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNFTMint } from "./useNFTMint";

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
}

const STORAGE_KEY = "filora_purchased_assets";

export const usePurchasedAssets = () => {
  const { address } = useAccount();
  const [purchases, setPurchases] = useState<PurchasedAsset[]>([]);
  const { mintNFTLicense } = useNFTMint();

  useEffect(() => {
    if (!address) return;
    const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`);
    if (stored) {
      setPurchases(JSON.parse(stored));
    }
  }, [address]);

  const addPurchase = async (asset: PurchasedAsset) => {
    if (!address) return;
    
    // Mint NFT license after successful purchase
    try {
      const nftResult = await mintNFTLicense({
        datasetId: asset.datasetId,
        pieceId: asset.pieceId,
        pieceCid: asset.pieceCid,
        buyer: address,
        price: asset.price
      });
      
      asset.nftTokenId = nftResult.tokenId;
      asset.licenseHash = nftResult.licenseHash;
    } catch (error) {
      console.warn("NFT minting failed:", error);
    }
    
    const updated = [...purchases, asset];
    setPurchases(updated);
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(updated));
  };

  const getPurchase = (datasetId: number, pieceId: number) => {
    return purchases.find(p => p.datasetId === datasetId && p.pieceId === pieceId);
  };

  return { purchases, addPurchase, getPurchase };
};
