"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
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

      console.log("Processing payment:", {
        from: address,
        to,
        amount,
        amountWei: amountWei.toString(),
        tokenId
      });

      try {
        // Step 1: Approve USDFC spending
        console.log("Step 1: Approving USDFC...");
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.USDFC as `0x${string}`,
          abi: USDFCABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`, amountWei],
        });
        console.log("✅ Approval tx sent:", approveHash);

        // Wait for approval confirmation
        console.log("Waiting for approval confirmation...");
        // Small delay to ensure tx is processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Process payment
        console.log("Step 2: Processing payment...");
        const paymentHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
          abi: FilecoinPayABI,
          functionName: "processPayment",
          args: [address, to as `0x${string}`, amountWei, BigInt(tokenId)],
        });
        console.log("✅ Payment tx sent:", paymentHash);

        return { approveHash, paymentHash };
      } catch (error: any) {
        console.error("Payment processing error:", error);

        // Provide better error messages
        if (error.message?.includes("insufficient")) {
          throw new Error("Insufficient USDFC balance. Please get USDFC tokens first.");
        }
        if (error.message?.includes("allowance")) {
          throw new Error("Approval failed. Please try again.");
        }
        if (error.message?.includes("Internal JSON-RPC")) {
          throw new Error("Transaction failed. Please check: 1) You have enough USDFC, 2) Gas fees are sufficient, 3) Try again.");
        }

        throw error;
      }
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
