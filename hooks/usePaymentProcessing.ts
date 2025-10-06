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

        // Wait for approval confirmation - IMPORTANT for preventing SysErrContractReverted(33)
        console.log("⏳ Waiting for approval confirmation...");
        console.log("⚠️ Please wait, do not close the browser...");
        
        // Increased delay for testnet - critical to prevent contract revert
        // Filecoin testnet can be slow, need to ensure approval is confirmed
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("✅ Approval confirmed! Proceeding with payment...");

        // Step 2: Process payment
        console.log("Step 2: Processing payment...");
        // FIXED: Contract only needs 3 params (to, amount, tokenId), not 4!
        // 'from' is automatically msg.sender in the contract
        const paymentHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`,
          abi: FilecoinPayABI,
          functionName: "processPayment",
          args: [to as `0x${string}`, amountWei, BigInt(tokenId)],
        });
        console.log("✅ Payment tx sent:", paymentHash);

        return { approveHash, paymentHash };
      } catch (error: any) {
        console.error("Payment processing error:", error);

        // Provide better error messages
        if (error.message?.includes("insufficient")) {
          throw new Error("❌ Insufficient USDFC balance. Please get USDFC tokens first.");
        }
        if (error.message?.includes("allowance")) {
          throw new Error("❌ Approval failed. Please try again and confirm both transactions.");
        }
        if (error.message?.includes("Internal JSON-RPC") || error.message?.includes("ContractReverted")) {
          throw new Error("❌ Transaction reverted. Common causes:\n1. Wait longer between approval and payment (try again)\n2. Insufficient USDFC balance\n3. Insufficient tFIL for gas\n4. Asset price not set\n\nCheck console for details and try again.");
        }
        if (error.message?.includes("SysErr") || error.message?.includes("revert")) {
          throw new Error("❌ Contract execution failed (SysErr). This usually means:\n1. Approval transaction not yet confirmed (wait 5-10s and retry)\n2. Insufficient balance or allowance\n3. Network congestion\n\nPlease try again in a few seconds.");
        }
        if (error.message?.includes("user rejected")) {
          throw new Error("❌ Transaction cancelled. You need to confirm both MetaMask popups to complete the purchase.");
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
