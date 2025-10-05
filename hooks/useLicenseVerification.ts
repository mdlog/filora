"use client";

import { useAccount, useReadContract } from "wagmi";
import { FiloraLicense1155ABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

export const useLicenseVerification = (tokenId: number | string) => {
  const { address } = useAccount();
  const tokenIdNum = typeof tokenId === 'string' ? parseInt(tokenId.split('-')[0]) : tokenId;

  const { data: balance, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FiloraLicense1155 as `0x${string}`,
    abi: FiloraLicense1155ABI,
    functionName: "balanceOf",
    args: address && !isNaN(tokenIdNum) ? [address, BigInt(tokenIdNum)] : undefined,
    query: {
      enabled: !!address && !isNaN(tokenIdNum),
    },
  });

  const hasLicense = balance ? Number(balance) > 0 : false;

  return {
    hasLicense,
    isActive: hasLicense,
    expiry: undefined,
    isLoading,
  };
};
