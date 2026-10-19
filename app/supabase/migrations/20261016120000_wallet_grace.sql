-- Credit-card grace (interest-free) period summary the bank reports, the reminder opt-out,
-- and the ledger of reminders already sent. Civil days are ms at UTC midnight, like "minPaymentDate".
alter table public.wallets add column if not exists "graceAmount" double precision;
alter table public.wallets add column if not exists "graceEndDate" bigint;
alter table public.wallets add column if not exists "statementDate" bigint;

alter table public.user_settings add column if not exists "paymentReminders" boolean not null default true;

-- Written only by a service-role edge function; not synced through PowerSync.
-- No foreign keys: entity ids are client-generated text.
create table if not exists public.payment_reminders_sent (
  "userId" uuid not null,
  "walletId" text not null,
  kind text not null,
  "dueDate" bigint not null,
  "sentAt" bigint not null,
  primary key ("userId", "walletId", kind, "dueDate")
);

alter table public.payment_reminders_sent enable row level security;
revoke all on public.payment_reminders_sent from anon, authenticated;
grant select on public.payment_reminders_sent to authenticated;
drop policy if exists "payment_reminders_sent_owner_read" on public.payment_reminders_sent;
create policy "payment_reminders_sent_owner_read" on public.payment_reminders_sent for select to authenticated
  using ((select auth.uid()) = "userId");
