export enum AccountTier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
}

export const TierLimits = {
  [AccountTier.TIER_1]: {
    singleTransactionLimit: 50000,
    maxBalance: 300000,
  },
  [AccountTier.TIER_2]: {
    singleTransactionLimit: 200000,
    maxBalance: 1000000,
  },
  [AccountTier.TIER_3]: {
    singleTransactionLimit: Infinity,
    maxBalance: Infinity,
  },
};
