// components/TokenPayment.tsx
"use client";

import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import { usePayment } from "@/hooks/usePayment";
import { config } from "@/config";
import { formatUnits } from "viem";
import { AllowanceItemProps, PaymentActionProps, SectionProps } from "@/types";

/**
 * Component to display and manage token payments for storage
 */
import { useState } from "react";

export const StorageManager = () => {
  const { isConnected, address } = useAccount();
  const {
    data,
    isLoading: isBalanceLoading,
    refetch: refetchBalances,
  } = useBalances();
  const balances = data;
  const { mutation: paymentMutation, status } = usePayment();
  const { mutateAsync: handlePayment, isPending: isProcessingPayment } =
    paymentMutation;

  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem(`profile_${address}`) || null
  );
  const [username, setUsername] = useState<string>(
    localStorage.getItem(`username_${address}`) || "User"
  );
  const [bio, setBio] = useState<string>(
    localStorage.getItem(`bio_${address}`) || ""
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleRefetchBalances = async () => {
    await refetchBalances();
  };

  if (!isConnected) {
    return null;
  }

  const generateAvatar = (addr: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${addr}`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        localStorage.setItem(`profile_${address}`, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(`username_${address}`, username);
    localStorage.setItem(`bio_${address}`, bio);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="relative group">
            <img
              src={profileImage || generateAvatar(address || "")}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-xs font-semibold">Change</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-2 rounded-lg text-gray-800 font-semibold"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio (optional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-gray-800 text-sm"
                />
                <p className="text-xs opacity-90 font-mono">{formatAddress(address || "")}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold mb-1">{username}</h3>
                {bio && <p className="text-sm opacity-90 mb-2">{bio}</p>}
                <p className="text-xs opacity-90 font-mono">{formatAddress(address || "")}</p>
                <p className="text-xs opacity-75 mt-1">Filecoin Calibration Network</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-all text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition-all text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition-all text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Storage Balance Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <StorageBalanceHeader />
        <div className="p-6 space-y-6">
          <WalletBalancesSection
            balances={balances}
            isLoading={isBalanceLoading}
          />
          <StorageStatusSection
            balances={balances}
            isLoading={isBalanceLoading}
          />
          <AllowanceStatusSection
            balances={balances}
            isLoading={isBalanceLoading}
          />
          <ActionSection
            balances={balances}
            isLoading={isBalanceLoading}
            isProcessingPayment={isProcessingPayment}
            onPayment={handlePayment}
            handleRefetchBalances={handleRefetchBalances}
          />
          {status && (
            <div
              className={`p-4 rounded-xl font-medium ${
                status.includes("❌")
                  ? "bg-red-50 border-2 border-red-200 text-red-800"
                  : status.includes("✅")
                  ? "bg-green-50 border-2 border-green-200 text-green-800"
                  : "bg-blue-50 border-2 border-blue-200 text-blue-800"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Section displaying allowance status
 */
const AllowanceStatusSection = ({ balances, isLoading }: SectionProps) => {
  const depositNeededFormatted = Number(
    formatUnits(balances?.depositNeeded ?? 0n, 18)
  ).toFixed(3);

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Allowance Status</h4>
      <div className="space-y-3">
        <AllowanceItem
          label="Rate Allowance"
          isSufficient={balances?.isRateSufficient}
          isLoading={isLoading}
        />
        {!isLoading && !balances?.isRateSufficient && (
          <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">
                  Max configured storage is {config.storageCapacity} GB. Your current covered storage is {balances?.currentRateAllowanceGB?.toLocaleString()} GB.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  You are currently using {balances?.currentStorageGB?.toLocaleString()} GB.
                </p>
              </div>
            </div>
          </div>
        )}
        <AllowanceItem
          label="Lockup Allowance"
          isSufficient={balances?.isLockupSufficient}
          isLoading={isLoading}
        />
        {!isLoading && !balances?.isLockupSufficient && (
          <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">
                  Max configured lockup is {config.persistencePeriod} days. Your current covered lockup is {balances?.persistenceDaysLeft.toFixed(1)} days. Which is less than the notice period of {config.minDaysThreshold} days.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  You are currently using {balances?.currentStorageGB?.toLocaleString()} GB. Please deposit {depositNeededFormatted} USDFC to extend your lockup for {(config.persistencePeriod - (balances?.persistenceDaysLeft ?? 0)).toFixed(1)} more days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Section for payment actions
 */
const ActionSection = ({
  balances,
  isLoading,
  isProcessingPayment,
  onPayment,
  handleRefetchBalances,
}: PaymentActionProps) => {
  if (isLoading || !balances) return null;

  if (balances.isSufficient) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-green-800">
          ✅ Your storage balance is sufficient for {config.storageCapacity}GB
          of storage for {balances.persistenceDaysLeft.toFixed(1)} days.
        </p>
      </div>
    );
  }

  const depositNeededFormatted = Number(
    formatUnits(balances?.depositNeeded ?? 0n, 18)
  ).toFixed(3);

  if (balances.filBalance === 0n || balances.usdfcBalance === 0n) {
    return (
      <div className="space-y-4">
        <div
          className={`p-4 bg-red-50 rounded-lg border border-red-200 ${
            balances.filBalance === 0n ? "block" : "hidden"
          }`}
        >
          <p className="text-red-800">
            ⚠️ You need to FIL tokens to pay for transaction fees. Please
            deposit FIL tokens to your wallet.
          </p>
        </div>
        <div
          className={`p-4 bg-red-50 rounded-lg border border-red-200 ${
            balances.usdfcBalance === 0n ? "block" : "hidden"
          }`}
        >
          <p className="text-red-800">
            ⚠️ You need to USDFC tokens to pay for storage. Please deposit USDFC
            tokens to your wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {balances.isRateSufficient && !balances.isLockupSufficient && (
        <LockupIncreaseAction
          totalLockupNeeded={balances.totalLockupNeeded}
          depositNeeded={balances.depositNeeded}
          rateNeeded={balances.rateNeeded}
          isProcessingPayment={isProcessingPayment}
          onPayment={onPayment}
          handleRefetchBalances={handleRefetchBalances}
        />
      )}
      {!balances.isRateSufficient && balances.isLockupSufficient && (
        <RateIncreaseAction
          currentLockupAllowance={balances.currentLockupAllowance}
          rateNeeded={balances.rateNeeded}
          isProcessingPayment={isProcessingPayment}
          onPayment={onPayment}
          handleRefetchBalances={handleRefetchBalances}
        />
      )}
      {!balances.isRateSufficient && !balances.isLockupSufficient && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex flex-col gap-2">
          <p className="text-red-800">
            ⚠️ Your storage balance is insufficient. You need to deposit{" "}
            {depositNeededFormatted} USDFC & Increase your rate allowance to
            meet your storage needs.
          </p>
          <button
            onClick={async () => {
              await onPayment({
                lockupAllowance: balances.totalLockupNeeded,
                epochRateAllowance: balances.rateNeeded,
                depositAmount: balances.depositNeeded,
              });
              await handleRefetchBalances();
            }}
            disabled={isProcessingPayment}
            className={`w-full px-6 py-3 rounded-lg border-2 border-black transition-all ${
              isProcessingPayment
                ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {isProcessingPayment
              ? "Processing transactions..."
              : "Deposit & Increase Allowances"}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Component for handling lockup deposit action
 */
const LockupIncreaseAction = ({
  totalLockupNeeded,
  depositNeeded,
  rateNeeded,
  isProcessingPayment,
  onPayment,
  handleRefetchBalances,
}: PaymentActionProps) => {
  if (!totalLockupNeeded || !depositNeeded || !rateNeeded) return null;

  const depositNeededFormatted = Number(
    formatUnits(depositNeeded ?? 0n, 18)
  ).toFixed(3);

  return (
    <>
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">
          ⚠️ Additional USDFC needed to meet your storage needs.
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          Deposit {depositNeededFormatted} USDFC to extend storage.
        </p>
      </div>
      <button
        onClick={async () => {
          await onPayment({
            lockupAllowance: totalLockupNeeded,
            epochRateAllowance: rateNeeded,
            depositAmount: depositNeeded,
          });
          await handleRefetchBalances();
        }}
        disabled={isProcessingPayment}
        className={`w-full px-6 py-3 rounded-lg border-2 border-black transition-all ${
          isProcessingPayment
            ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-white hover:text-black"
        }`}
      >
        {isProcessingPayment
          ? "Processing transactions..."
          : "Deposit & Increase Lockup"}
      </button>
    </>
  );
};

/**
 * Component for handling rate deposit action
 */
const RateIncreaseAction = ({
  currentLockupAllowance,
  rateNeeded,
  isProcessingPayment,
  onPayment,
  handleRefetchBalances,
}: PaymentActionProps) => {
  if (!currentLockupAllowance || !rateNeeded) return null;

  return (
    <>
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">
          ⚠️ Increase your rate allowance to meet your storage needs.
        </p>
      </div>
      <button
        onClick={async () => {
          await onPayment({
            lockupAllowance: currentLockupAllowance,
            epochRateAllowance: rateNeeded,
            depositAmount: 0n,
          });
          await handleRefetchBalances();
        }}
        disabled={isProcessingPayment}
        className={`w-full px-6 py-3 rounded-lg border-2 border-black transition-all ${
          isProcessingPayment
            ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-white hover:text-black"
        }`}
      >
        {isProcessingPayment ? "Increasing Rate..." : "Increase Rate"}
      </button>
    </>
  );
};

/**
 * Header section with title and USDFC faucet button
 */
const StorageBalanceHeader = () => {
  const { chainId } = useAccount();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
      <div className="flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Storage Balance
          </h3>
          <p className="text-blue-100 mt-1 text-sm">
            Manage your USDFC deposits for Filecoin storage
          </p>
        </div>
        {chainId === 314159 && (
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md"
              onClick={() => window.open("https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc", "_blank")}
            >
              Get tUSDFC
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
              onClick={() => window.open("https://faucet.calibnet.chainsafe-fil.io/funds.html", "_blank")}
            >
              Get tFIL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Section displaying wallet balances
 */
const WalletBalancesSection = ({ balances, isLoading }: SectionProps) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Wallet Balances</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-sm font-medium text-gray-600">FIL Balance</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {isLoading ? "..." : balances?.filBalanceFormatted?.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-1">FIL</span>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">$</span>
          </div>
          <span className="text-sm font-medium text-gray-600">USDFC Balance</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {isLoading ? "..." : balances?.usdfcBalanceFormatted?.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-1">USDFC</span>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🔥</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Warm Storage</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {isLoading ? "..." : balances?.warmStorageBalanceFormatted?.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-1">USDFC</span>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📊</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Rate Allowance</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {isLoading ? "..." : balances?.currentRateAllowanceGB?.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-1">GB</span>
      </div>
    </div>
  </div>
);

/**
 * Section displaying storage status
 */
const StorageStatusSection = ({ balances, isLoading }: SectionProps) => {
  const usagePercent = balances ? (balances.currentStorageGB / balances.currentRateAllowanceGB) * 100 : 0;
  
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Storage Status</h4>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Storage Usage</span>
            <span className="text-lg font-bold text-indigo-600">
              {isLoading ? "..." : `${usagePercent.toFixed(1)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {isLoading ? "..." : `${balances?.currentStorageGB?.toLocaleString()} GB`}
            </span>
            <span className="text-gray-500">
              {isLoading ? "..." : `${balances?.currentRateAllowanceGB?.toLocaleString()} GB`}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-xs font-medium text-gray-600">Days Left (Max Usage)</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : balances?.persistenceDaysLeft.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              at {balances?.currentRateAllowanceGB?.toLocaleString()} GB
            </div>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-xs font-medium text-gray-600">Days Left (Current Usage)</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : balances?.persistenceDaysLeftAtCurrentRate.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              at {balances?.currentStorageGB?.toLocaleString()} GB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * Component for displaying an allowance status
 */
const AllowanceItem = ({
  label,
  isSufficient,
  isLoading,
}: AllowanceItemProps) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${isSufficient ? "bg-green-500" : "bg-red-500"}`} />
      <span className={`font-semibold text-sm ${isSufficient ? "text-green-600" : "text-red-600"}`}>
        {isLoading ? "..." : isSufficient ? "Sufficient" : "Insufficient"}
      </span>
    </div>
  </div>
);
