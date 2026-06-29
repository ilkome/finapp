-- Civil-date migration (roadmap P0). See plans/civil-date-migration.md.
--
-- trns.date becomes a civil DAY (a calendar date with no time-of-day), encoded as the
-- UTC-midnight ms-epoch and operated on in UTC. enteredAt keeps the original instant
-- (audit/ordering only). user_settings.timezone is the tz used by this one-shot backfill.
--
-- trns and user_settings are already in the `powersync` publication and sync via SELECT *,
-- so the new columns replicate without publication/sync-rule changes.

alter table public.user_settings add column if not exists timezone text;
alter table public.trns add column if not exists "enteredAt" bigint;

-- Keep the original instant before rewriting date (first run only).
update public.trns set "enteredAt" = date where "enteredAt" is null;

-- date := UTC-midnight of the civil day the original instant falls on in the owning user's
-- timezone (fallback to the deploy tz for rows whose user has none captured yet). Idempotent
-- for non-negative offsets: re-running maps a UTC-midnight back to the same day.
update public.trns t
set date = (extract(epoch from
              ((to_timestamp(t.date / 1000.0) at time zone coalesce(us.timezone, 'Europe/Moscow'))::date::timestamp at time zone 'UTC')
            )::bigint) * 1000
from public.user_settings us
where us."userId" = t."userId";
