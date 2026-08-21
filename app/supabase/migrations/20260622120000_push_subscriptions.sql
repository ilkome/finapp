-- Web Push subscriptions. Server-side only: deliberately NOT in the `powersync`
-- publication - these rows never sync to client SQLite. Written by the client
-- via supabase-js (RLS), read by the send-push function via the service role.

create table public.push_subscriptions (
  id           text primary key default gen_random_uuid()::text,
  "userId"     text not null,
  endpoint     text not null,
  p256dh       text not null,
  auth         text not null,
  "userAgent"  text,
  "createdAt"  bigint not null,
  "updatedAt"  bigint
);

-- Unique endpoint lets the client upsert on re-subscribe.
create unique index push_subscriptions_endpoint_idx on public.push_subscriptions (endpoint);
create index push_subscriptions_user_idx on public.push_subscriptions ("userId");

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_owner" on public.push_subscriptions for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");

revoke all on public.push_subscriptions from anon;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
