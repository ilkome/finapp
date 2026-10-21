-- Data model: snake_case names, the flow model of transactions, integer money in minor units, UUIDv7 ids,
-- details of one kind of entity in 1:1 tables, one RLS function. The rules: docs reference "Data model".
-- Old tables move into schema `data_model_old`, new ones are filled from them, then the old schema is dropped.
-- Aborts (and changes nothing) when a preflight or the reference check finds a row it cannot convert.

-- Pinned scale per currency; a copy of utils/money/scale.ts, kept equal by its test.
create temp table money_scales (code text primary key, scale int not null);
insert into money_scales (code, scale) values
  ('AED', 2), ('AFN', 2), ('ALL', 2), ('AMD', 2), ('ANG', 2), ('AOA', 2), ('ARS', 2), ('AUD', 2),
  ('AWG', 2), ('AZN', 2), ('BAM', 2), ('BBD', 2), ('BDT', 2), ('BGN', 2), ('BHD', 3), ('BIF', 0),
  ('BMD', 2), ('BND', 2), ('BOB', 2), ('BOV', 2), ('BRL', 2), ('BSD', 2), ('BTC', 8), ('BTN', 2),
  ('BWP', 2), ('BYN', 2), ('BZD', 2), ('CAD', 2), ('CDF', 2), ('CHE', 2), ('CHF', 2), ('CHW', 2),
  ('CLF', 4), ('CLP', 0), ('CNH', 2), ('CNY', 2), ('COP', 2), ('COU', 2), ('CRC', 2), ('CUC', 2),
  ('CUP', 2), ('CVE', 2), ('CZK', 2), ('DJF', 0), ('DKK', 2), ('DOGE', 8), ('DOP', 2), ('DZD', 2),
  ('EGP', 2), ('ERN', 2), ('ETB', 2), ('ETH', 9), ('EUR', 2), ('FJD', 2), ('FKP', 2), ('GBP', 2),
  ('GEL', 2), ('GHS', 2), ('GIP', 2), ('GMD', 2), ('GNF', 0), ('GTQ', 2), ('GYD', 2), ('HKD', 2),
  ('HNL', 2), ('HRK', 2), ('HTG', 2), ('HUF', 2), ('IDR', 2), ('ILS', 2), ('INR', 2), ('IQD', 3),
  ('IRR', 2), ('ISK', 0), ('JMD', 2), ('JOD', 3), ('JPY', 0), ('KES', 2), ('KGS', 2), ('KHR', 2),
  ('KMF', 0), ('KPW', 2), ('KRW', 0), ('KWD', 3), ('KYD', 2), ('KZT', 2), ('LAK', 2), ('LBP', 2),
  ('LKR', 2), ('LRD', 2), ('LSL', 2), ('LYD', 3), ('MAD', 2), ('MDL', 2), ('MGA', 2), ('MKD', 2),
  ('MMK', 2), ('MNT', 2), ('MOP', 2), ('MRU', 2), ('MUR', 2), ('MVR', 2), ('MWK', 2), ('MXN', 2),
  ('MXV', 2), ('MYR', 2), ('MZN', 2), ('NAD', 2), ('NGN', 2), ('NIO', 2), ('NOK', 2), ('NPR', 2),
  ('NZD', 2), ('OMR', 3), ('PAB', 2), ('PEN', 2), ('PGK', 2), ('PHP', 2), ('PKR', 2), ('PLN', 2),
  ('PYG', 0), ('QAR', 2), ('RON', 2), ('RSD', 2), ('RUB', 2), ('RWF', 0), ('SAR', 2), ('SBD', 2),
  ('SCR', 2), ('SDG', 2), ('SEK', 2), ('SGD', 2), ('SHP', 2), ('SLL', 2), ('SOL', 9), ('SOS', 2),
  ('SRD', 2), ('SSP', 2), ('STN', 2), ('SVC', 2), ('SYP', 2), ('SZL', 2), ('THB', 2), ('TJS', 2),
  ('TMT', 2), ('TND', 3), ('TON', 9), ('TOP', 2), ('TRY', 2), ('TTD', 2), ('TWD', 2), ('TZS', 2),
  ('UAH', 2), ('UGX', 0), ('USD', 2), ('USDT', 6), ('USN', 2), ('UYI', 0), ('UYU', 2), ('UYW', 4),
  ('UZS', 2), ('VES', 2), ('VND', 0), ('VUV', 0), ('WST', 2), ('XAF', 0), ('XAG', 6), ('XAU', 6),
  ('XBA', 0), ('XBB', 0), ('XBC', 0), ('XBD', 0), ('XCD', 2), ('XDR', 0), ('XOF', 0), ('XPD', 6),
  ('XPF', 0), ('XPT', 6), ('XRP', 6), ('XSU', 0), ('XTS', 0), ('XUA', 0), ('XXX', 0), ('YER', 2),
  ('ZAR', 2), ('ZMW', 2), ('ZWL', 2);

create function pg_temp.minor(value double precision, code text) returns bigint
language sql immutable as $$
  select case when value is null then null
    else round(value::numeric * 10::numeric ^ (select scale from money_scales where money_scales.code = minor.code))::bigint end
$$;

