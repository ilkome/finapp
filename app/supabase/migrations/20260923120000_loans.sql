-- Loan contracts and the schedule rows that differ from the generated schedule.
-- No foreign keys: entity ids are client-generated and PowerSync upload order is not guaranteed.

create table public.loans (
  id text primary key,
  "userId" text not null,
  "walletId" text not null,
  "principalAmount" double precision not null,
  -- null: the bank publishes no contract rate (0 stays a real interest-free loan).
  "annualRate" double precision,
  "startDate" bigint not null,
  "firstPaymentDate" bigint not null,
  "termMonths" integer not null,
  "paymentDay" integer not null,
  "scheduleType" text not null,
  "overpaymentMode" text not null,
  "debitWalletId" text,
  -- Reconciliation settings; null falls back to the defaults (monthly accrual, 3 days, 15 days),
  -- so bank sync never has to write them.
  "interestMethod" text,
  "lateAfterDays" integer,
  "prepayWindowDays" integer,
  "contractNumber" text,
  "desc" text,
  -- The bank's own figures, pushed by bank sync: the debt to reconcile the wallet against and the
  -- bank's split of the next payment.
  "bankDebtAmount" double precision,
  "bankDebtUpdatedAt" bigint,
  "nextPaymentDate" bigint,
  "nextPaymentPrincipal" double precision,
  "nextPaymentInterest" double precision,
  "updatedAt" bigint not null,
  -- id is deterministic (loan:<walletId>), so a concurrent create for the same
  -- wallet on two offline devices lands on the same row instead of conflicting.
  constraint loans_wallet_unique unique ("userId", "walletId"),
  constraint loans_payment_day_range check ("paymentDay" between 1 and 31),
  constraint loans_term_months_positive check ("termMonths" > 0),
  constraint loans_schedule_type check ("scheduleType" in ('annuity', 'differentiated')),
  constraint loans_overpayment_mode check ("overpaymentMode" in ('reducePayment', 'reduceTerm')),
  constraint loans_interest_method check ("interestMethod" is null or "interestMethod" in ('monthly', 'daily')),
  constraint loans_late_after_days_range check ("lateAfterDays" is null or "lateAfterDays" >= 0),
  constraint loans_prepay_window_days_range check ("prepayWindowDays" is null or "prepayWindowDays" >= 0)
);

alter table public.loans enable row level security;
create policy "loans_owner" on public.loans for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");
alter publication powersync add table public.loans;

-- Only imported or hand-edited rows live here; a generated row is represented by its absence.
create table public.loan_schedule_rows (
  id text primary key,
  "userId" text not null,
  "loanId" text not null,
  "paymentNumber" integer not null,
  "date" bigint not null,
  "totalAmount" double precision not null,
  "principalPart" double precision not null,
  "interestPart" double precision not null,
  source text not null,
  "updatedAt" bigint,
  -- id is deterministic (lsr:<loanId>:<paymentNumber>), so a concurrent edit of the
  -- same schedule row on two offline devices lands on the same row instead of conflicting.
  constraint loan_schedule_rows_number_unique unique ("loanId", "paymentNumber"),
  -- Schedule rows are 1-based: the generator never emits a payment 0.
  constraint loan_schedule_rows_number_positive check ("paymentNumber" >= 1),
  constraint loan_schedule_rows_source check (source in ('bank', 'manual'))
);

create index loan_schedule_rows_user_loan_idx on public.loan_schedule_rows ("userId", "loanId");
alter table public.loan_schedule_rows enable row level security;
create policy "loan_schedule_rows_owner" on public.loan_schedule_rows for all to authenticated
  using ((select auth.uid())::text = "userId")
  with check ((select auth.uid())::text = "userId");
alter publication powersync add table public.loan_schedule_rows;

-- Minimum payment summary pushed by bank sync for revolving credit wallets.
alter table public.wallets add column if not exists "minPaymentAmount" double precision;
alter table public.wallets add column if not exists "minPaymentDate" bigint;
alter table public.wallets add column if not exists "minPaymentUpdatedAt" bigint;
