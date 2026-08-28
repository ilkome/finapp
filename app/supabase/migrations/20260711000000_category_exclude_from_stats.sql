-- Per-category opt-out from dashboard statistics: when true, the category's transactions are
-- dropped from the period totals and charts (not from balances or transaction lists). The two
-- synthetic system categories (transfer, adjustment) carry this as true by default in the client;
-- real categories default to false. See plans/category-exclude-from-stats.md.
alter table public.categories
  add column if not exists "isExcludeFromStats" boolean not null default false;
