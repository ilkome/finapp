-- Budgets (roadmap P3). See plans/budgets.md §4, §12.
-- text ids, camelCase quoted columns, RLS by auth.uid(), no FK constraints. Amounts in the
-- user's base currency (trns converted at read time via rates).

create table if not exists public.budgets (
  id            text primary key default gen_random_uuid()::text,
  "userId"      text not null,
  "updatedAt"   bigint,
  "categoryId"  text not null,                     -- budgeted category (parent rolls up its subtree)
  kind          text not null,                     -- expense | income
  amount        double precision not null,         -- default planned amount per period (base currency)
  rollover      text not null default 'none',      -- none | surplus | surplus_deficit
  bucket        text,                              -- need | want | savings (50/30/20)
  "goalAmount"  double precision,                  -- sinking-fund target (later phase)
  "goalDate"    bigint,                            -- sinking-fund target date (later phase)
  status        text not null default 'active'     -- active | archived
);
create index if not exists budgets_user_idx on public.budgets ("userId");

create table if not exists public.budget_assignments (
  id            text primary key default gen_random_uuid()::text,
  "userId"      text not null,
  "updatedAt"   bigint,
  "budgetId"    text not null,
  "periodStart" bigint not null,                   -- ms epoch, normalized to the period start
  assigned      double precision not null          -- assigned for that specific period (base currency)
);
create index if not exists budget_assignments_user_idx
  on public.budget_assignments ("userId", "budgetId", "periodStart");

alter table public.budgets            enable row level security;
alter table public.budget_assignments enable row level security;

create policy "budgets_owner" on public.budgets for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");

create policy "budget_assignments_owner" on public.budget_assignments for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");
