"use client";

import { useLicenseVerification } from "@/hooks/useLicenseVerification";

interface LicenseVerificationBadgeProps {
  tokenId: number | string;
}

export const LicenseVerificationBadge = ({ tokenId }: LicenseVerificationBadgeProps) => {
  const { hasLicense, isActive, expiry, isLoading } = useLicenseVerification(tokenId);

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full animate-pulse">
        <span className="text-xs text-gray-500">Checking...</span>
      </div>
    );
  }

  if (!hasLicense) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <span className="text-xs text-gray-600">🔒 No License</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
      <span className="text-xs text-green-700">✅ Licensed</span>
    </div>
  );
};
