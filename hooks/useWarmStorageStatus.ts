import { useBalances } from "./useBalances";

export const useWarmStorageStatus = () => {
  const { data: balances, isLoading } = useBalances();

  const hasNoWarmStorage = balances?.warmStorageBalance === 0n && 
                          balances?.currentRateAllowanceGB === 0 && 
                          balances?.currentLockupAllowance === 0n;

  const needsInitialSetup = hasNoWarmStorage && balances?.usdfcBalance > 0n;
  const needsTokens = balances?.usdfcBalance === 0n;

  return {
    hasNoWarmStorage,
    needsInitialSetup,
    needsTokens,
    isLoading,
    balances
  };
};