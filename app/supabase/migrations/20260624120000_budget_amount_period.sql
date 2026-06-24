-- Model A (plans/budgets-period-redesign.md): each budget carries its own cadence; the page
-- normalizes the amount to the viewed timeframe. Existing rows are treated as monthly.
alter table public.budgets
  add column if not exists "amountPeriod" text not null default 'month'; -- week | month | year
