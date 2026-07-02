-- Dated price-change history for recurrences (request 4). JSON array of
-- { from: civilDay(UTC-midnight ms-epoch), amount }, ascending by `from`. The scalar
-- `amount` column mirrors the currently-effective entry. Same pattern as "skipDates".
alter table public.recurrences
  add column if not exists "amountHistory" text not null default '[]';
