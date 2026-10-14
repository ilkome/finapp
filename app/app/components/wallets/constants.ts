export const WALLET_STORAGE_KEYS = {
  activeCurrency: 'finapp.wallets-active-currency',
  activeType: 'finapp.wallets-active-type',
  groupedBy: 'finapp.wallets-groupedBy',
  includeArchivedInStats: 'finapp.wallets-include-archived-in-stats',
  includeExcludedInStats: 'finapp.wallets-include-excluded-in-stats',
  selectorCurrency: 'finapp.wallets-selector-currency',
  showArchived: 'finapp.wallets-show-archived',
  showStatistics: 'finapp.wallets-show-statistics',
  sortOrders: 'finapp.wallets-sort-orders',
  toggleMap: 'finapp.wallets-toggle-map',
  totalPrefix: 'finapp.wallets-total-',
} as const

/** The wallets page owns the bare keys; every other list gets its own copy so expand/collapse and grouping stay independent. */
export const walletStorageKey = (key: string, scope?: string) => scope ? `${key}:${scope}` : key
