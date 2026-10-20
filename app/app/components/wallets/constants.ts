export const WALLET_STORAGE_KEYS = {
  activeCurrency: 'finapp.wallets-active-currency',
  activeType: 'finapp.wallets-active-type',
  analyticsBalance: 'finapp.wallets-analytics-balance',
  analyticsCashflow: 'finapp.wallets-analytics-cashflow',
  analyticsForecast: 'finapp.wallets-analytics-forecast',
  analyticsPeriod: 'finapp.wallets-analytics-period',
  analyticsRange: 'finapp.wallets-analytics-range',
  analyticsRates: 'finapp.wallets-analytics-rates',
  analyticsShares: 'finapp.wallets-analytics-shares',
  analyticsTab: 'finapp.wallets-analytics-tab',
  groupedBy: 'finapp.wallets-groupedBy',
  includeArchivedInStats: 'finapp.wallets-include-archived-in-stats',
  includeExcludedInStats: 'finapp.wallets-include-excluded-in-stats',
  selectorCurrency: 'finapp.wallets-selector-currency',
  showArchived: 'finapp.wallets-show-archived',
  showStatistics: 'finapp.wallets-show-statistics',
  toggleMap: 'finapp.wallets-toggle-map',
  totalPrefix: 'finapp.wallets-total-',
} as const

/** The wallets page owns the bare keys; every other list gets its own copy so expand/collapse and grouping stay independent. */
export const walletStorageKey = (key: string, scope?: string) => scope ? `${key}:${scope}` : key
