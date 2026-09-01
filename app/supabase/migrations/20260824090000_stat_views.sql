create table public.stat_views (
  id text primary key,
  "userId" text not null,
  scope text not null default 'dashboard',
  name text not null,
  config jsonb not null,
  "isActive" boolean not null default false,
  "isAutoEnabled" boolean not null default false,
  "autoRule" jsonb,
  "sortOrder" integer not null default 0,
  "createdAt" bigint not null,
  "updatedAt" bigint not null,
  constraint stat_views_name_not_blank check (length(btrim(name)) > 0),
  constraint stat_views_config_is_object check (jsonb_typeof(config) = 'object'),
  constraint stat_views_auto_rule_is_object check ("autoRule" is null or jsonb_typeof("autoRule") = 'object')
);

create index stat_views_user_scope_order_idx on public.stat_views ("userId", scope, "sortOrder");
alter table public.stat_views enable row level security;
create policy "stat_views_owner" on public.stat_views for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");
alter publication powersync add table public.stat_views;
