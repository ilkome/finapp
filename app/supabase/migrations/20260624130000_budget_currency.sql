-- Store the currency a budget's amount is stated in (the base currency at creation), so the read
-- path can convert it to the current base - changing the base currency no longer breaks budgets.
-- Nullable: legacy rows are treated as "already in base" by the client. See plans/budgets.md §11.
alter table public.budgets
  add column if not exists "currency" text;
