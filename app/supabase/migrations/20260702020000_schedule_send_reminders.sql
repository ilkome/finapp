-- Daily due-reminder delivery schedule.
--
-- Runs the `send-reminders` edge function every day at 07:00 UTC. The function reads due rows from
-- `push_reminders` (fireDate <= today, not yet sent) across all users and delivers them as Web Push.
--
-- Cross-user delivery needs the service role, so the Authorization bearer is the service_role key
-- read from a Vault secret (unlike fetch-rates, which is fine with the public anon key). Set once
-- per project (also needs `project_url`, already set for fetch-rates):
--   select vault.create_secret('<service-role-key>', 'service_role_key');
-- Until the secret exists the POST is a harmless no-op (null bearer -> 401, ignored).
-- cron.schedule upserts by job name, so re-running this is safe.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-reminders-daily',
  '0 7 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