-- The civil day an instant falls on in the user's timezone, as UTC-midnight ms; a UTC midnight is kept.
create function pg_temp.civil(ms bigint, tz text) returns bigint
language sql immutable as $$
  select case when ms is null or ms % 86400000 = 0 then ms
    else (extract(epoch from ((to_timestamp(ms / 1000.0) at time zone coalesce(tz, 'Europe/Moscow'))::date::timestamp at time zone 'UTC')))::bigint * 1000 end
$$;

-- RFC 9562 UUIDv7 carrying `ms` in its first 48 bits.
create function pg_temp.uuid7(ms bigint) returns uuid
language plpgsql volatile as $$
declare
  h text := lpad(to_hex(greatest(ms, 0)), 12, '0');
  r text := replace(gen_random_uuid()::text, '-', '');
begin
  return (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-7' || substr(r, 1, 3) || '-'
    || substr('89ab', 1 + floor(random() * 4)::int, 1) || substr(r, 4, 3) || '-' || substr(r, 7, 12))::uuid;
end
$$;

-- Creation time of a legacy id: a `yymmdd_` id starts with its creation day.
create function pg_temp.id_time(id text, fallback bigint) returns bigint
language sql immutable as $$
  select case when id ~ '^\d{6}_' and to_char(to_date(substr(id, 1, 6), 'YYMMDD'), 'YYMMDD') = substr(id, 1, 6)
    then (extract(epoch from to_date(substr(id, 1, 6), 'YYMMDD')::timestamp at time zone 'UTC'))::bigint * 1000
    else coalesce(fallback, (extract(epoch from now()) * 1000)::bigint) end
$$;

create function pg_temp.now_ms() returns bigint
language sql stable as $$ select (extract(epoch from now()) * 1000)::bigint $$;

create schema data_model_old;
alter table public.trns set schema data_model_old;
alter table public.wallets set schema data_model_old;
alter table public.categories set schema data_model_old;
alter table public.user_settings set schema data_model_old;
alter table public.stat_views set schema data_model_old;
alter table public.loans set schema data_model_old;
alter table public.loan_schedule_rows set schema data_model_old;
alter table public.rates set schema data_model_old;
alter table public.push_subscriptions set schema data_model_old;
alter table public.payment_reminders_sent set schema data_model_old;

set search_path = data_model_old, public, extensions;

-- A user has one settings row, id = user id; a stray second row (another id) loses to it.
delete from user_settings s
where s.id <> s."userId" and exists (select 1 from user_settings c where c.id = c."userId" and c."userId" = s."userId");

-- Preflight: every row must convert by a rule below.
do $$
declare
  missing text;
  n int;
begin
  select string_agg(distinct c, ', ') into missing
  from (
    select currency as c from wallets
    union select "baseCurrency" from user_settings
  ) s
  where c not in (select code from money_scales);
  if missing is not null then
    raise exception 'currencies without a pinned scale: %', missing;
  end if;

  select count(*) into n from trns t
  where (t."walletId" is not null and not exists (select 1 from wallets w where w.id = t."walletId"))
    or (t."expenseWalletId" is not null and not exists (select 1 from wallets w where w.id = t."expenseWalletId"))
    or (t."incomeWalletId" is not null and not exists (select 1 from wallets w where w.id = t."incomeWalletId"))
    or (t."categoryId" is not null and t."categoryId" not in ('transfer', 'adjustment', 'loanInterest', 'loanFine')
      and not exists (select 1 from categories c where c.id = t."categoryId"))
    or (t.type in (0, 1) and (t."walletId" is null or t.amount is null or t."categoryId" is null))
    or (t.type = 2 and (t."expenseWalletId" is null or t."incomeWalletId" is null
      or t."expenseAmount" is null or t."incomeAmount" is null or t."expenseWalletId" = t."incomeWalletId"))
    or t.type not in (0, 1, 2);
  if n > 0 then
    raise exception '% transactions reference a missing wallet or category or have an unknown shape', n;
  end if;

  select count(*) into n from trns t
  join wallets w on w.id = coalesce(t."walletId", t."expenseWalletId")
  left join wallets wi on wi.id = t."incomeWalletId"
  where pg_temp.minor(coalesce(t.amount, t."expenseAmount"), w.currency) <= 0
    or pg_temp.minor(t."incomeAmount", wi.currency) <= 0;
  if n > 0 then
    raise exception '% transactions have an amount that is not positive in minor units', n;
  end if;

  select count(*) into n from categories c
  where c."parentId" is not null and not exists (select 1 from categories p where p.id = c."parentId");
  if n > 0 then
    raise exception '% categories reference a missing parent', n;
  end if;

  select count(*) into n from loans l
  where not exists (select 1 from wallets w where w.id = l."walletId")
    or (l."debitWalletId" is not null and not exists (select 1 from wallets w where w.id = l."debitWalletId"));
  if n > 0 then
    raise exception '% loans reference a missing wallet', n;
  end if;

  select count(*) into n from loan_schedule_rows r where not exists (select 1 from loans l where l.id = r."loanId");
  if n > 0 then
    raise exception '% loan schedule rows reference a missing loan', n;
  end if;
end
$$;

