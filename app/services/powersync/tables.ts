// Plain list without a PowerSync import, so the entry chunk can use it without @powersync/common.
// AppSchema, the mutation guard, the wipe and scripts/backup-finapp.mjs all follow it.
export const SYNCED_TABLES = ['categories', 'loan_schedule_rows', 'loans', 'stat_views', 'trns', 'user_settings', 'wallets'] as const
