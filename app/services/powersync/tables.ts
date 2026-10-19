// Plain list without a PowerSync import, so the entry chunk can use it without @powersync/common.
// The mutation guard, the wipe and scripts/backup-finapp.mjs follow it; `exchange_rates` is read-only and global.
export const SYNCED_TABLES = ['bank_reports', 'categories', 'currencies', 'display_overrides', 'forecast_categories', 'forecast_settings', 'loan_schedule_overrides', 'loans', 'stat_views', 'transactions', 'user_settings', 'wallets'] as const
