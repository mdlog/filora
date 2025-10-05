"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FiloraLicense1155ABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { parseEther } from "ethers";

export const useNFTMint = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  return useMutation({
    mutationFn: async ({
      tokenId,
      amount = 1,
      metadata,
    }: {
      tokenId: number;
      amount?: number;
      metadata?: string;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.FiloraLicense1155 as `0x${string}`,
        abi: FiloraLicense1155ABI,
        functionName: "mint",
        args: [address, BigInt(tokenId), BigInt(amount)],
      });

      return { hash, tokenId };
    },
  });
};
