export const MAX_UINT256 = 2n ** 256n - 1n;

// 0.1 USDFC in wei (used for dataset creation fee)
export const DATA_SET_CREATION_FEE = BigInt(0.1 * 10 ** 18);

// Default royalty percentage (5% = 500 basis points)
export const DEFAULT_ROYALTY_PERCENTAGE = 500n;

// License duration in seconds (30 days)
export const DEFAULT_LICENSE_DURATION = 30n * 24n * 60n * 60n;
