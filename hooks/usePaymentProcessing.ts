"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { FilecoinPayABI, USDFCABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { parseEther, formatEther } from "ethers";

export const usePaymentProcessing = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

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
        // Step 0: Check balance before purchase
        console.log("Step 0: Checking USDFC balance before purchase...");
        const balanceBefore = await publicClient!.readContract({
          address: CONTRACT_ADDRESSES.USDFC as `0x${string}`,
          abi: USDFCABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }) as bigint;
        console.log("💰 Balance before:", formatEther(balanceBefore), "USDFC");

        // Step 1: Approve USDFC spending
        console.log("Step 1: Approving USDFC...");
        console.log("📝 Please confirm the FIRST MetaMask popup (Approve USDFC)");
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.USDFC as `0x${string}`,
          abi: USDFCABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.FilecoinPay as `0x${string}`, amountWei],
        });
        console.log("✅ Approval tx sent:", approveHash);

        // Wait for approval confirmation on blockchain - CRITICAL!
        console.log("⏳ Waiting for approval to be confirmed on blockchain...");
        console.log("⚠️ Please wait, do not close the browser...");
        console.log("⏰ This may take 10-30 seconds on Filecoin testnet...");

        // Wait for actual blockchain confirmation
        const approvalReceipt = await publicClient!.waitForTransactionReceipt({
          hash: approveHash,
          confirmations: 1,
          timeout: 120_000, // 120 seconds timeout (Filecoin testnet can be slow)
        });

        if (approvalReceipt.status === "reverted") {
          throw new Error("❌ Approval transaction failed. Please try again.");
        }

        console.log("✅ Approval confirmed on blockchain!");
        console.log("📝 Now please confirm the SECOND MetaMask popup (Process Payment)");

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

        // Step 3: Wait for payment transaction confirmation on blockchain
        console.log("Step 3: Waiting for payment confirmation on blockchain...");
        console.log("⏰ This may take 10-30 seconds...");

        const paymentReceipt = await publicClient!.waitForTransactionReceipt({
          hash: paymentHash,
          confirmations: 1,
          timeout: 120_000, // 120 seconds timeout (Filecoin testnet can be slow)
        });

        if (paymentReceipt.status === "reverted") {
          throw new Error("❌ Payment transaction failed/reverted. Your funds are safe. Please try again.");
        }

        console.log("✅ Payment confirmed on blockchain!");

        // Step 4: Verify balance decreased
        console.log("Step 4: Verifying balance decreased...");
        const balanceAfter = await publicClient!.readContract({
          address: CONTRACT_ADDRESSES.USDFC as `0x${string}`,
          abi: USDFCABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }) as bigint;
        console.log("💰 Balance after:", formatEther(balanceAfter), "USDFC");

        const actualSpent = balanceBefore - balanceAfter;
        console.log("💸 Actually spent:", formatEther(actualSpent), "USDFC");
        console.log("💸 Expected to spend:", amount, "USDFC");

        if (actualSpent === 0n) {
          console.error("❌ CRITICAL: Balance did not decrease! Transaction may have failed silently.");
          console.error("Transaction hash:", paymentHash);
          console.error("Please check transaction on explorer:");
          console.error(`https://calibration.filfox.info/en/message/${paymentHash}`);
          throw new Error("❌ Payment failed: Your balance did not decrease. The transaction may have reverted. Please check the transaction on the explorer.");
        }

        console.log("✅ Payment verified! Balance decreased as expected.");

        return { approveHash, paymentHash, actualSpent: formatEther(actualSpent) };
      } catch (error: any) {
        console.error("Payment processing error:", error);

        // Handle timeout errors specially
        if (error.message?.includes("Timed out") || error.message?.includes("timeout")) {
          const txHash = error.message?.match(/0x[a-fA-F0-9]{64}/)?.[0];
          console.error("⏰ Transaction timeout. Hash:", txHash);

          throw new Error(
            `⏰ Transaction confirmation timeout.\n\n` +
            `The transaction was sent but took too long to confirm on Filecoin testnet.\n\n` +
            `Transaction hash: ${txHash || 'unknown'}\n\n` +
            `Please check the transaction status:\n` +
            `https://calibration.filfox.info/en/message/${txHash}\n\n` +
            `If the transaction succeeded, your purchase is complete.\n` +
            `If it failed, please try again.`
          );
        }

        // Provide better error messages
        if (error.message?.includes("insufficient")) {
          throw new Error("❌ Insufficient USDFC balance. Please get USDFC tokens first.");
        }
        if (error.message?.includes("allowance")) {
          throw new Error("❌ Approval failed. Please try again and confirm both transactions.");
        }
        if (error.message?.includes("Internal JSON-RPC") || error.message?.includes("ContractReverted")) {
          throw new Error("❌ Transaction reverted. Common causes:\n1. Wait longer between approval and payment (try again)\n2. Insufficient USDFC balance\n3. Insufficient tFIL for gas\n4. Asset price not set in FilecoinPay contract\n\nCheck console for details and try again.");
        }
        if (error.message?.includes("SysErr") || error.message?.includes("revert")) {
          throw new Error("❌ Contract execution failed (SysErr). This usually means:\n1. Approval transaction not yet confirmed (wait 5-10s and retry)\n2. Insufficient balance or allowance\n3. Network congestion\n4. Price not set in FilecoinPay contract\n\nPlease try again in a few seconds.");
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
