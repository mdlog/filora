"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { FilecoinPayABI, USDFCABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { parseEther } from "ethers";

export const usePaymentProcessing = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const processPayment = useMutation({
    mutationFn: async ({
      to,
      amount,
      tokenId,
    }: {
      to: string;
      amount: string;
      tokenId: number;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      const amountWei = parseEther(amount);

      // Approve USDFC spending
      const approveHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.USDFC as `0x${string}`,
        abi: USDFCABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`, amountWei],
      });

      // Process payment
      const paymentHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
        abi: FilecoinPayABI,
        functionName: "processPayment",
        args: [address, to as `0x${string}`, amountWei, BigInt(tokenId)],
      });

      return { approveHash, paymentHash };
    },
  });

  const withdrawRoyalties = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
        abi: FilecoinPayABI,
        functionName: "withdrawRoyalties",
      });

      return hash;
    },
  });

  return { processPayment, withdrawRoyalties };
};
