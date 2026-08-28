alter table public.user_settings
  add column if not exists "statViewsInitialized" boolean not null default false;