-- Old id -> UUIDv7 built from the row's own time; `at` is that time, reused as `created_at`.
create temp table id_map (table_name text not null, old_id text not null, new_id uuid not null, at bigint not null,
  primary key (table_name, old_id));

insert into id_map (table_name, old_id, new_id, at)
select 'wallets', id, pg_temp.uuid7(at), at
from (select id, pg_temp.id_time(id, "updatedAt") as at from wallets) s;

insert into id_map (table_name, old_id, new_id, at)
select 'categories', id, pg_temp.uuid7(at), at
from (select id, pg_temp.id_time(id, "updatedAt") as at from categories) s;

insert into id_map (table_name, old_id, new_id, at)
select 'trns', id, pg_temp.uuid7(at), at
from (select id, coalesce("enteredAt", date) as at from trns) s;

insert into id_map (table_name, old_id, new_id, at)
select 'stat_views', id, pg_temp.uuid7("createdAt"), "createdAt" from stat_views;

insert into id_map (table_name, old_id, new_id, at)
select 'push_subscriptions', id, pg_temp.uuid7("createdAt"), "createdAt" from push_subscriptions;

create function pg_temp.wallet_id(old text) returns uuid
language sql stable as $$ select new_id from id_map where table_name = 'wallets' and old_id = old $$;

create function pg_temp.category_id(old text) returns uuid
language sql stable as $$ select new_id from id_map where table_name = 'categories' and old_id = old $$;

-- The new name of a reserved category id, null for any other value.
create function pg_temp.reserved_ref(old text) returns text
language sql immutable as $$
  select case old when 'loanInterest' then 'loan_interest' when 'loanFine' then 'loan_fine' end
$$;

-- A category reference: reserved ids renamed, the rest mapped.
create function pg_temp.category_ref(old text) returns text
language sql stable as $$
  select coalesce(pg_temp.reserved_ref(old), (select new_id::text from id_map where table_name = 'categories' and old_id = old))
$$;

