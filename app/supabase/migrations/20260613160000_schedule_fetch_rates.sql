-- Daily exchange-rate refresh schedule.
--
-- Runs the `fetch-rates` edge function every day at 06:00 UTC. The function
-- pulls Coinbase + OER, merges them into one USD-based map and writes a single
-- `source = 'merged'` row into `rates`.
--
-- Portable: the function URL and anon key are read from Vault secrets rather
-- than hardcoded, so this migration is safe on local / dev / prod. Set them
-- once per project (the anon key is public - it is baked into the SPA build):
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<anon-key>',                'anon_key');
-- Until the secrets exist the scheduled POST is a harmless no-op (null url).
-- cron.schedule upserts by job name, so re-running this is safe.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'fetch-rates-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/fetch-rates',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
