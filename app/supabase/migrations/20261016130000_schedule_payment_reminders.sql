-- Hourly schedule for the `payment-reminders` edge function.
--
-- The function itself decides per user whether it is 10:00 in their timezone, so the job only has
-- to tick every hour. It reads every user's data, so it accepts the service role key only; the key
-- comes from a Vault secret next to the ones fetch-rates uses (project_url):
--   select vault.create_secret('<service-role-key>', 'service_role_key');
-- Until the secrets exist the scheduled POST is a harmless no-op (null url). cron.schedule upserts
-- by job name, so re-running this is safe.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'payment-reminders-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/payment-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