-- Wallet and category ids anywhere in a JSON value (strings and object keys) mapped to the new ids, reserved ids renamed.
create function pg_temp.remap_json(j jsonb) returns jsonb
language plpgsql stable as $$
begin
  case jsonb_typeof(j)
    when 'string' then
      return coalesce(to_jsonb(pg_temp.reserved_ref(j #>> '{}')), to_jsonb((select new_id::text from id_map
        where table_name in ('wallets', 'categories') and old_id = j #>> '{}')), j);
    when 'array' then
      return coalesce((select jsonb_agg(pg_temp.remap_json(e) order by i) from jsonb_array_elements(j) with ordinality a(e, i)), '[]'::jsonb);
    when 'object' then
      return coalesce((select jsonb_object_agg(
        coalesce(pg_temp.reserved_ref(key), (select new_id::text from id_map where table_name in ('wallets', 'categories') and old_id = key), key),
        pg_temp.remap_json(value)) from jsonb_each(j)), '{}'::jsonb);
    else
      return j;
  end case;
end
$$;

set search_path = public, extensions;

-- One owner check for every policy; `language sql stable`, not security definer, so the planner inlines it.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.can_access(owner_id uuid) returns boolean
language sql stable as $$ select owner_id = (select auth.uid()) $$;

grant execute on function private.can_access(uuid) to authenticated;

-- wallets
create table public.wallets (
  id uuid primary key,
  user_id uuid not null,
  name text not null,
  color text not null,
  currency_code text not null,
  type text not null,
  sort_order integer not null default 0,
  description text,
  is_archived boolean not null default false,
  is_excluded_from_total boolean not null default false,
  is_withdrawable boolean not null default false,
  is_in_forecast boolean,
  credit_limit bigint,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint wallets_type check (type in ('cash', 'bank_account', 'credit_card', 'loan', 'deposit', 'crypto', 'debt')),
  constraint wallets_credit_limit check (credit_limit is null or (type = 'credit_card' and credit_limit >= 0))
);
comment on column public.wallets.is_in_forecast is 'null follows is_withdrawable';

insert into public.wallets (id, user_id, name, color, currency_code, type, sort_order, description, is_archived,
  is_excluded_from_total, is_withdrawable, is_in_forecast, credit_limit, created_at, updated_at)
select m.new_id, w."userId"::uuid, w.name, w.color, w.currency,
  case w.type when 'cashless' then 'bank_account' when 'credit' then 'credit_card' else w.type end,
  w."order", w."desc", w."isArchived", w."isExcludeInTotal", w."isWithdrawal",
  case when jsonb_array_length(coalesce(fs.settings -> 'walletIds', '[]'::jsonb)) > 0
    then fs.settings -> 'walletIds' ? w.id end,
  case when w.type = 'credit' then pg_temp.minor(w."creditLimit", w.currency) end,
  m.at, coalesce(w."updatedAt", m.at)
from data_model_old.wallets w
join id_map m on m.table_name = 'wallets' and m.old_id = w.id
left join (
  select us."userId", to_jsonb(us) -> 'forecastSettings' as settings
  from data_model_old.user_settings us
  where jsonb_typeof(to_jsonb(us) -> 'forecastSettings' -> 'walletIds') = 'array'
) fs on fs."userId" = w."userId";

-- bank_reports: the latest figures the bank shows for a wallet
create table public.bank_reports (
  id uuid primary key,
  user_id uuid not null,
  balance_amount bigint,
  balance_date bigint,
  statement_date bigint,
  grace_debt_amount bigint,
  grace_end_date bigint,
  min_payment_amount bigint,
  min_payment_due_date bigint,
  min_payment_period_start_date bigint,
  debt_amount bigint,
  debt_report_date bigint,
  next_payment_date bigint,
  next_principal_amount bigint,
  next_interest_amount bigint,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint bank_reports_balance check ((balance_amount is null) = (balance_date is null)),
  constraint bank_reports_amounts check (grace_debt_amount >= 0 and min_payment_amount >= 0 and debt_amount >= 0
    and next_principal_amount >= 0 and next_interest_amount >= 0),
  constraint bank_reports_days check (balance_date % 86400000 = 0 and statement_date % 86400000 = 0
    and grace_end_date % 86400000 = 0 and min_payment_due_date % 86400000 = 0
    and min_payment_period_start_date % 86400000 = 0 and debt_report_date % 86400000 = 0
    and next_payment_date % 86400000 = 0)
);
comment on table public.bank_reports is 'id = the wallet id';

insert into public.bank_reports (id, user_id, statement_date, grace_debt_amount, grace_end_date, min_payment_amount,
  min_payment_due_date, min_payment_period_start_date, debt_amount, debt_report_date, next_payment_date,
  next_principal_amount, next_interest_amount, created_at, updated_at)
select m.new_id, w."userId"::uuid,
  pg_temp.civil(w."statementDate", us.timezone),
  pg_temp.minor(w."graceAmount", w.currency),
  pg_temp.civil(w."graceEndDate", us.timezone),
  pg_temp.minor(w."minPaymentAmount", w.currency),
  pg_temp.civil(w."minPaymentDate", us.timezone),
  case when w."minPaymentAmount" is not null then pg_temp.civil(w."minPaymentUpdatedAt", us.timezone) end,
  pg_temp.minor(l."bankDebtAmount", w.currency),
  case when l."bankDebtAmount" is not null then pg_temp.civil(l."bankDebtUpdatedAt", us.timezone) end,
  pg_temp.civil(l."nextPaymentDate", us.timezone),
  pg_temp.minor(l."nextPaymentPrincipal", w.currency),
  pg_temp.minor(l."nextPaymentInterest", w.currency),
  m.at, coalesce(greatest(w."updatedAt", l."updatedAt"), m.at)
from data_model_old.wallets w
join id_map m on m.table_name = 'wallets' and m.old_id = w.id
left join data_model_old.loans l on l."walletId" = w.id
left join data_model_old.user_settings us on us."userId" = w."userId"
where coalesce(w."statementDate", w."graceAmount", w."graceEndDate", w."minPaymentAmount", w."minPaymentDate",
  l."bankDebtAmount", l."nextPaymentDate", l."nextPaymentPrincipal", l."nextPaymentInterest") is not null;

-- categories
create table public.categories (
  id uuid primary key,
  user_id uuid not null,
  name text not null,
  color text not null,
  icon text not null,
  parent_id uuid,
  is_excluded_from_stats boolean not null default false,
  is_in_recent boolean not null default false,
  is_in_quick_selector boolean not null default false,
  sort_order integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint categories_not_own_parent check (parent_id is distinct from id)
);

insert into public.categories (id, user_id, name, color, icon, parent_id, is_excluded_from_stats, is_in_recent,
  is_in_quick_selector, created_at, updated_at)
select m.new_id, c."userId"::uuid, c.name, c.color, c.icon, pg_temp.category_id(c."parentId"),
  c."isExcludeFromStats", c."showInLastUsed", c."showInQuickSelector", m.at, coalesce(c."updatedAt", m.at)
from data_model_old.categories c
join id_map m on m.table_name = 'categories' and m.old_id = c.id;

-- transactions: every row moves money out of a wallet, into a wallet, or both
create table public.transactions (
  id uuid primary key,
  user_id uuid not null,
  type text not null,
  date bigint not null,
  from_wallet_id uuid,
  from_amount bigint,
  to_wallet_id uuid,
  to_amount bigint,
  category_id text,
  description text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint transactions_type check (type in ('expense', 'income', 'transfer', 'adjustment')),
  constraint transactions_date_is_day check (date % 86400000 = 0),
  constraint transactions_from_side check ((from_wallet_id is null) = (from_amount is null)),
  constraint transactions_to_side check ((to_wallet_id is null) = (to_amount is null)),
  constraint transactions_amounts_positive check (from_amount > 0 and to_amount > 0),
  constraint transactions_flow check (case type
    when 'expense' then from_wallet_id is not null and to_wallet_id is null and category_id is not null
    when 'income' then from_wallet_id is null and to_wallet_id is not null and category_id is not null
    when 'adjustment' then (from_wallet_id is null) <> (to_wallet_id is null) and category_id is null
    when 'transfer' then (from_wallet_id is not null or to_wallet_id is not null)
      and from_wallet_id is distinct from to_wallet_id and category_id is null
  end)
);

insert into public.transactions (id, user_id, type, date, from_wallet_id, from_amount, to_wallet_id, to_amount,
  category_id, description, created_at, updated_at)
select m.new_id, t."userId"::uuid,
  case
    when t.type = 2 or t."categoryId" = 'transfer' then 'transfer'
    when t."categoryId" = 'adjustment' then 'adjustment'
    when t.type = 0 then 'expense'
    else 'income'
  end,
  pg_temp.civil(t.date, us.timezone),
  pg_temp.wallet_id(coalesce(t."expenseWalletId", case when t.type = 0 then t."walletId" end)),
  pg_temp.minor(coalesce(t."expenseAmount", case when t.type = 0 then t.amount end), wf.currency),
  pg_temp.wallet_id(coalesce(t."incomeWalletId", case when t.type = 1 then t."walletId" end)),
  pg_temp.minor(coalesce(t."incomeAmount", case when t.type = 1 then t.amount end), wt.currency),
  case when t.type <> 2 and t."categoryId" not in ('transfer', 'adjustment') then pg_temp.category_ref(t."categoryId") end,
  t."desc", m.at, coalesce(t."updatedAt", m.at)
from data_model_old.trns t
join id_map m on m.table_name = 'trns' and m.old_id = t.id
left join data_model_old.user_settings us on us."userId" = t."userId"
left join data_model_old.wallets wf on wf.id = coalesce(t."expenseWalletId", case when t.type = 0 then t."walletId" end)
left join data_model_old.wallets wt on wt.id = coalesce(t."incomeWalletId", case when t.type = 1 then t."walletId" end);

-- display_overrides: how the built-in categories and transaction types look
create table public.display_overrides (
  id text primary key,
  user_id uuid not null,
  kind text not null,
  target_id text not null,
  name text,
  color text,
  icon text,
  parent_id uuid,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint display_overrides_target check ((kind = 'category' and target_id in ('loan_interest', 'loan_fine'))
    or (kind = 'transaction_type' and target_id in ('transfer', 'adjustment') and parent_id is null)),
  -- The owner is part of the id, so no user can take another user's deterministic id.
  constraint display_overrides_id check (id = user_id::text || ':' || kind || ':' || target_id)
);
comment on table public.display_overrides is 'id = <user_id>:<kind>:<target_id>';

insert into public.display_overrides (id, user_id, kind, target_id, name, color, icon)
select us."userId" || ':' || k.kind || ':' || k.target_id, us."userId"::uuid, k.kind, k.target_id,
  nullif(btrim(o.value ->> 'name'), ''), o.value ->> 'color', nullif(btrim(o.value ->> 'icon'), '')
from data_model_old.user_settings us
cross join lateral jsonb_each(case when jsonb_typeof(to_jsonb(us) -> 'categoryOverrides') = 'object'
  then to_jsonb(us) -> 'categoryOverrides' else '{}'::jsonb end) o
join (values ('loanInterest', 'category', 'loan_interest'), ('loanFine', 'category', 'loan_fine'),
  ('transfer', 'transaction_type', 'transfer'), ('adjustment', 'transaction_type', 'adjustment')) k(old_key, kind, target_id)
  on k.old_key = o.key
where jsonb_typeof(o.value) = 'object';

-- loans: id = the wallet id
create table public.loans (
  id uuid primary key,
  user_id uuid not null,
  principal_amount bigint not null,
  annual_rate_percent double precision,
  start_date bigint not null,
  first_payment_date bigint not null,
  closed_date bigint,
  term_months integer not null,
  payment_day_of_month integer not null,
  schedule_type text not null,
  prepayment_mode text not null,
  interest_accrual text,
  late_after_days integer,
  prepayment_window_days integer,
  payment_wallet_id uuid,
  contract_number text,
  description text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint loans_principal_amount check (principal_amount >= 0),
  constraint loans_annual_rate_percent check (annual_rate_percent >= 0),
  constraint loans_days check (start_date % 86400000 = 0 and first_payment_date % 86400000 = 0
    and closed_date % 86400000 = 0),
  constraint loans_term_months check (term_months > 0),
  constraint loans_payment_day_of_month check (payment_day_of_month between 1 and 31),
  constraint loans_schedule_type check (schedule_type in ('annuity', 'differentiated')),
  constraint loans_prepayment_mode check (prepayment_mode in ('reduce_payment', 'reduce_term')),
  constraint loans_interest_accrual check (interest_accrual in ('monthly', 'daily')),
  constraint loans_late_after_days check (late_after_days >= 0),
  constraint loans_prepayment_window_days check (prepayment_window_days >= 0)
);
comment on table public.loans is 'id = the loan wallet id';
comment on column public.loans.interest_accrual is 'null = monthly';

insert into public.loans (id, user_id, principal_amount, annual_rate_percent, start_date, first_payment_date,
  closed_date, term_months, payment_day_of_month, schedule_type, prepayment_mode, interest_accrual, late_after_days,
  prepayment_window_days, payment_wallet_id, contract_number, description, created_at, updated_at)
select pg_temp.wallet_id(l."walletId"), l."userId"::uuid, pg_temp.minor(l."principalAmount", w.currency),
  l."annualRate", pg_temp.civil(l."startDate", us.timezone), pg_temp.civil(l."firstPaymentDate", us.timezone),
  pg_temp.civil(l."closedDate", us.timezone), l."termMonths", l."paymentDay", l."scheduleType",
  case l."overpaymentMode" when 'reducePayment' then 'reduce_payment' else 'reduce_term' end,
  l."interestMethod", l."lateAfterDays", l."prepayWindowDays", pg_temp.wallet_id(l."debitWalletId"),
  l."contractNumber", l."desc", m.at, l."updatedAt"
from data_model_old.loans l
join data_model_old.wallets w on w.id = l."walletId"
join id_map m on m.table_name = 'wallets' and m.old_id = l."walletId"
left join data_model_old.user_settings us on us."userId" = l."userId";

-- loan_schedule_overrides: only the payments that differ from the generated schedule
create table public.loan_schedule_overrides (
  id text primary key,
  user_id uuid not null,
  loan_id uuid not null,
  payment_number integer not null,
  due_date bigint not null,
  principal_amount bigint not null,
  interest_amount bigint not null,
  total_amount bigint not null,
  source text not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint loan_schedule_overrides_payment_number check (payment_number >= 1),
  constraint loan_schedule_overrides_due_date check (due_date % 86400000 = 0),
  constraint loan_schedule_overrides_amounts check (principal_amount >= 0 and interest_amount >= 0 and total_amount >= 0),
  constraint loan_schedule_overrides_source check (source in ('bank', 'manual')),
  constraint loan_schedule_overrides_id check (id = loan_id::text || ':' || payment_number)
);
comment on table public.loan_schedule_overrides is 'id = <loan_id>:<payment_number>';

insert into public.loan_schedule_overrides (id, user_id, loan_id, payment_number, due_date, principal_amount,
  interest_amount, total_amount, source, created_at, updated_at)
select pg_temp.wallet_id(l."walletId")::text || ':' || r."paymentNumber", r."userId"::uuid,
  pg_temp.wallet_id(l."walletId"), r."paymentNumber", pg_temp.civil(r.date, us.timezone),
  pg_temp.minor(r."principalPart", w.currency), pg_temp.minor(r."interestPart", w.currency),
  pg_temp.minor(r."totalAmount", w.currency), r.source,
  coalesce(r."updatedAt", l."updatedAt"), coalesce(r."updatedAt", l."updatedAt")
from data_model_old.loan_schedule_rows r
join data_model_old.loans l on l.id = r."loanId"
join data_model_old.wallets w on w.id = l."walletId"
left join data_model_old.user_settings us on us."userId" = r."userId";

-- currencies: the user's own currencies and edits of built-in ones
create table public.currencies (
  id text primary key,
  user_id uuid not null,
  code text not null,
  name text,
  symbol text,
  minor_display text,
  scale smallint,
  manual_rate double precision,
  manual_rate_currency_code text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint currencies_code check (code ~ '^[A-Z0-9]{2,10}$'),
  constraint currencies_minor_display check (minor_display in ('auto', 'always', 'never')),
  constraint currencies_scale check (scale between 0 and 9),
  constraint currencies_manual_rate check ((manual_rate is null) = (manual_rate_currency_code is null) and manual_rate > 0),
  constraint currencies_id check (id = user_id::text || ':' || code)
);
comment on table public.currencies is 'id = <user_id>:<code>';
comment on column public.currencies.minor_display is 'null = auto';
comment on column public.currencies.symbol is 'null = the built-in symbol';
comment on column public.currencies.scale is 'custom currencies only; a built-in scale is pinned in utils/money/scale.ts';

-- user_settings: id = user_id
create table public.user_settings (
  id uuid primary key,
  user_id uuid not null,
  base_currency_code text not null default 'USD',
  locale text,
  timezone text,
  is_payment_reminders_enabled boolean not null default true,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint user_settings_id check (id = user_id)
);

insert into public.user_settings (id, user_id, base_currency_code, locale, timezone, is_payment_reminders_enabled)
select "userId"::uuid, "userId"::uuid, "baseCurrency", locale, timezone, "paymentReminders"
from data_model_old.user_settings;

-- forecast_settings: id = user_id
create table public.forecast_settings (
  id uuid primary key,
  user_id uuid not null,
  horizon_months integer not null default 12,
  history_months integer not null default 6,
  regular_min_months integer not null default 5,
  regular_amount_mode text not null default 'median',
  card_payment_mode text not null default 'full_debt',
  is_by_parent_category boolean not null default false,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint forecast_settings_id check (id = user_id),
  constraint forecast_settings_months check (horizon_months between 1 and 60 and history_months between 1 and 24
    and regular_min_months between 1 and 24),
  constraint forecast_settings_regular_amount_mode check (regular_amount_mode in ('median', 'average', 'max', 'last')),
  constraint forecast_settings_card_payment_mode check (card_payment_mode in ('minimum', 'full_debt'))
);

insert into public.forecast_settings (id, user_id, horizon_months, history_months, regular_min_months,
  regular_amount_mode, card_payment_mode, is_by_parent_category)
select "userId"::uuid, "userId"::uuid,
  coalesce(case when (s ->> 'horizonMonths') ~ '^\d+$' and (s ->> 'horizonMonths')::int between 1 and 60 then (s ->> 'horizonMonths')::int end, 12),
  coalesce(case when (s ->> 'windowMonths') ~ '^\d+$' and (s ->> 'windowMonths')::int between 1 and 24 then (s ->> 'windowMonths')::int end, 6),
  coalesce(case when (s ->> 'minMonths') ~ '^\d+$' and (s ->> 'minMonths')::int between 1 and 24 then (s ->> 'minMonths')::int end, 5),
  case when s ->> 'amountMode' in ('median', 'average', 'max', 'last') then s ->> 'amountMode' else 'median' end,
  case s ->> 'cardPayment' when 'full' then 'full_debt' else 'minimum' end,
  coalesce(case when jsonb_typeof(s -> 'groupByParent') = 'boolean' then (s -> 'groupByParent')::boolean end, false)
from (select "userId", to_jsonb(us) -> 'forecastSettings' as s from data_model_old.user_settings us) x
where jsonb_typeof(s) = 'object';

-- forecast_categories: per-category forecast choices
create table public.forecast_categories (
  id text primary key,
  user_id uuid not null,
  category_id text not null,
  is_included boolean,
  monthly_amount bigint,
  currency_code text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint forecast_categories_monthly_amount check ((monthly_amount is null) = (currency_code is null)
    and monthly_amount >= 0),
  constraint forecast_categories_id check (id = user_id::text || ':' || category_id)
);
comment on table public.forecast_categories is 'id = <user_id>:<category_id>';
comment on column public.forecast_categories.is_included is 'null = detected from spending';

insert into public.forecast_categories (id, user_id, category_id, is_included, monthly_amount, currency_code)
select x."userId" || ':' || pg_temp.category_ref(o.key), x."userId"::uuid, pg_temp.category_ref(o.key),
  o.value ->> 'state' = 'include',
  pg_temp.minor((o.value ->> 'amount')::double precision, x."baseCurrency"),
  case when jsonb_typeof(o.value -> 'amount') = 'number' then x."baseCurrency" end
from (select "userId", "baseCurrency", to_jsonb(us) -> 'forecastSettings' as s from data_model_old.user_settings us) x
cross join lateral jsonb_each(case when jsonb_typeof(x.s -> 'overrides') = 'object' then x.s -> 'overrides' else '{}'::jsonb end) o
where pg_temp.category_ref(o.key) is not null and o.value ->> 'state' in ('include', 'exclude');

-- stat_views
create table public.stat_views (
  id uuid primary key,
  user_id uuid not null,
  scope text not null default 'dashboard',
  name text not null,
  config jsonb not null,
  is_active boolean not null default false,
  is_auto_rule_enabled boolean not null default false,
  auto_rule jsonb,
  sort_order integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint stat_views_config_is_object check (jsonb_typeof(config) = 'object'),
  constraint stat_views_auto_rule_is_object check (auto_rule is null or jsonb_typeof(auto_rule) = 'object'),
  constraint stat_views_name_not_blank check (length(btrim(name)) > 0)
);

insert into public.stat_views (id, user_id, scope, name, config, is_active, is_auto_rule_enabled, auto_rule,
  sort_order, created_at, updated_at)
select m.new_id, s."userId"::uuid, s.scope, s.name, pg_temp.remap_json(s.config), s."isActive", s."isAutoEnabled",
  pg_temp.remap_json(s."autoRule"), s."sortOrder", s."createdAt", s."updatedAt"
from data_model_old.stat_views s
join id_map m on m.table_name = 'stat_views' and m.old_id = s.id;

-- exchange_rates: global, id = <YYYY-MM-DD>:<source>
create table public.exchange_rates (
  id text primary key,
  date bigint not null,
  rates jsonb not null,
  source text not null,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint exchange_rates_date check (date % 86400000 = 0),
  constraint exchange_rates_rates_is_object check (jsonb_typeof(rates) = 'object')
);

insert into public.exchange_rates (id, date, rates, source, updated_at)
select distinct on (r.date, coalesce(r.source, 'unknown'))
  r.date || ':' || coalesce(r.source, 'unknown'),
  (extract(epoch from r.date::date::timestamp at time zone 'UTC'))::bigint * 1000,
  r.rates, coalesce(r.source, 'unknown'), r."updatedAt"
from data_model_old.rates r
order by r.date, coalesce(r.source, 'unknown'), r."updatedAt" desc;

-- push_subscriptions (server only)
create table public.push_subscriptions (
  -- Server-only and written by an upsert on endpoint, so the server makes the id.
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  p256dh_key text not null,
  auth_secret text not null,
  user_agent text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

insert into public.push_subscriptions (id, user_id, endpoint, p256dh_key, auth_secret, user_agent, created_at, updated_at)
select m.new_id, p."userId"::uuid, p.endpoint, p.p256dh, p.auth, p."userAgent", p."createdAt", coalesce(p."updatedAt", p."createdAt")
from data_model_old.push_subscriptions p
join id_map m on m.table_name = 'push_subscriptions' and m.old_id = p.id;

-- payment_reminder_deliveries (server only): one push per wallet, kind and due day
create table public.payment_reminder_deliveries (
  user_id uuid not null,
  wallet_id uuid not null,
  kind text not null,
  due_date bigint not null,
  sent_at bigint not null,
  primary key (user_id, wallet_id, kind, due_date)
);

insert into public.payment_reminder_deliveries (user_id, wallet_id, kind, due_date, sent_at)
select p."userId", pg_temp.wallet_id(p."walletId"), p.kind, p."dueDate", p."sentAt"
from data_model_old.payment_reminders_sent p
where pg_temp.wallet_id(p."walletId") is not null;

-- Reference check: no reference may point outside the new id set (reserved ids aside).
do $$
declare
  n int;
begin
  select
    (select count(*) from public.transactions t where (t.from_wallet_id is not null and not exists (select 1 from public.wallets w where w.id = t.from_wallet_id))
      or (t.to_wallet_id is not null and not exists (select 1 from public.wallets w where w.id = t.to_wallet_id))
      or (t.category_id is not null and t.category_id not in ('loan_interest', 'loan_fine')
        and not exists (select 1 from public.categories c where c.id::text = t.category_id)))
    + (select count(*) from public.categories c where c.parent_id is not null and not exists (select 1 from public.categories p where p.id = c.parent_id))
    + (select count(*) from public.loans l where not exists (select 1 from public.wallets w where w.id = l.id)
      or (l.payment_wallet_id is not null and not exists (select 1 from public.wallets w where w.id = l.payment_wallet_id)))
    + (select count(*) from public.bank_reports b where not exists (select 1 from public.wallets w where w.id = b.id))
    + (select count(*) from public.loan_schedule_overrides r where not exists (select 1 from public.loans l where l.id = r.loan_id))
    + (select count(*) from public.forecast_categories f where f.category_id not in ('loan_interest', 'loan_fine')
      and not exists (select 1 from public.categories c where c.id::text = f.category_id))
    + (select count(*) from public.stat_views s, id_map m
      where m.table_name in ('wallets', 'categories') and m.old_id::text <> m.new_id::text
        and (s.config::text like '%"' || m.old_id || '"%' or coalesce(s.auto_rule::text, '') like '%"' || m.old_id || '"%'))
  into n;
  if n > 0 then
    raise exception '% references point outside the converted ids', n;
  end if;
end
$$;

drop schema data_model_old cascade;

-- Access: owner RLS through private.can_access, no anon, select-only for PowerSync.
do $$
declare
  t text;
begin
  foreach t in array array['wallets', 'bank_reports', 'categories', 'transactions', 'display_overrides', 'loans',
    'loan_schedule_overrides', 'currencies', 'user_settings', 'forecast_settings', 'forecast_categories', 'stat_views',
    'push_subscriptions']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('create policy %I on public.%I for all to authenticated using (private.can_access(user_id)) with check (private.can_access(user_id))', t || '_owner', t);
  end loop;
end
$$;

alter table public.exchange_rates enable row level security;
revoke all on public.exchange_rates from anon, authenticated;
grant select on public.exchange_rates to authenticated;
grant all on public.exchange_rates to service_role;
create policy exchange_rates_read on public.exchange_rates for select to authenticated using (true);

alter table public.payment_reminder_deliveries enable row level security;
revoke all on public.payment_reminder_deliveries from anon, authenticated;
grant select on public.payment_reminder_deliveries to authenticated;
grant all on public.payment_reminder_deliveries to service_role;
create policy payment_reminder_deliveries_owner_read on public.payment_reminder_deliveries for select to authenticated
  using (private.can_access(user_id));

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'powersync_role') then
    grant select on all tables in schema public to powersync_role;
  end if;
end
$$;

create index transactions_user_date_idx on public.transactions (user_id, date);
create index wallets_user_idx on public.wallets (user_id);
create index bank_reports_user_idx on public.bank_reports (user_id);
create index categories_user_idx on public.categories (user_id);
create index display_overrides_user_idx on public.display_overrides (user_id);
create index loans_user_idx on public.loans (user_id);
create index loan_schedule_overrides_user_loan_idx on public.loan_schedule_overrides (user_id, loan_id);
create index currencies_user_idx on public.currencies (user_id);
create index user_settings_user_idx on public.user_settings (user_id);
create index forecast_settings_user_idx on public.forecast_settings (user_id);
create index forecast_categories_user_idx on public.forecast_categories (user_id);
create index stat_views_user_scope_order_idx on public.stat_views (user_id, scope, sort_order);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
create unique index push_subscriptions_endpoint_idx on public.push_subscriptions (endpoint);

-- A table is synced only when it is in the publication and in the sync rules.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'powersync') then
    alter publication powersync set table public.wallets, public.bank_reports, public.categories, public.transactions,
      public.display_overrides, public.loans, public.loan_schedule_overrides, public.currencies, public.user_settings,
      public.forecast_settings, public.forecast_categories, public.stat_views, public.exchange_rates;
  else
    create publication powersync for table public.wallets, public.bank_reports, public.categories, public.transactions,
      public.display_overrides, public.loans, public.loan_schedule_overrides, public.currencies, public.user_settings,
      public.forecast_settings, public.forecast_categories, public.stat_views, public.exchange_rates;
  end if;
end
$$;

-- plpgsql bodies are not checked when a table is renamed: a stale one breaks only the next signup.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_settings (id, user_id, base_currency_code)
  values (new.id, new.id, 'USD')
  on conflict (id) do nothing;
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
  end if;
end
$$;

drop table id_map;
drop table money_scales;
reset search_path;
