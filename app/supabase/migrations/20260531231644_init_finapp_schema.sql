-- Finapp schema for Supabase + PowerSync.
--
-- Design notes:
-- * All id columns are `text` (client-generates UUID strings). No FK constraints:
--   PowerSync upload order is not guaranteed, so referential integrity is enforced
--   in app logic, not the DB.
-- * Columns are camelCase (quoted) so the synced row shape matches the existing
--   client/Pinia item shapes 1:1 (no mapping layer needed).
-- * `categoryId` is plain text (not a FK): it also holds the synthetic literals
--   'transfer' and 'adjustment', which are not real category rows.
-- * RLS is scoped to the owning user. The PowerSync replication role has BYPASSRLS,
--   so per-user partitioning on the read path is handled by sync rules; RLS guards
--   the write path (supabase-js as the authenticated user).

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id                   text primary key default gen_random_uuid()::text,
  "userId"             text not null,
  name                 text not null,
  color                text not null,
  icon                 text not null,
  "parentId"           text,              -- null = root category
  "showInLastUsed"     boolean not null default false,
  "showInQuickSelector" boolean not null default false,
  "updatedAt"          bigint
);
create index categories_user_idx on public.categories ("userId");

-- ---------------------------------------------------------------------------
-- wallets
-- ---------------------------------------------------------------------------
create table public.wallets (
  id                  text primary key default gen_random_uuid()::text,
  "userId"            text not null,
  name                text not null,
  color               text not null,
  currency            text not null,
  type                text not null,     -- cash | credit | cashless | deposit | crypto | debt
  "order"             integer not null default 0,
  "creditLimit"       double precision,
  "desc"              text,
  "isArchived"        boolean not null default false,
  "isExcludeInTotal"  boolean not null default false,
  "isWithdrawal"      boolean not null default false,
  "updatedAt"         bigint
);
create index wallets_user_idx on public.wallets ("userId");

-- ---------------------------------------------------------------------------
-- trns (transactions)
-- ---------------------------------------------------------------------------
create table public.trns (
  id                 text primary key default gen_random_uuid()::text,
  "userId"           text not null,
  type               smallint not null,  -- 0 expense | 1 income | 2 transfer
  date               bigint not null,    -- ms epoch
  "updatedAt"        bigint not null,
  "categoryId"       text,               -- category id | 'transfer' | 'adjustment'
  "desc"             text,
  -- expense / income
  amount             double precision,
  "walletId"         text,
  -- transfer
  "expenseAmount"    double precision,
  "expenseWalletId"  text,
  "incomeAmount"     double precision,
  "incomeWalletId"   text
);
create index trns_user_idx on public.trns ("userId");
create index trns_user_date_idx on public.trns ("userId", date);

-- ---------------------------------------------------------------------------
-- user_settings (one row per user)
-- PowerSync requires an `id` PK on every synced table. Here id == the user uid.
-- ---------------------------------------------------------------------------
create table public.user_settings (
  id              text primary key,          -- equals the user's auth uid
  "userId"        text not null,             -- equals id; kept for RLS + sync-rule uniformity
  "baseCurrency"  text not null default 'USD',
  locale          text                       -- 'en' | 'ru' | null
);

-- ---------------------------------------------------------------------------
-- rates (global, shared across all users)
-- ---------------------------------------------------------------------------
create table public.rates (
  id           text primary key default gen_random_uuid()::text,
  date         text not null,
  rates        jsonb not null,
  source       text,
  "updatedAt"  bigint not null
);
create unique index rates_date_source_idx on public.rates (date, coalesce(source, ''));

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.categories     enable row level security;
alter table public.wallets        enable row level security;
alter table public.trns           enable row level security;
alter table public.user_settings  enable row level security;
alter table public.rates          enable row level security;

-- Per-user tables: owner can do everything to their own rows.
create policy "categories_owner" on public.categories for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");

create policy "wallets_owner" on public.wallets for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");

create policy "trns_owner" on public.trns for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");

create policy "user_settings_owner" on public.user_settings for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");

-- rates: global read for any authenticated user; no client writes (populated server-side).
create policy "rates_read" on public.rates for select to authenticated
  using (true);

-- ===========================================================================
-- Auto-provision user_settings on signup
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_settings (id, "userId", "baseCurrency")
  values (new.id::text, new.id::text, 'USD')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
