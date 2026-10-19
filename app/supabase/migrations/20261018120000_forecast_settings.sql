-- Wallets forecast assumptions (detection window, card payment mode, forecast wallets) and the
-- per-category regular-spending overrides; the client parses it with defaults on every load.
alter table public.user_settings
  add column if not exists "forecastSettings" jsonb,
  add constraint user_settings_forecast_settings_is_object
    check ("forecastSettings" is null or jsonb_typeof("forecastSettings") = 'object');
