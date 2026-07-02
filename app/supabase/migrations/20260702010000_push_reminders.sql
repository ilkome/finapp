-- Precomputed recurrence reminder queue. Server-side only: deliberately NOT in the `powersync`
-- publication - these rows never sync to client SQLite. The client (which owns the occurrence
-- engine) upserts upcoming reminders via supabase-js; the `send-reminders` edge function (pg_cron,
-- service role) reads due rows across all users and delivers them as Web Push.
--
-- id is the dedupe key `${recurrenceId}:${YYYY-MM-DD}:${offset}` so re-computing is idempotent.
create table if not exists public.push_reminders (
  id          text primary key,
  "userId"    text not null,
  "fireDate"  bigint not null,   -- civil day to notify (occurrence day minus offset), UTC-midnight ms
  title       text not null,
  body        text not null,
  "sentAt"    bigint,            -- null until delivered
  "updatedAt" bigint not null
);

create index if not exists push_reminders_fire_idx on public.push_reminders ("fireDate") where "sentAt" is null;
create index if not exists push_reminders_user_idx on public.push_reminders ("userId");

alter table public.push_reminders enable row level security;

-- Owner can manage only their own rows; the cron function uses the service role (bypasses RLS).
create policy "push_reminders_owner" on public.push_reminders for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");
