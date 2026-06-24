-- Recurrences (roadmap P1). See plans/recurrences.md §3, §7.
-- Same conventions as the rest of the schema: text ids, camelCase quoted columns, RLS by
-- auth.uid(), no FK constraints. Currency derives from the wallet (not stored), like trns.

create table if not exists public.recurrences (
  id                  text primary key default gen_random_uuid()::text,
  "userId"            text not null,
  "updatedAt"         bigint,
  type                smallint not null,                 -- 0 expense | 1 income (no transfer)
  amount              double precision not null,
  "walletId"          text not null,
  "categoryId"        text not null,                     -- never 'transfer'
  "desc"              text,
  freq                text not null,                     -- day | week | month | year
  interval            integer not null default 1,        -- every N units, >= 1
  "anchorDate"        bigint not null,                   -- first occurrence, civil day (UTC-midnight ms-epoch)
  "monthLastDay"      boolean not null default false,    -- month freq: always last calendar day
  "endMode"           text not null default 'never',     -- never | date | count
  "endDate"           bigint,
  "endCount"          integer,
  "autoCreate"        boolean not null default true,     -- true = generate; false = propose pending
  status              text not null default 'active',    -- active | paused | cancelled
  "skipDates"         text not null default '[]',        -- JSON array of skipped YYYY-MM-DD day keys
  "lastGeneratedDate" bigint                             -- last occurrence materialized (autoCreate)
);
create index if not exists recurrences_user_idx on public.recurrences ("userId");

-- Link a generated/confirmed trn back to its rule (generated trns use a deterministic id).
alter table public.trns add column if not exists "recurrenceId" text;

alter table public.recurrences enable row level security;

create policy "recurrences_owner" on public.recurrences for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");
