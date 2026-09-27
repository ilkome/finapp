-- Per-user edits of the reserved categories (transfer, adjustment, loanInterest, loanFine).
-- Those categories are synthetic on the client and categories.id is a global PK, so each
-- user's name/color/icon/parent edits live here keyed by the reserved id.
alter table public.user_settings
  add column "categoryOverrides" jsonb,
  add constraint user_settings_category_overrides_is_object
    check ("categoryOverrides" is null or jsonb_typeof("categoryOverrides") = 'object');
