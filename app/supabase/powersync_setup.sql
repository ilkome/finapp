-- PowerSync replication setup for the local Supabase Postgres.
--
-- Run after `supabase start` (and after the schema migration has applied):
--   docker exec -i supabase_db_app psql -U postgres -d postgres < supabase/powersync_setup.sql
--
-- The PowerSync service connects with this role to stream logical replication.
-- It has BYPASSRLS so it can read every user's rows; per-user partitioning is
-- enforced by PowerSync sync rules, not RLS.
--
-- LOCAL-DEV ONLY: the password below is for a localhost stack. Use a real secret in production.

-- Replication role used by the PowerSync service.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'powersync_role') then
    create role powersync_role with replication bypassrls login password 'powersync_password';
  end if;
end
$$;

grant usage on schema public to powersync_role;
grant select on all tables in schema public to powersync_role;
alter default privileges in schema public grant select on tables to powersync_role;

-- Publication consumed by PowerSync. Scoped to the finapp tables only.
drop publication if exists powersync;
create publication powersync for table
  public.categories,
  public.wallets,
  public.trns,
  public.user_settings,
  public.rates;
