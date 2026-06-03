-- Lock down the Supabase Data API (PostgREST + pg_graphql) surface.
--
-- This app does NOT read through the Data API: reads happen via PowerSync
-- (the `powersync_role` over logical replication, which bypasses RLS). The
-- supabase-js client only (a) authenticates and (b) writes via the PowerSync
-- upload connector as the `authenticated` role (guarded by RLS).
--
-- So:
-- * `anon` needs no access to any data table -> revoke everything (clears lint 0026).
-- * `rates` is read-only via PowerSync; the Data API never touches it -> revoke from
--   authenticated too (clears 0026/0027 for rates).
-- * `authenticated` needs full CRUD on the user-owned tables for the upload path.
--   Note: Postgres requires SELECT for `UPDATE/DELETE ... WHERE id = ?` (the WHERE
--   reads the column), and the connector targets rows by id - so SELECT cannot be
--   revoked without breaking writes. These 4 tables therefore remain visible in the
--   GraphQL schema to signed-in users (advisor lint 0027), which is acceptable here:
--   RLS (`*_owner` policies on auth.uid()) blocks reading any other user's rows, so
--   0027 only reflects schema *discoverability*, not data access. Fully removing it
--   would require routing writes through a SECURITY DEFINER RPC instead of direct
--   table access.

revoke all on public.categories     from anon;
revoke all on public.wallets         from anon;
revoke all on public.trns            from anon;
revoke all on public.user_settings   from anon;
revoke all on public.rates           from anon, authenticated;

-- The PowerSync upload path writes these as the signed-in user (RLS enforces ownership).
grant select, insert, update, delete on public.categories   to authenticated;
grant select, insert, update, delete on public.wallets       to authenticated;
grant select, insert, update, delete on public.trns          to authenticated;
grant select, insert, update, delete on public.user_settings to authenticated;

-- handle_new_user() is a SECURITY DEFINER *trigger* function. Triggers fire with
-- the definer's rights regardless of role EXECUTE grants, so revoking EXECUTE keeps
-- the signup trigger working while removing the /rest/v1/rpc/handle_new_user endpoint
-- (clears lints 0028/0029).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Disable GraphQL. This app never uses the GraphQL API (reads go through PowerSync,
-- writes through PostgREST/REST). The 0027 lint fires only when pg_graphql is
-- installed AND a role can SELECT the table - and SELECT can't be revoked from
-- `authenticated` because `UPDATE/DELETE ... WHERE id = ?` (the upload path) needs it.
-- Removing the unused GraphQL extension clears 0027 without touching grants or writes.
-- (On hosted Supabase you can't drop a managed extension - disable the GraphQL Data
--  API in project settings instead.)
drop extension if exists pg_graphql cascade;
